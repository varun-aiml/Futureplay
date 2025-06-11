// import React, { useState } from "react";

// const EventFixtures = ({ fixtures }) => {
//   const [activeTab, setActiveTab] = useState(
//     fixtures && fixtures.matchType === "Group+Knockout" ? "groups" : "bracket"
//   );

//   if (!fixtures || !fixtures.matches || fixtures.matches.length === 0) {
//     return (
//       <div className="bg-gray-800 rounded-xl p-6 text-center">
//         <p className="text-gray-400">No fixtures available yet.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-6">
//       {/* Tabs for different views */}
//       <div className="flex border-b border-gray-700">
//         {fixtures.matchType === "Group+Knockout" && (
//           <button
//             className={`px-4 py-3 font-medium ${
//               activeTab === "groups"
//                 ? "text-red-500 border-b-2 border-red-500"
//                 : "text-gray-400 hover:text-white"
//             }`}
//             onClick={() => setActiveTab("groups")}
//           >
//             Groups
//           </button>
//         )}
//         <button
//           className={`px-4 py-3 font-medium ${
//             activeTab === "bracket"
//               ? "text-red-500 border-b-2 border-red-500"
//               : "text-gray-400 hover:text-white"
//           }`}
//           onClick={() => setActiveTab("bracket")}
//         >
//           {fixtures.matchType === "League" ? "Matches" : "Bracket"}
//         </button>
//       </div>

//       <div className="p-4">
//         {activeTab === "groups" && fixtures.groups && (
//           <div className="space-y-6">
//             {fixtures.groups.map((group, index) => (
//               <div key={index} className="bg-gray-900 rounded-lg p-4">
//                 <h3 className="text-lg font-semibold text-white mb-3">
//                   {group.name}
//                 </h3>

