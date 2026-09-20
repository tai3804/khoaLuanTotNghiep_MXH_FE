import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  accessToken: string | null;
}

const initialState: AuthState = {
  // Redux is recreated after a browser refresh.  Keep the access token in
  // localStorage as well so protected requests made during application
  // bootstrap still carry Authorization.
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state: AuthState, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    clearAuth: (state: AuthState) => {
      state.accessToken = null;
    },
  },
});

export const { setAccessToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;
