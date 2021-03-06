import React from 'react'
import renderer from 'react-test-renderer'
import Footer from '@/components/pages/Footer'

test('Footer', () => {
  const component = renderer.create(<Footer />)
  const tree = component.toJSON()

  expect(tree).toMatchSnapshot()
})
