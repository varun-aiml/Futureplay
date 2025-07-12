import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerLayout from '../components/PlayerLayout';
import { getAllTournaments } from '../services/tournamentService';
import { format } from 'date-fns';
import FranchiseFixturesView from '../components/tournament/FranchiseFixturesView';
import ResultsView from '../components/tournament/ResultsView';

const PlayerTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // 'latest' or 'oldest'
  const [filterBy, setFilterBy] = useState('upcoming'); // 'upcoming', 'completed', or 'all'
  const [showFixtures, setShowFixtures] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [selectedTournamentEvents, setSelectedTournamentEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await getAllTournaments();
        setTournaments(response.data.data);
        setIsLoading(false);
      } catch (error) {
        setError('Failed to fetch tournaments', error);
        setIsLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  // Handle sort change
  const handleSortChange = (option) => {
    setSortBy(option);
  };

  // Handle filter change
  const handleFilterChange = (option) => {
    setFilterBy(option);
  };

  // Filter tournaments based on filter option
  const getFilteredTournaments = () => {
    return tournaments.filter(tournament => {
      if (filterBy === 'upcoming') {
        return tournament.status === 'Upcoming';
      } else if (filterBy === 'completed') {
        return tournament.status === 'Completed';
      } else if (filterBy === 'all') {
        return true;
      }
      return true;
    });
  };

  // Sort tournaments based on sort option and prioritize active tournaments when filter is 'all'
  const getSortedTournaments = () => {
    const filtered = getFilteredTournaments();
    
    // First sort by status if filter is 'all' to prioritize active tournaments
    if (filterBy === 'all') {
      filtered.sort((a, b) => {
        // Active tournaments come first
        if (a.status === 'Active' && b.status !== 'Active') return -1;
        if (a.status !== 'Active' && b.status === 'Active') return 1;
        return 0;
      });
    }
    
    // Then apply the date sorting
    return filtered.sort((a, b) => {
      // If we've already sorted by status and they're different statuses, maintain that order
      if (filterBy === 'all' && a.status !== b.status) return 0;
      
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      
      if (sortBy === 'latest') {
        return dateB - dateA; // Latest to oldest
      } else {
        return dateA - dateB; // Oldest to latest
      }
    });
  };

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    try {
      const date = new Date(dateString);
      return format(date, "MMMM d, yyyy");
    } catch (error) {
      console.log(error);
      return dateString;
    }
  };

  // Navigate to tournament details page
  const handleTournamentClick = (tournamentId) => {
    navigate(`/tournament/${tournamentId}`);
  };

  // Get event short forms from tournament events
  const getEventShortForms = (events) => {
    if (!events || events.length === 0) return [];
    
    return events.map(event => {
      // Create short form based on event name and type
      let shortForm = '';
      
      // Extract first letters of significant words in the event name
      const words = event.name.split(' ');
      if (words.length > 1) {
        // For multi-word names like "Men's Singles", use first letters
        shortForm = words.map(word => word.charAt(0).toUpperCase()).join('');
      } else {
        // For single word names, use first 2-3 letters
        shortForm = event.name.substring(0, 2).toUpperCase();
      }
      
      // Add suffix based on event type
      if (event.eventType === 'Singles') shortForm += 'S';
      if (event.eventType === 'Doubles') shortForm += 'D';
      if (event.eventType === 'Team') shortForm += 'T';
      
      return {
        id: event._id,
        name: event.name,
        shortForm: shortForm,
        eventType: event.eventType,
        entryFee: event.entryFee,
        allowBooking: event.allowBooking
      };
    });
  };

  const displayTournaments = getSortedTournaments();

  // Handle View Fixtures button click
  const handleViewFixtures = (e, tournamentId, events) => {
    e.stopPropagation(); // Prevent navigation to tournament details
    setSelectedTournamentId(tournamentId);
    setSelectedTournamentEvents(events || []);
    setShowFixtures(true);
    setShowResults(false);
  };

  // Handle View Results button click
  const handleViewResults = (e, tournamentId, events) => {
    e.stopPropagation(); // Prevent navigation to tournament details
    setSelectedTournamentId(tournamentId);
    setSelectedTournamentEvents(events || []);
    setShowResults(true);
    setShowFixtures(false);
  };

  // Close fixtures or results view
  const handleCloseView = () => {
    setShowFixtures(false);
    setShowResults(false);
    setSelectedTournamentId(null);
  };

  return (
    <PlayerLayout 
      onSortChange={handleSortChange} 
      onFilterChange={handleFilterChange}
      sortBy={sortBy}
      filterBy={filterBy}
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Tournaments</h1>
          
          {/* Show back button when viewing fixtures or results */}
          {(showFixtures || showResults) && (
            <button
              onClick={handleCloseView}
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tournaments
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Show fixtures view */}
        {showFixtures && selectedTournamentId && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Tournament Fixtures</h2>
            <FranchiseFixturesView tournamentId={selectedTournamentId} events={selectedTournamentEvents} />
          </div>
        )}

        {/* Show results view */}
        {showResults && selectedTournamentId && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Tournament Results</h2>
            <ResultsView tournamentId={selectedTournamentId} events={selectedTournamentEvents} />
          </div>
        )}

        {/* Show tournament list when not viewing fixtures or results */}
        {!showFixtures && !showResults && (
          isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : displayTournaments.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-400">No tournaments found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {displayTournaments.map((tournament) => (
                <div 
                  key={tournament._id} 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-700 hover:border-red-500"
                  onClick={() => handleTournamentClick(tournament._id)}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Tournament poster/image with action buttons */}
                    <div className="md:w-1/4 h-48 md:h-auto bg-gray-700 relative overflow-hidden">
                      {tournament.posterUrl ? (
                        <img 
                          src={tournament.posterUrl} 
                          alt={tournament.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x200?text=Tournament';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-700">
                          <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Status badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          tournament.status === 'Active' ? 'bg-green-900 text-green-300' : 
                          tournament.status === 'Upcoming' ? 'bg-blue-900 text-blue-300' : 
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {tournament.status}
                        </span>
                      </div>
                      
                      {/* View Fixtures and View Results buttons */}
                      <div className="absolute bottom-0 left-0 right-0 flex flex-col p-2 bg-black bg-opacity-70">
                        <button
                          onClick={(e) => handleViewResults(e, tournament._id, tournament.events)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-1 px-2 rounded transition duration-300 w-full"
                        >
                          View Results
                        </button>
                        
                      </div>
                    </div>
                    
                    {/* Tournament details */}
                    <div className="p-5 md:w-3/4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center text-gray-400">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-400">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm">{tournament.location}</span>
                          </div>
                        </div>
                        
                        {tournament.description && (
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{tournament.description}</p>
                        )}
                      </div>
                      
                      {/* Event types */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {tournament.events && tournament.events.length > 0 ? (
                          getEventShortForms(tournament.events).map(event => (
                            <div key={event.id} className="group relative">
                              <div className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs font-medium">
                                {event.shortForm}
                              </div>
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 min-w-max">
                                <div className="font-semibold mb-1">{event.name}</div>
                                <div className="flex justify-between gap-4">
                                  <span>Type: {event.eventType}</span>
                                  <span>Fee: ₹{event.entryFee}</span>
                                </div>
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-xs">No events available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </PlayerLayout>
  );
};

export default PlayerTournaments;