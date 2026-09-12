import { useState, useEffect, useRef } from 'react';
import { getSocket, joinTournamentRoom, leaveTournamentRoom } from '../../services/socket';
import { getTournamentLiveMatches } from '../../services/tournamentService';

const LiveScoresSection = ({ tournamentId }) => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [completedRecentMatches, setCompletedRecentMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [highlightedMatchId, setHighlightedMatchId] = useState(null);
  const highlightTimeoutRef = useRef({});

  // Fetch initial live matches from MongoDB
  const fetchLiveMatches = async () => {
    try {
      if (!tournamentId) return;
      const res = await getTournamentLiveMatches(tournamentId);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setLiveMatches(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching live matches from backend:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!tournamentId) return;

    fetchLiveMatches();

    const socket = getSocket();

    // Check socket connection status
    if (socket.connected) {
      setIsConnected(true);
      joinTournamentRoom(tournamentId);
    }

    const onConnect = () => {
      setIsConnected(true);
      joinTournamentRoom(tournamentId);
      // Re-fetch latest persisted state from MongoDB on connection/reconnection
      fetchLiveMatches();
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Handle incoming live score update event
    const onScoreUpdate = (data) => {
      if (!data || !data.matchId) return;

      // Only process updates for this tournament
      if (data.tournamentId && data.tournamentId.toString() !== tournamentId.toString()) {
        return;
      }

      // Flash highlight animation for this match card
      setHighlightedMatchId(data.matchId);
      if (highlightTimeoutRef.current[data.matchId]) {
        clearTimeout(highlightTimeoutRef.current[data.matchId]);
      }
      highlightTimeoutRef.current[data.matchId] = setTimeout(() => {
        setHighlightedMatchId(prev => (prev === data.matchId ? null : prev));
      }, 1200);

      setLiveMatches(prevMatches => {
        const existingIndex = prevMatches.findIndex(m => m.matchId === data.matchId);

        if (existingIndex !== -1) {
          // Update the specific match independently without touching any other match
          const updated = [...prevMatches];
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...data
          };
          return updated;
        } else {
          // Newly commenced match: add to live matches list
          return [data, ...prevMatches];
        }
      });
    };

    // Handle official match completion event
    const onMatchCompleted = (data) => {
      if (!data || !data.matchId) return;

      if (data.tournamentId && data.tournamentId.toString() !== tournamentId.toString()) {
        return;
      }

      // Remove from active live matches
      setLiveMatches(prev => prev.filter(m => m.matchId !== data.matchId));

      // Add to recently completed list with completion trophy banner
      setCompletedRecentMatches(prev => {
        const filtered = prev.filter(m => m.matchId !== data.matchId);
        return [data, ...filtered].slice(0, 3); // keep up to 3 most recent
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('match:live_score', onScoreUpdate);
    socket.on('match:completed', onMatchCompleted);

    return () => {
      leaveTournamentRoom(tournamentId);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('match:live_score', onScoreUpdate);
      socket.off('match:completed', onMatchCompleted);
    };
  }, [tournamentId]);

  // If there are no live matches and no recently completed matches, don't clutter the UI
  if (!isLoading && liveMatches.length === 0 && completedRecentMatches.length === 0) {
    return null;
  }

  // Helper to extract current set's scores
  const getCurrentSetScores = (match) => {
    if (Array.isArray(match.setScores) && match.setScores.length > 0) {
      const activeSet = match.setScores[match.setScores.length - 1];
      return {
        p1: activeSet.team1Score ?? 0,
        p2: activeSet.team2Score ?? 0,
        setNumber: activeSet.setNumber || match.setScores.length
      };
    }

    // Fallback parsing from score string like "21-18, 12-8"
    if (match.score) {
      const parts = match.score.split(',');
      const lastPart = parts[parts.length - 1]?.trim();
      if (lastPart && lastPart.includes('-')) {
        const [a, b] = lastPart.split('-').map(Number);
        return {
          p1: isNaN(a) ? 0 : a,
          p2: isNaN(b) ? 0 : b,
          setNumber: parts.length
        };
      }
    }

    return { p1: 0, p2: 0, setNumber: 1 };
  };

  return (
    <section className="mb-8 animate-fadeIn" id="live-scores-section">
      {/* Live Header with Pulsing Beacon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600"></span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-wider flex items-center space-x-2">
            <span>LIVE MATCHES</span>
            {liveMatches.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800">
                {liveMatches.length} ACTIVE
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-gray-400 font-medium">Real-Time Sync Active</span>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-gray-800/60 rounded-xl p-8 border border-gray-700/60 flex items-center justify-center space-x-3 text-gray-400 text-sm">
          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading live courts...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Live Matches Grid */}
          {liveMatches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((m) => {
                const currentSetData = getCurrentSetScores(m);
                const p1Name = m.team1 || m.player1?.name || 'Player 1';
                const p2Name = m.team2 || m.player2?.name || 'Player 2';
                const isFlash = highlightedMatchId === m.matchId;

                return (
                  <div
                    key={m.matchId}
                    id={`live-match-${m.matchId}`}
                    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 border transition-all duration-300 shadow-xl ${
                      isFlash
                        ? 'border-emerald-500 shadow-emerald-950/50 scale-[1.01]'
                        : 'border-red-900/40 hover:border-red-700/60'
                    }`}
                  >
                    {/* Top Status Bar */}
                    <div className="bg-gradient-to-r from-red-950/60 via-gray-900 to-gray-900 px-4 py-2.5 flex items-center justify-between border-b border-gray-800 text-xs">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="font-extrabold text-red-400 uppercase tracking-wider">
                          {m.eventName || 'Tournament Event'}
                        </span>
                        {m.eventType && (
                          <span className="text-gray-500 font-bold">• {m.eventType}</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {m.court && (
                          <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-gray-700">
                            🏸 Court {m.court}
                          </span>
                        )}
                        <span className="bg-red-600 text-white font-extrabold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase flex items-center space-x-1 animate-pulse">
                          <span>●</span>
                          <span>LIVE</span>
                        </span>
                      </div>
                    </div>

                    {/* Main Matchup Card Body */}
                    <div className="p-4 sm:p-5">
                      {/* Round & Match Label */}
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                        <span className="font-semibold uppercase tracking-wider">
                          {m.round || 'Round Match'} {m.matchNumber ? `#${m.matchNumber}` : ''}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          Set {currentSetData.setNumber}
                        </span>
                      </div>

                      {/* Opponents & Live Scores */}
                      <div className="space-y-3">
                        {/* Player 1 Row */}
                        <div className="flex items-center justify-between bg-gray-800/80 rounded-xl px-4 py-3 border border-gray-700/60">
                          <div className="flex items-center space-x-3 truncate">
                            <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
                              1
                            </div>
                            <span className="text-base sm:text-lg font-extrabold text-white truncate">
                              {p1Name}
                            </span>
                          </div>

                          <div className="ml-4 shrink-0">
                            <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
                              {currentSetData.p1}
                            </span>
                          </div>
                        </div>

                        {/* Player 2 Row */}
                        <div className="flex items-center justify-between bg-gray-800/80 rounded-xl px-4 py-3 border border-gray-700/60">
                          <div className="flex items-center space-x-3 truncate">
                            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
                              2
                            </div>
                            <span className="text-base sm:text-lg font-extrabold text-white truncate">
                              {p2Name}
                            </span>
                          </div>

                          <div className="ml-4 shrink-0">
                            <span className="font-mono text-2xl sm:text-3xl font-black text-blue-400 tracking-tight">
                              {currentSetData.p2}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Set History Breakdown */}
                      {Array.isArray(m.setScores) && m.setScores.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-gray-400 font-medium">Sets:</span>
                            {m.setScores.map((s, idx) => (
                              <span
                                key={idx}
                                className={`font-mono px-2 py-0.5 rounded border text-[11px] font-bold ${
                                  idx === m.setScores.length - 1
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                                    : 'bg-gray-800 text-gray-300 border-gray-700'
                                }`}
                              >
                                S{s.setNumber || idx + 1}: {s.team1Score}-{s.team2Score}
                              </span>
                            ))}
                          </div>

                          {m.umpireName && (
                            <span className="text-gray-400 text-[11px]">
                              Umpire: <strong className="text-gray-300">{m.umpireName}</strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recently Completed Matches in this Session */}
          {completedRecentMatches.length > 0 && (
            <div className="mt-4 space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Recently Concluded
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {completedRecentMatches.map((cm) => (
                  <div
                    key={cm.matchId}
                    className="bg-gray-900/90 border border-emerald-800/60 rounded-xl p-3.5 flex items-center justify-between shadow-md"
                  >
                    <div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
                        <span className="text-emerald-400 font-bold">🏆 FINAL RESULT</span>
                        <span>•</span>
                        <span>{cm.eventName || 'Event'}</span>
                      </div>
                      <p className="text-sm font-bold text-white">
                        {cm.winner ? `Winner: ${cm.winner}` : `${cm.team1} vs ${cm.team2}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-1 rounded">
                        {cm.score || 'Completed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default LiveScoresSection;
