// // import { useState, useEffect } from 'react';
// // import { getAllFranchises } from '../../services/franchiseService';
// // import { getTournamentBookings, associateTeamWithFranchise, removeTeamFromFranchise } from '../../services/bookingService';
// // import { toast } from 'react-toastify';
// // import { updateTeamEvent } from '../../services/bookingService';

// // const FranchiseFixturesView = ({ tournamentId, events }) => {
// //   const [franchises, setFranchises] = useState([]);
// //   const [bookings, setBookings] = useState([]);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [error, setError] = useState('');
// //   const [selectedFranchise, setSelectedFranchise] = useState(null);
// //   const [selectedTeam, setSelectedTeam] = useState(null);
// //   const [showTeamsList, setShowTeamsList] = useState(false);
// //   const [showEventChangeModal, setShowEventChangeModal] = useState(false);
// //   const [isUpdating, setIsUpdating] = useState(false);

// //   // Fetch franchises and bookings
// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         setIsLoading(true);
        
// //         // Get all franchises
// //         const franchisesResponse = await getAllFranchises();
// //         // Filter franchises for this tournament
// //         const tournamentFranchises = (franchisesResponse.franchises || []).filter(
// //           franchise => franchise.tournament === tournamentId
// //         );
// //         setFranchises(tournamentFranchises);
        
// //         // Get all bookings for this tournament
// //         const bookingsResponse = await getTournamentBookings(tournamentId);
// //         setBookings(bookingsResponse.data.data);
        
// //         setIsLoading(false);
// //       } catch (error) {
// //         console.error('Error fetching data:', error);
// //         setError(error.response?.data?.message || 'Failed to fetch data');
// //         setIsLoading(false);
// //       }
// //     };
    
// //     fetchData();
// //   }, [tournamentId]);

// //   // Get event name by ID
// //   const getEventName = (eventId) => {
// //     const event = events.find(e => e._id === eventId);
// //     return event ? event.name : 'Unknown Event';
// //   };

// //   // Handle franchise selection
// //   const handleFranchiseSelect = (franchise) => {
// //     setSelectedFranchise(franchise);
// //     setShowTeamsList(true);
// //     setSelectedTeam(null);
// //   };

// //   // Handle team selection
// //   const handleTeamSelect = (team) => {
// //     setSelectedTeam(team);
// //     setShowEventChangeModal(true);
// //   };

// //   // Handle changing team's event
// //   const handleChangeEvent = async (newEventId) => {
// //     if (!selectedTeam) return;
    
// //     try {
// //       setIsUpdating(true);
// //       await updateTeamEvent(selectedTeam._id, newEventId);
      
// //       // Update local state
// //       setBookings(prevBookings => 
// //         prevBookings.map(booking => 
// //           booking._id === selectedTeam._id ? { ...booking, event: newEventId } : booking
// //         )
// //       );
      
// //       setShowEventChangeModal(false);
// //       toast.success(`Team successfully moved to ${getEventName(newEventId)}`);
// //     } catch (error) {
// //       console.error('Error updating team event:', error);
// //       toast.error(error.response?.data?.message || 'Failed to update team event');
// //     } finally {
// //       setIsUpdating(false);
// //     }
// //   };

// //   // Get teams for a franchise
// //   const getFranchiseTeams = (franchiseId) => {
// //     return bookings.filter(booking => booking.franchise === franchiseId);
// //   };

// //   return (
// //     <div className="mb-6">
// //       <div className="flex justify-between items-center mb-4">
// //         <h2 className="text-xl font-semibold text-white">Franchise Teams</h2>
// //       </div>
      
// //       {isLoading ? (
// //         <div className="flex justify-center items-center py-10">
// //           <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
// //         </div>
// //       ) : error ? (
// //         <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 rounded-md">
// //           {error}
// //         </div>
// //       ) : franchises.length === 0 ? (
// //         <div className="bg-gray-800 p-4 rounded-md text-gray-300">
// //           No franchise owners registered for this tournament.
// //         </div>
// //       ) : (
// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //           {/* Franchises List */}
// //           <div className="md:col-span-1 bg-gray-800 rounded-xl p-4">
// //             <h3 className="text-lg font-medium text-white mb-3">Franchises</h3>
// //             <div className="space-y-2">
// //               {franchises.map(franchise => (
// //                 <div 
// //                   key={franchise._id}
// //                   onClick={() => handleFranchiseSelect(franchise)}
// //                   className={`p-3 rounded-md cursor-pointer transition-colors ${selectedFranchise?._id === franchise._id ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
// //                 >
// //                   <h4 className="font-medium text-white">{franchise.franchiseName}</h4>
// //                   <p className="text-sm text-gray-300">Owner: {franchise.ownerName}</p>
// //                   <p className="text-xs text-gray-400">Teams: {getFranchiseTeams(franchise._id).length}</p>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
          
// //           {/* Teams List */}
// //           <div className="md:col-span-2 bg-gray-800 rounded-xl p-4">
// //             {showTeamsList && selectedFranchise ? (
// //               <div>
// //                 <div className="flex justify-between items-center mb-3">
// //                   <h3 className="text-lg font-medium text-white">{selectedFranchise.franchiseName}'s Teams</h3>
// //                 </div>
                
// //                 {/* Franchise's Teams */}
// //                 <div className="mb-6">
// //                   <h4 className="text-md font-medium text-white mb-2">Teams</h4>
// //                   {getFranchiseTeams(selectedFranchise._id).length > 0 ? (
// //                     <div className="bg-gray-700 rounded-md overflow-hidden">
// //                       <table className="min-w-full divide-y divide-gray-600">
// //                         <thead className="bg-gray-800">
// //                           <tr>
// //                             <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Team Name</th>
// //                             <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Current Event</th>
// //                             <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Action</th>
// //                           </tr>
// //                         </thead>
// //                         <tbody className="divide-y divide-gray-600">
// //                           {getFranchiseTeams(selectedFranchise._id).map(team => (
// //                             <tr key={team._id} className="hover:bg-gray-600">
// //                               <td className="px-4 py-2 whitespace-nowrap text-sm text-white">{team.playerName}</td>
// //                               <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{getEventName(team.event)}</td>
// //                               <td className="px-4 py-2 whitespace-nowrap text-sm">
// //                                 <button
// //                                   onClick={() => handleTeamSelect(team)}
// //                                   className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors"
// //                                 >
// //                                   Change Event
// //                                 </button>
// //                               </td>
// //                             </tr>
// //                           ))}
// //                         </tbody>
// //                       </table>
// //                     </div>
// //                   ) : (
// //                     <p className="text-gray-400 italic">No teams associated with this franchise yet.</p>
// //                   )}
// //                 </div>
// //               </div>
// //             ) : (
// //               <div className="flex justify-center items-center h-40 text-gray-400">
// //                 Select a franchise to view and manage teams
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       )}
      
// //       {/* Event Change Modal */}
// //       {showEventChangeModal && selectedTeam && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
// //           <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
// //             <div className="flex justify-between items-center mb-4">
// //               <h3 className="text-lg font-semibold text-white">Change Event for {selectedTeam.playerName}</h3>
// //               <button
// //                 onClick={() => setShowEventChangeModal(false)}
// //                 className="text-gray-400 hover:text-white"
// //               >
// //                 <svg
// //                   xmlns="http://www.w3.org/2000/svg"
// //                   className="h-6 w-6"
// //                   fill="none"
// //                   viewBox="0 0 24 24"
// //                   stroke="currentColor"
// //                 >
// //                   <path
// //                     strokeLinecap="round"
// //                     strokeLinejoin="round"
// //                     strokeWidth={2}
// //                     d="M6 18L18 6M6 6l12 12"
// //                   />
// //                 </svg>
// //               </button>
// //             </div>
            
// //             <div className="mb-4">
// //               <label className="block text-sm font-medium text-gray-300 mb-1">
// //                 Select New Event
// //               </label>
// //               <select
// //                 className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
// //                 onChange={(e) => handleChangeEvent(e.target.value)}
// //                 defaultValue=""
// //               >
// //                 <option value="" disabled>Select Event</option>
// //                 {events.map(event => (
// //                   <option key={event._id} value={event._id}>
// //                     {event.name}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
            
// //             <div className="flex justify-end space-x-2">
// //               <button
// //                 onClick={() => setShowEventChangeModal(false)}
// //                 className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
// //               >
// //                 Cancel
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default FranchiseFixturesView;

// import { useState, useEffect } from 'react';
// import { getAllFranchises } from '../../services/franchiseService';
// import { getTournamentBookings, updateTeamEvent } from '../../services/bookingService';
// import { toast } from 'react-toastify';

