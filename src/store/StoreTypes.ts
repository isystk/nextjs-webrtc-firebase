import WebRtc from '@/utilities/WebRtc'
import RtcClient from '@/utilities/RtcClient'

export type Data<T> = {
  id: string
  data: T
}

export type Posts = {
  [id: string]: Data<Post>
}

export type Post = {
  userId: string
  title: string
  description: string
  regist_datetime: Date | null
  photo: string
}

export type Parts = {
  isShowOverlay: boolean
  isShowLoading: boolean
  isSideMenuOpen: boolean
}

export type self = {
  clientId?: string
  name: string
}
export type Member = {
  clientId: string
  name: string
  webRtc: WebRtc | null
}
type Members = {
  [key: string]: Member
}
export type RtcClientType = {
  _setRtcClient: (rtcClient: RtcClient) => void
  roomName: string
  mediaStream: MediaStream | null
  self: self
  members: Members
}
