import { useEffect, useReducer } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import RtcClient from '@/utilities/RtcClient'
import { setRtcClient } from '@/store/slice/client'

const useRtcClient = () => {
  const dispatch = useDispatch()
  const { rtcClient } = useSelector((state) => state.client)
  const [, forceRender] = useReducer((boolean) => !boolean, false)

  const _setRtcClient = async (rtcClient: RtcClient) => {
    await dispatch(setRtcClient(rtcClient))
    forceRender()
  }

  useEffect(() => {
    const init = async () => {
      const rtcClient = new RtcClient(_setRtcClient)
      await rtcClient.setMediaStream()
      await dispatch(setRtcClient(rtcClient))
    }

    init()
  }, [])

  console.log(rtcClient)

  return rtcClient
}

export default useRtcClient