// const FranchiseFixturesView = ({ tournamentId, events }) => {
//   const [franchises, setFranchises] = useState([]);
//   const [bookings, setBookings] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [selectedFranchise, setSelectedFranchise] = useState(null);
//   const [selectedTeam, setSelectedTeam] = useState(null);
//   const [showTeamsList, setShowTeamsList] = useState(false);
//   const [showEventChangeModal, setShowEventChangeModal] = useState(false);
//   const [isUpdating, setIsUpdating] = useState(false);
  
//   // New state variables for fixture generation
//   const [pools, setPools] = useState({ A: [], B: [] });
//   const [selectedPool, setSelectedPool] = useState('A');
//   const [fixtures, setFixtures] = useState({ poolA: [], poolB: [], knockout: [] });
//   const [showFixtures, setShowFixtures] = useState(false);
//   const [isGeneratingFixtures, setIsGeneratingFixtures] = useState(false);
//   const [fixtureError, setFixtureError] = useState('');
//   const [expandedMatch, setExpandedMatch] = useState(null);

//   // Fetch franchises and bookings
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
        
//         // Get all franchises
//         const franchisesResponse = await getAllFranchises();
//         // Filter franchises for this tournament
//         const tournamentFranchises = (franchisesResponse.franchises || []).filter(
//           franchise => franchise.tournament === tournamentId
//         );
//         setFranchises(tournamentFranchises);
        
//         // Get all bookings for this tournament
//         const bookingsResponse = await getTournamentBookings(tournamentId);
//         setBookings(bookingsResponse.data.data);
        
//         // Automatically distribute franchises into pools if we have 8 franchises
//         if (tournamentFranchises.length >= 8) {
//           const poolA = tournamentFranchises.slice(0, 4);
//           const poolB = tournamentFranchises.slice(4, 8);
//           setPools({ A: poolA, B: poolB });
//         }
        
//         setIsLoading(false);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setError(error.response?.data?.message || 'Failed to fetch data');
//         setIsLoading(false);
//       }
//     };
    
//     fetchData();
//   }, [tournamentId]);

//   // Get event name by ID
//   const getEventName = (eventId) => {
//     const event = events.find(e => e._id === eventId);
//     return event ? event.name : 'Unknown Event';
//   };

//   // Handle franchise selection
//   const handleFranchiseSelect = (franchise) => {
//     setSelectedFranchise(franchise);
//     setShowTeamsList(true);
//     setSelectedTeam(null);
//   };

//   // Handle team selection
//   const handleTeamSelect = (team) => {
//     setSelectedTeam(team);
//     setShowEventChangeModal(true);
//   };

//   // Handle changing team's event
//   const handleChangeEvent = async (newEventId) => {
//     if (!selectedTeam) return;
    
//     try {
//       setIsUpdating(true);
//       await updateTeamEvent(selectedTeam._id, newEventId);
      
//       // Update local state
//       setBookings(prevBookings => 
//         prevBookings.map(booking => 
//           booking._id === selectedTeam._id ? { ...booking, event: newEventId } : booking
//         )
//       );
      
//       setShowEventChangeModal(false);
//       toast.success(`Team successfully moved to ${getEventName(newEventId)}`);
//     } catch (error) {
//       console.error('Error updating team event:', error);
//       toast.error(error.response?.data?.message || 'Failed to update team event');
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   // Get teams for a franchise
//   const getFranchiseTeams = (franchiseId) => {
//     return bookings.filter(booking => booking.franchise === franchiseId);
//   };

//   // Generate round-robin fixtures for a pool
//   const generatePoolFixtures = (poolFranchises) => {
//     const fixtures = [];
    
//     // Round-robin algorithm: each franchise plays against all others in the pool
//     for (let i = 0; i < poolFranchises.length; i++) {
//       for (let j = i + 1; j < poolFranchises.length; j++) {
//         const franchise1 = poolFranchises[i];
//         const franchise2 = poolFranchises[j];
        
//         // Create a match between these two franchises
//         fixtures.push({
//           id: `match-${i}-${j}`,
//           franchise1: franchise1,
//           franchise2: franchise2,
//           date: new Date().toISOString().split('T')[0], // Default to today
//           time: '09:30 AM',
//           court: 1,
//           score: '0-0',
//           eventMatches: events.map(event => ({
//             eventId: event._id,
//             eventName: event.name,
//             team1: null, // Will be assigned manually
//             team2: null, // Will be assigned manually
//             score: '0-0'
//           }))
//         });
//       }
//     }
    
//     return fixtures;
//   };

//   // Generate knockout fixtures
//   const generateKnockoutFixtures = (poolAWinners, poolBWinners) => {
//     const knockoutFixtures = [
//       // Semi-finals
//       {
//         id: 'sf-1',
//         round: 'Semi Final',
//         franchise1: poolAWinners[0], // 1st from Pool A
//         franchise2: poolBWinners[1], // 2nd from Pool B
//         date: new Date().toISOString().split('T')[0],
//         time: '09:30 AM',
//         court: 1,
//         score: '0-0',
//         eventMatches: events.map(event => ({
//           eventId: event._id,
//           eventName: event.name,
//           team1: null,
//           team2: null,
//           score: '0-0'
//         }))
//       },
//       {
//         id: 'sf-2',
//         round: 'Semi Final',
//         franchise1: poolBWinners[0], // 1st from Pool B
//         franchise2: poolAWinners[1], // 2nd from Pool A
//         date: new Date().toISOString().split('T')[0],
//         time: '09:30 AM',
//         court: 1,
//         score: '0-0',
//         eventMatches: events.map(event => ({
//           eventId: event._id,
//           eventName: event.name,
//           team1: null,
//           team2: null,
//           score: '0-0'
//         }))
//       },
//       // Final
//       {
//         id: 'final',
//         round: 'Final',
//         franchise1: { franchiseName: 'Winner SF1' }, // Placeholder
//         franchise2: { franchiseName: 'Winner SF2' }, // Placeholder
//         date: new Date().toISOString().split('T')[0],
//         time: '09:30 AM',
//         court: 1,
//         score: '0-0',
//         eventMatches: events.map(event => ({
//           eventId: event._id,
//           eventName: event.name,
//           team1: null,
//           team2: null,
//           score: '0-0'
//         }))
//       }
//     ];
    
//     return knockoutFixtures;
//   };

//   // Generate all fixtures
//   const generateFixtures = () => {
//     try {
//       setIsGeneratingFixtures(true);
//       setFixtureError('');
      
//       // Check if we have enough franchises
//       if (franchises.length < 8) {
//         throw new Error('Need at least 8 franchises to generate fixtures');
//       }
      
//       // Generate pool fixtures
//       const poolAFixtures = generatePoolFixtures(pools.A);
//       const poolBFixtures = generatePoolFixtures(pools.B);
      
//       // For demonstration, use the first two franchises from each pool as winners
//       const poolAWinners = [pools.A[0], pools.A[1]];
//       const poolBWinners = [pools.B[0], pools.B[1]];
      
//       // Generate knockout fixtures
//       const knockoutFixtures = generateKnockoutFixtures(poolAWinners, poolBWinners);
      
//       // Set fixtures
//       setFixtures({
//         poolA: poolAFixtures,
//         poolB: poolBFixtures,
//         knockout: knockoutFixtures
//       });
      
//       setShowFixtures(true);
//       toast.success('Fixtures generated successfully!');
//     } catch (error) {
//       console.error('Error generating fixtures:', error);
//       setFixtureError(error.message || 'Failed to generate fixtures');
//       toast.error(error.message || 'Failed to generate fixtures');
//     } finally {
//       setIsGeneratingFixtures(false);
//     }
//   };

//   // Handle court number change
//   const handleCourtChange = (matchId, poolType, courtNumber) => {
//     setFixtures(prevFixtures => {
//       const updatedFixtures = { ...prevFixtures };
      
//       if (poolType === 'knockout') {
//         updatedFixtures.knockout = updatedFixtures.knockout.map(match => 
//           match.id === matchId ? { ...match, court: courtNumber } : match
//         );
//       } else if (poolType === 'A') {
//         updatedFixtures.poolA = updatedFixtures.poolA.map(match => 
//           match.id === matchId ? { ...match, court: courtNumber } : match
//         );
//       } else if (poolType === 'B') {
//         updatedFixtures.poolB = updatedFixtures.poolB.map(match => 
//           match.id === matchId ? { ...match, court: courtNumber } : match
//         );
//       }
      
//       return updatedFixtures;
//     });
//   };

//   // Handle team assignment to event
//   const handleTeamAssignment = (matchId, poolType, eventId, franchiseSide, teamId) => {
//     setFixtures(prevFixtures => {
//       const updatedFixtures = { ...prevFixtures };
//       let targetPool;
      
