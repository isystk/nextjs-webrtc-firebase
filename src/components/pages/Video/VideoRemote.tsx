import React, { VFC, useRef } from 'react';

import Button from '@material-ui/core/Button';
import Video from './Video';
import RtcClient from "@/utilities/RtcClient";

type Props = {
    rtcClient: RtcClient,
}

const VideoRemote: VFC<Props> = ({ rtcClient, member }) => {
  const videoRef = useRef(null);

  if (rtcClient.roomName === '') return <></>;

  return (
      <>
        <Video
            isLocal={false}
            member={member}
            rtcClient={rtcClient}
            videoRef={videoRef}
        />
        <Button
            color="primary"
            onClick={() => rtcClient.sendTarget(member.clientId)}
            type="submit"
            variant="contained"
        >
            送信
        </Button>
      </>
  );
};

export default VideoRemote;
