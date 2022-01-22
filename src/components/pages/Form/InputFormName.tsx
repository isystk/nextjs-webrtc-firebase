import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import RtcClient from '@/utilities/RtcClient'
import React, { VFC, useCallback, useEffect, useState } from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import Container from '@material-ui/core/Container'
import Button from '@material-ui/core/Button'

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}))

type Props = {
  rtcClient: RtcClient
}

const SignIn: VFC<Props> = ({ rtcClient }) => {
  const label = 'あなたの名前'
  const classes = useStyles()
  const [disabled, setDisabled] = useState(true)
  const [name, setName] = useState('')
  const [isComposed, setIsComposed] = useState(false)

  useEffect(() => {
    const disabled = name === ''
    setDisabled(disabled)
  }, [name])

  const initializeLocalPeer = useCallback(
    async (e) => {
      e.persist()
      await rtcClient.setLocalPeerName(name)
      e.preventDefault()
    },
    [name, rtcClient]
  )

  if (rtcClient.localPeerName !== '') return <></>

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          {label}を入力してください
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            autoFocus
            fullWidth
            label={label}
            margin="normal"
            name="name"
            onChange={(e) => setName(e.target.value)}
            onCompositionEnd={() => setIsComposed(false)}
            onCompositionStart={() => setIsComposed(true)}
            onKeyDown={async (e) => {
              if (isComposed) return
              if (e.target.value === '') return
              if (e.key === 'Enter') await initializeLocalPeer(e)
            }}
            required
            value={name}
            variant="outlined"
          />
          <Button
            className={classes.submit}
            color="primary"
            disabled={disabled}
            fullWidth
            onClick={async (e) => await initializeLocalPeer(e)}
            type="submit"
            variant="contained"
          >
            決定
          </Button>
        </form>
      </div>
    </Container>
  )
}

export default SignIn
