import Grid from '@material-ui/core/Grid'
import React, { useEffect, VFC } from 'react'
import RtcClient from '@/utilities/RtcClient'
import VideoLocal from './VideoLocal'
import VideoRemote from './VideoRemote'
import { makeStyles } from '@material-ui/core/styles'
import { useRouter } from 'next/router'
import FloatingBtn from "@/components/pages/FloatingBtn";
import BottomMenu from "@/components/pages/BottomMenu";
import ChatArea from "@/components/widgets/ChatArea";
import DisplayShare from "@/components/widgets/DisplayShare";

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
  const router = useRouter()
  const classes = useStyles()

  // この部分を追加
  useEffect(() => {
    // idがqueryで利用可能になったら処理される
    if (router.asPath !== router.route) {
      rtcClient.setRoomId(router.query.id + '')
    }
  }, [router])

  useEffect(() => {
    if (rtcClient.self.name === '') {
      router.push('/')
    }
  }, [rtcClient.self.name])

  useEffect(() => {
    if (rtcClient.self.name !== '' && rtcClient.room.name !== '') {
      ;(async () => {
        await rtcClient.setMediaStream()
        await rtcClient.join()
      })()
    }
  }, [rtcClient.self.name, rtcClient.room.name])

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

  if (rtcClient.self.name === '') return <></>
  if (rtcClient.room.name === '') return <></>

  return (
    <div className={classes.root}>
      <Grid container spacing={0}>
        <Grid item {...grid}>
          <VideoLocal rtcClient={rtcClient} />
        </Grid>
        {Object.keys(rtcClient.members).map(function (key, idx) {
          const member = rtcClient.members[key]
          return member.status === 'online' ? (
            <Grid item {...grid} key={idx}>
              <VideoRemote rtcClient={rtcClient} member={member} />
            </Grid>
          ) : (
            <></>
          )
        })}
      </Grid>
      <DisplayShare rtcClient={rtcClient} />
      <BottomMenu rtcClient={rtcClient} />
      <FloatingBtn rtcClient={rtcClient} />
      <ChatArea rtcClient={rtcClient} />
    </div>
  )
}

export default VideoArea
