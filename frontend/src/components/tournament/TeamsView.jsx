// import { useState, useEffect } from 'react';
// import { getTournamentBookings, updateBookingStatus } from '../../services/bookingService';
// import { toast } from 'react-toastify';

// const TeamsView = ({ tournamentId, events }) => {
//   const [bookings, setBookings] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [selectedEventId, setSelectedEventId] = useState('all');
//   const [updatingBookingId, setUpdatingBookingId] = useState(null);
  
//   useEffect(() => {
//     const fetchBookings = async () => {
//       try {
//         setIsLoading(true);
//         const response = await getTournamentBookings(tournamentId);
//         setBookings(response.data.data);
//         setIsLoading(false);
//       } catch (error) {
//         console.error('Error fetching bookings:', error);
//         setError(error.response?.data?.message || 'Failed to fetch bookings');
//         setIsLoading(false);
//       }
//     };
    
//     fetchBookings();
//   }, [tournamentId]);
  
//   // Filter bookings by selected event
//   const filteredBookings = selectedEventId === 'all' 
//     ? bookings 
//     : bookings.filter(booking => booking.event === selectedEventId);
  
//   // Get event name by ID
//   const getEventName = (eventId) => {
//     const event = events.find(e => e._id === eventId);
//     return event ? event.name : 'Unknown Event';
//   };

//   // Handle status update
//   const handleStatusUpdate = async (bookingId, newStatus) => {
//     try {
//       setUpdatingBookingId(bookingId);
//       await updateBookingStatus(bookingId, newStatus);
      
//       // Update local state
//       setBookings(prevBookings => 
//         prevBookings.map(booking => 
//           booking._id === bookingId ? { ...booking, status: newStatus } : booking
//         )
//       );
      
//       toast.success(`Team status updated to ${newStatus}`);
//     } catch (error) {
//       console.error('Error updating booking status:', error);
//       toast.error(error.response?.data?.message || 'Failed to update status');
//     } finally {
//       setUpdatingBookingId(null);
//     }
//   };
  
//   return (
//     <div className="mb-6">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold text-white">Teams</h2>
        
//         {/* Event filter dropdown */}
//         <div className="relative">
//           <select
//             value={selectedEventId}
//             onChange={(e) => setSelectedEventId(e.target.value)}
//             className="bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
//           >
//             <option value="all">All Events</option>
//             {events.map(event => (
//               <option key={event._id} value={event._id}>
//                 {event.name}
//               </option>
//             ))}
//           </select>
//           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
//             <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
//               <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
//             </svg>
//           </div>
//         </div>
//       </div>
      
//       {isLoading ? (
//         <div className="flex justify-center items-center py-10">
//           <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
//         </div>
//       ) : error ? (
//         <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 rounded-md">
//           {error}
//         </div>
//       ) : filteredBookings.length > 0 ? (
//         <div className="bg-gray-800 rounded-xl overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-700">
//               <thead className="bg-gray-700">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Team Name
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Event
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Email
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Phone
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-gray-800 divide-y divide-gray-700">
//                 {filteredBookings.map((booking) => (
//                   <tr key={booking._id} className="hover:bg-gray-700">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
//                       {booking.playerName}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                       {getEventName(booking.event)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                       {booking.email}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                       {booking.phone}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'Confirmed' ? 'bg-green-900 text-green-300' : booking.status === 'Cancelled' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
//                         {booking.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                       {updatingBookingId === booking._id ? (
//                         <div className="flex items-center">
//                           <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500 mr-2"></div>
//                           <span>Updating...</span>
//                         </div>
//                       ) : (
//                         <div className="flex space-x-2">
//                           {booking.status !== 'Confirmed' && (
//                             <button
//                               onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}
//                               className="bg-green-700 hover:bg-green-600 text-white text-xs py-1 px-2 rounded transition-colors duration-300"
//                             >
//                               Confirm
//                             </button>
//                           )}
//                           {booking.status !== 'Pending' && booking.status !== 'Cancelled' && (
//                             <button
//                               onClick={() => handleStatusUpdate(booking._id, 'Pending')}
//                               className="bg-yellow-700 hover:bg-yellow-600 text-white text-xs py-1 px-2 rounded transition-colors duration-300"
//                             >
//                               Pending
//                             </button>
//                           )}
//                           {booking.status !== 'Cancelled' && (
//                             <button
//                               onClick={() => handleStatusUpdate(booking._id, 'Cancelled')}
//                               className="bg-red-700 hover:bg-red-600 text-white text-xs py-1 px-2 rounded transition-colors duration-300"
//                             >
//                               Cancel
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-gray-800 rounded-xl p-6 text-center">
//           <p className="text-gray-400">
//             No teams registered for {selectedEventId === 'all' ? 'any events' : 'this event'} yet.
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TeamsView;

