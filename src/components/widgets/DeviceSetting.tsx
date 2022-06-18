import React, { VFC, useRef, useEffect, useState } from 'react'

import Select from '@material-ui/core/Select'
import RtcClient from '@/services/RtcClient'
import Modal from '@/components/widgets/Modal'
import { CssBaseline, InputLabel, MenuItem } from '@material-ui/core'
import Container from '@material-ui/core/Container'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  form: {
    position: 'absolute',
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
    margin: 'auto',
    width: '80%',
    height: '16rem',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}))

type Props = {
  rtcClient: RtcClient
}

const DeviceSetting: VFC<Props> = ({ rtcClient }) => {
  const classes = useStyles()
  const [videoInput, setVideoInput] = useState([])
  const [videoInputDefault, setVideoInputDefault] = useState('')
  const [audioInput, setAudioInput] = useState([])
  const [audioInputDefault, setAudioInputDefault] = useState('')
  const [audioOutput, setAudioOutput] = useState([])
  const [audioOutputDefault, setAudioOutputDefault] = useState('')

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then(function (devices) {
        const videoinput = devices.filter((e) => e.kind === 'videoinput')
        const audioinput = devices.filter((e) => e.kind === 'audioinput')
        const audiooutput = devices.filter((e) => e.kind === 'audiooutput')

        devices.forEach((e) => {
          if (e.deviceId === 'default') {
            if (e.kind === 'videoinput') setVideoInputDefault(e.deviceId)
            if (e.kind === 'audioinput') setAudioInputDefault(e.deviceId)
            if (e.kind === 'audiooutput') setAudioOutputDefault(e.deviceId)
          }
        })

        setVideoInput(videoinput)
        setAudioInput(audioinput)
        setAudioOutput(audiooutput)
      })
      .catch(function (err) {
        // エラー発生時
        console.error('enumerateDevide ERROR:', err)
      })
  }, [])

  const changeDevice = async (e, kind) => {
    await rtcClient.mediaDevice.setMediaDevice(e.target.value, kind)
  }

  return (
    <Modal
      isOpen={rtcClient.mediaDevice.isOpen}
      handleClose={() => rtcClient.mediaDevice.closeMediaDevice()}
    >
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <form className={classes.form} noValidate>
          <InputLabel style={{ textAlign: 'left', marginTop: '20px' }}>
            カメラ入力
          </InputLabel>
          <Select
            fullWidth
            defaultValue={videoInputDefault}
            value={rtcClient.mediaDevice.videoInput?.deviceId}
            onChange={(e) => changeDevice(e, 'videoinput')}
          >
            {videoInput.map((item) => (
              <MenuItem value={item.deviceId} key={item.deviceId}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
          <InputLabel style={{ textAlign: 'left', marginTop: '20px' }}>
            音声入力
          </InputLabel>
          <Select
            fullWidth
            defaultValue={audioInputDefault}
            value={rtcClient.mediaDevice.audioInput?.deviceId}
            onChange={(e) => changeDevice(e, 'audioinput')}
          >
            {audioInput.map((item) => (
              <MenuItem value={item.deviceId} key={item.deviceId}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
          <InputLabel style={{ textAlign: 'left', marginTop: '20px' }}>
            音声出力
          </InputLabel>
          <Select
            fullWidth
            defaultValue={audioOutputDefault}
            value={rtcClient.mediaDevice.audioOutput?.deviceId}
            onChange={(e) => changeDevice(e, 'audiooutput')}
          >
            {audioOutput.map((item) => (
              <MenuItem value={item.deviceId} key={item.deviceId}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
        </form>
      </Container>
    </Modal>
  )
}

export default DeviceSetting
