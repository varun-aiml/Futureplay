import franchiseApi from './franchiseApi';

export const getTournamentAuctions = async (tournamentId) => {
  const response = await franchiseApi.get(`/auctions/tournament/${tournamentId}`);
  return response.data;
};

export const getTodayAuctions = async (tournamentId) => {
  const response = await franchiseApi.get(`/auctions/tournament/${tournamentId}/today`);
  return response.data;
};

export const getUpcomingAuctions = async (tournamentId) => {
  const response = await franchiseApi.get(`/auctions/tournament/${tournamentId}/upcoming`);
  return response.data;
};

// New functions for franchises and players
export const getTournamentFranchises = async (tournamentId) => {
  const response = await franchiseApi.get(`/bookings/tournament/${tournamentId}/franchises`);
  return response.data;
};

export const getTournamentPlayers = async (tournamentId) => {
  const response = await franchiseApi.get(`/bookings/tournament/${tournamentId}/players`);
  return response.data;
};