//                 {/* Group table */}
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full bg-gray-900">
//                     <thead>
//                       <tr className="bg-gray-800 text-gray-400 text-xs uppercase">
//                         <th className="py-2 px-3 text-left">TEAMS</th>
//                         <th className="py-2 px-3 text-center">P</th>
//                         <th className="py-2 px-3 text-center">W</th>
//                         <th className="py-2 px-3 text-center">L</th>
//                         <th className="py-2 px-3 text-center">D</th>
//                         <th className="py-2 px-3 text-center">PTS</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {group.teams.map((team, teamIndex) => (
//                         <tr
//                           key={teamIndex}
//                           className="border-t border-gray-800 text-white"
//                         >
//                           <td className="py-2 px-3">{team.team.name}</td>
//                           <td className="py-2 px-3 text-center">
//                             {team.played}
//                           </td>
//                           <td className="py-2 px-3 text-center">{team.won}</td>
//                           <td className="py-2 px-3 text-center">{team.lost}</td>
//                           <td className="py-2 px-3 text-center">
//                             {team.drawn}
//                           </td>
//                           <td className="py-2 px-3 text-center font-bold">
//                             {team.points}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Group matches */}
//                 <div className="mt-4">
//                   <h4 className="text-sm font-medium text-gray-400 mb-2">
//                     Matches
//                   </h4>
//                   <div className="space-y-2">
//                     {fixtures.matches
//                       .filter(
//                         (match) =>
//                           match.round.includes("GROUP") &&
//                           match.round.includes(group.name.split(" ")[1])
//                       )
//                       .map((match, matchIndex) => (
//                         <div
//                           key={matchIndex}
//                           className="bg-gray-800 p-2 rounded flex justify-between items-center"
//                         >
//                           <div className="flex-1 text-right pr-2">
//                             {match.player1.name}
//                           </div>
//                           <div className="px-3 py-1 bg-gray-700 rounded text-xs">
//                             {match.status === "Completed" ? match.score : "vs"}
//                           </div>
//                           <div className="flex-1 pl-2">
//                             {match.player2.name}
//                           </div>
//                         </div>
//                       ))}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {activeTab === "bracket" && (
//           <div className="overflow-x-auto">
//             {fixtures.matchType === "League" ? (
//               // League matches display
//               <div className="space-y-4">
//                 {Array.from(
//                   new Set(fixtures.matches.map((match) => match.round))
//                 )
//                   .sort((a, b) => {
//                     const aNum = parseInt(a.split(" ").pop());
//                     const bNum = parseInt(b.split(" ").pop());
//                     return aNum - bNum;
//                   })
//                   .map((round, roundIndex) => (
//                     <div
//                       key={roundIndex}
//                       className="bg-gray-900 rounded-lg p-4"
//                     >
//                       <h3 className="text-lg font-semibold text-white mb-3">
//                         {round}
//                       </h3>
//                       <div className="space-y-2">
//                         {fixtures.matches
//                           .filter((match) => match.round === round)
//                           .map((match, matchIndex) => (
//                             <div
//                               key={matchIndex}
//                               className="bg-gray-800 p-3 rounded flex justify-between items-center"
//                             >
//                               <div
//                                 className={`flex-1 text-right pr-2 ${
//                                   match.winner &&
//                                   match.winner._id === match.player1._id
//                                     ? "font-bold text-green-400"
//                                     : ""
//                                 }`}
//                               >
//                                 {match.player1 ? match.player1.name : "TBD"}
//                               </div>
//                               <div className="px-3 py-1 bg-gray-700 rounded text-xs">
//                                 {match.status === "Completed"
//                                   ? match.score
//                                   : "vs"}
//                               </div>
//                               <div
//                                 className={`flex-1 pl-2 ${
//                                   match.winner &&
//                                   match.winner._id === match.player2._id
//                                     ? "font-bold text-green-400"
//                                     : ""
//                                 }`}
//                               >
//                                 {match.player2 ? match.player2.name : "TBD"}
//                               </div>
//                             </div>
//                           ))}
//                       </div>
//                     </div>
//                   ))}
//               </div>
//             ) : (
//               // Knockout bracket display
//               <div className="flex space-x-4 min-w-max pb-4">
//                 {Array.from(
//                   new Set(fixtures.matches.map((match) => match.round))
//                 )
//                   .sort((a, b) => {
//                     // Custom sort for knockout rounds
//                     const rounds = [
//                       "PRELIMINARY ROUND",
//                       "ROUND 1",
//                       "ROUND 2",
//                       "ROUND 3",
//                       "ROUND OF 128",
//                       "ROUND OF 64",
//                       "ROUND OF 32",
//                       "PRE-QUARTER FINAL",
//                       "QUARTER FINAL",
//                       "SEMI FINAL",
//                       "FINAL",
//                     ];
//                     return rounds.indexOf(a) - rounds.indexOf(b);
//                   })
//                   .map((round, roundIndex) => {
//                     const roundMatches = fixtures.matches.filter(
//                       (match) => match.round === round
//                     );
//                     return (
//                       <div key={roundIndex} className="w-[200px]">
//                         <div className="bg-red-600 p-2 rounded-t text-center">
//                           <h3 className="font-bold text-white">{round}</h3>
//                         </div>
//                         <div className="bg-gray-900 p-2 rounded-b space-y-4">
//                           {roundMatches.map((match, matchIndex) => (
//                             <div key={matchIndex} className="space-y-1">
//                               <div
//                                 className={`bg-gray-800 p-2 rounded-t border-l-4 ${
//                                   match.winner &&
//                                   match.player1 &&
//                                   match.winner._id === match.player1._id
//                                     ? "border-green-500"
//                                     : "border-gray-700"
//                                 }`}
//                               >
//                                 {match.player1 ? match.player1.name : "TBD"}
//                               </div>
//                               <div
//                                 className={`bg-gray-800 p-2 rounded-b border-l-4 ${
//                                   match.winner &&
//                                   match.player2 &&
//                                   match.winner._id === match.player2._id
//                                     ? "border-green-500"
//                                     : "border-gray-700"
//                                 }`}
//                               >
//                                 {match.player2 ? match.player2.name : "TBD"}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     );
//                   })}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EventFixtures;

