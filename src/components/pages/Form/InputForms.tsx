import React, { VFC } from 'react'
import Grid from '@material-ui/core/Grid'

import InputFormName from './InputFormName'
import InputFormRoom from './InputFormRoom'
import RtcClient from '@/utilities/RtcClient'

type Props = {
  rtcClient: RtcClient
}

const InputForms: VFC<Props> = ({ rtcClient }) => {
  if (rtcClient === null || rtcClient.roomName !== '') return <></>

  return (
    <Grid container spacing={0}>
      <Grid item xs={12}>
        <InputFormName rtcClient={rtcClient} />
        <InputFormRoom rtcClient={rtcClient} />
      </Grid>
    </Grid>
  )
}

export default InputForms
