import React, { FC } from 'react'
import { AppBar, Toolbar, IconButton } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'

const CommonHeader: FC = ({ isMenuOpen, setMenuOpen, rtcClient }) => {
  const DEAULT_TITLE = process.env.APP_NAME
  return (
    <>
      <AppBar position="fixed" className="App-header">
        <Toolbar>
          <IconButton
            color="inherit"
            disabled={!rtcClient.roomName}
            onClick={() => setMenuOpen(!isMenuOpen)}
          >
            <MenuIcon />
          </IconButton>
          <div className="App-logo">{rtcClient.roomName || DEAULT_TITLE}</div>
        </Toolbar>
      </AppBar>
    </>
  )
}

export default CommonHeader