//       if (poolType === 'knockout') {
//         targetPool = 'knockout';
//       } else if (poolType === 'A') {
//         targetPool = 'poolA';
//       } else if (poolType === 'B') {
//         targetPool = 'poolB';
//       }
      
//       updatedFixtures[targetPool] = updatedFixtures[targetPool].map(match => {
//         if (match.id === matchId) {
//           const updatedEventMatches = match.eventMatches.map(eventMatch => {
//             if (eventMatch.eventId === eventId) {
//               if (franchiseSide === 1) {
//                 return { ...eventMatch, team1: teamId };
//               } else {
//                 return { ...eventMatch, team2: teamId };
//               }
//             }
//             return eventMatch;
//           });
          
//           return { ...match, eventMatches: updatedEventMatches };
//         }
//         return match;
//       });
      
//       return updatedFixtures;
//     });
//   };

//   // Toggle expanded match view
//   const toggleExpandMatch = (matchId) => {
//     setExpandedMatch(expandedMatch === matchId ? null : matchId);
//   };

//   // Get team name by ID
//   const getTeamName = (teamId) => {
//     const team = bookings.find(booking => booking._id === teamId);
//     return team ? team.playerName : 'Not assigned';
//   };

//   return (
//     <div className="mb-6">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold text-white">Franchise Team Management</h2>
//       </div>
      
//       {isLoading ? (
//         <div className="text-center py-4">
//           <div className="spinner"></div>
//           <p className="mt-2 text-gray-300">Loading franchises...</p>
//         </div>
//       ) : error ? (
//         <div className="bg-red-900 text-white p-4 rounded-md mb-4">
//           <p>{error}</p>
//         </div>
//       ) : (
//         <div>
//           {/* Pool Management Section */}
//           <div className="bg-gray-800 p-4 rounded-md mb-6">
//             <h3 className="text-lg font-medium text-white mb-3">Pool Management</h3>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//               <div>
//                 <h4 className="text-md font-medium text-white mb-2">Pool A</h4>
//                 <ul className="bg-gray-700 rounded-md p-2">
//                   {pools.A.length > 0 ? (
//                     pools.A.map(franchise => (
//                       <li key={franchise._id} className="p-2 border-b border-gray-600 last:border-0">
//                         {franchise.franchiseName}
//                       </li>
//                     ))
//                   ) : (
//                     <li className="p-2 text-gray-400">No franchises assigned</li>
//                   )}
//                 </ul>
//               </div>
              
//               <div>
//                 <h4 className="text-md font-medium text-white mb-2">Pool B</h4>
//                 <ul className="bg-gray-700 rounded-md p-2">
//                   {pools.B.length > 0 ? (
//                     pools.B.map(franchise => (
//                       <li key={franchise._id} className="p-2 border-b border-gray-600 last:border-0">
//                         {franchise.franchiseName}
//                       </li>
//                     ))
//                   ) : (
//                     <li className="p-2 text-gray-400">No franchises assigned</li>
//                   )}
//                 </ul>
//               </div>
//             </div>
            
//             <div className="flex justify-end">
//               <button
//                 onClick={generateFixtures}
//                 disabled={isGeneratingFixtures || pools.A.length < 4 || pools.B.length < 4}
//                 className={`px-4 py-2 rounded-md ${isGeneratingFixtures || pools.A.length < 4 || pools.B.length < 4 ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white font-medium transition-colors`}
//               >
//                 {isGeneratingFixtures ? 'Generating...' : 'Generate Fixtures'}
//               </button>
//             </div>
            
//             {fixtureError && (
//               <div className="mt-3 bg-red-900 text-white p-3 rounded-md">
//                 <p>{fixtureError}</p>
//               </div>
//             )}
//           </div>
          
//           {/* Fixtures Display Section */}
//           {showFixtures && (
//             <div className="bg-gray-800 p-4 rounded-md mb-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-medium text-white">Fixtures</h3>
                
//                 <div className="flex items-center">
//                   <label htmlFor="poolSelect" className="mr-2 text-white">View Pool:</label>
//                   <select
//                     id="poolSelect"
//                     value={selectedPool}
//                     onChange={(e) => setSelectedPool(e.target.value)}
//                     className="bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-red-500"
//                   >
//                     <option value="A">Pool A</option>
//                     <option value="B">Pool B</option>
//                     <option value="knockout">Knockout Stage</option>
//                   </select>
//                 </div>
//               </div>
              
//               <div className="space-y-4">
//                 {selectedPool === 'A' && fixtures.poolA.map(match => (
//                   <div key={match.id} className="bg-gray-700 rounded-md overflow-hidden">
//                     <div className="p-3 bg-gray-600 flex justify-between items-center">
//                       <div>
//                         <span className="text-white font-medium">{match.franchise1.franchiseName}</span>
//                         <span className="text-gray-300 mx-2">vs</span>
//                         <span className="text-white font-medium">{match.franchise2.franchiseName}</span>
//                       </div>
                      
//                       <div className="flex items-center space-x-3">
//                         <div className="flex items-center">
//                           <label htmlFor={`court-${match.id}`} className="mr-2 text-white text-sm">Court:</label>
//                           <input
//                             id={`court-${match.id}`}
//                             type="number"
//                             min="1"
//                             value={match.court}
//                             onChange={(e) => handleCourtChange(match.id, 'A', parseInt(e.target.value))}
//                             className="w-16 bg-gray-800 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//                           />
//                         </div>
                        
//                         <button
//                           onClick={() => toggleExpandMatch(match.id)}
//                           className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
//                         >
//                           {expandedMatch === match.id ? 'Hide Details' : 'See All'}
//                         </button>
//                       </div>
//                     </div>
                    
//                     {expandedMatch === match.id && (
//                       <div className="p-3 border-t border-gray-600">
//                         <h4 className="text-white font-medium mb-2">Event Matches</h4>
                        
//                         <div className="space-y-3">
//                           {match.eventMatches.map(eventMatch => (
//                             <div key={eventMatch.eventId} className="bg-gray-800 p-2 rounded-md">
//                               <h5 className="text-white font-medium mb-1">{eventMatch.eventName}</h5>
                              
//                               <div className="grid grid-cols-2 gap-2">
//                                 <div>
//                                   <label className="block text-gray-400 text-xs mb-1">{match.franchise1.franchiseName} Team</label>
//                                   <select
//                                     className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//                                     value={eventMatch.team1 || ''}
//                                     onChange={(e) => handleTeamAssignment(match.id, 'A', eventMatch.eventId, 1, e.target.value)}
//                                   >
//                                     <option value="">Select Team</option>
//                                     {getFranchiseTeams(match.franchise1._id).map(team => (
//                                       <option key={team._id} value={team._id}>
//                                         {team.playerName} ({getEventName(team.event)})
//                                       </option>
//                                     ))}
//                                   </select>
//                                 </div>
                                
//                                 <div>
//                                   <label className="block text-gray-400 text-xs mb-1">{match.franchise2.franchiseName} Team</label>
//                                   <select
//                                     className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//                                     value={eventMatch.team2 || ''}
//                                     onChange={(e) => handleTeamAssignment(match.id, 'A', eventMatch.eventId, 2, e.target.value)}
//                                   >
//                                     <option value="">Select Team</option>
//                                     {getFranchiseTeams(match.franchise2._id).map(team => (
//                                       <option key={team._id} value={team._id}>
//                                         {team.playerName} ({getEventName(team.event)})
//                                       </option>
//                                     ))}
//                                   </select>
//                                 </div>
//                               </div>
                              
//                               <div className="mt-2 text-center">
//                                 <span className="text-white text-sm">
//                                   {eventMatch.team1 ? getTeamName(eventMatch.team1) : 'Not assigned'} vs {eventMatch.team2 ? getTeamName(eventMatch.team2) : 'Not assigned'}
//                                 </span>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
                
//                 {selectedPool === 'B' && fixtures.poolB.map(match => (
//                   <div key={match.id} className="bg-gray-700 rounded-md overflow-hidden">
//                     <div className="p-3 bg-gray-600 flex justify-between items-center">
//                       <div>
//                         <span className="text-white font-medium">{match.franchise1.franchiseName}</span>
//                         <span className="text-gray-300 mx-2">vs</span>
//                         <span className="text-white font-medium">{match.franchise2.franchiseName}</span>
//                       </div>
                      
//                       <div className="flex items-center space-x-3">
//                         <div className="flex items-center">
//                           <label htmlFor={`court-${match.id}`} className="mr-2 text-white text-sm">Court:</label>
//                           <input
//                             id={`court-${match.id}`}
//                             type="number"
//                             min="1"
//                             value={match.court}
//                             onChange={(e) => handleCourtChange(match.id, 'B', parseInt(e.target.value))}
//                             className="w-16 bg-gray-800 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//                           />
//                         </div>
                        
