import * as React from 'react'

// ↓ 表示用のデータ型
interface IProps {
}

const ChatArea = ({ }: IProps) => {
  return (
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
  )
}

export default ChatArea