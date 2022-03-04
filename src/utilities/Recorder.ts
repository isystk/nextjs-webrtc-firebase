import RtcClient from '@/utilities/RtcClient'

export default class Recorder {
  rtcClient: RtcClient

  // @ts-ignore
  mediaRecorder: MediaRecorder | null
  isRecording: boolean
  isOpen: boolean
  chunks: []

  constructor(rtcClient: RtcClient) {
    this.rtcClient = rtcClient
    this.mediaRecorder = null
    this.isRecording = false
    this.isOpen = false
    this.chunks = []
  }

  // 録画の開始
  async startRecorder() {
    if (this.isRecording) {
      alert('録画中です')
      return
    }
    // @ts-ignore
    const videoStream = await navigator.mediaDevices.getDisplayMedia({
      audio: true, // PCからの音声
      video: true, // PCの画面キャプチャ
    })
    const audioStream = await navigator.mediaDevices.getUserMedia({
      video: false, // 外部カメラからの映像
      audio: true, // マイクからの音声
    })
    const mediaStream = new MediaStream([
      ...videoStream.getTracks(),
      ...audioStream.getTracks(),
    ])
    // @ts-ignore
    this.mediaRecorder = new MediaRecorder(mediaStream, {
      videoBitsPerSecond: 512000, // 512kbits / sec
      mimeType: 'video/webm; codecs=vp9',
    })
    // @ts-ignore
    this.mediaRecorder.ondataavailable = (e) => {
      // 録画が終了したタイミングで呼び出される
      console.log('record start')
      // @ts-ignore
      this.chunks.push(e.data)
    }
    // 録画開始
    this.isRecording = true
    this.mediaRecorder.start()
    await this.rtcClient.setRtcClient()
  }

  // 録画の停止
  async stopRecorder() {
    // 録画ファイルのダウンロード
    console.log('record download')

    this.mediaRecorder.onstop = async () => {
      this.mediaRecorder = null
      this.isRecording = false
      this.isOpen = true
      await this.rtcClient.setRtcClient()
    }
    this.mediaRecorder.stop()

    await this.rtcClient.setRtcClient()
  }
  // 録画モーダルを閉じる
  async closeRecorder() {
    this.isOpen = false
    await this.rtcClient.setRtcClient()
  }
}