// import React, { useState, useEffect } from "react";
// import { SingleEliminationBracket, Match, SVGViewer } from '@g-loot/react-tournament-brackets';

// const EventFixtures = ({ fixtures }) => {
//   const [activeTab, setActiveTab] = useState(
//     fixtures && fixtures.matchType === "Group+Knockout" ? "groups" : "bracket"
//   );
//   const [bracketMatches, setBracketMatches] = useState([]);

//   useEffect(() => {
//     if (fixtures && fixtures.matches && fixtures.matches.length > 0 && activeTab === "bracket") {
//       const transformedMatches = transformMatchesToBracketFormat(fixtures);
//       setBracketMatches(transformedMatches);
//     }
//   }, [fixtures, activeTab]);

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

//   if (!fixtures || !fixtures.matches || fixtures.matches.length === 0) {
//     return (
//       <div className="bg-gray-800 rounded-xl p-6 text-center">
//         <p className="text-gray-400">No fixtures available yet.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-6">
//       {/* Tabs for different views */}
//       <div className="flex border-b border-gray-700">
//         {fixtures.matchType === "Group+Knockout" && (
//           <button
//             className={`px-4 py-3 font-medium ${
//               activeTab === "groups"
//                 ? "text-red-500 border-b-2 border-red-500"
//                 : "text-gray-400 hover:text-white"
//             }`}
//             onClick={() => setActiveTab("groups")}
//           >
//             Groups
//           </button>
//         )}
//         <button
//           className={`px-4 py-3 font-medium ${
//             activeTab === "bracket"
//               ? "text-red-500 border-b-2 border-red-500"
//               : "text-gray-400 hover:text-white"
//           }`}
//           onClick={() => setActiveTab("bracket")}
//         >
//           {fixtures.matchType === "League" ? "Matches" : "Bracket"}
//         </button>
//       </div>

//       <div className="p-4">
//         {activeTab === "groups" && fixtures.groups && (
//           <div className="space-y-6">
//             {fixtures.groups.map((group, index) => (
//               <div key={index} className="bg-gray-900 rounded-lg p-4">
//                 <h3 className="text-lg font-semibold text-white mb-3">
//                   {group.name}
//                 </h3>

