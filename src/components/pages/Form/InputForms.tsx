import React, { VFC } from 'react'
import Grid from '@material-ui/core/Grid'
import InputFormName from './InputFormName'
import InputFormRoom from './InputFormRoom'
import { useSelector } from 'react-redux'
import { Client } from '@/store/StoreTypes'

type Props = {
  client: Client
}

const InputForms: VFC<Props> = () => {
  const { client } = useSelector((state: {client: Client}) => state.client)
  if (!client || client.roomName !== '') return <></>

  return (
    <Grid container spacing={0}>
      <Grid item xs={12}>
        <InputFormName />
        <InputFormRoom />
      </Grid>
    </Grid>
  )
}

export default InputForms
