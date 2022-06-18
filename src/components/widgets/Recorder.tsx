import React, { VFC, useRef, useEffect } from 'react'

import RtcClient from '@/services/RtcClient'
import Modal from '@/components/widgets/Modal'

type Props = {
  rtcClient: RtcClient
}

const Recorder: VFC<Props> = ({ rtcClient }) => {
  useEffect(() => {
    if (!rtcClient.recorder.isOpen) return

    window.setTimeout(() => {
      const videoBlob = new Blob(rtcClient.recorder.chunks, {
        type: 'video/webm',
      })
      const blobUrl = window.URL.createObjectURL(videoBlob)

      const playbackVideo = document.getElementById('recorder-play')
      if (playbackVideo) {
        console.log('playing', playbackVideo)
        if (playbackVideo.src) {
          window.URL.revokeObjectURL(playbackVideo.src) // 解放
          playbackVideo.src = null
        }
        playbackVideo.src = blobUrl
        playbackVideo.play()
      }
      const downloadVideo = document.getElementById('recorder-download')
      if (downloadVideo) {
        downloadVideo.download = 'recorded.webm'
        downloadVideo.href = blobUrl
      }
    }, 1000)
  }, [rtcClient.recorder.isOpen])

  return (
    <Modal
      isOpen={rtcClient.recorder.isOpen}
      handleClose={() => rtcClient.recorder.closeRecorder()}
    >
      <video controls width="100%" id="recorder-play" />
      <a href="#" id="recorder-download">
        download
      </a>
    </Modal>
  )
}

export default Recorder
