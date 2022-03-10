import RtcClient from '@/utilities/RtcClient'

export default class MediaDevice {
  rtcClient: RtcClient

  isOpen: boolean
  videoInput: string | null
  audioInput: string | null
  audioOutput: string | null

  constructor(rtcClient: RtcClient) {
    this.rtcClient = rtcClient
    this.isOpen = false;
    this.videoInput = null;
    this.audioInput = null;
    this.audioOutput = null;
  }

}