// import { useState, useEffect } from 'react';
// import { getTournamentBookings, updateBookingStatus, createBooking } from '../../services/bookingService';
// import { toast } from 'react-toastify';

// const TeamsView = ({ tournamentId, events }) => {
//   const [bookings, setBookings] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [selectedEventId, setSelectedEventId] = useState('all');
//   const [updatingBookingId, setUpdatingBookingId] = useState(null);
//   const [showAddTeamModal, setShowAddTeamModal] = useState(false);
//   const [newTeam, setNewTeam] = useState({
//     playerName: '',
//     email: '',
//     phone: '',
//     eventId: '',
//     registrationSource: 'offline' // Added to track if team was added by organizer
//   });
//   const [isAddingTeam, setIsAddingTeam] = useState(false);
  
//   useEffect(() => {
//     const fetchBookings = async () => {
//       try {
//         setIsLoading(true);
//         const response = await getTournamentBookings(tournamentId);
//         setBookings(response.data.data);
//         setIsLoading(false);
//       } catch (error) {
//         console.error('Error fetching bookings:', error);
//         setError(error.response?.data?.message || 'Failed to fetch bookings');
//         setIsLoading(false);
//       }
//     };
    
//     fetchBookings();
//   }, [tournamentId]);
  
//   // Filter bookings by selected event
//   const filteredBookings = selectedEventId === 'all' 
//     ? bookings 
//     : bookings.filter(booking => booking.event === selectedEventId);
  
//   // Get event name by ID
//   const getEventName = (eventId) => {
//     const event = events.find(e => e._id === eventId);
//     return event ? event.name : 'Unknown Event';
//   };

//   // Handle status update
//   const handleStatusUpdate = async (bookingId, newStatus) => {
//     try {
//       setUpdatingBookingId(bookingId);
//       await updateBookingStatus(bookingId, newStatus);
      
//       // Update local state
//       setBookings(prevBookings => 
//         prevBookings.map(booking => 
//           booking._id === bookingId ? { ...booking, status: newStatus } : booking
//         )
//       );
      
//       toast.success(`Team status updated to ${newStatus}`);
//     } catch (error) {
//       console.error('Error updating booking status:', error);
//       toast.error(error.response?.data?.message || 'Failed to update status');
//     } finally {
//       setUpdatingBookingId(null);
//     }
//   };

