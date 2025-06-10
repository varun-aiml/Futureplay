import React, { useState } from "react";

const EventFixtures = ({ fixtures }) => {
  const [activeTab, setActiveTab] = useState(
    fixtures && fixtures.matchType === "Group+Knockout" ? "groups" : "bracket"
  );

  if (!fixtures || !fixtures.matches || fixtures.matches.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center">
        <p className="text-gray-400">No fixtures available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-6">
      {/* Tabs for different views */}
      <div className="flex border-b border-gray-700">
        {fixtures.matchType === "Group+Knockout" && (
          <button
            className={`px-4 py-3 font-medium ${
              activeTab === "groups"
                ? "text-red-500 border-b-2 border-red-500"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("groups")}
          >
            Groups
          </button>
        )}
        <button
          className={`px-4 py-3 font-medium ${
            activeTab === "bracket"
              ? "text-red-500 border-b-2 border-red-500"
              : "text-gray-400 hover:text-white"
          }`}
          onClick={() => setActiveTab("bracket")}
        >
          {fixtures.matchType === "League" ? "Matches" : "Bracket"}
        </button>
      </div>

      <div className="p-4">
        {activeTab === "groups" && fixtures.groups && (
          <div className="space-y-6">
            {fixtures.groups.map((group, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">
                  {group.name}
                </h3>

                {/* Group table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-900">
                    <thead>
                      <tr className="bg-gray-800 text-gray-400 text-xs uppercase">
                        <th className="py-2 px-3 text-left">TEAMS</th>
                        <th className="py-2 px-3 text-center">P</th>
                        <th className="py-2 px-3 text-center">W</th>
                        <th className="py-2 px-3 text-center">L</th>
                        <th className="py-2 px-3 text-center">D</th>
                        <th className="py-2 px-3 text-center">PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.teams.map((team, teamIndex) => (
                        <tr
                          key={teamIndex}
                          className="border-t border-gray-800 text-white"
                        >
                          <td className="py-2 px-3">{team.team.name}</td>
                          <td className="py-2 px-3 text-center">
                            {team.played}
                          </td>
                          <td className="py-2 px-3 text-center">{team.won}</td>
                          <td className="py-2 px-3 text-center">{team.lost}</td>
                          <td className="py-2 px-3 text-center">
                            {team.drawn}
                          </td>
                          <td className="py-2 px-3 text-center font-bold">
                            {team.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Group matches */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">
                    Matches
                  </h4>
                  <div className="space-y-2">
                    {fixtures.matches
                      .filter(
                        (match) =>
                          match.round.includes("GROUP") &&
                          match.round.includes(group.name.split(" ")[1])
                      )
                      .map((match, matchIndex) => (
                        <div
                          key={matchIndex}
                          className="bg-gray-800 p-2 rounded flex justify-between items-center"
                        >
                          <div className="flex-1 text-right pr-2">
                            {match.player1.name}
                          </div>
                          <div className="px-3 py-1 bg-gray-700 rounded text-xs">
                            {match.status === "Completed" ? match.score : "vs"}
                          </div>
                          <div className="flex-1 pl-2">
                            {match.player2.name}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "bracket" && (
          <div className="overflow-x-auto">
            {fixtures.matchType === "League" ? (
              // League matches display
              <div className="space-y-4">
                {Array.from(
                  new Set(fixtures.matches.map((match) => match.round))
                )
                  .sort((a, b) => {
                    const aNum = parseInt(a.split(" ").pop());
                    const bNum = parseInt(b.split(" ").pop());
                    return aNum - bNum;
                  })
                  .map((round, roundIndex) => (
                    <div
                      key={roundIndex}
                      className="bg-gray-900 rounded-lg p-4"
                    >
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {round}
                      </h3>
                      <div className="space-y-2">
                        {fixtures.matches
                          .filter((match) => match.round === round)
                          .map((match, matchIndex) => (
                            <div
                              key={matchIndex}
                              className="bg-gray-800 p-3 rounded flex justify-between items-center"
                            >
                              <div
                                className={`flex-1 text-right pr-2 ${
                                  match.winner &&
                                  match.winner._id === match.player1._id
                                    ? "font-bold text-green-400"
                                    : ""
                                }`}
                              >
                                {match.player1 ? match.player1.name : "TBD"}
                              </div>
                              <div className="px-3 py-1 bg-gray-700 rounded text-xs">
                                {match.status === "Completed"
                                  ? match.score
                                  : "vs"}
                              </div>
                              <div
                                className={`flex-1 pl-2 ${
                                  match.winner &&
                                  match.winner._id === match.player2._id
                                    ? "font-bold text-green-400"
                                    : ""
                                }`}
                              >
                                {match.player2 ? match.player2.name : "TBD"}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              // Knockout bracket display
              <div className="flex space-x-4 min-w-max pb-4">
                {Array.from(
                  new Set(fixtures.matches.map((match) => match.round))
                )
                  .sort((a, b) => {
                    // Custom sort for knockout rounds
                    const rounds = [
                      "PRELIMINARY ROUND",
                      "ROUND 1",
                      "ROUND 2",
                      "ROUND 3",
                      "ROUND OF 128",
                      "ROUND OF 64",
                      "ROUND OF 32",
                      "PRE-QUARTER FINAL",
                      "QUARTER FINAL",
                      "SEMI FINAL",
                      "FINAL",
                    ];
                    return rounds.indexOf(a) - rounds.indexOf(b);
                  })
                  .map((round, roundIndex) => {
                    const roundMatches = fixtures.matches.filter(
                      (match) => match.round === round
                    );
                    return (
                      <div key={roundIndex} className="w-[200px]">
                        <div className="bg-red-600 p-2 rounded-t text-center">
                          <h3 className="font-bold text-white">{round}</h3>
                        </div>
                        <div className="bg-gray-900 p-2 rounded-b space-y-4">
                          {roundMatches.map((match, matchIndex) => (
                            <div key={matchIndex} className="space-y-1">
                              <div
                                className={`bg-gray-800 p-2 rounded-t border-l-4 ${
                                  match.winner &&
                                  match.player1 &&
                                  match.winner._id === match.player1._id
                                    ? "border-green-500"
                                    : "border-gray-700"
                                }`}
                              >
                                {match.player1 ? match.player1.name : "TBD"}
                              </div>
                              <div
                                className={`bg-gray-800 p-2 rounded-b border-l-4 ${
                                  match.winner &&
                                  match.player2 &&
                                  match.winner._id === match.player2._id
                                    ? "border-green-500"
                                    : "border-gray-700"
                                }`}
                              >
                                {match.player2 ? match.player2.name : "TBD"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventFixtures;
