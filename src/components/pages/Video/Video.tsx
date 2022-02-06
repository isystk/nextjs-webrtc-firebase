import React, {
  VFC,
  useEffect,
  useRef,
  useState,
  MutableRefObject,
} from 'react'
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Typography,
} from '@material-ui/core'
import RtcClient, { Member } from '@/utilities/RtcClient'
import AudioAnalyser from './AudioAnalyser'
import VolumeButton from './VolumeButton'
import useDimensions from '@/store/useDimentions'

type Props = {
  isLocal: boolean
  member: Member
  rtcClient: RtcClient
  videoRef: MutableRefObject<null>
}

const Video: VFC<Props> = ({ isLocal, member, rtcClient, videoRef }) => {
  const [muted, setMuted] = useState(rtcClient.initialAudioMuted)
  const refCard = useRef(null)
  // ブラウザの表示サイズに応じてビデオを表示する幅を取得する
  const dimensionsCard = useDimensions(refCard)
  const refVolumeButton = useRef(null)
  const dimensionsVolumeButton = useDimensions(refVolumeButton)

  // if (videoRef.current)
  //   console.log({ isLocal, muted, srcObject: videoRef.current.srcObject });

  useEffect(() => {
    window.setTimeout(() => {
      rtcClient.setRtcClient()
    }, 500)
  }, [])

  return (
    <Card ref={refCard}>
      <CardActionArea>
        <video
          autoPlay
          muted={isLocal || muted}
          ref={videoRef}
          width={dimensionsCard.width}
          id={`video-${member.clientId}`}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h3">
            {member.name}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <VolumeButton
          isLocal={isLocal}
          muted={muted}
          refVolumeButton={refVolumeButton}
          rtcClient={rtcClient}
          setMuted={setMuted}
        />
        {!muted && videoRef.current && videoRef.current.srcObject && (
          <AudioAnalyser
            audio={videoRef.current.srcObject}
            width={dimensionsCard.width - dimensionsVolumeButton.width - 40}
          />
        )}
      </CardActions>
    </Card>
  )
}

export default Video
