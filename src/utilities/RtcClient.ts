import { getDatabase } from './firebase'
import WebRtc from './WebRtc'

export type Member = {
  name: string
  sender: string
  webRtc: WebRtc | null
}
type Members = {
  [key: string]: Member
}
interface RtcClientType {
  _setRtcClient: (rtcClient: RtcClient) => void
  roomName: string
  localPeerName: string
  mediaStream: MediaStream | null
  members: Members
}

export default class RtcClient implements RtcClientType {
  _setRtcClient: (rtcClient: RtcClient) => void
  localPeerName: string
  mediaStream: MediaStream | null
  members: Members
  roomName: string

  constructor(setRtcClient: (rtcClient: RtcClient) => void) {
    this._setRtcClient = setRtcClient
    this.roomName = ''
    this.localPeerName = ''
    this.mediaStream = null
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
    this.localPeerName = localPeerName
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
    console.log('disconnect', this.localPeerName)
    await this.databaseMembersRef(this.localPeerName).remove()
    this.roomName = ''
    this.setRtcClient()
  }

  // 自分がルームに入ったら全メンバーにjoinを送信する
  async join(roomName: string) {
    console.log('join', roomName)
    try {
      this.roomName = roomName
      this.setRtcClient()

      // joinを初期化する
      await this.databaseJoinRef().remove()

      // シグナリングサーバーをリスンする
      await this.startListening()

      // joinを送信する
      console.log('send join', this.roomName, this.localPeerName)
      await this.databaseJoinRef(this.localPeerName).set({
        type: 'join',
        name: this.localPeerName,
        sender: this.localPeerName,
      })
    } catch (error) {
      console.error(error)
    }
  }

  // joinを受信した時やofferを受信したらメンバーを追加する
  async addMember(data: Member) {
    console.log('addMember', data)
    if (this.mediaStream) {
      data.webRtc = new WebRtc(
        this.mediaStream,
        this.roomName,
        this.localPeerName,
        data.sender
      )
      await data.webRtc.startListening();
    } else {
      console.error('no mediaStream')
    }
    const newMember = {
      [data.sender]: data,
    }
    this.members = { ...this.members, ...newMember }
    this.setRtcClient()
  }

  removeMember(data: Member) {
    console.log('removeMember', data.name)
    if (this.members[data.name]) {
      this.members[data.name].webRtc?.disconnect()
    }
    delete this.members[data.name]
    this.setRtcClient()
  }

  // シグナリングサーバーをリスンする処理
  async startListening() {
    console.log('startListening', this.localPeerName)

    // Joinに関するリスナー
    this.databaseJoinRef().on('child_added', async (snapshot) => {
      const data = snapshot.val()
      if (data === null) return
      const { sender } = data
      if (sender === this.localPeerName) {
        // 自分自身は無視する
        return
      }
      console.log('receive join', data)
      await this.addMember(data)
      const send_data = {
        ...data,
        type: 'hello',
        name: this.localPeerName,
        sender: this.localPeerName,
      }
      console.log('send hello', sender,send_data)
      await this.databaseJoinRef(sender).set(send_data)
    })
    await this.databaseJoinRef(this.localPeerName).onDisconnect().remove()

    this.databaseJoinRef(this.localPeerName).on('value', async (snapshot) => {
      const data = snapshot.val()
      if (data === null) return
      const { type, sender } = data
      switch (type) {
        case 'hello':
          console.log('receive hello', data)
          await this.addMember(data)
          await this.members[sender].webRtc?.offer(data)
          break
        default:
          break
      }
    })

    // Firebaseから削除されたらMembersから削除
    this.databaseMembersRef().on('child_removed', async (snapshot) => {
      const data = snapshot.val()
      console.log('receive remove', data)
      if (data === null) return
      const { name } = data
      if (name === this.localPeerName) {
        // ignore self message (自分自身からのメッセージは無視する）
        return
      }
      this.removeMember(data)
    })

    // ブロードキャスト通信に関するリスナー
    this.databaseBroadcastRef.on('value', function (snapshot) {
      const data = snapshot.val()
      if (data === null) return
      console.log('databaseBroadcastRef', data)
    })

    // ダイレクト通信に関するリスナー
    const databaseDirectRef = this.databaseDirectRef(this.localPeerName)
    databaseDirectRef.on('value', function (snapshot) {
      const data = snapshot.val()
      if (data === null) return
      console.log('databaseDirectRef', data)
    })
  }

  async sendAll() {
    await this.databaseBroadcastRef.set({
      type: 'call me',
      sender: this.localPeerName,
      message: 'I am ' + this.localPeerName,
    })
  }
  async sendTarget(remotePeerName: string) {
    await this.databaseDirectRef(remotePeerName).set({
      type: 'call me',
      sender: this.localPeerName,
      message: 'I am ' + this.localPeerName,
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
