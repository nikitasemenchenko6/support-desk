import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit'
import authService from './authService'
// NOTE: use a extractErrorMessage function to save some repetition
import { extractErrorMessage } from '../../utils'

// Get user from localstorage
const user = JSON.parse(localStorage.getItem('user'))

// NOTE: remove isSuccess from state as we can infer from
// presence or absence of user plus no need for a reset function
// No need for isError or message as we can catch the AsyncThunkAction rejection
// in our component and we will have the error message there
const initialState = {
  user: user ? user : null,
  isLoading: false,
}

// Register new user
export const register = createAsyncThunk(
  'auth/register',
  async (user, thunkAPI) => {
    try {
      return await authService.register(user)
    } catch (error) {
      return thunkAPI.rejectWithValue(extractErrorMessage(error))
    }
  }
)

// Login user
export const login = createAsyncThunk('auth/login', async (user, thunkAPI) => {
  try {
    return await authService.login(user)
  } catch (error) {
    return thunkAPI.rejectWithValue(extractErrorMessage(error))
  }
})

// Logout user
// NOTE: here we don't need a thunk as we are not doing anything async so we can
// use a createAction instead
export const logout = createAction('auth/logout', () => {
  authService.logout()
  // return an empty object as our payload as we don't need a payload but the
  // prepare function requires a payload return
  return {}
})

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        // reset state on pending
        // NOTE: user will already be null if registering
        // state.user = null
        state.isLoading = true
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload
        state.isLoading = false
      })
      .addCase(register.rejected, (state) => {
        state.isLoading = false
        // NOTE: user will already be null if register failed
        // state.user = null
      })
      .addCase(login.pending, (state) => {
        // reset state on pending
        // NOTE: user will already be null if logging in
        // state.user = null
        state.isLoading = false
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload
        state.isLoading = false
      })
      .addCase(login.rejected, (state) => {
        state.isLoading = false
        // NOTE: user will already be null if login failed
        // state.user = null
      })
      .addCase(logout, (state) => {
        state.user = null
      })
  },
})

export const { reset } = authSlice.actions
export default authSlice.reducer
