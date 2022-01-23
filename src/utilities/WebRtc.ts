import { getDatabase } from './firebase'

interface WebRtcType {
  roomName: string
  mediaStream: MediaStream
  localClientId: string
  remoteClientId: string
  rtcPeerConnection: RTCPeerConnection | null
}

export default class WebRtc implements WebRtcType {
  localClientId: string
  mediaStream: MediaStream
  remoteClientId: string
  roomName: string
  rtcPeerConnection: RTCPeerConnection | null

  static INITIAL_AUDIO_ENABLED = false

  constructor(
    mediaStream: MediaStream,
    roomName: string,
    localClientId: string,
    remoteClientId: string
  ) {
    this.roomName = roomName
    this.mediaStream = mediaStream
    this.localClientId = localClientId
    this.remoteClientId = remoteClientId

    const config = {
      iceServers: [{ urls: 'stun:stun.stunprotocol.org' }],
    }
    this.rtcPeerConnection = new RTCPeerConnection(config)
    this.addTracks()
  }

  // ピアツーピアで通信相手に対して送信されるオーディオとビデオのトラックを追加する
  addTracks(): void {
    this.addAudioTrack()
    this.addVideoTrack()
  }

  addAudioTrack(): void {
    this.audioTrack.enabled = WebRtc.INITIAL_AUDIO_ENABLED
    this.rtcPeerConnection?.addTrack(this.audioTrack, this.mediaStream)
  }

  addVideoTrack(): void {
    this.rtcPeerConnection?.addTrack(this.videoTrack, this.mediaStream)
  }

  get audioTrack(): MediaStreamTrack {
    return this.mediaStream.getAudioTracks()[0]
  }

  get videoTrack(): MediaStreamTrack {
    return this.mediaStream.getVideoTracks()[0]
  }

  // 音声のオン・オフを切り替える
  toggleAudio(): void {
    this.audioTrack.enabled = !this.audioTrack.enabled
  }

  get localDescription(): (() => any) | undefined {
    if (this.rtcPeerConnection !== null) {
      return this.rtcPeerConnection.localDescription?.toJSON();
    }
  }

  databaseMembersRef(path = '') {
    return getDatabase(this.roomName + '/_members_/' + path)
  }

  get remoteVideoRef(): HTMLVideoElement {
    return <HTMLVideoElement>(
      document.querySelector(`#video-${this.remoteClientId}`)
    )
  }

  disconnect(): void {
    if (this.rtcPeerConnection !== null) {
      this.rtcPeerConnection?.close()
      this.rtcPeerConnection = null
    }
  }

  // 2. AさんがBさんからjoinを受信したらAさんはBさんにofferを送信する
  async offer(): Promise<void> {
    try {
      // 2-2. 通信経路をシグナリングサーバーに送信できるようにイベントハンドラを登録する
      this.setOnicecandidateCallback()
      // 2-3. P2P確立後、通信相手のメディアストリーム情報の受信後、表示先のDOMを登録しておく
      this.setOntrack()
      // 2-4. SDP(offer)を作成する
      const sessionDescription = await this.createOffer()
      // 2-5. 作成したSDP(offer)を保存する
      if (sessionDescription !== undefined) {
        await this.setLocalDescription(sessionDescription)
      }
      // 2-6. SDP(offer)を送信する
      const data = {
        type: 'offer',
        sender: this.localClientId,
        sessionDescription: this.localDescription,
      }
      const databaseMembersRef = this.databaseMembersRef(this.remoteClientId+'/connections/'+this.localClientId)
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
          await this.databaseMembersRef(this.remoteClientId+'/connections/'+this.localClientId).update({
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

  // 3. BさんがAさんからofferを受信したらBさんはAさんにanswerを送信する
  async answer(sessionDescription: RTCSessionDescriptionInit): Promise<void> {
    try {
      // 3-2. 通信経路をシグナリングサーバーに送信できるようにイベントハンドラを登録する
      this.setOnicecandidateCallback()
      // 3-3. P2P確立後、通信相手のメディアストリーム情報の受信後、表示先のDOMを登録しておく
      this.setOntrack()
      // 3-4. 受信した相手のSDP(offer)を保存する
      await this.setRemoteDescription(sessionDescription)
      // 3-5. SDP(answer)を作成する
      if (this.rtcPeerConnection !== null) {
        const answer = await this.rtcPeerConnection.createAnswer()
        // 3-6. 作成したSDP(answer)を保存する
        await this.rtcPeerConnection.setLocalDescription(answer)
      }
      // 3-7. SDP(answer)を送信する
      const data = {
        type: 'answer',
        sender: this.localClientId,
        sessionDescription: this.localDescription,
      }
      const databaseMembersRef = this.databaseMembersRef(this.remoteClientId+'/connections/'+this.localClientId)
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

  // 4. AさんがBさんからanswerを受信する
  async saveReceivedSessionDescription(
    sessionDescription: RTCSessionDescriptionInit
  ): Promise<void> {
    try {
      // 4-1. 受信した相手のSDP(answer)を保存する
      await this.setRemoteDescription(sessionDescription)
    } catch (e) {
      console.error(e)
    }
  }

  // 5. 相手の通信経路(candidate)を追加する
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      if (this.rtcPeerConnection !== null) {
        const iceCandidate = new RTCIceCandidate(candidate)
        await this.rtcPeerConnection.addIceCandidate(iceCandidate)
      }
    } catch (error) {
      console.error(error)
    }
  }

  // シグナリングサーバーをリスンする処理
  async startListening() {
    console.log('startListening', this.localClientId+'/connections/'+this.remoteClientId)

    const databaseMembersRef = this.databaseMembersRef(this.localClientId+'/connections/'+this.remoteClientId)
    databaseMembersRef.on('value', async (snapshot) => {
      const data = snapshot.val()
      if (data === null) return
      const { candidate, sessionDescription, type } = data
      switch (type) {
        case 'offer':
          console.log('receive offer', data)
          // 既存メンバーからofferを受信したらanswerを送信する
          await this.answer(sessionDescription)
          break
        case 'answer':
          console.log('receive answer', data)
          // answerを受信する
          await this.saveReceivedSessionDescription(sessionDescription)
          break
        case 'candidate':
          // console.log("receive candidate", data)
          // シグナリングサーバー経由でcandidateを受信し、相手の通信経路を追加する
          await this.addIceCandidate(candidate)
          break
        default:
          break
      }
    })
    // メンバーが離脱した場合にFirebaseから削除
    await databaseMembersRef.onDisconnect().remove()

  }

}
