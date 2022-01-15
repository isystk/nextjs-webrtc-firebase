import React, { useState, useEffect } from 'react'
import Room from './Room'
import Entrance from './Entrance'
import Header from '@/components/Commons/Header'
import Footer from '@/components/Commons/Footer'
import InputForms from '@/components/InputForms'
import VideoArea from '@/components/VideoArea'
import useRtcClient from './hooks/useRtcClient';

export const MenuContext = React.createContext({} as MenuContextProps)
export type MenuContextProps = {
  isMenuOpen: boolean
  setMenuOpen: (string) => void
  roomName: string
  setRoomName: (string) => void
}

const Home = () => {
  const rtcClient = useRtcClient();
  const [windowHeight, setWindowHeight] = useState(0)
  useEffect(() => {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      window.navigator.mozGetUserMedia
    setWindowHeight(window.innerHeight)
  }, [])

  const [roomName, setRoomName] = useState('')
  const [isMenuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    if (!roomName) {
      setMenuOpen(false)
    }
  }, [roomName])

  const props: MenuContextProps = {
    isMenuOpen,
    setMenuOpen,
    roomName,
    setRoomName,
  }
  return (
    <>
      <MenuContext.Provider value={props}>
        <Header />
        <div style={appStyle(windowHeight)}>
          <InputForms rtcClient={rtcClient} />
          <VideoArea rtcClient={rtcClient} />
        </div>
        <Footer />
      </MenuContext.Provider>
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
