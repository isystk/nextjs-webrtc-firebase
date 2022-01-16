import FirebaseClient from './FirebaseClient';

const INITIAL_AUDIO_ENABLED = false;

export default class RtcClient {
  constructor(remoteVideoRef, setRtcClient) {
    const config = {
      iceServers: [{ urls: 'stun:stun.stunprotocol.org' }],
    };
    this._setRtcClient = setRtcClient;
    this.firebaseClient = new FirebaseClient();
    this.localPeerName = '';
    this.mediaStream = null;
    this.remotePeerName = '';
    this.remoteVideoRef = remoteVideoRef;
    this.roomName = '';
    this.rtcPeerConnection = new RTCPeerConnection(config);
  }

  get initialAudioMuted() {
    return !INITIAL_AUDIO_ENABLED;
  }

  setRtcClient() {
    this._setRtcClient(this);
  }

  // ブラウザからオーディオやビデオの使用許可を取得する
  async getUserMedia() {
    try {
      const constraints = { audio: true, video: true };
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error(error);
    }
  }

  async setMediaStream() {
    await this.getUserMedia();
    this.addTracks();
    this.setRtcClient();
  }

  // ピアツーピアで通信相手に対して送信されるオーディオとビデオのトラックを追加する
  addTracks() {
    this.addAudioTrack();
    this.addVideoTrack();
  }

  addAudioTrack() {
    this.audioTrack.enabled = INITIAL_AUDIO_ENABLED;
    this.rtcPeerConnection.addTrack(this.audioTrack, this.mediaStream);
  }

  addVideoTrack() {
    this.rtcPeerConnection.addTrack(this.videoTrack, this.mediaStream);
  }

  get audioTrack() {
    return this.mediaStream.getAudioTracks()[0];
  }

  get videoTrack() {
    return this.mediaStream.getVideoTracks()[0];
  }

  // 音声のオン・オフを切り替える
  toggleAudio() {
    this.audioTrack.enabled = !this.audioTrack.enabled;
    this.setRtcClient();
  }

  async offer() {
    const sessionDescription = await this.createOffer();
    await this.setLocalDescription(sessionDescription);
    await this.sendOffer();
  }

  async createOffer() {
    try {
      return await this.rtcPeerConnection.createOffer();
    } catch (e) {
      console.error(e);
    }
  }

  async setLocalDescription(sessionDescription) {
    try {
      await this.rtcPeerConnection.setLocalDescription(sessionDescription);
    } catch (e) {
      console.error(e);
    }
  }

  async sendOffer() {
    this.firebaseClient.setPeerNames(
      this.localPeerName,
      this.remotePeerName
    );

    await this.firebaseClient.sendOffer(this.localDescription);
  }

  setOntrack() {
    this.rtcPeerConnection.ontrack = (rtcTrackEvent) => {
      if (rtcTrackEvent.track.kind !== 'video') return;

      const remoteMediaStream = rtcTrackEvent.streams[0];
      this.remoteVideoRef.current.srcObject = remoteMediaStream;
      this.setRtcClient();
    };

    this.setRtcClient();
  }

  // シグナリングサーバー経由でofferを受信後にanswerを送信する
  async answer(sender, sessionDescription) {
    try {
      this.remotePeerName = sender;
      this.setOnicecandidateCallback();
      this.setOntrack();
      await this.setRemoteDescription(sessionDescription);
      const answer = await this.rtcPeerConnection.createAnswer();
      await this.rtcPeerConnection.setLocalDescription(answer);
      await this.sendAnswer();
    } catch (e) {
      console.error(e);
    }
  }

  async connect(remotePeerName) {
    this.remotePeerName = remotePeerName;
    this.roomName = remotePeerName;
    this.setOnicecandidateCallback();
    this.setOntrack();
    await this.offer();
    this.setRtcClient();
  }

  disconnect() {
    this.roomName = '';
  }

  async setRemoteDescription(sessionDescription) {
    await this.rtcPeerConnection.setRemoteDescription(sessionDescription);
  }

  async sendAnswer() {
    this.firebaseClient.setPeerNames(
      this.localPeerName,
      this.remotePeerName
    );

    await this.firebaseClient.sendAnswer(this.localDescription);
  }

  // シグナリングサーバー経由でanswerを受信する
  async saveReceivedSessionDescription(sessionDescription) {
    try {
      await this.setRemoteDescription(sessionDescription);
    } catch (e) {
      console.error(e);
    }
  }

  get localDescription() {
    return this.rtcPeerConnection.localDescription.toJSON();
  }

  // 相手の通信経路(candidate)を追加する
  async addIceCandidate(candidate) {
    try {
      const iceCandidate = new RTCIceCandidate(candidate);
      await this.rtcPeerConnection.addIceCandidate(iceCandidate);
    } catch (error) {
      console.error(error);
    }
  }

  setOnicecandidateCallback() {
    this.rtcPeerConnection.onicecandidate = async ({ candidate }) => {
      if (candidate) {
        // remoteへcandidate(通信経路)を通知する
        await this.firebaseClient.sendCandidate(candidate.toJSON());
      }
    };
  }

  // シグナリングサーバーをリスンする処理
  async startListening(localPeerName) {
    this.localPeerName = localPeerName;
    this.setRtcClient();
    // 過去のデータを初期化する
    await this.firebaseClient.remove(localPeerName);
    const connectionRef = this.firebaseClient.database
      .ref(localPeerName)
    connectionRef.on('value', async (snapshot) => {
        const data = snapshot.val();
        if (data === null) return;

        const { candidate, sender, sessionDescription, type } = data;
        switch (type) {
          case 'offer':
            // シグナリングサーバー経由でofferを受信後にanswerを送信する
            await this.answer(sender, sessionDescription);
            break;
          case 'answer':
            // シグナリングサーバー経由でanswerを受信する
            await this.saveReceivedSessionDescription(sessionDescription);
            break;
          case 'candidate':
            // シグナリングサーバー経由でcandidateを受信し、相手の通信経路を追加する
            await this.addIceCandidate(candidate);
            break;
          default:
            this.setRtcClient();
            break;
        }
      })
    connectionRef.on("child_removed", (snapshot) => {
       let remove_connection = snapshot.val();
       console.log(remove_connection)
    })
    // ブラウザを閉じた時に自動で削除する
    connectionRef.onDisconnect().remove();
    connectionRef.set({
      message: "ログインしたよ"
    });
  }
}
