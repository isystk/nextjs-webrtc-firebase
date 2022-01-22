import { useEffect, useReducer, useState } from 'react'
import RtcClient from '@/utilities/RtcClient'

const useRtcClient = () => {
  const [rtcClient, _setRtcClient] = useState<RtcClient | null>(null)
  const [, forceRender] = useReducer((boolean) => !boolean, false)

  const setRtcClient = (rtcClient: RtcClient) => {
    _setRtcClient(rtcClient)
    forceRender()
  }

  useEffect(() => {
    const init = async () => {
      const client = new RtcClient(setRtcClient)
      await client.setMediaStream()
    }

    init()
  }, [])

  return rtcClient
}

export default useRtcClient
