import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  accessToken: string | null;
}

const getStoredAccessToken = (): string | null => {
  try {
    return localStorage.getItem('accessToken');
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  accessToken: getStoredAccessToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken: (state: AuthState, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      try {
        if (action.payload) {
          localStorage.setItem('accessToken', action.payload);
        } else {
          localStorage.removeItem('accessToken');
        }
      } catch {}
    },
    clearAuth: (state: AuthState) => {
      state.accessToken = null;
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } catch {}
    },
  },
});

export const { setAccessToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;
