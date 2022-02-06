import { useEffect, useReducer } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import RtcClient from '@/utilities/RtcClient'
import { forceRender, setRtcClient } from '@/store/slice/client'

const useRtcClient = () => {
  const dispatch = useDispatch()
  const { rtcClient } = useSelector((state: { client }) => state.client)
  // const [, forceRender] = useReducer((boolean) => !boolean, false)

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
