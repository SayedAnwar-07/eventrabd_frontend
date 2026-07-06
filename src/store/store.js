import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth/authSlice";
import eventPlannerReducer from "./features/eventPlanner/eventPlannerSlice";
import eventServiceReducer from "./features/eventService/eventServiceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    eventPlanner: eventPlannerReducer,
    eventServices: eventServiceReducer,
  },
});

export default store;
