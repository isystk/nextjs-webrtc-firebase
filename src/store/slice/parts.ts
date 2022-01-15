import { createSlice } from '@reduxjs/toolkit'
import { Parts } from '@/store/StoreTypes'

export const PartsSlice = createSlice({
  name: 'parts',
  initialState: {
    isShowOverlay: false,
    isShowLoading: false,
    isSideMenuOpen: false,
  },
  reducers: {
    showOverlay: (state: Parts) => {
      state.isShowOverlay = true
    },
    hideOverlay: (state: Parts) => {
      state.isShowOverlay = false
    },
    showLoading: (state: Parts) => {
      state.isShowLoading = true
    },
    hideLoading: (state: Parts) => {
      state.isShowLoading = false
    },
    toggleMenu: (state: Parts) => {
      state.isSideMenuOpen = !state.isSideMenuOpen
    },
    closeMenu: (state: Parts) => {
      state.isSideMenuOpen = false
    },
  },
})

export const {
  showOverlay,
  hideOverlay,
  showLoading,
  hideLoading,
  toggleMenu,
  closeMenu,
} = PartsSlice.actions
export default PartsSlice.reducer
