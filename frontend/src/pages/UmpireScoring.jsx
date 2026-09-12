import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMatchForScoring, submitMatchScore, updateLiveMatchScore } from '../services/tournamentService';

const UmpireScoring = () => {
  const { tournamentId, eventId, matchId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState(null);
  const [tournamentInfo, setTournamentInfo] = useState(null);
  const [eventInfo, setEventInfo] = useState(null);

  // Scoring engine state
  const [scoringFormat, setScoringFormat] = useState('21-3');
  const [pointsToWin, setPointsToWin] = useState(21);
  const [numberOfSets, setNumberOfSets] = useState(3);
  const [currentSet, setCurrentSet] = useState(0);
  const [scores, setScores] = useState([
    [0, 0],
    [0, 0],
    [0, 0]
  ]);
  const [completed, setCompleted] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState(null); // 0 or 1
  const [isWalkover, setIsWalkover] = useState(false);
  const [showWalkoverModal, setShowWalkoverModal] = useState(false);
  const [walkoverTeam, setWalkoverTeam] = useState(null);
  const [history, setHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  // Load match details
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true);
        const res = await getMatchForScoring(tournamentId, eventId, matchId);
        if (res.data?.success) {
          const { match, tournament, event } = res.data.data;
          setMatchData(match);
          setTournamentInfo(tournament);
          setEventInfo(event);

          const fmt = event?.scoringFormat || '21-3';
          setScoringFormat(fmt);
          const [pts, sets] = fmt.split('-').map(Number);
          const maxPoints = pts || 21;
          const maxSets = sets || 3;
          setPointsToWin(maxPoints);
          setNumberOfSets(maxSets);

          // If match already completed, load existing scores and mark as completed
          if (match.status === 'Completed' || match.status === 'Walkover') {
            setAlreadyCompleted(true);
            setCompleted(true);
            if (match.score) {
              parseExistingScore(match.score, maxSets);
            }
            if (match.winner) {
              setWinnerIndex(match.winner === match.player1?.name ? 0 : 1);
            }
          } else if (Array.isArray(match.setScores) && match.setScores.length > 0) {
            // Restore from persisted setScores array
            const restoredScores = [];
            for (let i = 0; i < maxSets; i++) {
              const sObj = match.setScores[i];
              if (sObj) {
                restoredScores.push([Number(sObj.team1Score) || 0, Number(sObj.team2Score) || 0]);
              } else {
                restoredScores.push([0, 0]);
              }
            }
            setScores(restoredScores);
            let activeIdx = Math.min(match.setScores.length - 1, maxSets - 1);
            // If the latest set was won, point active to next set
            const lastSetScore = restoredScores[activeIdx];
            if (isSetWonByScore(lastSetScore, maxPoints) !== null && activeIdx < maxSets - 1) {
              activeIdx++;
            }
            setCurrentSet(Math.max(0, activeIdx));
          } else if (match.score && match.score !== '0-0') {
            parseExistingScore(match.score, maxSets);
          } else if (match.status === 'Pending' || match.status === 'Scheduled') {
            // Automatically mark match In Progress in MongoDB as umpire begins scoring
            updateLiveMatchScore(tournamentId, eventId, matchId, {
              score: '0-0',
              setScores: [{ setNumber: 1, team1Score: 0, team2Score: 0 }],
              currentSet: 1,
              status: 'In Progress'
            }).catch(() => {});
          }
        }
      } catch (error) {
        console.error('Error fetching match:', error);
        toast.error(error.response?.data?.message || 'Failed to load match details');
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [tournamentId, eventId, matchId]);

  const parseExistingScore = (scoreStr, maxSets) => {
    try {
      const setParts = scoreStr.split(',');
      const parsed = setParts.map(s => {
        const [a, b] = s.split('-').map(Number);
        return [isNaN(a) ? 0 : a, isNaN(b) ? 0 : b];
      });
      while (parsed.length < maxSets) {
        parsed.push([0, 0]);
      }
      setScores(parsed);
    } catch (err) {
      console.error('Error parsing score:', err);
    }
  };

  // Check if a set is won by either team
  const isSetWonByScore = (setScore, winPoints = pointsToWin) => {
    if (!Array.isArray(setScore)) return null;
    const [t1, t2] = setScore;
    if (t1 >= winPoints && (t1 - t2) >= 2) return 0;
    if (t2 >= winPoints && (t2 - t1) >= 2) return 1;
    // Cap at 30 points if reached
    if (t1 >= 30) return 0;
    if (t2 >= 30) return 1;
    return null;
  };

  const isSetWon = (setScore) => isSetWonByScore(setScore, pointsToWin);

  // Format score string (e.g. "21-18, 21-15")
  const getFormattedScore = (scoreArr = scores, activeSet = currentSet) => {
    const playedSets = [];
    for (let i = 0; i < scoreArr.length; i++) {
      if (scoreArr[i][0] > 0 || scoreArr[i][1] > 0 || i <= activeSet) {
        playedSets.push(`${scoreArr[i][0]}-${scoreArr[i][1]}`);
      }
    }
    return playedSets.length > 0 ? playedSets.join(', ') : '0-0';
  };

  // Synchronize live score point-by-point to backend & real-time broadcast
  const syncLiveScoreToBackend = async (scoreMatrix, setIdx) => {
    try {
      const activeSetIdx = setIdx !== undefined ? setIdx : currentSet;
      const formattedScore = getFormattedScore(scoreMatrix, activeSetIdx);
      const formattedSets = scoreMatrix.slice(0, activeSetIdx + 1).map((s, idx) => ({
        setNumber: idx + 1,
        team1Score: s[0],
        team2Score: s[1]
      }));

      await updateLiveMatchScore(tournamentId, eventId, matchId, {
        score: formattedScore,
        setScores: formattedSets,
        currentSet: activeSetIdx + 1,
        status: 'In Progress'
      });
    } catch (err) {
      console.warn('Live score background sync notice:', err.message);
    }
  };

  // Point Increment
  const handleAddPoint = (teamIndex) => {
    if (completed || alreadyCompleted) return;

    const currentScores = JSON.parse(JSON.stringify(scores));
    const setWinner = isSetWon(currentScores[currentSet]);
    if (setWinner !== null) return; // current set already decided

    // Push to history for undo
    setHistory(prev => [
      ...prev,
      {
        scores: JSON.parse(JSON.stringify(scores)),
        currentSet,
        completed,
        winnerIndex
      }
    ]);

    currentScores[currentSet][teamIndex]++;
    setScores(currentScores);

    // Check if this point won the current set
    const winTeam = isSetWon(currentScores[currentSet]);
    if (winTeam !== null) {
      handleSetFinished(winTeam, currentScores);
    } else {
      syncLiveScoreToBackend(currentScores, currentSet);
    }
  };

  // Point Decrement
  const handleSubtractPoint = (teamIndex) => {
    if (completed || alreadyCompleted) return;
    if (scores[currentSet][teamIndex] <= 0) return;

    setHistory(prev => [
      ...prev,
      {
        scores: JSON.parse(JSON.stringify(scores)),
        currentSet,
        completed,
        winnerIndex
      }
    ]);

    const currentScores = JSON.parse(JSON.stringify(scores));
    currentScores[currentSet][teamIndex]--;
    setScores(currentScores);
    syncLiveScoreToBackend(currentScores, currentSet);
  };

  // Handle Set Finished
  const handleSetFinished = (wonByTeam, updatedScores) => {
    // Calculate sets won by each team so far
    const setsWon = [0, 0];
    for (let i = 0; i <= currentSet; i++) {
      const sw = isSetWon(updatedScores[i]);
      if (sw === 0) setsWon[0]++;
      else if (sw === 1) setsWon[1]++;
    }

    const setsToWinMatch = Math.ceil(numberOfSets / 2);

    if (setsWon[wonByTeam] >= setsToWinMatch || numberOfSets === 1) {
      // Match Won!
      setCompleted(true);
      setWinnerIndex(wonByTeam);
      const winnerName = wonByTeam === 0 ? getPlayerName(1) : getPlayerName(2);
      toast.success(`Game & Match won by ${winnerName}!`);
      syncLiveScoreToBackend(updatedScores, currentSet);
    } else if (currentSet < numberOfSets - 1) {
      // Advance to next set
      const nextSetIdx = currentSet + 1;
      setCurrentSet(nextSetIdx);
      toast.info(`Set ${currentSet + 1} completed. Moving to Set ${currentSet + 2}`);
      syncLiveScoreToBackend(updatedScores, nextSetIdx);
    }
  };

  // Undo Last Action
  const handleUndo = () => {
    if (history.length === 0 || alreadyCompleted) return;

    const previousState = history[history.length - 1];
    setScores(previousState.scores);
    setCurrentSet(previousState.currentSet);
    setCompleted(previousState.completed);
    setWinnerIndex(previousState.winnerIndex);
    setIsWalkover(false);
    setHistory(prev => prev.slice(0, -1));
    syncLiveScoreToBackend(previousState.scores, previousState.currentSet);
  };

  // Get player names
  const getPlayerName = (playerNum) => {
    if (playerNum === 1) {
      return matchData?.player1?.name || matchData?.team1 || 'Player 1';
    }
    return matchData?.player2?.name || matchData?.team2 || 'Player 2';
  };

  // Walkover logic
  const handleApplyWalkover = (teamIdx) => {
    setIsWalkover(true);
    setCompleted(true);
    setWinnerIndex(teamIdx);
    setShowWalkoverModal(false);
    toast.info(`Walkover declared. Winner: ${teamIdx === 0 ? getPlayerName(1) : getPlayerName(2)}`);
  };

  // Submit official result to MongoDB
  const handleSubmitScore = async () => {
    if (!completed && !isWalkover) {
      toast.warn('The match is not yet completed.');
      return;
    }

    if (isSubmitting || alreadyCompleted) return;

    const winnerName = winnerIndex === 0 ? getPlayerName(1) : getPlayerName(2);
    const finalScore = isWalkover ? 'Walkover' : getFormattedScore();

    const formattedSetScores = scores.slice(0, currentSet + 1).map((s, idx) => ({
      setNumber: idx + 1,
      team1Score: s[0],
      team2Score: s[1]
    }));

    try {
      setIsSubmitting(true);
      const res = await submitMatchScore(tournamentId, eventId, matchId, {
        score: finalScore,
        winner: winnerName,
        setScores: formattedSetScores,
        walkover: isWalkover
      });

      if (res.data?.success) {
        toast.success('Official match score recorded successfully!');
        navigate('/umpire/dashboard');
      } else {
        toast.error(res.data?.message || 'Failed to record official score');
      }
    } catch (error) {
      console.error('Error submitting match score:', error);
      toast.error(error.response?.data?.message || 'Failed to submit score');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-400">Loading court scoring engine...</p>
      </div>
    );
  }

  if (!matchData) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6 flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">Match not found or access restricted.</p>
        <button
          onClick={() => navigate('/umpire/dashboard')}
          className="px-4 py-2 bg-gray-800 rounded-xl text-white font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const p1Name = getPlayerName(1);
  const p2Name = getPlayerName(2);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 py-2.5 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/umpire/dashboard')}
            className="flex items-center space-x-1 text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-xs font-semibold">Exit</span>
          </button>

          <div className="text-center">
            <p className="text-[11px] uppercase font-bold tracking-wider text-emerald-400 truncate max-w-[200px]">
              {tournamentInfo?.title || 'Tournament'}
            </p>
            <p className="text-xs text-gray-300 font-semibold truncate max-w-[220px]">
              {eventInfo?.name} • {matchData.round}
            </p>
          </div>

          <div className="flex items-center">
            {matchData.court ? (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                Court {matchData.court}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-lg bg-gray-800 text-gray-400 text-[10px] font-bold">
                M#{matchData.matchNumber}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Scoring Area (Mobile-First Layout) */}
      <main className="max-w-xl w-full mx-auto px-4 py-3 flex-1 flex flex-col justify-between">
        {/* Set Selector / Match Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between bg-gray-900/90 border border-gray-800 rounded-xl p-1.5 shadow-inner">
            {Array.from({ length: numberOfSets }).map((_, idx) => {
              const isSetPast = idx < currentSet;
              const isSetCurrent = idx === currentSet;
              const setScore = scores[idx];

              return (
                <button
                  key={idx}
                  disabled={alreadyCompleted || idx > currentSet}
                  onClick={() => !completed && setCurrentSet(idx)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold text-center transition-all ${
                    isSetCurrent
                      ? 'bg-emerald-500 text-gray-950 shadow-md shadow-emerald-500/20'
                      : isSetPast
                      ? 'bg-gray-800/90 text-gray-300'
                      : 'text-gray-500 hover:text-gray-400'
                  }`}
                >
                  <div>Set {idx + 1}</div>
                  <div className="text-[11px] font-mono">
                    {setScore ? `${setScore[0]} - ${setScore[1]}` : '0 - 0'}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center px-1 mt-1 text-[11px] text-gray-400">
            <span>Format: {pointsToWin} pts (Best of {numberOfSets})</span>
            <span>2-point lead required</span>
          </div>
        </div>

        {/* Completed / Winner Banner */}
        {completed && (
          <div className="mb-3 p-3 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-center animate-fadeIn shadow-lg">
            <div className="text-xs uppercase tracking-widest text-emerald-400 font-extrabold">
              🏆 Match Completed
            </div>
            <p className="text-base font-black text-white mt-0.5">
              {winnerIndex === 0 ? p1Name : p2Name} Wins!
            </p>
            <p className="text-xs text-emerald-300 font-mono mt-0.5">
              Score: {isWalkover ? 'Walkover' : getFormattedScore()}
            </p>
          </div>
        )}

        {/* Players Court Split (Two Large Touch Zones) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 my-2">
          {/* PLAYER 1 CARD */}
          <div className={`flex flex-col justify-between bg-gradient-to-b from-gray-900 to-gray-950 border-2 rounded-2xl p-4 shadow-xl transition-all ${
            winnerIndex === 0 ? 'border-emerald-500 shadow-emerald-500/20' : 'border-gray-800'
          }`}>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                Player 1 / Team 1
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white truncate max-w-[240px] mx-auto">
                {p1Name}
              </h2>
            </div>

            {/* Giant Score Display */}
            <div className="my-3 text-center">
              <span className="font-mono text-6xl sm:text-7xl font-black text-emerald-400 tracking-tighter drop-shadow-md select-none">
                {scores[currentSet][0]}
              </span>
            </div>

            {/* Tap Controls */}
            <div className="space-y-2">
              <button
                disabled={completed || alreadyCompleted}
                onClick={() => handleAddPoint(0)}
                className="w-full py-4 sm:py-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-black text-lg sm:text-xl shadow-lg shadow-emerald-500/20 transform active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + POINT
              </button>

              <button
                disabled={completed || alreadyCompleted || scores[currentSet][0] <= 0}
                onClick={() => handleSubtractPoint(0)}
                className="w-full py-2 rounded-lg bg-gray-800/80 hover:bg-gray-800 text-gray-400 hover:text-white text-xs font-bold border border-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                - Subtract Point
              </button>
            </div>
          </div>

          {/* PLAYER 2 CARD */}
          <div className={`flex flex-col justify-between bg-gradient-to-b from-gray-900 to-gray-950 border-2 rounded-2xl p-4 shadow-xl transition-all ${
            winnerIndex === 1 ? 'border-emerald-500 shadow-emerald-500/20' : 'border-gray-800'
          }`}>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                Player 2 / Team 2
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white truncate max-w-[240px] mx-auto">
                {p2Name}
              </h2>
            </div>

            {/* Giant Score Display */}
            <div className="my-3 text-center">
              <span className="font-mono text-6xl sm:text-7xl font-black text-emerald-400 tracking-tighter drop-shadow-md select-none">
                {scores[currentSet][1]}
              </span>
            </div>

            {/* Tap Controls */}
            <div className="space-y-2">
              <button
                disabled={completed || alreadyCompleted}
                onClick={() => handleAddPoint(1)}
                className="w-full py-4 sm:py-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-black text-lg sm:text-xl shadow-lg shadow-emerald-500/20 transform active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + POINT
              </button>

              <button
                disabled={completed || alreadyCompleted || scores[currentSet][1] <= 0}
                onClick={() => handleSubtractPoint(1)}
                className="w-full py-2 rounded-lg bg-gray-800/80 hover:bg-gray-800 text-gray-400 hover:text-white text-xs font-bold border border-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                - Subtract Point
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="mt-3 pt-3 border-t border-gray-800 space-y-2.5">
          <div className="flex space-x-2">
            {/* Undo */}
            <button
              onClick={handleUndo}
              disabled={history.length === 0 || alreadyCompleted}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gray-800/90 hover:bg-gray-700 text-amber-400 text-xs font-bold border border-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2a5 5 0 01-5 5H6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6L3 10l4 4" />
              </svg>
              <span>Undo Last Point</span>
            </button>

            {/* Walkover */}
            {!alreadyCompleted && !completed && (
              <button
                onClick={() => setShowWalkoverModal(true)}
                className="py-2.5 px-3 rounded-xl bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 text-xs font-bold border border-purple-800/40 transition-colors"
              >
                Declare Walkover
              </button>
            )}
          </div>

          {/* Submit Official Score Button */}
          {completed && !alreadyCompleted ? (
            <button
              onClick={handleSubmitScore}
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 text-gray-950 font-black text-base shadow-xl shadow-emerald-500/30 animate-pulse transform active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Result to Database...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>SUBMIT OFFICIAL RESULT TO TOURNAMENT</span>
                </>
              )}
            </button>
          ) : alreadyCompleted ? (
            <div className="w-full py-3 rounded-xl bg-gray-900 border border-emerald-800 text-emerald-400 text-xs font-bold text-center">
              ✓ Match Result Officially Recorded in MongoDB
            </div>
          ) : null}
        </div>
      </main>

      {/* Walkover Modal */}
      {showWalkoverModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Declare Walkover</h3>
            <p className="text-xs text-gray-400 mb-4">
              Select which player/team is awarded the walkover victory:
            </p>

            <div className="space-y-2 mb-4">
              <button
                onClick={() => handleApplyWalkover(0)}
                className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm rounded-xl text-left border border-gray-700"
              >
                {p1Name} (Wins by Walkover)
              </button>
              <button
                onClick={() => handleApplyWalkover(1)}
                className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm rounded-xl text-left border border-gray-700"
              >
                {p2Name} (Wins by Walkover)
              </button>
            </div>

            <button
              onClick={() => setShowWalkoverModal(false)}
              className="w-full py-2.5 bg-gray-800 text-gray-400 hover:text-white rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UmpireScoring;
