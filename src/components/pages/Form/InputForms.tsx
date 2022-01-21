import React from 'react';
import Grid from '@material-ui/core/Grid';

import InputFormName from './InputFormName';
import InputFormRoom from './InputFormRoom';

const InputForms = ({ rtcClient }) => {
  if (rtcClient === null || rtcClient.roomName !== '') return <></>;

  return (
    <Grid container spacing={0}>
        <Grid item xs={12}>
            <InputFormName rtcClient={rtcClient} />
            <InputFormRoom rtcClient={rtcClient} />
        </Grid>
    </Grid>
  );
};

export default InputForms;
