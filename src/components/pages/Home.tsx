import React, { VFC, useState, useEffect } from 'react'
import Header from '@/components/pages/Header'
import Footer from '@/components/pages/Footer'
import InputForms from '@/components/pages/Form/InputForms'
import VideoArea from '@/components/pages/Video/VideoArea'
import useRtcClient from '@/hooks/useRtcClient'
import SideMenu from './SideMenu'

const Home: VFC = () => {
  const rtcClient = useRtcClient()
  const [windowHeight, setWindowHeight] = useState(0)
  useEffect(() => {
    setWindowHeight(window.innerHeight)
  }, [])

  const [isMenuOpen, setMenuOpen] = useState(false)

  if (!rtcClient) return <></>

  return (
    <>
      <Header
        isMenuOpen={isMenuOpen}
        setMenuOpen={setMenuOpen}
        rtcClient={rtcClient}
      />
      <div style={appStyle(windowHeight)}>
        <InputForms rtcClient={rtcClient} />
        <VideoArea rtcClient={rtcClient} />
      </div>
      <Footer />
      <SideMenu
        isMenuOpen={isMenuOpen}
        setMenuOpen={setMenuOpen}
        rtcClient={rtcClient}
      />
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
