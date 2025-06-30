import { useState, useEffect } from 'react';
import { getAllTournaments } from '../../services/tournamentService';
import { getTournamentBookings } from '../../services/bookingService';

const TeamsListView = () => {
  const [tournaments, setTournaments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTournamentId, setSelectedTournamentId] = useState('all');
  
  useEffect(() => {
    const fetchTournamentsAndBookings = async () => {
      try {
        setIsLoading(true);
        // Fetch all tournaments
        const tournamentsResponse = await getAllTournaments();
        const fetchedTournaments = tournamentsResponse.data.data;
        setTournaments(fetchedTournaments);
        
        // Fetch bookings for each tournament
        const bookingsPromises = fetchedTournaments.map(tournament => 
          getTournamentBookings(tournament._id)
            .then(response => response.data.data)
            .catch(error => {
              console.error(`Error fetching bookings for tournament ${tournament._id}:`, error);
              return [];
            })
        );
        
        const allBookingsArrays = await Promise.all(bookingsPromises);
        // Flatten the array of arrays and add tournament info to each booking
        const allBookings = allBookingsArrays.flatMap((tournamentBookings, index) => {
          return tournamentBookings.map(booking => ({
            ...booking,
            tournamentName: fetchedTournaments[index].name,
            tournamentStartDate: fetchedTournaments[index].startDate,
            tournamentEndDate: fetchedTournaments[index].endDate
          }));
        });
        
        setBookings(allBookings);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch tournaments and bookings');
        setIsLoading(false);
      }
    };
    
    fetchTournamentsAndBookings();
  }, []);
  
  // Filter bookings by selected tournament
  const filteredBookings = selectedTournamentId === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.tournament === selectedTournamentId);
  
  // Get event name by ID and tournament ID
  const getEventName = (tournamentId, eventId) => {
    const tournament = tournaments.find(t => t._id === tournamentId);
    if (!tournament) return 'Unknown Event';
    
    const event = tournament.events.find(e => e._id === eventId);
    return event ? event.name : 'Unknown Event';
  };

  // Determine registration source
  const getRegistrationSource = (booking) => {
    return booking.registrationSource || 'online';
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Registered Teams</h2>
          <p className="text-sm text-gray-400 mt-1">View all teams registered across tournaments</p>
        </div>
        
        {/* Tournament filter dropdown */}
        <div className="relative">
          <select
            value={selectedTournamentId}
            onChange={(e) => setSelectedTournamentId(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Tournaments</option>
            {tournaments.map(tournament => (
              <option key={tournament._id} value={tournament._id}>
                {tournament.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
            </svg>
          </div>
        </div>
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
                    Tournament
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Registration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
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
                      {booking.tournamentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {getEventName(booking.tournament, booking.event)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.email} | {booking.phone}
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

export default TeamsListView;