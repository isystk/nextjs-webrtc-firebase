import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';

const useStyles = makeStyles({
  icon: {
    height: 38,
    width: 38,
  },
});

const VolumeButton = ({
  isLocal,
  muted,
  refVolumeButton,
  rtcClient,
  setMuted,
}) => {
  const Icon = muted ? VolumeOffIcon : VolumeUpIcon;
  const classes = useStyles();

  return (
    <IconButton
      aria-label="switch mute"
      onClick={() => {
        setMuted((previousState) => !previousState);
        if (isLocal) rtcClient.toggleAudio();
      }}
      ref={refVolumeButton}
    >
      <Icon className={classes.icon} />
    </IconButton>
  );
};

export default VolumeButton;
