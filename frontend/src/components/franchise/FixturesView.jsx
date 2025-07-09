import { useState, useEffect } from 'react';
import { useFranchise } from '../../context/franchiseContext';
import { getTournamentById } from '../../services/tournamentService';
import { getTournamentBookings } from '../../services/bookingService';
import { toast } from 'react-toastify';

const FixturesView = () => {
  const { franchise } = useFranchise();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [tournamentName, setTournamentName] = useState('');
  const [fixtures, setFixtures] = useState({ poolA: [], poolB: [], knockout: [] });
  const [selectedPool, setSelectedPool] = useState('A');
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  // Fetch tournament data and fixtures
  useEffect(() => {
    const fetchTournamentAndFixtures = async () => {
      if (!franchise || !franchise.tournament) {
        setError('No tournament assigned to this franchise');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get tournament details
        const tournamentResponse = await getTournamentById(franchise.tournament);
        const tournamentData = tournamentResponse.data.data;
        
        if (!tournamentData) {
          throw new Error('Tournament data not found');
        }
        
        setTournamentName(tournamentData.name);
        setEvents(tournamentData.events || []);
        
        // Get tournament bookings to access team data
        const bookingsResponse = await getTournamentBookings(franchise.tournament);
        if (bookingsResponse.data && bookingsResponse.data.data) {
          setBookings(bookingsResponse.data.data);
        }
        
        // Load fixtures from localStorage
        loadFixturesFromLocalStorage(franchise.tournament);
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load fixtures. Please try again later.');
        setIsLoading(false);
        console.error('Error fetching data:', err);
      }
    };
    
    fetchTournamentAndFixtures();
  }, [franchise]);
  
  // Load fixtures from localStorage
  const loadFixturesFromLocalStorage = (tournamentId) => {
    try {
      const savedFixtures = localStorage.getItem(`fixtures_${tournamentId}`);
      if (savedFixtures) {
        const parsedFixtures = JSON.parse(savedFixtures);
        setFixtures(parsedFixtures);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading fixtures from localStorage:', error);
      return false;
    }
  };
  
  // Get event name by ID
  const getEventName = (eventId) => {
    const event = events.find(e => e._id === eventId);
    return event ? event.name : 'Unknown Event';
  };
  
  // Toggle expanded match view
  const toggleExpandMatch = (matchId) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId);
  };

