import * as React from 'react'
import RtcClient from "@/utilities/RtcClient";
import Modal from "@/components/widgets/Modal";

// ↓ 表示用のデータ型
interface IProps {
    rtcClient: RtcClient
}

const ChatArea = ({rtcClient}: IProps) => {
  return (
    <Modal isOpen={rtcClient.chat.isOpen} handleClose={() => rtcClient.closeChat()} >
        <div className="chat-area">
            <div id="bms_messages_container">
                <div id="bms_messages">
                    <div className="bms_message bms_left">
                        <div className="bms_message_box">
                            <div className="bms_message_content">
                                <div className="bms_message_text">ほうほうこりゃー便利じゃないか</div>
                            </div>
                        </div>
                    </div>
                    <div className="bms_clear"></div>
                    <div className="bms_message bms_right">
                        <div className="bms_message_box">
                            <div className="bms_message_content">
                                <div className="bms_message_text">うん、まあまあいけとるな</div>
                            </div>
                        </div>
                    </div>
                    <div className="bms_clear"></div>
                    <div className="bms_message bms_right">
                        <div className="bms_message_box">
                            <div className="bms_message_content">
                                <div className="bms_message_text">うん、まあまあいけとるな</div>
                            </div>
                        </div>
                    </div>
                    <div className="bms_clear"></div>
                    <div className="bms_message bms_right">
                        <div className="bms_message_box">
                            <div className="bms_message_content">
                                <div className="bms_message_text">うん、まあまあいけとるな</div>
                            </div>
                        </div>
                    </div>
                    <div className="bms_clear"></div>
                    <div className="bms_message bms_right">
                        <div className="bms_message_box">
                            <div className="bms_message_content">
                                <div className="bms_message_text">うん、まあまあいけとるな</div>
                            </div>
                        </div>
                    </div>
                    <div className="bms_clear"></div>
                    <div className="bms_message bms_right">
                        <div className="bms_message_box">
                            <div className="bms_message_content">
                                <div className="bms_message_text">うん、まあまあいけとるな</div>
                            </div>
                        </div>
                    </div>
                    <div className="bms_clear"></div>
                    <div className="bms_message bms_right">
                        <div className="bms_message_box">
                            <div className="bms_message_content">
                                <div className="bms_message_text">うん、まあまあいけとるな</div>
                            </div>
                        </div>
                    </div>
                    <div className="bms_clear"></div>
                    <div className="bms_message bms_right">
                        <div className="bms_message_box">
                            <div className="bms_message_content">
                                <div className="bms_message_text">うん、まあまあいけとるな</div>
                            </div>
                        </div>
                    </div>
                    <div className="bms_clear"></div>
                    <div className="bms_message bms_right">
                        <div className="bms_message_box">
                            <div className="bms_message_content">
                                <div className="bms_message_text">うん、まあまあいけとるな</div>
                            </div>
                        </div>
                    </div>
                    <div className="bms_clear"></div>
                    <div className="bms_message bms_right">
                        <div className="bms_message_box">
                            <div className="bms_message_content">
                                <div className="bms_message_text">うん、まあまあいけとるな</div>
                            </div>
                        </div>
                    </div>
                    <div className="bms_clear"></div>
                    <div className="bms_message bms_right">
                        <div className="bms_message_box">
                            <div className="bms_message_content">
                                <div className="bms_message_text">うん、まあまあいけとるな</div>
                            </div>
                        </div>
                    </div>
                    <div className="bms_clear"></div>
                </div>
                <div id="bms_send">
                    <textarea id="bms_send_message"></textarea>
                    <div id="bms_send_btn">送信</div>
                </div>
            </div>
        </div>
    </Modal>
  )
}

export default ChatArea