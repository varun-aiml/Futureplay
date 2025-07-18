import { useState, useEffect } from 'react';
import { useFranchise } from '../../context/franchiseContext';
import { getTournamentBookings } from '../../services/bookingService';
import { getTournamentById } from '../../services/tournamentService';

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
          const tournamentResponse = await getTournamentById(franchise.tournament);
          const tournamentData = tournamentResponse.data.data;
          
          // Add validation to ensure tournamentData exists
          if (!tournamentData) {
            throw new Error('Tournament data not found');
          }
          
          setTournamentName(tournamentData.name);
          
          // Get bookings for this tournament
          const bookingsResponse = await getTournamentBookings(franchise.tournament);
          const bookingsData = bookingsResponse.data.data;
          
          // Validate that bookingsData is an array before using map
          if (!Array.isArray(bookingsData)) {
            setBookings([]);
          } else {
            // Add tournament name to each booking for display
            const bookingsWithTournamentName = bookingsData.map(booking => ({
              ...booking,
              tournamentName: tournamentData.name
            }));
            
            setBookings(bookingsWithTournamentName);
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
          Tournament: {tournamentName || 'Loading...'}
        </h3>
        <p className="text-sm text-gray-400">
          Showing all teams registered for this tournament
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
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {booking.playerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {getEventName(booking.event)}
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
            No teams registered for this tournament yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamsListView;