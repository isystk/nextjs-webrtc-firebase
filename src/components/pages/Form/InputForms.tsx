import Grid from '@material-ui/core/Grid'
import InputFormName from './InputFormName'
import InputFormRoom from './InputFormRoom'
import React, { useEffect, VFC } from 'react'
import RtcClient from '@/services/RtcClient'
import { useRouter } from 'next/router'
import DeviceSetting from '@/components/widgets/DeviceSetting'

type Props = {
  rtcClient: RtcClient
}

const InputForms: VFC<Props> = ({ rtcClient }) => {
  const router = useRouter()

  useEffect(() => {
    if (rtcClient.self.name && rtcClient.room.roomId) {
      router.push(rtcClient.room.roomId)
    }
  }, [rtcClient.self.name, rtcClient.room.roomId])

  return (
    <>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <InputFormName rtcClient={rtcClient} />
          <InputFormRoom rtcClient={rtcClient} />
        </Grid>
      </Grid>
      <DeviceSetting rtcClient={rtcClient} />
    </>
  )
}

export default InputForms
