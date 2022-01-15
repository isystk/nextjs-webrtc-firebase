import React, { FC } from 'react'
import { AppBar, Toolbar, IconButton } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import { MenuContext, MenuContextProps } from '@/components/Home'

export const CommonHeader: FC = () => {
  const DEAULT_TITLE = process.env.APP_NAME
  return (
    <MenuContext.Consumer>
      {(value: MenuContextProps) => {
        const { isMenuOpen, setMenuOpen, roomName } = value
        return (
          <>
            <AppBar position="fixed" className="App-header">
              <Toolbar>
                <IconButton
                  color="inherit"
                  disabled={!roomName}
                  onClick={() => setMenuOpen(!isMenuOpen)}
                >
                  <MenuIcon />
                </IconButton>
                <div className="App-logo">{roomName || DEAULT_TITLE}</div>
              </Toolbar>
            </AppBar>
          </>
        )
      }}
    </MenuContext.Consumer>
  )
}

export default CommonHeader
