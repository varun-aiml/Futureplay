import { useState, useEffect } from 'react';
import { useFranchise } from '../../context/franchiseContext';
import { getTournamentById } from '../../services/franchiseBookingService';
import { getTournamentPlayers } from '../../services/franchiseAuctionService';

const TeamsListView = () => {
  const { franchise } = useFranchise();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  
  // Fetch bookings for the franchise owner's tournament
  useEffect(() => {
    const fetchTournamentAndBookings = async () => {
        if (!franchise || !franchise.tournament) {
          setError('No tournament assigned to this franchise');
          setIsLoading(false);
          return;
        }
      
        try {
          setIsLoading(true);
          
          // Get tournament details to display the name
          const tournamentData = await getTournamentById(franchise.tournament);
          
          // Add validation to ensure tournamentData exists
          if (!tournamentData) {
            throw new Error('Tournament data not found');
          }
          
          setTournamentName(tournamentData.name);
          
          // Get players for this tournament using the same method as SuperAuction.jsx
          const response = await getTournamentPlayers(franchise.tournament);
          
          // Filter players to only include those assigned to this franchise
          if (response.data && Array.isArray(response.data)) {
            const franchisePlayers = response.data.filter(player => 
              player.franchise && player.franchise._id === franchise._id
            );
            setBookings(franchisePlayers);
          } else {
            setBookings([]);
          }
          
          setIsLoading(false);
        } catch (err) {
          setError('Failed to load data. Please try again later.');
          setIsLoading(false);
          console.error('Error fetching data:', err);
        }
      };
    
    fetchTournamentAndBookings();
  }, [franchise]);
  
  // Get event name from event ID
  const getEventName = (eventId) => {
    // This would ideally use the tournament data to find the event name
    // For now, return a placeholder
    return eventId || 'Unknown Event';
  };
  
  // Get registration source
  const getRegistrationSource = (booking) => {
    return booking.registrationSource || 'online';
  };
  
  return (
    <div className="mb-6">
      {/* Tournament information */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white mb-2">
          Tournament: {tournamentName || 'Assigned'}
        </h3>
        <p className="text-sm text-gray-400">
          Showing teams assigned to your franchise
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 rounded-md">
          {error}
        </div>
      ) : bookings.length > 0 ? (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-700">
            <h3 className="text-white font-medium">Players assigned to your franchise</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Player Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Franchise</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Gender</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">T-Shirt Size</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {booking.playerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.franchise ? booking.franchise.franchiseName : 'Not Assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.gender || 'Not provided'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.tShirtSize || 'Not provided'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' : booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-6 text-center">
          <p className="text-gray-400">
          No teams assigned to your franchise for this tournament yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamsListView;