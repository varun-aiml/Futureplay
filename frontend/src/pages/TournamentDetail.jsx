import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrganizerLayout from "../components/OrganizerLayout";
import { getTournamentById, addEvent } from "../services/tournamentService";
import { updateEvent, deleteEvent } from "../services/tournamentService";
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

  // Add this function to handle fixture updates
const handleFixtureUpdated = (updatedFixture) => {
    // Update the fixtures in state
    setEventFixtures(prev => ({
      ...prev,
      [selectedFixtureEventId]: updatedFixture
    }));
    setFixtureData(updatedFixture);
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
  
  // Function to generate fixtures based on real team data
  const generateFixturesFromTeams = async (eventId) => {
    setIsGeneratingFixtures(true);
    setFixtureError('');
    
    try {
      // Get the event details
      const event = tournament.events.find(e => e._id === eventId);
      if (!event) {
        throw new Error('Event not found');
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
        // Store the generated fixtures for this event
        setEventFixtures(prev => ({
          ...prev,
          [eventId]: fixtureResult
        }));
        
        // Show the fixture modal
        setFixtureData(fixtureResult);
        setShowFixtureModal(true);
      }
    } catch (error) {
      console.error('Error generating fixtures:', error);
      setFixtureError(error.message || 'Failed to generate fixtures');
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
    if (eventFixtures[eventId]) {
      setSelectedFixtureForEdit(eventFixtures[eventId]);
      setShowFixtureEditor(true);
    }
  };
  
  // Generate knockout fixtures with real team data
  const generateKnockoutFixtureWithTeams = (teams, event) => {
    let totalMatches = teams.length - 1;
    const totalRounds = Math.ceil(Math.log2(teams.length));
    const perfectBracketSize = Math.pow(2, totalRounds);
    const needsPreliminaryRound = teams.length > Math.pow(2, totalRounds - 1) && teams.length < perfectBracketSize;
    const teamsInPreliminaryRound = needsPreliminaryRound
      ? (teams.length - Math.pow(2, totalRounds - 1)) * 2
      : 0;
    const matchesInPreliminaryRound = teamsInPreliminaryRound / 2;
    const teamsWithFirstRoundBye = needsPreliminaryRound
      ? teams.length - teamsInPreliminaryRound
      : 0;

    let matches = [];
    let roundNames = [];
    let roundSizes = [];

    // Build round names and sizes
    let remainingTeams = needsPreliminaryRound
      ? matchesInPreliminaryRound + teamsWithFirstRoundBye
      : teams.length;
    let roundNumber = 1;
    if (needsPreliminaryRound) {
      roundNames.push('PRELIMINARY ROUND');
      roundSizes.push(teamsInPreliminaryRound);
    }
    while (remainingTeams > 1) {
      let roundName = '';
      if (remainingTeams === 2) roundName = 'FINAL';
      else if (remainingTeams === 4) roundName = 'SEMI FINAL';
      else if (remainingTeams === 8) roundName = 'QUARTER FINAL';
      else if (remainingTeams === 16) roundName = 'PRE-QUARTER FINAL';
      else if (remainingTeams === 32) roundName = 'ROUND OF 32';
      else if (remainingTeams === 64) roundName = 'ROUND OF 64';
      else if (remainingTeams === 128) roundName = 'ROUND OF 128';
      else roundName = `ROUND ${roundNumber}`;
      roundNames.push(roundName);
      roundSizes.push(remainingTeams);
      remainingTeams = remainingTeams / 2;
      roundNumber++;
    }

    // 1. Preliminary round (if needed)
    if (needsPreliminaryRound) {
      for (let i = 0; i < teamsInPreliminaryRound; i += 2) {
        matches.push({
          round: 'PRELIMINARY ROUND',
          player1: { name: teams[i].playerName },
          player2: teams[i + 1] ? { name: teams[i + 1].playerName } : { name: 'BYE' },
          status: 'Pending',
          score: '',
        });
      }
    }

    // 2. First main round (with byes if needed)
    let firstMainRoundTeams = [];
    if (needsPreliminaryRound) {
      // Winners from preliminary + byes
      // We don't know winners yet, so use 'TBD' for preliminary winners
      for (let i = 0; i < matchesInPreliminaryRound; i++) {
        firstMainRoundTeams.push({ name: 'TBD' });
      }
      for (let i = teamsInPreliminaryRound; i < teams.length; i++) {
        firstMainRoundTeams.push({ name: teams[i].playerName });
      }
    } else {
      // All teams play in first round
      firstMainRoundTeams = teams.map(t => ({ name: t.playerName }));
    }

    let roundIdx = needsPreliminaryRound ? 1 : 0;
    let teamsForRound = firstMainRoundTeams;
    for (; roundIdx < roundNames.length; roundIdx++) {
      const roundName = roundNames[roundIdx];
      const numMatches = Math.floor(teamsForRound.length / 2);
      for (let i = 0; i < numMatches; i++) {
        let p1 = teamsForRound[i * 2] || { name: 'TBD' };
        let p2 = teamsForRound[i * 2 + 1] || { name: 'TBD' };
        // Only show real names in first main round, otherwise always 'TBD'
        if (roundIdx > (needsPreliminaryRound ? 1 : 0)) {
          p1 = { name: 'TBD' };
          p2 = { name: 'TBD' };
        }
        matches.push({
          round: roundName,
          player1: p1,
          player2: p2,
          status: 'Pending',
          score: '',
        });
      }
      // Prepare for next round: all winners are 'TBD' until matches are played
      teamsForRound = Array(numMatches).fill({ name: 'TBD' });
    }

    return {
      matchType: 'Knockout',
      numTeams: teams.length,
      totalRounds: roundNames.length,
      totalMatches,
      matches,
      summary: `${teams.length} teams will compete in ${roundNames.length} rounds with ${totalMatches} total matches`,
      eventName: event.name,
    };
  };
  
  // Generate league fixtures with real team data
  const generateLeagueFixtureWithTeams = (teams, event) => {
    const rounds = [];
    const totalMatches = (teams.length * (teams.length - 1)) / 2;
    const totalRounds = teams.length % 2 === 0 ? teams.length - 1 : teams.length;
    
    // Create a schedule using round-robin algorithm
    const schedule = [];
    const teamIds = teams.map(team => team._id);
    
    if (teams.length % 2 === 1) {
      // Add a dummy team for bye if odd number of teams
      teamIds.push('bye');
    }
    
    const halfSize = teamIds.length / 2;
    
    // Generate rounds
    for (let round = 0; round < teamIds.length - 1; round++) {
      const roundMatches = [];
      
      for (let match = 0; match < halfSize; match++) {
        const home = match;
        const away = teamIds.length - 1 - match;
        
        // Skip matches with the dummy team (bye)
        if (teamIds[home] !== 'bye' && teamIds[away] !== 'bye') {
          const homeTeam = teams.find(team => team._id === teamIds[home]);
          const awayTeam = teams.find(team => team._id === teamIds[away]);
          
          roundMatches.push({
            team1: homeTeam.playerName,
            team2: awayTeam.playerName,
            score: ''
          });
        }
      }
      
      schedule.push(roundMatches);
      
      // Rotate teams for next round (first team stays fixed)
      teamIds.splice(1, 0, teamIds.pop());
    }
    
    // Create rounds data
    for (let i = 0; i < schedule.length; i++) {
      rounds.push({
        name: `ROUND ${i + 1}`,
        matches: schedule[i].length,
        byes: teams.length % 2 === 1 ? 1 : 0,
        teamsInRound: teams.length,
        details: teams.length % 2 === 1 
          ? `${schedule[i].length} matches, 1 team gets bye` 
          : `${schedule[i].length} matches`,
        matchups: schedule[i]
      });
    }
    
    return {
      matchType: 'League',
      numTeams: teams.length,
      totalRounds,
      totalMatches,
      rounds,
      pointsSystem: {
        win: 3,
        draw: 1,
        loss: 0,
      },
      summary: `Each team plays ${teams.length - 1} matches. Total ${totalMatches} matches over ${totalRounds} rounds`,
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
              team1: homeTeam.playerName,
              team2: awayTeam.playerName,
              score: '',
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
          knockoutMatchups.push({
            team1: `Winner Group ${String.fromCharCode(65 + j)}`,
            team2: `Runner-up Group ${String.fromCharCode(65 + ((numGroups - 1) - j))}`,
            score: ''
          });
        }
      } else {
        // Later rounds use winners from previous rounds
        for (let j = 0; j < matchesInRound; j++) {
          knockoutMatchups.push({
            team1: `Winner of Match ${(i-1)*matchesInRound*2 + j*2 + 1}`,
            team2: `Winner of Match ${(i-1)*matchesInRound*2 + j*2 + 2}`,
            score: ''
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
    
    const totalMatches = totalGroupMatches + knockoutMatches;
    const totalRounds = rounds.length;
    
    return {
      matchType: 'Group+Knockout',
      numTeams: teams.length,
      totalRounds,
      totalMatches,
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Fixtures</h2>
              
              {/* Event filter dropdown */}
              <div className="relative">
                <select
                  value={selectedFixtureEventId || ''}
                  onChange={(e) => setSelectedFixtureEventId(e.target.value)}
                  className="bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="" disabled>Select Event</option>
                  {tournament.events && tournament.events.map(event => (
                    <option key={event._id} value={event._id}>
                      {event.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>

            {selectedFixtureEventId ? (
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {getEventName(selectedFixtureEventId)}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {getEventDetails(selectedFixtureEventId)}
                    </p>
                  </div>
                  <button
                    onClick={() => generateFixturesFromTeams(selectedFixtureEventId)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 flex items-center"
                    disabled={isGeneratingFixtures}
                  >
                    {isGeneratingFixtures ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                          />
                        </svg>
                        Generate Fixtures
                      </>
                    )}
                  </button>
                </div>
                
                {fixtureError && (
                  <div className="bg-red-500 bg-opacity-20 text-red-300 p-4 rounded-md mb-4">
                    {fixtureError}
                  </div>
                )}
                
                {eventFixtures[selectedFixtureEventId] ? (
                  <div className="text-white">
                     <p className="mb-4">Fixtures have been generated for this event. Click the buttons below to view or edit them.</p>
                     <div className="flex space-x-3">
      <button
        onClick={() => viewEventFixtures(selectedFixtureEventId)}
        className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
      >
        View Fixtures
      </button>
      <button
        onClick={() => editEventFixtures(selectedFixtureEventId)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
      >
        Edit Fixtures
      </button>
    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-8">
                    <p>No fixtures have been generated for this event yet.</p>
                    <p className="text-sm mt-2">Click the 'Generate Fixtures' button to create fixtures based on registered teams.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <p className="text-gray-400">
                  Please select an event to generate or view fixtures.
                </p>
              </div>
            )}
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