//                         <button
//                           onClick={() => toggleExpandMatch(match.id)}
//                           className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
//                         >
//                           {expandedMatch === match.id ? 'Hide Details' : 'See All'}
//                         </button>
//                       </div>
//                     </div>
                    
//                     {expandedMatch === match.id && (
//                       <div className="p-3 border-t border-gray-600">
//                         <h4 className="text-white font-medium mb-2">Event Matches</h4>
                        
//                         <div className="space-y-3">
//                           {match.eventMatches.map(eventMatch => (
//                             <div key={eventMatch.eventId} className="bg-gray-800 p-2 rounded-md">
//                               <h5 className="text-white font-medium mb-1">{eventMatch.eventName}</h5>
                              
//                               <div className="grid grid-cols-2 gap-2">
//                                 <div>
//                                   <label className="block text-gray-400 text-xs mb-1">{match.franchise1.franchiseName} Team</label>
//                                   <select
//                                     className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//                                     value={eventMatch.team1 || ''}
//                                     onChange={(e) => handleTeamAssignment(match.id, 'B', eventMatch.eventId, 1, e.target.value)}
//                                   >
//                                     <option value="">Select Team</option>
//                                     {getFranchiseTeams(match.franchise1._id).map(team => (
//                                       <option key={team._id} value={team._id}>
//                                         {team.playerName} ({getEventName(team.event)})
//                                       </option>
//                                     ))}
//                                   </select>
//                                 </div>
                                
//                                 <div>
//                                   <label className="block text-gray-400 text-xs mb-1">{match.franchise2.franchiseName} Team</label>
//                                   <select
//                                     className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//                                     value={eventMatch.team2 || ''}
//                                     onChange={(e) => handleTeamAssignment(match.id, 'B', eventMatch.eventId, 2, e.target.value)}
//                                   >
//                                     <option value="">Select Team</option>
//                                     {getFranchiseTeams(match.franchise2._id).map(team => (
//                                       <option key={team._id} value={team._id}>
//                                         {team.playerName} ({getEventName(team.event)})
//                                       </option>
//                                     ))}
//                                   </select>
//                                 </div>
//                               </div>
                              
//                               <div className="mt-2 text-center">
//                                 <span className="text-white text-sm">
//                                   {eventMatch.team1 ? getTeamName(eventMatch.team1) : 'Not assigned'} vs {eventMatch.team2 ? getTeamName(eventMatch.team2) : 'Not assigned'}
//                                 </span>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
                
//                 {selectedPool === 'knockout' && fixtures.knockout.map(match => (
//                   <div key={match.id} className="bg-gray-700 rounded-md overflow-hidden">
//                     <div className="p-3 bg-gray-600 flex justify-between items-center">
//                       <div>
//                         <span className="text-red-500 font-medium mr-2">{match.round}:</span>
//                         <span className="text-white font-medium">{match.franchise1.franchiseName}</span>
//                         <span className="text-gray-300 mx-2">vs</span>
//                         <span className="text-white font-medium">{match.franchise2.franchiseName}</span>
//                       </div>
                      
//                       <div className="flex items-center space-x-3">
//                         <div className="flex items-center">
//                           <label htmlFor={`court-${match.id}`} className="mr-2 text-white text-sm">Court:</label>
//                           <input
//                             id={`court-${match.id}`}
//                             type="number"
//                             min="1"
//                             value={match.court}
//                             onChange={(e) => handleCourtChange(match.id, 'knockout', parseInt(e.target.value))}
//                             className="w-16 bg-gray-800 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//                           />
//                         </div>
                        
//                         <button
//                           onClick={() => toggleExpandMatch(match.id)}
//                           className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
//                         >
//                           {expandedMatch === match.id ? 'Hide Details' : 'See All'}
//                         </button>
//                       </div>
//                     </div>
                    
//                     {expandedMatch === match.id && (
//                       <div className="p-3 border-t border-gray-600">
//                         <h4 className="text-white font-medium mb-2">Event Matches</h4>
                        
//                         <div className="space-y-3">
//                           {match.eventMatches.map(eventMatch => (
//                             <div key={eventMatch.eventId} className="bg-gray-800 p-2 rounded-md">
//                               <h5 className="text-white font-medium mb-1">{eventMatch.eventName}</h5>
                              
//                               <div className="grid grid-cols-2 gap-2">
//                                 <div>
//                                   <label className="block text-gray-400 text-xs mb-1">{match.franchise1.franchiseName} Team</label>
//                                   <select
//                                     className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//                                     value={eventMatch.team1 || ''}
//                                     onChange={(e) => handleTeamAssignment(match.id, 'knockout', eventMatch.eventId, 1, e.target.value)}
//                                     disabled={match.franchise1.franchiseName.includes('Winner')}
//                                   >
//                                     <option value="">Select Team</option>
//                                     {!match.franchise1.franchiseName.includes('Winner') && getFranchiseTeams(match.franchise1._id).map(team => (
//                                       <option key={team._id} value={team._id}>
//                                         {team.playerName} ({getEventName(team.event)})
//                                       </option>
//                                     ))}
//                                   </select>
//                                 </div>
                                
//                                 <div>
//                                   <label className="block text-gray-400 text-xs mb-1">{match.franchise2.franchiseName} Team</label>
//                                   <select
//                                     className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//                                     value={eventMatch.team2 || ''}
//                                     onChange={(e) => handleTeamAssignment(match.id, 'knockout', eventMatch.eventId, 2, e.target.value)}
//                                     disabled={match.franchise2.franchiseName.includes('Winner')}
//                                   >
//                                     <option value="">Select Team</option>
//                                     {!match.franchise2.franchiseName.includes('Winner') && getFranchiseTeams(match.franchise2._id).map(team => (
//                                       <option key={team._id} value={team._id}>
//                                         {team.playerName} ({getEventName(team.event)})
//                                       </option>
//                                     ))}
//                                   </select>
//                                 </div>
//                               </div>
                              
//                               <div className="mt-2 text-center">
//                                 <span className="text-white text-sm">
//                                   {eventMatch.team1 ? getTeamName(eventMatch.team1) : 'Not assigned'} vs {eventMatch.team2 ? getTeamName(eventMatch.team2) : 'Not assigned'}
//                                 </span>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
          
//           {/* Team Management Section */}
//           <div className="bg-gray-800 p-4 rounded-md">
//             <h3 className="text-lg font-medium text-white mb-3">Franchise Teams</h3>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {franchises.length > 0 ? (
//                 franchises.map(franchise => (
//                   <div key={franchise._id} className="bg-gray-700 rounded-md overflow-hidden">
//                     <div className="p-3 bg-gray-600">
//                       <h4 className="text-white font-medium">{franchise.franchiseName}</h4>
//                       <p className="text-gray-300 text-sm">Owner: {franchise.ownerName}</p>
//                       <p className="text-gray-300 text-sm">
//                         Teams: {getFranchiseTeams(franchise._id).length}
//                       </p>
//                     </div>
                    
//                     <div className="p-3">
//                       <button
//                         onClick={() => handleFranchiseSelect(franchise)}
//                         className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
//                       >
//                         View Teams
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="col-span-full text-center py-4 text-gray-300">
//                   <p>No franchises found for this tournament.</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
      
//       {/* Team List Modal */}
//       {showTeamsList && selectedFranchise && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
//           <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
//             <div className="p-4 border-b border-gray-700 flex justify-between items-center">
//               <h3 className="text-xl font-semibold text-white">
//                 {selectedFranchise.franchiseName} Teams
//               </h3>
              
//               <button
//                 onClick={() => setShowTeamsList(false)}
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
            
//             <div className="p-4">
//               <div className="mb-4">
//                 <h4 className="text-lg font-medium text-white mb-2">Teams</h4>
                
//                 {getFranchiseTeams(selectedFranchise._id).length > 0 ? (
//                   <div className="space-y-2">
//                     {getFranchiseTeams(selectedFranchise._id).map(team => (
//                       <div
//                         key={team._id}
//                         className="bg-gray-700 p-3 rounded-md flex justify-between items-center"
//                       >
//                         <div>
//                           <p className="text-white font-medium">{team.playerName}</p>
//                           <p className="text-gray-400 text-sm">
//                             Event: {getEventName(team.event)}
//                           </p>
//                         </div>
                        
//                         <button
//                           onClick={() => handleTeamSelect(team)}
//                           className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
//                         >
//                           Change Event
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-300">No teams assigned to this franchise.</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
      
