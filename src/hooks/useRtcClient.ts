import { useEffect, useReducer } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import RtcClient from '@/utilities/RtcClient'
import { setRtcClient } from '@/store/slice/client'
import { forceRender } from '@/store/slice/render'

const useRtcClient = () => {
  const dispatch = useDispatch()
  const { rtcClient } = useSelector((state: { client }) => state.client)
  // const [, forceRender] = useReducer((boolean) => !boolean, false)
  const { render } = useSelector((state: { render }) => state.render)

  const _setRtcClient = async (rtcClient: RtcClient) => {
    await dispatch(setRtcClient(rtcClient))
    // forceRender()
    await dispatch(forceRender())
  }

  useEffect(() => {
    const init = async () => {
      const _rtcClient = new RtcClient(_setRtcClient)
      await _rtcClient.setRtcClient()
    }
    if (!rtcClient) {
      init()
    }
  }, [])

  return rtcClient
}

export default useRtcClient
