import React, { Dispatch, SetStateAction, VFC } from 'react'
import {AppBar, Toolbar, IconButton, Button, MenuItem, Menu, Grid} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import { useState } from 'react'
import RtcClient from '../../utilities/RtcClient'
import {makeStyles} from "@material-ui/core/styles";

type Props = {
  isMenuOpen: boolean
  setMenuOpen: Dispatch<SetStateAction<boolean>>
  rtcClient: RtcClient
}

const useStyles = makeStyles((theme) => ({
  noTransform: {
    textTransform: 'none',  // #1
  },
}))

const CommonHeader: VFC<Props> = ({ isMenuOpen, setMenuOpen, rtcClient }) => {
  const DEAULT_TITLE = process.env.APP_NAME
  const [anchorEl, setAnchorEl] = useState(null)
  const classes = useStyles();

  return (
    <>
      <AppBar position="fixed" className="App-header">
        <Toolbar>
          <Grid container>
            <IconButton
              color="inherit"
              disabled={rtcClient.self.name === '' || rtcClient.room.name === ''}
              onClick={() => setMenuOpen(!isMenuOpen)}
            >
              <MenuIcon />
            </IconButton>
            <div className="App-logo">{rtcClient.room.name || DEAULT_TITLE}</div>
          </Grid>
          {(rtcClient.self.name === '') ? <></> :
                <Grid container justifyContent="flex-end" >
                  <Button color="inherit" aria-owns={anchorEl ? 'user-menu' : undefined} aria-haspopup="true"
                          onClick={(e) => setAnchorEl(e.currentTarget)} className={classes.noTransform}>
                    {rtcClient.self.name} さん
                  </Button>
                  <Menu
                      id="user-menu"
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClick={(e) => setAnchorEl(null)}
                  >
                    <MenuItem onClick={async () => {
                      await rtcClient.signOut()
                    }}>ログアウト</MenuItem>
                  </Menu>
                </Grid>
          }
        </Toolbar>
      </AppBar>
    </>
  )
}

export default CommonHeader
