import { createSlice } from '@reduxjs/toolkit'
import { RtcClient } from '@/store/StoreTypes'

export const ClientSlice = createSlice({
  name: 'client',
  initialState: {
    rtcClient: null
  },
  reducers: {
    fetchRtcClient(state?, action?) {
      state.rtcClient = action.payload;
    },
  },
})

// Actions
export const {
  fetchRtcClient,
} = ClientSlice.actions

// 外部からはこの関数を呼んでもらう
export const setRtcClient = (rtcClient: Partial<RtcClient>) => async (dispatch) => {
  dispatch(fetchRtcClient(rtcClient))
}

export default ClientSlice.reducer
