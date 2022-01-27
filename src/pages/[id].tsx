import React, { VFC } from 'react'
import VideoArea from '@/components/pages/Video/VideoArea'
import Layout from '@/components/Layout'

const Room: VFC = ({ rtcClient }) => {

    if (rtcClient === null) return <></>

    return (
        <Layout>
            <VideoArea rtcClient={rtcClient} />
        </Layout>
    )
}

export default Room