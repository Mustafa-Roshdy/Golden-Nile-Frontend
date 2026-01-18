import api from "@/interceptor/api";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Place, PlaceState } from "@/types/place";

// ---- initial state ----
const initialState: PlaceState = {
    list: [],
    loading: false,
    error: null,
};

// ---- AsyncThunk: Fetch All ----
export const getGuestHouses = createAsyncThunk<
    Place[],
    void,
    { rejectValue: string }
>("guestHouse/fetchAll", async (_, thunkAPI) => {
    try {
        const res = await api.get<Place[]>("/api/guest-houses");
        return res.data;
    } catch (err: any) {
        const message =
            err?.response?.data?.message ||
            err.message ||
            "Failed to fetch guest houses";
        return thunkAPI.rejectWithValue(message);
    }
});

// ---- AsyncThunk: Fetch User Places ---- 
export const getUserPlaces = createAsyncThunk<
    Place[],
    string,
    { rejectValue: string }>("guestHouse/fetchUserPlaces", async (userId, thunkAPI) => {
    try {
        const res = await api.get<{ success: boolean; data: Place[] }>(`/api/place/creator/${userId}`);
        return (res as any).data; // The api interceptor extracts res.data, so we get { success, data } here
    } catch (err: any) {
        const message =
            err?.response?.data?.message ||
            err.message ||
            "Failed to fetch user places";
        return thunkAPI.rejectWithValue(message);
    }
});

// ---- AsyncThunk: Add ----
export const addGuestHouse = createAsyncThunk<
    Place,
    FormData | Partial<Omit<Place, "_id" | "createdAt">>,
    { rejectValue: string }
>("guestHouse/add", async (data, thunkAPI) => {
    try {
        const config = data instanceof FormData ? {
            headers: { 'Content-Type': 'multipart/form-data' }
        } : {};
        const res = await api.post<{ success: boolean; data: Place }>("/api/place/create", data, config);
        return (res as any).data; // The api interceptor extracts res.data, so we get { success, data } here
    } catch (err: any) {
        const message =
            err?.response?.data?.message || err.message || "Failed to add place";
        return thunkAPI.rejectWithValue(message);
    }
});
export const deleteGuestHouse = createAsyncThunk(
    "guestHouse/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            const res = await api.delete(`/api/place/${id}`); //  دي نفس /api/place/:id
            return id; // هنرجع الـ id علشان نحذفه من الـ state
        } catch (err: any) {
            const message =
                err.response?.data?.message || err.message || "Failed to delete guesthouse";
            return rejectWithValue(message);
        }
    }
);

// ---- AsyncThunk: Update Place ----
export const updatePlace = createAsyncThunk<
    Place,
    { id: string; data: FormData | Partial<Omit<Place, "_id" | "createdAt">> },
    { rejectValue: string }
>("guestHouse/update", async ({ id, data }, thunkAPI) => {
    try {
        const config = data instanceof FormData ? {
            headers: { 'Content-Type': 'multipart/form-data' }
        } : {};
        const res = await api.put<{ success: boolean; data: Place }>(`/api/place/${id}`, data, config);
        return (res as any).data;
    } catch (err: any) {
        const message =
            err?.response?.data?.message || err.message || "Failed to update place";
        return thunkAPI.rejectWithValue(message);
    }
});

// ---- AsyncThunk: Get Guest Houses by Creator ----
export const getGuestHousesByCreator = createAsyncThunk<
    Place[],
    string,
    { rejectValue: string }
>("guestHouse/fetchGuestHousesByCreator", async (userId, thunkAPI) => {
    try {
        const res = await api.get<{ success: boolean; data: Place[] }>(`/api/place/creator/${userId}/guest_house`);
        return (res as any).data;
    } catch (err: any) {
        const message =
            err?.response?.data?.message ||
            err.message ||
            "Failed to fetch guest houses by creator";
        return thunkAPI.rejectWithValue(message);
    }
});


// ---- Slice ----
const guestHouseSlice = createSlice({
    name: "guestHouse",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // getGuestHouses
            .addCase(getGuestHouses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                getGuestHouses.fulfilled,
                (state, action: PayloadAction<Place[]>) => {
                    state.loading = false;
                    state.list = action.payload;
                }
            )
            .addCase(getGuestHouses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            })
            // getUserPlaces
            .addCase(getUserPlaces.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                getUserPlaces.fulfilled,
                (state, action: PayloadAction<Place[]>) => {
                    state.loading = false;
                    state.list = action.payload;
                }
            )
            .addCase(getUserPlaces.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            })
            // addGuestHouse
            .addCase(addGuestHouse.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                addGuestHouse.fulfilled,
                (state, action: PayloadAction<Place>) => {
                    state.loading = false;
                    state.list.push(action.payload);
                }
            )
            .addCase(addGuestHouse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            }).addCase(deleteGuestHouse.fulfilled, (state, action) => {
                state.list = state.list.filter((item) => item._id !== action.payload);
            })
            // updatePlace
            .addCase(updatePlace.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                updatePlace.fulfilled,
                (state, action: PayloadAction<Place>) => {
                    state.loading = false;
                    const index = state.list.findIndex((item) => item._id === action.payload._id);
                    if (index !== -1) {
                        state.list[index] = action.payload;
                    }
                }
            )
            .addCase(updatePlace.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            })
            // getGuestHousesByCreator
            .addCase(getGuestHousesByCreator.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                getGuestHousesByCreator.fulfilled,
                (state, action: PayloadAction<Place[]>) => {
                    state.loading = false;
                    state.list = action.payload;
                }
            )
            .addCase(getGuestHousesByCreator.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            })
    },
});

export default guestHouseSlice.reducer;