//       {/* Event Change Modal */}
//       {showEventChangeModal && selectedTeam && (
//         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
//           <div className="bg-gray-800 rounded-lg max-w-md w-full">
//             <div className="p-4 border-b border-gray-700 flex justify-between items-center">
//               <h3 className="text-xl font-semibold text-white">
//                 Change Event for {selectedTeam.playerName}
//               </h3>
              
//               <button
//                 onClick={() => setShowEventChangeModal(false)}
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
            
//             <div className="mb-4 p-4">
//               <label className="block text-sm font-medium text-gray-300 mb-1">
//                 Select New Event
//               </label>
//               <select
//                 className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
//                 onChange={(e) => handleChangeEvent(e.target.value)}
//                 defaultValue=""
//               >
//                 <option value="" disabled>Select Event</option>
//                 {events.map(event => (
//                   <option key={event._id} value={event._id}>
//                     {event.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
            
//             <div className="flex justify-end space-x-2 p-4 border-t border-gray-700">
//               <button
//                 onClick={() => setShowEventChangeModal(false)}
//                 className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FranchiseFixturesView;

import { useState, useEffect } from 'react';
import { getAllFranchises } from '../../services/franchiseService';
import { getTournamentBookings, updateTeamEvent } from '../../services/bookingService';
import { toast } from 'react-toastify';

const FranchiseFixturesView = ({ tournamentId, events }) => {
  const [franchises, setFranchises] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamsList, setShowTeamsList] = useState(false);
  const [showEventChangeModal, setShowEventChangeModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // New state variables for fixture generation
  const [pools, setPools] = useState({ A: [], B: [] });
  const [selectedPool, setSelectedPool] = useState('A');
  const [fixtures, setFixtures] = useState({ poolA: [], poolB: [], knockout: [] });
  const [showFixtures, setShowFixtures] = useState(false);
  const [isGeneratingFixtures, setIsGeneratingFixtures] = useState(false);
  const [fixtureError, setFixtureError] = useState('');
  const [expandedMatch, setExpandedMatch] = useState(null);
  
  // New state for auto-assigned teams
  const [autoAssignedTeams, setAutoAssignedTeams] = useState({});

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
        
        // Automatically distribute franchises into pools if we have 8 franchises
        if (tournamentFranchises.length >= 8) {
          const poolA = tournamentFranchises.slice(0, 4);
          const poolB = tournamentFranchises.slice(4, 8);
          setPools({ A: poolA, B: poolB });
        }
        
        // Load fixtures from localStorage if available
        loadFixturesFromLocalStorage();
        
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

// Check if an event is a Doubles event
const isDoublesEvent = (eventId) => {
    const event = events.find(e => e._id === eventId);
    // Exclude "two 40+ men's players" event from being treated as doubles
    if (event && event.name && event.name.toLowerCase().includes("40+ men's players")) {
      return false;
    }
    return event && event.eventType === 'Doubles';
};

// Check if event is 30+ or 35+ men's player event
const is30Or35MensEvent = (eventId) => {
    const event = events.find(e => e._id === eventId);
    return event && event.name && (
      event.name.toLowerCase().includes("30+ men's player") ||
      event.name.toLowerCase().includes("35+ men's player")
    );
  };

  // Check if event is 40+ men's players event
const is40MensEvent = (eventId) => {
    const event = events.find(e => e._id === eventId);
    return event && event.name && event.name.toLowerCase().includes("40+ men's players");
};
  
  // Get the combined event name for 30+ and 35+ men's players
  const getCombinedEventName = () => {
    return "One 30+ and 35+ Men's Players";
  };

  // Handle franchise selection
  const handleFranchiseSelect = (franchise) => {
    setSelectedFranchise(franchise);
    setShowTeamsList(true);
    setSelectedTeam(null);
  };

  // Handle team selection
  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setShowEventChangeModal(true);
  };

  // Handle changing team's event
  const handleChangeEvent = async (newEventId) => {
    if (!selectedTeam) return;
    
    try {
      setIsUpdating(true);
      await updateTeamEvent(selectedTeam._id, newEventId);
      
      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === selectedTeam._id ? { ...booking, event: newEventId } : booking
        )
      );
      
      setShowEventChangeModal(false);
      toast.success(`Team successfully moved to ${getEventName(newEventId)}`);
    } catch (error) {
      console.error('Error updating team event:', error);
      toast.error(error.response?.data?.message || 'Failed to update team event');
    } finally {
      setIsUpdating(false);
    }
  };

  // Get teams for a franchise
  const getFranchiseTeams = (franchiseId) => {
    return bookings.filter(booking => booking.franchise === franchiseId);
  };

// Get teams for a franchise filtered by event
const getFranchiseTeamsByEvent = (franchiseId, eventId) => {
    // Handle the special case for combined 30+/35+ men's event
    if (eventId === 'combined-30-35-mens') {
      return bookings.filter(booking => 
        booking.franchise === franchiseId && 
        booking.event && events.some(e => 
          e._id === booking.event && 
          (e.name.toLowerCase().includes("30+ men's player") || 
           e.name.toLowerCase().includes("35+ men's player"))
        )
      );
    }
    
    // Normal case
    return bookings.filter(booking => 
      booking.franchise === franchiseId && booking.event === eventId
    );
  };

// Auto-assign teams to event matches
const autoAssignTeams = (match, poolType) => {
    const matchId = match.id;
    const franchise1Id = match.franchise1._id;
    const franchise2Id = match.franchise2._id;
    
    // Skip if franchise names include 'Winner' (for knockout placeholders)
    if (match.franchise1.franchiseName.includes('Winner') || 
        match.franchise2.franchiseName.includes('Winner')) {
      return;
    }
  
    // Create a unique key for this match
    const matchKey = `${matchId}-${poolType}`;
    
    // Skip if we've already auto-assigned teams for this match
    if (autoAssignedTeams[matchKey]) {
      return;
    }
  
    // Process each event match
    const updatedEventMatches = match.eventMatches.map(eventMatch => {
      // Handle the combined 30+/35+ men's event
      if (eventMatch.eventName === getCombinedEventName()) {
        // Get teams from both 30+ and 35+ events for both franchises
        let franchise1Teams = [];
        let franchise2Teams = [];
        
        // If we have originalEvents array, use it to find teams
        if (eventMatch.originalEvents && eventMatch.originalEvents.length > 0) {
          eventMatch.originalEvents.forEach(eventId => {
            franchise1Teams = [...franchise1Teams, ...getFranchiseTeamsByEvent(franchise1Id, eventId)];
            franchise2Teams = [...franchise2Teams, ...getFranchiseTeamsByEvent(franchise2Id, eventId)];
          });
        } else {
          // Fallback: find all 30+ and 35+ men's player teams
          events.forEach(event => {
            if (event.name && (
              event.name.toLowerCase().includes("30+ men's player") ||
              event.name.toLowerCase().includes("35+ men's player")
            )) {
              franchise1Teams = [...franchise1Teams, ...getFranchiseTeamsByEvent(franchise1Id, event._id)];
              franchise2Teams = [...franchise2Teams, ...getFranchiseTeamsByEvent(franchise2Id, event._id)];
            }
          });
        }
        
        // Take one team from each franchise
        const team1 = franchise1Teams[0]?._id || null;
        const team2 = franchise2Teams[0]?._id || null;
        
        return {
          ...eventMatch,
          team1,
          team2
        };
      } else {
        // Handle other events normally
        const eventId = eventMatch.eventId;
        const franchise1Teams = getFranchiseTeamsByEvent(franchise1Id, eventId);
        const franchise2Teams = getFranchiseTeamsByEvent(franchise2Id, eventId);
        
        // If we have teams for both franchises in this event
        if (franchise1Teams.length > 0 && franchise2Teams.length > 0) {
          // For doubles events, we need to pair teams
          if (isDoublesEvent(eventId)) {
            // Take the first team from each franchise for this event
            const team1 = franchise1Teams[0]?._id || null;
            const team2 = franchise2Teams[0]?._id || null;
            
            return {
              ...eventMatch,
              team1,
              team2
            };
          } else {
            // For singles or team events, just assign the first available team
            const team1 = franchise1Teams[0]?._id || null;
            const team2 = franchise2Teams[0]?._id || null;
            
            return {
              ...eventMatch,
              team1,
              team2
            };
          }
        }
        
        return eventMatch;
      }
    });

    // Update fixtures state with auto-assigned teams
    setFixtures(prevFixtures => {
      const updatedFixtures = { ...prevFixtures };
      let targetPool;
      
      if (poolType === 'knockout') {
        targetPool = 'knockout';
      } else if (poolType === 'A') {
        targetPool = 'poolA';
      } else if (poolType === 'B') {
        targetPool = 'poolB';
      }
      
      updatedFixtures[targetPool] = updatedFixtures[targetPool].map(m => 
        m.id === matchId ? { ...m, eventMatches: updatedEventMatches } : m
      );
      
      return updatedFixtures;
    });

    // Mark this match as auto-assigned
    setAutoAssignedTeams(prev => ({
      ...prev,
      [matchKey]: true
    }));
  };

