import { useState, useEffect } from 'react';
import { getAllFranchises } from '../../services/franchiseService';
import { getTournamentBookings, updateTeamEvent } from '../../services/bookingService';
import { toast } from 'react-toastify';
import ScoreModal from './ScoreModal';

const FranchiseFixturesView = ({ tournamentId, events, readOnly = false }) => {
  const [franchises, setFranchises] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showTeamsList, setShowTeamsList] = useState(false);
  const [showEventChangeModal, setShowEventChangeModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedMatchForScoring, setSelectedMatchForScoring] = useState(null);
  
  // New state variables for fixture generation
  const [pools, setPools] = useState({ A: [], B: [] });
  const [selectedPool, setSelectedPool] = useState('A');
  const [fixtures, setFixtures] = useState({ poolA: [], poolB: [], knockout: [] });
  const [showFixtures, setShowFixtures] = useState(false);
  const [isGeneratingFixtures, setIsGeneratingFixtures] = useState(false);
  const [fixtureError, setFixtureError] = useState('');
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [declaredResults, setDeclaredResults] = useState({});
  const [declaredMatchIds, setDeclaredMatchIds] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [declaredResultsByPool, setDeclaredResultsByPool] = useState({
    A: {},
    B: {},
    knockout: {}
  });
  
  // New state for auto-assigned teams
  const [autoAssignedTeams, setAutoAssignedTeams] = useState({});
  const [scoringFormats, setScoringFormats] = useState({
    A: '21-3',
    B: '21-3',
    knockout: '21-3'
  });
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

// Add this function to handle opening the score modal
const handleOpenScoreModal = (match, eventMatch) => {
    setSelectedMatchForScoring({
      matchId: match.id,
      poolType: selectedPool,
      eventId: eventMatch.eventId,
      eventName: eventMatch.eventName,
      team1: eventMatch.team1,
      team2: eventMatch.team2,
      team1Name: eventMatch.team1 ? getTeamName(eventMatch.team1, eventMatch) : 'Not assigned',
      team2Name: eventMatch.team2 ? getTeamName(eventMatch.team2, eventMatch) : 'Not assigned',
      score: eventMatch.score || '0-0',
      completed: eventMatch.completed || false,
      winner: eventMatch.winner,
      scoringFormat: scoringFormats[selectedPool] // Use pool-specific format
    });
    setShowScoreModal(true);
  };


