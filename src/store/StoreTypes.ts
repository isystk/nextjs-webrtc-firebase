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
