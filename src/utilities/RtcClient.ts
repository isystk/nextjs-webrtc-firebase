import { getDatabase } from './firebase'
import WebRtc from './WebRtc'

export type self = {
  clientId?: string
  name: string
}
export type Member = {
  clientId: string
  name: string
  webRtc: WebRtc | null
}
type Members = {
  [key: string]: Member
}
interface RtcClientType {
  _setRtcClient: (rtcClient: RtcClient) => void
  roomName: string
  mediaStream: MediaStream | null
  self: self
  members: Members
}

export default class RtcClient implements RtcClientType {
  _setRtcClient: (rtcClient: RtcClient) => void
  mediaStream: MediaStream | null
  self: self
  members: Members
  roomName: string

  constructor(setRtcClient: (rtcClient: RtcClient) => void) {
    this._setRtcClient = setRtcClient
    this.roomName = ''
    this.mediaStream = null
    this.self = {clientId: undefined, name: ''}
    this.members = {}
  }

  setRtcClient() {
    this._setRtcClient(this)
  }

  // ブラウザからオーディオやビデオの使用許可を取得する
  async getUserMedia() {
    try {
      const constraints = { audio: true, video: true }
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
    } catch (error) {
      console.error(error)
    }
  }

  // メディア(音声とビデオ)の仕様を許可する
  async setMediaStream() {
    await this.getUserMedia()
    this.setRtcClient()
  }

  setLocalPeerName(localPeerName: string) {
    this.self.name = localPeerName
    this.setRtcClient()
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
    this.roomName = ''
    this.setRtcClient()
  }

  // 自分がルームに入ったら全メンバーにjoinを送信する
  async join(roomName: string) {
    try {
      this.roomName = roomName
      this.setRtcClient()

      // joinを初期化する
      await this.databaseJoinRef().remove()

      // メンバーに自分を追加する
      const key = await this.databaseMembersRef().push({
        name: this.self.name,
      }).key
      this.self = {
        clientId: key+'',
        name: this.self.name,
      }
      await this.databaseMembersRef(this.self.clientId).update(this.self)

      // シグナリングサーバーをリスンする
      await this.startListening()

      // joinを送信する
      console.log('send join', this.roomName, this.self)
      await this.databaseJoinRef(this.self.clientId).set({
        ...this.self,
        type: 'join',
        clientId: this.self.clientId
      })

      this.setRtcClient()
    } catch (error) {
      console.error(error)
    }
  }

  // joinを受信した時やofferを受信したらメンバーを追加する
  async addMember(data: Member) {
    console.log('addMember', data)
    if (this.mediaStream && this.self.clientId) {
      data.webRtc = new WebRtc(
        this.mediaStream,
        this.roomName,
        this.self.clientId,
        data.clientId
      )
      await data.webRtc.startListening();
    } else {
      console.error('no mediaStream')
    }
    const newMember = {
      [data.clientId]: data,
    }
    this.members = { ...this.members, ...newMember }
    this.setRtcClient()
  }

  removeMember(data: Member) {
    console.log('removeMember', data)
    if (this.members[data.clientId]) {
      this.members[data.clientId].webRtc?.disconnect()
    }
    delete this.members[data.clientId]
    this.setRtcClient()
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
      console.log('receive join', data)
      await this.addMember(data)

      await this.databaseJoinRef(clientId).set({
        type: 'hello',
        clientId: this.self.clientId,
        name: this.self.name
      })
    })
    await this.databaseJoinRef(this.self.clientId).onDisconnect().remove()

    this.databaseJoinRef(this.self.clientId).on('value', async (snapshot) => {
      const data = snapshot.val()
      if (data === null) return
      const { type, clientId } = data
      switch (type) {
        case 'hello':
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
      this.removeMember(data)
    })
    // 自分の通信が切断されたらFirebaseから自分を削除
    await this.databaseMembersRef(this.self.clientId).onDisconnect().remove()

    // ブロードキャスト通信に関するリスナー
    this.databaseBroadcastRef.on('value',  (snapshot) => {
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
    databaseDirectRef.on('value',  (snapshot) => {
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
    return getDatabase(this.roomName + '/_join_/' + path)
  }

  databaseMembersRef(path = '') {
    return getDatabase(this.roomName + '/_members_/' + path)
  }

  get databaseBroadcastRef() {
    return getDatabase(this.roomName + '/_broadcast_/')
  }

  databaseDirectRef(path = '') {
    return getDatabase(this.roomName + '/_direct_/' + path)
  }
}
