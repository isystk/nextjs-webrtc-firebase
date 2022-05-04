import React from 'react'
import { MemoryRouter } from 'react-router'
import { storiesOf } from '@storybook/react'
import RtcClient from '@/utilities/RtcClient'
import Header from '@/components/pages/Header'

storiesOf('commons/Header', module)
  .addDecorator((getStory) => <MemoryRouter>{getStory()}</MemoryRouter>)
  .addDecorator(story => {
    document.body.classList.add('App');
    return story();
  })
  .add('Logout', () => {
    const rtcClient = {
      room: {
        name: '',
      },
      self: {
        name: '',
      },
    } as RtcClient
    return <Header isMenuOpen={false} setMenuOpen={() => ({})} rtcClient={rtcClient} />
  })
  .add('Logined', () => {
    const rtcClient = {
      room: {
        name: 'sample',
      },
      self: {
        name: 'isystk',
      },
    } as RtcClient
    return <Header isMenuOpen={false} setMenuOpen={() => ({})} rtcClient={rtcClient} />
  })