// Function to handle declaring results for a match
const handleDeclareResult = (matchId, poolType) => {
    // Get the match from the fixtures
    const poolKey = poolType === 'A' ? 'poolA' : poolType === 'B' ? 'poolB' : 'knockout';
    const match = fixtures[poolKey].find(m => m.id === matchId);
    
    if (!match) return;
    
    // Check if all event matches have scores
    const allMatchesScored = match.eventMatches.every(em => em.completed);
    
    if (!allMatchesScored) {
      toast.error('All event matches must be scored before declaring a result');
      return;
    }
    
    // Count events won by each franchise and track total points
    let franchise1EventsWon = 0;
    let franchise2EventsWon = 0;
    let franchise1TotalPoints = 0;
    let franchise2TotalPoints = 0;
    
    match.eventMatches.forEach(eventMatch => {
      if (eventMatch.completed) {
        // Parse the score to calculate total points
        if (eventMatch.score) {
          const sets = eventMatch.score.split(',');
          sets.forEach(set => {
            const [team1Points, team2Points] = set.split('-').map(Number);
            franchise1TotalPoints += team1Points;
            franchise2TotalPoints += team2Points;
          });
        }
        
        if (eventMatch.winner === 0) { // Team 1 won
          franchise1EventsWon++;
        } else if (eventMatch.winner === 1) { // Team 2 won
          franchise2EventsWon++;
        }
      }
    });
    
    // Determine the winner
    let winner = null;
    let isTie = false;
    
    if (franchise1EventsWon > franchise2EventsWon) {
      winner = match.franchise1._id;
    } else if (franchise2EventsWon > franchise1EventsWon) {
      winner = match.franchise2._id;
    } else {
      // Events won are equal, use points as tiebreaker
      if (franchise1TotalPoints > franchise2TotalPoints) {
        winner = match.franchise1._id;
      } else if (franchise2TotalPoints > franchise1TotalPoints) {
        winner = match.franchise2._id;
      } else {
        // Still tied even after points comparison
        isTie = true;
      }
    }
    
    // // Add debugging
    // console.log('Match ID:', matchId);
    // console.log('Franchise 1 ID:', match.franchise1._id);
    // console.log('Franchise 2 ID:', match.franchise2._id);
    // console.log('Franchise 1 Events Won:', franchise1EventsWon);
    // console.log('Franchise 2 Events Won:', franchise2EventsWon);
    // console.log('Franchise 1 Total Points:', franchise1TotalPoints);
    // console.log('Franchise 2 Total Points:', franchise2TotalPoints);
    // console.log('Winner ID:', winner);
    // console.log('Is Tie:', isTie);
    
    // IMPORTANT FIX: First get existing results from localStorage
    const savedDeclaredResults = localStorage.getItem(`declaredResults_${tournamentId}`);
let parsedResults = {};
let parsedResultsByPool = {
  A: {},
  B: {},
  knockout: {}
};

if (savedDeclaredResults) {
  try {
    parsedResults = JSON.parse(savedDeclaredResults);
    setDeclaredResults(parsedResults);
    
    // Also load pool-specific results
    const savedDeclaredResultsByPool = localStorage.getItem(`declaredResultsByPool_${tournamentId}`);
    if (savedDeclaredResultsByPool) {
      parsedResultsByPool = JSON.parse(savedDeclaredResultsByPool);
      setDeclaredResultsByPool(parsedResultsByPool);
    } else {
      // If we don't have pool-specific results yet, initialize from existing results
      const resultsByPool = {
        A: {},
        B: {},
        knockout: {}
      };
      
      // Distribute existing results to appropriate pools
      Object.keys(parsedResults).forEach(matchId => {
        // Try to determine which pool this match belongs to
        let matchPool = 'A'; // Default
        
        if (fixtures.poolA.some(match => match.id === matchId)) {
          matchPool = 'A';
        } else if (fixtures.poolB.some(match => match.id === matchId)) {
          matchPool = 'B';
        } else if (fixtures.knockout.some(match => match.id === matchId)) {
          matchPool = 'knockout';
        }
        
        resultsByPool[matchPool][matchId] = parsedResults[matchId];
      });
      
      parsedResultsByPool = resultsByPool;
      setDeclaredResultsByPool(resultsByPool);
      localStorage.setItem(`declaredResultsByPool_${tournamentId}`, JSON.stringify(resultsByPool));
    }
  } catch (error) {
    console.error('Error loading declared results:', error);
  }
}
    
    // Merge new result with existing results
    const newResults = {
        ...parsedResults,
        [matchId]: {
          winner,
          isTie,
          franchise1EventsWon,
          franchise2EventsWon,
          franchise1TotalPoints,
          franchise2TotalPoints
        }
      };

    // Also update the pool-specific results
    const newResultsByPool = {
        ...parsedResultsByPool,
        [poolType]: {
          ...parsedResultsByPool[poolType],
          [matchId]: {
            winner,
            isTie,
            franchise1EventsWon,
            franchise2EventsWon,
            franchise1TotalPoints,
            franchise2TotalPoints
          }
        }
      };
    
    // Save merged results to localStorage immediately
    localStorage.setItem(`declaredResults_${tournamentId}`, JSON.stringify(newResults));
localStorage.setItem(`declaredResultsByPool_${tournamentId}`, JSON.stringify(newResultsByPool));


// Update state with merged results
setDeclaredResults(newResults);
setDeclaredResultsByPool(newResultsByPool);
    // After saving to localStorage and updating declaredResults
  setDeclaredMatchIds(prev => {
    if (!prev.includes(matchId)) {
      return [...prev, matchId];
    }
    return prev;
  });
    
    toast.success('Result declared successfully!');
  };

  const handlePoolChange = (newPool) => {
    // Save any pending changes to localStorage first
    saveFixturesToLocalStorage(false);
      
    // Add a small delay before changing the pool
    setTimeout(() => {
      // Load the latest declared results from localStorage before changing the pool
      const savedDeclaredResults = localStorage.getItem(`declaredResults_${tournamentId}`);
      if (savedDeclaredResults) {
        try {
          const parsedResults = JSON.parse(savedDeclaredResults);          
          // Set the declared results state
          setDeclaredResults(parsedResults);
          
          // Use a separate setTimeout with a longer delay to ensure declaredResults is updated
          // before changing the pool
          setTimeout(() => {
            setSelectedPool(newPool);
            // Force a re-render after the pool change
            setTimeout(() => {
              setForceUpdate(prev => prev + 1);
            }, 100);
          }, 100);
        } catch (error) {
          console.error('Error parsing saved results during pool change:', error);
          setSelectedPool(newPool); // Still change the pool even if there's an error
        }
      } else {
        setSelectedPool(newPool); // No saved results, just change the pool
      }
    }, 200);
  };
  
