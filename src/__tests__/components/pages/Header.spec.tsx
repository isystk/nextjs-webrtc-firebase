import React, { useState } from 'react'
import renderer from 'react-test-renderer'
import Header from '@/components/pages/Header'
import '@testing-library/jest-dom/extend-expect'
import { renderHook } from '@testing-library/react-hooks'
import RtcClient from '@/services/RtcClient'

describe('Header', () => {
  it('Match Snapshot', () => {
    const stateRtcClient = renderHook(() => useState<RtcClient | null>(null))
    const [, setRtcClient] = stateRtcClient.result.current
    const rtcClient = new RtcClient(setRtcClient)
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
