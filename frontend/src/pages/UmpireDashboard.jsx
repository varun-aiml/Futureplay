import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext';
import { getUmpireAssignedMatches } from '../services/tournamentService';

const UmpireDashboard = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const [assignedMatches, setAssignedMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'active', 'completed'

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const res = await getUmpireAssignedMatches();
      if (res.data?.success) {
        setAssignedMatches(res.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching assigned matches:', error);
      toast.error('Failed to load your assigned matches');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/umpire/login');
  };

  const filteredMatches = assignedMatches.filter(item => {
    const status = item.match?.status;
    if (filter === 'pending') return status === 'Pending' || status === 'Scheduled';
    if (filter === 'active') return status === 'In Progress';
    if (filter === 'completed') return status === 'Completed' || status === 'Walkover';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Progress':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">● Live In Progress</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">✓ Completed</span>;
      case 'Walkover':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Walkover</span>;
      case 'Scheduled':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Scheduled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-700/60 text-gray-300 border border-gray-600">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20 selection:bg-emerald-500 selection:text-black">
      {/* Mobile-Friendly Header */}
      <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 py-3.5 shadow-md">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-gray-950 shadow-md">
              🏸
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Court-Side Umpire</p>
              <h1 className="text-base sm:text-lg font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                {user?.name || 'Official'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchMatches}
              disabled={isLoading}
              title="Refresh matches"
              className="p-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 text-xs font-semibold transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 pt-4">
        {/* Quick Filter Bar */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/20 font-bold'
                : 'bg-gray-800/80 text-gray-400 hover:bg-gray-800'
            }`}
          >
            All ({assignedMatches.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === 'active'
                ? 'bg-amber-500 text-gray-950 shadow-md shadow-amber-500/20 font-bold'
                : 'bg-gray-800/80 text-gray-400 hover:bg-gray-800'
            }`}
          >
            In Progress ({assignedMatches.filter(m => m.match?.status === 'In Progress').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === 'pending'
                ? 'bg-blue-500 text-gray-950 shadow-md shadow-blue-500/20 font-bold'
                : 'bg-gray-800/80 text-gray-400 hover:bg-gray-800'
            }`}
          >
            Upcoming ({assignedMatches.filter(m => m.match?.status === 'Pending' || m.match?.status === 'Scheduled').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter === 'completed'
                ? 'bg-gray-200 text-gray-950 shadow-md font-bold'
                : 'bg-gray-800/80 text-gray-400 hover:bg-gray-800'
            }`}
          >
            Completed ({assignedMatches.filter(m => m.match?.status === 'Completed' || m.match?.status === 'Walkover').length})
          </button>
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-400 font-medium">Fetching assigned court matches...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-8 text-center my-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center text-3xl">
              📋
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Matches Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {filter !== 'all'
                ? `There are no matches under the "${filter}" filter.`
                : 'You have no matches assigned to you yet. When the organizer assigns you to a court match, it will appear here.'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-emerald-400 text-xs font-bold rounded-xl"
              >
                Show All Matches
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((item) => {
              const match = item.match;
              const isCompleted = match.status === 'Completed' || match.status === 'Walkover';
              const isInProgress = match.status === 'In Progress';

              return (
                <div
                  key={match._id}
                  className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 sm:p-5 shadow-lg hover:border-gray-700 transition-all"
                >
                  {/* Card Header: Tournament & Event */}
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block truncate max-w-[200px] sm:max-w-xs">
                        {item.tournamentTitle}
                      </span>
                      <p className="text-sm font-semibold text-white">
                        {item.eventName} <span className="text-xs text-gray-400 font-normal">({item.eventType || 'Singles'})</span>
                      </p>
                    </div>
                    <div>
                      {getStatusBadge(match.status)}
                    </div>
                  </div>

                  {/* Round & Match Details Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-300 font-semibold border border-gray-700">
                      {match.round} • Match #{match.matchNumber}
                    </span>
                    {match.court && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-800/50 flex items-center">
                        🏸 Court {match.court}
                      </span>
                    )}
                    {match.scheduledTime && (
                      <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-400 border border-gray-700">
                        🕒 {new Date(match.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {/* Large Matchup Display */}
                  <div className="bg-gray-950/70 border border-gray-800/80 rounded-xl p-3.5 mb-4">
                    <div className="flex items-center justify-between gap-3">
                      {/* Player 1 */}
                      <div className="flex-1 text-left">
                        <p className={`text-base sm:text-lg font-bold truncate ${
                          match.winner && match.winner === match.player1?.name ? 'text-emerald-400' : 'text-white'
                        }`}>
                          {match.player1?.name || match.team1 || 'TBD'}
                        </p>
                        {match.winner && match.winner === match.player1?.name && (
                          <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">🏆 Winner</span>
                        )}
                      </div>

                      {/* VS / Score pill */}
                      <div className="flex flex-col items-center justify-center px-3">
                        {match.score ? (
                          <div className="px-2.5 py-1 rounded-lg bg-gray-800 text-emerald-400 font-mono font-bold text-xs sm:text-sm whitespace-nowrap">
                            {match.score}
                          </div>
                        ) : (
                          <span className="text-xs font-black text-gray-500 uppercase tracking-widest">VS</span>
                        )}
                      </div>

                      {/* Player 2 */}
                      <div className="flex-1 text-right">
                        <p className={`text-base sm:text-lg font-bold truncate ${
                          match.winner && match.winner === match.player2?.name ? 'text-emerald-400' : 'text-white'
                        }`}>
                          {match.player2?.name || match.team2 || 'TBD'}
                        </p>
                        {match.winner && match.winner === match.player2?.name && (
                          <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">🏆 Winner</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Large Touch Action Button */}
                  <button
                    onClick={() => navigate(`/umpire/match/${item.tournamentId}/${item.eventId}/${match._id}`)}
                    className={`w-full py-3.5 px-4 rounded-xl text-sm sm:text-base font-extrabold shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] ${
                      isCompleted
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'
                        : isInProgress
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-gray-950'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-gray-950 shadow-emerald-500/20'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <span>✓ Review Official Result</span>
                      </>
                    ) : isInProgress ? (
                      <>
                        <span className="animate-bounce">⚡</span>
                        <span>Resume Scoring Match</span>
                      </>
                    ) : (
                      <>
                        <span>🏸 Start Scoring Match</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default UmpireDashboard;
