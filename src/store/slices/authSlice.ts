import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  accessToken: string | null;
}

const initialState: AuthState = {
  accessToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    clearAuth: (state) => {
      state.accessToken = null;
    },
  },
});

export const { setAccessToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;
