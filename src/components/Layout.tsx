import React, { FC, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import useRtcClient from '@/hooks/useRtcClient'
import Header from '@/components/pages/Header'
import Footer from '@/components/pages/Footer'
import SideMenu from '@/components/pages/SideMenu'

const Layout: FC = ({ children }) => {
  const rtcClient = useRtcClient()
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [windowHeight, setWindowHeight] = useState(0)

  useEffect(() => {
    setWindowHeight(window.innerHeight)
  }, [])

  if (!rtcClient) return <></>

  const newProps = { children, rtcClient }
  const childrenWithProps = React.Children.map(
    children,
    (child: React.ReactElement) => React.cloneElement(child, { ...newProps })
  )

  return (
    <>
      <Header
        isMenuOpen={isMenuOpen}
        setMenuOpen={setMenuOpen}
        rtcClient={rtcClient}
      />
      <div style={appStyle(windowHeight)}>{childrenWithProps}</div>
      <Footer />
      <SideMenu
        isMenuOpen={isMenuOpen}
        setMenuOpen={setMenuOpen}
        rtcClient={rtcClient}
      />
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    .isRequired,
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
export default Layout
