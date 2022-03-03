import {getDatabase, getAuth, getMessaging, getMessagingToken} from '@/utilities/firebase'
import DisplayShare from '@/utilities/DisplayShare'
import { WebRtc, API } from '@/utilities'
import { API_ENDPOINT } from '@/common/constants/api'

export type Self = {
  clientId?: string
  name: string
  videoOff?: boolean
  muted?: boolean
  fcmToken?: string
}
export type Room = {
  roomId?: string
  name: string
}
export type Member = {
  clientId: string
  fcmToken: string
  shareClientId?: string
  name: string
  webRtc: WebRtc | null
  status: string
}
type Members = {
  [key: string]: Member
}
export type Chat = {
  isOpen: boolean
  messages: ChatMessage[]
}
export type ChatMessage = {
  text: string
  clientId: string
  datetime: Date
}
export type Share = {
  clientId?: string
  mediaStream: MediaStream | null
  webRtc: DisplayShare | null
}
export type Recoder = {
  // @ts-ignore
  mediaRecorder: MediaRecorder | null
  isRecording: boolean
  isOpen: boolean
  chunks: []
}
export type Device = {
  deviceId: string
}
export type MediaDevice = {
  isOpen: boolean
  videoInput: Device | null
  audioInput: Device | null
  audioOutput: Device | null
}

export default class RtcClient {
  _setRtcClient: (rtcClient: RtcClient) => void
  mediaStream: MediaStream | null
  members: Members
  room: Room
  self: Self
  share: Share
  chat: Chat
  recorder: Recoder
  mediaDevice: MediaDevice

  constructor(setRtcClient: (rtcClient: RtcClient) => void) {
    this._setRtcClient = setRtcClient
    this.mediaStream = null
    this.members = {}
    this.room = { roomId: undefined, name: '' }
    this.self = { clientId: undefined, name: '' }
    this.share = { clientId: undefined, mediaStream: null, webRtc: null }
    this.chat = { isOpen: false, messages: [] }
    this.recorder = {
      mediaRecorder: null,
      isRecording: false,
      isOpen: false,
      chunks: [],
    }
    this.mediaDevice = {
      isOpen: false,
      videoInput: null,
      audioInput: null,
      audioOutput: null,
    }
    this.setFcmToken()
  }

  async setRtcClient() {
    await this._setRtcClient(this)
  }

