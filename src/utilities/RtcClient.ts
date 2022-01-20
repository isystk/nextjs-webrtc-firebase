import { getDatabase } from './firebase'
import WebRtc from './WebRtc'

export default class RtcClient {
  constructor(setRtcClient) {
    this._setRtcClient = setRtcClient;
    this.roomName = '';
    this.localPeerName = '';
    this.mediaStream = null;
    this.members = null;
    this.webRtc = null;
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

  // メディア(音声とビデオ)の仕様を許可する
  async setMediaStream() {
    await this.getUserMedia();
    this.setRtcClient();
  }

  setLocalPeerName(localPeerName) {
    this.localPeerName = localPeerName;
    this.setRtcClient();
  }

  get initialAudioMuted() {
    return !WebRtc.INITIAL_AUDIO_ENABLED;
  }

  // 音声のオン・オフを切り替える
  toggleAudio() {
    if (!this.webRtc) return;
    this.webRtc.toggleAudio();
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

  // 自分がルームに入ったら全メンバーにjoinを送信する
  async join(roomName) {
    console.log('join', roomName)
    try {
      this.roomName = roomName;
      this.setRtcClient();

      // シグナリングサーバー(JOIN)をリスンする
      await this.startJoinListening();

      // シグナリングサーバー(Broadcast)をリスンする
      await this.startBroadcastListening();

      // joinを送信する
      console.log("send join", this.roomName, this.localPeerName)
      // await this.databaseJoinRef().push({
      //   sender: this.localPeerName,
      // });
      await this.databaseJoinRef(this.localPeerName).set({
        sender: this.localPeerName,
      });

    } catch (error) {
      console.error(error);
    }
  }

  // joinを受信した時やofferを受信したらメンバーを追加する
  addMember(remotePeerName) {
    this.members = remotePeerName;
    // シグナリングサーバーと通信するためのインスタンスを生成する
    this.webRtc = new WebRtc(this.mediaStream, this.roomName, this.localPeerName);
    this.setRtcClient();
  }

  removeMember(remotePeerName) {
    this.members = '';
    // シグナリングサーバーと通信するためのインスタンスを生成する
    this.webRtc = null;
    this.setRtcClient();
  }

  // シグナリングサーバーをリスンする処理
  async startJoinListening() {
    console.log("startListening join", this.roomName)

    // JOINに関するリスナー
    // this.databaseJoinRef().remove()
    this.databaseJoinRef().on('child_added', async (snapshot) => {
      const data = snapshot.val();
      if (data === null) return;
      const {sender} = data;
      if (sender === this.localPeerName) {
        // ignore self message (自分自身からのメッセージは無視する）
        return;
      }
      console.log("receive join", sender, this.localPeerName)
      this.addMember(sender)
      await this.webRtc.offer(sender);
    })
    this.databaseJoinRef().on('child_changed', async (snapshot) => {
      const data = snapshot.val();
      if (data === null) return;
      console.log("child_changed", data)
    })
    this.databaseJoinRef().on('child_removed', async (snapshot) => {
      const data = snapshot.val();
      if (data === null) return;
      const {sender} = data;
      if (sender === this.localPeerName) {
        // ignore self message (自分自身からのメッセージは無視する）
        return;
      }
      console.log("receive remove", data)
      this.removeMember(sender)
    })
    this.databaseJoinRef().on('child_moved', async (snapshot) => {
      const data = snapshot.val();
      if (data === null) return;
      console.log("child_changed", data)
    })
    await this.databaseJoinRef(this.localPeerName).onDisconnect().remove()
  }

  async startBroadcastListening() {
    console.log("startListening broadcast", this.roomName)

    // ダイレクト通信に関するリスナー
    const databaseDirectRef = this.databaseDirectRef(this.localPeerName);
    await databaseDirectRef.remove();
    databaseDirectRef.on('value', async (snapshot) => {
      const data = snapshot.val();
      if (data === null) return;

      const { candidate, sender, sessionDescription, type } = data;
      console.log("receive", sender, type)
      switch (type) {
        case 'offer':
          this.addMember(sender)
          // 既存メンバーからofferを受信したらanswerを送信する
          await this.webRtc.answer(sender, sessionDescription);
          break;
        case 'answer':
          // answerを受信する
          await this.webRtc.saveReceivedSessionDescription(sessionDescription);
          break;
        case 'candidate':
          // シグナリングサーバー経由でcandidateを受信し、相手の通信経路を追加する
          await this.webRtc.addIceCandidate(candidate);
          break;
        default:
          break;
      }
    })

    // ブロードキャスト通信に関するリスナー
    const localPeerName = this.localPeerName;
    this.databaseBroadcastRef.on('value', function(data) {
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
    await this.databaseBroadcastRef.set({
      type: 'call me',
      sender: this.localPeerName,
      message: 'I am ' + this.localPeerName,
    });
  }
  async sendTarget(remotePeerName) {
    await this.databaseDirectRef(remotePeerName).set({
      type: 'call me',
      sender: this.localPeerName,
      message: 'I am ' + this.localPeerName,
    });
  }

  databaseJoinRef(localPeerName='') {
    return getDatabase(this.roomName + '/_join_/' + localPeerName);
  }

  get databaseBroadcastRef() {
    return getDatabase(this.roomName + '/_broadcast_/');
  }

  databaseDirectRef(remotePeerName) {
    return getDatabase(this.roomName + '/_direct_/' + remotePeerName);
  }
}
