import { createSlice } from '@reduxjs/toolkit'

export const userDto = createSlice({
  name: 'user',
  initialState: {
    fio: '1',
  },
  reducers: {
    setUserFio: (state, action) => {
      state.fio = action.payload
    },

  },
})

export const { setUserFio,  } = userDto.actions

export default userDto.reducer
