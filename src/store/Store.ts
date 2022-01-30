import { combineReducers } from 'redux'
import render from '@/store/slice/render'
import client from '@/store/slice/client'

export default combineReducers({
  render,
  client,
})
