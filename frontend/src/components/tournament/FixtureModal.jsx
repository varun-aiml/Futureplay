import { useState } from 'react';
// Remove this import since we won't be using the library
// import { SingleEliminationBracket, Match, SVGViewer } from '@g-loot/react-tournament-brackets';

const FixtureModal = ({ fixtureData, setShowFixtureModal }) => {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 animate-slideIn">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            TOURNAMENT STRUCTURE
            {fixtureData.eventName && (
              <span className="ml-2 text-lg text-gray-400">({fixtureData.eventName})</span>
            )}
          </h2>
          <button
            onClick={() => setShowFixtureModal(false)}
            className="text-gray-400 hover:text-white transition-colors hover:bg-red-600 hover:bg-opacity-20 p-2 rounded-full"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
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

        <div className="text-white">
          {/* Tournament Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold mb-2 text-red-500">FORMAT</h3>
              <p className="text-white text-xl font-bold">{fixtureData.matchType}</p>
              {fixtureData.eventName && (
                <p className="text-gray-400 text-sm mt-2">{fixtureData.eventName}</p>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold mb-2 text-red-500">TEAMS</h3>
              <div className="inline-flex items-center justify-center bg-red-600 text-white font-bold rounded-full w-14 h-14 shadow-lg text-xl">
                {fixtureData.numTeams}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold mb-2 text-red-500">SUMMARY</h3>
              <div className="text-center">
                <p className="text-white font-bold">{fixtureData.totalRounds} Rounds</p>
                <p className="text-white font-bold">{fixtureData.totalMatches} Matches</p>
              </div>
            </div>
          </div>

          {/* Tournament Structure Visualization */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-5 rounded-lg mb-6 border border-gray-700 shadow-lg">
            <h3 className="text-xl font-bold text-center mb-6 text-white">
              Tournament Progression
            </h3>

            {/* Always use the custom visualization instead of the library */}
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-4 md:space-x-6 justify-start min-w-max">
                {/* Knockout/League: Use matches grouped by round */}
                {((fixtureData.matchType === 'Knockout' || fixtureData.matchType === 'League') && Array.isArray(fixtureData.matches)) ? (
                  Array.from(new Set(fixtureData.matches.map(m => m.round))).map((roundName, index) => (
                    <div key={index} className="relative flex flex-col items-center">
                      <div className="w-[280px] text-center transform transition-all duration-300 hover:scale-105">
                        <div className="bg-gradient-to-r from-red-700 to-red-600 p-3 rounded-t-lg shadow-lg">
                          <h4 className="font-bold text-white">{roundName}</h4>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-b-lg border border-gray-600 shadow-inner">
                          <p className="text-white font-medium text-lg">
                            {fixtureData.matches.filter(m => m.round === roundName).length} {fixtureData.matches.filter(m => m.round === roundName).length === 1 ? 'Match' : 'Matches'}
                          </p>
                          <div className="mt-4 space-y-3">
                            {fixtureData.matches.filter(m => m.round === roundName).map((match, idx) => (
                              <div key={idx} className="bg-gray-700 rounded-xl p-3 text-sm">
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex-1">
                                    <span className="font-medium text-white">{match.player1?.name || '-'}</span>
                                  </div>
                                  <span className="text-gray-400 text-xs px-2">vs</span>
                                  <div className="flex-1 text-right">
                                    <span className="font-medium text-white">{match.player2?.name || '-'}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      {index < Array.from(new Set(fixtureData.matches.map(m => m.round))).length - 1 && (
                        <div className="flex items-center justify-center h-full mt-4 mb-4">
                          <div className="relative w-16 h-10 flex items-center justify-center">
                            <div className="absolute w-full h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700"></div>
                            <div className="absolute w-full h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700 animate-pulse opacity-70"></div>
                            <div className="absolute right-0 w-4 h-4 bg-red-600 transform rotate-45 rounded-sm animate-bounce"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (Array.isArray(fixtureData.rounds) ? (
                  fixtureData.rounds.map((round, index) => (
                    <div key={index} className="relative flex flex-col items-center">
                      <div className="w-[280px] text-center transform transition-all duration-300 hover:scale-105">
                        <div className="bg-gradient-to-r from-red-700 to-red-600 p-3 rounded-t-lg shadow-lg">
                          <h4 className="font-bold text-white">{round.name}</h4>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-b-lg border border-gray-600 shadow-inner">
                          <p className="text-white font-medium text-lg">
                            {round.matches} {round.matches === 1 ? 'Match' : 'Matches'}
                          </p>
                          {round.byes > 0 && (
                            <p className="text-gray-400">
                              {round.byes} {round.byes === 1 ? 'Bye' : 'Byes'}
                            </p>
                          )}
                          {round.details && (
                            <p className="text-gray-400 text-sm mt-2">{round.details}</p>
                          )}
                          {/* Display matchups if available */}
                          {round.matchups && round.matchups.length > 0 && (
                            <div className="mt-4 space-y-3">
                              {round.matchups.map((matchup, idx) => (
                                <div key={idx} className="bg-gray-700 rounded-xl p-3 text-sm">
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="flex-1">
                                      <span className="font-medium text-white">{matchup.team1 || '-'}</span>
                                    </div>
                                    <span className="text-gray-400 text-xs px-2">vs</span>
                                    <div className="flex-1 text-right">
                                      <span className="font-medium text-white">{matchup.team2 || '-'}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {index < fixtureData.rounds.length - 1 && (
                        <div className="flex items-center justify-center h-full mt-4 mb-4">
                          <div className="relative w-16 h-10 flex items-center justify-center">
                            <div className="absolute w-full h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700"></div>
                            <div className="absolute w-full h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700 animate-pulse opacity-70"></div>
                            <div className="absolute right-0 w-4 h-4 bg-red-600 transform rotate-45 rounded-sm animate-bounce"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-center w-full py-8">No fixture data available.</div>
                ))}
              </div>
            </div>
          </div>

          {/* Tournament Notes */}
          {/* ... existing code ... */}
        </div>
      </div>
      
      {/* Add global styles for animations */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-2px) rotate(45deg); }
          50% { transform: translateX(0) rotate(45deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-bounce {
          animation: bounce 1.5s infinite;
        }
        `}
      </style>
    </div>
  );
};

export default FixtureModal;

// import { useState, useEffect } from 'react';
// import { SingleEliminationBracket, Match, SVGViewer } from '@g-loot/react-tournament-brackets';

// const FixtureModal = ({ fixtureData, setShowFixtureModal }) => {
//   const [matches, setMatches] = useState([]);
  
//   // Transform fixtureData to the format expected by the library
//   useEffect(() => {
//     if (fixtureData && (fixtureData.matches || []).length > 0) {
//       const transformedMatches = transformMatchesToBracketFormat(fixtureData);
//       setMatches(transformedMatches);
//     }
//   }, [fixtureData]);

//   // Function to transform matches to the format expected by the library
//   const transformMatchesToBracketFormat = (data) => {
//     if (!data || !data.matches) return [];
    
//     // Group matches by round
//     const roundsMap = {};
//     data.matches.forEach(match => {
//       if (!roundsMap[match.round]) {
//         roundsMap[match.round] = [];
//       }
//       roundsMap[match.round].push(match);
//     });

//     // Sort rounds in order (assuming rounds are named in a way that can be sorted)
//     const rounds = Object.keys(roundsMap).sort((a, b) => {
//       // Custom sort for knockout rounds
//       const roundOrder = [
//         "PRELIMINARY ROUND",
//         "ROUND 1",
//         "ROUND 2",
//         "ROUND 3",
//         "ROUND OF 128",
//         "ROUND OF 64",
//         "ROUND OF 32",
//         "ROUND OF 16",
//         "PRE-QUARTER FINAL",
//         "QUARTER FINAL",
//         "SEMI FINAL",
//         "FINAL",
//       ];
//       return roundOrder.indexOf(a) - roundOrder.indexOf(b);
//     });

//     // Create a map of matches by ID for easy lookup
//     const matchesById = {};
    
//     // First pass: create match objects
//     rounds.forEach((round, roundIndex) => {
//       const roundMatches = roundsMap[round];
//       roundMatches.forEach((match, matchIndex) => {
//         const matchId = `${round}-${matchIndex}`;
//         matchesById[matchId] = {
//           id: matchId,
//           name: `${round} - Match ${matchIndex + 1}`,
//           nextMatchId: null, // Will be set in second pass
//           tournamentRoundText: round,
//           startTime: match.date || new Date().toISOString(),
//           state: match.status === "Completed" ? "DONE" : "SCHEDULED",
//           participants: [
//             {
//               id: match.player1?._id || `player1-${matchId}`,
//               resultText: match.score ? match.score.split('-')[0].trim() : "",
//               isWinner: match.winner && match.player1 && match.winner._id === match.player1._id,
//               status: match.status === "Completed" ? "PLAYED" : null,
//               name: match.player1?.name || "TBD"
//             },
//             {
//               id: match.player2?._id || `player2-${matchId}`,
//               resultText: match.score ? match.score.split('-')[1].trim() : "",
//               isWinner: match.winner && match.player2 && match.winner._id === match.player2._id,
//               status: match.status === "Completed" ? "PLAYED" : null,
//               name: match.player2?.name || "TBD"
//             }
//           ]
//         };
//       });
//     });

//     // Second pass: set nextMatchId for each match
//     // This is a simplified approach - in a real tournament, you'd need logic to determine which match feeds into which
//     rounds.forEach((round, roundIndex) => {
//       if (roundIndex < rounds.length - 1) {
//         const nextRound = rounds[roundIndex + 1];
//         const currentRoundMatches = roundsMap[round];
//         const nextRoundMatches = roundsMap[nextRound];
        
//         currentRoundMatches.forEach((match, matchIndex) => {
//           const currentMatchId = `${round}-${matchIndex}`;
//           const nextMatchIndex = Math.floor(matchIndex / 2);
//           if (nextRoundMatches[nextMatchIndex]) {
//             const nextMatchId = `${nextRound}-${nextMatchIndex}`;
//             matchesById[currentMatchId].nextMatchId = nextMatchId;
//           }
//         });
//       }
//     });

//     return Object.values(matchesById);
//   };

//   // Custom match component to match the reference image style
//   const CustomMatch = ({ match, onMatchClick, onPartyClick, onMouseEnter, onMouseLeave, ...props }) => {
//     const homeParty = match.participants[0];
//     const awayParty = match.participants[1];
    
//     return (
//       <div 
//         className="bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-700 w-[200px]"
//         onClick={() => onMatchClick(match)}
//         onMouseEnter={() => onMouseEnter(match)}
//         onMouseLeave={() => onMouseLeave()}
//       >
//         <div className="text-xs text-center bg-gray-700 py-1 text-gray-300">
//           {match.tournamentRoundText}
//         </div>
//         <div 
//           className={`p-2 border-l-4 ${homeParty.isWinner ? 'border-green-500' : 'border-gray-700'} flex justify-between items-center`}
//           onClick={(e) => { e.stopPropagation(); onPartyClick(homeParty); }}
//         >
//           <span className="text-white font-medium">{homeParty.name}</span>
//           <span className={`ml-2 ${homeParty.isWinner ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
//             {homeParty.resultText}
//           </span>
//         </div>
//         <div 
//           className={`p-2 border-l-4 ${awayParty.isWinner ? 'border-green-500' : 'border-gray-700'} flex justify-between items-center`}
//           onClick={(e) => { e.stopPropagation(); onPartyClick(awayParty); }}
//         >
//           <span className="text-white font-medium">{awayParty.name}</span>
//           <span className={`ml-2 ${awayParty.isWinner ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
//             {awayParty.resultText}
//           </span>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
//       <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 animate-slideIn">
//         <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
//           <h2 className="text-2xl font-bold text-white flex items-center">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//             </svg>
//             TOURNAMENT STRUCTURE
//             {fixtureData.eventName && (
//               <span className="ml-2 text-lg text-gray-400">({fixtureData.eventName})</span>
//             )}
//           </h2>
//           <button
//             onClick={() => setShowFixtureModal(false)}
//             className="text-gray-400 hover:text-white transition-colors hover:bg-red-600 hover:bg-opacity-20 p-2 rounded-full"
//           >
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>
//         </div>

//         <div className="text-white">
//           {/* Tournament Summary Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner flex flex-col items-center justify-center">
//               <h3 className="text-lg font-semibold mb-2 text-red-500">FORMAT</h3>
//               <p className="text-white text-xl font-bold">{fixtureData.matchType}</p>
//               {fixtureData.eventName && (
//                 <p className="text-gray-400 text-sm mt-2">{fixtureData.eventName}</p>
//               )}
//             </div>
            
//             <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner flex flex-col items-center justify-center">
//               <h3 className="text-lg font-semibold mb-2 text-red-500">TEAMS</h3>
//               <div className="inline-flex items-center justify-center bg-red-600 text-white font-bold rounded-full w-14 h-14 shadow-lg text-xl">
//                 {fixtureData.numTeams}
//               </div>
//             </div>
            
//             <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner flex flex-col items-center justify-center">
//               <h3 className="text-lg font-semibold mb-2 text-red-500">SUMMARY</h3>
//               <div className="text-center">
//                 <p className="text-white font-bold">{fixtureData.totalRounds} Rounds</p>
//                 <p className="text-white font-bold">{fixtureData.totalMatches} Matches</p>
//               </div>
//             </div>
//           </div>

//           {/* Tournament Bracket Visualization */}
//           <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-5 rounded-lg mb-6 border border-gray-700 shadow-lg">
//             <h3 className="text-xl font-bold text-center mb-6 text-white">
//               Tournament Progression
//             </h3>

//             {matches.length > 0 ? (
//               <div className="overflow-x-auto pb-4">
//                 <SingleEliminationBracket
//                   matches={matches}
//                   matchComponent={CustomMatch}
//                   svgWrapper={({ children, ...props }) => (
//                     <SVGViewer 
//                       width={Math.max(matches.length * 250, 800)} 
//                       height={Math.max(matches.length * 100, 500)} 
//                       {...props}
//                       background="#1f2937"
//                       SVGBackground="#1f2937"
//                     >
//                       {children}
//                     </SVGViewer>
//                   )}
//                   options={{
//                     style: {
//                       roundHeader: {
//                         fontSize: '14px',
//                         fontWeight: 'bold',
//                         color: '#f87171',
//                       },
//                       connectorColor: '#4b5563',
//                       connectorColorHighlight: '#ef4444',
//                     },
//                   }}
//                 />
//               </div>
//             ) : (
//               <div className="text-gray-400 text-center w-full py-8">No fixture data available.</div>
//             )}
//           </div>
//         </div>
//       </div>
      
//       {/* Add global styles for animations */}
//       <style>
//         {`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         @keyframes slideIn {
//           from { transform: translateY(-20px); opacity: 0; }
//           to { transform: translateY(0); opacity: 1; }
//         }
//         @keyframes pulse {
//           0%, 100% { opacity: 0.6; }
//           50% { opacity: 1; }
//         }
//         @keyframes bounce {
//           0%, 100% { transform: translateX(-2px) rotate(45deg); }
//           50% { transform: translateX(0) rotate(45deg); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//         .animate-slideIn {
//           animation: slideIn 0.4s ease-out;
//         }
//         .animate-pulse {
//           animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
//         .animate-bounce {
//           animation: bounce 1.5s infinite;
//         }
//         `}
//       </style>
//     </div>
//   );
// };

// export default FixtureModal;

// import { useState, useEffect } from 'react';
// import { SingleEliminationBracket, Match, SVGViewer } from '@g-loot/react-tournament-brackets';

// const FixtureModal = ({ fixtureData, setShowFixtureModal }) => {
//   const [matches, setMatches] = useState([]);
  
//   // Transform fixtureData to the format expected by the library
//   useEffect(() => {
//     if (fixtureData && (fixtureData.matches || []).length > 0) {
//       const transformedMatches = transformMatchesToBracketFormat(fixtureData);
//       setMatches(transformedMatches);
//     }
//   }, [fixtureData]);

//   // Function to transform matches to the format expected by the library
//   const transformMatchesToBracketFormat = (data) => {
//     if (!data || !data.matches) return [];
    
//     // Group matches by round
//     const roundsMap = {};
//     data.matches.forEach(match => {
//       if (!roundsMap[match.round]) {
//         roundsMap[match.round] = [];
//       }
//       roundsMap[match.round].push(match);
//     });

//     // Sort rounds in order (assuming rounds are named in a way that can be sorted)
//     const rounds = Object.keys(roundsMap).sort((a, b) => {
//       // Custom sort for knockout rounds
//       const roundOrder = [
//         "PRELIMINARY ROUND",
//         "ROUND 1",
//         "ROUND 2",
//         "ROUND 3",
//         "ROUND OF 128",
//         "ROUND OF 64",
//         "ROUND OF 32",
//         "ROUND OF 16",
//         "PRE-QUARTER FINAL",
//         "QUARTER FINAL",
//         "SEMI FINAL",
//         "FINAL",
//       ];
//       return roundOrder.indexOf(a) - roundOrder.indexOf(b);
//     });

//     // Create a map of matches by ID for easy lookup
//     const matchesById = {};
    
//     // First pass: create match objects
//     rounds.forEach((round, roundIndex) => {
//       const roundMatches = roundsMap[round];
//       roundMatches.forEach((match, matchIndex) => {
//         const matchId = `${round}-${matchIndex}`;
//         matchesById[matchId] = {
//           id: matchId,
//           name: `${round} - Match ${matchIndex + 1}`,
//           nextMatchId: null, // Will be set in second pass
//           tournamentRoundText: round,
//           startTime: match.date || new Date().toISOString(),
//           state: match.status === "Completed" ? "DONE" : "SCHEDULED",
//           participants: [
//             {
//               id: match.player1?._id || `player1-${matchId}`,
//               resultText: match.score ? match.score.split('-')[0].trim() : "",
//               isWinner: match.winner && match.player1 && match.winner._id === match.player1._id,
//               status: match.status === "Completed" ? "PLAYED" : null,
//               name: match.player1?.name || "TBD"
//             },
//             {
//               id: match.player2?._id || `player2-${matchId}`,
//               resultText: match.score ? match.score.split('-')[1].trim() : "",
//               isWinner: match.winner && match.player2 && match.winner._id === match.player2._id,
//               status: match.status === "Completed" ? "PLAYED" : null,
//               name: match.player2?.name || "TBD"
//             }
//           ]
//         };
//       });
//     });

//     // Second pass: set nextMatchId for each match
//     // This is a simplified approach - in a real tournament, you'd need logic to determine which match feeds into which
//     rounds.forEach((round, roundIndex) => {
//       if (roundIndex < rounds.length - 1) {
//         const nextRound = rounds[roundIndex + 1];
//         const currentRoundMatches = roundsMap[round];
//         const nextRoundMatches = roundsMap[nextRound];
        
//         currentRoundMatches.forEach((match, matchIndex) => {
//           const currentMatchId = `${round}-${matchIndex}`;
//           const nextMatchIndex = Math.floor(matchIndex / 2);
//           if (nextRoundMatches[nextMatchIndex]) {
//             const nextMatchId = `${nextRound}-${nextMatchIndex}`;
//             matchesById[currentMatchId].nextMatchId = nextMatchId;
//           }
//         });
//       }
//     });

//     return Object.values(matchesById);
//   };

//   // Custom match component to match the reference image style
//   const CustomMatch = ({ match, onMatchClick, onPartyClick, onMouseEnter, onMouseLeave, ...props }) => {
//     const homeParty = match.participants[0];
//     const awayParty = match.participants[1];
    
//     return (
//       <div 
//         className="bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-700 w-[200px]"
//         onClick={() => onMatchClick(match)}
//         onMouseEnter={() => onMouseEnter(match)}
//         onMouseLeave={() => onMouseLeave()}
//       >
//         <div className="text-xs text-center bg-gray-700 py-1 text-gray-300">
//           {match.tournamentRoundText}
//         </div>
//         <div 
//           className={`p-2 border-l-4 ${homeParty.isWinner ? 'border-green-500' : 'border-gray-700'} flex justify-between items-center`}
//           onClick={(e) => { e.stopPropagation(); onPartyClick(homeParty); }}
//         >
//           <span className="text-white font-medium">{homeParty.name}</span>
//           <span className={`ml-2 ${homeParty.isWinner ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
//             {homeParty.resultText}
//           </span>
//         </div>
//         <div 
//           className={`p-2 border-l-4 ${awayParty.isWinner ? 'border-green-500' : 'border-gray-700'} flex justify-between items-center`}
//           onClick={(e) => { e.stopPropagation(); onPartyClick(awayParty); }}
//         >
//           <span className="text-white font-medium">{awayParty.name}</span>
//           <span className={`ml-2 ${awayParty.isWinner ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
//             {awayParty.resultText}
//           </span>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
//       <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 max-w-6xl w-full h-[90vh] overflow-hidden border border-gray-700 animate-slideIn flex flex-col">
//         <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
//           <h2 className="text-2xl font-bold text-white flex items-center">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//             </svg>
//             TOURNAMENT STRUCTURE
//             {fixtureData.eventName && (
//               <span className="ml-2 text-lg text-gray-400">({fixtureData.eventName})</span>
//             )}
//           </h2>
//           <button
//             onClick={() => setShowFixtureModal(false)}
//             className="text-gray-400 hover:text-white transition-colors hover:bg-red-600 hover:bg-opacity-20 p-2 rounded-full"
//           >
//             <svg
//               className="w-6 h-6"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>
//         </div>

//         <div className="text-white flex-grow flex flex-col overflow-hidden">
//           {/* Tournament Summary Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner flex flex-col items-center justify-center">
//               <h3 className="text-lg font-semibold mb-2 text-red-500">FORMAT</h3>
//               <p className="text-white text-xl font-bold">{fixtureData.matchType}</p>
//               {fixtureData.eventName && (
//                 <p className="text-gray-400 text-sm mt-2">{fixtureData.eventName}</p>
//               )}
//             </div>
            
//             <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner flex flex-col items-center justify-center">
//               <h3 className="text-lg font-semibold mb-2 text-red-500">TEAMS</h3>
//               <div className="inline-flex items-center justify-center bg-red-600 text-white font-bold rounded-full w-14 h-14 shadow-lg text-xl">
//                 {fixtureData.numTeams}
//               </div>
//             </div>
            
//             <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner flex flex-col items-center justify-center">
//               <h3 className="text-lg font-semibold mb-2 text-red-500">SUMMARY</h3>
//               <div className="text-center">
//                 <p className="text-white font-bold">{fixtureData.totalRounds} Rounds</p>
//                 <p className="text-white font-bold">{fixtureData.totalMatches} Matches</p>
//               </div>
//             </div>
//           </div>

//           {/* Tournament Bracket Visualization */}
//           <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-5 rounded-lg mb-6 border border-gray-700 shadow-lg flex-grow overflow-hidden flex flex-col">
//             <h3 className="text-xl font-bold text-center mb-6 text-white">
//               Tournament Progression
//             </h3>

//             {matches.length > 0 ? (
//               <div className="overflow-auto flex-grow">
//                 <SingleEliminationBracket
//                   matches={matches}
//                   matchComponent={CustomMatch}
//                   svgWrapper={({ children, ...props }) => (
//                     <SVGViewer 
//                       width={Math.max(matches.length * 300, 1000)} 
//                       height={Math.max(matches.length * 150, 800)} 
//                       {...props}
//                       background="#1f2937"
//                       SVGBackground="#1f2937"
//                       customZoom={{
//                         initialZoomLevel: 0.8,
//                         minimumZoomLevel: 0.5,
//                         maximumZoomLevel: 2,
//                         zoomMultiplier: 0.1
//                       }}
//                     >
//                       {children}
//                     </SVGViewer>
//                   )}
//                   options={{
//                     style: {
//                       roundHeader: {
//                         fontSize: '16px',
//                         fontWeight: 'bold',
//                         color: '#f87171',
//                       },
//                       connectorColor: '#4b5563',
//                       connectorColorHighlight: '#ef4444',
//                     },
//                   }}
//                 />
//               </div>
//             ) : (
//               <div className="text-gray-400 text-center w-full py-8">No fixture data available.</div>
//             )}
//           </div>
//         </div>
//       </div>
      
//       {/* Add global styles for animations */}
//       <style>
//         {`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         @keyframes slideIn {
//           from { transform: translateY(-20px); opacity: 0; }
//           to { transform: translateY(0); opacity: 1; }
//         }
//         @keyframes pulse {
//           0%, 100% { opacity: 0.6; }
//           50% { opacity: 1; }
//         }
//         @keyframes bounce {
//           0%, 100% { transform: translateX(-2px) rotate(45deg); }
//           50% { transform: translateX(0) rotate(45deg); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//         .animate-slideIn {
//           animation: slideIn 0.4s ease-out;
//         }
//         .animate-pulse {
//           animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
//         .animate-bounce {
//           animation: bounce 1.5s infinite;
//         }
//         `}
//       </style>
//     </div>
//   );
// };

// export default FixtureModal;

// import { useState, useEffect } from 'react';
// import { SingleEliminationBracket, Match, SVGViewer } from '@g-loot/react-tournament-brackets';

// const FixtureModal = ({ fixtureData, setShowFixtureModal }) => {
//   const [matches, setMatches] = useState([]);
  
//   // Transform fixtureData to the format expected by the library
//   useEffect(() => {
//     if (fixtureData && (fixtureData.matches || []).length > 0) {
//       const transformedMatches = transformMatchesToBracketFormat(fixtureData);
//       setMatches(transformedMatches);
//     }
//   }, [fixtureData]);

//   // Function to transform matches to the format expected by the library
//   const transformMatchesToBracketFormat = (data) => {
//     if (!data || !data.matches) return [];
    
//     // Group matches by round
//     const roundsMap = {};
//     data.matches.forEach(match => {
//       if (!roundsMap[match.round]) {
//         roundsMap[match.round] = [];
//       }
//       roundsMap[match.round].push(match);
//     });

//     // Sort rounds in order (assuming rounds are named in a way that can be sorted)
//     const rounds = Object.keys(roundsMap).sort((a, b) => {
//       // Custom sort for knockout rounds
//       const roundOrder = [
//         "PRELIMINARY ROUND",
//         "ROUND 1",
//         "ROUND 2",
//         "ROUND 3",
//         "ROUND OF 128",
//         "ROUND OF 64",
//         "ROUND OF 32",
//         "ROUND OF 16",
//         "PRE-QUARTER FINAL",
//         "QUARTER FINAL",
//         "SEMI FINAL",
//         "FINAL",
//       ];
//       return roundOrder.indexOf(a) - roundOrder.indexOf(b);
//     });

//     // Create a map of matches by ID for easy lookup
//     const matchesById = {};
    
//     // First pass: create match objects
//     rounds.forEach((round, roundIndex) => {
//       const roundMatches = roundsMap[round];
//       roundMatches.forEach((match, matchIndex) => {
//         const matchId = `${round}-${matchIndex}`;
//         matchesById[matchId] = {
//           id: matchId,
//           name: `${round} - Match ${matchIndex + 1}`,
//           nextMatchId: null, // Will be set in second pass
//           tournamentRoundText: round,
//           startTime: match.date || new Date().toISOString(),
//           state: match.status === "Completed" ? "DONE" : "SCHEDULED",
//           participants: [
//             {
//               id: match.player1?._id || `player1-${matchId}`,
//               resultText: match.score ? match.score.split('-')[0].trim() : "",
//               isWinner: match.winner && match.player1 && match.winner._id === match.player1._id,
//               status: match.status === "Completed" ? "PLAYED" : null,
//               name: match.player1?.name || "TBD"
//             },
//             {
//               id: match.player2?._id || `player2-${matchId}`,
//               resultText: match.score ? match.score.split('-')[1].trim() : "",
//               isWinner: match.winner && match.player2 && match.winner._id === match.player2._id,
//               status: match.status === "Completed" ? "PLAYED" : null,
//               name: match.player2?.name || "TBD"
//             }
//           ]
//         };
//       });
//     });

//     // Second pass: set nextMatchId for each match
//     // This is a simplified approach - in a real tournament, you'd need logic to determine which match feeds into which
//     rounds.forEach((round, roundIndex) => {
//       if (roundIndex < rounds.length - 1) {
//         const nextRound = rounds[roundIndex + 1];
//         const currentRoundMatches = roundsMap[round];
//         const nextRoundMatches = roundsMap[nextRound];
        
//         currentRoundMatches.forEach((match, matchIndex) => {
//           const currentMatchId = `${round}-${matchIndex}`;
//           const nextMatchIndex = Math.floor(matchIndex / 2);
//           if (nextRoundMatches[nextMatchIndex]) {
//             const nextMatchId = `${nextRound}-${nextMatchIndex}`;
//             matchesById[currentMatchId].nextMatchId = nextMatchId;
//           }
//         });
//       }
//     });

//     return Object.values(matchesById);
//   };

//   // Custom match component to match the reference image style
//   const CustomMatch = ({ match, onMatchClick, onPartyClick, onMouseEnter, onMouseLeave, ...props }) => {
//     const homeParty = match.participants[0];
//     const awayParty = match.participants[1];
    
//     return (
//       <div 
//         className="bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-700 w-[300px]" // Increased width from 250px to 300px
//         onClick={() => onMatchClick(match)}
//         onMouseEnter={() => onMouseEnter(match)}
//         onMouseLeave={() => onMouseLeave()}
//       >
//         <div className="text-xs text-center bg-gray-700 py-1 text-gray-300">
//           {match.tournamentRoundText}
//         </div>
//         <div 
//           className={`p-2 border-l-4 ${homeParty.isWinner ? 'border-green-500' : 'border-gray-700'} flex justify-between items-center overflow-hidden`}
//           onClick={(e) => { e.stopPropagation(); onPartyClick(homeParty); }}
//         >
//           <span className="text-white font-medium truncate w-full mr-2">{homeParty.name}</span>
//           <span className={`ml-2 flex-shrink-0 ${homeParty.isWinner ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
//             {homeParty.resultText}
//           </span>
//         </div>
//         <div 
//           className={`p-2 border-l-4 ${awayParty.isWinner ? 'border-green-500' : 'border-gray-700'} flex justify-between items-center overflow-hidden`}
//           onClick={(e) => { e.stopPropagation(); onPartyClick(awayParty); }}
//         >
//           <span className="text-white font-medium truncate w-full mr-2">{awayParty.name}</span>
//           <span className={`ml-2 flex-shrink-0 ${awayParty.isWinner ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
//             {awayParty.resultText}
//           </span>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col h-screen w-screen">
//       <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
//         <h2 className="text-2xl font-bold text-white flex items-center">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//           </svg>
//           TOURNAMENT STRUCTURE
//           {fixtureData.eventName && (
//             <span className="ml-2 text-lg text-gray-400">({fixtureData.eventName})</span>
//           )}
//         </h2>
//         <button
//           onClick={() => setShowFixtureModal(false)}
//           className="text-gray-400 hover:text-white transition-colors hover:bg-red-600 hover:bg-opacity-20 p-2 rounded-full"
//         >
//           <svg
//             className="w-6 h-6"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M6 18L18 6M6 6l12 12"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Tournament Summary Cards - Simplified to a single row */}
//       <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800">
//         <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-3 rounded-lg border border-gray-700 flex items-center justify-between">
//           <h3 className="text-sm font-semibold text-red-500">FORMAT</h3>
//           <p className="text-white font-bold">{fixtureData.matchType}</p>
//         </div>
        
//         <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-3 rounded-lg border border-gray-700 flex items-center justify-between">
//           <h3 className="text-sm font-semibold text-red-500">TEAMS</h3>
//           <div className="inline-flex items-center justify-center bg-red-600 text-white font-bold rounded-full w-8 h-8 text-sm">
//             {fixtureData.numTeams}
//           </div>
//         </div>
        
//         <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-3 rounded-lg border border-gray-700 flex items-center justify-between">
//           <h3 className="text-sm font-semibold text-red-500">SUMMARY</h3>
//           <div className="text-right">
//             <p className="text-white text-sm font-bold">{fixtureData.totalRounds} Rounds</p>
//             <p className="text-white text-sm font-bold">{fixtureData.totalMatches} Matches</p>
//           </div>
//         </div>
//       </div>

//       {/* Tournament Bracket Visualization - Full page with proper scrolling */}
//       <div className="flex-grow overflow-auto bg-gray-900 p-2"> {/* Changed from overflow-hidden to overflow-auto */}
//   <h3 className="text-xl font-bold text-center mb-2 text-white">
//     Tournament Progression
//   </h3>

//   {matches.length > 0 ? (
//     <div className="h-full w-full overflow-auto" style={{ touchAction: 'pan-x pan-y' }}>
//       <SingleEliminationBracket
//         matches={matches}
//         matchComponent={CustomMatch}
//         svgWrapper={({ children, ...props }) => (
//           <SVGViewer 
//             width={Math.max(matches.length * 500, window.innerWidth)} 
//             height={Math.max(matches.length * 300, window.innerHeight - 200)} 
//             {...props}
//             background="#1f2937"
//             SVGBackground="#1f2937"
//             customZoom={{
//               initialZoomLevel: 0.9,
//               minimumZoomLevel: 0.5,
//               maximumZoomLevel: 2.5,
//               zoomMultiplier: 0.1,
//               smoothScroll: true
//             }}
//           >
//             {children}
//           </SVGViewer>
//         )}
//         options={{
//           style: {
//             roundHeader: {
//               fontSize: '16px',
//               fontWeight: 'bold',
//               color: '#f87171',
//             },
//             connectorColor: '#4b5563',
//             connectorColorHighlight: '#ef4444',
//           },
//         }}
//       />
//     </div>
//   ) : (
//     <div className="text-gray-400 text-center w-full py-8">No fixture data available.</div>
//   )}
// </div>
//     </div>
//   );
// };

// export default FixtureModal;