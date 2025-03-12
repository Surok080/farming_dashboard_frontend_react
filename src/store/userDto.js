import { createSlice } from '@reduxjs/toolkit'

export const userDto = createSlice({
  name: 'user',
  initialState: {
    fio: '1',
    userInfo: {}
  },
  reducers: {
    setUserFio: (state, action) => {
      state.fio = action.payload
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload
    }

  },
})

export const { setUserFio,  setUserInfo} = userDto.actions

export default userDto.reducer
