import { getDatabase } from './firebase'
import firebase from 'firebase/compat/app'

export default class ShareWebRtc {
  localClientId: string
  remoteClientId: string
  roomId: string
  rtcPeerConnection: RTCPeerConnection | null

  constructor(roomId: string, localClientId: string, remoteClientId: string) {
    this.roomId = roomId
    this.localClientId = localClientId
    this.remoteClientId = remoteClientId

    const config = {
      iceServers: [{ urls: 'stun:stun.stunprotocol.org' }],
    }
    this.rtcPeerConnection = new RTCPeerConnection(config)
  }

  // ピアツーピアで通信相手に対して送信されるオーディオとビデオのトラックを追加する
  addTracks(mediaStream: MediaStream): void {
    this.rtcPeerConnection?.addTrack(
      mediaStream.getVideoTracks()[0],
      mediaStream
    )
  }

  get localDescription(): (() => any) | undefined {
    if (this.rtcPeerConnection !== null) {
      return this.rtcPeerConnection.localDescription?.toJSON()
    }
  }

  databaseMembersRef(path = '') {
    return getDatabase(this.roomId + '/_members_/' + path)
  }

  get remoteVideoRef(): HTMLVideoElement {
    return <HTMLVideoElement>document.querySelector('#share')
  }

  disconnect(): void {
    if (this.rtcPeerConnection !== null) {
      this.rtcPeerConnection?.close()
      this.rtcPeerConnection = null

      const databaseMembersRef = this.databaseMembersRef(
        this.localClientId + '/connections/' + this.remoteClientId
      )
      databaseMembersRef.off('value', this.listener)
    }
  }

  // 3. BさんがAさんからjoinを受信したらBさんはAさんにofferを送信する
  async offer(): Promise<void> {
    try {
      // 3-2. 通信経路をシグナリングサーバーに送信できるようにイベントハンドラを登録する
      this.setOnicecandidateCallback()
      // 3-3. P2P確立後、通信相手のメディアストリーム情報の受信後、表示先のDOMを登録しておく
      this.setOntrack()
      // 3-4. SDP(offer)を作成する
      const sessionDescription = await this.createOffer()
      // 3-5. 作成したSDP(offer)を保存する
      if (sessionDescription !== undefined) {
        await this.setLocalDescription(sessionDescription)
      }
      // 3-6. SDP(offer)を送信する
      const data = {
        type: 'offer',
        sender: this.localClientId,
        sessionDescription: this.localDescription,
      }
      const databaseMembersRef = this.databaseMembersRef(
        this.remoteClientId + '/connections/' + this.localClientId
      )
      console.log('send offer', data)
      await databaseMembersRef.set(data)
    } catch (e) {
      console.error(e)
    }
  }

  // 通信経路をシグナリングサーバーに送信できるようにイベントハンドラを登録する
  setOnicecandidateCallback(): void {
    if (this.rtcPeerConnection !== null) {
      this.rtcPeerConnection.onicecandidate = async ({ candidate }) => {
        if (candidate) {
          // remoteへcandidate(通信経路)を通知する
          await this.databaseMembersRef(
            this.remoteClientId + '/connections/' + this.localClientId
          ).update({
            type: 'candidate',
            sender: this.localClientId,
            candidate: candidate.toJSON(),
          })
        }
      }
    }
  }

  // P2P確立後、通信相手のメディアストリーム情報の受信後、表示先のDOMを登録しておく
  setOntrack(): void {
    if (this.rtcPeerConnection !== null) {
      this.rtcPeerConnection.ontrack = (rtcTrackEvent) => {
        if (rtcTrackEvent.track.kind !== 'video') return
        const remoteMediaStream = rtcTrackEvent.streams[0]
        this.remoteVideoRef.srcObject = remoteMediaStream
      }
    }
  }

  // SDP(offer)を作成する
  async createOffer(): Promise<RTCSessionDescriptionInit | undefined> {
    try {
      if (this.rtcPeerConnection !== null) {
        return await (<RTCSessionDescriptionInit>(
          this.rtcPeerConnection.createOffer()
        ))
      }
    } catch (e) {
      console.error(e)
    }
  }

