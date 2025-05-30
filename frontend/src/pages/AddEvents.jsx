import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrganizerLayout from '../components/OrganizerLayout';
import { addEvents, getTournament } from '../services/tournamentService';

const AddEvents = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tournament, setTournament] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState({
    name: '',
    ageCategory: 'Under 19',
    gender: 'Boys',
    fee: '',
    maxPlayers: '',
    eventType: '',
    matchType: '',
    allowBooking: false,
    discount: '0'
  });

  // Fetch tournament details
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await getTournament(tournamentId);
        setTournament(response.data);
      } catch (error) {
        setError('Failed to fetch tournament details', error);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  // Handle input change for current event
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentEvent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add current event to events list
  const handleAddEvent = () => {
    // Validate event data
    if (!currentEvent.name || !currentEvent.ageCategory || !currentEvent.gender || 
        !currentEvent.fee || !currentEvent.eventType || !currentEvent.matchType || !currentEvent.maxPlayers) {
      setError('Please fill in all required fields for the event');
      return;
    }

    // Add event to list with a temporary ID
    setEvents(prev => [...prev, { ...currentEvent, id: Date.now() }]);
    
    // Reset current event form
    setCurrentEvent({
      name: '',
      ageCategory: 'Under 19',
      gender: 'Boys',
      fee: '',
      maxPlayers: '',
      eventType: '',
      matchType: '',
      allowBooking: false,
      discount: '0'
    });
    
    setError('');
  };

  // Remove event from list
  const handleRemoveEvent = (id) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  // Submit all events
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (events.length === 0) {
      setError('Please add at least one event');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // Remove temporary IDs before sending to API
      const eventsToSubmit = events.map(({  ...rest }) => rest);
      
      await addEvents(tournamentId, eventsToSubmit);
      navigate('/organizer/tournaments');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add events');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrganizerLayout>
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Add Events</h1>
        {tournament && (
          <p className="text-gray-400 mb-6">Tournament: {tournament.name}</p>
        )}
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Add New Event</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={currentEvent.name}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g., Under 19 Girls Singles"
                required
              />
            </div>
            
            {/* Age Category */}
            <div>
              <label htmlFor="ageCategory" className="block text-sm font-medium text-gray-300 mb-1">
                Age Category <span className="text-red-500">*</span>
              </label>
              <select
                id="ageCategory"
                name="ageCategory"
                value={currentEvent.ageCategory}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="Under 9">Under 9</option>
                <option value="Under 13">Under 13</option>
                <option value="Under 15">Under 15</option>
                <option value="Under 17">Under 17</option>
                <option value="Under 19">Under 19</option>
                <option value="Open">Open</option>
              </select>
            </div>
            
            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={currentEvent.gender}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            
            {/* Event Type */}
            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-300 mb-1">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                id="eventType"
                name="eventType"
                value={currentEvent.eventType}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select Event Type</option>
                <option value="Singles">Singles</option>
                <option value="Doubles">Doubles</option>
                <option value="Team">Team</option>
              </select>
            </div>
            
            {/* Match Type */}
            <div>
              <label htmlFor="matchType" className="block text-sm font-medium text-gray-300 mb-1">
                Match Type <span className="text-red-500">*</span>
              </label>
              <select
                id="matchType"
                name="matchType"
                value={currentEvent.matchType}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select Match Type</option>
                <option value="Knockout">Knockout</option>
                <option value="League">League</option>
                <option value="Group+Knockout">Group + Knockout</option>
              </select>
            </div>
            
            {/* Fee */}
            <div>
              <label htmlFor="fee" className="block text-sm font-medium text-gray-300 mb-1">
                Team Entry Fee (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="fee"
                name="fee"
                value={currentEvent.fee}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                min="0"
              />
            </div>
            
            {/* Max Players */}
            <div>
              <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-300 mb-1">
                Max Players/Teams <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="maxPlayers"
                name="maxPlayers"
                value={currentEvent.maxPlayers}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                min="0"
                required
              />
            </div>
            
            {/* Discount */}
            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-300 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                id="discount"
                name="discount"
                value={currentEvent.discount}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                min="0"
                max="100"
              />
            </div>
            
            {/* Allow Booking */}
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="allowBooking"
                name="allowBooking"
                checked={currentEvent.allowBooking}
                onChange={handleChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="allowBooking" className="ml-2 block text-sm text-gray-300">
                Allow Booking
              </label>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleAddEvent}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Event
            </button>
          </div>
        </div>
        
        {/* Events List */}
        {events.length > 0 && (
          <div className="bg-gray-700 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Added Events ({events.length})</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-600">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fee (₹)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Max Players</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-600 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-white">{event.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{event.ageCategory}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{event.eventType}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{event.fee}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{event.maxPlayers}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleRemoveEvent(event.id)}
                          className="text-red-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/organizer/tournaments')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition duration-300"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || events.length === 0}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Save Tournament'
            )}
          </button>
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default AddEvents;