import { useState, useEffect } from 'react';
import { getTournamentBookings, updateBookingStatus, createBooking, associateTeamWithFranchise, removeTeamFromFranchise, getTournamentFranchises } from '../../services/bookingService';
import { getAllFranchises } from '../../services/franchiseService';
import { toast } from 'react-toastify';

const TeamsView = ({ tournamentId, events }) => {
  // Determine registration source (default to 'online' if not specified)
  const getRegistrationSource = (booking) => {
    return booking.registrationSource || 'online';
  };
  
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [franchises, setFranchises] = useState([]);
  const [showAssignFranchiseModal, setShowAssignFranchiseModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState('');
  const [isAssigningFranchise, setIsAssigningFranchise] = useState(false);
  const [ removingFranchiseId ,

    setRemovingFranchiseId ] = useState ( null ) ;

    const [newTeam, setNewTeam] = useState({
      playerName: '',
      email: '',
      phone: '',
      eventId: '',
      franchiseId: '',
      dateOfBirth: '',
      gender: '',
      tShirtSize: '',
      registrationSource: 'offline' // Added to track if team was added by organizer
    });
  const [isAddingTeam, setIsAddingTeam] = useState(false);

  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        // Replace getAllFranchises with getTournamentFranchises
        const response = await getTournamentFranchises(tournamentId);
        setFranchises(response.data.data || []); // Access franchises from response.data.data
      } catch (error) {
        console.error('Error fetching franchises:', error);
      }
    };
    
    fetchFranchises();
  }, [tournamentId]);
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const response = await getTournamentBookings(tournamentId);
        const fetchedBookings = response.data.data;
        
        // Auto-confirm any pending bookings (both online and offline)
        const bookingsToConfirm = fetchedBookings.filter(booking => booking.status === 'Pending');
        
        if (bookingsToConfirm.length > 0) {
          const confirmPromises = bookingsToConfirm.map(booking => 
            updateBookingStatus(booking._id, 'Confirmed')
          );
          
          await Promise.all(confirmPromises);
          
          // Update the status in the fetched bookings
          const updatedBookings = fetchedBookings.map(booking => 
            booking.status === 'Pending' ? { ...booking, status: 'Confirmed' } : booking
          );
          
          setBookings(updatedBookings);
        } else {
          setBookings(fetchedBookings);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError(error.response?.data?.message || 'Failed to fetch bookings');
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, [tournamentId]);

  const handleRemoveFromFranchise = async (bookingId) => {
    try {
      setRemovingFranchiseId(bookingId);
      
      await removeTeamFromFranchise(bookingId);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId ? { ...booking, franchise: null } : booking
        )
      );
      
      toast.success('Team removed from franchise successfully');
    } catch (error) {
      console.error('Error removing team from franchise:', error);
      toast.error(error.response?.data?.message || 'Failed to remove team from franchise');
    } finally {
      setRemovingFranchiseId(null);
    }
  };
  
    // Filter bookings by selected event and search term
    const filteredBookings = bookings
    .filter(booking => selectedEventId === 'all' || booking.event === selectedEventId)
    .filter(booking => {
      if (!searchTerm.trim()) return true;
      
      const term = searchTerm.toLowerCase().trim();
      return (
        booking.playerName.toLowerCase().includes(term) ||
        booking.email.toLowerCase().includes(term) ||
        booking.phone.toLowerCase().includes(term)
      );
    });
  
  // Count online and offline registrations
  const onlineCount = filteredBookings.filter(booking => 
    getRegistrationSource(booking) === 'online'
  ).length;
  
  const offlineCount = filteredBookings.filter(booking => 
    getRegistrationSource(booking) === 'offline'
  ).length;
  
  // Get event name by ID
  const getEventName = (eventId) => {
    const event = events.find(e => e._id === eventId);
    return event ? event.name : 'Unknown Event';
  };

  // Get franchise name by ID
  const getFranchiseName = (franchiseId) => {
    if (!franchiseId) return 'Unassigned';
    const franchise = franchises.find(f => f._id === franchiseId);
    return franchise ? franchise.franchiseName : 'Unknown Franchise';
  };

  // Handle status update
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setUpdatingBookingId(bookingId);
      await updateBookingStatus(bookingId, newStatus);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
      
      toast.success(`Team status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingBookingId(null);
    }
  };

  // Handle input change for new team
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeam(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add team form submission
  const handleAddTeam = async (e) => {
    e.preventDefault();
    
    if (!newTeam.playerName || !newTeam.email || !newTeam.phone || !newTeam.eventId || !newTeam.dateOfBirth || !newTeam.gender || !newTeam.tShirtSize) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setIsAddingTeam(true);
      
      // Create booking with the team data
      const response = await createBooking({
        tournamentId,
        eventId: newTeam.eventId,
        playerName: newTeam.playerName,
        email: newTeam.email,
        phone: newTeam.phone,
        franchiseId: newTeam.franchiseId || null,
        dateOfBirth: newTeam.dateOfBirth,
        gender: newTeam.gender,
        tShirtSize: newTeam.tShirtSize,
        registrationSource: 'offline' // Mark as added by organizer
      });
      
      // Immediately confirm the booking
      await updateBookingStatus(response.data.data._id, 'Confirmed');
      
      // Add the new team to the local state with confirmed status
      setBookings(prev => [...prev, {
        ...response.data.data,
        status: 'Confirmed',
        registrationSource: 'offline',
        franchise: newTeam.franchiseId || null
      }]);
      
      // Reset form and close modal
      setNewTeam({
        playerName: '',
        email: '',
        phone: '',
        eventId: '',
        franchiseId: '',
        dateOfBirth: '',
        gender: '',
        tShirtSize: '',
        registrationSource: 'offline'
      });
      setShowAddTeamModal(false);
      
      toast.success('Team added successfully');
    } catch (error) {
      console.error('Error adding team:', error);
      toast.error(error.response?.data?.message || 'Failed to add team');
    } finally {
      setIsAddingTeam(false);
    }
  };

  // Open assign franchise modal
  const openAssignFranchiseModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    const booking = bookings.find(b => b._id === bookingId);
    setSelectedFranchiseId(booking.franchise || '');
    setShowAssignFranchiseModal(true);
  };

  // Handle assign franchise
  const handleAssignFranchise = async (e) => {
    e.preventDefault();
    
    try {
      setIsAssigningFranchise(true);
      
      await associateTeamWithFranchise(selectedBookingId, selectedFranchiseId);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === selectedBookingId ? { ...booking, franchise: selectedFranchiseId } : booking
        )
      );
      
      setShowAssignFranchiseModal(false);
      toast.success('Team assigned to franchise successfully');
    } catch (error) {
      console.error('Error assigning franchise:', error);
      toast.error(error.response?.data?.message || 'Failed to assign franchise');
    } finally {
      setIsAssigningFranchise(false);
    }
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Teams</h2>
          <div className="flex mt-2 space-x-4">
            <div className="text-sm text-gray-300">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300 mr-2">
                Online
              </span>
              {onlineCount} teams
            </div>
            <div className="text-sm text-gray-300">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300 mr-2">
                Offline
              </span>
              {offlineCount} teams
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {/* Add Team button */}
          <button
            onClick={() => setShowAddTeamModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Team
          </button>
          
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
      </div>

       {/* Add search bar */}
       <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 pl-10 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
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
                    Registration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Franchise
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
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
                      {getFranchiseName(booking.franchise)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
      {updatingBookingId === booking._id || removingFranchiseId === booking._id ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500 mr-2"></div>
          <span>Updating...</span>
        </div>
      ) : (
        <div className="flex space-x-2">
          {/* Show confirm button for cancelled teams */}
          {booking.status !== 'Confirmed' && (
            <button
              onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}
              className="bg-green-700 hover:bg-green-600 text-white text-xs py-1 px-2 rounded transition-colors duration-300"
            >
              Confirm
            </button>
          )}
          
          {/* Only show cancel button for non-cancelled teams */}
          {booking.status !== 'Cancelled' && (
            <button
              onClick={() => handleStatusUpdate(booking._id, 'Cancelled')}
              className="bg-red-700 hover:bg-red-600 text-white text-xs py-1 px-2 rounded transition-colors duration-300"
            >
              Cancel
            </button>
          )}

          {/* Show Remove button for teams assigned to a franchise */}
          {booking.franchise ? (
            <button
              onClick={() => handleRemoveFromFranchise(booking._id)}
              className="bg-yellow-700 hover:bg-yellow-600 text-white text-xs py-1 px-2 rounded transition-colors duration-300"
            >
              Remove
            </button>
          ) : (
            /* Assign Franchise button */
            <button
              onClick={() => openAssignFranchiseModal(booking._id)}
              className="bg-blue-700 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded transition-colors duration-300"
            >
              Assign Franchise
            </button>
          )}
        </div>
      )}
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
      
      {/* Add Team Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Add Team</h3>
              <button
                onClick={() => setShowAddTeamModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Event
                </label>
                <select
                  name="eventId"
                  value={newTeam.eventId}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select Event</option>
                  {events.map(event => (
                    <option key={event._id} value={event._id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  name="playerName"
                  value={newTeam.playerName}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newTeam.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={newTeam.phone}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Franchise (Optional)
                </label>
                <select
                  name="franchiseId"
                  value={newTeam.franchiseId}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select Franchise (Optional)</option>
                  {franchises.map(franchise => (
                    <option key={franchise._id} value={franchise._id}>
                      {franchise.franchiseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
  <label className="block text-sm font-medium text-gray-300 mb-1">
    Date of Birth
  </label>
  <input
    type="date"
    name="dateOfBirth"
    value={newTeam.dateOfBirth}
    onChange={handleInputChange}
    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
    required
  />
</div>

<div className="mb-4">
  <label className="block text-sm font-medium text-gray-300 mb-1">
    Gender
  </label>
  <select
    name="gender"
    value={newTeam.gender}
    onChange={handleInputChange}
    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
    required
  >
    <option value="">Select Gender</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
</div>

<div className="mb-4">
  <label className="block text-sm font-medium text-gray-300 mb-1">
    T-Shirt Size
  </label>
  <select
    name="tShirtSize"
    value={newTeam.tShirtSize}
    onChange={handleInputChange}
    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
    required
  >
    <option value="">Select T-Shirt Size</option>
    <option value="S">S</option>
    <option value="M">M</option>
    <option value="L">L</option>
    <option value="XL">XL</option>
    <option value="XXL">XXL</option>
  </select>
</div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
                  disabled={isAddingTeam}
                >
                  {isAddingTeam ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    'Add Team'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Franchise Modal */}
      {showAssignFranchiseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Assign Franchise</h3>
              <button
                onClick={() => setShowAssignFranchiseModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAssignFranchise}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Franchise
                </label>
                <select
                  value={selectedFranchiseId}
                  onChange={(e) => setSelectedFranchiseId(e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Unassigned</option>
                  {franchises.map(franchise => (
                    <option key={franchise._id} value={franchise._id}>
                      {franchise.franchiseName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAssignFranchiseModal(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
                  disabled={isAssigningFranchise}
                >
                  {isAssigningFranchise ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Assigning...
                    </>
                  ) : (
                    'Assign Franchise'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsView;