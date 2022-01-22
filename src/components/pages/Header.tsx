import React, { Dispatch, SetStateAction, VFC } from 'react'
import { AppBar, Toolbar, IconButton } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import RtcClient from '../../utilities/RtcClient'

type Props = {
  isMenuOpen: boolean
  setMenuOpen: Dispatch<SetStateAction<boolean>>
  rtcClient: RtcClient
}

const CommonHeader: VFC<Props> = ({ isMenuOpen, setMenuOpen, rtcClient }) => {
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
