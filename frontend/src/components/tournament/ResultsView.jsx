import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getTournamentBookings } from '../../services/bookingService';

const ResultsView = ({ tournamentId, events }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPool, setSelectedPool] = useState('A');
  const [fixtures, setFixtures] = useState({ poolA: [], poolB: [], knockout: [] });
  const [declaredResults, setDeclaredResults] = useState({});
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [declaredResultsByPool, setDeclaredResultsByPool] = useState({
    A: {},
    B: {},
    knockout: {}
  });
  const [poolStandings, setPoolStandings] = useState({
    A: [],
    B: [],
    knockout: [] // Initialize knockout standings to prevent undefined error
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await getTournamentBookings(tournamentId);
        setBookings(response.data.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load team data');
      }
    };
    
    fetchBookings();
  }, [tournamentId]);

  // Load fixtures and results from localStorage
  useEffect(() => {
    loadFixturesFromLocalStorage();
    setIsLoading(false);
  }, [tournamentId]);

  // Update standings when pool changes or results change
  useEffect(() => {
    if (fixtures) {
      const standings = calculatePoolStandings(fixtures[`pool${selectedPool}`] || []);
      setPoolStandings(prev => ({
        ...prev,
        [selectedPool]: standings
      }));
    }
  }, [selectedPool, fixtures, declaredResultsByPool]);

  const loadFixturesFromLocalStorage = () => {
    try {
      const savedFixtures = localStorage.getItem(`fixtures_${tournamentId}`);
      const savedDeclaredResults = localStorage.getItem(`declaredResults_${tournamentId}`);
      const savedDeclaredResultsByPool = localStorage.getItem(`declaredResultsByPool_${tournamentId}`);
      
      if (savedFixtures) {
        const parsedFixtures = JSON.parse(savedFixtures);
        setFixtures(parsedFixtures);
      }

      if (savedDeclaredResults) {
        const parsedResults = JSON.parse(savedDeclaredResults);
        setDeclaredResults(parsedResults);
      }

      if (savedDeclaredResultsByPool) {
        const parsedResultsByPool = JSON.parse(savedDeclaredResultsByPool);
        setDeclaredResultsByPool(parsedResultsByPool);
      }
    } catch (error) {
      console.error('Error loading fixtures from localStorage:', error);
      setError('Failed to load match results');
    }
  };

   // Make sure expandedMatch is defined before using it
   const toggleExpandMatch = (matchId) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId);
  };

  // Calculate pool standings based on match results
  const calculatePoolStandings = (poolFixtures) => {
    if (!poolFixtures || poolFixtures.length === 0) return [];
    
    const franchiseStats = {};
    
    // Initialize stats for all franchises in the pool
    poolFixtures.forEach(match => {
      if (!franchiseStats[match.franchise1._id]) {
        franchiseStats[match.franchise1._id] = {
          franchise: match.franchise1,
          played: 0,
          won: 0,
          draw: 0,
          lost: 0,
          matchesWon: 0,
          matchesLost: 0,
          gamesWon: 0,
          gamesLost: 0,
          points: 0
        };
      }
      
      if (!franchiseStats[match.franchise2._id]) {
        franchiseStats[match.franchise2._id] = {
          franchise: match.franchise2,
          played: 0,
          won: 0,
          draw: 0,
          lost: 0,
          matchesWon: 0,
          matchesLost: 0,
          gamesWon: 0,
          gamesLost: 0,
          points: 0
        };
      }
    });
    
    // Process match results
    poolFixtures.forEach(match => {
      const result = declaredResultsByPool[selectedPool][match.id];
      if (result) {
        const franchise1Id = match.franchise1._id;
        const franchise2Id = match.franchise2._id;
        
        // Update played matches
        franchiseStats[franchise1Id].played += 1;
        franchiseStats[franchise2Id].played += 1;
        
        if (result.isTie) {
          // It's a tie
          franchiseStats[franchise1Id].draw += 1;
          franchiseStats[franchise2Id].draw += 1;
          franchiseStats[franchise1Id].points += 1;
          franchiseStats[franchise2Id].points += 1;
        } else if (result.winner === franchise1Id) {
          // Franchise 1 won
          franchiseStats[franchise1Id].won += 1;
          franchiseStats[franchise2Id].lost += 1;
          franchiseStats[franchise1Id].points += 3;
        } else if (result.winner === franchise2Id) {
          // Franchise 2 won
          franchiseStats[franchise2Id].won += 1;
          franchiseStats[franchise1Id].lost += 1;
          franchiseStats[franchise2Id].points += 3;
        }
        
        // Process event matches for detailed stats
        match.eventMatches.forEach(eventMatch => {
          if (eventMatch.completed) {
            if (eventMatch.winner === 0) { // Team 1 won
              franchiseStats[franchise1Id].matchesWon += 1;
              franchiseStats[franchise2Id].matchesLost += 1;
              
              // Parse score to get games won/lost
              if (eventMatch.score) {
                const scores = eventMatch.score.split(' ');
                scores.forEach(score => {
                  const [team1Score, team2Score] = score.split('-').map(Number);
                  franchiseStats[franchise1Id].gamesWon += team1Score;
                  franchiseStats[franchise1Id].gamesLost += team2Score;
                  franchiseStats[franchise2Id].gamesWon += team2Score;
                  franchiseStats[franchise2Id].gamesLost += team1Score;
                });
              }
            } else if (eventMatch.winner === 1) { // Team 2 won
              franchiseStats[franchise2Id].matchesWon += 1;
              franchiseStats[franchise1Id].matchesLost += 1;
              
              // Parse score to get games won/lost
              if (eventMatch.score) {
                const scores = eventMatch.score.split(' ');
                scores.forEach(score => {
                  const [team1Score, team2Score] = score.split('-').map(Number);
                  franchiseStats[franchise2Id].gamesWon += team2Score;
                  franchiseStats[franchise2Id].gamesLost += team1Score;
                  franchiseStats[franchise1Id].gamesWon += team1Score;
                  franchiseStats[franchise1Id].gamesLost += team2Score;
                });
              }
            }
          }
        });
      }
    });
    
    // Convert to array and sort by points (then by matches won if points are equal)
    return Object.values(franchiseStats).sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.matchesWon !== b.matchesWon) return b.matchesWon - a.matchesWon;
      return b.gamesWon - a.gamesWon;
    });
  };

  // Get team name for display
  const getTeamName = (teamId, eventMatch) => {
    if (!teamId) return 'Not assigned';
    
    // Find the team in bookings
    const team = bookings.find(booking => booking._id === teamId);
    if (!team) return 'Unknown Team';
    
    // Check if this is a doubles event
    const isDoublesEvent = (eventId) => {
      const event = events.find(e => e._id === eventId);
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
    
    // For doubles events, show both player names
    if (eventMatch && eventMatch.eventId) {
      if (isDoublesEvent(eventMatch.eventId)) {
        // Find partner team from the same franchise and event
        const franchiseId = team.franchise;
        const franchiseTeamsInEvent = bookings.filter(b => 
          b._id !== teamId && 
          b.franchise === franchiseId && 
          b.event === eventMatch.eventId
        );
        
        if (franchiseTeamsInEvent.length > 0) {
          const partnerTeam = franchiseTeamsInEvent[0];
          return `${team.playerName} and ${partnerTeam.playerName}`;
        }
      } else if (is30Or35MensEvent(eventMatch.eventId)) {
        // For 30+/35+ events, find partner from the same franchise in 30+/35+ events
        const franchiseId = team.franchise;
        
        // Get all 30+ and 35+ teams from this franchise
        const franchiseTeamsIn30And35Events = bookings.filter(booking => 
          booking.franchise === franchiseId && 
          booking._id !== teamId &&
          booking.event && events.some(e => 
            e._id === booking.event && 
            (e.name.toLowerCase().includes("30+ men's") || e.name.toLowerCase().includes("35+ men's"))
          )
        );
        
        // If there's another team from the same franchise in these events
        if (franchiseTeamsIn30And35Events.length > 0) {
          const partnerTeam = franchiseTeamsIn30And35Events[0];
          return `${team.playerName} and ${partnerTeam.playerName}`;
        }
      } else if (is40MensEvent(eventMatch.eventId)) {
        // For 40+ men's events, find partner from the same franchise in 40+ events
        const franchiseId = team.franchise;
        
        // Get all 40+ men's players teams from this franchise
        const franchiseTeamsIn40MensEvent = bookings.filter(booking => 
          booking.franchise === franchiseId && 
          booking._id !== teamId &&
          booking.event && events.some(e => 
            e._id === booking.event && 
            e.name.toLowerCase().includes("40+ men's")
          )
        );
        
        // If there's another team from the same franchise in this event
        if (franchiseTeamsIn40MensEvent.length > 0) {
          const partnerTeam = franchiseTeamsIn40MensEvent[0];
          return `${team.playerName} and ${partnerTeam.playerName}`;
        }
      }
    }
    
    return team.playerName || 'Unknown Player';
  };

  // Add getEventName function to display event names
  const getEventName = (eventId) => {
    // For the special combined 30+/35+ event
    if (eventId === 'combined-30-35-mens') {
      return "One 30+ and 35+ Men's Players";
    }
    
    // Check if this is a 30+ or 35+ men's event (for backward compatibility)
    const event = events.find(e => e._id === eventId);
    if (event && event.name && (
      event.name.toLowerCase().includes("30+ men's player") ||
      event.name.toLowerCase().includes("35+ men's player")
    )) {
      return "One 30+ and 35+ Men's Players";
    }
    
    return event ? event.name : 'Unknown Event';
  };

  // Get match stage name (for knockout matches)
  const getMatchStageName = (match) => {
    if (!match.stage) return '';
    
    switch(match.stage) {
      case 'semi':
        return 'Semi Final:';
      case 'final':
        return 'Final:';
      case 'thirdPlace':
        return 'Third Place:';
      default:
        return match.stage ? `${match.stage}:` : '';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="spinner"></div>
        <p className="mt-2 text-gray-300">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 text-white p-4 rounded-md mb-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="bg-gray-800 p-4 rounded-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Match Results</h3>
          
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

        {/* Results Table */}
        {selectedPool !== 'knockout' && (
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="bg-gray-900">
                  <th className="p-3 text-left"></th>
                  <th className="p-3 text-left">Country</th>
                  {poolStandings[selectedPool].map((team, index) => (
                    <th key={team.franchise._id} className="p-3 text-center">{index + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {poolStandings[selectedPool].map((team, rowIndex) => (
                  <tr key={team.franchise._id} className={rowIndex % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                    <td className="p-3 text-center">{rowIndex + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        {/* You can add country flag here if available */}
                        <span className="ml-2">{team.franchise.franchiseName}</span>
                      </div>
                    </td>
                    {poolStandings[selectedPool].map((opponent, colIndex) => {
                      if (team.franchise._id === opponent.franchise._id) {
                        // Same team - show empty cell with dark background
                        return <td key={opponent.franchise._id} className="p-3 bg-gray-900"></td>;
                      }
                      
                      // Find match between these two teams
                      const match = fixtures[`pool${selectedPool}`]?.find(m => 
                        (m.franchise1._id === team.franchise._id && m.franchise2._id === opponent.franchise._id) ||
                        (m.franchise1._id === opponent.franchise._id && m.franchise2._id === team.franchise._id)
                      );
                      
                      if (!match) return <td key={opponent.franchise._id} className="p-3"></td>;
                      
                      const result = declaredResultsByPool[selectedPool][match.id];
                      if (!result) return <td key={opponent.franchise._id} className="p-3"></td>;
                      
                      const isWinner = result.winner === team.franchise._id;
                      const isLoser = result.winner === opponent.franchise._id;
                      const isTie = result.isTie;
                      
                      // Count event matches won by each team
                      let team1Wins = 0;
                      let team2Wins = 0;
                      match.eventMatches.forEach(eventMatch => {
                        if (eventMatch.completed) {
                          if (match.franchise1._id === team.franchise._id) {
                            if (eventMatch.winner === 0) team1Wins++;
                            if (eventMatch.winner === 1) team2Wins++;
                          } else {
                            if (eventMatch.winner === 0) team2Wins++;
                            if (eventMatch.winner === 1) team1Wins++;
                          }
                        }
                      });
                      
                      const score = match.franchise1._id === team.franchise._id ? 
                        `${team1Wins}-${team2Wins}` : `${team2Wins}-${team1Wins}`;
                      
                      return (
                        <td 
                          key={opponent.franchise._id} 
                          className={`p-3 text-center ${isWinner ? 'bg-green-800' : isLoser ? 'bg-red-800' : isTie ? 'bg-blue-800' : ''}`}
                        >
                          {result && (
                            <div>
                              <div className="font-bold">{score}</div>
                              <div>{isWinner ? 'Won' : isLoser ? 'Lost' : isTie ? 'Tie' : ''}</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Points Table */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-white mb-4">Points Table</h3>
          {selectedPool === 'knockout' ? (
  <div className="text-white p-4 bg-gray-700 rounded-md">
    {/* Knockout Stage Bracket Visualization */}
    <div className="bracket-container flex flex-col items-center justify-center w-full">
      {/* Debug information - will show if there's no data */}

      
      {(!fixtures.knockout || fixtures.knockout.length === 0) && (
        <p className="text-yellow-500 mb-4">No knockout stage matches found in fixtures data.</p>
      )}
      
      {fixtures.knockout && fixtures.knockout.length > 0 && Object.keys(declaredResultsByPool.knockout || {}).length === 0 && (
        <p className="text-yellow-500 mb-4">No declared results found for knockout stage matches.</p>
      )}
      
      {/* Always show bracket structure even if no matches */}
      <div className="flex w-full justify-between">
        {/* Left side - First Semi-final */}
        <div className="w-1/3">
        {fixtures.knockout && fixtures.knockout
    .filter(match => match.round && match.round.includes('Semi Final'))
    .slice(0, 1)
    .map(match => {
      // Display match even if no result is declared
      const result = declaredResultsByPool.knockout?.[match.id] || { winner: null };
      
      // Count event matches won by each team
      let team1Wins = 0;
      let team2Wins = 0;
      if (match.eventMatches) {
        match.eventMatches.forEach(eventMatch => {
          if (eventMatch && eventMatch.completed) {
            if (eventMatch.winner === 0) team1Wins++;
            if (eventMatch.winner === 1) team2Wins++;
          }
        });
      }
      
      return (
        <div key={match.id} className="bracket-match bg-gray-900 rounded-md overflow-hidden mb-4">
          <div className="p-3 flex flex-col">
            {/* Team 1 */}
            <div className={`flex justify-between items-center p-2 ${result.winner === match.franchise1?._id ? 'bg-gray-800' : 'bg-gray-900'} rounded-t-md`}>
              <div className="flex items-center">
                {result.winner === match.franchise1?._id && (
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                )}
                <span className="text-white">{match.franchise1?.franchiseName || 'Team 1'}</span>
              </div>
              <span className="text-red-500 font-bold">{team1Wins}</span>
            </div>
            
            {/* Team 2 */}
            <div className={`flex justify-between items-center p-2 ${result.winner === match.franchise2?._id ? 'bg-gray-800' : 'bg-gray-900'} rounded-b-md`}>
              <div className="flex items-center">
                {result.winner === match.franchise2?._id && (
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                )}
                <span className="text-white">{match.franchise2?.franchiseName || 'Team 2'}</span>
              </div>
              <span className="text-red-500 font-bold">{team2Wins}</span>
            </div>
          </div>
        </div>
      );
    })}
            
          {/* If no semi-final match found, show placeholder */}
          {(!fixtures.knockout || !fixtures.knockout.find(match => match.round && match.round.includes('Semi Final'))) && (
    <div className="bracket-match bg-gray-900 rounded-md overflow-hidden mb-4">
      <div className="p-3 flex flex-col">
        <div className="flex justify-between items-center p-2 bg-gray-900 rounded-t-md">
          <span className="text-white">Semi-Final 1</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-gray-900 rounded-b-md">
          <span className="text-white">Team TBD</span>
        </div>
      </div>
    </div>
  )}
        </div>
        
        {/* Right side - Second Semi-final */}
        <div className="w-1/3">
        {fixtures.knockout && fixtures.knockout
    .filter(match => match.round && match.round.includes('Semi Final'))
            .slice(1, 2)
            .map(match => {
              // Display match even if no result is declared
              const result = declaredResultsByPool.knockout?.[match.id] || { winner: null };
              
              // Count event matches won by each team
              let team1Wins = 0;
              let team2Wins = 0;
              if (match.eventMatches) {
                match.eventMatches.forEach(eventMatch => {
                  if (eventMatch && eventMatch.completed) {
                    if (eventMatch.winner === 0) team1Wins++;
                    if (eventMatch.winner === 1) team2Wins++;
                  }
                });
              }
              
              return (
                <div key={match.id} className="bracket-match bg-gray-900 rounded-md overflow-hidden mb-4">
                  <div className="p-3 flex flex-col">
                    {/* Team 1 */}
                    <div className={`flex justify-between items-center p-2 ${result.winner === match.franchise1?._id ? 'bg-gray-800' : 'bg-gray-900'} rounded-t-md`}>
                      <div className="flex items-center">
                        {result.winner === match.franchise1?._id && (
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        )}
                        <span className="text-white">{match.franchise1?.franchiseName || 'Team 1'}</span>
                      </div>
                      <span className="text-red-500 font-bold">{team1Wins}</span>
                    </div>
                    
                    {/* Team 2 */}
                    <div className={`flex justify-between items-center p-2 ${result.winner === match.franchise2?._id ? 'bg-gray-800' : 'bg-gray-900'} rounded-b-md`}>
                      <div className="flex items-center">
                        {result.winner === match.franchise2?._id && (
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        )}
                        <span className="text-white">{match.franchise2?.franchiseName || 'Team 2'}</span>
                      </div>
                      <span className="text-red-500 font-bold">{team2Wins}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
          {/* If no second semi-final match found, show placeholder */}
          {(!fixtures.knockout || fixtures.knockout.filter(match => match.round && match.round.includes('Semi Final')).length < 2) && (
            <div className="bracket-match bg-gray-900 rounded-md overflow-hidden mb-4">
              <div className="p-3 flex flex-col">
                <div className="flex justify-between items-center p-2 bg-gray-900 rounded-t-md">
                  <span className="text-white">Semi-Final 2</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-900 rounded-b-md">
                  <span className="text-white">Team TBD</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Connecting lines - Fixed Tailwind classes */}
      <div className="relative w-full h-16 -mt-2 mb-2">
        <div className="absolute left-[25%] right-[25%] top-1/2 h-px bg-gray-500"></div>
        <div className="absolute left-[25%] top-0 bottom-1/2 w-px bg-gray-500"></div>
        <div className="absolute right-[25%] top-0 bottom-1/2 w-px bg-gray-500"></div>
      </div>
      
      {/* Final match */}
      <div className="w-1/3">
      {fixtures.knockout && fixtures.knockout
    .filter(match => match.round && match.round.includes('Final'))
          .map(match => {
            // Display match even if no result is declared
            const result = declaredResultsByPool.knockout?.[match.id] || { winner: null };
            
            // Count event matches won by each team
            let team1Wins = 0;
            let team2Wins = 0;
            if (match.eventMatches) {
              match.eventMatches.forEach(eventMatch => {
                if (eventMatch && eventMatch.completed) {
                  if (eventMatch.winner === 0) team1Wins++;
                  if (eventMatch.winner === 1) team2Wins++;
                }
              });
            }
            
            return (
              <div key={match.id} className="bracket-match bg-gray-900 rounded-md overflow-hidden">
                <div className="p-3 flex flex-col">
                  {/* Team 1 */}
                  <div className={`flex justify-between items-center p-2 ${result.winner === match.franchise1?._id ? 'bg-gray-800' : 'bg-gray-900'} rounded-t-md`}>
                    <div className="flex items-center">
                      {result.winner === match.franchise1?._id && (
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      )}
                      <span className="text-white">{match.franchise1?.franchiseName || 'Finalist 1'}</span>
                    </div>
                    <span className="text-red-500 font-bold">{team1Wins}</span>
                  </div>
                  
                  {/* Team 2 */}
                  <div className={`flex justify-between items-center p-2 ${result.winner === match.franchise2?._id ? 'bg-gray-800' : 'bg-gray-900'} rounded-b-md`}>
                    <div className="flex items-center">
                      {result.winner === match.franchise2?._id && (
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      )}
                      <span className="text-white">{match.franchise2?.franchiseName || 'Finalist 2'}</span>
                    </div>
                    <span className="text-red-500 font-bold">{team2Wins}</span>
                  </div>
                </div>
              </div>
            );
          })}
          
        {/* If no final match found, show placeholder */}
        {(!fixtures.knockout || !fixtures.knockout.find(match => match.round && match.round.includes('Final'))) && (
          <div className="bracket-match bg-gray-900 rounded-md overflow-hidden">
            <div className="p-3 flex flex-col">
              <div className="flex justify-between items-center p-2 bg-gray-900 rounded-t-md">
                <span className="text-white">Final</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-900 rounded-b-md">
                <span className="text-white">Winner TBD</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
): (
            <div className="overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="bg-gray-900">
                    <th className="p-3 text-center"></th>
                    <th className="p-3 text-left">Country</th>
                    <th className="p-3 text-center">Points</th>
                    <th className="p-3 text-center">Played</th>
                    <th className="p-3 text-center">Won</th>
                    <th className="p-3 text-center">Draw</th>
                    <th className="p-3 text-center">Lost</th>
                    <th className="p-3 text-center">Matches</th>
                    <th className="p-3 text-center">Games</th>
                    <th className="p-3 text-center">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {poolStandings[selectedPool]?.map((team, index) => (
                    <tr key={team.franchise._id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                      <td className="p-3 text-center">{index + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          {/* You can add country flag here if available */}
                          <span className="ml-2">{team.franchise.franchiseName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">{team.points}</td>
                      <td className="p-3 text-center">{team.played}</td>
                      <td className="p-3 text-center">{team.won}</td>
                      <td className="p-3 text-center">{team.draw}</td>
                      <td className="p-3 text-center">{team.lost}</td>
                      <td className="p-3 text-center">{team.matchesWon} - {team.matchesLost}</td>
                      <td className="p-3 text-center">{team.gamesWon} - {team.gamesLost}</td>
                      <td className="p-3 text-center">{team.gamesWon} - {team.gamesLost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Match Schedule Results */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-white mb-4">Match Schedule</h3>
          
          {(selectedPool === 'knockout' ? fixtures.knockout : fixtures[`pool${selectedPool}`])?.map(match => {
  const result = declaredResultsByPool[selectedPool][match.id];
  if (!result) return null;
            
            return (
              <div key={match.id} className="bg-gray-700 rounded-md overflow-hidden mb-4">
                <div className="p-3 bg-gray-600 flex justify-between items-center">
                  <div className="flex items-center">
                    {selectedPool === 'knockout' && (
                      <div className="text-red-500 font-bold mr-2">
                        {getMatchStageName(match)}
                      </div>
                    )}
                    <div className="text-gray-400 mr-3">
                      <div>27 APR</div>
                      <div>Starts</div>
                      <div>9:30 AM</div>
                    </div>
                    
                    <div className="flex items-center">
                      {result.winner === match.franchise1._id && (
                        <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                      )}
                      
                      <span className="text-white font-medium">
                        {match.franchise1.franchiseName}
                      </span>
                      
                      <span className="text-gray-300 mx-2 font-bold">vs</span>
                      
                      <span className="text-white font-medium">
                        {match.franchise2.franchiseName}
                      </span>
                      
                      {result.winner === match.franchise2._id && (
                        <div className="w-4 h-4 rounded-full bg-green-500 ml-2"></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-red-500 font-bold">
                    {/* Count event matches won by each team */}
                    {(() => {
                      let team1Wins = 0;
                      let team2Wins = 0;
                      match.eventMatches.forEach(eventMatch => {
                        if (eventMatch.completed) {
                          if (eventMatch.winner === 0) team1Wins++;
                          if (eventMatch.winner === 1) team2Wins++;
                        }
                      });
                      return `${team1Wins} - ${team2Wins}`;
                    })()}
                  </div>
                </div>
                
                <div className="p-3 border-t border-gray-600">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">
                      Court {match.court || 'TBD'}
                    </div>
                    
                    <button
                      onClick={() => toggleExpandMatch(match.id)}
                      className="text-red-500 hover:text-red-400 text-sm font-medium"
                    >
                      SEE ALL
                    </button>
                  </div>
                </div>
                
                {/* Expanded match details - Updated to show event names */}
                {expandedMatch === match.id && (
  <div className="p-3 border-t border-gray-600">
      {match.eventMatches.map((eventMatch, index) => (
        <div key={eventMatch.eventId} className="mb-2 last:mb-0 p-2 bg-gray-800 rounded">
        <div className="text-white text-sm">
          MATCH {index + 1} - {getEventName(eventMatch.eventId)}
        </div>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>{eventMatch.team1 ? getTeamName(eventMatch.team1, eventMatch) : 'Not assigned'}</span>
          <span className="mx-1">vs</span>
          <span>{eventMatch.team2 ? getTeamName(eventMatch.team2, eventMatch) : 'Not assigned'}</span>
          {eventMatch.completed && eventMatch.score && (
            <span className="ml-2 text-red-500">{eventMatch.score}</span>
          )}
        </div>
      </div>
      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultsView;