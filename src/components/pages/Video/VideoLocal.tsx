import React, { VFC, useEffect, useRef } from 'react'

import Button from '@material-ui/core/Button'
import Video from './Video'
import Main from '@/services/main'

type Props = {
  rtcClient: Main
}

const VideoLocal: VFC<Props> = ({ rtcClient }) => {
  const videoRef = useRef(null)
  const currentVideoRef = videoRef.current
  const mediaStream = rtcClient.mediaDevice.mediaStream

  useEffect(() => {
    if (currentVideoRef === null) return

    const getMedia = () => {
      try {
        // ローカルのVideoタグに自分を投影する
        currentVideoRef.srcObject = mediaStream
      } catch (err) {
        console.error(err)
      }
    }

    getMedia()
  }, [currentVideoRef, mediaStream])

  if (rtcClient.self.name === '' || rtcClient.room.name === '') return <></>

  return (
    <>
      <Video
        isLocal={true}
        member={rtcClient.self}
        rtcClient={rtcClient}
        videoRef={videoRef}
      />
    </>
  )
}

export default VideoLocal