//                 {/* Group table */}
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full bg-gray-900">
//                     <thead>
//                       <tr className="bg-gray-800 text-gray-400 text-xs uppercase">
//                         <th className="py-2 px-3 text-left">TEAMS</th>
//                         <th className="py-2 px-3 text-center">P</th>
//                         <th className="py-2 px-3 text-center">W</th>
//                         <th className="py-2 px-3 text-center">L</th>
//                         <th className="py-2 px-3 text-center">D</th>
//                         <th className="py-2 px-3 text-center">PTS</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {group.teams.map((team, teamIndex) => (
//                         <tr
//                           key={teamIndex}
//                           className="border-t border-gray-800 text-white"
//                         >
//                           <td className="py-2 px-3">{team.team.name}</td>
//                           <td className="py-2 px-3 text-center">
//                             {team.played}
//                           </td>
//                           <td className="py-2 px-3 text-center">{team.won}</td>
//                           <td className="py-2 px-3 text-center">{team.lost}</td>
//                           <td className="py-2 px-3 text-center">
//                             {team.drawn}
//                           </td>
//                           <td className="py-2 px-3 text-center font-bold">
//                             {team.points}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Group matches */}
//                 <div className="mt-4">
//                   <h4 className="text-sm font-medium text-gray-400 mb-2">
//                     Matches
//                   </h4>
//                   <div className="space-y-2">
//                     {fixtures.matches
//                       .filter(
//                         (match) =>
//                           match.round.includes("GROUP") &&
//                           match.round.includes(group.name.split(" ")[1])
//                       )
//                       .map((match, matchIndex) => (
//                         <div
//                           key={matchIndex}
//                           className="bg-gray-800 p-2 rounded flex justify-between items-center"
//                         >
//                           <div className="flex-1 text-right pr-2">
//                             {match.player1.name}
//                           </div>
//                           <div className="px-3 py-1 bg-gray-700 rounded text-xs">
//                             {match.status === "Completed" ? match.score : "vs"}
//                           </div>
//                           <div className="flex-1 pl-2">
//                             {match.player2.name}
//                           </div>
//                         </div>
//                       ))}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {activeTab === "bracket" && (
//           <div className="overflow-x-auto">
//             {fixtures.matchType === "League" ? (
//               // League matches display
//               <div className="space-y-4">
//                 {Array.from(
//                   new Set(fixtures.matches.map((match) => match.round))
//                 )
//                   .sort((a, b) => {
//                     const aNum = parseInt(a.split(" ").pop());
//                     const bNum = parseInt(b.split(" ").pop());
//                     return aNum - bNum;
//                   })
//                   .map((round, roundIndex) => (
//                     <div
//                       key={roundIndex}
//                       className="bg-gray-900 rounded-lg p-4"
//                     >
//                       <h3 className="text-lg font-semibold text-white mb-3">
//                         {round}
//                       </h3>
//                       <div className="space-y-2">
//                         {fixtures.matches
//                           .filter((match) => match.round === round)
//                           .map((match, matchIndex) => (
//                             <div
//                               key={matchIndex}
//                               className="bg-gray-800 p-3 rounded flex justify-between items-center"
//                             >
//                               <div
//                                 className={`flex-1 text-right pr-2 ${
//                                   match.winner &&
//                                   match.winner._id === match.player1._id
//                                     ? "font-bold text-green-400"
//                                     : ""
//                                 }`}
//                               >
//                                 {match.player1 ? match.player1.name : "TBD"}
//                               </div>
//                               <div className="px-3 py-1 bg-gray-700 rounded text-xs">
//                                 {match.status === "Completed"
//                                   ? match.score
//                                   : "vs"}
//                               </div>
//                               <div
//                                 className={`flex-1 pl-2 ${
//                                   match.winner &&
//                                   match.winner._id === match.player2._id
//                                     ? "font-bold text-green-400"
//                                     : ""
//                                 }`}
//                               >
//                                 {match.player2 ? match.player2.name : "TBD"}
//                               </div>
//                             </div>
//                           ))}
//                       </div>
//                     </div>
//                   ))}
//               </div>
//             ) : (
//               // Knockout bracket display using the library
//               <div className="min-h-[500px]">
//                 {bracketMatches.length > 0 ? (
//                   <SingleEliminationBracket
//                     matches={bracketMatches}
//                     matchComponent={CustomMatch}
//                     svgWrapper={({ children, ...props }) => (
//                       <SVGViewer 
//                         width={Math.max(bracketMatches.length * 250, 800)} 
//                         height={Math.max(bracketMatches.length * 100, 500)} 
//                         {...props}
//                         background="#1f2937"
//                         SVGBackground="#1f2937"
//                       >
//                         {children}
//                       </SVGViewer>
//                     )}
//                     options={{
//                       style: {
//                         roundHeader: {
//                           fontSize: '14px',
//                           fontWeight: 'bold',
//                           color: '#f87171',
//                         },
//                         connectorColor: '#4b5563',
//                         connectorColorHighlight: '#ef4444',
//                       },
//                     }}
//                   />
//                 ) : (
//                   <div className="text-gray-400 text-center w-full py-8">No bracket data available.</div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EventFixtures;

import { useState, useEffect } from "react";
import { SingleEliminationBracket, SVGViewer } from "@g-loot/react-tournament-brackets";

