import { getDatabase } from './firebase'
import WebRtc from './WebRtc'

export default class RtcClient {
  constructor(setRtcClient) {
    this._setRtcClient = setRtcClient;
    this.roomName = '';
    this.localPeerName = '';
    this.mediaStream = null;
    this.members = {};
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

      // シグナリングサーバーをリスンする
      await this.startListening();

      // joinを送信する
      console.log("send join", this.roomName, this.localPeerName)
      await this.databaseJoin.push({
        name: this.localPeerName,
        sender: this.localPeerName,
      });

    } catch (error) {
      console.error(error);
    }
  }

  // joinを受信した時やofferを受信したらメンバーを追加する
  async addMember(data) {
    console.log('addMember', data)
    const newMember = {
      [data.sender]: data
    }
    this.members = {...this.members, ...newMember};
    // シグナリングサーバーと通信するためのインスタンスを生成する
    this.webRtc = new WebRtc(this.mediaStream, this.roomName, this.localPeerName, data.sender);
    await this.webRtc.startListening();
    this.setRtcClient();
  }

  removeMember(data) {
    console.log('removeMember', data.name)
    delete this.members[data.name];
    // シグナリングサーバーと通信するためのインスタンスを生成する
    this.webRtc = null;
    this.setRtcClient();
  }

  // シグナリングサーバーをリスンする処理
  async startListening() {
    console.log("startListening")

    // Joinに関するリスナー
    await this.databaseJoin.remove();
    this.databaseJoin.on('child_added', async (snapshot) => {
      const data = snapshot.val();
      if (data === null) return;
      const {sender} = data;
      if (sender === this.localPeerName) {
        // 自分自身は無視する
        return;
      }
      await this.addMember(data)
      await this.webRtc.offer(data);
    })

    // Membersに関するリスナー
    const databaseMembersRef = this.databaseMembersRef(this.localPeerName)
    databaseMembersRef.on('value', async (snapshot) => {
      const data = snapshot.val();
      if (data === null) return;
      const { candidate, sender, sessionDescription, type } = data;
      switch (type) {
        case 'offer':
          console.log("receive offer", data)
          // 既存メンバーからofferを受信したらanswerを送信する
          await this.addMember(data)
          await this.webRtc.answer(data, sessionDescription);
          break;
        case 'answer':
          console.log("receive answer", data)
          // answerを受信する
          await this.webRtc.saveReceivedSessionDescription(sessionDescription);
          break;
        case 'candidate':
          // console.log("receive candidate", data)
          // シグナリングサーバー経由でcandidateを受信し、相手の通信経路を追加する
          await this.webRtc.addIceCandidate(candidate);
          break;
        default:
          break;
      }
    })
    // メンバーが離脱した場合にFirebaseから削除
    await databaseMembersRef.onDisconnect().remove()
    // Firebaseから削除されたらMembersから削除
    this.databaseMembersRef().on('child_removed', async (snapshot) => {
      const data = snapshot.val();
      console.log("receive remove", data)
      if (data === null) return;
      const {name} = data;
      if (name === this.localPeerName) {
        // ignore self message (自分自身からのメッセージは無視する）
        return;
      }
      this.removeMember(data)
    })

    // ブロードキャスト通信に関するリスナー
    const localPeerName = this.localPeerName;
    this.databaseBroadcastRef.on('value', function(snapshot) {
      const data = snapshot.val();
      if (data === null) return;
      console.log("databaseBroadcastRef", data);
    });

    // ダイレクト通信に関するリスナー
    const databaseDirectRef = this.databaseDirectRef(this.localPeerName);
    databaseDirectRef.on('value', function(snapshot) {
      const data = snapshot.val();
      if (data === null) return;
      console.log("databaseDirectRef", data);
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

  get databaseJoin() {
    return getDatabase(this.roomName + '/_join_/');
  }

  databaseMembersRef(path = '') {
    return getDatabase(this.roomName + '/_members_/' + path);
  }

  get databaseBroadcastRef() {
    return getDatabase(this.roomName + '/_broadcast_/');
  }

  databaseDirectRef(path) {
    return getDatabase(this.roomName + '/_direct_/' + path);
  }
}
