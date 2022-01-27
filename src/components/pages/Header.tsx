import React, { Dispatch, SetStateAction, VFC } from 'react'
import { AppBar, Toolbar, IconButton } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'
import { useSelector } from 'react-redux'
import { Client } from '@/store/StoreTypes'

type Props = {
  isMenuOpen: boolean
  setMenuOpen: Dispatch<SetStateAction<boolean>>
  client: Client
}

const CommonHeader: VFC<Props> = ({ isMenuOpen, setMenuOpen }) => {
  const { client } = useSelector((state: {client: Client}) => state.client)
  const DEAULT_TITLE = process.env.APP_NAME
  return (
    <>
      <AppBar position="fixed" className="App-header">
        <Toolbar>
          <IconButton
            color="inherit"
            disabled={!client.roomName}
            onClick={() => setMenuOpen(!isMenuOpen)}
          >
            <MenuIcon />
          </IconButton>
          <div className="App-logo">{client.roomName || DEAULT_TITLE}</div>
        </Toolbar>
      </AppBar>
    </>
  )
}

export default CommonHeader
