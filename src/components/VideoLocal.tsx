import React, { useEffect, useRef } from 'react';

import Button from '@material-ui/core/Button';
import Video from './Video';

const VideoLocal = ({ rtcClient }) => {
  const videoRef = useRef(null);
  const currentVideoRef = videoRef.current;
  const mediaStream = rtcClient.mediaStream;

  useEffect(() => {
    if (currentVideoRef === null) return;

    const getMedia = () => {
      try {
        // ローカルのVideoタグに自分を投影する
        currentVideoRef.srcObject = mediaStream;
      } catch (err) {
        console.error(err);
      }
    };

    getMedia();
  }, [currentVideoRef, mediaStream]);

  if (rtcClient.localPeerName === '' || rtcClient.roomName === '')
    return <></>;

  return (
      <>
        <Video
            isLocal={true}
            member={{sender: rtcClient.localPeerName}}
            rtcClient={rtcClient}
            videoRef={videoRef}
        />
        <Button
            color="primary"
            onClick={() => rtcClient.sendAll()}
            type="submit"
            variant="contained"
        >
          みんなに送信
        </Button>
      </>
  );
};

export default VideoLocal;
