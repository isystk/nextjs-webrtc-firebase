import React, {Dispatch, SetStateAction, useEffect, useState, VFC} from 'react'
import PropTypes from 'prop-types'
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
import { useRouter } from 'next/router'
import RtcClient from '@/utilities/RtcClient'

type Props = {
  isMenuOpen: boolean
  setMenuOpen: Dispatch<SetStateAction<boolean>>
  rtcClient: RtcClient
}

const SideMenu: VFC<Props> = ({ isMenuOpen, setMenuOpen, rtcClient }) => {
  const router = useRouter()
  const menu = {
    'Exit room': [
      <ExitToAppIcon key={0} />,
      async () => {
        await rtcClient.disconnect()
        await router.push('/')
      },
    ],
    'Full screen': [<FullscreenIcon key={0} />,
      () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      }],
  }
  const getIcon = (text) => (menu[text] ? menu[text][0] : <div />)

  const getMethod = (text) => (menu[text] ? menu[text][1] : () => ({}))

  const onClickItem = (text) => {
    setMenuOpen(!isMenuOpen)
    getMethod(text).apply()
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
        {['Full screen'].map(
          (text, index) => (
            <ListItem button key={index} onClick={() => onClickItem(text)}>
              <ListItemIcon>{getIcon(text)}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          )
        )}
      </List>
      <Divider />
      <List>
        {['Exit room'].map((text, index) => (
          <ListItem button key={index} onClick={() => onClickItem(text)}>
            <ListItemIcon>{getIcon(text)}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  )
}

SideMenu.propTypes = {
  onCaptureStart: PropTypes.func,
  onCameraStart: PropTypes.func,
  onVideoStop: PropTypes.func,
  onCall: PropTypes.func,
  onBye: PropTypes.func,
  onMute: PropTypes.func,
  onFullScreen: PropTypes.func,
}

export default SideMenu