// Generate round-robin fixtures for a pool
const generatePoolFixtures = (poolFranchises) => {
    const fixtures = [];
    
    // Round-robin algorithm: each franchise plays against all others in the pool
    for (let i = 0; i < poolFranchises.length; i++) {
      for (let j = i + 1; j < poolFranchises.length; j++) {
        const franchise1 = poolFranchises[i];
        const franchise2 = poolFranchises[j];
        
        // Create a match between these two franchises
        fixtures.push({
          id: `match-${i}-${j}`,
          franchise1: franchise1,
          franchise2: franchise2,
          date: new Date().toISOString().split('T')[0], // Default to today
          time: '09:30 AM',
          court: 1,
          score: '0-0',
          eventMatches: processEventMatches(events, franchise1, franchise2)
        });
      }
    }
    
    return fixtures;
  };

  // Process events to combine 30+ and 35+ men's player events
const processEventMatches = (allEvents, franchise1, franchise2) => {
    // Track if we've already added the combined 30+/35+ event
    let added30And35Combined = false;
    
    return allEvents.reduce((matches, event) => {
      // If this is a 30+ or 35+ men's player event
      if (event.name && (
        event.name.toLowerCase().includes("30+ men's player") ||
        event.name.toLowerCase().includes("35+ men's player")
      )) {
        // If we haven't added the combined event yet, add it
        if (!added30And35Combined) {
          matches.push({
            eventId: 'combined-30-35-mens',
            eventName: getCombinedEventName(),
            originalEvents: [event._id], // Track original event IDs
            team1: null,
            team2: null,
            score: '0-0'
          });
          added30And35Combined = true;
        } else {
          // If we already added the combined event, just update its originalEvents array
          const combinedEvent = matches.find(m => m.eventName === getCombinedEventName());
          if (combinedEvent && !combinedEvent.originalEvents.includes(event._id)) {
            combinedEvent.originalEvents.push(event._id);
          }
        }
      } else {
        // For all other events, add them normally
        matches.push({
          eventId: event._id,
          eventName: event.name,
          team1: null,
          team2: null,
          score: '0-0'
        });
      }
      return matches;
    }, []);
  };

  const generateKnockoutFixtures = (poolAWinners, poolBWinners) => {
    const knockoutFixtures = [
      // Semi-finals
      {
        id: 'sf-1',
        round: 'Semi Final',
        franchise1: { franchiseName: 'Pool A Winner' }, // Placeholder instead of actual franchise
        franchise2: { franchiseName: 'Pool B Runner' }, // Placeholder instead of actual franchise
        date: new Date().toISOString().split('T')[0],
        time: '09:30 AM',
        court: 1,
        score: '0-0',
        eventMatches: processEventMatches(events)
      },
      {
        id: 'sf-2',
        round: 'Semi Final',
        franchise1: { franchiseName: 'Pool B Winner' }, // Placeholder instead of actual franchise
        franchise2: { franchiseName: 'Pool A Runner' }, // Placeholder instead of actual franchise
        date: new Date().toISOString().split('T')[0],
        time: '09:30 AM',
        court: 1,
        score: '0-0',
        eventMatches: events.map(event => ({
          eventId: event._id,
          eventName: event.name,
          team1: null,
          team2: null,
          score: '0-0'
        }))
      },
      // Final
      {
        id: 'final',
        round: 'Final without declaring',
        franchise1: { franchiseName: 'Winner SF1' }, // Placeholder
        franchise2: { franchiseName: 'Winner SF2' }, // Placeholder
        date: new Date().toISOString().split('T')[0],
        time: '09:30 AM',
        court: 1,
        score: '0-0',
        eventMatches: events.map(event => ({
          eventId: event._id,
          eventName: event.name,
          team1: null,
          team2: null,
          score: '0-0'
        }))
      }
    ];
    
    return knockoutFixtures;
  };

  // Generate all fixtures
const generateFixtures = () => {
    try {
      setIsGeneratingFixtures(true);
      setFixtureError('');
      
      // Check if we have enough franchises
      if (franchises.length < 8) {
        throw new Error('Need at least 8 franchises to generate fixtures');
      }
      
      // Generate pool fixtures
      const poolAFixtures = generatePoolFixtures(pools.A);
      const poolBFixtures = generatePoolFixtures(pools.B);
      
      // For demonstration, use the first two franchises from each pool as winners
      const poolAWinners = [pools.A[0], pools.A[1]];
      const poolBWinners = [pools.B[0], pools.B[1]];
      
      // Generate knockout fixtures
      const knockoutFixtures = generateKnockoutFixtures(poolAWinners, poolBWinners);
      
      // Set fixtures
      setFixtures({
        poolA: poolAFixtures,
        poolB: poolBFixtures,
        knockout: knockoutFixtures
      });
      
      setShowFixtures(true);
      
      // Save fixtures to localStorage
      setTimeout(() => saveFixturesToLocalStorage(), 0);
      
      toast.success('Fixtures generated successfully!');
    } catch (error) {
      console.error('Error generating fixtures:', error);
      setFixtureError(error.message || 'Failed to generate fixtures');
      toast.error(error.message || 'Failed to generate fixtures');
    } finally {
      setIsGeneratingFixtures(false);
    }
  };

// Handle court number change
const handleCourtChange = (matchId, poolType, courtNumber) => {
    setFixtures(prevFixtures => {
      const updatedFixtures = { ...prevFixtures };
      
      if (poolType === 'knockout') {
        updatedFixtures.knockout = updatedFixtures.knockout.map(match => 
          match.id === matchId ? { ...match, court: courtNumber } : match
        );
      } else if (poolType === 'A') {
        updatedFixtures.poolA = updatedFixtures.poolA.map(match => 
          match.id === matchId ? { ...match, court: courtNumber } : match
        );
      } else if (poolType === 'B') {
        updatedFixtures.poolB = updatedFixtures.poolB.map(match => 
          match.id === matchId ? { ...match, court: courtNumber } : match
        );
      }
      
      // Save changes to localStorage
      setTimeout(() => saveFixturesToLocalStorage(), 0);
      
      return updatedFixtures;
    });
  };
  
  // Handle team assignment to event
  const handleTeamAssignment = (matchId, poolType, eventId, franchiseSide, teamId) => {
    setFixtures(prevFixtures => {
      const updatedFixtures = { ...prevFixtures };
      let targetPool;
      
      if (poolType === 'knockout') {
        targetPool = 'knockout';
      } else if (poolType === 'A') {
        targetPool = 'poolA';
      } else if (poolType === 'B') {
        targetPool = 'poolB';
      }
      
      updatedFixtures[targetPool] = updatedFixtures[targetPool].map(match => {
        if (match.id === matchId) {
          const updatedEventMatches = match.eventMatches.map(eventMatch => {
            if (eventMatch.eventId === eventId) {
              if (franchiseSide === 1) {
                return { ...eventMatch, team1: teamId };
              } else {
                return { ...eventMatch, team2: teamId };
              }
            }
            return eventMatch;
          });
          
          return { ...match, eventMatches: updatedEventMatches };
        }
        return match;
      });
      
      // Save changes to localStorage
      setTimeout(() => saveFixturesToLocalStorage(), 0);
      
      return updatedFixtures;
    });
  };

  // Toggle expanded match view and auto-assign teams
  const toggleExpandMatch = (matchId) => {
    // If we're expanding a match
    if (expandedMatch !== matchId) {
      // Find the match in the appropriate pool
      let match;
      let poolType;
      
      if (selectedPool === 'A') {
        match = fixtures.poolA.find(m => m.id === matchId);
        poolType = 'A';
      } else if (selectedPool === 'B') {
        match = fixtures.poolB.find(m => m.id === matchId);
        poolType = 'B';
      } else if (selectedPool === 'knockout') {
        match = fixtures.knockout.find(m => m.id === matchId);
        poolType = 'knockout';
      }
      
      // Auto-assign teams if the match exists
      if (match) {
        autoAssignTeams(match, poolType);
      }
    }
    
    // Toggle expanded state
    setExpandedMatch(expandedMatch === matchId ? null : matchId);
  };

