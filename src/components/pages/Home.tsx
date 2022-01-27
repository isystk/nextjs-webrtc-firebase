import React, { VFC } from 'react'
import InputForms from '@/components/pages/Form/InputForms'
import VideoArea from '@/components/pages/Video/VideoArea'

const Home: VFC = ({rtcClient}) => {

  if (rtcClient === null) return <></>

  return (
    <>
      <InputForms rtcClient={rtcClient} />
      <VideoArea rtcClient={rtcClient} />
    </>
  )
}

export default Home
