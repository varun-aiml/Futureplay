import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ScoreModal = ({ match, onClose, onSave }) => {
  // Use the scoring format passed from parent component
  const [scores, setScores] = useState([
    [0, 0], // First set
    [0, 0], // Second set
    [0, 0]  // Third set
  ]);
  const [currentSet, setCurrentSet] = useState(0);
  const [history, setHistory] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [winner, setWinner] = useState(null);
  
  // Parse scoring format from match prop
  const scoringFormat = match.scoringFormat || '21-3'; // Default if not provided
  const [pointsToWin, numberOfSets] = scoringFormat.split('-').map(Number);
  
  // Initialize from existing score if available
  useEffect(() => {
    if (match.score && match.score !== '0-0') {
      try {
        // Parse existing score format (e.g. "21-15,19-21,21-18")
        const sets = match.score.split(',');
        const parsedScores = sets.map(set => {
          const [team1, team2] = set.split('-').map(Number);
          return [team1, team2];
        });
        
        // Fill remaining sets with [0,0]
        while (parsedScores.length < 3) {
          parsedScores.push([0, 0]);
        }
        
        setScores(parsedScores);
        
        // For re-scoring, start with the first set and reset completion status
        setCurrentSet(0);
        setCompleted(false);
        setWinner(null);
        
        // Reset history for re-scoring
        setHistory([]);
      } catch (e) {
        console.error('Error parsing existing score:', e);
      }
    }
  }, [match]);
  
// Increment score for a team
const incrementScore = (teamIndex) => {
    if (completed) {
      // Allow re-scoring even if match was previously completed
      setCompleted(false);
      setWinner(null);
    }
    
    // Check if the set is already won by either team
    const team1Score = scores[currentSet][0];
    const team2Score = scores[currentSet][1];
    const otherTeamIndex = 1 - teamIndex;
    
    // Don't allow further increments if set is already won
    if ((team1Score >= pointsToWin && team1Score - team2Score >= 2) || 
        (team2Score >= pointsToWin && team2Score - team1Score >= 2)) {
      return;
    }
    
    // Save current state to history for undo
    setHistory([...history, {
      scores: JSON.parse(JSON.stringify(scores)),
      currentSet: currentSet
    }]);
    
    // Update score
    const newScores = [...scores];
    newScores[currentSet][teamIndex]++;
    setScores(newScores);
    
    // Check if current set is won
    if (newScores[currentSet][teamIndex] >= pointsToWin && 
        newScores[currentSet][teamIndex] - newScores[currentSet][otherTeamIndex] >= 2) {
      // Set is won
      handleSetWon(teamIndex, newScores);
    } else {
      // Auto-save the score even if set is not won
      autoSaveScore(newScores, false, null);
    }
  };
  
  // Add a new function to decrement score
  const decrementScore = (teamIndex) => {
    if (completed) {
      // Allow re-scoring even if match was previously completed
      setCompleted(false);
      setWinner(null);
    }
    
    // Don't decrement below zero
    if (scores[currentSet][teamIndex] <= 0) return;
    
    // Save current state to history for undo
    setHistory([...history, {
      scores: JSON.parse(JSON.stringify(scores)),
      currentSet: currentSet
    }]);
    
    // Update score
    const newScores = [...scores];
    newScores[currentSet][teamIndex]--;
    setScores(newScores);
    
    // Auto-save the score
    autoSaveScore(newScores, false, null);
  };
  
  // Handle set won
  const handleSetWon = (teamIndex, newScores) => {
    // Use the provided newScores or current scores
    const currentScores = newScores || scores;
    
    // Count sets won by each team
    const setsWon = [0, 0];
    for (let i = 0; i <= currentSet; i++) {
      if (currentScores[i][0] > currentScores[i][1]) setsWon[0]++;
      else if (currentScores[i][1] > currentScores[i][0]) setsWon[1]++;
    }
    
    // Check if match is won
    const setsToWin = Math.ceil(numberOfSets / 2);
    if (setsWon[teamIndex] >= setsToWin) {
      // Match is won
      setCompleted(true);
      setWinner(teamIndex);
      // Auto-save with match completion
      autoSaveScore(currentScores, true, teamIndex);
      return;
    }
    
    // If single set format, match is won
    if (numberOfSets === 1) {
      setCompleted(true);
      setWinner(teamIndex);
      // Auto-save with match completion
      autoSaveScore(currentScores, true, teamIndex);
      return;
    }
    
    // Move to next set if not last set
    if (currentSet < numberOfSets - 1) {
      setCurrentSet(currentSet + 1);
      // Auto-save when moving to next set
      autoSaveScore(currentScores, false, null);
    }
  };
  
  // Undo last action
  const handleUndo = () => {
    if (history.length === 0) return;
    
    const lastState = history[history.length - 1];
    setScores(lastState.scores);
    setCurrentSet(lastState.currentSet);
    setHistory(history.slice(0, -1));
    setCompleted(false);
    setWinner(null);
    
    // Auto-save after undo
    autoSaveScore(lastState.scores, false, null);
  };
  
  // Format score for display and saving
  const formatScore = (scoresToFormat = scores) => {
    // For single set format
    if (numberOfSets === 1) {
      return `${scoresToFormat[0][0]}-${scoresToFormat[0][1]}`;
    }
    
    // For multi-set format, only include played sets
    const playedSets = [];
    for (let i = 0; i <= currentSet; i++) {
      if (scoresToFormat[i][0] > 0 || scoresToFormat[i][1] > 0) {
        playedSets.push(`${scoresToFormat[i][0]}-${scoresToFormat[i][1]}`);
      }
    }
    return playedSets.join(',');
  };
  
    // Auto-save score function
    const autoSaveScore = (scoresToSave, isCompleted, matchWinner) => {
        const formattedScore = formatScore(scoresToSave);
        onSave({
          score: formattedScore,
          completed: isCompleted,
          winner: matchWinner
        }, false); // Pass false to prevent toast during auto-save
      };
      
      // Save score (keep this for the manual save button)
      const handleSave = () => {
        const formattedScore = formatScore();
        onSave({
          score: formattedScore,
          completed: completed,
          winner: winner
        }, true); // Pass true to show toast when manually saving
        toast.success('Score saved successfully!');
        onClose();
      };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Score Match</h2>
          <button
            onClick={onClose}
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
        
        <div className="p-6">
          {/* Scoring Format Display */}
          <div className="mb-6">
            <div className="text-gray-300 text-sm font-medium mb-2">
              Scoring Format: <span className="text-white">
                {scoringFormat === '15-3' ? '15 points - 3 sets' :
                 scoringFormat === '21-3' ? '21 points - 3 sets' :
                 scoringFormat === '21-1' ? '21 points - single set' :
                 scoringFormat === '30-1' ? '30 points - single set' : scoringFormat}
              </span>
            </div>
          </div>
          
          {/* Teams Display */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-white mb-2">
                  {match.team1Name || 'Team 1'}
                </h3>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-white mb-2">
                  {match.team2Name || 'Team 2'}
                </h3>
              </div>
            </div>
          </div>
          
          {/* Scoring Interface */}
          <div className="mb-8">
            {/* Sets Tabs */}
            {numberOfSets > 1 && (
              <div className="flex border-b border-gray-700 mb-4">
                {Array.from({ length: numberOfSets }).map((_, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 font-medium ${index === currentSet
                      ? 'text-red-500 border-b-2 border-red-500'
                      : 'text-gray-400 hover:text-white'}`}
                    onClick={() => !completed && setCurrentSet(index)}
                    disabled={completed || index > currentSet}
                  >
                    Set {index + 1}
                  </button>
                ))}
              </div>
            )}
            
{/* Score Buttons */}
<div className="grid grid-cols-2 gap-8 mb-6">
  {/* Team 1 Score */}
  <div className="flex flex-col items-center">
    <div 
      className={`bg-gray-700 p-6 rounded-xl text-center cursor-pointer transition-all hover:bg-gray-600 w-full ${completed && winner === 0 ? 'ring-2 ring-green-500' : ''}`}
      onClick={() => incrementScore(0)}
    >
      <div className="text-6xl font-bold text-white mb-2">
        {scores[currentSet][0]}
      </div>
      <div className="text-gray-400">
        Tap to add point
      </div>
    </div>
    <button
      onClick={() => decrementScore(0)}
      className="mt-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
    >
      - Subtract Point
    </button>
  </div>
  
  {/* Team 2 Score */}
  <div className="flex flex-col items-center">
    <div 
      className={`bg-gray-700 p-6 rounded-xl text-center cursor-pointer transition-all hover:bg-gray-600 w-full ${completed && winner === 1 ? 'ring-2 ring-green-500' : ''}`}
      onClick={() => incrementScore(1)}
    >
      <div className="text-6xl font-bold text-white mb-2">
        {scores[currentSet][1]}
      </div>
      <div className="text-gray-400">
        Tap to add point
      </div>
    </div>
    <button
      onClick={() => decrementScore(1)}
      className="mt-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
    >
      - Subtract Point
    </button>
  </div>
</div>
            
            {/* Match Status */}
            {completed && (
              <div className="bg-green-900 bg-opacity-30 border border-green-700 text-green-400 p-4 rounded-md mb-4 text-center">
                <p className="font-medium">
                  Match Completed - {winner === 0 ? match.team1Name || 'Team 1' : match.team2Name || 'Team 2'} Wins!
                </p>
                <p className="text-sm mt-1">
                  Final Score: {formatScore()}
                </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleUndo}
                disabled={history.length === 0 || completed}
                className={`px-4 py-2 rounded-md ${history.length === 0 || completed
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'}`}
              >
                Undo
              </button>
              
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Save Score
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreModal;