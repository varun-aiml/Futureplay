import api from './api';

// Get all tournaments for the logged-in organizer
export const getOrganizerTournaments = async () => {
  const response = await api.get('/tournaments/organizer');
  return response;
};

// Get a single tournament by ID
export const getTournamentById = async (id) => {
  const response = await api.get(`/tournaments/${id}`);
  return response;
};

// Create a new tournament
export const createTournament = async (tournamentData) => {
  const response = await api.post('/tournaments', tournamentData);
  return response;
};

// Update an existing tournament
export const updateTournament = async (id, tournamentData) => {
  const response = await api.put(`/tournaments/${id}`, tournamentData);
  return response;
};

// Delete a tournament
export const deleteTournament = async (id) => {
  const response = await api.delete(`/tournaments/${id}`);
  return response;
};

// Add an event to a tournament
export const addEvent = async (tournamentId, eventData) => {
  const response = await api.post(`/tournaments/${tournamentId}/events`, eventData);
  return response;
};

// Update an event
export const updateEvent = async (tournamentId, eventId, eventData) => {
  const response = await api.put(`/tournaments/${tournamentId}/events/${eventId}`, eventData);
  return response;
};

// Delete an event
export const deleteEvent = async (tournamentId, eventId) => {
  const response = await api.delete(`/tournaments/${tournamentId}/events/${eventId}`);
  return response;
};