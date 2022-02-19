import * as React from 'react'
import RtcClient from '@/utilities/RtcClient'
import Modal from '@/components/widgets/Modal'
import { Button, TextField } from '@material-ui/core'
import { useCallback, useEffect, useState } from 'react'

// ↓ 表示用のデータ型
interface IProps {
  rtcClient: RtcClient
}

const ChatArea = ({ rtcClient }: IProps) => {
  const label = 'メッセージを入力してください'
  const [disabled, setDisabled] = useState(true)
  const [message, setMessage] = useState('')
  const [isComposed, setIsComposed] = useState(false)

  useEffect(() => {
    const disabled = message === ''
    setDisabled(disabled)
  }, [message])

  const initializeLocalPeer = useCallback(
    async (e) => {
      e.persist()
      await rtcClient.sendChat(message)
      setMessage('')
      e.preventDefault()
    },
    [message, rtcClient]
  )

  return (
    <Modal
      isOpen={rtcClient.chat.isOpen}
      handleClose={() => rtcClient.closeChat()}
    >
      <div className="chat-area">
        <div id="bms_messages_container">
          <div id="bms_messages">
            {rtcClient.chat.messages.map((message, index) => {
              return (
                <div key={index}>
                  <div
                    className={`bms_message ${
                      message.clientId === rtcClient.self.clientId
                        ? 'bms_left'
                        : 'bms_right'
                    }`}
                  >
                    <div className="bms_message_box">
                      <div className="bms_message_content">
                        <div className="bms_message_text">{message.text}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bms_clear"></div>
                </div>
              )
            })}
          </div>
          <div>
            <TextField
              className="bms_send_message"
              autoFocus
              fullWidth
              label={label}
              name="message"
              onChange={(e) => setMessage(e.target.value)}
              onCompositionEnd={() => setIsComposed(false)}
              onCompositionStart={() => setIsComposed(true)}
              onKeyDown={async (e) => {
                if (isComposed) return
                if (e.target.value === '') return
                if (e.key === 'Enter') await initializeLocalPeer(e)
              }}
              required
              value={message}
              variant="outlined"
            />
            <Button
              className="bms_send_btn"
              color="primary"
              disabled={disabled}
              fullWidth
              onClick={async (e) => await initializeLocalPeer(e)}
              type="submit"
              variant="contained"
            >
              送信
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ChatArea
