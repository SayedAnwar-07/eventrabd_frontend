import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./features/auth/authSlice";
import eventPlannerReducer from "./features/eventPlanner/eventPlannerSlice";
import eventServiceReducer from "./features/eventService/eventServiceSlice";
import hireReducer from "./features/hire/hireSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    eventPlanner: eventPlannerReducer,
    eventServices: eventServiceReducer,
    hire: hireReducer,
  },
});

export default store;
