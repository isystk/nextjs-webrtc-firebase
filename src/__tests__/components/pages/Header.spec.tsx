import React, { useState } from 'react'
import renderer from 'react-test-renderer'
import Header from '@/components/pages/Header'
import '@testing-library/jest-dom/extend-expect'
import { renderHook } from '@testing-library/react-hooks'
import Main from '@/services/main'

describe('Header', () => {
  it('Match Snapshot', () => {
    const stateRtcClient = renderHook(() => useState<Main | null>(null))
    const [, setAppRoot] = stateRtcClient.result.current
    const rtcClient = new Main(setAppRoot)
    const stateMenuOpen = renderHook(() => useState<boolean>(false))
    const [isMenuOpen, setMenuOpen] = stateMenuOpen.result.current
    if (rtcClient === null) return
    const component = renderer.create(
      <Header
        isMenuOpen={isMenuOpen}
        setMenuOpen={setMenuOpen}
        rtcClient={rtcClient}
      />
    )
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})
