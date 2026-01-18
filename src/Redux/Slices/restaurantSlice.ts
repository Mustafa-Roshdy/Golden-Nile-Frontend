import api from "@/interceptor/api";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Place, PlaceState } from "@/types/place";

// ---- initial state ----
const initialState: PlaceState = {
    list: [],
    loading: false,
    error: null,
};

// ---- AsyncThunk: Fetch All Restaurants ----
export const getRestaurants = createAsyncThunk<
    Place[],
    void,
    { rejectValue: string }
>("restaurant/fetchAll", async (_, thunkAPI) => {
    try {
        const res = await api.get<Place[]>("/api/restaurants");
        return res.data;
    } catch (err: any) {
        const message =
            err?.response?.data?.message ||
            err.message ||
            "Failed to fetch restaurants";
        return thunkAPI.rejectWithValue(message);
    }
});

// ---- AsyncThunk: Get Restaurants by Creator ----
export const getRestaurantsByCreator = createAsyncThunk<
    Place[],
    string,
    { rejectValue: string }
>("restaurant/fetchRestaurantsByCreator", async (userId, thunkAPI) => {
    try {
        const res = await api.get<{ success: boolean; data: Place[] }>(`/api/place/creator/${userId}/restaurant`);
        return (res as any).data;
    } catch (err: any) {
        const message =
            err?.response?.data?.message ||
            err.message ||
            "Failed to fetch restaurants by creator";
        return thunkAPI.rejectWithValue(message);
    }
});

// ---- AsyncThunk: Add Restaurant ----
export const addRestaurant = createAsyncThunk<
    Place,
    FormData | Partial<Omit<Place, "_id" | "createdAt">>,
    { rejectValue: string }
>("restaurant/add", async (data, thunkAPI) => {
    try {
        const config = data instanceof FormData ? {
            headers: { 'Content-Type': 'multipart/form-data' }
        } : {};
        const res = await api.post<{ success: boolean; data: Place }>("/api/place/create", data, config);
        return (res as any).data; // The api interceptor extracts res.data, so we get { success, data } here
    } catch (err: any) {
        const message =
            err?.response?.data?.message || err.message || "Failed to add restaurant";
        return thunkAPI.rejectWithValue(message);
    }
});

// ---- AsyncThunk: Delete Restaurant ----
export const deleteRestaurant = createAsyncThunk(
    "restaurant/delete",
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/api/place/${id}`);
            return id;
        } catch (err: any) {
            const message =
                err.response?.data?.message || err.message || "Failed to delete restaurant";
            return rejectWithValue(message);
        }
    }
);

// ---- AsyncThunk: Update Restaurant ----
export const updateRestaurant = createAsyncThunk<
    Place,
    { id: string; data: FormData | Partial<Omit<Place, "_id" | "createdAt">> },
    { rejectValue: string }
>("restaurant/update", async ({ id, data }, thunkAPI) => {
    try {
        const config = data instanceof FormData ? {
            headers: { 'Content-Type': 'multipart/form-data' }
        } : {};
        const res = await api.put<{ success: boolean; data: Place }>(`/api/place/${id}`, data, config);
        return (res as any).data;
    } catch (err: any) {
        const message =
            err?.response?.data?.message || err.message || "Failed to update restaurant";
        return thunkAPI.rejectWithValue(message);
    }
});

// ---- Slice ----
const restaurantSlice = createSlice({
    name: "restaurant",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // getRestaurants
            .addCase(getRestaurants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                getRestaurants.fulfilled,
                (state, action: PayloadAction<Place[]>) => {
                    state.loading = false;
                    state.list = action.payload;
                }
            )
            .addCase(getRestaurants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            })
            // getRestaurantsByCreator
            .addCase(getRestaurantsByCreator.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                getRestaurantsByCreator.fulfilled,
                (state, action: PayloadAction<Place[]>) => {
                    state.loading = false;
                    state.list = action.payload;
                }
            )
            .addCase(getRestaurantsByCreator.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            })
            // addRestaurant
            .addCase(addRestaurant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                addRestaurant.fulfilled,
                (state, action: PayloadAction<Place>) => {
                    state.loading = false;
                    state.list.push(action.payload);
                }
            )
            .addCase(addRestaurant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            })
            // deleteRestaurant
            .addCase(deleteRestaurant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteRestaurant.fulfilled, (state, action) => {
                state.loading = false;
                state.list = state.list.filter((item) => item._id !== action.payload);
            })
            .addCase(deleteRestaurant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string ?? "Unknown error";
            })
            // updateRestaurant
            .addCase(updateRestaurant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                updateRestaurant.fulfilled,
                (state, action: PayloadAction<Place>) => {
                    state.loading = false;
                    const index = state.list.findIndex((item) => item._id === action.payload._id);
                    if (index !== -1) {
                        state.list[index] = action.payload;
                    }
                }
            )
            .addCase(updateRestaurant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            });
    },
});

export default restaurantSlice.reducer;