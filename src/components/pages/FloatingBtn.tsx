import React from 'react';
import {Fab} from "@material-ui/core";
import AddIcon from 'material-ui/svg-icons/content/add';

const FloatingBtn = () => {
  const style = {
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
  };
  return (
    <Fab color="primary" aria-label="add" style={style}>
      <AddIcon style={{ fill: "white" }} />
    </Fab>
  )
};
export default FloatingBtn;