  // カメラの使用許可を取得する
  async setMediaStream() {
    let constraint = { audio: true, video: true } as {
      audio: boolean | { deviceId: string }
      video: boolean | { deviceId: string }
    }
    if (this.mediaDevice.audioInput) {
      constraint = {
        ...constraint,
        audio: { deviceId: this.mediaDevice.audioInput.deviceId },
      }
    }
    if (this.mediaDevice.videoInput) {
      constraint = {
        ...constraint,
        video: { deviceId: this.mediaDevice.videoInput.deviceId },
      }
    }
    try {
      if (this.mediaStream) {
        // 既にメディアストリームがある場合は停止させる
        this.mediaStream.getTracks().forEach((track) => track.stop())
        this.mediaStream = null
      }
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraint)
    } catch (error) {
      console.error(error)
    }
    await this.setRtcClient()
  }

  async setFcmToken() {
    await getMessagingToken().then((currentToken) => {
      if (currentToken) {
        this.self.fcmToken = currentToken
      }
    });
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

  // 映像のオン・オフを切り替える
  async toggleVideo() {
    this.self.videoOff = !this.self.videoOff
    await this.setRtcClient()
    if (Object.keys(this.members).length === 0) return
    Object.keys(this.members).forEach((key) => {
      this.members[key].webRtc?.toggleVideo()
    })
  }

  // 音声のオン・オフを切り替える
  async toggleAudio() {
    this.self.muted = !this.self.muted
    await this.setRtcClient()
    if (Object.keys(this.members).length === 0) return
    Object.keys(this.members).forEach((key) => {
      this.members[key].webRtc?.toggleAudio()
    })
  }

  // チャットの表示・非表示を切り替える
  async openChat() {
    this.chat.isOpen = true
    await this.setRtcClient()
  }
  async closeChat() {
    this.chat.isOpen = false
    await this.setRtcClient()
  }
  async sendChat(text: string) {
    const message = {
      type: 'chat',
      text,
      clientId: this.self.clientId,
      datetime: new Date(),
    } as ChatMessage
    this.chat.messages = [...this.chat.messages, message]
    await this.databaseBroadcastRef.set(message)

    // プッシュ通知を送信する
    await this.sendFcm(message)

    await this.setRtcClient()
  }
  async receiveChat(message: ChatMessage) {
    this.chat.messages = [...this.chat.messages, message]
    await this.setRtcClient()
  }

  // 画面共有を開始する
  async startShare() {
    try {
      // @ts-ignore
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: true,
      })
      this.share = { ...this.share, clientId: this.self.clientId, mediaStream }

      // joinを初期化する
      await this.databaseJoinRef().remove()

      // メンバーに画面共有を追加する
      const key = await this.databaseMembersRef().push({
        type: 'share',
      }).key
      const self = {
        clientId: key,
        name: this.self.name + '(画面共有)',
      }
      if (self.clientId !== null) {
        await this.databaseMembersRef(self.clientId).update(self)

        this.databaseJoinRef(self.clientId).on('value', async (snapshot) => {
          const data = snapshot.val()
          if (data === null) return
          const { type, clientId } = data
          switch (type) {
            case 'accept':
              console.log('receive share accept', data)
              await this.addShare(clientId, data.shareClientId)
              this.share.webRtc?.addTracks(mediaStream)
              await this.share.webRtc?.offer()
              break
            default:
              break
          }
        })
        // 自分の通信が切断されたらFirebaseから自分を削除
        await this.databaseMembersRef(self.clientId).onDisconnect().remove()
      }

      if (key) {
        await this.databaseJoinRef(key).set({
          ...this.self,
          type: 'share',
          shareClientId: self.clientId,
        })
      }

      window.setTimeout(async () => {
        const shareVideoRef = <HTMLVideoElement>document.querySelector('#share')
        shareVideoRef.srcObject = mediaStream
      }, 500)

      await this.setRtcClient()
    } catch (error) {
      console.error(error)
    }
  }

  async sendFcm(message: ChatMessage) {
    const token = getMessaging().getToken();
    console.log("request", {token, message})
    const response = await API.post(`${API_ENDPOINT.SEND_FCM}`, {token, message})
    console.log("response", response)
  }

  async stopShare() {
    this.share.webRtc?.disconnect()
    this.share = { clientId: undefined, mediaStream: null, webRtc: null }

    // TODO 画面共有の終了処理

    await this.setRtcClient()
  }

  // 録画の開始
  async startRecorder() {
    if (this.recorder.isRecording) {
      alert('録画中です')
      return
    }
    // @ts-ignore
    const videoStream = await navigator.mediaDevices.getDisplayMedia({
      audio: true, // PCからの音声
      video: true, // PCの画面キャプチャ
    })
    const audioStream = await navigator.mediaDevices.getUserMedia({
      video: false, // 外部カメラからの映像
      audio: true, // マイクからの音声
    })
    const mediaStream = new MediaStream([
      ...videoStream.getTracks(),
      ...audioStream.getTracks(),
    ])
    // @ts-ignore
    this.recorder.mediaRecorder = new MediaRecorder(mediaStream, {
      videoBitsPerSecond: 512000, // 512kbits / sec
      mimeType: 'video/webm; codecs=vp9',
    })
    // @ts-ignore
    this.recorder.mediaRecorder.ondataavailable = (e) => {
      // 録画が終了したタイミングで呼び出される
      console.log('record start')
      // @ts-ignore
      this.recorder.chunks.push(e.data)
    }
    // 録画開始
    this.recorder.isRecording = true
    this.recorder.mediaRecorder.start()
    await this.setRtcClient()
  }
  // 録画の停止
  async stopRecorder() {
    // 録画ファイルのダウンロード
    console.log('record download')

    this.recorder.mediaRecorder.onstop = async () => {
      this.recorder.mediaRecorder = null
      this.recorder.isRecording = false
      this.recorder.isOpen = true
      await this.setRtcClient()
    }
    this.recorder.mediaRecorder.stop()

    await this.setRtcClient()
  }
  // 録画モーダルを閉じる
  async closeRecorder() {
    this.recorder.isOpen = false
    await this.setRtcClient()
  }

  async openMediaDevice() {
    this.mediaDevice.isOpen = true
    await this.setRtcClient()
  }
  async closeMediaDevice() {
    this.mediaDevice.isOpen = false
    await this.setRtcClient()
  }
  async setMediaDevice(deviceId: string, kind: string) {
    if (kind === 'videoinput') {
      this.mediaDevice.videoInput = { deviceId }
    }
    if (kind === 'audioinput') {
      this.mediaDevice.audioInput = { deviceId }
    }
    if (kind === 'audiooutput') {
      this.mediaDevice.audioOutput = { deviceId }
    }

    await this.setMediaStream()

    await this.setRtcClient()
  }

  async signOut() {
    console.log('logout')
    await this.disconnect()
    await getAuth().signOut()
    this.self = { clientId: undefined, name: '' }
    await this.setRtcClient()
  }

  async disconnect() {
    console.log('disconnect')
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
        type: 'user',
      }).key
      this.self = {
        clientId: key + '',
        name: this.self.name,
        fcmToken: this.self.fcmToken,
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
      const remoteVideoSelector = `#video-${data.clientId}`
      data.webRtc = new WebRtc(
        this.mediaStream,
        this.room.roomId,
        this.self.clientId,
        data.clientId,
        remoteVideoSelector
      )
      data.status = 'online'
      await data.webRtc.startListening()
      const newMember = {
        [data.clientId]: data,
      }
      this.members = { ...this.members, ...newMember }
    } else {
      console.error('no mediaStream')
    }
    await this.setRtcClient()
  }

  async addShare(shareClientId: string, clientId: string) {
    console.log('addShare', shareClientId, clientId)
    if (this.self.clientId && this.room.roomId) {
      this.share.clientId = shareClientId
      this.share.webRtc = new DisplayShare(
        this.room.roomId,
        shareClientId,
        clientId
      )
      await this.share.webRtc.startListening()
    }
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
      const { type, clientId, shareClientId } = data
      if (clientId === this.self.clientId) {
        // 自分自身は無視する
        return
      }
      switch (type) {
        case 'join':
          // 2-1. joinを受信して新メンバーの情報をローカルに登録する
          console.log('receive join', data)
          await this.addMember(data)
          // 2-2. acceptを送信する
          await this.databaseJoinRef(clientId).set({
            type: 'accept',
            clientId: this.self.clientId,
            name: this.self.name,
          })
          console.log(this.share.clientId, this.self.clientId)
          if (
            this.share.clientId &&
            this.share.clientId === this.self.clientId
          ) {
            await this.addShare(this.share.clientId, this.self.clientId)
            await this.databaseJoinRef(this.share.clientId).set({
              type: 'accept',
              clientId: this.self.clientId,
              shareClientId: this.share.clientId,
              name: this.self.name,
            })
          }
          break
        case 'share':
          // joinを受信して画面共有の情報をローカルに登録する
          console.log('receive share', data)
          if (this.self.clientId) {
            await this.addShare(shareClientId, this.self.clientId)
          }
          await this.databaseJoinRef(shareClientId).set({
            type: 'accept',
            clientId: this.self.clientId,
            shareClientId,
            name: this.self.name,
          })
          break
        default:
          break
      }
    })
    await this.databaseJoinRef(this.self.clientId).onDisconnect().remove()

    this.databaseJoinRef(this.self.clientId).on('value', async (snapshot) => {
      const data = snapshot.val()
      if (data === null) return
      const { type, clientId } = data
      switch (type) {
        case 'accept':
          // 3-1. acceptを受信して既存メンバーの情報をローカルに登録する
          console.log('receive accept', data)
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

    // ダイレクト通信に関するリスナー
    this.databaseBroadcastRef.on('value', async (snapshot) => {
      const data = snapshot.val()
      if (data === null) return
      console.log(data)
      const { type, clientId } = data
      if (clientId === this.self.clientId) {
        // ignore self message (自分自身からのメッセージは無視する）
        return
      }
      switch (type) {
        case 'chat':
          await this.receiveChat(data)
          break
        default:
          break
      }
    })

    // ダイレクト通信に関するリスナー
    const databaseDirectRef = this.databaseDirectRef(this.self.clientId)
    databaseDirectRef.on('value', async (snapshot) => {
      const data = snapshot.val()
      if (data === null) return
      console.log('receive Direct', data)
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
