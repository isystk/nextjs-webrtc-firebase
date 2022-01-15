import React from 'react'
import renderer from 'react-test-renderer'
import { CommonHeader } from '../Header'

test('Header', () => {
  const component = renderer.create(<CommonHeader />)
  const tree = component.toJSON()

  expect(tree).toMatchSnapshot()
})
