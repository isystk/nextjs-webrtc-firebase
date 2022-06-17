import React from 'react'
import { MemoryRouter } from 'react-router'
import { storiesOf } from '@storybook/react'
import Footer from '@/components/pages/Footer'

storiesOf('commons/Footer', module)
  .addDecorator((getStory) => <MemoryRouter>{getStory()}</MemoryRouter>)
  .addDecorator((story) => {
    document.body.classList.add('App')
    return story()
  })
  .add('default', () => <Footer />)
