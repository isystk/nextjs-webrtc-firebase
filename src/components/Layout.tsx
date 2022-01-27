import React, { FC, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Header from '@/components/pages/Header'
import Footer from '@/components/pages/Footer'
import SideMenu from '@/components/pages/SideMenu'
import { useSelector } from 'react-redux'
import { Client } from '@/store/StoreTypes'

type Props = {
  children: React.ReactElement;
}

const Layout: FC<Props> = ({children}) => {
  const [windowHeight, setWindowHeight] = useState(0)
  useEffect(() => {
    setWindowHeight(window.innerHeight)
  }, [])

  const [isMenuOpen, setMenuOpen] = useState(false)

  const { client } = useSelector((state: {client: Client}) => state.client)

  if (!client) return <></>
  const newProps = { children , client}
  const childrenWithProps = React.Children.map(children, (child: React.ReactElement) => React.cloneElement(child, { ...newProps }));

  return (
      <>
        <Header
            isMenuOpen={isMenuOpen}
            setMenuOpen={setMenuOpen}
            client={client}
        />
        <div style={appStyle(windowHeight)}>
          {childrenWithProps}
        </div>
        <Footer />
        <SideMenu
            isMenuOpen={isMenuOpen}
            setMenuOpen={setMenuOpen}
            client={client}
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
