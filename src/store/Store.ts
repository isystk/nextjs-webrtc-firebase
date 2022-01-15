import { combineReducers } from 'redux'
import parts from './slice/parts'
import posts from './slice/posts'
import memberPosts from './slice/memberPosts'

export default combineReducers({
  parts,
  posts,
  memberPosts,
})
