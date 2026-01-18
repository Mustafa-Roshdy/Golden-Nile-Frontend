import api from "@/interceptor/api";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, UserState, RegisterData, LoginData, AuthResponse } from "@/types/user";
import Cookies from "js-cookie";

// ---- initial state ----
const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
};

// ---- AsyncThunk: Register User ----
export const registerUser = createAsyncThunk<
  void,
  RegisterData,
  { rejectValue: string }
>("user/register", async (userData, thunkAPI) => {
  try {
    const res = await api.post("/api/user/create", userData);
    // Registration successful, no need to return user data
    // User will need to login after registration
  } catch (err: any) {
    console.error("Registration error:", err);
    let message = "Failed to register user";

    if (err?.response) {
      const status = err.response.status;
      const data = err.response.data;

      if (status === 400 && data?.error) {
        message = data.error;
      } else if (data?.message) {
        message = data.message;
      } else if (typeof data === 'string') {
        message = data;
      }
    } else if (err?.message) {
      message = err.message;
    }

    return thunkAPI.rejectWithValue(message);
  }
});

// ---- AsyncThunk: Login User ----
export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginData,
  { rejectValue: string }
>("user/login", async (loginData, thunkAPI) => {
  try {
    const res = await api.post("/api/auth/login", loginData) as AuthResponse;
    if (res.success) {
      Cookies.set("goldenNileToken", res.token, { expires: 7 });
    }
    return res;
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err.message ||
      "Failed to login";
    return thunkAPI.rejectWithValue(message);
  }
});

// ---- AsyncThunk: Get Current User ----
export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("user/getCurrentUser", async (_, thunkAPI) => {
  try {
    const res = await api.get("/user/profile") as { success: boolean; data: User };
    return res.data;
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err.message ||
      "Failed to get current user";
    return thunkAPI.rejectWithValue(message);
  }
});

// ---- AsyncThunk: Logout ----
export const logoutUser = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("user/logout", async (_, thunkAPI) => {
  try {
    Cookies.remove("goldenNileToken");
    Cookies.remove("goldenNileUserPhoto");
    // Optionally call logout endpoint if exists
  } catch (err: any) {
    const message = err.message || "Failed to logout";
    return thunkAPI.rejectWithValue(message);
  }
});

// ---- Slice ----
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        // Registration successful, but user not logged in yet
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string ?? "Unknown error";
      })
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.currentUser = {
          firstName: action.payload.firstName,
          lastName: action.payload.lastName,
          role: action.payload.role,
          userId: 0,
          email: '',
          password: '',
          phone: '',
          age: 0,
          gender: '',
        } as User;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string ?? "Unknown error";
      })
      // getCurrentUser
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
        state.currentUser = null; // Clear user on failure
      })
      // logoutUser
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.currentUser = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string ?? "Unknown error";
        // Still clear user even on error
        state.currentUser = null;
      });
  },
});

export const { clearError, setUser } = userSlice.actions;
export default userSlice.reducer;