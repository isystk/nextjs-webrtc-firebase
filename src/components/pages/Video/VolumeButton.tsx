import React, { MutableRefObject, VFC } from 'react'

import IconButton from '@material-ui/core/IconButton'
import VolumeOffIcon from '@material-ui/icons/VolumeOff'
import VolumeUpIcon from '@material-ui/icons/VolumeUp'
import { OverridableComponent } from '@material-ui/core/OverridableComponent'
import { SvgIconTypeMap } from '@material-ui/core'
import RtcClient from '@/services/RtcClient'

type Props = {
  isLocal: boolean
  muted: OverridableComponent<SvgIconTypeMap>
  refVolumeButton: MutableRefObject<null>
  rtcClient: RtcClient
  setMuted: (value: ((prevState: boolean) => boolean) | boolean) => void
}

const VolumeButton: VFC<Props> = ({
  isLocal,
  refVolumeButton,
  rtcClient,
  color = 'black',
}) => {
  const Icon = isLocal && rtcClient.self.muted ? VolumeOffIcon : VolumeUpIcon

  return (
    <IconButton
      aria-label="switch mute"
      onClick={async () => {
        if (isLocal) {
          // 音声のオン・オフを切り替える
          await rtcClient.toggleAudio()
        }
      }}
      ref={refVolumeButton}
    >
      <Icon style={{ fill: color }} />
    </IconButton>
  )
}

export default VolumeButton
