import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlayerLayout from '../components/PlayerLayout';
import { getAllTournaments } from '../services/tournamentService';
import { format } from 'date-fns';

const PlayerTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // 'latest' or 'oldest'
  const [filterBy, setFilterBy] = useState('upcoming'); // 'upcoming', 'completed', or 'all'

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await getAllTournaments();
        setTournaments(response.data.data);
        setIsLoading(false);
      } catch (error) {
        setError('Failed to fetch tournaments');
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

  // Sort tournaments based on sort option
  const getSortedTournaments = () => {
    const filtered = getFilteredTournaments();
    
    return filtered.sort((a, b) => {
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
      return dateString;
    }
  };

  const displayTournaments = getSortedTournaments();

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
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : displayTournaments.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-400">No tournaments found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayTournaments.map((tournament) => (
              <div key={tournament._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 p-4">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
                    <div className="flex items-center text-gray-400 mb-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
                    </div>
                    <div className="flex items-center text-gray-400 mb-3">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm">{tournament.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 md:flex-col md:items-end md:justify-between">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tournament.status === 'Active' ? 'bg-green-900 text-green-300' : tournament.status === 'Upcoming' ? 'bg-blue-900 text-blue-300' : 'bg-gray-700 text-gray-300'}`}>
                      {tournament.status}
                    </span>
                    <Link
                      to={`/tournaments/${tournament._id}`}
                      className="text-red-500 hover:text-red-400 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PlayerLayout>
  );
};

export default PlayerTournaments;