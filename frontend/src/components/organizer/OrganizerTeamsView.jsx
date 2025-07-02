import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { getOrganizerTournaments } from '../../services/tournamentService';
import { getTournamentBookings } from '../../services/bookingService';

const OrganizerTeamsView = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTournamentId, setSelectedTournamentId] = useState('all');
  
  // Fetch all tournaments created by this organizer
  useEffect(() => {
    const fetchTournamentsAndBookings = async () => {
      try {
        setIsLoading(true);
        
        // Get all tournaments for this organizer
        const tournamentsResponse = await getOrganizerTournaments();
        const tournamentsData = tournamentsResponse.data.data;
        setTournaments(tournamentsData);
        
        // Fetch bookings for all tournaments
        const allBookings = [];
        for (const tournament of tournamentsData) {
          try {
            const bookingsResponse = await getTournamentBookings(tournament._id);
            const bookingsData = bookingsResponse.data.data;
            
            // Add tournament name to each booking for display
            const bookingsWithTournamentName = bookingsData.map(booking => ({
              ...booking,
              tournamentName: tournament.name
            }));
            
            allBookings.push(...bookingsWithTournamentName);
          } catch (err) {
            console.error(`Error fetching bookings for tournament ${tournament._id}:`, err);
          }
        }
        
        setBookings(allBookings);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        setIsLoading(false);
        console.error('Error fetching data:', err);
      }
    };
    
    fetchTournamentsAndBookings();
  }, []);
  
  // Filter bookings based on selected tournament
  const filteredBookings = selectedTournamentId === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.tournament === selectedTournamentId);
  
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
      {/* Tournament filter */}
      <div className="mb-4">
        <label htmlFor="tournamentFilter" className="block text-sm font-medium text-gray-300 mb-2">
          Filter by Tournament
        </label>
        <select
          id="tournamentFilter"
          className="bg-gray-700 text-white rounded-md px-4 py-2 w-full md:w-64"
          value={selectedTournamentId}
          onChange={(e) => setSelectedTournamentId(e.target.value)}
        >
          <option value="all">All Tournaments</option>
          {tournaments.map((tournament) => (
            <option key={tournament._id} value={tournament._id}>
              {tournament.name}
            </option>
          ))}
        </select>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 rounded-md">
          {error}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Team Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tournament
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    T-shirt Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Registration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Registration Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {booking.playerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {getEventName(booking.event)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.tournamentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.dateOfBirth ? new Date(booking.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.gender || 'Not provided'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.tShirtSize || 'Not provided'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRegistrationSource(booking) === 'online' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                        {getRegistrationSource(booking) === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'Confirmed' ? 'bg-green-900 text-green-300' : booking.status === 'Cancelled' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'Unknown'}
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
            No teams registered for {selectedTournamentId === 'all' ? 'any tournaments' : 'this tournament'} yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default OrganizerTeamsView;