import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllTournamentEventFixtures } from '../../services/tournamentService';

const ResultsView = ({ tournamentId, events = [] }) => {
  const [loading, setLoading] = useState(true);
  const [eventFixtures, setEventFixtures] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [useLegacyFranchise, setUseLegacyFranchise] = useState(false);

  // Legacy franchise state (preserved fallback)
  const [legacyFixtures, setLegacyFixtures] = useState({ poolA: [], poolB: [], knockout: [] });
  const [legacyResultsByPool, setLegacyResultsByPool] = useState({ A: {}, B: {}, knockout: {} });
  const [selectedPool, setSelectedPool] = useState('A');

  useEffect(() => {
    fetchResults();
  }, [tournamentId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await getAllTournamentEventFixtures(tournamentId);

      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setEventFixtures(res.data.data);
        setSelectedEventId(res.data.data[0].eventId);
        setUseLegacyFranchise(false);
      } else {
        // Check if legacy franchise data exists in localStorage
        const savedFixtures = localStorage.getItem(`fixtures_${tournamentId}`);
        if (savedFixtures) {
          const parsed = JSON.parse(savedFixtures);
          setLegacyFixtures(parsed);
          const savedResultsByPool = localStorage.getItem(`declaredResultsByPool_${tournamentId}`);
          if (savedResultsByPool) {
            setLegacyResultsByPool(JSON.parse(savedResultsByPool));
          }
          setUseLegacyFranchise(true);
        } else {
          setEventFixtures([]);
        }
      }
    } catch (error) {
      console.error('Error loading tournament results:', error);
      // Fallback check
      const savedFixtures = localStorage.getItem(`fixtures_${tournamentId}`);
      if (savedFixtures) {
        setUseLegacyFranchise(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const currentFixture = eventFixtures.find(f => f.eventId === selectedEventId) || eventFixtures[0];

  // Helper to get completed matches
  const getCompletedMatches = (fixture) => {
    if (!fixture || !Array.isArray(fixture.matches)) return [];
    return fixture.matches.filter(m => m.status === 'Completed' || m.status === 'Walkover');
  };

  // Find the Final match and its winner or League champion from standings
  const getTournamentChampion = (fixture, standings = []) => {
    if (!fixture || !Array.isArray(fixture.matches)) return null;

    if (fixture.matchType === 'League') {
      const allCompleted = fixture.matches.length > 0 &&
        fixture.matches.every(m => m.status === 'Completed' || m.status === 'Walkover');
      if (allCompleted && standings.length > 0) {
        const winnerTeam = standings[0];
        const runnerUpTeam = standings[1];
        return {
          winner: winnerTeam.name,
          score: `${winnerTeam.points} pts (${winnerTeam.won}W - ${winnerTeam.lost}L)`,
          runnerUp: runnerUpTeam ? `${runnerUpTeam.name} (${runnerUpTeam.points} pts)` : null,
          isLeague: true
        };
      }
      return null;
    }

    // Look for match with round === 'FINAL' or highest roundIndex
    const finalMatch = fixture.matches.find(
      m => (m.round === 'FINAL' || m.roundIndex === fixture.totalRounds) && (m.status === 'Completed' || m.status === 'Walkover') && m.winner
    );

    if (finalMatch) {
      const runnerUp = finalMatch.winner === finalMatch.player1?.name
        ? (finalMatch.player2?.name || finalMatch.team2)
        : (finalMatch.player1?.name || finalMatch.team1);

      return {
        winner: finalMatch.winner,
        score: finalMatch.score || 'Won',
        runnerUp,
        finalMatch,
        isLeague: false
      };
    }

    return null;
  };

  // Calculate League Standings dynamically from completed matches
  const calculateLeagueStandings = (fixture) => {
    if (!fixture || !Array.isArray(fixture.matches)) return [];

    const statsMap = {};

    const initStats = (name) => {
      if (!name || name === 'TBD' || name === 'BYE') return;
      if (!statsMap[name]) {
        statsMap[name] = {
          name,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          points: 0
        };
      }
    };

    // Initialize all participants
    fixture.matches.forEach(m => {
      if (m.player1?.name) initStats(m.player1.name);
      if (m.player2?.name) initStats(m.player2.name);
    });

    const completed = fixture.matches.filter(m => m.status === 'Completed' || m.status === 'Walkover');

    completed.forEach(m => {
      const p1 = m.player1?.name;
      const p2 = m.player2?.name;
      if (!p1 || !p2 || !statsMap[p1] || !statsMap[p2]) return;

      statsMap[p1].played += 1;
      statsMap[p2].played += 1;

      if (m.winner === p1) {
        statsMap[p1].won += 1;
        statsMap[p1].points += (fixture.pointsSystem?.win ?? 3);
        statsMap[p2].lost += 1;
      } else if (m.winner === p2) {
        statsMap[p2].won += 1;
        statsMap[p2].points += (fixture.pointsSystem?.win ?? 3);
        statsMap[p1].lost += 1;
      } else {
        // Draw / tie
        statsMap[p1].drawn += 1;
        statsMap[p2].drawn += 1;
        statsMap[p1].points += (fixture.pointsSystem?.draw ?? 1);
        statsMap[p2].points += (fixture.pointsSystem?.draw ?? 1);
      }
    });

    return Object.values(statsMap).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.won !== a.won) return b.won - a.won;
      return a.lost - b.lost;
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-12 text-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm">Loading official tournament results...</p>
      </div>
    );
  }

  // Database-driven Standard Event Results
  if (!useLegacyFranchise && eventFixtures.length > 0) {
    const completedMatches = getCompletedMatches(currentFixture);
    const leagueStandings = currentFixture?.matchType === 'League' ? calculateLeagueStandings(currentFixture) : [];
    const champion = getTournamentChampion(currentFixture, leagueStandings);

    return (
      <div className="space-y-6">
        {/* Event Tabs Navigation */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">
              Tournament Event Results
            </h3>
            <span className="text-xs text-gray-400">
              Database-Driven Official Results
            </span>
          </div>

          <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-none">
            {eventFixtures.map(fixture => (
              <button
                key={fixture.eventId}
                onClick={() => setSelectedEventId(fixture.eventId)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedEventId === fixture.eventId
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-gray-700/80 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {fixture.eventName || 'Event'} ({fixture.eventType})
              </button>
            ))}
          </div>
        </div>

        {/* Grand Champion Display (When Event is Completed) */}
        {champion ? (
          <div className="bg-gradient-to-r from-amber-950/80 via-yellow-900/40 to-amber-950/80 border-2 border-yellow-500/70 rounded-2xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden animate-fadeIn">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl"></div>
            <div className="text-3xl sm:text-4xl mb-2">🏆</div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-yellow-400">
              {champion.isLeague ? 'League Champion' : 'Tournament Winner'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-1 mb-2 tracking-tight">
              {champion.winner}
            </h2>
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 font-mono font-bold text-sm">
              <span>{champion.isLeague ? 'Record:' : 'Final Match Score:'}</span>
              <span className="text-white">{champion.score}</span>
            </div>
            {champion.runnerUp && (
              <p className="text-xs text-gray-400 mt-3 font-medium">
                Runner-up: <span className="text-gray-300 font-semibold">{champion.runnerUp}</span>
              </p>
            )}
          </div>
        ) : (
          <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-4 text-center">
            <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">
              ● Tournament in progress
            </span>
            <p className="text-xs text-gray-400 mt-1">
              {currentFixture?.matchType === 'League'
                ? `League stage in progress (${completedMatches.length}/${currentFixture?.matches?.length || 0} matches completed). Current Leader: ${leagueStandings[0]?.name || 'TBD'}`
                : 'Final match pending. Winner will be awarded upon completion of the Final.'
              }
            </p>
          </div>
        )}

        {/* League Standings (If League format) */}
        {currentFixture?.matchType === 'League' && leagueStandings.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-md">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <span>📊</span>
              <span>Event Standings Table</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Participant</th>
                    <th className="py-2.5 px-3 text-center">Played</th>
                    <th className="py-2.5 px-3 text-center">Won</th>
                    <th className="py-2.5 px-3 text-center">Drawn</th>
                    <th className="py-2.5 px-3 text-center">Lost</th>
                    <th className="py-2.5 px-3 text-center font-bold text-white">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-750">
                  {leagueStandings.map((team, idx) => (
                    <tr key={idx} className={idx === 0 ? 'bg-yellow-500/10' : ''}>
                      <td className="py-3 px-3 font-bold text-gray-400">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {team.name}
                      </td>
                      <td className="py-3 px-3 text-center text-gray-300">{team.played}</td>
                      <td className="py-3 px-3 text-center text-emerald-400 font-bold">{team.won}</td>
                      <td className="py-3 px-3 text-center text-gray-400">{team.drawn}</td>
                      <td className="py-3 px-3 text-center text-red-400">{team.lost}</td>
                      <td className="py-3 px-3 text-center font-extrabold text-white text-base">
                        {team.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Completed Match Scorecards */}
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>🏸</span>
              <span>Official Match Results ({completedMatches.length})</span>
            </h3>
            <span className="text-xs text-gray-400 font-medium">
              Verified by Court Umpire
            </span>
          </div>

          {completedMatches.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-700/50 flex items-center justify-center text-xl">
                ⏳
              </div>
              <p className="text-base font-bold text-white">No matches completed yet</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                When assigned umpires complete matches on the court scoring screen, the official scores and winners will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedMatches.map(match => (
                <div
                  key={match._id}
                  className="bg-gray-900/90 border border-gray-700/80 rounded-xl p-4 shadow-md hover:border-gray-600 transition-all"
                >
                  {/* Round & Status */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                      {match.round}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Match #{match.matchNumber} • {match.status}
                    </span>
                  </div>

                  {/* Players / Teams & Winner */}
                  <div className="space-y-2 mb-3">
                    {/* Player 1 */}
                    <div className={`flex justify-between items-center p-2 rounded-lg ${
                      match.winner === match.player1?.name
                        ? 'bg-emerald-950/40 border border-emerald-800/60 font-bold text-white'
                        : 'text-gray-300'
                    }`}>
                      <div className="flex items-center space-x-2 truncate">
                        {match.winner === match.player1?.name && (
                          <span className="text-emerald-400 text-xs">✓</span>
                        )}
                        <span className="text-sm truncate">{match.player1?.name || match.team1 || 'TBD'}</span>
                      </div>
                      {match.winner === match.player1?.name && (
                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Winner</span>
                      )}
                    </div>

                    {/* Player 2 */}
                    <div className={`flex justify-between items-center p-2 rounded-lg ${
                      match.winner === match.player2?.name
                        ? 'bg-emerald-950/40 border border-emerald-800/60 font-bold text-white'
                        : 'text-gray-300'
                    }`}>
                      <div className="flex items-center space-x-2 truncate">
                        {match.winner === match.player2?.name && (
                          <span className="text-emerald-400 text-xs">✓</span>
                        )}
                        <span className="text-sm truncate">{match.player2?.name || match.team2 || 'TBD'}</span>
                      </div>
                      {match.winner === match.player2?.name && (
                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Winner</span>
                      )}
                    </div>
                  </div>

                  {/* Final Score & Details Footer */}
                  <div className="pt-2 border-t border-gray-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-gray-400">Final Score: </span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {match.score || 'Completed'}
                      </span>
                    </div>

                    {match.umpireName && (
                      <span className="text-gray-400 text-[11px]">
                        Umpire: <span className="text-gray-300 font-semibold">{match.umpireName}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback: Legacy franchise tournament results (if no standard event fixtures)
  return (
    <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700 shadow-md">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/60 flex items-center justify-center text-3xl">
        📋
      </div>
      <h3 className="text-xl font-bold text-white mb-2">No Event Fixtures or Results Yet</h3>
      <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
        Generate fixtures for your tournament events in the "Fixtures" tab. Once generated, assign umpires to conduct matches and record official scores.
      </p>
    </div>
  );
};

export default ResultsView;