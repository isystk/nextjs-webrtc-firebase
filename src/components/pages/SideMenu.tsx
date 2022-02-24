import React, { Dispatch, SetStateAction, VFC } from 'react'
import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import StopIcon from '@material-ui/icons/Stop'
import { useRouter } from 'next/router'
import RtcClient from '@/utilities/RtcClient'

type Props = {
  isMenuOpen: boolean
  setMenuOpen: Dispatch<SetStateAction<boolean>>
  rtcClient: RtcClient
}

const SideMenu: VFC<Props> = ({ isMenuOpen, setMenuOpen, rtcClient }) => {
  const router = useRouter()

  const RecoderIcon = rtcClient.recorder.isRecording
    ? StopIcon
    : FiberManualRecordIcon

  const menu = {
    '退出': [
      <ExitToAppIcon key={0} />,
      async () => {
        await rtcClient.disconnect()
        await router.push('/')
      },
    ],
    '全画面': [
      <FullscreenIcon key={0} />,
      () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen()
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen()
          }
        }
      },
    ],
    '録画': [
      <RecoderIcon key={0} />,
      async () => {
        if (rtcClient.recorder.isRecording) {
          await rtcClient.stopRecorder()
        } else {
          await rtcClient.startRecorder()
        }
      },
    ],
  }
  return (
    <Drawer open={isMenuOpen} onClose={() => setMenuOpen(!isMenuOpen)}>
      <div style={{ marginLeft: 'auto' }}>
        <IconButton onClick={() => setMenuOpen(!isMenuOpen)}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      <Divider />
      <List>
        {Object.keys(menu).map((key, index) => {
          const [icon, func] = menu[key]
          return (
              <ListItem button key={index} onClick={func}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={key} />
              </ListItem>
          )
        })}
      </List>
    </Drawer>
  )
}

export default SideMenu
