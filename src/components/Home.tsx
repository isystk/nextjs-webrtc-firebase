import React, { useState, useEffect } from 'react'
import Header from '@/components/Commons/Header'
import Footer from '@/components/Commons/Footer'
import InputForms from '@/components/InputForms'
import VideoArea from '@/components/VideoArea'
import useRtcClient from './hooks/useRtcClient';
import Drawer from './CustomDrawer'

const Home = () => {
  const rtcClient = useRtcClient();
  const [windowHeight, setWindowHeight] = useState(0)
  useEffect(() => {
    setWindowHeight(window.innerHeight)
  }, [])

  const [isMenuOpen, setMenuOpen] = useState(false)

  if (rtcClient === null) return <></>;

  return (
    <>
      <Header isMenuOpen={isMenuOpen} setMenuOpen={setMenuOpen} rtcClient={rtcClient} />
      <div style={appStyle(windowHeight)}>
        <InputForms rtcClient={rtcClient} />
        <VideoArea rtcClient={rtcClient} />
      </div>
      <Footer />
      <Drawer isMenuOpen={isMenuOpen} setMenuOpen={setMenuOpen} rtcClient={rtcClient} />
    </>
  )
}

const appStyle = (vh) => {
  return {
    height: vh,
    width: '100vw',
    overflow: 'scroll',
    display: 'flex',
    justifyContent: 'center',
  }
}

export default Home
