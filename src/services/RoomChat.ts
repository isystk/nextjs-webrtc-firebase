import Main from '@/services/main'

export type Chat = {
  isOpen: boolean
  messages: ChatMessage[]
}
export type ChatMessage = {
  text: string
  clientId: string
  datetime: Date
}

export default class RoomChat {
  rtcClient: Main

  isOpen: boolean
  messages: ChatMessage[]

  constructor(rtcClient: Main) {
    this.rtcClient = rtcClient
    this.isOpen = false
    this.messages = []
  }

  // チャットの表示・非表示を切り替える
  async openChat() {
    this.isOpen = true
    await this.rtcClient.setAppRoot()
  }

  async closeChat() {
    this.isOpen = false
    await this.rtcClient.setAppRoot()
  }

  async sendChat(text: string) {
    const message = {
      type: 'chat',
      text,
      clientId: this.rtcClient.self.clientId,
      datetime: new Date(),
    } as ChatMessage
    this.messages = [...this.messages, message]
    await this.rtcClient.databaseBroadcastRef.set(message)

    await this.rtcClient.setAppRoot()
  }

  async receiveChat(message: ChatMessage) {
    this.messages = [...this.messages, message]
    await this.rtcClient.setAppRoot()
  }
}
