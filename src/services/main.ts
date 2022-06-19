import { getDatabase, getAuth } from '@/utilities/firebase'
import DisplayShare from '@/services/DisplayShare'
import { WebRtc } from '@/services/WebRtc'
import Recorder from '@/services/Recorder'
import MediaDevice from '@/services/MediaDevice'
import RoomChat from '@/services/RoomChat'

export type Self = {
  clientId?: string
  name: string
  videoOff?: boolean
  muted?: boolean
}
export type Room = {
  roomId?: string
  name: string
}
export type Member = {
  clientId: string
  shareClientId?: string
  name: string
  webRtc: WebRtc | null
  status: string
}
type Members = {
  [key: string]: Member
}

export default class MainService {
  _setAppRoot: (rtcClient: MainService) => void
  members: Members
  room: Room
  self: Self
  share: DisplayShare
  chat: RoomChat
  recorder: Recorder
  mediaDevice: MediaDevice

  constructor(setAppRoot: (appRoot: MainService) => void) {
    this._setAppRoot = setAppRoot
    this.members = {}
    this.room = { roomId: undefined, name: '' }
    this.self = { clientId: undefined, name: '' }
    this.share = new DisplayShare(this)
    this.chat = new RoomChat(this)
    this.recorder = new Recorder(this)
    this.mediaDevice = new MediaDevice(this)
  }

  async setAppRoot() {
    await this._setAppRoot(this)
  }

  async setLocalPeerName(localPeerName: string) {
    this.self.name = localPeerName
    await this.setAppRoot()
  }

  async setRoomName(roomName: string) {
    const key = getDatabase().push({
      name: roomName,
    }).key
    console.log('roomId', key)
    this.room = {
      // roomId: key + '',
      roomId: roomName, // 本番ではSSGを利用するためパスにIDが利用できない
      name: roomName,
    }
    // TODO ここにawaitを付けると何故か動作しない
    getDatabase(this.room.roomId).update(this.room)
    await this.setAppRoot()
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
      await this.setAppRoot()
    })
  }

  // 映像のオン・オフを切り替える
  async toggleVideo() {
    this.self.videoOff = !this.self.videoOff
    await this.setAppRoot()
    if (Object.keys(this.members).length === 0) return
    Object.keys(this.members).forEach((key) => {
      this.members[key].webRtc?.toggleVideo()
    })
  }

  // 音声のオン・オフを切り替える
  async toggleAudio() {
    this.self.muted = !this.self.muted
    await this.setAppRoot()
    if (Object.keys(this.members).length === 0) return
    Object.keys(this.members).forEach((key) => {
      this.members[key].webRtc?.toggleAudio()
    })
  }

  async signOut() {
    console.log('logout')
    await this.disconnect()
    await getAuth().signOut()
    this.self = { clientId: undefined, name: '' }
    await this.setAppRoot()
  }

  async disconnect() {
    console.log('disconnect')
    await this.databaseMembersRef(this.self.clientId).remove()
    this.room = { roomId: undefined, name: '' }
    await this.setAppRoot()
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

      await this.setAppRoot()
    } catch (error) {
      console.error(error)
    }
  }

  // joinを受信した時やofferを受信したらメンバーを追加する
  async addMember(data: Member) {
    console.log('addMember', data)
    if (
      this.mediaDevice.mediaStream &&
      this.self.clientId &&
      this.room.roomId
    ) {
      const remoteVideoSelector = `#video-${data.clientId}`
      data.webRtc = new WebRtc(
        this.mediaDevice.mediaStream,
        this.room.roomId,
        this.self.clientId,
        data.clientId,
        remoteVideoSelector
      )
      await data.webRtc.startListening()
    } else {
      console.error('no mediaStream')
    }
    data.status = 'online'
    const newMember = {
      [data.clientId]: data,
    }
    this.members = { ...this.members, ...newMember }
    await this.setAppRoot()
  }

  async removeMember(data: Member) {
    console.log('removeMember', this.members[data.clientId])
    if (this.members[data.clientId]) {
      this.members[data.clientId].webRtc?.disconnect()
      // delete this.members[data.clientId]
      this.members[data.clientId].status = 'offline'
    }
    await this.setAppRoot()
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
            await this.share.addShare(this.share.clientId, this.self.clientId)
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
            await this.share.addShare(shareClientId, this.self.clientId)
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
          await this.chat.receiveChat(data)
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
