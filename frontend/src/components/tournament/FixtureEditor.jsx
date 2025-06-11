import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const FixtureEditor = ({ fixtureData, tournamentId, eventId, onClose, onFixtureUpdated }) => {
  const [editableFixture, setEditableFixture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [teamOptions, setTeamOptions] = useState([]);
  
  useEffect(() => {
    if (fixtureData) {
      setEditableFixture({...fixtureData});
      
      // Extract all teams from the fixture data to use as options for swapping
      const teams = [];
      if (fixtureData.matches && fixtureData.matches.length > 0) {
        fixtureData.matches.forEach(match => {
          if (match.player1 && match.player1.name !== 'TBD' && match.player1.name !== '-') {
            teams.push(match.player1);
          }
          if (match.player2 && match.player2.name !== 'TBD' && match.player2.name !== '-') {
            teams.push(match.player2);
          }
        });
      }
      setTeamOptions(teams);
    }
  }, [fixtureData]);

  const handleMatchSelect = (match) => {
    setSelectedMatch(match);
  };

  const handleTeamSwap = (matchId, position, newTeam) => {
    const updatedFixture = {...editableFixture};
    const matchIndex = updatedFixture.matches.findIndex(m => m.matchId === matchId);
    
    if (matchIndex !== -1) {
      // Store the team being replaced
      const replacedTeam = position === 'player1' 
        ? updatedFixture.matches[matchIndex].player1 
        : updatedFixture.matches[matchIndex].player2;
      
      // Find the match with the new team and swap
      const otherMatchIndex = updatedFixture.matches.findIndex(m => 
        (m.player1 && m.player1.name === newTeam.name) || 
        (m.player2 && m.player2.name === newTeam.name)
      );
      
      if (otherMatchIndex !== -1) {
        // Determine which position the new team is in
        const otherPosition = updatedFixture.matches[otherMatchIndex].player1 && 
                             updatedFixture.matches[otherMatchIndex].player1.name === newTeam.name 
                             ? 'player1' : 'player2';
        
        // Swap the teams
        updatedFixture.matches[matchIndex][position] = newTeam;
        updatedFixture.matches[otherMatchIndex][otherPosition] = replacedTeam;
      }
    }
    
    setEditableFixture(updatedFixture);
    setSelectedMatch(null);
  };

  const saveFixtureChanges = async () => {
    try {
      setIsLoading(true);
      // For now, we'll just update the local state since we don't have a backend API yet
      if (onFixtureUpdated) {
        onFixtureUpdated(editableFixture);
      }
      toast.success('Fixture updated successfully');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update fixture');
    } finally {
      setIsLoading(false);
    }
  };

  if (!editableFixture) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 animate-slideIn">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            EDIT FIXTURES
            {editableFixture.eventName && (
              <span className="ml-2 text-lg text-gray-400">({editableFixture.eventName})</span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors hover:bg-red-600 hover:bg-opacity-20 p-2 rounded-full"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
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

        <div className="text-white mb-6">
          <p className="text-lg mb-4">Select a match to modify teams:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {editableFixture.matches && editableFixture.matches.map((match, index) => (
              <div 
                key={match.matchId || index} 
                className={`bg-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:bg-gray-600 ${selectedMatch === match ? 'ring-2 ring-red-500' : ''}`}
                onClick={() => handleMatchSelect(match)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-400">{match.round}</div>
                  <div className="text-sm font-medium text-red-400">Match {index + 1}</div>
                </div>
                <div className={`flex justify-between items-center p-2 rounded-md ${match.player1?.name !== 'TBD' && match.player1?.name !== '-' ? 'border-blue-500' : 'border-gray-700'} border`}>
                  <span className="font-medium text-white">{match.player1?.name || 'TBD'}</span>
                </div>
                <div className="flex justify-center items-center my-1">
                  <span className="text-xs text-gray-400">vs</span>
                </div>
                <div className={`flex justify-between items-center p-2 rounded-md ${match.player2?.name !== 'TBD' && match.player2?.name !== '-' ? 'border-blue-500' : 'border-gray-700'} border`}>
                  <span className="font-medium text-white">{match.player2?.name || 'TBD'}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedMatch && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
              <h3 className="text-xl font-bold mb-4">Edit Match</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Team 1</label>
                  <select 
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={selectedMatch.player1?.name || ''}
                    onChange={(e) => {
                      const newTeam = teamOptions.find(team => team.name === e.target.value);
                      if (newTeam) {
                        handleTeamSwap(selectedMatch.matchId, 'player1', newTeam);
                      }
                    }}
                  >
                    <option value={selectedMatch.player1?.name || ''}>
                      {selectedMatch.player1?.name || 'TBD'}
                    </option>
                    {teamOptions
                      .filter(team => team.name !== selectedMatch.player1?.name && team.name !== selectedMatch.player2?.name)
                      .map((team, idx) => (
                        <option key={idx} value={team.name}>{team.name}</option>
                      ))
                    }
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Team 2</label>
                  <select 
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={selectedMatch.player2?.name || ''}
                    onChange={(e) => {
                      const newTeam = teamOptions.find(team => team.name === e.target.value);
                      if (newTeam) {
                        handleTeamSwap(selectedMatch.matchId, 'player2', newTeam);
                      }
                    }}
                  >
                    <option value={selectedMatch.player2?.name || ''}>
                      {selectedMatch.player2?.name || 'TBD'}
                    </option>
                    {teamOptions
                      .filter(team => team.name !== selectedMatch.player1?.name && team.name !== selectedMatch.player2?.name)
                      .map((team, idx) => (
                        <option key={idx} value={team.name}>{team.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            onClick={saveFixtureChanges}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FixtureEditor;