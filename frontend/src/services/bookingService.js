import api from './api';

// Create a new booking
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response;
};

// Get all bookings for a tournament (for organizers)
export const getTournamentBookings = async (tournamentId) => {
  const response = await api.get(`/bookings/tournament/${tournamentId}`);
  return response;
};

// Update booking status (for organizers)
export const updateBookingStatus = async (bookingId, status) => {
  const response = await api.put(`/bookings/${bookingId}`, { status });
  return response;
};