import RtcClient from '@/utilities/RtcClient'
import ShareWebRtc from '@/utilities/ShareWebRtc'

export default class DisplayShare {
  rtcClient: RtcClient

  clientId?: string
  mediaStream: MediaStream | null
  webRtc: ShareWebRtc | null

  constructor(rtcClient: RtcClient) {
    this.rtcClient = rtcClient

    this.clientId = undefined
    this.mediaStream = null
    this.webRtc = null
  }

  // 画面共有を開始する
  async startShare() {
    try {
      // @ts-ignore
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: true,
      })

      // joinを初期化する
      await this.rtcClient.databaseJoinRef().remove()

      // メンバーに画面共有を追加する
      const key = await this.rtcClient.databaseMembersRef().push({
        type: 'share',
      }).key
      const self = {
        clientId: key,
        name: this.rtcClient.self.name + '(画面共有)',
      }
      if (self.clientId !== null) {
        await this.rtcClient.databaseMembersRef(self.clientId).update(self)

        this.rtcClient
          .databaseJoinRef(self.clientId)
          .on('value', async (snapshot) => {
            const data = snapshot.val()
            if (data === null) return
            const { type, clientId } = data
            switch (type) {
              case 'accept':
                console.log('receive share accept', data)
                await this.addShare(clientId, data.shareClientId)
                this.webRtc?.addTracks(mediaStream)
                await this.webRtc?.offer()
                break
              default:
                break
            }
          })
        // 自分の通信が切断されたらFirebaseから自分を削除
        await this.rtcClient
          .databaseMembersRef(self.clientId)
          .onDisconnect()
          .remove()
      }

      if (key) {
        await this.rtcClient.databaseJoinRef(key).set({
          ...this.rtcClient.self,
          type: 'share',
          shareClientId: self.clientId,
        })
      }

      window.setTimeout(async () => {
        const shareVideoRef = <HTMLVideoElement>document.querySelector('#share')
        shareVideoRef.srcObject = mediaStream
      }, 1000)

      await this.rtcClient.setRtcClient()
    } catch (error) {
      console.error(error)
    }
  }

  async stopShare() {
    this.webRtc?.disconnect()
    this.clientId = undefined
    this.mediaStream = null
    this.webRtc = null

    // TODO 画面共有の終了処理

    await this.rtcClient.setRtcClient()
  }

  async addShare(shareClientId: string, clientId: string) {
    console.log('addShare', shareClientId, clientId)
    if (this.rtcClient.self.clientId && this.rtcClient.room.roomId) {
      this.clientId = shareClientId
      this.webRtc = new ShareWebRtc(
        this.rtcClient.room.roomId,
        shareClientId,
        clientId
      )
      await this.webRtc.startListening()
    }
    await this.rtcClient.setRtcClient()
  }
}
