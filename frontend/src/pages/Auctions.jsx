import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrganizerLayout from '../components/OrganizerLayout';
import { getOrganizerAuctions, deleteAuction, createAuction, updateAuction } from '../services/auctionService';
import { getOrganizerTournaments } from '../services/tournamentService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

function Auctions() {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);

  // Fetch auctions
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setIsLoading(true);
        const response = await getOrganizerAuctions();
        setAuctions(response.data.data || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching auctions:', error);
        toast.error('Failed to load auctions');
        setIsLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  // Fetch tournaments for the create modal
  useEffect(() => {
    if (showCreateModal) {
      const fetchTournaments = async () => {
        try {
          const response = await getOrganizerTournaments();
          setTournaments(response.data.data || []);
        } catch (error) {
          console.error('Error fetching tournaments:', error);
          toast.error('Failed to load tournaments');
        }
      };

      fetchTournaments();
    }
  }, [showCreateModal]);

  // Handle delete auction
  const handleDeleteAuction = async (id) => {
    if (window.confirm('Are you sure you want to delete this auction?')) {
      try {
        await deleteAuction(id);
        setAuctions(auctions.filter(auction => auction._id !== id));
        toast.success('Auction deleted successfully');
      } catch (error) {
        console.error('Error deleting auction:', error);
        toast.error('Failed to delete auction');
      }
    }
  };

  // Handle edit auction
  const handleEditAuction = (auction) => {
    setSelectedAuction(auction);
    setShowCreateModal(true);
  };

  return (
    <OrganizerLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Auctions</h1>
            <p className="text-gray-400 mt-1">Manage your tournament auctions</p>
          </div>
          <button
            onClick={() => {
              setSelectedAuction(null);
              setShowCreateModal(true);
            }}
            className="mt-4 md:mt-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-300 shadow-md hover:shadow-lg flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Auction
          </button>
        </div>

        {/* Auctions List */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Your Auctions</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : auctions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No auctions found. Create your first auction!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tournament</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Players/Team</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {auctions.map((auction) => (
                    <tr key={auction._id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{auction.tournamentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{auction.numberOfPoints}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{auction.playersPerTeam}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {format(new Date(auction.auctionDate), 'MMM dd, yyyy')} at {auction.auctionTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditAuction(auction)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAuction(auction._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Auction Modal */}
      {showCreateModal && (
        <CreateAuctionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          tournaments={tournaments}
          auction={selectedAuction}
          onSuccess={() => {
            setShowCreateModal(false);
            // Refresh the auctions list
            getOrganizerAuctions().then(response => {
              setAuctions(response.data.data || []);
            });
          }}
        />
      )}
    </OrganizerLayout>
  );
}

// Create Auction Modal Component
function CreateAuctionModal({ isOpen, onClose, tournaments, auction, onSuccess }) {
  const [formData, setFormData] = useState({
    tournamentId: auction?.tournament || '',
    numberOfPoints: auction?.numberOfPoints || '',
    playersPerTeam: auction?.playersPerTeam || '',
    auctionTime: auction?.auctionTime || '',
    auctionDate: auction?.auctionDate ? new Date(auction.auctionDate).toISOString().split('T')[0] : ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (auction) {
        // Update existing auction
        await updateAuction(auction._id, formData);
        toast.success('Auction updated successfully');
      } else {
        // Create new auction
        await createAuction(formData);
        toast.success('Auction created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving auction:', error);
      toast.error(error.response?.data?.message || 'Failed to save auction');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">
          {auction ? 'Edit Auction' : 'Create Auction'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tournament Selection */}
          <div>
            <label className="block text-gray-300 mb-1">Tournament</label>
            <select
              name="tournamentId"
              value={formData.tournamentId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              disabled={auction}
            >
              <option value="">Select Tournament</option>
              {tournaments.map(tournament => (
                <option key={tournament._id} value={tournament._id}>
                  {tournament.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Number of Points */}
          <div>
            <label className="block text-gray-300 mb-1">Number of Points</label>
            <input
              type="number"
              name="numberOfPoints"
              value={formData.numberOfPoints}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          {/* Players Per Team */}
          <div>
            <label className="block text-gray-300 mb-1">Number of Players/Team</label>
            <input
              type="number"
              name="playersPerTeam"
              value={formData.playersPerTeam}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          {/* Auction Time */}
          <div>
            <label className="block text-gray-300 mb-1">Time</label>
            <input
              type="time"
              name="auctionTime"
              value={formData.auctionTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          {/* Auction Date */}
          <div>
            <label className="block text-gray-300 mb-1">Date</label>
            <input
              type="date"
              name="auctionDate"
              value={formData.auctionDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : auction ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Auctions;