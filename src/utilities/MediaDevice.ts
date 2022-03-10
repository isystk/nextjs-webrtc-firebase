import RtcClient from '@/utilities/RtcClient'

export type Device = {
  deviceId: string
}

export default class MediaDevice {
  rtcClient: RtcClient

  mediaStream: MediaStream | null
  isOpen: boolean
  videoInput: Device | null
  audioInput: Device | null
  audioOutput: Device | null

  constructor(rtcClient: RtcClient) {
    this.rtcClient = rtcClient

    this.mediaStream = null
    this.isOpen = false
    this.videoInput = null
    this.audioInput = null
    this.audioOutput = null
  }

  async openMediaDevice() {
    this.isOpen = true
    await this.rtcClient.setRtcClient()
  }

  async closeMediaDevice() {
    this.isOpen = false
    await this.rtcClient.setRtcClient()
  }

  async setMediaDevice(deviceId: string, kind: string) {
    if (kind === 'videoinput') {
      this.videoInput = { deviceId }
    }
    if (kind === 'audioinput') {
      this.audioInput = { deviceId }
    }
    if (kind === 'audiooutput') {
      this.audioOutput = { deviceId }
    }

    await this.setMediaStream()

    await this.rtcClient.setRtcClient()
  }

  // カメラの使用許可を取得する
  async setMediaStream() {
    let constraint = { audio: true, video: true } as {
      audio: boolean | { deviceId: string }
      video: boolean | { deviceId: string }
    }
    if (this.audioInput) {
      constraint = {
        ...constraint,
        audio: { deviceId: this.audioInput.deviceId },
      }
    }
    if (this.videoInput) {
      constraint = {
        ...constraint,
        video: { deviceId: this.videoInput.deviceId },
      }
    }
    try {
      if (this.mediaStream) {
        // 既にメディアストリームがある場合は停止させる
        this.mediaStream.getTracks().forEach((track) => track.stop())
        this.mediaStream = null
      }
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraint)
    } catch (error) {
      console.error(error)
    }
    await this.rtcClient.setRtcClient()
  }
}
