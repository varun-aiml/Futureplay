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