const FixtureModal = ({ fixtureData, setShowFixtureModal }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 animate-slideIn">
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            TOURNAMENT STRUCTURE
            {fixtureData.eventName && (
              <span className="ml-2 text-lg text-gray-400">({fixtureData.eventName})</span>
            )}
          </h2>
          <button
            onClick={() => setShowFixtureModal(false)}
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

        <div className="text-white">
          {/* Tournament Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold mb-2 text-red-500">FORMAT</h3>
              <p className="text-white text-xl font-bold">{fixtureData.matchType}</p>
              {fixtureData.eventName && (
                <p className="text-gray-400 text-sm mt-2">{fixtureData.eventName}</p>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold mb-2 text-red-500">TEAMS</h3>
              <div className="inline-flex items-center justify-center bg-red-600 text-white font-bold rounded-full w-14 h-14 shadow-lg text-xl">
                {fixtureData.numTeams}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 shadow-inner flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold mb-2 text-red-500">SUMMARY</h3>
              <div className="text-center">
                <p className="text-white font-bold">{fixtureData.totalRounds} Rounds</p>
                <p className="text-white font-bold">{fixtureData.totalMatches} Matches</p>
              </div>
            </div>
          </div>

          {/* Tournament Structure Visualization */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-5 rounded-lg mb-6 border border-gray-700 shadow-lg">
            <h3 className="text-xl font-bold text-center mb-6 text-white">
              Tournament Progression
            </h3>

            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-4 md:space-x-6 justify-start min-w-max">
                {fixtureData.rounds.map((round, index) => (
                  <div key={index} className="relative flex flex-col items-center">
                    <div className="w-[280px] text-center transform transition-all duration-300 hover:scale-105">
                      <div className="bg-gradient-to-r from-red-700 to-red-600 p-3 rounded-t-lg shadow-lg">
                        <h4 className="font-bold text-white">
                          {round.name}
                        </h4>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-b-lg border border-gray-600 shadow-inner">
                        <p className="text-white font-medium text-lg">
                          {round.matches} {round.matches === 1 ? 'Match' : 'Matches'}
                        </p>
                        {round.byes > 0 && (
                          <p className="text-gray-400">
                            {round.byes} {round.byes === 1 ? 'Bye' : 'Byes'}
                          </p>
                        )}
                        {round.details && (
                          <p className="text-gray-400 text-sm mt-2">{round.details}</p>
                        )}
                        
                        {/* Display matchups if available */}
                        {round.matchups && round.matchups.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {round.matchups.map((matchup, idx) => (
                              <div key={idx} className="bg-gray-700 rounded-xl p-3 text-sm">
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex-1">
                                    <div className={`flex items-center ${matchup.team1 !== 'BYE' && matchup.team1 !== '-' ? 'bg-gray-600 p-2 rounded-lg' : ''}`}>
                                      <span className="font-medium text-white">{matchup.team1 || '-'}</span>
                                      {matchup.team1 !== 'BYE' && matchup.team1 !== '-' && (
                                        <span className="ml-auto w-3 h-full bg-green-500 rounded-r"></span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-gray-400 text-xs px-2">M:{index + 1}:{idx + 1}</span>
                                </div>
                                <div className="border-t border-gray-600 my-2"></div>
                                <div className="flex justify-between items-center">
                                  <div className="flex-1">
                                    <div className={`flex items-center ${matchup.team2 !== 'BYE' && matchup.team2 !== '-' ? 'bg-gray-600 p-2 rounded-lg' : ''}`}>
                                      <span className="font-medium text-white">{matchup.team2 || '-'}</span>
                                      {matchup.team2 !== 'BYE' && matchup.team2 !== '-' && (
                                        <span className="ml-auto w-3 h-full bg-red-500 rounded-r"></span>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-gray-400 text-xs">{matchup.score || '-'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {index < fixtureData.rounds.length - 1 && (
                      <div className="flex items-center justify-center h-full mt-4 mb-4">
                        <div className="relative w-16 h-10 flex items-center justify-center">
                          {/* Enhanced arrow with animation */}
                          <div className="absolute w-full h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700"></div>
                          <div className="absolute w-full h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700 animate-pulse opacity-70"></div>
                          <div className="absolute right-0 w-4 h-4 bg-red-600 transform rotate-45 rounded-sm animate-bounce"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tournament Notes */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-5 rounded-lg border border-gray-700 shadow-lg">
            <h3 className="text-lg font-semibold mb-3 text-red-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Tournament Notes:
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-300">
              <li className="transition-all duration-300 hover:text-white">
                For {fixtureData.numTeams} teams participating, it will
                take {fixtureData.totalRounds} rounds with a total of{" "}
                {fixtureData.totalMatches} matches.
              </li>
              {fixtureData.matchType === "Knockout" && (
                <>
                  <li className="transition-all duration-300 hover:text-white">
                    In a knockout tournament, teams are eliminated after
                    losing a match.
                  </li>
                  <li className="transition-all duration-300 hover:text-white">
                    The tournament structure includes {fixtureData.rounds.some(r => r.name === "PRELIMINARY ROUND") ? "a preliminary round and " : ""}
                    progresses through to the final.
                  </li>
                </>
              )}
              {fixtureData.matchType === "League" && (
                <>
                  <li className="transition-all duration-300 hover:text-white">
                    In a league tournament, each team plays against every
                    other team once.
                  </li>
                  <li className="transition-all duration-300 hover:text-white">
                    Teams earn {fixtureData.pointsSystem?.win || 3} points for a win, 
                    {fixtureData.pointsSystem?.draw || 1} point for a draw, and
                    {fixtureData.pointsSystem?.loss || 0} points for a loss.
                  </li>
                </>
              )}
              {fixtureData.matchType === "Group+Knockout" && (
                <>
                  <li className="transition-all duration-300 hover:text-white">
                    Teams will be divided into {fixtureData.rounds.find(r => r.groups)?.groups || "multiple"} groups for the
                    initial group stage.
                  </li>
                  <li className="transition-all duration-300 hover:text-white">
                    Top 2 teams from each group will advance to the
                    knockout stage.
                  </li>
                </>
              )}
              <li className="transition-all duration-300 hover:text-white">
                Schedule matches with sufficient time gaps between
                rounds.
              </li>
              <li className="transition-all duration-300 hover:text-white">
                Consider venue availability for all match days.
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Add global styles for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-2px) rotate(45deg); }
          50% { transform: translateX(0) rotate(45deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-bounce {
          animation: bounce 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default FixtureModal;