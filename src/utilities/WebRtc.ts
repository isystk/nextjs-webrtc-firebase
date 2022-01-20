import { getDatabase } from './firebase'

const INITIAL_AUDIO_ENABLED = false;

export default class WebRtc {

    constructor(mediaStream, roomName, localPeerName) {
        this.roomName = roomName;
        this.mediaStream = mediaStream;
        this.localPeerName = localPeerName;
        this.remotePeerName = '';

        const config = {
            iceServers: [{ urls: 'stun:stun.stunprotocol.org' }],
        };
        this.rtcPeerConnection = new RTCPeerConnection(config);
        this.addTracks();
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
    }

    get localDescription() {
        return this.rtcPeerConnection.localDescription.toJSON();
    }

    get databaseDirectRef() {
        return getDatabase(this.roomName + '/_direct_/' + this.remotePeerName);
    }

    get remoteVideoRef() {
        return document.querySelector(`#video-${this.remotePeerName}`)
    }

    // 2. AさんがBさんからjoinを受信したらAさんはBさんにofferを送信する
    async offer(remotePeerName) {
        console.log("send offer")
        try {
            // 2-1. 相手の名前をアプリケーションに登録する
            this.remotePeerName = remotePeerName;
            // 2-2. 通信経路をシグナリングサーバーに送信できるようにイベントハンドラを登録する
            this.setOnicecandidateCallback();
            // 2-3. P2P確立後、通信相手のメディアストリーム情報の受信後、表示先のDOMを登録しておく
            this.setOntrack();
            // 2-4. SDP(offer)を作成する
            const sessionDescription = await this.createOffer();
            // 2-5. 作成したSDP(offer)を保存する
            await this.setLocalDescription(sessionDescription);
            // 2-6. SDP(offer)を送信する
            await this.databaseDirectRef.set({
              type: 'offer',
              sender: this.localPeerName,
              sessionDescription: this.localDescription,
            });
        } catch (e) {
            console.error(e);
        }
    }

    // 通信経路をシグナリングサーバーに送信できるようにイベントハンドラを登録する
    setOnicecandidateCallback() {
        this.rtcPeerConnection.onicecandidate = async ({ candidate }) => {
            if (candidate) {
                // remoteへcandidate(通信経路)を通知する
                await this.databaseDirectRef.set({
                    type: 'candidate',
                    sender: this.localPeerName,
                    candidate: candidate.toJSON(),
                });
            }
        };
    }
    // P2P確立後、通信相手のメディアストリーム情報の受信後、表示先のDOMを登録しておく
    setOntrack() {
        this.rtcPeerConnection.ontrack = (rtcTrackEvent) => {
            if (rtcTrackEvent.track.kind !== 'video') return;
            const remoteMediaStream = rtcTrackEvent.streams[0];
            this.remoteVideoRef.srcObject = remoteMediaStream;
        };
    }
    // SDP(offer)を作成する
    async createOffer() {
        try {
            return await this.rtcPeerConnection.createOffer();
        } catch (e) {
            console.error(e);
        }
    }
    // 作成したSDP(offer)を保存する
    async setLocalDescription(sessionDescription) {
        try {
            await this.rtcPeerConnection.setLocalDescription(sessionDescription);
        } catch (e) {
            console.error(e);
        }
    }

    // 3. BさんがAさんからofferを受信したらBさんはAさんにanswerを送信する
    async answer(sender, sessionDescription) {
        console.log("send answer")
        try {
            // 3-1. 相手の名前をアプリケーションに登録する
            this.remotePeerName = sender;
            // 3-2. 通信経路をシグナリングサーバーに送信できるようにイベントハンドラを登録する
            this.setOnicecandidateCallback();
            // 3-3. P2P確立後、通信相手のメディアストリーム情報の受信後、表示先のDOMを登録しておく
            this.setOntrack();
            // 3-4. 受信した相手のSDP(offer)を保存する
            await this.setRemoteDescription(sessionDescription);
            // 3-5. SDP(answer)を作成する
            const answer = await this.rtcPeerConnection.createAnswer();
            // 3-6. 作成したSDP(answer)を保存する
            await this.rtcPeerConnection.setLocalDescription(answer);
            // 3-7. SDP(answer)を送信する
            await this.databaseDirectRef.set({
                type: 'answer',
                sender: this.localPeerName,
                sessionDescription: this.localDescription,
            });
        } catch (e) {
            console.error(e);
        }
    }

    // 受信した相手のSDP(offer)を保存する
    async setRemoteDescription(sessionDescription) {
        await this.rtcPeerConnection.setRemoteDescription(sessionDescription);
    }

    // 4. AさんがBさんからanswerを受信する
    async saveReceivedSessionDescription(sessionDescription) {
        try {
            // 4-1. 受信した相手のSDP(answer)を保存する
            await this.setRemoteDescription(sessionDescription);
        } catch (e) {
            console.error(e);
        }
    }

    // 5. 相手の通信経路(candidate)を追加する
    async addIceCandidate(candidate) {
        try {
            const iceCandidate = new RTCIceCandidate(candidate);
            await this.rtcPeerConnection.addIceCandidate(iceCandidate);
        } catch (error) {
            console.error(error);
        }
    }
}