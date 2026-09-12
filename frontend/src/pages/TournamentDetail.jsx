import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrganizerLayout from "../components/OrganizerLayout";
import {
  getTournamentById,
  addEvent,
  updateEvent,
  deleteEvent,
  saveEventFixtures,
  getEventFixtures,
  getAllTournamentEventFixtures,
  assignUmpireToMatch
} from "../services/tournamentService";
import { getOrganizerUmpires } from "../services/authService";
import { getTournamentBookings } from '../services/bookingService';
import FixtureEditor from "../components/tournament/FixtureEditor";
import { toast } from "react-toastify";

// Import modular components
import TournamentHeader from "../components/tournament/TournamentHeader";
import TabNavigation from "../components/tournament/TabNavigation";
import TournamentDetails from "../components/tournament/TournamentDetails";
import EventForm from "../components/tournament/EventForm";
import EventsList from "../components/tournament/EventsList";
import FixtureModal from "../components/tournament/FixtureModal";
import TeamsView from "../components/tournament/TeamsView";
import FranchiseOwnersView from "../components/tournament/FranchiseOwnersView";
import FranchiseFixturesView from '../components/tournament/FranchiseFixturesView';
import ResultsView from '../components/tournament/ResultsView';
import UmpiresView from '../components/tournament/UmpiresView';

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [organizerUmpires, setOrganizerUmpires] = useState([]);

  // Event creation states
  const [showEventForm, setShowEventForm] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventError, setEventError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [showFixtureEditor, setShowFixtureEditor] = useState(false);
  const [selectedFixtureForEdit, setSelectedFixtureForEdit] = useState(null);
  const [currentEventId, setCurrentEventId] = useState(null);
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
  
  // New state variables for fixtures tab
  const [selectedFixtureEventId, setSelectedFixtureEventId] = useState('');
  const [eventFixtures, setEventFixtures] = useState({});
  const [isGeneratingFixtures, setIsGeneratingFixtures] = useState(false);
  const [fixtureError, setFixtureError] = useState('');
  const [showRegenBlockedModal, setShowRegenBlockedModal] = useState(false);
  const [regenBlockedInfo, setRegenBlockedInfo] = useState(null);

  // Helper to determine if any match in a fixture has started scoring or has official results
  const isMatchStartedOrScored = (m) => {
    if (!m) return false;
    if (['In Progress', 'Completed', 'Walkover'].includes(m.status)) return true;
    if (m.winner && typeof m.winner === 'string' && m.winner.trim() !== '') return true;
    if (m.score && typeof m.score === 'string' && m.score.trim() !== '') return true;
    if (Array.isArray(m.setScores) && m.setScores.length > 0) {
      const hasPoints = m.setScores.some(s => 
        (s.team1Score !== undefined && Number(s.team1Score) > 0) || 
        (s.team2Score !== undefined && Number(s.team2Score) > 0)
      );
      if (hasPoints) return true;
    }
    return false;
  };
  
  // New state for franchise fixtures view
  const [showFranchiseFixtures, setShowFranchiseFixtures] = useState(false);

  // Umpire match assignment UI states
  const [assigningMatchId, setAssigningMatchId] = useState(null);
  const [matchRoundFilter, setMatchRoundFilter] = useState('all');
  const [matchUmpireFilter, setMatchUmpireFilter] = useState('all');
  const [matchSearchQuery, setMatchSearchQuery] = useState('');

  const reloadUmpires = async () => {
    try {
      const uRes = await getOrganizerUmpires(id);
      if (uRes?.success) {
        setOrganizerUmpires(uRes.umpires || []);
        toast.info("Umpire list refreshed");
      }
    } catch (err) {
      console.error("Error reloading umpires:", err);
    }
  };

  useEffect(() => {
    const fetchTournamentAndFixtures = async () => {
      try {
        const [tournamentRes, fixturesRes] = await Promise.allSettled([
          getTournamentById(id),
          getAllTournamentEventFixtures(id)
        ]);

        if (tournamentRes.status === 'fulfilled') {
          const tourneyData = tournamentRes.value.data.data;
          setTournament(tourneyData);
          if (tourneyData?.events && tourneyData.events.length > 0) {
            setSelectedFixtureEventId(prev => prev || tourneyData.events[0]._id);
          }
        } else {
          console.error("Error fetching tournament:", tournamentRes.reason);
          setError("Failed to load tournament details");
        }

        if (fixturesRes.status === 'fulfilled' && fixturesRes.value.data?.data) {
          const fixturesMap = {};
          let eventWithFixtures = null;
          fixturesRes.value.data.data.forEach(fixture => {
            fixturesMap[fixture.eventId] = fixture;
            if (!eventWithFixtures && fixture.matches && fixture.matches.length > 0) {
              eventWithFixtures = fixture.eventId;
            }
          });
          setEventFixtures(fixturesMap);
          if (eventWithFixtures) {
            setSelectedFixtureEventId(prev => prev || eventWithFixtures);
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching tournament or fixtures:", err);
        setError("Failed to load tournament details");
        setIsLoading(false);
      }
    };

    const loadUmpires = async () => {
      try {
        const uRes = await getOrganizerUmpires(id);
        if (uRes?.success) {
          setOrganizerUmpires(uRes.umpires || []);
        }
      } catch (err) {
        console.error("Error loading umpires:", err);
      }
    };

    fetchTournamentAndFixtures();
    loadUmpires();
  }, [id]);

  // Handle fixture updates from editor with MongoDB persistence
  const handleFixtureUpdated = async (updatedFixture) => {
    try {
      const saveRes = await saveEventFixtures(id, selectedFixtureEventId, updatedFixture);
      const savedData = saveRes.data?.data || updatedFixture;

      setEventFixtures(prev => ({
        ...prev,
        [selectedFixtureEventId]: savedData
      }));
      setFixtureData(savedData);
      toast.success("Fixture changes saved to database!");
    } catch (err) {
      console.error("Failed to save updated fixture:", err);
      const errMsg = err.response?.data?.message || "Failed to persist fixture update to database";
      toast.error(errMsg);
      throw err;
    }
  };

  // Handle match umpire assignment
  const handleAssignUmpire = async (matchId, umpireId) => {
    try {
      setAssigningMatchId(matchId?.toString());
      const res = await assignUmpireToMatch(id, selectedFixtureEventId, matchId, umpireId || null);
      if (res.data?.success) {
        toast.success(res.data.message);
        setEventFixtures(prev => {
          const cur = prev[selectedFixtureEventId];
          if (!cur || !Array.isArray(cur.matches)) return prev;
          const updatedMatches = cur.matches.map(m => {
            const mId = (m._id || m.matchId)?.toString();
            if (mId === matchId?.toString()) {
              return {
                ...m,
                umpire: res.data.data.umpire,
                umpireName: res.data.data.umpireName,
                status: res.data.data.status
              };
            }
            return m;
          });
          return {
            ...prev,
            [selectedFixtureEventId]: {
              ...cur,
              matches: updatedMatches
            }
          };
        });

        // Keep fixtureData in sync if open in modal
        setFixtureData(prev => {
          if (!prev || !Array.isArray(prev.matches)) return prev;
          const updatedMatches = prev.matches.map(m => {
            const mId = (m._id || m.matchId)?.toString();
            if (mId === matchId?.toString()) {
              return {
                ...m,
                umpire: res.data.data.umpire,
                umpireName: res.data.data.umpireName,
                status: res.data.data.status
              };
            }
            return m;
          });
          return {
            ...prev,
            matches: updatedMatches
          };
        });
      }
    } catch (err) {
      console.error("Error assigning umpire to match:", err);
      toast.error(err.response?.data?.message || "Failed to assign umpire");
    } finally {
      setAssigningMatchId(null);
    }
  };

  // Handle event click for editing
  const handleEventClick = (event) => {
    setIsEditMode(true);
    setCurrentEventId(event._id);
    setNewEvent({
      name: event.name,
      eventType: event.eventType,
      matchType: event.matchType,
      maxParticipants: event.maxParticipants,
      entryFee: event.entryFee,
      discount: event.discount || "0",
      allowBooking: event.allowBooking || false,
    });
    setShowEventForm(true);
  };

  // Handle event update
  const handleUpdateEvent = async (e) => {
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
      const response = await updateEvent(id, currentEventId, newEvent);
      const updatedTournament = response.data.data;

      // Update the tournament state with the updated tournament
      setTournament(updatedTournament);

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
      setIsEditMode(false);
      setCurrentEventId(null);

      // Show success message
      toast.success("Event updated successfully!");
    } catch (err) {
      console.error("Error updating event:", err);
      setEventError(err.response?.data?.message || "Failed to update event");
      toast.error(err.response?.data?.message || "Failed to update event");
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    setIsCreatingEvent(true);

    try {
      await deleteEvent(id, currentEventId);

      // Update the tournament state by removing the deleted event
      setTournament((prev) => ({
        ...prev,
        events: prev.events.filter((event) => event._id !== currentEventId),
      }));

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
      setIsEditMode(false);
      setCurrentEventId(null);

      // Show success message
      toast.success("Event deleted successfully!");
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error(err.response?.data?.message || "Failed to delete event");
    } finally {
      setIsCreatingEvent(false);
    }
  };

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

  // Modify the toggleEventForm function
  const toggleEventForm = () => {
    if (showEventForm && isEditMode) {
      // If closing the form while in edit mode, reset to create mode
      setIsEditMode(false);
      setCurrentEventId(null);
      setNewEvent({
        name: "",
        eventType: "",
        matchType: "",
        maxParticipants: "",
        entryFee: "",
        discount: "0",
        allowBooking: false,
      });
    }
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
    const totalMatches = numTeams - 1;
    const totalRounds = Math.ceil(Math.log2(numTeams));
    const perfectBracketSize = Math.pow(2, totalRounds);
    const totalByes = perfectBracketSize - numTeams;

    const getRoundName = (roundIdx, total) => {
      const roundsFromEnd = total - 1 - roundIdx;
      if (roundsFromEnd === 0) return 'FINAL';
      if (roundsFromEnd === 1) return 'SEMI FINAL';
      if (roundsFromEnd === 2) return 'QUARTER FINAL';
      if (roundsFromEnd === 3) return 'ROUND OF 16';
      if (roundsFromEnd === 4) return 'ROUND OF 32';
      return `ROUND ${roundIdx + 1}`;
    };

    if (totalByes === 0) {
      for (let r = 0; r < totalRounds; r++) {
        const matchesInRound = Math.pow(2, totalRounds - 1 - r);
        rounds.push({
          name: getRoundName(r, totalRounds),
          matches: matchesInRound,
          byes: 0,
          teamsInRound: matchesInRound * 2,
          teamsAdvancing: matchesInRound,
          details: `${matchesInRound * 2} teams → ${matchesInRound} winners advance`,
        });
      }
    } else {
      const numR1Matches = numTeams - Math.pow(2, totalRounds - 1);
      rounds.push({
        name: totalRounds === 2 ? 'ROUND 1' : getRoundName(0, totalRounds),
        matches: numR1Matches,
        byes: totalByes,
        teamsInRound: numR1Matches * 2,
        teamsAdvancing: numR1Matches,
        details: `${numR1Matches * 2} teams compete, ${totalByes} team${totalByes === 1 ? ' gets a bye' : 's get byes'} to next round`,
      });

      for (let r = 1; r < totalRounds; r++) {
        const matchesInRound = Math.pow(2, totalRounds - 1 - r);
        rounds.push({
          name: getRoundName(r, totalRounds),
          matches: matchesInRound,
          byes: 0,
          teamsInRound: matchesInRound * 2,
          teamsAdvancing: matchesInRound,
          details: `${matchesInRound * 2} teams → ${matchesInRound} winners advance`,
        });
      }
    }

    return {
      matchType: "Knockout",
      numTeams,
      totalRounds: rounds.length,
      totalMatches,
      totalByes,
      rounds,
      summary: `${numTeams} teams will compete in ${rounds.length} rounds with ${totalMatches} total matches${totalByes > 0 ? ` (${totalByes} byes)` : ''}`,
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
    const totalRounds = rounds.length;

    return {
      matchType: "Group+Knockout",
      numTeams,
      totalRounds,
      totalMatches,
      rounds,
      summary: `${numTeams} teams in ${numGroups} groups, followed by knockout with ${teamsAdvancing} teams`,
    };
  };

  // Helper function to get event name by ID
  const getEventName = (eventId) => {
    const event = tournament?.events?.find(e => e._id === eventId);
    return event ? event.name : 'Unknown Event';
  };
  
  // Helper function to get event details by ID
  const getEventDetails = (eventId) => {
    const event = tournament?.events?.find(e => e._id === eventId);
    return event ? `${event.matchType} format, Max ${event.maxParticipants} teams` : '';
  };
  
  // Function to fetch team data for a specific event
  const fetchTeamData = async (eventId) => {
    try {
      const response = await getTournamentBookings(id);
      const allBookings = response.data.data;
      
      // Filter bookings by the selected event and confirmed status
      const confirmedTeams = allBookings.filter(
        booking => booking.event === eventId && booking.status === 'Confirmed'
      );
      
      return confirmedTeams;
    } catch (error) {
      console.error('Error fetching team data:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch team data');
    }
  };
  
  // Function to generate fixtures based on real team data with MongoDB-backed scoring protection
  const generateFixturesFromTeams = async (eventId) => {
    setIsGeneratingFixtures(true);
    setFixtureError('');
    
    try {
      // Get the event details
      const event = tournament.events.find(e => e._id === eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Step 1: Strictly check MongoDB database for existing scored/in-progress matches
      try {
        const checkRes = await getEventFixtures(id, eventId);
        const persistedFixture = checkRes.data?.data;
        if (persistedFixture && Array.isArray(persistedFixture.matches) && persistedFixture.matches.length > 0) {
          const startedMatches = persistedFixture.matches.filter(isMatchStartedOrScored);
          if (startedMatches.length > 0 || checkRes.data?.isLocked) {
            const completedCount = startedMatches.filter(m => m.status === 'Completed' || m.status === 'Walkover').length;
            const inProgressCount = startedMatches.filter(m => m.status === 'In Progress').length;

            setRegenBlockedInfo({
              eventName: event.name || persistedFixture.eventName || 'Event',
              totalMatches: persistedFixture.matches.length,
              startedCount: startedMatches.length,
              completedCount,
              inProgressCount
            });
            setShowRegenBlockedModal(true);
            setFixtureError('Fixtures cannot be regenerated because matches have already started. Existing scores and results must be preserved.');
            toast.warn('Fixtures cannot be regenerated because matches have already started. Existing scores and results must be preserved.');
            setIsGeneratingFixtures(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not verify fixture lock status from backend pre-check:', err);
      }
      
      // Fetch team data for the selected event
      const teams = await fetchTeamData(eventId);
      
      // Check if we have enough teams
      if (teams.length < 2) {
        throw new Error('Need at least 2 confirmed teams to generate fixtures');
      }
      
      // Generate fixtures based on match type and number of teams
      let fixtureResult = null;
      
      switch (event.matchType) {
        case 'Knockout':
          fixtureResult = generateKnockoutFixtureWithTeams(teams, event);
          break;
        case 'League':
          fixtureResult = generateLeagueFixtureWithTeams(teams, event);
          break;
        case 'Group+Knockout':
          fixtureResult = generateGroupKnockoutFixtureWithTeams(teams, event);
          break;
        default:
          throw new Error('Unsupported match type');
      }
      
      if (fixtureResult) {
        // Persist generated fixtures to MongoDB backend
        const saveRes = await saveEventFixtures(id, eventId, fixtureResult);
        const persistedFixture = saveRes.data?.data || fixtureResult;

        // Store the generated fixtures for this event
        setEventFixtures(prev => ({
          ...prev,
          [eventId]: persistedFixture
        }));
        
        // Show the fixture modal with persisted data
        setFixtureData(persistedFixture);
        setShowFixtureModal(true);
        toast.success('Fixtures generated and saved to database successfully!');
      }
    } catch (error) {
      console.error('Error generating fixtures:', error);
      const errMsg = error.response?.data?.message || error.message || 'Failed to generate fixtures';
      setFixtureError(errMsg);
      if (error.response?.data?.code === 'FIXTURES_LOCKED_MATCHES_STARTED' || errMsg.includes('already started')) {
        const event = tournament?.events?.find(e => e._id === eventId);
        const curFixture = eventFixtures[eventId];
        const allMatches = curFixture?.matches || [];
        const startedMatches = allMatches.filter(isMatchStartedOrScored);
        setRegenBlockedInfo({
          eventName: event?.name || curFixture?.eventName || 'Event',
          totalMatches: allMatches.length,
          startedCount: startedMatches.length,
          completedCount: startedMatches.filter(m => m.status === 'Completed' || m.status === 'Walkover').length,
          inProgressCount: startedMatches.filter(m => m.status === 'In Progress').length
        });
        setShowRegenBlockedModal(true);
      } else {
        toast.error(errMsg);
      }
    } finally {
      setIsGeneratingFixtures(false);
    }
  };
  
  // Function to view previously generated fixtures
  const viewEventFixtures = (eventId) => {
    if (eventFixtures[eventId]) {
      setFixtureData(eventFixtures[eventId]);
      setShowFixtureModal(true);
    }
  };

  // Add a function to edit fixtures
  const editEventFixtures = (eventId) => {
    const fixture = eventFixtures[eventId];
    if (fixture) {
      const hasStarted = (fixture.matches || []).some(isMatchStartedOrScored);
      if (hasStarted) {
        toast.warn("Matches have already started scoring. Bracket structures are locked to preserve official results.");
      }
      setSelectedFixtureForEdit(fixture);
      setShowFixtureEditor(true);
    }
  };
  
  // Generate knockout fixtures with real team data
  const generateKnockoutFixtureWithTeams = (teams, event) => {
    const n = teams.length;
    if (n < 2) return null;

    const totalMatches = n - 1;
    const totalRounds = Math.ceil(Math.log2(n));
    const perfectBracketSize = Math.pow(2, totalRounds);
    const byes = perfectBracketSize - n;
    const numRound1Matches = n - Math.pow(2, totalRounds - 1);

    const getRoundName = (roundIdx, total) => {
      const roundsFromEnd = total - 1 - roundIdx;
      if (roundsFromEnd === 0) return 'FINAL';
      if (roundsFromEnd === 1) return 'SEMI FINAL';
      if (roundsFromEnd === 2) return 'QUARTER FINAL';
      if (roundsFromEnd === 3) return 'ROUND OF 16';
      if (roundsFromEnd === 4) return 'ROUND OF 32';
      return `ROUND ${roundIdx + 1}`;
    };

    const allMatches = [];
    const rounds = [];
    let globalMatchNumber = 1;

    if (byes === 0) {
      // Exact power of two (2, 4, 8, 16...): NO byes!
      const matchesByRound = [];

      // Round 1
      const r1Name = getRoundName(0, totalRounds);
      const r1MatchCount = n / 2;
      const r1Matches = [];

      for (let i = 0; i < r1MatchCount; i++) {
        const team1 = teams[i * 2];
        const team2 = teams[i * 2 + 1];
        const m = {
          matchNumber: globalMatchNumber++,
          round: r1Name,
          roundIndex: 1,
          team1: team1.playerName,
          team2: team2.playerName,
          player1: { name: team1.playerName, id: team1._id ? team1._id.toString() : null },
          player2: { name: team2.playerName, id: team2._id ? team2._id.toString() : null },
          status: 'Pending',
          score: '',
          winner: null,
          umpire: null,
          umpireName: null,
          court: null,
          scheduledTime: null,
          nextMatchNumber: null,
          nextMatchSlot: null
        };
        r1Matches.push(m);
        allMatches.push(m);
      }
      matchesByRound.push(r1Matches);

      // Subsequent rounds
      for (let r = 1; r < totalRounds; r++) {
        const rName = getRoundName(r, totalRounds);
        const rMatchCount = Math.pow(2, totalRounds - 1 - r);
        const curRMatches = [];

        for (let i = 0; i < rMatchCount; i++) {
          const m = {
            matchNumber: globalMatchNumber++,
            round: rName,
            roundIndex: r + 1,
            team1: 'TBD',
            team2: 'TBD',
            player1: { name: 'TBD', id: null },
            player2: { name: 'TBD', id: null },
            status: 'Pending',
            score: '',
            winner: null,
            umpire: null,
            umpireName: null,
            court: null,
            scheduledTime: null,
            nextMatchNumber: null,
            nextMatchSlot: null
          };
          curRMatches.push(m);
          allMatches.push(m);
        }

        const prevMatches = matchesByRound[r - 1];
        prevMatches.forEach((prevM, pIdx) => {
          const targetMatchIdx = Math.floor(pIdx / 2);
          prevM.nextMatchNumber = curRMatches[targetMatchIdx].matchNumber;
          prevM.nextMatchSlot = (pIdx % 2 === 0) ? 'player1' : 'player2';
        });

        matchesByRound.push(curRMatches);
      }

      matchesByRound.forEach((mList, rIdx) => {
        rounds.push({
          name: getRoundName(rIdx, totalRounds),
          matches: mList.length,
          byes: 0,
          teamsInRound: mList.length * 2,
          details: `${mList.length} match${mList.length === 1 ? '' : 'es'}`,
          matchups: mList
        });
      });

    } else {
      // Non-power of two: Top 'byes' teams get byes into Round 2
      const matchesByRound = [];

      // Round 1
      const r1Name = totalRounds === 2 ? 'ROUND 1' : getRoundName(0, totalRounds);
      const r1Matches = [];

      for (let i = 0; i < numRound1Matches; i++) {
        const team1 = teams[byes + i * 2];
        const team2 = teams[byes + i * 2 + 1];
        const m = {
          matchNumber: globalMatchNumber++,
          round: r1Name,
          roundIndex: 1,
          team1: team1.playerName,
          team2: team2.playerName,
          player1: { name: team1.playerName, id: team1._id ? team1._id.toString() : null },
          player2: { name: team2.playerName, id: team2._id ? team2._id.toString() : null },
          status: 'Pending',
          score: '',
          winner: null,
          umpire: null,
          umpireName: null,
          court: null,
          scheduledTime: null,
          nextMatchNumber: null,
          nextMatchSlot: null
        };
        r1Matches.push(m);
        allMatches.push(m);
      }
      matchesByRound.push(r1Matches);

      // Round 2
      const r2Name = getRoundName(1, totalRounds);
      const r2MatchCount = Math.pow(2, totalRounds - 2);
      const r2Matches = [];
      let byeIdxUsed = 0;

      for (let i = 0; i < r2MatchCount; i++) {
        let p1Name = 'TBD';
        let p1Id = null;
        let p2Name = 'TBD';
        let p2Id = null;

        if (byeIdxUsed < byes) {
          p1Name = teams[byeIdxUsed].playerName;
          p1Id = teams[byeIdxUsed]._id ? teams[byeIdxUsed]._id.toString() : null;
          byeIdxUsed++;
        }

        if (byeIdxUsed < byes) {
          p2Name = teams[byeIdxUsed].playerName;
          p2Id = teams[byeIdxUsed]._id ? teams[byeIdxUsed]._id.toString() : null;
          byeIdxUsed++;
        }

        const m = {
          matchNumber: globalMatchNumber++,
          round: r2Name,
          roundIndex: 2,
          team1: p1Name,
          team2: p2Name,
          player1: { name: p1Name, id: p1Id },
          player2: { name: p2Name, id: p2Id },
          status: 'Pending',
          score: '',
          winner: null,
          umpire: null,
          umpireName: null,
          court: null,
          scheduledTime: null,
          nextMatchNumber: null,
          nextMatchSlot: null
        };
        r2Matches.push(m);
        allMatches.push(m);
      }

      // Link Round 1 winners to Round 2 TBD slots
      r1Matches.forEach((r1M) => {
        for (const r2M of r2Matches) {
          if (r2M.player1.name === 'TBD' && !r1Matches.some(other => other.nextMatchNumber === r2M.matchNumber && other.nextMatchSlot === 'player1')) {
            r1M.nextMatchNumber = r2M.matchNumber;
            r1M.nextMatchSlot = 'player1';
            break;
          } else if (r2M.player2.name === 'TBD' && !r1Matches.some(other => other.nextMatchNumber === r2M.matchNumber && other.nextMatchSlot === 'player2')) {
            r1M.nextMatchNumber = r2M.matchNumber;
            r1M.nextMatchSlot = 'player2';
            break;
          }
        }
      });

      matchesByRound.push(r2Matches);

      // Subsequent rounds from Round 3 onwards
      for (let r = 2; r < totalRounds; r++) {
        const rName = getRoundName(r, totalRounds);
        const rMatchCount = Math.pow(2, totalRounds - 1 - r);
        const curRMatches = [];

        for (let i = 0; i < rMatchCount; i++) {
          const m = {
            matchNumber: globalMatchNumber++,
            round: rName,
            roundIndex: r + 1,
            team1: 'TBD',
            team2: 'TBD',
            player1: { name: 'TBD', id: null },
            player2: { name: 'TBD', id: null },
            status: 'Pending',
            score: '',
            winner: null,
            umpire: null,
            umpireName: null,
            court: null,
            scheduledTime: null,
            nextMatchNumber: null,
            nextMatchSlot: null
          };
          curRMatches.push(m);
          allMatches.push(m);
        }

        const prevMatches = matchesByRound[r - 1];
        prevMatches.forEach((prevM, pIdx) => {
          const targetMatchIdx = Math.floor(pIdx / 2);
          prevM.nextMatchNumber = curRMatches[targetMatchIdx].matchNumber;
          prevM.nextMatchSlot = (pIdx % 2 === 0) ? 'player1' : 'player2';
        });

        matchesByRound.push(curRMatches);
      }

      matchesByRound.forEach((mList, rIdx) => {
        rounds.push({
          name: rIdx === 0 && totalRounds === 2 ? 'ROUND 1' : getRoundName(rIdx, totalRounds),
          matches: mList.length,
          byes: rIdx === 0 ? byes : 0,
          teamsInRound: rIdx === 0 ? numRound1Matches * 2 : mList.length * 2,
          details: rIdx === 0
            ? `${mList.length} match${mList.length === 1 ? '' : 'es'}, ${byes} team${byes === 1 ? ' gets a bye' : 's get byes'}`
            : `${mList.length} match${mList.length === 1 ? '' : 'es'}`,
          matchups: mList
        });
      });
    }

    return {
      matchType: 'Knockout',
      numTeams: n,
      totalRounds: rounds.length,
      totalMatches,
      totalByes: byes,
      matches: allMatches,
      rounds,
      summary: `${n} teams will compete in ${rounds.length} rounds with ${totalMatches} total matches${byes > 0 ? ` (${byes} byes)` : ''}`,
      eventName: event.name,
    };
  };
  
  // Generate league fixtures with real team data
  const generateLeagueFixtureWithTeams = (teams, event) => {
    const n = teams.length;
    if (n < 2) return null;

    const rounds = [];
    const allMatches = [];
    const totalMatches = (n * (n - 1)) / 2;
    const totalRounds = n % 2 === 0 ? n - 1 : n;
    let globalMatchNumber = 1;

    if (n % 2 === 1) {
      // Odd number of teams: n rounds, 1 bye per round, (n - 1) / 2 matches per round
      // For n = 3 (Team A, Team B, Team C):
      // Round 1 (Team C has bye): Match 1: Team A vs Team B
      // Round 2 (Team B has bye): Match 2: Team A vs Team C
      // Round 3 (Team A has bye): Match 3: Team B vs Team C
      for (let r = 0; r < totalRounds; r++) {
        const byeIdx = n - 1 - r;
        const byeTeam = teams[byeIdx];
        const roundMatchups = [];

        for (let k = 1; k <= (n - 1) / 2; k++) {
          const t1Idx = (byeIdx - k + n) % n;
          const t2Idx = (byeIdx + k) % n;
          const firstIdx = Math.min(t1Idx, t2Idx);
          const secondIdx = Math.max(t1Idx, t2Idx);

          const team1 = teams[firstIdx];
          const team2 = teams[secondIdx];

          const matchObj = {
            matchNumber: globalMatchNumber++,
            round: `ROUND ${r + 1}`,
            roundIndex: r + 1,
            team1: team1.playerName,
            team2: team2.playerName,
            player1: { name: team1.playerName, id: team1._id ? team1._id.toString() : null },
            player2: { name: team2.playerName, id: team2._id ? team2._id.toString() : null },
            score: '',
            status: 'Pending',
            winner: null,
            umpire: null,
            umpireName: null,
            court: null,
            scheduledTime: null
          };

          roundMatchups.push(matchObj);
          allMatches.push(matchObj);
        }

        rounds.push({
          name: `ROUND ${r + 1}`,
          matches: roundMatchups.length,
          byes: 1,
          teamsInRound: n,
          details: `${roundMatchups.length} match${roundMatchups.length === 1 ? '' : 'es'}, ${byeTeam.playerName} gets a bye`,
          matchups: roundMatchups
        });
      }
    } else {
      // Even number of teams: n - 1 rounds, 0 byes, n / 2 matches per round
      for (let r = 0; r < totalRounds; r++) {
        const roundMatchups = [];
        const partnerIdx = 1 + r;

        // Match with fixed team 0
        const m1 = {
          matchNumber: globalMatchNumber++,
          round: `ROUND ${r + 1}`,
          roundIndex: r + 1,
          team1: teams[0].playerName,
          team2: teams[partnerIdx].playerName,
          player1: { name: teams[0].playerName, id: teams[0]._id ? teams[0]._id.toString() : null },
          player2: { name: teams[partnerIdx].playerName, id: teams[partnerIdx]._id ? teams[partnerIdx]._id.toString() : null },
          score: '',
          status: 'Pending',
          winner: null,
          umpire: null,
          umpireName: null,
          court: null,
          scheduledTime: null
        };
        roundMatchups.push(m1);
        allMatches.push(m1);

        for (let k = 1; k <= (n - 2) / 2; k++) {
          const t1 = 1 + ((r - k + (n - 1)) % (n - 1));
          const t2 = 1 + ((r + k) % (n - 1));
          const firstIdx = Math.min(t1, t2);
          const secondIdx = Math.max(t1, t2);

          const team1 = teams[firstIdx];
          const team2 = teams[secondIdx];

          const matchObj = {
            matchNumber: globalMatchNumber++,
            round: `ROUND ${r + 1}`,
            roundIndex: r + 1,
            team1: team1.playerName,
            team2: team2.playerName,
            player1: { name: team1.playerName, id: team1._id ? team1._id.toString() : null },
            player2: { name: team2.playerName, id: team2._id ? team2._id.toString() : null },
            score: '',
            status: 'Pending',
            winner: null,
            umpire: null,
            umpireName: null,
            court: null,
            scheduledTime: null
          };

          roundMatchups.push(matchObj);
          allMatches.push(matchObj);
        }

        rounds.push({
          name: `ROUND ${r + 1}`,
          matches: roundMatchups.length,
          byes: 0,
          teamsInRound: n,
          details: `${roundMatchups.length} matches`,
          matchups: roundMatchups
        });
      }
    }

    return {
      matchType: 'League',
      numTeams: n,
      totalRounds,
      totalMatches,
      matches: allMatches,
      rounds,
      pointsSystem: {
        win: 3,
        draw: 1,
        loss: 0,
      },
      summary: `Each team plays ${n - 1} matches. Total ${totalMatches} matches over ${totalRounds} rounds`,
      eventName: event.name
    };
  };
  
  // Generate group+knockout fixtures with real team data
  const generateGroupKnockoutFixtureWithTeams = (teams, event) => {
    const rounds = [];
    
    const { numGroups, groupSizes } = optimizeGroups(teams.length);
    
    // Distribute teams into groups
    const groups = Array.from({ length: numGroups }, () => []);
    let teamIndex = 0;
    
    for (let i = 0; i < numGroups; i++) {
      for (let j = 0; j < groupSizes[i]; j++) {
        if (teamIndex < teams.length) {
          groups[i].push(teams[teamIndex]);
          teamIndex++;
        }
      }
    }
    
    // Group Stage Calculations
    let maxGroupSize = Math.max(...groupSizes);
    let groupStageRounds = maxGroupSize - 1;
    let totalGroupMatches = 0;
    
    // Calculate total group stage matches and create group fixtures
    const groupFixtures = [];
    
    groups.forEach((group, groupIndex) => {
      const groupMatches = (group.length * (group.length - 1)) / 2;
      totalGroupMatches += groupMatches;
      
      // Create round-robin fixtures for this group
      const groupSchedule = [];
      const groupTeamIds = group.map(team => team._id);
      
      if (group.length % 2 === 1) {
        // Add a dummy team for bye if odd number of teams
        groupTeamIds.push('bye');
      }
      
      const halfSize = groupTeamIds.length / 2;
      
      // Generate rounds for this group
      for (let round = 0; round < groupTeamIds.length - 1; round++) {
        const roundMatches = [];
        
        for (let match = 0; match < halfSize; match++) {
          const home = match;
          const away = groupTeamIds.length - 1 - match;
          
          // Skip matches with the dummy team (bye)
          if (groupTeamIds[home] !== 'bye' && groupTeamIds[away] !== 'bye') {
            const homeTeam = group.find(team => team._id === groupTeamIds[home]);
            const awayTeam = group.find(team => team._id === groupTeamIds[away]);
            
            roundMatches.push({
              matchNumber: roundMatches.length + 1,
              round: `Group Stage - Round ${round + 1}`,
              roundIndex: round + 1,
              team1: homeTeam.playerName,
              team2: awayTeam.playerName,
              player1: { name: homeTeam.playerName, id: homeTeam._id ? homeTeam._id.toString() : null },
              player2: { name: awayTeam.playerName, id: awayTeam._id ? awayTeam._id.toString() : null },
              score: '',
              status: 'Pending',
              group: `Group ${String.fromCharCode(65 + groupIndex)}` // A, B, C, etc.
            });
          }
        }
        
        if (roundMatches.length > 0) {
          groupSchedule.push({
            round: round + 1,
            matches: roundMatches
          });
        }
        
        // Rotate teams for next round (first team stays fixed)
        groupTeamIds.splice(1, 0, groupTeamIds.pop());
      }
      
      groupFixtures.push({
        groupName: `Group ${String.fromCharCode(65 + groupIndex)}`,
        teams: group.map(team => team.playerName),
        schedule: groupSchedule
      });
    });
    
    // Generate group stage rounds
    for (let i = 1; i <= groupStageRounds; i++) {
      // Count matches in this round across all groups
      let matchesInRound = 0;
      const roundMatchups = [];
      
      groupFixtures.forEach(group => {
        const roundSchedule = group.schedule.find(r => r.round === i);
        if (roundSchedule) {
          matchesInRound += roundSchedule.matches.length;
          roundMatchups.push(...roundSchedule.matches);
        }
      });
      
      if (matchesInRound > 0) {
        rounds.push({
          name: `GROUP STAGE - ROUND ${i}`,
          matches: matchesInRound,
          byes: 0,
          stage: 'Group',
          groups: numGroups,
          details: `${numGroups} groups playing simultaneously`,
          matchups: roundMatchups
        });
      }
    }
    
    // Knockout stage - top 2 from each group
    const teamsAdvancing = numGroups * 2;
    const knockoutRounds = Math.ceil(Math.log2(teamsAdvancing));
    let knockoutMatches = teamsAdvancing - 1;
    let remainingTeams = teamsAdvancing;
    
    // Generate knockout rounds
    for (let i = 1; i <= knockoutRounds; i++) {
      const matchesInRound = remainingTeams / 2;
      
      let roundName = '';
      if (i === knockoutRounds) {
        roundName = 'FINAL';
      } else if (i === knockoutRounds - 1) {
        roundName = 'SEMI FINAL';
      } else if (i === knockoutRounds - 2) {
        roundName = 'QUARTER FINAL';
      } else {
        roundName = `KNOCKOUT ROUND ${i}`;
      }
      
      // Generate placeholder matchups for knockout stage
      const knockoutMatchups = [];
      
      if (i === 1) {
        // First knockout round uses group winners/runners-up
        for (let j = 0; j < matchesInRound; j++) {
          const p1 = `Winner Group ${String.fromCharCode(65 + j)}`;
          const p2 = `Runner-up Group ${String.fromCharCode(65 + ((numGroups - 1) - j))}`;
          knockoutMatchups.push({
            matchNumber: j + 1,
            round: roundName,
            roundIndex: i,
            team1: p1,
            team2: p2,
            player1: { name: p1, id: null },
            player2: { name: p2, id: null },
            score: '',
            status: 'Pending'
          });
        }
      } else {
        // Later rounds use winners from previous rounds
        for (let j = 0; j < matchesInRound; j++) {
          const p1 = `Winner of Match ${(i-1)*matchesInRound*2 + j*2 + 1}`;
          const p2 = `Winner of Match ${(i-1)*matchesInRound*2 + j*2 + 2}`;
          knockoutMatchups.push({
            matchNumber: j + 1,
            round: roundName,
            roundIndex: i,
            team1: p1,
            team2: p2,
            player1: { name: p1, id: null },
            player2: { name: p2, id: null },
            score: '',
            status: 'Pending'
          });
        }
      }
      
      rounds.push({
        name: roundName,
        matches: matchesInRound,
        byes: 0,
        stage: 'Knockout',
        details: `${remainingTeams} teams → ${matchesInRound} winners advance`,
        matchups: knockoutMatchups
      });
      
      remainingTeams = matchesInRound;
    }
    
    // Flatten all matches across group and knockout rounds with sequential match numbers
    const allMatches = [];
    rounds.forEach(r => {
      if (Array.isArray(r.matchups)) {
        allMatches.push(...r.matchups);
      }
    });
    allMatches.forEach((m, idx) => {
      m.matchNumber = idx + 1;
    });

    const totalMatches = allMatches.length;
    const totalRounds = rounds.length;
    
    return {
      matchType: 'Group+Knockout',
      numTeams: teams.length,
      totalRounds,
      totalMatches,
      matches: allMatches,
      rounds,
      groupFixtures,
      summary: `${teams.length} teams in ${numGroups} groups, followed by knockout with ${teamsAdvancing} teams`,
      eventName: event.name
    };
  };

  // Submit new event
  const handleSubmitEvent = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (isEditMode) {
      handleUpdateEvent(e);
      return; // Add this return statement to prevent continuing execution
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

  // Toggle between fixture generation and franchise fixtures view
  const toggleFranchiseFixtures = () => {
    setShowFranchiseFixtures(!showFranchiseFixtures);
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
      <div className="container mx-auto max-w-full min-w-0">
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

{activeTab === "franchiseOwners" && (
  <FranchiseOwnersView tournamentId={id} events={tournament.events} />
)}

        {/* Events Tab Content */}
        {activeTab === "events" && (
          <div className="mb-6">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
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
                event={newEvent}
                handleEventInputChange={handleEventInputChange}
                handleSubmitEvent={handleSubmitEvent}
                isProcessing={isCreatingEvent}
                eventError={eventError}
                toggleEventForm={toggleEventForm}
                generateFixtures={generateFixtures}
                setShowFixtureModal={setShowFixtureModal}
                isEditMode={isEditMode}
                handleDeleteEvent={handleDeleteEvent}
              />
            )}

            {tournament.events && tournament.events.length > 0 ? (
              <EventsList
                events={tournament.events}
                onEventClick={handleEventClick}
              />
            ) : (
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <p className="text-gray-400">
                  No events added to this tournament yet.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "teams" && tournament && (
          <TeamsView tournamentId={id} events={tournament.events || []} />
        )}

        {/* Fixtures Tab Content */}
        {activeTab === "fixtures" && (
          <div className="mb-6">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span>🏸</span>
                  <span>Tournament Fixtures & Umpire Assignments</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Manage event fixtures, view tournament brackets, and assign court umpires to individual matches.
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Toggle button for franchise fixtures view */}
                <button
                  onClick={toggleFranchiseFixtures}
                  className={`${showFranchiseFixtures ? 'bg-red-600' : 'bg-gray-700'} hover:bg-red-700 text-white font-medium text-xs sm:text-sm py-2 px-3.5 rounded-lg transition duration-300`}
                >
                  {showFranchiseFixtures ? 'Show Standard Fixtures' : 'Manage Franchise Teams'}
                </button>
              </div>
            </div>

            {/* Franchise Fixtures View */}
            {showFranchiseFixtures ? (
              <FranchiseFixturesView tournamentId={id} events={tournament.events || []} />
            ) : (
              <div className="space-y-5">
                {/* Event Selector Pill Bar */}
                {tournament.events && tournament.events.length > 0 && (
                  <div className="bg-gray-800/90 border border-gray-700 rounded-xl p-3 shadow-md">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center justify-between">
                      <span>Select Tournament Event:</span>
                      <span className="text-[11px] text-gray-500 font-normal">
                        {tournament.events.length} Event{tournament.events.length !== 1 ? 's' : ''} Configured
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tournament.events.map(event => {
                        const isSelected = selectedFixtureEventId === event._id;
                        const hasFixtures = !!eventFixtures[event._id];
                        const matchCount = eventFixtures[event._id]?.matches?.length || 0;
                        return (
                          <button
                            key={event._id}
                            onClick={() => setSelectedFixtureEventId(event._id)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-2 border ${
                              isSelected
                                ? 'bg-red-600 text-white border-red-500 shadow-md ring-2 ring-red-500/30'
                                : 'bg-gray-900/80 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white'
                            }`}
                          >
                            <span>{event.name}</span>
                            <span className="text-[11px] opacity-75">({event.eventType} • {event.matchType})</span>
                            {hasFixtures ? (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}>
                                ✓ {matchCount} {matchCount === 1 ? 'Match' : 'Matches'}
                              </span>
                            ) : (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                                isSelected ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-400'
                              }`}>
                                No Fixtures
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected Event Details & Match List */}
                {selectedFixtureEventId ? (
                  <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 shadow-md">
                    {/* Event Header Banner */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-gray-700">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-bold text-white">
                            {getEventName(selectedFixtureEventId)}
                          </h3>
                          {eventFixtures[selectedFixtureEventId] && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                              ✓ Fixtures Live
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {getEventDetails(selectedFixtureEventId)}
                        </p>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {eventFixtures[selectedFixtureEventId] && (
                          <>
                            <button
                              onClick={() => viewEventFixtures(selectedFixtureEventId)}
                              className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 px-3.5 rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
                            >
                              <span>🏆</span>
                              <span>View Progression Bracket</span>
                            </button>
                            <button
                              onClick={() => editEventFixtures(selectedFixtureEventId)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3.5 rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm"
                            >
                              <span>✏️</span>
                              <span>Edit Fixtures / Swaps</span>
                            </button>
                          </>
                        )}

                        {(() => {
                          const curFix = eventFixtures[selectedFixtureEventId];
                          const hasScoredMatches = (curFix?.matches || []).some(isMatchStartedOrScored);
                          return (
                            <button
                              onClick={() => generateFixturesFromTeams(selectedFixtureEventId)}
                              className={`text-white text-xs font-bold py-2 px-3.5 rounded-lg transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50 ${
                                hasScoredMatches
                                  ? 'bg-amber-700/80 hover:bg-amber-600 border border-amber-500/40'
                                  : 'bg-red-600 hover:bg-red-700'
                              }`}
                              disabled={isGeneratingFixtures}
                              title={
                                hasScoredMatches
                                  ? 'Matches have already started scoring. Fixtures are locked to protect official results.'
                                  : curFix
                                  ? 'Regenerate event fixtures'
                                  : 'Generate event fixtures'
                              }
                            >
                              {isGeneratingFixtures ? (
                                <>
                                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                                  <span>Checking Database...</span>
                                </>
                              ) : hasScoredMatches ? (
                                <>
                                  <span>🔒</span>
                                  <span>Regenerate Fixtures (Locked)</span>
                                </>
                              ) : (
                                <>
                                  <span>⚙️</span>
                                  <span>{curFix ? 'Regenerate Fixtures' : 'Generate Fixtures'}</span>
                                </>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    </div>

                    {fixtureError && (
                      <div className="bg-red-950/80 border border-red-800 text-red-300 p-3 rounded-xl mt-4 text-xs flex items-center space-x-2">
                        <span>⚠️</span>
                        <span>{fixtureError}</span>
                      </div>
                    )}

                    {/* Main Content Area */}
                    {eventFixtures[selectedFixtureEventId] ? (
                      (() => {
                        const currentFixture = eventFixtures[selectedFixtureEventId];
                        const allMatches = currentFixture?.matches || [];
                        const totalCount = allMatches.length;
                        const assignedCount = allMatches.filter(m => m.umpire).length;
                        const unassignedCount = allMatches.filter(m => !m.umpire).length;
                        const completedCount = allMatches.filter(m => m.status === 'Completed' || m.status === 'Walkover').length;
                        const liveCount = allMatches.filter(m => m.status === 'In Progress').length;

                        // Extract unique round names
                        const availableRounds = Array.from(new Set(allMatches.map(m => m.round).filter(Boolean)));

                        // Filter matches
                        const filteredMatches = allMatches.filter(m => {
                          if (matchRoundFilter !== 'all' && m.round !== matchRoundFilter) return false;
                          if (matchUmpireFilter === 'unassigned' && m.umpire) return false;
                          if (matchUmpireFilter === 'assigned' && !m.umpire) return false;
                          if (matchUmpireFilter === 'completed' && m.status !== 'Completed' && m.status !== 'Walkover') return false;
                          if (matchSearchQuery.trim()) {
                            const q = matchSearchQuery.toLowerCase().trim();
                            const p1 = (m.player1?.name || m.team1 || '').toLowerCase();
                            const p2 = (m.player2?.name || m.team2 || '').toLowerCase();
                            const uName = (m.umpireName || '').toLowerCase();
                            const rName = (m.round || '').toLowerCase();
                            const matchNum = `match ${m.matchNumber || ''}`.toLowerCase();
                            if (!p1.includes(q) && !p2.includes(q) && !uName.includes(q) && !rName.includes(q) && !matchNum.includes(q)) {
                              return false;
                            }
                          }
                          return true;
                        });

                        return (
                          <div className="mt-5 space-y-5">
                            {/* Summary Stat Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="bg-gray-900/80 border border-gray-700/80 rounded-xl p-3 text-center">
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                                  Total Matches
                                </span>
                                <span className="text-xl font-extrabold text-white">{totalCount}</span>
                              </div>

                              <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3 text-center">
                                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                                  Assigned Umpires
                                </span>
                                <span className="text-xl font-extrabold text-emerald-300">
                                  {assignedCount} <span className="text-xs text-emerald-500/80 font-normal">({totalCount > 0 ? Math.round((assignedCount / totalCount) * 100) : 0}%)</span>
                                </span>
                              </div>

                              <div className={`rounded-xl p-3 text-center border ${
                                unassignedCount > 0
                                  ? 'bg-amber-950/30 border-amber-800/50 text-amber-300'
                                  : 'bg-gray-900/80 border-gray-700/80 text-gray-400'
                              }`}>
                                <span className="text-[11px] font-semibold uppercase tracking-wider block mb-1">
                                  Unassigned
                                </span>
                                <span className="text-xl font-extrabold">
                                  {unassignedCount}
                                </span>
                              </div>

                              <div className="bg-gray-900/80 border border-gray-700/80 rounded-xl p-3 text-center">
                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                                  Completed / Live
                                </span>
                                <span className="text-xl font-extrabold text-white">
                                  {completedCount} <span className="text-xs text-amber-400 font-normal">{liveCount > 0 ? `(${liveCount} live)` : ''}</span>
                                </span>
                              </div>
                            </div>

                            {/* Umpire Accounts Notice if 0 accounts created */}
                            {organizerUmpires.length === 0 && (
                              <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-amber-300">
                                <div className="flex items-center space-x-2">
                                  <span className="text-base">⚠️</span>
                                  <span>No umpire accounts found. Create court officials in the <strong>Umpires</strong> tab so they appear in match dropdowns.</span>
                                </div>
                                <button
                                  onClick={() => setActiveTab('umpires')}
                                  className="bg-amber-600 hover:bg-amber-500 text-gray-950 font-bold py-1.5 px-3 rounded-lg whitespace-nowrap text-xs"
                                >
                                  Go to Umpires Tab →
                                </button>
                              </div>
                            )}

                            {/* Filter and Search Toolbar */}
                            <div className="bg-gray-900/90 border border-gray-700 rounded-xl p-3.5 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Round Filter */}
                                <div className="flex items-center space-x-1.5">
                                  <label className="text-xs text-gray-400 whitespace-nowrap">Round:</label>
                                  <select
                                    value={matchRoundFilter}
                                    onChange={(e) => setMatchRoundFilter(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                                  >
                                    <option value="all">All Rounds ({totalCount})</option>
                                    {availableRounds.map((rnd, idx) => (
                                      <option key={idx} value={rnd}>
                                        {rnd} ({allMatches.filter(m => m.round === rnd).length})
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Umpire Filter */}
                                <div className="flex items-center space-x-1.5">
                                  <label className="text-xs text-gray-400 whitespace-nowrap">Umpire:</label>
                                  <select
                                    value={matchUmpireFilter}
                                    onChange={(e) => setMatchUmpireFilter(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                                  >
                                    <option value="all">All ({totalCount})</option>
                                    <option value="unassigned">⚠️ Unassigned ({unassignedCount})</option>
                                    <option value="assigned">✓ Assigned ({assignedCount})</option>
                                    <option value="completed">Completed ({completedCount})</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex items-center space-x-2">
                                {/* Search input */}
                                <div className="relative flex-1 sm:w-60">
                                  <input
                                    type="text"
                                    value={matchSearchQuery}
                                    onChange={(e) => setMatchSearchQuery(e.target.value)}
                                    placeholder="Search players or match..."
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 placeholder-gray-500"
                                  />
                                  <span className="absolute left-2.5 top-2 text-xs text-gray-500">🔍</span>
                                  {matchSearchQuery && (
                                    <button
                                      onClick={() => setMatchSearchQuery('')}
                                      className="absolute right-2.5 top-1.5 text-xs text-gray-400 hover:text-white"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>

                                {/* Refresh Umpires button */}
                                <button
                                  onClick={reloadUmpires}
                                  title="Sync latest umpire accounts from database"
                                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 rounded-lg p-2 text-xs transition-colors flex items-center space-x-1"
                                >
                                  <span>↻</span>
                                  <span className="hidden sm:inline">Umpires</span>
                                </button>
                              </div>
                            </div>

                            {/* Match List Header */}
                            <div className="flex justify-between items-center px-1">
                              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                                <span>🏸</span>
                                <span>Individual Match Schedule & Umpire Assignments</span>
                                <span className="text-xs text-gray-400 font-normal">
                                  ({filteredMatches.length} {filteredMatches.length === 1 ? 'match' : 'matches'} shown)
                                </span>
                              </h4>

                              {(matchRoundFilter !== 'all' || matchUmpireFilter !== 'all' || matchSearchQuery) && (
                                <button
                                  onClick={() => {
                                    setMatchRoundFilter('all');
                                    setMatchUmpireFilter('all');
                                    setMatchSearchQuery('');
                                  }}
                                  className="text-xs text-red-400 hover:text-red-300 font-semibold"
                                >
                                  Reset Filters
                                </button>
                              )}
                            </div>

                            {/* Match Cards List */}
                            {filteredMatches.length === 0 ? (
                              <div className="bg-gray-900/60 border border-gray-700/60 rounded-xl py-12 text-center text-gray-400">
                                <p className="text-sm font-bold text-white">No matches found</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  No matches meet the current filter criteria.
                                </p>
                                <button
                                  onClick={() => {
                                    setMatchRoundFilter('all');
                                    setMatchUmpireFilter('all');
                                    setMatchSearchQuery('');
                                  }}
                                  className="mt-3 text-xs text-red-400 hover:text-red-300 font-bold"
                                >
                                  Clear All Filters
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {filteredMatches.map((m, idx) => {
                                  const mId = m._id || m.matchId;
                                  const isAssigned = !!m.umpire;
                                  const isSaving = assigningMatchId === (mId?.toString());
                                  const isCompleted = m.status === 'Completed' || m.status === 'Walkover';
                                  const winnerName = m.winner;
                                  const isP1Winner = winnerName && winnerName === (m.player1?.name || m.team1);
                                  const isP2Winner = winnerName && winnerName === (m.player2?.name || m.team2);

                                  return (
                                    <div
                                      key={mId || idx}
                                      className={`bg-gray-900/90 border rounded-xl p-4 shadow-sm transition-all ${
                                        isAssigned
                                          ? 'border-gray-700/80 hover:border-gray-600'
                                          : 'border-amber-900/40 hover:border-amber-700/60'
                                      }`}
                                    >
                                      {/* Top Row: Round badge, Match #, Schedule Time, Court, Status */}
                                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-2.5 mb-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold uppercase tracking-wide">
                                            {m.round || `Round ${m.roundIndex || 1}`}
                                          </span>
                                          <span className="text-xs font-bold text-gray-300">
                                            Match #{m.matchNumber || idx + 1}
                                          </span>
                                          {m.scheduledTime ? (
                                            <span className="text-xs text-gray-400 flex items-center space-x-1">
                                              <span>🕒</span>
                                              <span>{new Date(m.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </span>
                                          ) : (
                                            <span className="text-xs text-gray-500">
                                              🕒 Unscheduled
                                            </span>
                                          )}
                                          {m.court ? (
                                            <span className="text-xs text-teal-400 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-800/40">
                                              🏸 {m.court}
                                            </span>
                                          ) : (
                                            <span className="text-xs text-gray-500">
                                              Court Unassigned
                                            </span>
                                          )}
                                        </div>

                                        <div>
                                          <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${
                                            m.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                            m.status === 'In Progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' :
                                            m.status === 'Scheduled' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                            m.status === 'Walkover' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                            'bg-gray-800 text-gray-400 border border-gray-700'
                                          }`}>
                                            {m.status || 'Pending'}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Main Content: Player 1 vs Player 2 & Independent Umpire Dropdown */}
                                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                                        {/* Matchup */}
                                        <div className="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                          {/* Player 1 */}
                                          <div className={`flex-1 w-full p-2.5 rounded-lg border ${
                                            isP1Winner
                                              ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-300'
                                              : 'bg-gray-800/80 border-gray-700/70 text-white'
                                          }`}>
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm font-bold truncate">
                                                {m.player1?.name || m.team1 || 'TBD (To Be Decided)'}
                                              </span>
                                              {isP1Winner && (
                                                <span className="text-xs font-black text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded ml-2 whitespace-nowrap">
                                                  🏆 Winner
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          <div className="self-center text-xs font-black text-gray-500 uppercase px-1">
                                            vs
                                          </div>

                                          {/* Player 2 */}
                                          <div className={`flex-1 w-full p-2.5 rounded-lg border ${
                                            isP2Winner
                                              ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-300'
                                              : 'bg-gray-800/80 border-gray-700/70 text-white'
                                          }`}>
                                            <div className="flex justify-between items-center">
                                              <span className="text-sm font-bold truncate">
                                                {m.player2?.name || m.team2 || 'TBD (To Be Decided)'}
                                              </span>
                                              {isP2Winner && (
                                                <span className="text-xs font-black text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded ml-2 whitespace-nowrap">
                                                  🏆 Winner
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {/* Score display if completed */}
                                          {m.score && (
                                            <div className="sm:ml-2 w-full sm:w-auto font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-2 rounded-lg whitespace-nowrap text-center">
                                              {m.score}
                                            </div>
                                          )}
                                        </div>

                                        {/* Independent Umpire Assignment Dropdown for THIS match */}
                                        <div className="lg:col-span-5 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-end gap-2.5">
                                          <div className="flex flex-col">
                                            <span className="text-[11px] font-medium text-gray-400">
                                              Current Umpire:
                                            </span>
                                            {m.umpireName ? (
                                              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                                                <span>✓</span>
                                                <span className="truncate max-w-[130px]">{m.umpireName}</span>
                                              </span>
                                            ) : (
                                              <span className="text-xs font-semibold text-amber-400 flex items-center space-x-1">
                                                <span>⚠️</span>
                                                <span>Unassigned</span>
                                              </span>
                                            )}
                                          </div>

                                          <div className="relative w-full sm:w-56">
                                            <select
                                              disabled={isCompleted || isSaving}
                                              value={m.umpire?._id || m.umpire || ''}
                                              onChange={(e) => handleAssignUmpire(mId, e.target.value)}
                                              className={`w-full text-xs rounded-xl px-3 py-2.5 border font-semibold focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                                                isAssigned
                                                  ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-300 focus:ring-emerald-500'
                                                  : 'bg-gray-800 border-gray-600 text-gray-200 focus:ring-red-500'
                                              }`}
                                            >
                                              <option value="">-- Unassigned --</option>
                                              {organizerUmpires.map((u) => (
                                                <option key={u._id} value={u._id}>
                                                  🏸 {u.name} ({u.email})
                                                </option>
                                              ))}
                                            </select>
                                            {isSaving && (
                                              <div className="absolute right-3 top-3">
                                                <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-gray-400 text-center py-12">
                        <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-3 text-2xl">
                          🏸
                        </div>
                        <p className="text-base font-bold text-white">No Fixtures Generated Yet</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                          Click the "Generate Fixtures" button above to create match brackets and begin assigning court umpires.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
                    <p className="text-gray-400">
                      Please select an event to generate or view fixtures.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* Results Tab Content */}
        {activeTab === "results" && (
          <ResultsView tournamentId={id} events={tournament.events || []} />
        )}

        {/* Umpires Tab Content */}
        {activeTab === "umpires" && (
          <UmpiresView tournamentId={id} />
        )}

        {/* Cannot Regenerate Fixtures Warning Modal */}
        {showRegenBlockedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-amber-600/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-white animate-slideIn">
              <div className="flex items-start justify-between border-b border-gray-700/80 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
                    🔒
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white tracking-tight">Cannot Regenerate Fixtures</h3>
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                      {regenBlockedInfo?.eventName || 'Official Tournament Event'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRegenBlockedModal(false)}
                  className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 space-y-2">
                <p className="text-sm font-bold text-amber-200">
                  Fixtures cannot be regenerated because matches have already started. Existing scores and results must be preserved.
                </p>
                <p className="text-xs text-amber-300/80 leading-relaxed">
                  One or more matches have already started or been completed. Regenerating fixtures could remove official scores and results. Existing fixtures will be preserved.
                </p>
              </div>

              {regenBlockedInfo && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-gray-900/80 border border-gray-700/80 rounded-xl p-2.5">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Matches</span>
                    <span className="text-base font-extrabold text-white">{regenBlockedInfo.totalMatches || 0}</span>
                  </div>
                  <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-2.5">
                    <span className="text-emerald-400 block text-[10px] uppercase font-bold">Completed</span>
                    <span className="text-base font-extrabold text-emerald-300">{regenBlockedInfo.completedCount || 0}</span>
                  </div>
                  <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-2.5">
                    <span className="text-blue-400 block text-[10px] uppercase font-bold">In Progress</span>
                    <span className="text-base font-extrabold text-blue-300">{regenBlockedInfo.inProgressCount || 0}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegenBlockedModal(false);
                    setActiveTab("results");
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                  View Tournament Results
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegenBlockedModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-lg shadow-emerald-900/30"
                >
                  Keep Existing Fixtures
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fixture Editor Modal */}
{showFixtureEditor && selectedFixtureForEdit && (
  <FixtureEditor
    fixtureData={selectedFixtureForEdit}
    tournamentId={id}
    eventId={selectedFixtureEventId}
    onClose={() => setShowFixtureEditor(false)}
    onFixtureUpdated={handleFixtureUpdated}
  />
)}

        {/* Fixture Generator Modal */}
        {showFixtureModal && fixtureData && (
          <FixtureModal
            fixtureData={fixtureData}
            setShowFixtureModal={setShowFixtureModal}
            organizerUmpires={organizerUmpires}
            onAssignUmpire={handleAssignUmpire}
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