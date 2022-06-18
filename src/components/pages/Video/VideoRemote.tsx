import React, { VFC, useRef } from 'react'

import Button from '@material-ui/core/Button'
import Video from './Video'
import RtcClient, { Member } from '@/services/RtcClient'

type Props = {
  rtcClient: RtcClient
  member: Member
}

const VideoRemote: VFC<Props> = ({ rtcClient, member }) => {
  const videoRef = useRef(null)

  if (rtcClient.room.name === '') return <></>

  return (
    <>
      <Video
        isLocal={false}
        member={member}
        rtcClient={rtcClient}
        videoRef={videoRef}
      />
    </>
  )
}

export default VideoRemote
