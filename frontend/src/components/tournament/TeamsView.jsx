import { useState, useEffect } from 'react';
import { getTournamentBookings } from '../../services/bookingService';

const TeamsView = ({ tournamentId, events }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('all');
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const response = await getTournamentBookings(tournamentId);
        setBookings(response.data.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError(error.response?.data?.message || 'Failed to fetch bookings');
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, [tournamentId]);
  
  // Filter bookings by selected event
  const filteredBookings = selectedEventId === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.event === selectedEventId);
  
  // Get event name by ID
  const getEventName = (eventId) => {
    const event = events.find(e => e._id === eventId);
    return event ? event.name : 'Unknown Event';
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Teams</h2>
        
        {/* Event filter dropdown */}
        <div className="relative">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Events</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>
                {event.name}
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
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Phone
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
                      {getEventName(booking.event)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {booking.phone}
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
            No teams registered for {selectedEventId === 'all' ? 'any events' : 'this event'} yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamsView;