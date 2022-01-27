import { combineReducers } from 'redux'
import posts from './slice/posts'
import memberPosts from './slice/memberPosts'

export default combineReducers({
  posts,
  memberPosts,
})
