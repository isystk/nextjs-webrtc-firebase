import React, { useEffect, useRef } from 'react';

import Button from '@material-ui/core/Button';
import Video from './Video';

const VideoRemote = ({ rtcClient }) => {
  const videoRef = useRef(null);

  if (Object.keys(rtcClient.members).length === 0 || rtcClient.roomName === '') return <></>;

  const videos = Object.keys(rtcClient.members).map(function(key, idx) {
    const member = rtcClient.members[key]
    return (
        <div key={idx}>
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
        </div>
    )
  });

  return (
      <>
          {videos}
      </>
  );
};

export default VideoRemote;
