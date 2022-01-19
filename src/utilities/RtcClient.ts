import FirebaseClient from './FirebaseClient';

const INITIAL_AUDIO_ENABLED = false;

export default class RtcClient {
  constructor(setRtcClient) {
    this._setRtcClient = setRtcClient;
    this.firebaseClient = new FirebaseClient();
    this.roomName = '';
    this.localPeerName = '';
    this.remotePeerName = '';
    this.remoteVideoRef = null;
    this.mediaStream = null;
    this.rtcPeerConnection = null;
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
    await this.firebaseClient.sendOffer(this.localDescription);
  }

  setOntrack() {
    console.log("setOntrack", this.remoteVideoRef)
    this.rtcPeerConnection.ontrack = (rtcTrackEvent) => {
      console.log("setOntrack rtcPeerConnection", this.remoteVideoRef)
      if (rtcTrackEvent.track.kind !== 'video' || this.remoteVideoRef === null) return;

      const remoteMediaStream = rtcTrackEvent.streams[0];
      this.remoteVideoRef.current.srcObject = remoteMediaStream;
      this.setRtcClient();
    };

    this.setRtcClient();
  }

  // 既存メンバーからofferを受信したらanswerを送信する
  async answer(sender, sessionDescription) {
    try {
      this.remotePeerName = sender;
      this.setOnicecandidateCallback();
      this.setOntrack();
      await this.setRemoteDescription(sessionDescription);
      const answer = await this.rtcPeerConnection.createAnswer();
      await this.rtcPeerConnection.setLocalDescription(answer);
      await this.sendAnswer();
      this.setRtcClient();
    } catch (e) {
      console.error(e);
    }
  }

  async join(roomName) {
    console.log('join', roomName)
    this.roomName = roomName;
    await this.startListening(roomName);
    await this.firebaseClient.sendJoin();
  }

  setRemotePeerName(remotePeerName) {
    this.remotePeerName = remotePeerName;
    this.setRtcClient();
  }

  async connect(remoteVideoRef) {
    console.log('connect', this.remotePeerName, remoteVideoRef)
    this.remoteVideoRef = remoteVideoRef;
    this.setRtcClient();
    this.setOnicecandidateCallback();
    this.setOntrack();
    await this.offer();
    this.setRtcClient();
  }

  disconnect() {
    console.log("disconnect")
    if (this.rtcPeerConnection) {
      if (this.rtcPeerConnection !== 'closed') {
        this.rtcPeerConnection.close()
        this.rtcPeerConnection = null
        this.roomName = '';
        console.log("closed")
        this.setRtcClient();
      }
    }
  }

  async setRemoteDescription(sessionDescription) {
    await this.rtcPeerConnection.setRemoteDescription(sessionDescription);
  }

  async sendAnswer() {
    this.firebaseClient.setPeerNames(
      this.localPeerName,
      this.roomName
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

  setLocalPeerName(localPeerName) {
    this.localPeerName = localPeerName;
    this.setRtcClient();
  }

  // シグナリングサーバーをリスンする処理
  async startListening(roomName) {

    const config = {
      iceServers: [{ urls: 'stun:stun.stunprotocol.org' }],
    };
    this.rtcPeerConnection = new RTCPeerConnection(config);
    this.addTracks();

    this.setRtcClient();
    // 過去のデータを初期化する
    this.firebaseClient.setPeerNames(
        this.localPeerName,
        roomName
    );
    // await this.firebaseClient.remove(roomName + '/_broadcast_/');
    const connectionRef = this.firebaseClient.database
      .ref(roomName + '/_broadcast_/')
    connectionRef.on('value', async (snapshot) => {
        const data = snapshot.val();
        if (data === null) return;

        const { candidate, sender, sessionDescription, type } = data;
        switch (type) {
          case 'join':
            // 新メンバーがJOINしてきたらofferを送信する
            if (sender === this.localPeerName) {
              // ignore self message (自分自身からのメッセージは無視する）
              return;
            }
            await this.setRemotePeerName(sender);
            break;
          case 'offer':
            // 既存メンバーからofferを受信したらanswerを送信する
            await this.answer(sender, sessionDescription);
            break;
          case 'answer':
            // answerを受信する
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
    // 切断時にデータベースから自動で削除する
    connectionRef.onDisconnect().remove();

    const direct = this.firebaseClient.database.ref(roomName + "/_direct_/"+this.localPeerName);
    const localPeerName = this.localPeerName;
    direct.on('value', function(data) {
      const { sender, message, type } = data;
      if (sender === localPeerName) {
        // ignore self message (自分自身からのメッセージは無視する）
        return;
      }
      switch (type) {
        case 'call me':
          break;
          console.log("child_added", type, data.val());
        default:
          console.log("child_added", type, data.val());
          break;
      }
    });
  }

  async sendAll() {
    await this.firebaseClient.database.ref(this.roomName + "/_broadcast_").set({
      type: 'call me',
      sender: this.localPeerName,
      message: 'I am ' + this.localPeerName,
    });
  }
  async sendCCC() {
    await this.firebaseClient.database.ref(this.roomName + "/_direct_/" + "ccc").set({
      type: 'call me',
      sender: this.localPeerName,
      message: 'I am ' + this.localPeerName,
    });
  }
}
