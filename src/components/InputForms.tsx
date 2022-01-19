import React from 'react';

import InputFormName from './InputFormName';
import InputFormRoom from './InputFormRoom';

const InputForms = ({ rtcClient }) => {
  if (rtcClient === null) return <></>;

  return (
    <>
      <InputFormName rtcClient={rtcClient} />
      <InputFormRoom rtcClient={rtcClient} />
    </>
  );
};

export default InputForms;
