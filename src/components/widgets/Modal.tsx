import React, { FC } from 'react'
import PropTypes from 'prop-types'
import Portal from './Portal'
import RtcClient from "@/utilities/RtcClient";
import CloseIcon from '@material-ui/icons/Close';
import {Fab} from "@material-ui/core";

type Props = {
  rtcClient: RtcClient
}

const Modal: FC<Props> = ({children, isOpen, rtcClient}) => {

  const onClose = async (e) => {
    e.preventDefault()
    await rtcClient.closeChat()
  }

  return (
    <Portal>
      {isOpen && <div id="overlay-background"></div>}
      <div className={`overlay ${isOpen ? 'open' : ''}`}>
        <Fab color="default" aria-label="add"  style={{position: 'absolute', top: '-25px', right: '-25px'}}>
          <CloseIcon
            onClick={onClose}
          >
            <span aria-hidden="true">&times;</span>
          </CloseIcon>
        </Fab>
        <div className="wrap">
          {children}
        </div>
      </div>
    </Portal>
  )
}

Modal.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
    .isRequired,
}

export default Modal
