/**
 * Email Service - Now handled by backend
 *
 * Email functionality has been moved to the backend services.
 * The backend automatically sends booking confirmation emails to both
 * customers and place owners when bookings are created.
 *
 * This file is kept for compatibility but no longer contains EmailJS logic.
 */

export async function sendBookingEmail(): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Email sending is now handled by the backend
  return { success: true, messageId: "backend-handled" };
}

export default {
  sendBookingEmail,
};
