import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import eventPlannerReducer from "./features/eventPlanner/eventPlannerSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    eventPlanner: eventPlannerReducer,
  },
});

export default store;
