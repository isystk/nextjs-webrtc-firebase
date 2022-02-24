import React from 'react'
import { Fab } from '@material-ui/core'
import VideocamIcon from '@material-ui/icons/Videocam'
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import ScreenShareIcon from '@material-ui/icons/ScreenShare'
import VolumeOffIcon from '@material-ui/icons/VolumeOff'
import VolumeUpIcon from '@material-ui/icons/VolumeUp'

const MenuBtn = ({ rtcClient }) => {
  // ブラウザの表示サイズに応じてビデオを表示する幅を取得する
  const VolumeIcon = rtcClient.self.muted ? VolumeOffIcon : VolumeUpIcon
  const VideoIcon = rtcClient.self.videoOff ? VideocamOffIcon : VideocamIcon
  const style = {
    margin: '0 10px',
  }
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '50%',
        transform: 'translate(50%, 0%)',
      }}
    >
      <Fab color="primary" style={style}>
        <VideoIcon
          onClick={async () => {
            await rtcClient.toggleVideo()
          }}
        />
      </Fab>
      <Fab color="primary" style={style}>
        <VolumeIcon
          onClick={async () => {
            // 音声のオン・オフを切り替える
            await rtcClient.toggleAudio()
          }}
        />
      </Fab>
      <Fab color="primary" style={style}>
        <ScreenShareIcon
          onClick={async () => {
            await rtcClient.startShare()
          }}
        />
      </Fab>
    </div>
  )
}
export default MenuBtn
