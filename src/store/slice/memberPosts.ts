import { createSlice } from '@reduxjs/toolkit'
import { API_ENDPOINT } from '@/common/constants/api'
import { API } from '@/utilities'
import * as _ from 'lodash'
import { Post } from '@/store/StoreTypes'

const requestGetMemberPosts = async (userId: string) => {
  const response = await API.get(`${API_ENDPOINT.POSTS}?userId=${userId}`)
  return { response }
}

const requestGetMemberPost = async (id: string) => {
  const response = await API.get(`${API_ENDPOINT.POSTS}/${id}`)
  return { response }
}

const requestPostMemberPost = async (values: Post) => {
  const response = await API.post(`${API_ENDPOINT.POSTS}`, values)
  return { response }
}

const requestPutMemberPost = async (id: string, values: Post) => {
  const response = await API.put(`${API_ENDPOINT.POSTS}/${id}`, values)
  return { response }
}

const requestDeleteMemberPost = async (id: string) => {
  await API.del(`${API_ENDPOINT.POSTS}/${id}`)
  return { id }
}

const memberPostsSlice = createSlice({
  name: 'member_posts',
  initialState: { loading: false, error: null, items: [] },
  reducers: {
    // 通信を開始した時に呼ぶ関数
    fetchStart(state?, action?) {
      state.loading = true
      state.error = null
    },
    // 通信が失敗した時に呼ぶ関数
    fetchFailure(state?, action?) {
      state.loading = false
      state.error = action.payload
    },
    fetchMemberPosts(state?, action?) {
      state.loading = false
      state.error = null
      state.items = _.mapKeys(action.payload.response, 'id')
    },
    fetchMemberPost(state?, action?) {
      state.loading = false
      state.error = null
      const post = action.payload.response
      state.items = { ...state.items, [post.id]: post }
    },
    unfetchMemberPost(state?, action?) {
      state.loading = false
      state.error = null
      const id = action.payload.response
      delete state.items[id]
      state.items = { ...state.items }
    },
  },
})

// Actions
export const {
  fetchStart,
  fetchFailure,
  fetchMemberPosts,
  fetchMemberPost,
  unfetchMemberPost,
} = memberPostsSlice.actions

const request = (func) => async (dispatch) => {
  try {
    dispatch(fetchStart())
    dispatch(func)
  } catch (error) {
    dispatch(fetchFailure(error.stack))
  }
}

// 外部からはこの関数を呼んでもらう
export const getMemberPosts = (userId: string) => async (dispatch) => {
  dispatch(request(fetchMemberPosts(await requestGetMemberPosts(userId))))
}
export const getMemberPost = (id: string) => async (dispatch) => {
  dispatch(request(fetchMemberPost(await requestGetMemberPost(id))))
}
export const postMemberPost = (value: Post) => async (dispatch) => {
  dispatch(request(fetchMemberPost(await requestPostMemberPost(value))))
}
export const putMemberPost = (id: string, value: Post) => async (dispatch) => {
  dispatch(request(fetchMemberPost(await requestPutMemberPost(id, value))))
}
export const deleteMemberPost = (id: string) => async (dispatch) => {
  dispatch(request(unfetchMemberPost(await requestDeleteMemberPost(id))))
}

// Selectors
export const selectMemberPosts = ({ memberPosts }) => memberPosts

export default memberPostsSlice.reducer
