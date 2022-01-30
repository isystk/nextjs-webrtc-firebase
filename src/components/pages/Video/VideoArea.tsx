import Grid from '@material-ui/core/Grid'
import React, {useEffect, useState, VFC} from 'react'
import RtcClient from '@/utilities/RtcClient'
import VideoLocal from './VideoLocal'
import VideoRemote from './VideoRemote'
import { makeStyles } from '@material-ui/core/styles'
import {useRouter} from "next/router";

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
  rtcClient: RtcClient
}

const VideoArea: VFC<Props> = ({ rtcClient }) => {
  // console.log('VideoArea Render', rtcClient )
  const router = useRouter()
  const classes = useStyles()

  // この部分を追加
  useEffect(() => {
    // idがqueryで利用可能になったら処理される
    if (router.asPath !== router.route) {
      rtcClient.setRoomName(router.query.id+'')
    }
  }, [router])

  useEffect(() => {
    if (rtcClient.roomName !== '') {
      if (rtcClient.self.name === '') {
        router.push('/')
      } else {
        (async () => {
          await rtcClient.setMediaStream()
          await rtcClient.join()
        })()
      }
    }
  }, [rtcClient.roomName])

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
