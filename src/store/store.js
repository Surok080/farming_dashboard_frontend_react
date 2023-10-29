import { configureStore } from '@reduxjs/toolkit'
import userDto from './userDto'

export default configureStore({
  reducer: {
    user: userDto,
  },
})
