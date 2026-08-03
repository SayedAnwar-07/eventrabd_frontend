/**
 * @typedef {Object} BookingSlot
 * @property {string} id
 * @property {string} starts_at
 * @property {string} venue_name
 * @property {string} venue_address
 * @property {number} latitude
 * @property {number} longitude
 */

/**
 * @typedef {Object} HireService
 * @property {string} service_name
 * @property {string} service_display_name
 * @property {number} shift_hour
 * @property {number} shift_charge
 */

/**
 * @typedef {Object} HireBrand
 * @property {string} brand_name
 * @property {string} division
 * @property {string} whatsapp_number
 */

/**
 * @typedef {Object} HireSeller
 * @property {string} full_name
 * @property {string} email
 * @property {string} contact_number
 */

/**
 * @typedef {Object} Hire
 * @property {string} id
 * @property {string} status
 * @property {HireService} service
 * @property {HireBrand} brand
 * @property {HireSeller} seller
 * @property {BookingSlot[]} booking_slots
 * @property {string} customer_note
 * @property {string} seller_note
 */

export {};
