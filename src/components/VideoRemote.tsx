import React, { useEffect, useRef } from 'react';
import Video from './Video';

const VideoRemote = ({ rtcClient }) => {
  const videoRef = useRef(null);

  if (!rtcClient.members || rtcClient.roomName === '') return <></>;

  return (
    <Video
      isLocal={false}
      name={rtcClient.members}
      rtcClient={rtcClient}
      videoRef={videoRef}
    />
  );
};

export default VideoRemote;
