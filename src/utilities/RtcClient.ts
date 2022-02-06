import { getDatabase } from '@/utilities/firebase'
import WebRtc from '@/utilities/WebRtc'

export type Self = {
  clientId?: string
  name: string
}
export type Room = {
  roomId?: string
  name: string
}
export type Member = {
  clientId: string
  name: string
  webRtc: WebRtc | null
  status: string
}
type Members = {
  [key: string]: Member
}
interface RtcClientType {
  _setRtcClient: (rtcClient: RtcClient) => void
  room: Room
  mediaStream: MediaStream | null
  self: Self
  members: Members
}

export default class RtcClient implements RtcClientType {
  _setRtcClient: (rtcClient: RtcClient) => void
  mediaStream: MediaStream | null
  self: Self
  members: Members
  room: Room
  constraints: { audio: boolean, video: boolean }

  constructor(setRtcClient: (rtcClient: RtcClient) => void) {
    console.log('Initial RtcClient')
    this._setRtcClient = setRtcClient
    this.room = { roomId: undefined, name: '' }
    this.mediaStream = null
    this.self = { clientId: undefined, name: '' }
    this.members = {}
    this.constraints = { audio: false, video: true }
  }

  async setRtcClient() {
    await this._setRtcClient(this)
  }

  // カメラの使用許可を取得する
  async getUserMedia() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia(this.constraints)
    } catch (error) {
      console.error(error)
    }
  }

  // 画面共有の使用許可を取得する
  async getDisplayMedia() {
    try {
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia(this.constraints)
      console.log(this.mediaStream)
    } catch (error) {
      console.error(error)
    }
  }

  // メディア(音声とビデオ)の仕様を許可する
  async setMediaStream() {
    await this.getUserMedia()
    // await this.getDisplayMedia()
    await this.setRtcClient()
  }

  async setLocalPeerName(localPeerName: string) {
    this.self.name = localPeerName
    await this.setRtcClient()
  }

  async setRoomName(roomName: string) {
    const key = getDatabase().push({
      name: roomName,
    }).key
    this.room = {
      roomId: key + '',
      name: roomName,
    }
    // TODO ここにawaitを付けると何故か動作しない
    getDatabase(this.room.roomId).update(this.room)
    await this.setRtcClient()
  }

  async setRoomId(roomId: string) {
    await getDatabase(roomId).once('value', async (snapshot) => {
      const data = snapshot.val()
      if (data === null) return
      const { roomId, name } = data
      this.room = {
        roomId,
        name,
      }
      await this.setRtcClient()
    })
  }

  get initialAudioMuted() {
    return !WebRtc.INITIAL_AUDIO_ENABLED
  }

  // 音声のオン・オフを切り替える
  toggleAudio() {
    if (Object.keys(this.members).length === 0) return
    Object.keys(this.members).forEach((key) => {
      this.members[key].webRtc?.toggleAudio()
    })
  }

  async disconnect() {
    console.log('disconnect', this.self)
    await this.databaseMembersRef(this.self.clientId).remove()
    this.room = { roomId: undefined, name: '' }
    await this.setRtcClient()
  }

  // ルームに参加する
  async join() {
    try {
      // joinを初期化する
      await this.databaseJoinRef().remove()

      // メンバーに自分を追加する
      const key = await this.databaseMembersRef().push({
        name: this.self.name,
      }).key
      this.self = {
        clientId: key + '',
        name: this.self.name,
      }
      await this.databaseMembersRef(this.self.clientId).update(this.self)

      // シグナリングサーバーをリスンする
      await this.startListening()

      // 1. Aさんがルームに入ったらブロードキャストですべてのメンバーにjoinを送信する
      console.log('send join', this.room.roomId, this.self)
      await this.databaseJoinRef(this.self.clientId).set({
        ...this.self,
        type: 'join',
        clientId: this.self.clientId,
      })

      await this.setRtcClient()
    } catch (error) {
      console.error(error)
    }
  }

  // joinを受信した時やofferを受信したらメンバーを追加する
  async addMember(data: Member) {
    console.log('addMember', data)
    if (this.mediaStream && this.self.clientId && this.room.roomId) {
      data.webRtc = new WebRtc(
        this.mediaStream,
        this.room.roomId,
        this.self.clientId,
        data.clientId,
        this.constraints
      )
      data.status = 'online'
      await data.webRtc.startListening()
    } else {
      console.error('no mediaStream')
    }
    const newMember = {
      [data.clientId]: data,
    }
    this.members = { ...this.members, ...newMember }
    await this.setRtcClient()
  }

  async removeMember(data: Member) {
    console.log('removeMember', this.members[data.clientId])
    if (this.members[data.clientId]) {
      this.members[data.clientId].webRtc?.disconnect()
      // delete this.members[data.clientId]
      this.members[data.clientId].status = 'offline'
    }
    await this.setRtcClient()
  }

  // シグナリングサーバーをリスンする処理
  async startListening() {
    console.log('startListening', this.self)

    // Joinに関するリスナー
    this.databaseJoinRef().on('child_added', async (snapshot) => {
      const data = snapshot.val()
      if (data === null) return
      const { clientId } = data
      if (clientId === this.self.clientId) {
        // 自分自身は無視する
        return
      }
      // 2-1. joinを受信して新メンバーの情報をローカルに登録する
      console.log('receive join', data)
      await this.addMember(data)
      // 2-2. helloを送信する
      await this.databaseJoinRef(clientId).set({
        type: 'hello',
        clientId: this.self.clientId,
        name: this.self.name,
      })
    })
    await this.databaseJoinRef(this.self.clientId).onDisconnect().remove()

    this.databaseJoinRef(this.self.clientId).on('value', async (snapshot) => {
      const data = snapshot.val()
      if (data === null) return
      const { type, clientId } = data
      switch (type) {
        case 'hello':
          // 3-1. helloを受信して既存メンバーの情報をローカルに登録する
          console.log('receive hello', data)
          await this.addMember(data)
          await this.members[clientId].webRtc?.offer()
          break
        default:
          break
      }
    })

    // Firebaseからメンバーが削除されたらローカルのMembersから削除
    this.databaseMembersRef().on('child_removed', async (snapshot) => {
      const data = snapshot.val()
      console.log('receive remove', data)
      if (data === null) return
      const { clientId } = data
      if (clientId === this.self.clientId) {
        // ignore self message (自分自身からのメッセージは無視する）
        return
      }
      await this.removeMember(data)
    })
    // 自分の通信が切断されたらFirebaseから自分を削除
    await this.databaseMembersRef(this.self.clientId).onDisconnect().remove()

    // ブロードキャスト通信に関するリスナー
    this.databaseBroadcastRef.on('value', (snapshot) => {
      const data = snapshot.val()
      if (data === null) return
      const { clientId } = data
      if (clientId === this.self.clientId) {
        // ignore self message (自分自身からのメッセージは無視する）
        return
      }
      console.log('databaseBroadcastRef', data)
    })

    // ダイレクト通信に関するリスナー
    const databaseDirectRef = this.databaseDirectRef(this.self.clientId)
    databaseDirectRef.on('value', (snapshot) => {
      const data = snapshot.val()
      if (data === null) return
      console.log('databaseDirectRef', data)
    })
  }

  async sendAll() {
    await this.databaseBroadcastRef.set({
      type: 'call me',
      clientId: this.self.clientId,
      message: 'I am ' + this.self.name,
    })
  }
  async sendTarget(remotePeerName: string) {
    await this.databaseDirectRef(remotePeerName).set({
      type: 'call me',
      clientId: this.self.clientId,
      message: 'I am ' + this.self.name,
    })
  }

  databaseJoinRef(path = '') {
    return getDatabase(this.room.roomId + '/_join_/' + path)
  }

  databaseMembersRef(path = '') {
    return getDatabase(this.room.roomId + '/_members_/' + path)
  }

  get databaseBroadcastRef() {
    return getDatabase(this.room.roomId + '/_broadcast_/')
  }

  databaseDirectRef(path = '') {
    return getDatabase(this.room.roomId + '/_direct_/' + path)
  }
}