//   // Handle input change for new team
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewTeam(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle add team form submission
//   const handleAddTeam = async (e) => {
//     e.preventDefault();
    
//     if (!newTeam.playerName || !newTeam.email || !newTeam.phone || !newTeam.eventId) {
//       toast.error('Please fill in all fields');
//       return;
//     }
    
//     try {
//       setIsAddingTeam(true);
      
//       // Create booking with the team data
//       const response = await createBooking({
//         tournamentId,
//         eventId: newTeam.eventId,
//         playerName: newTeam.playerName,
//         email: newTeam.email,
//         phone: newTeam.phone,
//         registrationSource: 'offline' // Mark as added by organizer
//       });
      
//       // Immediately confirm the booking
//       await updateBookingStatus(response.data.data._id, 'Confirmed');
      
//       // Add the new team to the local state with confirmed status
//       setBookings(prev => [...prev, {
//         ...response.data.data,
//         status: 'Confirmed',
//         registrationSource: 'offline'
//       }]);
      
//       // Reset form and close modal
//       setNewTeam({
//         playerName: '',
//         email: '',
//         phone: '',
//         eventId: '',
//         registrationSource: 'offline'
//       });
//       setShowAddTeamModal(false);
      
//       toast.success('Team added successfully');
//     } catch (error) {
//       console.error('Error adding team:', error);
//       toast.error(error.response?.data?.message || 'Failed to add team');
//     } finally {
//       setIsAddingTeam(false);
//     }
//   };
  
//   // Determine registration source (default to 'online' if not specified)
//   const getRegistrationSource = (booking) => {
//     return booking.registrationSource || 'online';
//   };
  
//   return (
//     <div className="mb-6">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold text-white">Teams</h2>
        
//         <div className="flex space-x-3">
//           {/* Add Team button */}
//           <button
//             onClick={() => setShowAddTeamModal(true)}
//             className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-5 w-5 mr-1"
//               viewBox="0 0 20 20"
//               fill="currentColor"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             Add Team
//           </button>
          
//           {/* Event filter dropdown */}
//           <div className="relative">
//             <select
//               value={selectedEventId}
//               onChange={(e) => setSelectedEventId(e.target.value)}
//               className="bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
//             >
//               <option value="all">All Events</option>
//               {events.map(event => (
//                 <option key={event._id} value={event._id}>
//                   {event.name}
//                 </option>
//               ))}
//             </select>
//             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
//               <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
//                 <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
//               </svg>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {isLoading ? (
//         <div className="flex justify-center items-center py-10">
//           <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
//         </div>
//       ) : error ? (
//         <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 rounded-md">
//           {error}
//         </div>
//       ) : filteredBookings.length > 0 ? (
//         <div className="bg-gray-800 rounded-xl overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-700">
//               <thead className="bg-gray-700">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Team Name
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Event
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Email
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Phone
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Registration
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-gray-800 divide-y divide-gray-700">
//                 {filteredBookings.map((booking) => (
//                   <tr key={booking._id} className="hover:bg-gray-700">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
//                       {booking.playerName}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                       {getEventName(booking.event)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                       {booking.email}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                       {booking.phone}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRegistrationSource(booking) === 'online' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
//                         {getRegistrationSource(booking) === 'online' ? 'Online' : 'Offline'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'Confirmed' ? 'bg-green-900 text-green-300' : booking.status === 'Cancelled' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
//                         {booking.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                       {updatingBookingId === booking._id ? (
//                         <div className="flex items-center">
//                           <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500 mr-2"></div>
//                           <span>Updating...</span>
//                         </div>
//                       ) : (
//                         <div className="flex space-x-2">
//                           {/* Show status badge instead of buttons for all teams */}
//                           {booking.status !== 'Confirmed' && (
//                             <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
//                               Confirmed
//                             </span>
//                           )}
                          
//                           {/* Only show cancel button */}
//                           {booking.status !== 'Cancelled' && (
//                             <button
//                               onClick={() => handleStatusUpdate(booking._id, 'Cancelled')}
//                               className="bg-red-700 hover:bg-red-600 text-white text-xs py-1 px-2 rounded transition-colors duration-300"
//                             >
//                               Cancel
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-gray-800 rounded-xl p-6 text-center">
//           <p className="text-gray-400">
//             No teams registered for {selectedEventId === 'all' ? 'any events' : 'this event'} yet.
//           </p>
//         </div>
//       )}
      
//       {/* Add Team Modal */}
//       {showAddTeamModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
//           <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-white">Add Team</h3>
//               <button
//                 onClick={() => setShowAddTeamModal(false)}
//                 className="text-gray-400 hover:text-white"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-6 w-6"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>
            
//             <form onSubmit={handleAddTeam}>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-300 mb-1">
//                   Event
//                 </label>
//                 <select
//                   name="eventId"
//                   value={newTeam.eventId}
//                   onChange={handleInputChange}
//                   className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
//                   required
//                 >
//                   <option value="">Select Event</option>
//                   {events.map(event => (
//                     <option key={event._id} value={event._id}>
//                       {event.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-300 mb-1">
//                   Team Name
//                 </label>
//                 <input
//                   type="text"
//                   name="playerName"
//                   value={newTeam.playerName}
//                   onChange={handleInputChange}
//                   className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
//                   required
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-300 mb-1">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={newTeam.email}
//                   onChange={handleInputChange}
//                   className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
//                   required
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-300 mb-1">
//                   WhatsApp Number
//                 </label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={newTeam.phone}
//                   onChange={handleInputChange}
//                   className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
//                   required
//                 />
//               </div>
              
//               <div className="flex justify-end space-x-3 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setShowAddTeamModal(false)}
//                   className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
//                   disabled={isAddingTeam}
//                 >
//                   {isAddingTeam ? (
//                     <>
//                       <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
//                       Adding...
//                     </>
//                   ) : (
//                     'Add Team'
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TeamsView;

// import { useState, useEffect } from 'react';
// import { getTournamentBookings, updateBookingStatus, createBooking } from '../../services/bookingService';
// import { toast } from 'react-toastify';

// const TeamsView = ({ tournamentId, events }) => {
//   // Determine registration source (default to 'online' if not specified)
//   const getRegistrationSource = (booking) => {
//     return booking.registrationSource || 'online';
//   };
  
//   const [bookings, setBookings] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [selectedEventId, setSelectedEventId] = useState('all');
//   const [updatingBookingId, setUpdatingBookingId] = useState(null);
//   const [showAddTeamModal, setShowAddTeamModal] = useState(false);
//   const [newTeam, setNewTeam] = useState({
//     playerName: '',
//     email: '',
//     phone: '',
//     eventId: '',
//     registrationSource: 'offline' // Added to track if team was added by organizer
//   });
//   const [isAddingTeam, setIsAddingTeam] = useState(false);
  
//   useEffect(() => {
//     const fetchBookings = async () => {
//       try {
//         setIsLoading(true);
//         const response = await getTournamentBookings(tournamentId);
//         setBookings(response.data.data);
//         setIsLoading(false);
//       } catch (error) {
//         console.error('Error fetching bookings:', error);
//         setError(error.response?.data?.message || 'Failed to fetch bookings');
//         setIsLoading(false);
//       }
//     };
    
//     fetchBookings();
//   }, [tournamentId]);
  
//   // Filter bookings by selected event
//   const filteredBookings = selectedEventId === 'all' 
//     ? bookings 
//     : bookings.filter(booking => booking.event === selectedEventId);
  
//   // Count online and offline registrations
//   const onlineCount = filteredBookings.filter(booking => 
//     getRegistrationSource(booking) === 'online'
//   ).length;
  
//   const offlineCount = filteredBookings.filter(booking => 
//     getRegistrationSource(booking) === 'offline'
//   ).length;
  
//   // Get event name by ID
//   const getEventName = (eventId) => {
//     const event = events.find(e => e._id === eventId);
//     return event ? event.name : 'Unknown Event';
//   };

//   // Handle status update
//   const handleStatusUpdate = async (bookingId, newStatus) => {
//     try {
//       setUpdatingBookingId(bookingId);
//       await updateBookingStatus(bookingId, newStatus);
      
//       // Update local state
//       setBookings(prevBookings => 
//         prevBookings.map(booking => 
//           booking._id === bookingId ? { ...booking, status: newStatus } : booking
//         )
//       );
      
//       toast.success(`Team status updated to ${newStatus}`);
//     } catch (error) {
//       console.error('Error updating booking status:', error);
//       toast.error(error.response?.data?.message || 'Failed to update status');
//     } finally {
//       setUpdatingBookingId(null);
//     }
//   };

//   // Handle input change for new team
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewTeam(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle add team form submission
//   const handleAddTeam = async (e) => {
//     e.preventDefault();
    
//     if (!newTeam.playerName || !newTeam.email || !newTeam.phone || !newTeam.eventId) {
//       toast.error('Please fill in all fields');
//       return;
//     }
    
//     try {
//       setIsAddingTeam(true);
      
//       // Create booking with the team data
//       const response = await createBooking({
//         tournamentId,
//         eventId: newTeam.eventId,
//         playerName: newTeam.playerName,
//         email: newTeam.email,
//         phone: newTeam.phone,
//         registrationSource: 'offline' // Mark as added by organizer
//       });
      
//       // Immediately confirm the booking
//       await updateBookingStatus(response.data.data._id, 'Confirmed');
      
//       // Add the new team to the local state with confirmed status
//       setBookings(prev => [...prev, {
//         ...response.data.data,
//         status: 'Confirmed',
//         registrationSource: 'offline'
//       }]);
      
//       // Reset form and close modal
//       setNewTeam({
//         playerName: '',
//         email: '',
//         phone: '',
//         eventId: '',
//         registrationSource: 'offline'
//       });
//       setShowAddTeamModal(false);
      
//       toast.success('Team added successfully');
//     } catch (error) {
//       console.error('Error adding team:', error);
//       toast.error(error.response?.data?.message || 'Failed to add team');
//     } finally {
//       setIsAddingTeam(false);
//     }
//   };
  
//   return (
//     <div className="mb-6">
//       <div className="flex justify-between items-center mb-4">
//         <div>
//           <h2 className="text-xl font-semibold text-white">Teams</h2>
//           <div className="flex mt-2 space-x-4">
//             <div className="text-sm text-gray-300">
//               <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300 mr-2">
//                 Online
//               </span>
//               {onlineCount} teams
//             </div>
//             <div className="text-sm text-gray-300">
//               <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300 mr-2">
//                 Offline
//               </span>
//               {offlineCount} teams
//             </div>
//           </div>
//         </div>
        
//         <div className="flex space-x-3">
//           {/* Add Team button */}
//           <button
//             onClick={() => setShowAddTeamModal(true)}
//             className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-5 w-5 mr-1"
//               viewBox="0 0 20 20"
//               fill="currentColor"
//             >
//               <path
//                 fillRule="evenodd"
//                 d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             Add Team
//           </button>
          
//           {/* Event filter dropdown */}
//           <div className="relative">
//             <select
//               value={selectedEventId}
//               onChange={(e) => setSelectedEventId(e.target.value)}
//               className="bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
//             >
//               <option value="all">All Events</option>
//               {events.map(event => (
//                 <option key={event._id} value={event._id}>
//                   {event.name}
//                 </option>
//               ))}
//             </select>
//             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
//               <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
//                 <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
//               </svg>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {isLoading ? (
//         <div className="flex justify-center items-center py-10">
//           <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
//         </div>
//       ) : error ? (
//         <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 rounded-md">
//           {error}
//         </div>
//       ) : filteredBookings.length > 0 ? (
//         <div className="bg-gray-800 rounded-xl overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-700">
//               <thead className="bg-gray-700">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Team Name
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Event
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Email
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Phone
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Registration
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-gray-800 divide-y divide-gray-700">
//                 {filteredBookings.map((booking) => (
//                   <tr key={booking._id} className="hover:bg-gray-700">
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
//                       {booking.playerName}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                       {getEventName(booking.event)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                       {booking.email}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                       {booking.phone}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRegistrationSource(booking) === 'online' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
//                         {getRegistrationSource(booking) === 'online' ? 'Online' : 'Offline'}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'Confirmed' ? 'bg-green-900 text-green-300' : booking.status === 'Cancelled' ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}`}>
//                         {booking.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
//                       {updatingBookingId === booking._id ? (
//                         <div className="flex items-center">
//                           <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500 mr-2"></div>
//                           <span>Updating...</span>
//                         </div>
//                       ) : (
//                         <div className="flex space-x-2">
//                           {/* Show confirm button for cancelled teams */}
//                           {booking.status !== 'Confirmed' && (
//                             <button
//                               onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}
//                               className="bg-green-700 hover:bg-green-600 text-white text-xs py-1 px-2 rounded transition-colors duration-300"
//                             >
//                               Confirm
//                             </button>
//                           )}
                          
//                           {/* Only show cancel button for non-cancelled teams */}
//                           {booking.status !== 'Cancelled' && (
//                             <button
//                               onClick={() => handleStatusUpdate(booking._id, 'Cancelled')}
//                               className="bg-red-700 hover:bg-red-600 text-white text-xs py-1 px-2 rounded transition-colors duration-300"
//                             >
//                               Cancel
//                             </button>
//                           )}
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-gray-800 rounded-xl p-6 text-center">
//           <p className="text-gray-400">
//             No teams registered for {selectedEventId === 'all' ? 'any events' : 'this event'} yet.
//           </p>
//         </div>
//       )}
      
//       {/* Add Team Modal */}
//       {showAddTeamModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
//           <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold text-white">Add Team</h3>
//               <button
//                 onClick={() => setShowAddTeamModal(false)}
//                 className="text-gray-400 hover:text-white"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-6 w-6"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M6 18L18 6M6 6l12 12"
//                   />
//                 </svg>
//               </button>
//             </div>
            
//             <form onSubmit={handleAddTeam}>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-300 mb-1">
//                   Event
//                 </label>
//                 <select
//                   name="eventId"
//                   value={newTeam.eventId}
//                   onChange={handleInputChange}
//                   className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
//                   required
//                 >
//                   <option value="">Select Event</option>
//                   {events.map(event => (
//                     <option key={event._id} value={event._id}>
//                       {event.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-300 mb-1">
//                   Team Name
//                 </label>
//                 <input
//                   type="text"
//                   name="playerName"
//                   value={newTeam.playerName}
//                   onChange={handleInputChange}
//                   className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
//                   required
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-300 mb-1">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={newTeam.email}
//                   onChange={handleInputChange}
//                   className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
//                   required
//                 />
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-300 mb-1">
//                   WhatsApp Number
//                 </label>
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={newTeam.phone}
//                   onChange={handleInputChange}
//                   className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
//                   required
//                 />
//               </div>
              
//               <div className="flex justify-end space-x-3 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setShowAddTeamModal(false)}
//                   className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
//                   disabled={isAddingTeam}
//                 >
//                   {isAddingTeam ? (
//                     <>
//                       <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
//                       Adding...
//                     </>
//                   ) : (
//                     'Add Team'
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TeamsView;

import { useState, useEffect } from 'react';
import { getTournamentBookings, updateBookingStatus, createBooking } from '../../services/bookingService';
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
  const [updatingBookingId, setUpdatingBookingId] = useState(null);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [newTeam, setNewTeam] = useState({
    playerName: '',
    email: '',
    phone: '',
    eventId: '',
    registrationSource: 'offline' // Added to track if team was added by organizer
  });
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  
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
  
  // Filter bookings by selected event
  const filteredBookings = selectedEventId === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.event === selectedEventId);
  
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
    
    if (!newTeam.playerName || !newTeam.email || !newTeam.phone || !newTeam.eventId) {
      toast.error('Please fill in all fields');
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
        registrationSource: 'offline' // Mark as added by organizer
      });
      
      // Immediately confirm the booking
      await updateBookingStatus(response.data.data._id, 'Confirmed');
      
      // Add the new team to the local state with confirmed status
      setBookings(prev => [...prev, {
        ...response.data.data,
        status: 'Confirmed',
        registrationSource: 'offline'
      }]);
      
      // Reset form and close modal
      setNewTeam({
        playerName: '',
        email: '',
        phone: '',
        eventId: '',
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
                      {updatingBookingId === booking._id ? (
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
    </div>
  );
};

export default TeamsView;