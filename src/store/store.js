import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./features/auth/authSlice";
import eventPlannerReducer from "./features/eventPlanner/eventPlannerSlice";
import eventServiceReducer from "./features/eventService/eventServiceSlice";
import hireReducer from "./features/hire/hireSlice";
import invoiceReducer from "./features/invoice/invoiceSlice";
import packageReducer from "./features/packages/packageSlice";
import reviewReducer from "./features/review/reviewSlice";
import notificationReducer from "./features/notification/notificationSlice";
import reportReducer from "./features/report/reportSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    eventPlanner: eventPlannerReducer,
    eventServices: eventServiceReducer,
    hire: hireReducer,
    invoice: invoiceReducer,
    packages: packageReducer,
    review: reviewReducer,
    notification: notificationReducer,
    report: reportReducer,
  },
});

export default store;
