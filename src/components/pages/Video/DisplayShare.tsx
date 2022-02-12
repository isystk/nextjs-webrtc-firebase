import React, {VFC, useRef, useEffect} from 'react'

import RtcClient from '@/utilities/RtcClient'
import useDimensions from "@/store/useDimentions";

type Props = {
  rtcClient: RtcClient
}

const DisplayShare: VFC<Props> = ({ rtcClient }) => {
  const videoRef = useRef(null)
  const currentVideoRef = videoRef.current
  const mediaStream = rtcClient.share.mediaStream

  useEffect(() => {
      window.setTimeout(async () => {
          await rtcClient.setRtcClient()
      }, 500)
      if (currentVideoRef === null) return
      currentVideoRef.srcObject = mediaStream;
  }, [currentVideoRef, mediaStream])

  if (!rtcClient.share.clientId) return <></>

  return (
    <>
      <video
          autoPlay
          muted={true}
          ref={videoRef}
          width='100%'
          id='share'
       />
    </>
  )
}

export default DisplayShare
