import React, { VFC, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import VideoLocal from './VideoLocal'
import VideoRemote from './VideoRemote'
import { Client } from '@/store/StoreTypes'
import { setClient } from '@/store/slice/client'
import useRtcClient from "@/hooks/useRtcClient";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}))

type Props = {
  client: Client
}

const VideoArea: VFC<Props> = () => {
  const dispatch = useDispatch()
  const { client } = useSelector((state: {client: Client}) => state.client)
  const rtcClient = useRtcClient()
  const classes = useStyles()
  const router = useRouter()
  const [roomId, setRoomId] = useState('')

  useEffect(() => {
      // idがqueryで利用可能になったら処理される
      if (router.asPath !== router.route) {
          setRoomId(router.query.id)
      }
  }, [router])

  useEffect(() => {
      if (roomId && rtcClient) {
          (async () => {
              await dispatch(setClient({roomName: roomId}))
              await rtcClient.join(roomId, client.name)
          })()
      }
  }, [roomId, rtcClient])

  if (rtcClient === null) return <></>

  const grids = {
    0: { xs: 12, sm: 6, md: 6 },
    1: { xs: 12, sm: 6, md: 6 },
    2: { xs: 12, sm: 6, md: 6 },
    3: { xs: 12, sm: 6, md: 6 },
    4: { xs: 12, sm: 4, md: 4 },
    5: { xs: 12, sm: 4, md: 4 },
    6: { xs: 12, sm: 3, md: 3 },
    7: { xs: 12, sm: 3, md: 3 },
  }
  const grid = grids[Math.min(Object.keys(rtcClient.members).length, 7)]

  return (
    <div className={classes.root}>
      <Grid container spacing={0}>
        <Grid item {...grid}>
          <VideoLocal rtcClient={rtcClient} />
        </Grid>
        {Object.keys(rtcClient.members).map(function (key, idx) {
          return (
            <Grid item {...grid} key={idx}>
              <VideoRemote
                rtcClient={rtcClient}
                member={rtcClient.members[key]}
              />
            </Grid>
          )
        })}
      </Grid>
    </div>
  )
}

export default VideoArea