  // 作成したSDP(offer)を保存する
  async setLocalDescription(
    sessionDescription: RTCSessionDescriptionInit
  ): Promise<void> {
    try {
      if (this.rtcPeerConnection !== null) {
        await this.rtcPeerConnection.setLocalDescription(sessionDescription)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // 4. AさんがBさんからofferを受信したらAさんはBさんにanswerを送信する
  async answer(sessionDescription: RTCSessionDescriptionInit): Promise<void> {
    try {
      // 4-2. 通信経路をシグナリングサーバーに送信できるようにイベントハンドラを登録する
      this.setOnicecandidateCallback()
      // 4-3. P2P確立後、通信相手のメディアストリーム情報の受信後、表示先のDOMを登録しておく
      this.setOntrack()
      // 4-4. 受信した相手のSDP(offer)を保存する
      await this.setRemoteDescription(sessionDescription)
      // 4-5. SDP(answer)を作成する
      if (this.rtcPeerConnection !== null) {
        const answer = await this.rtcPeerConnection.createAnswer()
        // 4-6. 作成したSDP(answer)を保存する
        await this.rtcPeerConnection.setLocalDescription(answer)
      }
      // 4-7. SDP(answer)を送信する
      const data = {
        type: 'answer',
        sender: this.localClientId,
        sessionDescription: this.localDescription,
      }
      const databaseMembersRef = this.databaseMembersRef(
        this.remoteClientId + '/connections/' + this.localClientId
      )
      console.log('send answer', databaseMembersRef, data)
      await databaseMembersRef.update(data)
    } catch (e) {
      console.error(e)
    }
  }

  // 受信した相手のSDP(offer)を保存する
  async setRemoteDescription(
    sessionDescription: RTCSessionDescriptionInit
  ): Promise<void> {
    if (this.rtcPeerConnection !== null) {
      await this.rtcPeerConnection.setRemoteDescription(sessionDescription)
    }
  }

  // 5. BさんがAさんからanswerを受信する
  async saveReceivedSessionDescription(
    sessionDescription: RTCSessionDescriptionInit
  ): Promise<void> {
    try {
      // 5-2. 受信した相手のSDP(answer)を保存する
      await this.setRemoteDescription(sessionDescription)
    } catch (e) {
      console.error(e)
    }
  }

  // 6. シグナリングサーバー経由でcandidateを受信し、相手の通信経路(candidate)を追加する
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      if (this.rtcPeerConnection !== null) {
        const iceCandidate = new RTCIceCandidate(candidate)
        // 6-2. 受信した相手の通信経路(candidate)を保存する
        await this.rtcPeerConnection.addIceCandidate(iceCandidate)
      }
    } catch (error) {
      console.error(error)
    }
  }

  async startListening() {
    console.log(
      'startListening',
      this.roomId +
        '/_members_/' +
        this.localClientId +
        '/connections/' +
        this.remoteClientId
    )

    const databaseMembersRef = this.databaseMembersRef(
      this.localClientId + '/connections/' + this.remoteClientId
    )
    databaseMembersRef.on('value', this.listener)
    // メンバーが離脱した場合にFirebaseから削除
    await databaseMembersRef.onDisconnect().remove()
  }

  // シグナリングサーバーをリスンする処理
  listener = async (snapshot: firebase.database.DataSnapshot) => {
    const data = snapshot.val()
    if (data === null) return
    const { candidate, sessionDescription, type } = data
    switch (type) {
      case 'offer':
        // 4-1. 新メンバーからofferを受信する
        console.log('receive offer', data)
        await this.answer(sessionDescription)
        break
      case 'answer':
        // 5-1. 既存メンバーからanswerを受信する
        console.log('receive answer', data)
        await this.saveReceivedSessionDescription(sessionDescription)
        break
      case 'candidate':
        // 6-1. Aさん、Bさんはシグナリングサーバーからcandidateを受信する
        // console.log('receive candidate', data)
        await this.addIceCandidate(candidate)
        break
      default:
        break
    }
  }
}
