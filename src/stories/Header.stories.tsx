import React from 'react'
import { MemoryRouter } from 'react-router'
import { storiesOf } from '@storybook/react'
import MainService from '@/services/main'
import Header from '@/components/pages/Header'

storiesOf('commons/Header', module)
  .addDecorator((getStory) => <MemoryRouter>{getStory()}</MemoryRouter>)
  .addDecorator((story) => {
    document.body.classList.add('App')
    return story()
  })
  .add('Logout', () => {
    const mainService = {
      room: {
        name: '',
      },
      self: {
        name: '',
      },
    } as MainService
    return (
      <Header
        isMenuOpen={false}
        setMenuOpen={() => ({})}
        rtcClient={mainService}
      />
    )
  })
  .add('Logined', () => {
    const rtcClient = {
      room: {
        name: 'sample',
      },
      self: {
        name: 'isystk',
      },
    } as MainService
    return (
      <Header
        isMenuOpen={false}
        setMenuOpen={() => ({})}
        rtcClient={rtcClient}
      />
    )
  })
