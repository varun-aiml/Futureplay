import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrganizerLayout from "../components/OrganizerLayout";
import { getTournamentById, addEvent } from "../services/tournamentService";
import { toast } from "react-toastify";

// Import modular components
import TournamentHeader from "../components/tournament/TournamentHeader";
import TabNavigation from "../components/tournament/TabNavigation";
import TournamentDetails from "../components/tournament/TournamentDetails";
import EventForm from "../components/tournament/EventForm";
import EventsList from "../components/tournament/EventsList";
import FixtureModal from "../components/tournament/FixtureModal";

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Event creation states
  const [showEventForm, setShowEventForm] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventError, setEventError] = useState("");
  const [newEvent, setNewEvent] = useState({
    name: "",
    eventType: "",
    matchType: "",
    maxParticipants: "",
    entryFee: "",
    discount: "0",
    allowBooking: false,
  });

  // Fixture calculator states
  const [showFixtureModal, setShowFixtureModal] = useState(false);
  const [fixtureData, setFixtureData] = useState(null);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await getTournamentById(id);
        setTournament(response.data.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching tournament:", err);
        setError("Failed to load tournament details");
        setIsLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  const handleEdit = () => {
    navigate(`/organizer/tournaments/edit/${id}`);
  };

  // Handle input change for new event
  const handleEventInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Toggle event form visibility
  const toggleEventForm = () => {
    setShowEventForm(!showEventForm);
    setEventError("");
  };

  // Generate fixtures based on match type and number of teams
  const generateFixtures = () => {
    const numTeams = parseInt(newEvent.maxParticipants);
    const matchType = newEvent.matchType;

    if (!numTeams || numTeams < 2) {
      toast.error("Please enter at least 2 teams/players");
      return;
    }

    let fixtureResult = null;

    switch (matchType) {
      case "Knockout":
        fixtureResult = generateKnockoutFixture(numTeams);
        break;
      case "League":
        fixtureResult = generateLeagueFixture(numTeams);
        break;
      case "Group+Knockout":
        fixtureResult = generateGroupKnockoutFixture(numTeams);
        break;
      default:
        toast.error("Please select a match type");
        return;
    }

    if (fixtureResult) {
      setFixtureData(fixtureResult);
      setShowFixtureModal(true);
    }
  };

  // Optimized Knockout Tournament Generator
  const generateKnockoutFixture = (numTeams) => {
    const rounds = [];
    let totalMatches = numTeams - 1; // Total matches in a knockout = teams - 1
    let totalByes = 0;

    // Calculate the number of rounds needed
    const totalRounds = Math.ceil(Math.log2(numTeams));

    // Calculate the perfect bracket size (next power of 2)
    const perfectBracketSize = Math.pow(2, totalRounds);

    // Calculate if we need a preliminary round
    const needsPreliminaryRound =
      numTeams > Math.pow(2, totalRounds - 1) && numTeams < perfectBracketSize;

    // Calculate how many teams play in the preliminary round
    const teamsInPreliminaryRound = needsPreliminaryRound
      ? (numTeams - Math.pow(2, totalRounds - 1)) * 2
      : 0;
    const matchesInPreliminaryRound = teamsInPreliminaryRound / 2;

    // Teams that advance directly to the first main round (get a bye in preliminary)
    const teamsWithFirstRoundBye = needsPreliminaryRound
      ? numTeams - teamsInPreliminaryRound
      : 0;

    // Add preliminary round if needed
    if (needsPreliminaryRound) {
      rounds.push({
        name: "PRELIMINARY ROUND",
        matches: matchesInPreliminaryRound,
        byes: 0,
        teamsInRound: teamsInPreliminaryRound,
        teamsAdvancing: matchesInPreliminaryRound,
        details: `${teamsInPreliminaryRound} teams compete, ${teamsWithFirstRoundBye} teams get a bye to next round`,
      });
    }

    // Calculate teams in first main round
    let teamsInFirstMainRound = needsPreliminaryRound
      ? matchesInPreliminaryRound + teamsWithFirstRoundBye
      : numTeams;

    // Generate main knockout rounds
    let remainingTeams = teamsInFirstMainRound;
    let roundNumber = needsPreliminaryRound ? 2 : 1;

    while (remainingTeams > 1) {
      const matchesInRound = remainingTeams / 2;

      let roundName = "";
      if (remainingTeams === 2) {
        roundName = "FINAL";
      } else if (remainingTeams === 4) {
        roundName = "SEMI FINAL";
      } else if (remainingTeams === 8) {
        roundName = "QUARTER FINAL";
      } else if (remainingTeams === 16) {
        roundName = "PRE-QUARTER FINAL";
      } else if (remainingTeams === 32) {
        roundName = "ROUND OF 32";
      } else if (remainingTeams === 64) {
        roundName = "ROUND OF 64";
      } else if (remainingTeams === 128) {
        roundName = "ROUND OF 128";
      } else {
        roundName = `ROUND ${roundNumber}`;
      }

      rounds.push({
        name: roundName,
        matches: matchesInRound,
        byes: 0,
        teamsInRound: remainingTeams,
        teamsAdvancing: matchesInRound,
        details: `${remainingTeams} teams → ${matchesInRound} winners advance`,
      });

      roundNumber++;
      remainingTeams = matchesInRound;
    }

    return {
      matchType: "Knockout",
      numTeams,
      totalRounds: rounds.length,
      totalMatches,
      totalByes,
      rounds,
      summary: `${numTeams} teams will compete in ${rounds.length} rounds with ${totalMatches} total matches`,
    };
  };

  // League (Round Robin) Tournament Generator
  const generateLeagueFixture = (numTeams) => {
    const rounds = [];
    const totalMatches = (numTeams * (numTeams - 1)) / 2;
    const totalRounds = numTeams % 2 === 0 ? numTeams - 1 : numTeams;
    const matchesPerRound = Math.floor(numTeams / 2);
    const byePerRound = numTeams % 2 === 1 ? 1 : 0;
    const totalByes = byePerRound * totalRounds;

    for (let i = 1; i <= totalRounds; i++) {
      rounds.push({
        name: `ROUND ${i}`,
        matches: matchesPerRound,
        byes: byePerRound,
        teamsInRound: numTeams,
        details: byePerRound
          ? `${matchesPerRound} matches, 1 team gets bye`
          : `${matchesPerRound} matches`,
      });
    }

    return {
      matchType: "League",
      numTeams,
      totalRounds,
      totalMatches,
      totalByes,
      rounds,
      pointsSystem: {
        win: 3,
        draw: 1,
        loss: 0,
      },
      summary: `Each team plays ${
        numTeams - 1
      } matches. Total ${totalMatches} matches over ${totalRounds} rounds`,
    };
  };

  // Helper function to optimize group distribution
  const optimizeGroups = (numTeams) => {
    const idealGroupSize = 4;
    const numGroups = Math.ceil(numTeams / idealGroupSize);
    const groupSizes = Array(numGroups).fill(Math.floor(numTeams / numGroups));

    // Distribute remaining teams
    let remaining = numTeams % numGroups;
    for (let i = 0; i < remaining; i++) {
      groupSizes[i]++;
    }

    return { numGroups, groupSizes };
  };

  const generateGroupKnockoutFixture = (numTeams) => {
    const rounds = [];

    const { numGroups, groupSizes } = optimizeGroups(numTeams);

    // Group Stage Calculations
    let maxGroupSize = Math.max(...groupSizes);
    let groupStageRounds = maxGroupSize - 1;
    let totalGroupMatches = 0;

    // Calculate total group stage matches
    groupSizes.forEach((size) => {
      totalGroupMatches += (size * (size - 1)) / 2;
    });

    // Generate group stage rounds
    for (let i = 1; i <= groupStageRounds; i++) {
      let matchesInRound = 0;

      groupSizes.forEach((size) => {
        if (i <= size - 1) {
          matchesInRound += Math.floor(size / 2);
        }
      });

      rounds.push({
        name: `GROUP STAGE - ROUND ${i}`,
        matches: matchesInRound,
        byes: 0,
        stage: "Group",
        groups: numGroups,
        details: `${numGroups} groups playing simultaneously`,
      });
    }

    // Knockout stage - top 2 from each group
    const teamsAdvancing = numGroups * 2;
    const knockoutRounds = Math.ceil(Math.log2(teamsAdvancing));
    let knockoutMatches = teamsAdvancing - 1;
    let remainingTeams = teamsAdvancing;

    // Generate knockout rounds
    for (let i = 1; i <= knockoutRounds; i++) {
      const matchesInRound = remainingTeams / 2;

      let roundName = "";
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
        stage: "Knockout",
        details: `${remainingTeams} teams → ${matchesInRound} winners advance`,
      });

      remainingTeams = matchesInRound;
    }

    const totalMatches = totalGroupMatches + knockoutMatches;
    const totalRounds = groupStageRounds + knockoutRounds;

    return {
      matchType: "Group+Knockout",
      numTeams,
      totalRounds,
      totalMatches,
      rounds,
      summary: `${numTeams} teams in ${numGroups} groups, followed by knockout with ${teamsAdvancing} teams`,
    };
  };

  // Submit new event

  const handleSubmitEvent = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !newEvent.name ||
      !newEvent.eventType ||
      !newEvent.matchType ||
      !newEvent.maxParticipants ||
      !newEvent.entryFee
    ) {
      setEventError("Please fill in all required fields");
      return;
    }

    setIsCreatingEvent(true);
    setEventError("");

    try {
      const response = await addEvent(id, newEvent);

      // The response contains the entire tournament object, not just the created event
      // Get the newly added event (the last one in the events array)
      const updatedTournament = response.data.data;

      // Update the tournament state with the complete updated tournament from the response
      setTournament(updatedTournament);

      // Ensure we're on the events tab to see the new event
      setActiveTab("events");

      // Show success message
      toast.success("Event added successfully!");

      // Reset form and hide it
      setNewEvent({
        name: "",
        eventType: "",
        matchType: "",
        maxParticipants: "",
        entryFee: "",
        discount: "0",
        allowBooking: false,
      });
      setShowEventForm(false);
    } catch (err) {
      console.error("Error creating event:", err);
      setEventError(err.response?.data?.message || "Failed to create event");
      toast.error(err.response?.data?.message || "Failed to create event");
    } finally {
      setIsCreatingEvent(false);
    }
  };

  if (isLoading) {
    return (
      <OrganizerLayout>
        <div className="flex justify-center items-center h-64">
          <svg
            className="animate-spin h-8 w-8 text-red-500"
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
        </div>
      </OrganizerLayout>
    );
  }

  if (error) {
    return (
      <OrganizerLayout>
        <div className="bg-red-500 text-white p-3 rounded-md mb-4">{error}</div>
        <button
          onClick={() => navigate("/organizer/tournaments")}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-300"
        >
          Back to Tournaments
        </button>
      </OrganizerLayout>
    );
  }

  if (!tournament) {
    return (
      <OrganizerLayout>
        <div className="text-center py-12">
          <h2 className="text-xl text-white mb-4">Tournament not found</h2>
          <button
            onClick={() => navigate("/organizer/tournaments")}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
          >
            Back to Tournaments
          </button>
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout>
      <div className="container mx-auto">
        {/* Tournament Header */}
        <TournamentHeader tournament={tournament} handleEdit={handleEdit} />

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Details Tab Content */}
        {activeTab === "details" && (
          <TournamentDetails
            tournament={tournament}
            setShowImageModal={setShowImageModal}
          />
        )}

        {/* Events Tab Content */}
        {activeTab === "events" && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Events</h2>
              <button
                onClick={toggleEventForm}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create New Event
              </button>
            </div>

            {/* Event Creation Form */}
            {showEventForm && (
              <EventForm
                newEvent={newEvent}
                handleEventInputChange={handleEventInputChange}
                handleSubmitEvent={handleSubmitEvent}
                isCreatingEvent={isCreatingEvent}
                eventError={eventError}
                toggleEventForm={toggleEventForm}
                generateFixtures={generateFixtures}
                setShowFixtureModal={setShowFixtureModal}
              />
            )}

            {tournament.events && tournament.events.length > 0 ? (
              <EventsList events={tournament.events} />
            ) : (
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <p className="text-gray-400">
                  No events added to this tournament yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Fixtures Tab Content */}
        {activeTab === "fixtures" && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Fixtures</h2>
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <p className="text-gray-400">
                No fixtures available for this tournament yet.
              </p>
            </div>
          </div>
        )}

        {/* Fixture Generator Modal */}
        {showFixtureModal && fixtureData && (
          <FixtureModal
            fixtureData={fixtureData}
            setShowFixtureModal={setShowFixtureModal}
          />
        )}

        {showImageModal && tournament.posterUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm transition-all duration-300"
            onClick={() => setShowImageModal(false)}
          >
            <div className="relative w-[95vw] h-[95vh] flex items-center justify-center">
              <img
                src={tournament.posterUrl}
                alt={tournament.name}
                className="max-h-[95vh] max-w-[95vw] object-contain"
              />
              <button
                className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-75 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImageModal(false);
                }}
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
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
};

export default TournamentDetail;
