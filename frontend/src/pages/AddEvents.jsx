import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrganizerLayout from "../components/OrganizerLayout";
import { addEvents, getTournament } from "../services/tournamentService";
import { toast } from "react-toastify";

const AddEvents = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [tournament, setTournament] = useState(null);
  const [events, setEvents] = useState([]);
  const [showFixtureModal, setShowFixtureModal] = useState(false);
  const [fixtureData, setFixtureData] = useState(null);
  const [currentEvent, setCurrentEvent] = useState({
    name: "",
    ageCategory: "Under 19",
    gender: "Boys",
    fee: "",
    maxPlayers: "",
    eventType: "",
    matchType: "",
    allowBooking: false,
    discount: "0",
  });

  // Check if form is complete
  const isFormComplete = () => {
    return (
      currentEvent.name &&
      currentEvent.ageCategory &&
      currentEvent.gender &&
      currentEvent.fee &&
      currentEvent.eventType &&
      currentEvent.matchType &&
      currentEvent.maxPlayers
    );
  };

  // Fetch tournament details
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await getTournament(tournamentId);
        setTournament(response.data);
      } catch (error) {
        setError("Failed to fetch tournament details", error);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  // Handle input change for current event
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentEvent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Toggle allow booking
  const toggleAllowBooking = () => {
    setCurrentEvent((prev) => ({
      ...prev,
      allowBooking: !prev.allowBooking,
    }));
  };

  // Generate fixtures based on match type and number of teams
  // Enhance the generateFixtures function
  const generateFixtures = () => {
    const numTeams = parseInt(currentEvent.maxPlayers);
    const matchType = currentEvent.matchType;
    let totalRounds = 0;
    let totalMatches = 0;
    let rounds = [];
    let byes = 0;

    if (matchType === "Knockout") {
      // Calculate rounds for knockout tournament
      totalRounds = Math.ceil(Math.log2(numTeams));
      totalMatches = numTeams - 1;

      // Calculate matches per round and byes
      let teamsInFirstRound = Math.pow(2, totalRounds);
      byes = teamsInFirstRound - numTeams;

      // Generate round details
      for (let i = 1; i <= totalRounds; i++) {
        let roundName = "";
        let matchesInRound = Math.pow(2, totalRounds - i);

        if (i === totalRounds) {
          roundName = "FINAL";
        } else if (i === totalRounds - 1) {
          roundName = "SEMI FINAL";
        } else if (i === totalRounds - 2) {
          roundName = "QUARTER FINAL";
        } else {
          roundName = `ROUND ${i}`;
        }

        rounds.push({
          name: roundName,
          matches: matchesInRound,
          byes: i === 1 ? byes : 0,
        });
      }
    } else if (matchType === "League") {
      // League format (round robin)
      totalMatches = (numTeams * (numTeams - 1)) / 2;
      totalRounds = numTeams - 1;

      for (let i = 1; i <= totalRounds; i++) {
        rounds.push({
          name: `ROUND ${i}`,
          matches: Math.floor(numTeams / 2),
          byes: numTeams % 2 === 1 ? 1 : 0,
        });
      }
    } else if (matchType === "Group+Knockout") {
      // Group stage + knockout
      const teamsPerGroup = 4; // Standard group size
      const numGroups = Math.ceil(numTeams / teamsPerGroup);
      const teamsAdvancing = numGroups * 2; // Top 2 from each group

      // Group stage matches
      const matchesPerGroup = (teamsPerGroup * (teamsPerGroup - 1)) / 2;
      const groupStageMatches = matchesPerGroup * numGroups;

      // Knockout stage
      const knockoutRounds = Math.ceil(Math.log2(teamsAdvancing));
      const knockoutMatches = teamsAdvancing - 1;

      totalMatches = groupStageMatches + knockoutMatches;
      totalRounds = teamsPerGroup - 1 + knockoutRounds;

      // Group stage rounds
      for (let i = 1; i <= teamsPerGroup - 1; i++) {
        rounds.push({
          name: `GROUP ROUND ${i}`,
          matches: numGroups * (teamsPerGroup / 2),
          byes: 0,
        });
      }

      // Knockout rounds
      for (let i = 1; i <= knockoutRounds; i++) {
        let roundName = "";
        let matchesInRound = Math.pow(2, knockoutRounds - i);

        if (i === knockoutRounds) {
          roundName = "FINAL";
        } else if (i === knockoutRounds - 1) {
          roundName = "SEMI FINAL";
        } else if (i === knockoutRounds - 2) {
          roundName = "QUARTER FINAL";
        } else {
          roundName = `KNOCKOUT ROUND ${i}`;
        }

        rounds.push({
          name: roundName,
          matches: matchesInRound,
          byes: 0,
        });
      }
    }

    setFixtureData({
      matchType,
      numTeams,
      totalRounds,
      totalMatches,
      rounds,
    });
  };

  // Add current event to events list
  // Handle adding event to list
  const handleAddEvent = () => {
    console.log("Adding event:", currentEvent); // Add this for debugging

    if (!isFormComplete()) {
      setError("Please fill in all required fields");
      return;
    }

    const newEvent = {
      ...currentEvent,
      id: Date.now().toString(), // Temporary ID for frontend
    };

    setEvents((prev) => [...prev, newEvent]);
    console.log("Updated events list:", [...events, newEvent]); // Add this for debugging

    // Reset form
    setCurrentEvent({
      name: "",
      ageCategory: "Under 19",
      gender: "Boys",
      fee: "",
      maxPlayers: "",
      eventType: "",
      matchType: "",
      allowBooking: false,
      discount: "0",
    });

    setError("");
  };

  // Remove event from list
  const handleRemoveEvent = (id) => {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  };

  // Submit all events
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Prepare events data for submission
      const eventsToSubmit = events.map(({ ...eventData }) => eventData);

      // Submit events to the server
      await addEvents(tournamentId, eventsToSubmit);

      // Show success message
      toast.success("Events added successfully!");

      // Instead of immediately navigating away, fetch the updated tournament data
      const response = await getTournament(tournamentId);
      setTournament(response.data);

      // Optional: You can also update the events list with the newly added events
      if (response.data && response.data.events) {
        setEvents(
          response.data.events.map((event) => ({
            ...event,
            id: event._id, // Ensure each event has an id property for the UI
          }))
        );
      }

      // Navigate to the tournament details page after a short delay
      setTimeout(() => {
        navigate(`/organizer/tournaments/${tournamentId}`);
      }, 1500); // 1.5 second delay to show the updated list
    } catch (err) {
      console.error("Error adding events:", err);
      setError(err.response?.data?.message || "Failed to add events");
      toast.error(err.response?.data?.message || "Failed to add events");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrganizerLayout>
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Ad</h1>
        {tournament && (
          <p className="text-gray-400 mb-6">Tournament: {tournament.name}</p>
        )}

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Add New Event
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event Name with Allow Booking Toggle */}
            <div className="flex items-center space-x-2">
              <div className="flex-grow">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentEvent.name}
                  onChange={handleChange}
                  className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Under 19 Girls Singles"
                  required
                />
              </div>
              <div className="flex items-center mt-6">
                <button
                  type="button"
                  onClick={toggleAllowBooking}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                    currentEvent.allowBooking ? "bg-red-600" : "bg-gray-500"
                  }`}
                  role="switch"
                  aria-checked={currentEvent.allowBooking}
                >
                  <span className="sr-only">Allow Booking</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      currentEvent.allowBooking
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="ml-2 text-sm text-gray-300">
                  {currentEvent.allowBooking
                    ? "Booking Enabled"
                    : "Booking Disabled"}
                </span>
              </div>
            </div>

            {/* Age Category */}
            <div>
              <label
                htmlFor="ageCategory"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Age Category <span className="text-red-500">*</span>
              </label>
              <select
                id="ageCategory"
                name="ageCategory"
                value={currentEvent.ageCategory}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="Under 9">Under 9</option>
                <option value="Under 13">Under 13</option>
                <option value="Under 15">Under 15</option>
                <option value="Under 17">Under 17</option>
                <option value="Under 19">Under 19</option>
                <option value="Open">Open</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={currentEvent.gender}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            {/* Event Type */}
            <div>
              <label
                htmlFor="eventType"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                id="eventType"
                name="eventType"
                value={currentEvent.eventType}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select Event Type</option>
                <option value="Singles">Singles</option>
                <option value="Doubles">Doubles</option>
                <option value="Team">Team</option>
              </select>
            </div>

            {/* Match Type */}
            <div>
              <label
                htmlFor="matchType"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Match Type <span className="text-red-500">*</span>
              </label>
              <select
                id="matchType"
                name="matchType"
                value={currentEvent.matchType}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select Match Type</option>
                <option value="Knockout">Knockout</option>
                <option value="League">League</option>
                <option value="Group+Knockout">Group + Knockout</option>
              </select>
            </div>

            {/* Fee */}
            <div>
              <label
                htmlFor="fee"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Team Entry Fee (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="fee"
                name="fee"
                value={currentEvent.fee}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                min="0"
              />
            </div>

            {/* Max Players */}
            <div>
              <label
                htmlFor="maxPlayers"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Max Players/Teams <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="maxPlayers"
                name="maxPlayers"
                value={currentEvent.maxPlayers}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                min="0"
                required
              />
            </div>

            {/* Discount */}
            <div>
              <label
                htmlFor="discount"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Discount (%)
              </label>
              <input
                type="number"
                id="discount"
                name="discount"
                value={currentEvent.discount}
                onChange={handleChange}
                className="w-full bg-gray-600 border border-gray-500 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                min="0"
                max="100"
              />
            </div>

            {/* Generate Fixtures Button */}
            <div className="mb-4">
              <button
                type="button"
                className={`w-full py-2 px-4 rounded-md ${
                  currentEvent.matchType && currentEvent.maxPlayers > 0
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-500 text-gray-300 cursor-not-allowed"
                }`}
                onClick={() => {
                  console.log("Match Type:", currentEvent.matchType);
                  console.log("Max Players:", currentEvent.maxPlayers);
                  if (currentEvent.matchType && currentEvent.maxPlayers <= 0) {
                    generateFixtures();
                    setShowFixtureModal(true);
                  }
                }}
                disabled={
                  !currentEvent.matchType || !currentEvent.maxPlayers > 0
                }
              >
                Generate Fixtures
              </button>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleAddEvent}
              disabled={!isFormComplete()}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Event
            </button>
          </div>
        </div>

        {/* Events List */}
        {events.length > 0 && (
          <div className="bg-gray-700 p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Added Events ({events.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-600">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Fee (₹)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Max Players
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Booking
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="hover:bg-gray-600 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                        {event.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {event.ageCategory}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {event.eventType}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {event.fee}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {event.maxPlayers}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            event.allowBooking
                              ? "bg-red-600 text-white"
                              : "bg-gray-500 text-gray-200"
                          }`}
                        >
                          {event.allowBooking ? "Enabled" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleRemoveEvent(event.id)}
                          className="text-red-400 hover:text-red-500 transition-colors"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate("/organizer/tournaments")}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-md transition duration-300"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || events.length === 0}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              "Save Tournament"
            )}
          </button>
        </div>
      </div>

      {/* Fixture Generator Modal */}
      {showFixtureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                Fixture Calculator
              </h2>
              <button
                onClick={() => setShowFixtureModal(false)}
                className="text-gray-400 hover:text-white"
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

            {fixtureData && (
              <div className="text-white">
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">Match Type:</p>
                      <p className="text-xl font-semibold">
                        {fixtureData.matchType}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Teams Participating:</p>
                      <p className="text-xl font-semibold">
                        {fixtureData.numTeams}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total Rounds:</p>
                      <p className="text-xl font-semibold">
                        {fixtureData.totalRounds}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total Matches:</p>
                      <p className="text-xl font-semibold">
                        {fixtureData.totalMatches}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">
                    Tournament Structure
                  </h3>

                  <div className="overflow-x-auto">
                    <div className="flex space-x-8 pb-4">
                      {fixtureData.rounds.map((round, index) => (
                        <div key={index} className="min-w-[150px]">
                          <div className="bg-gray-600 p-3 rounded-t-lg">
                            <h4 className="font-bold text-center">
                              {round.name}
                            </h4>
                          </div>
                          <div className="bg-gray-800 p-3 rounded-b-lg border border-gray-600">
                            <p className="text-center">
                              {round.matches} Matches
                            </p>
                            {round.byes > 0 && (
                              <p className="text-center text-gray-400">
                                {round.byes} Bye
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-600">
                    <h4 className="font-semibold mb-2">Tournament Notes:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-300">
                      <li>
                        For {fixtureData.numTeams} teams participating, it will
                        take {fixtureData.totalRounds} rounds with a total of{" "}
                        {fixtureData.totalMatches} matches.
                      </li>
                      {fixtureData.matchType === "Knockout" && (
                        <li>
                          In a knockout tournament, teams are eliminated after
                          losing a match.
                        </li>
                      )}
                      {fixtureData.matchType === "League" && (
                        <li>
                          In a league tournament, each team plays against every
                          other team once.
                        </li>
                      )}
                      {fixtureData.matchType === "Group+Knockout" && (
                        <>
                          <li>
                            Teams will be divided into groups of 4 for the
                            initial group stage.
                          </li>
                          <li>
                            Top 2 teams from each group will advance to the
                            knockout stage.
                          </li>
                        </>
                      )}
                      <li>
                        Schedule matches with sufficient time gaps between
                        rounds.
                      </li>
                      <li>Consider venue availability for all match days.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </OrganizerLayout>
  );
};

export default AddEvents;
