import React, { VFC } from 'react'
import { Fab } from '@material-ui/core'
import AddIcon from 'material-ui/svg-icons/content/add'
import RtcClient from '@/services/RtcClient'

type Props = {
  rtcClient: RtcClient
}

const FloatingBtn: VFC<Props> = ({ rtcClient }) => {
  const style = {
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  }
  return (
    <Fab color="primary" aria-label="add" style={style}>
      <AddIcon
        onClick={async () => {
          await rtcClient.chat.openChat()
        }}
        style={{ fill: 'white' }}
      />
    </Fab>
  )
}
export default FloatingBtn
