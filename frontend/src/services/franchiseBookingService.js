import franchiseApi from './franchiseApi';

// Get all bookings for a tournament (for franchises)
export const getTournamentBookings = async (tournamentId) => {
  const response = await franchiseApi.get(`/bookings/tournament/${tournamentId}/players`);
  return response.data; // Return data directly instead of the entire response
};

// Get tournament by ID
export const getTournamentById = async (tournamentId) => {
    const response = await franchiseApi.get(`/tournaments/public/${tournamentId}`);
    return response.data; // Return data directly
  };

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  const response = await franchiseApi.put(`/bookings/${bookingId}`, { status });
  return response.data; // Return data directly
};

// Associate a team with a franchise
export const associateTeamWithFranchise = async (bookingId, franchiseId) => {
  const response = await franchiseApi.put(`/bookings/${bookingId}/franchise`, { franchiseId });
  return response.data; // Return data directly
};

// Remove a team from a franchise
export const removeTeamFromFranchise = async (bookingId) => {
  const response = await franchiseApi.delete(`/bookings/${bookingId}/franchise`);
  return response.data; // Return data directly
};

// Get all franchises for a tournament
export const getTournamentFranchises = async (tournamentId) => {
  const response = await franchiseApi.get(`/bookings/tournament/${tournamentId}/franchises`);
  return response.data; // Return data directly
};

// Update team event
export const updateTeamEvent = async (bookingId, eventId) => {
  const response = await franchiseApi.put(`/bookings/${bookingId}/event`, { eventId });
  return response.data; // Return data directly
};