// Get team name by ID
const getTeamName = (teamId, eventMatch) => {
    if (!teamId) return 'Not assigned';
    
    // Find the team in bookings
    const team = bookings.find(booking => booking._id === teamId);
    if (!team) return 'Unknown Team';
    
    // Check if this is a doubles event
    const isDoublesEvent = (eventId) => {
      const event = events.find(e => e._id === eventId);
      return event && event.name.toLowerCase().includes('doubles');
    };
    
    // Check if this is a 30+/35+ men's event
    const is30Or35MensEvent = (eventId) => {
        const event = events.find(e => e._id === eventId);
        return event && 
               event.name.toLowerCase().includes('30+') && 
               event.name.toLowerCase().includes('35+');
      }
    
    // Check if this is a 40+ men's event
    const is40MensEvent = (eventId) => {
      const event = events.find(e => e._id === eventId);
      return event && event.name.toLowerCase().includes('40+');
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
  
  return (
    <div className="mb-6">
      {/* Tournament information */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white mb-2">
          Tournament: {tournamentName || 'Loading...'}
        </h3>
        <p className="text-sm text-gray-400">
          Viewing fixtures for this tournament
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 rounded-md">
          {error}
        </div>
      ) : (
        <div>
          {/* Fixtures Display Section */}
          <div className="bg-gray-800 p-4 rounded-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Fixtures</h3>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedPool('A')}
                  className={`px-3 py-1 rounded-md ${selectedPool === 'A' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  Pool A
                </button>
                <button
                  onClick={() => setSelectedPool('B')}
                  className={`px-3 py-1 rounded-md ${selectedPool === 'B' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  Pool B
                </button>
                <button
                  onClick={() => setSelectedPool('knockout')}
                  className={`px-3 py-1 rounded-md ${selectedPool === 'knockout' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  Knockout
                </button>
              </div>
            </div>
            
            {/* Display fixtures based on selected pool */}
            <div className="space-y-4">
              {selectedPool === 'A' && fixtures.poolA.length === 0 && (
                <p className="text-gray-400 text-center py-4">No fixtures available for Pool A</p>
              )}
              
              {selectedPool === 'B' && fixtures.poolB.length === 0 && (
                <p className="text-gray-400 text-center py-4">No fixtures available for Pool B</p>
              )}
              
              {selectedPool === 'knockout' && fixtures.knockout.length === 0 && (
                <p className="text-gray-400 text-center py-4">No fixtures available for Knockout stage</p>
              )}
              
              {/* Pool A Fixtures */}
              {selectedPool === 'A' && fixtures.poolA.map(match => (
                <div key={match.id} className="bg-gray-700 rounded-md overflow-hidden mb-4">
                  <div className="p-3 bg-gray-600 flex justify-between items-center">
                    <div className="text-white">
                      <span className="font-medium">{match.franchise1.franchiseName}</span>
                      <span className="mx-2">vs</span>
                      <span className="font-medium">{match.franchise2.franchiseName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-gray-300 text-sm">
                        <span className="mr-1">Court:</span>
                        <span className="font-medium">{match.court || 'TBD'}</span>
                      </div>
                      
                      <button
                        onClick={() => toggleExpandMatch(match.id)}
                        className="text-gray-300 hover:text-white"
                      >
                        {expandedMatch === match.id ? (
                          <span className="text-sm">Hide Details</span>
                        ) : (
                          <span className="text-sm">Show Details</span>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded match details */}
                  {expandedMatch === match.id && (
                    <div className="p-4 space-y-4">
                      <h4 className="text-white font-medium">Event Matches</h4>
                      
                      {match.eventMatches.map((eventMatch, index) => (
                        <div key={index} className="bg-gray-800 p-3 rounded-md">
                          <div className="text-white font-medium mb-2">
                            {eventMatch.eventName || getEventName(eventMatch.eventId)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-gray-300">
                              <p className="text-sm mb-1">{match.franchise1.franchiseName} Team:</p>
                              <p className="bg-gray-700 p-2 rounded text-white">
                                {eventMatch.team1 ? getTeamName(eventMatch.team1, eventMatch) : 'Not assigned'}
                              </p>
                            </div>
                            
                            <div className="text-gray-300">
                              <p className="text-sm mb-1">{match.franchise2.franchiseName} Team:</p>
                              <p className="bg-gray-700 p-2 rounded text-white">
                                {eventMatch.team2 ? getTeamName(eventMatch.team2, eventMatch) : 'Not assigned'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Pool B Fixtures */}
              {selectedPool === 'B' && fixtures.poolB.map(match => (
                <div key={match.id} className="bg-gray-700 rounded-md overflow-hidden mb-4">
                  <div className="p-3 bg-gray-600 flex justify-between items-center">
                    <div className="text-white">
                      <span className="font-medium">{match.franchise1.franchiseName}</span>
                      <span className="mx-2">vs</span>
                      <span className="font-medium">{match.franchise2.franchiseName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-gray-300 text-sm">
                        <span className="mr-1">Court:</span>
                        <span className="font-medium">{match.court || 'TBD'}</span>
                      </div>
                      
                      <button
                        onClick={() => toggleExpandMatch(match.id)}
                        className="text-gray-300 hover:text-white"
                      >
                        {expandedMatch === match.id ? (
                          <span className="text-sm">Hide Details</span>
                        ) : (
                          <span className="text-sm">Show Details</span>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded match details */}
                  {expandedMatch === match.id && (
                    <div className="p-4 space-y-4">
                      <h4 className="text-white font-medium">Event Matches</h4>
                      
                      {match.eventMatches.map((eventMatch, index) => (
                        <div key={index} className="bg-gray-800 p-3 rounded-md">
                          <div className="text-white font-medium mb-2">
                            {eventMatch.eventName || getEventName(eventMatch.eventId)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-gray-300">
                              <p className="text-sm mb-1">{match.franchise1.franchiseName} Team:</p>
                              <p className="bg-gray-700 p-2 rounded text-white">
                                {eventMatch.team1 ? getTeamName(eventMatch.team1, eventMatch) : 'Not assigned'}
                              </p>
                            </div>
                            
                            <div className="text-gray-300">
                              <p className="text-sm mb-1">{match.franchise2.franchiseName} Team:</p>
                              <p className="bg-gray-700 p-2 rounded text-white">
                                {eventMatch.team2 ? getTeamName(eventMatch.team2, eventMatch) : 'Not assigned'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Knockout Fixtures */}
              {selectedPool === 'knockout' && fixtures.knockout.map(match => (
                <div key={match.id} className="bg-gray-700 rounded-md overflow-hidden mb-4">
                  <div className="p-3 bg-gray-600 flex justify-between items-center">
                    <div className="text-white">
                      <span className="font-medium">{match.franchise1.franchiseName}</span>
                      <span className="mx-2">vs</span>
                      <span className="font-medium">{match.franchise2.franchiseName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-gray-300 text-sm">
                        <span className="mr-1">Court:</span>
                        <span className="font-medium">{match.court || 'TBD'}</span>
                      </div>
                      
                      <button
                        onClick={() => toggleExpandMatch(match.id)}
                        className="text-gray-300 hover:text-white"
                      >
                        {expandedMatch === match.id ? (
                          <span className="text-sm">Hide Details</span>
                        ) : (
                          <span className="text-sm">Show Details</span>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Expanded match details */}
                  {expandedMatch === match.id && (
                    <div className="p-4 space-y-4">
                      <h4 className="text-white font-medium">Event Matches</h4>
                      
                      {match.eventMatches.map((eventMatch, index) => (
                        <div key={index} className="bg-gray-800 p-3 rounded-md">
                          <div className="text-white font-medium mb-2">
                            {eventMatch.eventName || getEventName(eventMatch.eventId)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-gray-300">
                              <p className="text-sm mb-1">{match.franchise1.franchiseName} Team:</p>
                              <p className="bg-gray-700 p-2 rounded text-white">
                                {eventMatch.team1 ? getTeamName(eventMatch.team1, eventMatch) : 'Not assigned'}
                              </p>
                            </div>
                            
                            <div className="text-gray-300">
                              <p className="text-sm mb-1">{match.franchise2.franchiseName} Team:</p>
                              <p className="bg-gray-700 p-2 rounded text-white">
                                {eventMatch.team2 ? getTeamName(eventMatch.team2, eventMatch) : 'Not assigned'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixturesView;