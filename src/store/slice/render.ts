import { createSlice } from '@reduxjs/toolkit'

export const RenderSlice = createSlice({
  name: 'render',
  initialState: {
    bool: false,
  },
  reducers: {
    toggleState(state?, action?) {
      state.bool = !state.bool
    },
  },
})

// Actions
export const { toggleState } = RenderSlice.actions

// 外部からはこの関数を呼んでもらう
export const forceRender = () => async (dispatch) => {
  dispatch(toggleState())
}

export default RenderSlice.reducer
