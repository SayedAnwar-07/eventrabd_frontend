export function getBookingSlots(hire) {
  return Array.isArray(hire?.booking_slots) ? hire.booking_slots : [];
}

export function getBookingCount(hire) {
  return getBookingSlots(hire).length;
}

export function hasLocation(slot) {
  return Boolean(slot?.latitude && slot?.longitude);
}
