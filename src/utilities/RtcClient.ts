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

  get initialaudiomuted() {
    return this.webrtc.initialaudiomuted;
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
      await getDatabase().ref(this.roomName + '/join').set({
        type: 'join',
        sender: this.localPeerName,
      });

    } catch (error) {
      console.error(error);
    }
  }

  // joinを受信した時やofferを受信したらメンバーを追加する
  async addMember(remotePeerName) {
    this.members = remotePeerName;
    // シグナリングサーバーと通信するためのインスタンスを生成する
    this.webRtc = new WebRtc(this.mediaStream, this.roomName, this.localPeerName);
    this.setRtcClient();
  }

  // joinを受信したらofferを送信する
  async offer(remotePeerName) {
    this.webRtc.offer(remotePeerName);
  }

  // offerを受信したらanswerを送信する
  async answer(sender, sessionDescription) {
    this.webRtc.answer(sender, sessionDescription)
  }

  // answerを受信する
  async saveReceivedSessionDescription(sessionDescription) {
    await this.webRtc.saveReceivedSessionDescription(sessionDescription);
  }

  // シグナリングサーバー経由でcandidateを受信し、相手の通信経路を追加する
  async addIceCandidate(candidate) {
    await this.webRtc.addIceCandidate(candidate);
  }

  // シグナリングサーバーをリスンする処理
  async startJoinListening() {
    console.log("startListening join", this.roomName)

    // JOINに関するリスナー
    await getDatabase().ref(this.roomName + '/join').remove();
    const join = getDatabase().ref(this.roomName + '/join')
    join.on('value', async (snapshot) => {
      const data = snapshot.val();
      if (data === null) return;

      const {sender, type} = data;
      switch (type) {
        case 'join':
          if (sender === this.localPeerName) {
            // ignore self message (自分自身からのメッセージは無視する）
            return;
          }
          console.log("receive join", sender, this.localPeerName)
          this.addMember(sender)
          await this.offer(sender)
          break;
        default:
          break;
      }
    })
    join.onDisconnect().remove();
  }

  async startBroadcastListening() {
    console.log("startListening broadcast", this.roomName)

    // マルチキャスト通信に関するリスナー
    await getDatabase().ref(this.roomName + '/_broadcast_/' + this.localPeerName).remove();
    const broadcast = getDatabase()
        .ref(this.roomName + '/_broadcast_/' + this.localPeerName)
    broadcast.on('value', async (snapshot) => {
      const data = snapshot.val();
      if (data === null) return;

      const { candidate, sender, sessionDescription, type } = data;
      console.log("receive", type)
      switch (type) {
        case 'offer':
          this.addMember(sender)
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
          break;
      }
    })
    broadcast.onDisconnect().remove();

    // ダイレクト通信に関するリスナー
    const direct = getDatabase().ref(this.roomName + "/_direct_/"+this.localPeerName);
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
    await getDatabase().ref(this.roomName + "/_broadcast_").set({
      type: 'call me',
      sender: this.localPeerName,
      message: 'I am ' + this.localPeerName,
    });
  }
  async sendCCC() {
    await getDatabase().ref(this.roomName + "/_direct_/" + "ccc").set({
      type: 'call me',
      sender: this.localPeerName,
      message: 'I am ' + this.localPeerName,
    });
  }
}