// Modify the handleSaveScore function
const handleSaveScore = (scoreData, showToast = false) => {
    if (!selectedMatchForScoring) return;
    
    setFixtures(prevFixtures => {
      const updatedFixtures = { ...prevFixtures };
      let targetPool;
      
      if (selectedMatchForScoring.poolType === 'knockout') {
        targetPool = 'knockout';
      } else if (selectedMatchForScoring.poolType === 'A') {
        targetPool = 'poolA';
      } else if (selectedMatchForScoring.poolType === 'B') {
        targetPool = 'poolB';
      }
      
      updatedFixtures[targetPool] = updatedFixtures[targetPool].map(match => {
        if (match.id === selectedMatchForScoring.matchId) {
          const updatedEventMatches = match.eventMatches.map(eventMatch => {
            if (eventMatch.eventId === selectedMatchForScoring.eventId) {
              return { 
                ...eventMatch, 
                score: scoreData.score,
                completed: scoreData.completed,
                winner: scoreData.winner
              };
            }
            return eventMatch;
          });
          
          return { ...match, eventMatches: updatedEventMatches };
        }
        return match;
      });
      
      // Save to localStorage without showing toast during auto-save
      setTimeout(() => saveFixturesToLocalStorage(showToast), 0);
      
      return updatedFixtures;
    });
    
    // If we're scoring a semi-final match, update the final
    if (selectedMatchForScoring.poolType === 'knockout' && 
        (selectedMatchForScoring.matchId === 'sf-1' || selectedMatchForScoring.matchId === 'sf-2')) {
      // Use setTimeout to ensure the fixtures state is updated first
      setTimeout(() => updateFinalWithSemiFinalists(), 100);
    }
  };

// Add this function to calculate pool standings
const calculatePoolStandings = (poolFixtures) => {
    // Create a map to track franchise performance
    const franchiseStats = {};
    
    // Process all matches in the pool
    poolFixtures.forEach(match => {
      const franchise1Id = match.franchise1._id;
      const franchise2Id = match.franchise2._id;
      
      // Initialize franchise stats if not already done
      if (!franchiseStats[franchise1Id]) {
        franchiseStats[franchise1Id] = {
          franchise: match.franchise1,
          matchesPlayed: 0,
          matchesWon: 0,
          eventsWon: 0,
          totalPoints: 0
        };
      }
      
      if (!franchiseStats[franchise2Id]) {
        franchiseStats[franchise2Id] = {
          franchise: match.franchise2,
          matchesPlayed: 0,
          matchesWon: 0,
          eventsWon: 0,
          totalPoints: 0
        };
      }
      
      // Count completed event matches
      let franchise1EventsWon = 0;
      let franchise2EventsWon = 0;
      
      match.eventMatches.forEach(eventMatch => {
        if (eventMatch.completed) {
          // Increment events won based on winner
          if (eventMatch.winner === 0) { // Team 1 won
            franchise1EventsWon++;
          } else if (eventMatch.winner === 1) { // Team 2 won
            franchise2EventsWon++;
          }
        }
      });
      
      // Only count this match if at least one event is completed
      if (franchise1EventsWon > 0 || franchise2EventsWon > 0) {
        // Update matches played
        franchiseStats[franchise1Id].matchesPlayed++;
        franchiseStats[franchise2Id].matchesPlayed++;
        
        // Update events won
        franchiseStats[franchise1Id].eventsWon += franchise1EventsWon;
        franchiseStats[franchise2Id].eventsWon += franchise2EventsWon;
        
        // Determine match winner (franchise with more events won)
        if (franchise1EventsWon > franchise2EventsWon) {
          franchiseStats[franchise1Id].matchesWon++;
          franchiseStats[franchise1Id].totalPoints += 2; // 2 points for winning a match
        } else if (franchise2EventsWon > franchise1EventsWon) {
          franchiseStats[franchise2Id].matchesWon++;
          franchiseStats[franchise2Id].totalPoints += 2; // 2 points for winning a match
        } else if (franchise1EventsWon === franchise2EventsWon && franchise1EventsWon > 0) {
          // It's a tie and at least one event was played
          franchiseStats[franchise1Id].totalPoints += 1; // 1 point each for a tie
          franchiseStats[franchise2Id].totalPoints += 1;
        }
      }
    });
    
    // Convert to array and sort by: total points (desc), matches won (desc), events won (desc)
    const standingsArray = Object.values(franchiseStats);
    standingsArray.sort((a, b) => {
      if (a.totalPoints !== b.totalPoints) return b.totalPoints - a.totalPoints;
      if (a.matchesWon !== b.matchesWon) return b.matchesWon - a.matchesWon;
      return b.eventsWon - a.eventsWon;
    });
    
    return standingsArray;
  };
  
