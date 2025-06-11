import api from './api';

// Get all tournaments for the logged-in organizer
export const getOrganizerTournaments = async () => {
  const response = await api.get('/tournaments/organizer');
  return response;
};

// Add this function to tournamentService.js
export const updateFixture = async (tournamentId, eventId, fixtureData) => {
  // This is a placeholder for future backend integration
  // For now, we'll just return a mock successful response
  return {
    data: {
      success: true,
      data: fixtureData
    }
  };
  
  // When backend is ready, uncomment this:
  // const response = await api.put('/tournaments/fixtures', {
  //   tournamentId,
  //   eventId,
  //   fixtureData
  // });
  // return response;
};

// Get all tournaments (for players)
export const getAllTournaments = async () => {
  const response = await api.get('/tournaments/all');
  return response;
};

// Get a single tournament by ID (public endpoint for players)
export const getPublicTournamentById = async (id) => {
  const response = await api.get(`/tournaments/public/${id}`);
  return response;
};

// Get a single tournament by ID
export const getTournamentById = async (id) => {
  try {
    // Always use the public endpoint for player view
    const response = await api.get(`/tournaments/public/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching tournament:', error);
    throw error;
  }
};

// Alias for getTournamentById for backward compatibility
export const getTournament = getTournamentById;

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

// Add multiple events to a tournament (calls addEvent for each event)
export const addEvents = async (tournamentId, eventsData) => {
  // Use Promise.all to wait for all events to be added
  const promises = eventsData.map(eventData => addEvent(tournamentId, eventData));
  const responses = await Promise.all(promises);
  return responses[responses.length - 1]; // Return the last response
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

export const getTopTournaments = async () => {
  const response = await api.get('/tournaments/top');
  return response;
};