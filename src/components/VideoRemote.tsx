import React, { useEffect, useRef } from 'react';
import Video from './Video';

const VideoRemote = ({ rtcClient }) => {
  const videoRef = useRef(null);
  const currentVideoRef = videoRef.current;

  useEffect(() => {
    if (currentVideoRef === null) return;

    const connet = async () => {
      // リモートのvideoタグに受信した映像を投影する
      await rtcClient.setRemoteVideoRef(videoRef)
    };

    connet();
  }, [currentVideoRef]);

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