// Modify the updateKnockoutFixtures function to ensure data persistence
const updateKnockoutFixtures = () => {
    // Calculate standings for both pools
    const poolAStandings = calculatePoolStandings(fixtures.poolA);
    const poolBStandings = calculatePoolStandings(fixtures.poolB);
    
    // Get winner and runner-up from each pool
    const poolAWinner = poolAStandings.length > 0 ? poolAStandings[0].franchise : null;
    const poolARunner = poolAStandings.length > 1 ? poolAStandings[1].franchise : null;
    const poolBWinner = poolBStandings.length > 0 ? poolBStandings[0].franchise : null;
    const poolBRunner = poolBStandings.length > 1 ? poolBStandings[1].franchise : null;
    
    // Update knockout fixtures
    setFixtures(prevFixtures => {
      const updatedFixtures = { ...prevFixtures };
      
      // Update semi-finals
      updatedFixtures.knockout = updatedFixtures.knockout.map(match => {
        if (match.id === 'sf-1') {
          // First semi-final: Pool A Winner vs Pool B Runner
          return {
            ...match,
            franchise1: poolAWinner || { franchiseName: 'Pool A Winner' },
            franchise2: poolBRunner || { franchiseName: 'Pool B Runner' },
            // Store the pool information for persistence
            poolData: {
              franchise1Source: 'poolAWinner',
              franchise2Source: 'poolBRunner'
            }
          };
        } else if (match.id === 'sf-2') {
          // Second semi-final: Pool B Winner vs Pool A Runner
          return {
            ...match,
            franchise1: poolBWinner || { franchiseName: 'Pool B Winner' },
            franchise2: poolARunner || { franchiseName: 'Pool A Runner' },
            // Store the pool information for persistence
            poolData: {
              franchise1Source: 'poolBWinner',
              franchise2Source: 'poolARunner'
            }
          };
        }
        return match;
      });
      
      return updatedFixtures;
    });
    
    // Save updated fixtures to localStorage
    setTimeout(() => saveFixturesToLocalStorage(), 0);
    
    toast.success('Knockout fixtures updated with pool winners!');
  };

