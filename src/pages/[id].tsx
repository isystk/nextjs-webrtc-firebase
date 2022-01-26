import React, { VFC, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import VideoArea from '@/components/pages/Video/VideoArea'
import {
    selectRtcClient
} from '@/store/slice/rtcClient'

const Room: VFC = () => {
    const { rtcClient } = useSelector(selectRtcClient)
    const router = useRouter()
    const [roomId, setRoomId] = useState('')
console.log(roomId)
    // この部分を追加
    useEffect(() => {
        // idがqueryで利用可能になったら処理される
        if (router.asPath !== router.route) {
            setRoomId(router.query.id)
        }
    }, [router])

    console.log(rtcClient)
    useEffect(() => {
        if (rtcClient !== null) {
            (async () => {
                await rtcClient.join(roomId)
            })()
        }
    }, [roomId])

    if (rtcClient === null) return <></>

    return (
        <>
            <VideoArea rtcClient={rtcClient} />
        </>
    )
}

export default Room