// Get team name by ID with support for doubles teams and combined 30+/35+ teams
const getTeamName = (teamId, matchContext = null) => {
    const team = bookings.find(booking => booking._id === teamId);
    if (!team) return 'Not assigned';
    
    // For the combined 30+/35+ men's event, show both player names
    if (matchContext && matchContext.eventName === getCombinedEventName()) {
      // Find the franchise this team belongs to
      const franchiseId = team.franchise;
      
      // Get all 30+ and 35+ teams from this franchise
      const franchiseTeamsIn30And35Events = bookings.filter(booking => 
        booking.franchise === franchiseId && 
        booking.event && events.some(e => 
          e._id === booking.event && 
          (e.name.toLowerCase().includes("30+ men's player") || 
           e.name.toLowerCase().includes("35+ men's player"))
        ) &&
        booking._id !== teamId
      );
      
      // If there's another team from the same franchise in these events
      if (franchiseTeamsIn30And35Events.length > 0) {
        const partnerTeam = franchiseTeamsIn30And35Events[0];
        return `${team.playerName} and ${partnerTeam.playerName}`;
      }
    }

        // For 40+ men's players event, show both player names
        if (matchContext && matchContext.eventId && is40MensEvent(matchContext.eventId)) {
            // Find the franchise this team belongs to
            const franchiseId = team.franchise;
            
            // Get all 40+ men's players teams from this franchise
            const franchiseTeamsIn40MensEvent = bookings.filter(booking => 
              booking.franchise === franchiseId && 
              booking.event && events.some(e => 
                e._id === booking.event && 
                e.name.toLowerCase().includes("40+ men's players")
              ) &&
              booking._id !== teamId
            );
            
            // If there's another team from the same franchise in this event
            if (franchiseTeamsIn40MensEvent.length > 0) {
              const partnerTeam = franchiseTeamsIn40MensEvent[0];
              return `${team.playerName} and ${partnerTeam.playerName}`;
            }
          }
    
    // For doubles events, we need to show both player names
    const event = events.find(e => e._id === team.event);
    if (event && isDoublesEvent(event._id) && matchContext) {
      // Find the franchise this team belongs to
      const franchiseId = team.franchise;
      
      // Get all teams from this franchise for this event
      const franchiseTeamsInEvent = bookings.filter(booking => 
        booking.franchise === franchiseId && 
        booking.event === team.event && 
        booking._id !== teamId
      );
      
      // If there's another team from the same franchise in this event
      if (franchiseTeamsInEvent.length > 0) {
        const partnerTeam = franchiseTeamsInEvent[0];
        return `${team.playerName} and ${partnerTeam.playerName}`;
      }
    }
    
    return team.playerName;
  };

  // Save fixtures to localStorage
  const saveFixturesToLocalStorage = () => {
    try {
      const fixturesData = {
        poolA: fixtures.poolA,
        poolB: fixtures.poolB,
        knockout: fixtures.knockout
      };
      localStorage.setItem(`fixtures_${tournamentId}`, JSON.stringify(fixturesData));
      toast.success('Fixtures saved successfully!');
    } catch (error) {
      console.error('Error saving fixtures to localStorage:', error);
      toast.error('Failed to save fixtures');
    }
  };

  // Load fixtures from localStorage
  const loadFixturesFromLocalStorage = () => {
    try {
      const savedFixtures = localStorage.getItem(`fixtures_${tournamentId}`);
      if (savedFixtures) {
        const parsedFixtures = JSON.parse(savedFixtures);
        setFixtures(parsedFixtures);
        setShowFixtures(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading fixtures from localStorage:', error);
      return false;
    }
  };


  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Franchise Team Management</h2>
      </div>
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="spinner"></div>
          <p className="mt-2 text-gray-300">Loading franchises...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900 text-white p-4 rounded-md mb-4">
          <p>{error}</p>
        </div>
      ) : (
        <div>
          {/* Pool Management Section */}
          <div className="bg-gray-800 p-4 rounded-md mb-6">
            <h3 className="text-lg font-medium text-white mb-3">Pool Management</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-md font-medium text-white mb-2">Pool A</h4>
<ul className="bg-gray-700 rounded-md p-2">
  {pools.A.length > 0 ? (
    pools.A.map(franchise => (
      <li key={franchise._id} className="p-2 border-b border-gray-600 last:border-0">
        <span className="text-yellow-300 font-medium">{franchise.franchiseName}</span>
      </li>
    ))
  ) : (
    <li className="p-2 text-gray-400">No franchises assigned</li>
  )}
</ul>
              </div>
              
              <div>
              <h4 className="text-md font-medium text-white mb-2">Pool B</h4>
<ul className="bg-gray-700 rounded-md p-2">
  {pools.B.length > 0 ? (
    pools.B.map(franchise => (
      <li key={franchise._id} className="p-2 border-b border-gray-600 last:border-0">
        <span className="text-yellow-300 font-medium">{franchise.franchiseName}</span>
      </li>
    ))
  ) : (
    <li className="p-2 text-gray-400">No franchises assigned</li>
  )}
</ul>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={generateFixtures}
                disabled={isGeneratingFixtures || pools.A.length < 4 || pools.B.length < 4}
                className={`px-4 py-2 rounded-md ${isGeneratingFixtures || pools.A.length < 4 || pools.B.length < 4 ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white font-medium transition-colors`}
              >
                {isGeneratingFixtures ? 'Generating...' : 'Generate Fixtures'}
              </button>
            </div>
            
            {fixtureError && (
              <div className="mt-3 bg-red-900 text-white p-3 rounded-md">
                <p>{fixtureError}</p>
              </div>
            )}
          </div>
          
{/* Fixtures Display Section */}
{showFixtures && (
  <div className="bg-gray-800 p-4 rounded-md mb-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-medium text-white">Fixtures</h3>
      
      <div className="flex items-center space-x-3">
        <button
          onClick={saveFixturesToLocalStorage}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
        >
          Save Changes
        </button>
        
        <div className="flex items-center">
          <label htmlFor="poolSelect" className="mr-2 text-white">View Pool:</label>
          <select
            id="poolSelect"
            value={selectedPool}
            onChange={(e) => setSelectedPool(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="A">Pool A</option>
            <option value="B">Pool B</option>
            <option value="knockout">Knockout Stage</option>
          </select>
        </div>
      </div>
    </div>
              
              <div className="space-y-4">
                {selectedPool === 'A' && fixtures.poolA.map(match => (
                  <div key={match.id} className="bg-gray-700 rounded-md overflow-hidden">
                    <div className="p-3 bg-gray-600 flex justify-between items-center">
                      <div>
                        <span className="text-white font-medium">{match.franchise1.franchiseName}</span>
                        <span className="text-gray-300 mx-2">vs</span>
                        <span className="text-white font-medium">{match.franchise2.franchiseName}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <label htmlFor={`court-${match.id}`} className="mr-2 text-white text-sm">Court:</label>
                          <input
                            id={`court-${match.id}`}
                            type="number"
                            min="1"
                            value={match.court}
                            onChange={(e) => handleCourtChange(match.id, 'A', parseInt(e.target.value))}
                            className="w-16 bg-gray-800 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                        
                        <button
                          onClick={() => toggleExpandMatch(match.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
                        >
                          {expandedMatch === match.id ? 'Hide Details' : 'See All'}
                        </button>
                      </div>
                    </div>
                    
                    {expandedMatch === match.id && (
                      <div className="p-3 border-t border-gray-600">
                        <h4 className="text-white font-medium mb-2">Event Matches</h4>
                        
                        <div className="space-y-3">
                          {match.eventMatches.map(eventMatch => (
                            <div key={eventMatch.eventId} className="bg-gray-800 p-2 rounded-md">
                              <h5 className="text-white font-medium mb-1">{eventMatch.eventName}</h5>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-gray-400 text-xs mb-1">{match.franchise1.franchiseName} Team</label>
                                  <select
                                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={eventMatch.team1 || ''}
                                    onChange={(e) => handleTeamAssignment(match.id, 'A', eventMatch.eventId, 1, e.target.value)}
                                  >
                                    <option value="">Select Team</option>
                                    {getFranchiseTeamsByEvent(match.franchise1._id, eventMatch.eventId).map(team => (
                                      <option key={team._id} value={team._id}>
                                        {team.playerName} ({getEventName(team.event)})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-gray-400 text-xs mb-1">{match.franchise2.franchiseName} Team</label>
                                  <select
                                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={eventMatch.team2 || ''}
                                    onChange={(e) => handleTeamAssignment(match.id, 'A', eventMatch.eventId, 2, e.target.value)}
                                  >
                                    <option value="">Select Team</option>
                                    {getFranchiseTeamsByEvent(match.franchise2._id, eventMatch.eventId).map(team => (
                                      <option key={team._id} value={team._id}>
                                        {team.playerName} ({getEventName(team.event)})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              <div className="mt-2 text-center">
  <span className="text-white text-sm">
    {eventMatch.team1 ? getTeamName(eventMatch.team1, eventMatch) : 'Not assigned'} vs {eventMatch.team2 ? getTeamName(eventMatch.team2, eventMatch) : 'Not assigned'}
  </span>
</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {selectedPool === 'B' && fixtures.poolB.map(match => (
                  <div key={match.id} className="bg-gray-700 rounded-md overflow-hidden">
                    <div className="p-3 bg-gray-600 flex justify-between items-center">
                      <div>
                        <span className="text-white font-medium">{match.franchise1.franchiseName}</span>
                        <span className="text-gray-300 mx-2">vs</span>
                        <span className="text-white font-medium">{match.franchise2.franchiseName}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <label htmlFor={`court-${match.id}`} className="mr-2 text-white text-sm">Court:</label>
                          <input
                            id={`court-${match.id}`}
                            type="number"
                            min="1"
                            value={match.court}
                            onChange={(e) => handleCourtChange(match.id, 'B', parseInt(e.target.value))}
                            className="w-16 bg-gray-800 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                        
                        <button
                          onClick={() => toggleExpandMatch(match.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
                        >
                          {expandedMatch === match.id ? 'Hide Details' : 'See All'}
                        </button>
                      </div>
                    </div>
                    
                    {expandedMatch === match.id && (
                      <div className="p-3 border-t border-gray-600">
                        <h4 className="text-white font-medium mb-2">Event Matches</h4>
                        
                        <div className="space-y-3">
                          {match.eventMatches.map(eventMatch => (
                            <div key={eventMatch.eventId} className="bg-gray-800 p-2 rounded-md">
                              <h5 className="text-white font-medium mb-1">{eventMatch.eventName}</h5>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-gray-400 text-xs mb-1">{match.franchise1.franchiseName} Team</label>
                                  <select
                                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={eventMatch.team1 || ''}
                                    onChange={(e) => handleTeamAssignment(match.id, 'B', eventMatch.eventId, 1, e.target.value)}
                                  >
                                    <option value="">Select Team</option>
                                    {getFranchiseTeamsByEvent(match.franchise1._id, eventMatch.eventId).map(team => (
                                      <option key={team._id} value={team._id}>
                                        {team.playerName} ({getEventName(team.event)})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-gray-400 text-xs mb-1">{match.franchise2.franchiseName} Team</label>
                                  <select
                                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={eventMatch.team2 || ''}
                                    onChange={(e) => handleTeamAssignment(match.id, 'B', eventMatch.eventId, 2, e.target.value)}
                                  >
                                    <option value="">Select Team</option>
                                    {getFranchiseTeamsByEvent(match.franchise2._id, eventMatch.eventId).map(team => (
                                      <option key={team._id} value={team._id}>
                                        {team.playerName} ({getEventName(team.event)})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              <div className="mt-2 text-center">
  <span className="text-white text-sm">
    {eventMatch.team1 ? getTeamName(eventMatch.team1, eventMatch) : 'Not assigned'} vs {eventMatch.team2 ? getTeamName(eventMatch.team2, eventMatch) : 'Not assigned'}
  </span>
</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {selectedPool === 'knockout' && fixtures.knockout.map(match => (
                  <div key={match.id} className="bg-gray-700 rounded-md overflow-hidden">
                    <div className="p-3 bg-gray-600 flex justify-between items-center">
                      <div>
                        <span className="text-red-500 font-medium mr-2">{match.round}:</span>
                        <span className="text-white font-medium">{match.franchise1.franchiseName}</span>
                        <span className="text-gray-300 mx-2">vs</span>
                        <span className="text-white font-medium">{match.franchise2.franchiseName}</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <label htmlFor={`court-${match.id}`} className="mr-2 text-white text-sm">Court:</label>
                          <input
                            id={`court-${match.id}`}
                            type="number"
                            min="1"
                            value={match.court}
                            onChange={(e) => handleCourtChange(match.id, 'knockout', parseInt(e.target.value))}
                            className="w-16 bg-gray-800 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        </div>
                        
                        <button
                          onClick={() => toggleExpandMatch(match.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
                        >
                          {expandedMatch === match.id ? 'Hide Details' : 'See All'}
                        </button>
                      </div>
                    </div>
                    
                    {expandedMatch === match.id && (
                      <div className="p-3 border-t border-gray-600">
                        <h4 className="text-white font-medium mb-2">Event Matches</h4>
                        
                        <div className="space-y-3">
                          {match.eventMatches.map(eventMatch => (
                            <div key={eventMatch.eventId} className="bg-gray-800 p-2 rounded-md">
                              <h5 className="text-white font-medium mb-1">{eventMatch.eventName}</h5>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-gray-400 text-xs mb-1">{match.franchise1.franchiseName} Team</label>
                                  <select
                                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={eventMatch.team1 || ''}
                                    onChange={(e) => handleTeamAssignment(match.id, 'knockout', eventMatch.eventId, 1, e.target.value)}
                                    disabled={match.franchise1.franchiseName.includes('Winner')}
                                  >
                                    <option value="">Select Team</option>
                                    {!match.franchise1.franchiseName.includes('Winner') && getFranchiseTeamsByEvent(match.franchise1._id, eventMatch.eventId).map(team => (
                                      <option key={team._id} value={team._id}>
                                        {team.playerName} ({getEventName(team.event)})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-gray-400 text-xs mb-1">{match.franchise2.franchiseName} Team</label>
                                  <select
                                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={eventMatch.team2 || ''}
                                    onChange={(e) => handleTeamAssignment(match.id, 'knockout', eventMatch.eventId, 2, e.target.value)}
                                    disabled={match.franchise2.franchiseName.includes('Winner')}
                                  >
                                    <option value="">Select Team</option>
                                    {!match.franchise2.franchiseName.includes('Winner') && getFranchiseTeamsByEvent(match.franchise2._id, eventMatch.eventId).map(team => (
                                      <option key={team._id} value={team._id}>
                                        {team.playerName} ({getEventName(team.event)})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              <div className="mt-2 text-center">
  <span className="text-white text-sm">
    {eventMatch.team1 ? getTeamName(eventMatch.team1, eventMatch) : 'Not assigned'} vs {eventMatch.team2 ? getTeamName(eventMatch.team2, eventMatch) : 'Not assigned'}
  </span>
</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Team Management Section */}
          <div className="bg-gray-800 p-4 rounded-md">
            <h3 className="text-lg font-medium text-white mb-3">Franchise Teams</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {franchises.length > 0 ? (
                franchises.map(franchise => (
                  <div key={franchise._id} className="bg-gray-700 rounded-md overflow-hidden">
                    <div className="p-3 bg-gray-600">
                      <h4 className="text-white font-medium">{franchise.franchiseName}</h4>
                      <p className="text-gray-300 text-sm">Owner: {franchise.ownerName}</p>
                      <p className="text-gray-300 text-sm">
                        Teams: {getFranchiseTeams(franchise._id).length}
                      </p>
                    </div>
                    
                    <div className="p-3">
                      <button
                        onClick={() => handleFranchiseSelect(franchise)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                      >
                        View Teams
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-4 text-gray-300">
                  <p>No franchises found for this tournament.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Team List Modal */}
      {showTeamsList && selectedFranchise && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">
                {selectedFranchise.franchiseName} Teams
              </h3>
              
              <button
                onClick={() => setShowTeamsList(false)}
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
            
            <div className="p-4">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-white mb-2">Teams</h4>
                
                {getFranchiseTeams(selectedFranchise._id).length > 0 ? (
                  <div className="space-y-2">
                    {getFranchiseTeams(selectedFranchise._id).map(team => (
                      <div
                        key={team._id}
                        className="bg-gray-700 p-3 rounded-md flex justify-between items-center"
                      >
                        <div>
                          <p className="text-white font-medium">{team.playerName}</p>
                          <p className="text-gray-400 text-sm">
                            Event: {getEventName(team.event)}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => handleTeamSelect(team)}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
                        >
                          Change Event
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-300">No teams assigned to this franchise.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Event Change Modal */}
      {showEventChangeModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">
                Change Event for {selectedTeam.playerName}
              </h3>
              
              <button
                onClick={() => setShowEventChangeModal(false)}
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
            
            <div className="mb-4 p-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Select New Event
              </label>
              <select
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                onChange={(e) => handleChangeEvent(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Select Event</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 p-4 border-t border-gray-700">
              <button
                onClick={() => setShowEventChangeModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FranchiseFixturesView;