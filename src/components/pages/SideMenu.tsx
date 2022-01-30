import React, { useContext } from 'react'
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
import VideocamIcon from '@material-ui/icons/Videocam'
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import ScreenShareIcon from '@material-ui/icons/ScreenShare'
import StopIcon from '@material-ui/icons/Stop'
import { useRouter } from 'next/router'

const SideMenu = ({ isMenuOpen, setMenuOpen, rtcClient }) => {
  const router = useRouter()
  const menu = {
    'Exit room': [
      <ExitToAppIcon key={0} />,
      () => {
        rtcClient.disconnect()
        router.push('/')
      },
    ],
    'Stream cam': [<VideocamIcon key={0} />, () => ({})],
    'Stream screen': [<ScreenShareIcon key={0} />, () => ({})],
    'Stop Stream': [<StopIcon key={0} />, () => ({})],
    'Full screen': [<FullscreenIcon key={0} />, () => ({})],
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
        {['Stream cam', 'Stream screen', 'Stop Stream', 'Full screen'].map(
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