const EventFixtures = ({ fixtures }) => {
  const [activeTab, setActiveTab] = useState(
    fixtures?.matchType === "League" ? "bracket" : "groups"
  );
  const [bracketMatches, setBracketMatches] = useState([]);

  // Transform fixtures data to the format expected by the library
  useEffect(() => {
    if (fixtures && fixtures.matches && fixtures.matches.length > 0) {
      const transformedMatches = transformMatchesToBracketFormat(fixtures);
      setBracketMatches(transformedMatches);
    }
  }, [fixtures]);

  // Function to transform matches to the format expected by the library
  const transformMatchesToBracketFormat = (data) => {
    if (!data || !data.matches) return [];

    // Filter out group matches
    const knockoutMatches = data.matches.filter(
      (match) => !match.round.includes("GROUP")
    );

    // Group matches by round
    const roundsMap = {};
    knockoutMatches.forEach((match) => {
      if (!roundsMap[match.round]) {
        roundsMap[match.round] = [];
      }
      roundsMap[match.round].push(match);
    });

    // Sort rounds in order (assuming rounds are named in a way that can be sorted)
    const rounds = Object.keys(roundsMap).sort((a, b) => {
      // Custom sort for knockout rounds
      const roundOrder = [
        "PRELIMINARY ROUND",
        "ROUND 1",
        "ROUND 2",
        "ROUND 3",
        "ROUND OF 128",
        "ROUND OF 64",
        "ROUND OF 32",
        "ROUND OF 16",
        "PRE-QUARTER FINAL",
        "QUARTER FINAL",
        "SEMI FINAL",
        "FINAL",
      ];
      return roundOrder.indexOf(a) - roundOrder.indexOf(b);
    });

    // Create a map of matches by ID for easy lookup
    const matchesById = {};

    // First pass: create match objects
    rounds.forEach((round, roundIndex) => {
      const roundMatches = roundsMap[round];
      roundMatches.forEach((match, matchIndex) => {
        const matchId = `${round}-${matchIndex}`;
        matchesById[matchId] = {
          id: matchId,
          name: `${round} - Match ${matchIndex + 1}`,
          nextMatchId: null, // Will be set in second pass
          tournamentRoundText: round,
          startTime: match.date || new Date().toISOString(),
          state: match.status === "Completed" ? "DONE" : "SCHEDULED",
          participants: [
            {
              id: match.player1?._id || `player1-${matchId}`,
              resultText: match.score ? match.score.split("-")[0].trim() : "",
              isWinner:
                match.winner &&
                match.player1 &&
                match.winner._id === match.player1._id,
              status: match.status === "Completed" ? "PLAYED" : null,
              name: match.player1?.name || "TBD",
            },
            {
              id: match.player2?._id || `player2-${matchId}`,
              resultText: match.score ? match.score.split("-")[1].trim() : "",
              isWinner:
                match.winner &&
                match.player2 &&
                match.winner._id === match.player2._id,
              status: match.status === "Completed" ? "PLAYED" : null,
              name: match.player2?.name || "TBD",
            },
          ],
        };
      });
    });

    // Second pass: set nextMatchId for each match
    // This is a simplified approach - in a real tournament, you'd need logic to determine which match feeds into which
    rounds.forEach((round, roundIndex) => {
      if (roundIndex < rounds.length - 1) {
        const nextRound = rounds[roundIndex + 1];
        const currentRoundMatches = roundsMap[round];
        const nextRoundMatches = roundsMap[nextRound];

        currentRoundMatches.forEach((match, matchIndex) => {
          const currentMatchId = `${round}-${matchIndex}`;
          const nextMatchIndex = Math.floor(matchIndex / 2);
          if (nextRoundMatches[nextMatchIndex]) {
            const nextMatchId = `${nextRound}-${nextMatchIndex}`;
            matchesById[currentMatchId].nextMatchId = nextMatchId;
          }
        });
      }
    });

    return Object.values(matchesById);
  };

  // Custom match component to match the reference image style
  const CustomMatch = ({ match, onMatchClick, onPartyClick, onMouseEnter, onMouseLeave, ...props }) => {
    const homeParty = match.participants[0];
    const awayParty = match.participants[1];
    
    return (
      <div 
        className="bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-700 w-[300px]" // Increased width from 250px to 300px
        onClick={() => onMatchClick(match)}
        onMouseEnter={() => onMouseEnter(match)}
        onMouseLeave={() => onMouseLeave()}
      >
        <div className="text-xs text-center bg-gray-700 py-1 text-gray-300">
          {match.tournamentRoundText}
        </div>
        <div 
          className={`p-2 border-l-4 ${homeParty.isWinner ? 'border-green-500' : 'border-gray-700'} flex justify-between items-center overflow-hidden`}
          onClick={(e) => { e.stopPropagation(); onPartyClick(homeParty); }}
        >
          <span className="text-white font-medium truncate w-full mr-2">{homeParty.name}</span>
          <span className={`ml-2 flex-shrink-0 ${homeParty.isWinner ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
            {homeParty.resultText}
          </span>
        </div>
        <div 
          className={`p-2 border-l-4 ${awayParty.isWinner ? 'border-green-500' : 'border-gray-700'} flex justify-between items-center overflow-hidden`}
          onClick={(e) => { e.stopPropagation(); onPartyClick(awayParty); }}
        >
          <span className="text-white font-medium truncate w-full mr-2">{awayParty.name}</span>
          <span className={`ml-2 flex-shrink-0 ${awayParty.isWinner ? 'text-green-400 font-bold' : 'text-gray-400'}`}>
            {awayParty.resultText}
          </span>
        </div>
      </div>
    );
  };

  if (!fixtures) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center">
        <p className="text-gray-400">No fixtures available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg h-full flex flex-col">
      {/* Tabs for different views */}
      <div className="flex border-b border-gray-700">
        {fixtures.matchType === "Group+Knockout" && (
          <button
            className={`px-4 py-3 font-medium ${
              activeTab === "groups"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("groups")}
          >
            Groups
          </button>
        )}
        <button
          className={`px-4 py-3 font-medium ${
            activeTab === "bracket"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("bracket")}
        >
          {fixtures.matchType === "League" ? "Matches" : "Bracket"}
        </button>
      </div>

      <div className="flex-grow overflow-hidden">
        {activeTab === "groups" && fixtures.groups && (
          <div className="h-full overflow-auto p-4">
            <div className="space-y-6">
              {/* ... existing groups code ... */}
            </div>
          </div>
        )}

        {activeTab === "bracket" && (
          <div className="h-full w-full overflow-hidden">
            {fixtures.matchType === "League" ? (
              // League matches display with scrolling
              <div className="h-full overflow-auto p-4">
                <div className="space-y-4">
                  {/* ... existing league matches code ... */}
                </div>
              </div>
            ) : (
              // Knockout bracket display using the library - full page with proper scrolling
              <div className="h-full w-full overflow-auto">
  {bracketMatches.length > 0 ? (
    <div className="h-full w-full overflow-auto" style={{ touchAction: 'pan-x pan-y' }}>
      <SingleEliminationBracket
        matches={bracketMatches}
        matchComponent={CustomMatch}
        svgWrapper={({ children, ...props }) => (
          <SVGViewer 
            width={Math.max(bracketMatches.length * 500, window.innerWidth)} 
            height={Math.max(bracketMatches.length * 300, window.innerHeight - 100)} 
            {...props}
            background="#1f2937"
            SVGBackground="#1f2937"
            customZoom={{
              initialZoomLevel: 0.9,
              minimumZoomLevel: 0.5,
              maximumZoomLevel: 2.5,
              zoomMultiplier: 0.1,
              smoothScroll: true
            }}
          >
            {children}
          </SVGViewer>
        )}
        options={{
          style: {
            roundHeader: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#f87171',
            },
            connectorColor: '#4b5563',
            connectorColorHighlight: '#ef4444',
          },
        }}
      />
    </div>
  ) : (
    <div className="text-gray-400 text-center w-full py-8">No bracket data available.</div>
  )}
</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventFixtures;