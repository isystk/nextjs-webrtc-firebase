import {getDatabase} from './firebase'
import { Member } from './RtcClient'

interface WebRtcType {
    roomName: string,
    mediaStream: MediaStream,
    localPeerName: string,
    remotePeerName: string,
    rtcPeerConnection: RTCPeerConnection | null
}

export default class WebRtc implements WebRtcType {

    localPeerName: string;
    mediaStream: MediaStream;
    remotePeerName: string;
    roomName: string;
    rtcPeerConnection: RTCPeerConnection | null;

    static INITIAL_AUDIO_ENABLED = false;

    constructor(mediaStream: MediaStream, roomName: string, localPeerName: string, remotePeerName: string) {
        this.roomName = roomName;
        this.mediaStream = mediaStream;
        this.localPeerName = localPeerName;
        this.remotePeerName = remotePeerName;

        const config = {
            iceServers: [{urls: 'stun:stun.stunprotocol.org'}],
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
        this.audioTrack.enabled = WebRtc.INITIAL_AUDIO_ENABLED;
        this.rtcPeerConnection?.addTrack(this.audioTrack, this.mediaStream);
    }

    addVideoTrack() {
        this.rtcPeerConnection?.addTrack(this.videoTrack, this.mediaStream);
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
        return this.rtcPeerConnection?.localDescription?.toJSON();
    }

    get databaseDirectRef() {
        return getDatabase(this.roomName + '/_members_/' + this.remotePeerName);
    }

    get remoteVideoRef() {
        return <HTMLVideoElement>(document.querySelector(`#video-${this.remotePeerName}`))
    }

    disconnect() {
        if (this.rtcPeerConnection !== null) {
            this.rtcPeerConnection?.close()
            this.rtcPeerConnection = null
        }
    }

    // 2. AさんがBさんからjoinを受信したらAさんはBさんにofferを送信する
    async offer(member: Member) {
        try {
            // 2-2. 通信経路をシグナリングサーバーに送信できるようにイベントハンドラを登録する
            this.setOnicecandidateCallback();
            // 2-3. P2P確立後、通信相手のメディアストリーム情報の受信後、表示先のDOMを登録しておく
            this.setOntrack();
            // 2-4. SDP(offer)を作成する
            const sessionDescription = await this.createOffer();
            // 2-5. 作成したSDP(offer)を保存する
            if (sessionDescription !== undefined) {
                await this.setLocalDescription(sessionDescription);
            }
            // 2-6. SDP(offer)を送信する
            const data = {
                ...member,
                type: 'offer',
                sender: this.localPeerName,
                sessionDescription: this.localDescription,
            }
            console.log("send offer", data)
            await this.databaseDirectRef.set(data);
        } catch (e) {
            console.error(e);
        }
    }

    // 通信経路をシグナリングサーバーに送信できるようにイベントハンドラを登録する
    setOnicecandidateCallback() {
        if (this.rtcPeerConnection !== null) {
            this.rtcPeerConnection.onicecandidate = async ({candidate}) => {
                if (candidate) {
                    // remoteへcandidate(通信経路)を通知する
                    await this.databaseDirectRef.update({
                        type: 'candidate',
                        sender: this.localPeerName,
                        candidate: candidate.toJSON(),
                    });
                }
            };
        }
    }

    // P2P確立後、通信相手のメディアストリーム情報の受信後、表示先のDOMを登録しておく
    setOntrack() {
        if (this.rtcPeerConnection !== null) {
            this.rtcPeerConnection.ontrack = (rtcTrackEvent) => {
                if (rtcTrackEvent.track.kind !== 'video') return;
                const remoteMediaStream = rtcTrackEvent.streams[0];
                this.remoteVideoRef.srcObject = remoteMediaStream;
            };
        }
    }

    // SDP(offer)を作成する
    async createOffer() {
        try {
            if (this.rtcPeerConnection !== null) {
                return await (<RTCSessionDescriptionInit>this.rtcPeerConnection.createOffer());
            }
        } catch (e) {
            console.error(e);
        }
    }

    // 作成したSDP(offer)を保存する
    async setLocalDescription(sessionDescription: RTCSessionDescriptionInit) {
        try {
            if (this.rtcPeerConnection !== null) {
                await this.rtcPeerConnection.setLocalDescription(sessionDescription);
            }
        } catch (e) {
            console.error(e);
        }
    }

    // 3. BさんがAさんからofferを受信したらBさんはAさんにanswerを送信する
    async answer(sessionDescription: RTCSessionDescriptionInit) {
        try {
            // 3-2. 通信経路をシグナリングサーバーに送信できるようにイベントハンドラを登録する
            this.setOnicecandidateCallback();
            // 3-3. P2P確立後、通信相手のメディアストリーム情報の受信後、表示先のDOMを登録しておく
            this.setOntrack();
            // 3-4. 受信した相手のSDP(offer)を保存する
            await this.setRemoteDescription(sessionDescription);
            // 3-5. SDP(answer)を作成する
            if (this.rtcPeerConnection !== null) {
                const answer = await this.rtcPeerConnection.createAnswer();
                // 3-6. 作成したSDP(answer)を保存する
                await this.rtcPeerConnection.setLocalDescription(answer);
            }
            // 3-7. SDP(answer)を送信する
            const data = {
                type: 'answer',
                sender: this.localPeerName,
                sessionDescription: this.localDescription,
            }
            console.log("send answer", data)
            await this.databaseDirectRef.update(data);
        } catch (e) {
            console.error(e);
        }
    }

    // 受信した相手のSDP(offer)を保存する
    async setRemoteDescription(sessionDescription: RTCSessionDescriptionInit) {
        if (this.rtcPeerConnection !== null) {
            await this.rtcPeerConnection.setRemoteDescription(sessionDescription);
        }
    }

    // 4. AさんがBさんからanswerを受信する
    async saveReceivedSessionDescription(sessionDescription: RTCSessionDescriptionInit) {
        try {
            // 4-1. 受信した相手のSDP(answer)を保存する
            await this.setRemoteDescription(sessionDescription);
        } catch (e) {
            console.error(e);
        }
    }

    // 5. 相手の通信経路(candidate)を追加する
    async addIceCandidate(candidate: RTCIceCandidateInit) {
        try {
            if (this.rtcPeerConnection !== null) {
                const iceCandidate = new RTCIceCandidate(candidate);
                await this.rtcPeerConnection.addIceCandidate(iceCandidate);
            }
        } catch (error) {
            console.error(error);
        }
    }

}