// Add this function to update the final match with semi-final winners
const updateFinalWithSemiFinalists = () => {
    // Get the semi-final matches
    const sf1 = fixtures.knockout.find(match => match.id === 'sf-1');
    const sf2 = fixtures.knockout.find(match => match.id === 'sf-2');
    
    if (!sf1 || !sf2) return;
    
    // Determine winners of each semi-final
    let sf1Winner = null;
    let sf2Winner = null;
    
    // For each semi-final, count completed event matches and determine the winner
    if (sf1) {
      let franchise1EventsWon = 0;
      let franchise2EventsWon = 0;
      
      sf1.eventMatches.forEach(eventMatch => {
        if (eventMatch.completed) {
          if (eventMatch.winner === 0) { // Team 1 won
            franchise1EventsWon++;
          } else if (eventMatch.winner === 1) { // Team 2 won
            franchise2EventsWon++;
          }
        }
      });
      
      // Set the winner if there are completed matches
      if (franchise1EventsWon > 0 || franchise2EventsWon > 0) {
        sf1Winner = franchise1EventsWon > franchise2EventsWon ? sf1.franchise1 : sf1.franchise2;
      }
    }
    
    if (sf2) {
      let franchise1EventsWon = 0;
      let franchise2EventsWon = 0;
      
      sf2.eventMatches.forEach(eventMatch => {
        if (eventMatch.completed) {
          if (eventMatch.winner === 0) { // Team 1 won
            franchise1EventsWon++;
          } else if (eventMatch.winner === 1) { // Team 2 won
            franchise2EventsWon++;
          }
        }
      });
      
      // Set the winner if there are completed matches
      if (franchise1EventsWon > 0 || franchise2EventsWon > 0) {
        sf2Winner = franchise1EventsWon > franchise2EventsWon ? sf2.franchise1 : sf2.franchise2;
      }
    }
    
    // Update the final match with the semi-final winners
    setFixtures(prevFixtures => {
      const updatedFixtures = { ...prevFixtures };
      
      updatedFixtures.knockout = updatedFixtures.knockout.map(match => {
        if (match.id === 'final') {
          return {
            ...match,
            franchise1: sf1Winner || { franchiseName: 'Winner SF1' },
            franchise2: sf2Winner || { franchiseName: 'Winner SF2' },
            // Store the source information for persistence
            poolData: {
              franchise1Source: 'sf1Winner',
              franchise2Source: 'sf2Winner'
            }
          };
        }
        return match;
      });
      
      return updatedFixtures;
    });
    
    // Save updated fixtures to localStorage
    setTimeout(() => saveFixturesToLocalStorage(), 0);
    
    toast.success('Final updated with semi-final winners!');
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
        eventMatches: processEventMatches(events) // Changed to use processEventMatches
      },
      // Final
      {
        id: 'final',
        round: 'Final',
        franchise1: { franchiseName: 'Winner SF1' }, // Placeholder
        franchise2: { franchiseName: 'Winner SF2' }, // Placeholder
        date: new Date().toISOString().split('T')[0],
        time: '09:30 AM',
        court: 1,
        score: '0-0',
        eventMatches: processEventMatches(events) // Changed to use processEventMatches
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
      
      // Store existing fixtures to preserve scores
      const existingFixtures = {
        poolA: [...fixtures.poolA],
        poolB: [...fixtures.poolB],
        knockout: [...fixtures.knockout]
      };
      
      // Generate pool fixtures
      const poolAFixtures = generatePoolFixtures(pools.A);
      const poolBFixtures = generatePoolFixtures(pools.B);
      
      // For demonstration, use the first two franchises from each pool as winners
      const poolAWinners = [pools.A[0], pools.A[1]];
      const poolBWinners = [pools.B[0], pools.B[1]];
      
      // Generate knockout fixtures
      const knockoutFixtures = generateKnockoutFixtures(poolAWinners, poolBWinners);
      
      // Preserve scores from existing fixtures
      const preserveScores = (newFixtures, existingFixturesArray, poolType) => {
        return newFixtures.map(newMatch => {
          // Find matching match in existing fixtures
          const existingMatch = existingFixturesArray.find(m => m.id === newMatch.id);
          
          if (!existingMatch) return newMatch;
          
          // Copy over event matches with preserved scores
          const updatedEventMatches = newMatch.eventMatches.map(newEventMatch => {
            // Find matching event match in existing match
            const existingEventMatch = existingMatch.eventMatches.find(
              em => em.eventId === newEventMatch.eventId
            );
            
            if (existingEventMatch && existingEventMatch.completed) {
              // Preserve score, completion status, and winner
              return {
                ...newEventMatch,
                score: existingEventMatch.score,
                completed: existingEventMatch.completed,
                winner: existingEventMatch.winner,
                team1: existingEventMatch.team1,
                team2: existingEventMatch.team2
              };
            }
            
            return newEventMatch;
          });
          
          return { ...newMatch, eventMatches: updatedEventMatches };
        });
      };
      
      // Apply score preservation
      const updatedPoolAFixtures = preserveScores(poolAFixtures, existingFixtures.poolA, 'A');
      const updatedPoolBFixtures = preserveScores(poolBFixtures, existingFixtures.poolB, 'B');
      const updatedKnockoutFixtures = preserveScores(knockoutFixtures, existingFixtures.knockout, 'knockout');
      
      // Set fixtures with preserved scores
      setFixtures({
        poolA: updatedPoolAFixtures,
        poolB: updatedPoolBFixtures,
        knockout: updatedKnockoutFixtures
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
const saveFixturesToLocalStorage = (showToast = true) => {
    try {
      const fixturesData = {
        poolA: fixtures.poolA,
        poolB: fixtures.poolB,
        knockout: fixtures.knockout
      };
      localStorage.setItem(`fixtures_${tournamentId}`, JSON.stringify(fixturesData));
      
      // Save scoring formats
      localStorage.setItem(`scoringFormats_${tournamentId}`, JSON.stringify(scoringFormats));
      
      // Don't overwrite declared results here, as they're saved directly in handleDeclareResult
      // Instead, just read the current value to ensure we're not losing data
      const currentDeclaredResults = localStorage.getItem(`declaredResults_${tournamentId}`);
      if (!currentDeclaredResults) {
        // Only save if it doesn't exist yet
        localStorage.setItem(`declaredResults_${tournamentId}`, JSON.stringify(declaredResults));
      }
      
      if (showToast) {
        toast.success('Fixtures saved successfully!');
      }
    } catch (error) {
      console.error('Error saving fixtures to localStorage:', error);
      toast.error('Failed to save fixtures');
    }
  };

  // Add this useEffect after your other useEffect hooks
  useEffect(() => {
    // This will trigger a re-render when declaredResults changes
  }, [declaredResults]);

// Add this useEffect to handle pool switching
useEffect(() => {
    // When the selected pool changes, ensure we have the latest declared results
    const savedDeclaredResults = localStorage.getItem(`declaredResults_${tournamentId}`);
    const savedDeclaredResultsByPool = localStorage.getItem(`declaredResultsByPool_${tournamentId}`);
    
    if (savedDeclaredResults) {
      const parsedResults = JSON.parse(savedDeclaredResults);
      setDeclaredResults(parsedResults);
    }
    
    if (savedDeclaredResultsByPool) {
      const parsedResultsByPool = JSON.parse(savedDeclaredResultsByPool);
      setDeclaredResultsByPool(parsedResultsByPool);
    }
  }, [selectedPool, tournamentId]);

// Modify the loadFixturesFromLocalStorage function
const loadFixturesFromLocalStorage = () => {
    try {
      const savedFixtures = localStorage.getItem(`fixtures_${tournamentId}`);
      const savedScoringFormats = localStorage.getItem(`scoringFormats_${tournamentId}`);
      const savedDeclaredResults = localStorage.getItem(`declaredResults_${tournamentId}`);
      
      if (savedScoringFormats) {
        setScoringFormats(JSON.parse(savedScoringFormats));
      }

      if (savedDeclaredResults) {
        // Parse the saved results and ensure it's properly formatted
        const parsedResults = JSON.parse(savedDeclaredResults);
        setDeclaredResults(parsedResults);
      }
      
      if (savedFixtures) {
        const parsedFixtures = JSON.parse(savedFixtures);
        
        // If knockout fixtures exist and have poolData, restore the actual franchises
        if (parsedFixtures.knockout && parsedFixtures.knockout.length > 0) {
          // First, calculate pool standings
          const poolAStandings = calculatePoolStandings(parsedFixtures.poolA);
          const poolBStandings = calculatePoolStandings(parsedFixtures.poolB);
          
          // Get winner and runner-up from each pool
          const poolAWinner = poolAStandings.length > 0 ? poolAStandings[0].franchise : null;
          const poolARunner = poolAStandings.length > 1 ? poolAStandings[1].franchise : null;
          const poolBWinner = poolBStandings.length > 0 ? poolBStandings[0].franchise : null;
          const poolBRunner = poolBStandings.length > 1 ? poolBStandings[1].franchise : null;
          
          // Get semi-final matches
          const sf1 = parsedFixtures.knockout.find(match => match.id === 'sf-1');
          const sf2 = parsedFixtures.knockout.find(match => match.id === 'sf-2');
          
          // Determine semi-final winners
          let sf1Winner = null;
          let sf2Winner = null;
          
          if (sf1) {
            let franchise1EventsWon = 0;
            let franchise2EventsWon = 0;
            
            sf1.eventMatches.forEach(eventMatch => {
              if (eventMatch.completed) {
                if (eventMatch.winner === 0) { // Team 1 won
                  franchise1EventsWon++;
                } else if (eventMatch.winner === 1) { // Team 2 won
                  franchise2EventsWon++;
                }
              }
            });
            
            if (franchise1EventsWon > 0 || franchise2EventsWon > 0) {
              sf1Winner = franchise1EventsWon > franchise2EventsWon ? sf1.franchise1 : sf1.franchise2;
            }
          }
          
          if (sf2) {
            let franchise1EventsWon = 0;
            let franchise2EventsWon = 0;
            
            sf2.eventMatches.forEach(eventMatch => {
              if (eventMatch.completed) {
                if (eventMatch.winner === 0) { // Team 1 won
                  franchise1EventsWon++;
                } else if (eventMatch.winner === 1) { // Team 2 won
                  franchise2EventsWon++;
                }
              }
            });
            
            if (franchise1EventsWon > 0 || franchise2EventsWon > 0) {
              sf2Winner = franchise1EventsWon > franchise2EventsWon ? sf2.franchise1 : sf2.franchise2;
            }
          }
          
          // Update knockout fixtures with actual franchises
          parsedFixtures.knockout = parsedFixtures.knockout.map(match => {
            if (match.poolData) {
              const updatedMatch = { ...match };
              
              // Restore franchise1 based on poolData
              if (match.poolData.franchise1Source === 'poolAWinner' && poolAWinner) {
                updatedMatch.franchise1 = poolAWinner;
              } else if (match.poolData.franchise1Source === 'poolBWinner' && poolBWinner) {
                updatedMatch.franchise1 = poolBWinner;
              } else if (match.poolData.franchise1Source === 'sf1Winner' && sf1Winner) {
                updatedMatch.franchise1 = sf1Winner;
              }
              
              // Restore franchise2 based on poolData
              if (match.poolData.franchise2Source === 'poolARunner' && poolARunner) {
                updatedMatch.franchise2 = poolARunner;
              } else if (match.poolData.franchise2Source === 'poolBRunner' && poolBRunner) {
                updatedMatch.franchise2 = poolBRunner;
              } else if (match.poolData.franchise2Source === 'sf2Winner' && sf2Winner) {
                updatedMatch.franchise2 = sf2Winner;
              }
              
              return updatedMatch;
            }
            return match;
          });
        }
        
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
  onChange={(e) => handlePoolChange(e.target.value)}
  className="bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-red-500"
>
  <option value="A">Pool A</option>
  <option value="B">Pool B</option>
  <option value="knockout">Knockout Stage</option>
</select>
        </div>
        {/* Scoring Format Dropdown */}
<div className="flex items-center">
  <label htmlFor="scoringFormatSelect" className="mr-2 text-white">Scoring Format:</label>
  <select
    id="scoringFormatSelect"
    value={scoringFormats[selectedPool]}
    onChange={(e) => setScoringFormats(prev => ({
      ...prev,
      [selectedPool]: e.target.value
    }))}
    className="bg-gray-700 text-white border border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-red-500"
  >
    <option value="15-3">15 points - 3 sets</option>
    <option value="21-3">21 points - 3 sets</option>
    <option value="21-1">21 points - single set</option>
    <option value="30-1">30 points - single set</option>
  </select>
</div>
              {/* Add Update Knockout button */}
{selectedPool === 'knockout' && (
  <button
    onClick={updateKnockoutFixtures}
    className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors ml-3"
  >
    Update With Pool Winners
  </button>
)}
      </div>
    </div>
              
              <div className="space-y-4">
              {selectedPool === 'A' && fixtures.poolA.map(match => (
  <div key={`${selectedPool}-${match.id}`} className="bg-gray-700 rounded-md overflow-hidden">
    <div className="p-3 bg-gray-600 flex justify-between items-center">
      <div>
      <span className="text-white font-medium">
  {match.franchise1.franchiseName}
  {declaredResultsByPool[selectedPool][match.id]?.winner === match.franchise1._id && (
    <span className="ml-1 text-yellow-400" title="Winner">🏆</span>
  )}
  {declaredResultsByPool[selectedPool][match.id]?.isTie && (
    <span className="ml-1 text-blue-400" title="Tie">🤝</span>
  )}
</span>
<span className="text-gray-300 mx-2">vs</span>
<span className="text-white font-medium">
  {match.franchise2.franchiseName}
  {declaredResultsByPool[selectedPool][match.id]?.winner === match.franchise2._id && (
    <span className="ml-1 text-yellow-400" title="Winner">🏆</span>
  )}
  {declaredResultsByPool[selectedPool][match.id]?.isTie && (
    <span className="ml-1 text-blue-400" title="Tie">🤝</span>
  )}
</span>
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
          onClick={() => handleDeclareResult(match.id, 'A')}
          className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded transition-colors"
        >
          Declare Result
        </button>
        
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
                              
                              <div className="mt-2">
  <div className="flex justify-between items-center">
    <span className="text-white text-sm">
      {eventMatch.team1 ? getTeamName(eventMatch.team1, eventMatch) : 'Not assigned'} vs {eventMatch.team2 ? getTeamName(eventMatch.team2, eventMatch) : 'Not assigned'}
    </span>
    {eventMatch.team1 && eventMatch.team2 && (
      <button
        onClick={() => handleOpenScoreModal(match, eventMatch)}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors"
      >
        {eventMatch.completed ? 'Re-Score' : 'Score'}
      </button>
    )}
  </div>
  {eventMatch.completed && (
    <div className="mt-1 text-xs text-green-400 text-center">
      Score: {eventMatch.score} | Winner: {eventMatch.winner === 0 ? getTeamName(eventMatch.team1, eventMatch) : getTeamName(eventMatch.team2, eventMatch)}
    </div>
  )}
</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {selectedPool === 'B' && fixtures.poolB.map(match => (
  <div key={`${selectedPool}-${match.id}`} className="bg-gray-700 rounded-md overflow-hidden">
    <div className="p-3 bg-gray-600 flex justify-between items-center">
      <div>
      <span className="text-white font-medium">
  {match.franchise1.franchiseName}
  {declaredResultsByPool[selectedPool][match.id]?.winner === match.franchise1._id && (
    <span className="ml-1 text-yellow-400" title="Winner">🏆</span>
  )}
  {declaredResultsByPool[selectedPool][match.id]?.isTie && (
    <span className="ml-1 text-blue-400" title="Tie">🤝</span>
  )}
</span>
<span className="text-gray-300 mx-2">vs</span>
<span className="text-white font-medium">
  {match.franchise2.franchiseName}
  {declaredResultsByPool[selectedPool][match.id]?.winner === match.franchise2._id && (
    <span className="ml-1 text-yellow-400" title="Winner">🏆</span>
  )}
  {declaredResultsByPool[selectedPool][match.id]?.isTie && (
    <span className="ml-1 text-blue-400" title="Tie">🤝</span>
  )}
</span>
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
          onClick={() => handleDeclareResult(match.id, 'B')}
          className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded transition-colors"
        >
          Declare Result
        </button>
        
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
                              
                              <div className="mt-2">
  <div className="flex justify-between items-center">
    <span className="text-white text-sm">
      {eventMatch.team1 ? getTeamName(eventMatch.team1, eventMatch) : 'Not assigned'} vs {eventMatch.team2 ? getTeamName(eventMatch.team2, eventMatch) : 'Not assigned'}
    </span>
    {eventMatch.team1 && eventMatch.team2 && (
      <button
        onClick={() => handleOpenScoreModal(match, eventMatch)}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors"
      >
        {eventMatch.completed ? 'Re-Score' : 'Score'}
      </button>
    )}
  </div>
  {eventMatch.completed && (
    <div className="mt-1 text-xs text-green-400 text-center">
      Score: {eventMatch.score} | Winner: {eventMatch.winner === 0 ? getTeamName(eventMatch.team1, eventMatch) : getTeamName(eventMatch.team2, eventMatch)}
    </div>
  )}
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
        <span className="text-white font-medium">
  {match.franchise1.franchiseName}
  {declaredResultsByPool[selectedPool][match.id]?.winner === match.franchise1._id && (
    <span className="ml-1 text-yellow-400" title="Winner">🏆</span>
  )}
  {declaredResultsByPool[selectedPool][match.id]?.isTie && (
    <span className="ml-1 text-blue-400" title="Tie">🤝</span>
  )}
</span>
<span className="text-gray-300 mx-2">vs</span>
<span className="text-white font-medium">
  {match.franchise2.franchiseName}
  {declaredResultsByPool[selectedPool][match.id]?.winner === match.franchise2._id && (
    <span className="ml-1 text-yellow-400" title="Winner">🏆</span>
  )}
  {declaredResultsByPool[selectedPool][match.id]?.isTie && (
    <span className="ml-1 text-blue-400" title="Tie">🤝</span>
  )}
</span>
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
          onClick={() => handleDeclareResult(match.id, 'knockout')}
          className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded transition-colors"
        >
          Declare Result
        </button>
        
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
                              
                              <div className="mt-2">
  <div className="flex justify-between items-center">
    <span className="text-white text-sm">
      {eventMatch.team1 ? getTeamName(eventMatch.team1, eventMatch) : 'Not assigned'} vs {eventMatch.team2 ? getTeamName(eventMatch.team2, eventMatch) : 'Not assigned'}
    </span>
    {eventMatch.team1 && eventMatch.team2 && (
      <button
        onClick={() => handleOpenScoreModal(match, eventMatch)}
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors"
      >
        {eventMatch.completed ? 'Re-Score' : 'Score'}
      </button>
    )}
  </div>
  {eventMatch.completed && (
    <div className="mt-1 text-xs text-green-400 text-center">
      Score: {eventMatch.score} | Winner: {eventMatch.winner === 0 ? getTeamName(eventMatch.team1, eventMatch) : getTeamName(eventMatch.team2, eventMatch)}
    </div>
  )}
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
      {/* Score Modal */}
      {showScoreModal && selectedMatchForScoring && (
        <ScoreModal
          match={selectedMatchForScoring}
          onClose={() => setShowScoreModal(false)}
          onSave={handleSaveScore}
        />
      )}
    </div>
  );
};

export default FranchiseFixturesView;