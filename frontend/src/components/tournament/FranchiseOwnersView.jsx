import { useState, useEffect } from 'react';
import { getAllFranchises } from '../../services/franchiseService';
import { getTournamentBookings, associateTeamWithFranchise, removeTeamFromFranchise } from '../../services/bookingService';
import { toast } from 'react-toastify';

const FranchiseOwnersView = ({ tournamentId, events }) => {
  const [franchises, setFranchises] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [showTeamsList, setShowTeamsList] = useState(false);
  const [isAssociating, setIsAssociating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Fetch franchises and bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get all franchises
        const franchisesResponse = await getAllFranchises();
        // Filter franchises for this tournament
        const tournamentFranchises = (franchisesResponse.franchises || []).filter(
          franchise => franchise.tournament === tournamentId
        );
        setFranchises(tournamentFranchises);
        
        // Get all bookings for this tournament
        const bookingsResponse = await getTournamentBookings(tournamentId);
        setBookings(bookingsResponse.data.data);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || 'Failed to fetch data');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [tournamentId]);

  // Get event name by ID
  const getEventName = (eventId) => {
    const event = events.find(e => e._id === eventId);
    return event ? event.name : 'Unknown Event';
  };

  // Handle franchise selection
  const handleFranchiseSelect = (franchise) => {
    setSelectedFranchise(franchise);
    setShowTeamsList(true);
  };

  // Handle team association with franchise
  const handleAssociateTeam = async (bookingId) => {
    if (!selectedFranchise) return;
    
    try {
      setIsAssociating(true);
      await associateTeamWithFranchise(bookingId, selectedFranchise._id);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId ? { ...booking, franchise: selectedFranchise._id } : booking
        )
      );
      
      toast.success(`Team successfully added to ${selectedFranchise.franchiseName}`);
    } catch (error) {
      console.error('Error associating team:', error);
      toast.error(error.response?.data?.message || 'Failed to associate team');
    } finally {
      setIsAssociating(false);
    }
  };

  // Handle removing team from franchise
  const handleRemoveTeam = async (bookingId) => {
    try {
      setIsRemoving(true);
      await removeTeamFromFranchise(bookingId);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId ? { ...booking, franchise: null } : booking
        )
      );
      
      toast.success(`Team successfully removed from ${selectedFranchise.franchiseName}`);
    } catch (error) {
      console.error('Error removing team:', error);
      toast.error(error.response?.data?.message || 'Failed to remove team');
    } finally {
      setIsRemoving(false);
    }
  };

  // Get teams for a franchise
  const getFranchiseTeams = (franchiseId) => {
    return bookings.filter(booking => booking.franchise === franchiseId);
  };

  // Get unassigned teams
  const getUnassignedTeams = () => {
    return bookings.filter(booking => !booking.franchise);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Franchise Owners</h2>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 rounded-md">
          {error}
        </div>
      ) : franchises.length === 0 ? (
        <div className="bg-gray-800 p-4 rounded-md text-gray-300">
          No franchise owners registered for this tournament.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
{/* Franchises List */}
<div className="md:col-span-1 bg-gray-800 rounded-xl p-4">
  <h3 className="text-lg font-medium text-white mb-3">Franchises</h3>
  <div className="space-y-2">
    {franchises.map(franchise => (
      <div 
        key={franchise._id}
        onClick={() => handleFranchiseSelect(franchise)}
        className={`p-3 rounded-md cursor-pointer transition-colors ${selectedFranchise?._id === franchise._id ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
      >
        <div className="flex items-center mb-2">
          {franchise.logoUrl ? (
            <img 
              src={franchise.logoUrl} 
              alt={`${franchise.franchiseName} logo`} 
              className="h-10 w-10 rounded-full object-cover border border-gray-600 mr-3"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold mr-3">
              {franchise.franchiseName.charAt(0)}
            </div>
          )}
          <h4 className="font-medium text-white">{franchise.franchiseName}</h4>
        </div>
        <p className="text-sm text-gray-300">Owner: {franchise.ownerName}</p>
        <p className="text-xs text-gray-400">Teams: {getFranchiseTeams(franchise._id).length}</p>
      </div>
    ))}
  </div>
</div>
          
          {/* Teams List */}
          <div className="md:col-span-2 bg-gray-800 rounded-xl p-4">
            {showTeamsList && selectedFranchise ? (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-white">{selectedFranchise.franchiseName}'s Teams</h3>
                </div>
                
                {/* Franchise's Teams */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-white mb-2">Associated Teams</h4>
                  {getFranchiseTeams(selectedFranchise._id).length > 0 ? (
                    <div className="bg-gray-700 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-600">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Team Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Event</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600">
                          {getFranchiseTeams(selectedFranchise._id).map(team => (
                            <tr key={team._id} className="hover:bg-gray-600">
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{team.playerName}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{getEventName(team.event)}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => handleRemoveTeam(team._id)}
                                  disabled={isRemoving}
                                  className="bg-gray-600 hover:bg-gray-700 text-white text-xs py-1 px-2 rounded transition-colors"
                                >
                                  {isRemoving ? 'Removing...' : 'Remove'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No teams associated yet.</p>
                  )}
                </div>
                
                {/* Available Teams to Add */}
                <div>
                  <h4 className="text-md font-medium text-white mb-2">Available Teams to Add</h4>
                  {getUnassignedTeams().length > 0 ? (
                    <div className="bg-gray-700 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-600">
                        <thead className="bg-gray-800">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Team Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Event</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-600">
                          {getUnassignedTeams().map(team => (
                            <tr key={team._id} className="hover:bg-gray-600">
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{team.playerName}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{getEventName(team.event)}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <button
                                  onClick={() => handleAssociateTeam(team._id)}
                                  disabled={isAssociating}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded transition-colors"
                                >
                                  {isAssociating ? 'Adding...' : 'Add'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No available teams to add.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-40 text-gray-400">
                Select a franchise to view and manage teams
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FranchiseOwnersView;