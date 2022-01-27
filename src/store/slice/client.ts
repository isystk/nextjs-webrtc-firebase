import { createSlice } from '@reduxjs/toolkit'
import { Client } from '@/store/StoreTypes'

export const ClientSlice = createSlice({
  name: 'client',
  initialState: {
    client: {
      roomName: '',
      clientId: undefined,
      name: ''
    }
  },
  reducers: {
    fetchclient(state?, action?) {
      state.client = {...state.client, ...action.payload};
    },
  },
})

// Actions
export const {
  fetchclient,
} = ClientSlice.actions

// 外部からはこの関数を呼んでもらう
export const setClient = (client: Partial<Client>) => async (dispatch) => {
  dispatch(fetchclient(client))
}

export default ClientSlice.reducer
