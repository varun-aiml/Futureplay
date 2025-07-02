import api from './api';

// Get all auctions for the logged-in organizer
export const getOrganizerAuctions = async () => {
  const response = await api.get('/auctions');
  return response;
};

// Get a single auction by ID
export const getAuctionById = async (id) => {
  const response = await api.get(`/auctions/${id}`);
  return response;
};

// Create a new auction
export const createAuction = async (auctionData) => {
  const response = await api.post('/auctions', auctionData);
  return response;
};

// Update an existing auction
export const updateAuction = async (id, auctionData) => {
  const response = await api.put(`/auctions/${id}`, auctionData);
  return response;
};

// Delete an auction
export const deleteAuction = async (id) => {
  const response = await api.delete(`/auctions/${id}`);
  return response;
};