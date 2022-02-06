import React, { MutableRefObject, VFC } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import VolumeOffIcon from '@material-ui/icons/VolumeOff'
import VolumeUpIcon from '@material-ui/icons/VolumeUp'
import { OverridableComponent } from '@material-ui/core/OverridableComponent'
import { SvgIconTypeMap } from '@material-ui/core'
import RtcClient from '@/utilities/RtcClient'

const useStyles = makeStyles({
  icon: {
    height: 19,
    width: 19,
  },
})

type Props = {
  isLocal: boolean
  muted: OverridableComponent<SvgIconTypeMap>
  refVolumeButton: MutableRefObject<null>
  rtcClient: RtcClient
  setMuted: (value: ((prevState: boolean) => boolean) | boolean) => void
}

const VolumeButton: VFC<Props> = ({
  isLocal,
  muted,
  refVolumeButton,
  rtcClient,
  setMuted,
}) => {
  const Icon = muted ? VolumeOffIcon : VolumeUpIcon
  const classes = useStyles()

  return (
    <IconButton
      aria-label="switch mute"
      onClick={() => {
        if (isLocal) {
          // 音声のオン・オフを切り替える
          setMuted((previousState) => !previousState)
          rtcClient.toggleAudio()
        }
      }}
      ref={refVolumeButton}
    >
      <Icon className={classes.icon} />
    </IconButton>
  )
}

export default VolumeButton
