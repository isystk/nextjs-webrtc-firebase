import React, { VFC, useRef, useEffect } from 'react'

import Main from '@/services/main'
import Modal from '@/components/widgets/Modal'

type Props = {
  rtcClient: Main
}

const DisplayShare: VFC<Props> = ({ rtcClient }) => {
  const videoRef = useRef(null)
  const currentVideoRef = videoRef.current
  const mediaStream = rtcClient.share.mediaStream

  // useEffect(() => {
  //     window.setTimeout(async () => {
  //         await rtcClient.setAppRoot()
  //     }, 500)
  //     if (currentVideoRef === null) return
  //     currentVideoRef.srcObject = mediaStream;
  // }, [currentVideoRef, mediaStream])

  return (
    <Modal
      isOpen={rtcClient.share.clientId}
      handleClose={() => rtcClient.share.stopShare()}
    >
      <video autoPlay muted={true} ref={videoRef} width="100%" id="share" />
    </Modal>
  )
}

export default DisplayShare
