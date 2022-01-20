import React, { useEffect, useRef } from 'react';

import Button from '@material-ui/core/Button';
import Video from './Video';

const VideoRemote = ({ rtcClient }) => {
  const videoRef = useRef(null);

  if (!rtcClient.members || rtcClient.roomName === '') return <></>;

  return (
      <>
        <Video
            isLocal={false}
            name={rtcClient.members}
            rtcClient={rtcClient}
            videoRef={videoRef}
        />
        <Button
            color="primary"
            onClick={() => rtcClient.sendTarget(rtcClient.members)}
            type="submit"
            variant="contained"
        >
          送信
        </Button>
      </>
  );
};

export default VideoRemote;
