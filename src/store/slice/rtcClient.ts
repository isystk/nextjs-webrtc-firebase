import { createSlice } from '@reduxjs/toolkit'
import { RtcClientType } from '@/store/StoreTypes'

export const RtcClientSlice = createSlice({
  name: 'rtcClient',
  initialState: {
    rtcClient: {
      _setRtcClient: null,
      roomName: '',
      mediaStream: null,
      self: {clientId: undefined, name: ''},
      members: {}
    }
  },
  reducers: {
    fetchRtcClient(state?, action?) {
      state.rtcClient = {... action.payload};
    },
  },
})

// Actions
export const {
  fetchRtcClient,
} = RtcClientSlice.actions

// 外部からはこの関数を呼んでもらう
export const setRtcClient = (rtcClient: RtcClientType) => async (dispatch) => {
  dispatch(fetchRtcClient(rtcClient))
}

// Selectors
export const selectRtcClient = ({ rtcClient }) => rtcClient

export default RtcClientSlice.reducer
