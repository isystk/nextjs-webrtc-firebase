import { createSlice } from '@reduxjs/toolkit'
import { RtcClient } from '@/store/StoreTypes'

export const ClientSlice = createSlice({
  name: 'client',
  initialState: {
    bool: false,
    rtcClient: null,
  },
  reducers: {
    toggleState(state?, action?) {
      state.bool = !state.bool
    },
    fetchRtcClient(state?, action?) {
      state.rtcClient = action.payload
    },
  },
})

// Actions
export const { toggleState, fetchRtcClient } = ClientSlice.actions

// 外部からはこの関数を呼んでもらう
export const forceRender = () => async (dispatch) => {
  dispatch(toggleState())
}
export const setRtcClient =
  (rtcClient: Partial<RtcClient>) => async (dispatch) => {
    dispatch(fetchRtcClient(rtcClient))
  }

export default ClientSlice.reducer
