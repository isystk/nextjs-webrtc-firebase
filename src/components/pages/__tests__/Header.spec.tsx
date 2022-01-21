import React, {useState} from 'react'
import renderer from 'react-test-renderer'
import Header from '../Header'
import RtcClient from '../../../utilities/RtcClient';

test('Header', () => {
  const [, _setRtcClient] = useState<RtcClient | null>(null);
  const rtcClient = new RtcClient(_setRtcClient);
  const [isMenuOpen, setMenuOpen] = useState(false)
  const component = renderer.create(<Header isMenuOpen={isMenuOpen} setMenuOpen={setMenuOpen} rtcClient={rtcClient} />)
  const tree = component.toJSON()

  expect(tree).toMatchSnapshot()
})
