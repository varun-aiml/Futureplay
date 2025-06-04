import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrganizerLayout from "../components/OrganizerLayout";
import {
  getTournamentById,
  addEvent,
} from "../services/tournamentService";

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  // New state variables for event creation
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
    allowBooking: false
  });

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
    setNewEvent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Toggle event form visibility
  const toggleEventForm = () => {
    setShowEventForm(!showEventForm);
    setEventError("");
  };

    // Submit new event
    const handleSubmitEvent = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!newEvent.name || !newEvent.eventType || !newEvent.matchType || 
            !newEvent.maxParticipants || !newEvent.entryFee) {
          setEventError("Please fill in all required fields");
          return;
        }
        
        setIsCreatingEvent(true);
        setEventError("");
        
        try {
          const response = await addEvent(id, newEvent);
          const createdEvent = response.data.data;
          
          // Update tournament with new event - fixed implementation
          setTournament(prevTournament => {
            // Create a completely new object to ensure React detects the state change
            return {
              ...prevTournament,
              events: [...(prevTournament.events || []), createdEvent]
            };
          });
          
          // Reset form and hide it
          setNewEvent({
            name: "",
            eventType: "",
            matchType: "",
            maxParticipants: "",
            entryFee: "",
            discount: "0",
            allowBooking: false
          });
          setShowEventForm(false);
        } catch (err) {
          console.error("Error creating event:", err);
          setEventError(err.response?.data?.message || "Failed to create event");
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
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">{tournament.name}</h1>
          <div className="flex space-x-3">
            <button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => navigate("/organizer/tournaments")}
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("details")}
            className={`py-2 px-4 font-medium ${activeTab === "details" ? "text-red-500 border-b-2 border-red-500" : "text-gray-400 hover:text-white"}`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("events")}
            className={`py-2 px-4 font-medium ${activeTab === "events" ? "text-red-500 border-b-2 border-red-500" : "text-gray-400 hover:text-white"}`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab("fixtures")}
            className={`py-2 px-4 font-medium ${activeTab === "fixtures" ? "text-red-500 border-b-2 border-red-500" : "text-gray-400 hover:text-white"}`}
          >
            Fixtures
          </button>
        </div>

        {/* Details Tab Content */}
        {activeTab === "details" && (
          <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-6">
            <div className="md:flex">
              <div className="md:w-1/3">
                {tournament.posterUrl ? (
                  <img
                    src={tournament.posterUrl}
                    alt={tournament.name}
                    className="w-full h-64 md:h-full object-cover cursor-pointer"
                    onClick={() => setShowImageModal(true)}
                    onError={(e) => {
                      console.error("Image failed to load:", e.target.src);
                      e.target.src =
                        "https://via.placeholder.com/400x200?text=Image+Error";
                    }}
                  />
                ) : (
                  <div className="w-full h-64 md:h-full bg-gray-700 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-6 md:w-2/3">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      {tournament.name}
                    </h2>
                    <p className="text-gray-400 mb-4">{tournament.description}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      tournament.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : tournament.status === "Completed"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {tournament.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Location
                    </h3>
                    <p className="text-white">{tournament.location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Registration Deadline
                    </h3>
                    <p className="text-white">
                      {new Date(
                        tournament.registrationDeadline
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Start Date
                    </h3>
                    <p className="text-white">
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      End Date
                    </h3>
                    <p className="text-white">
                      {new Date(tournament.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
              <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Create New Event</h3>
                
                {eventError && (
                  <div className="bg-red-500 text-white p-3 rounded-md mb-4">
                    {eventError}
                  </div>
                )}
                
                <form onSubmit={handleSubmitEvent}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Event Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                        Event Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={newEvent.name}
                        onChange={handleEventInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter event name"
                        required
                      />
                    </div>
                    
                    {/* Allow Booking Toggle */}
                    <div className="flex items-center mt-6">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="allowBooking"
                          checked={newEvent.allowBooking}
                          onChange={handleEventInputChange}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 ${newEvent.allowBooking ? 'bg-red-600' : 'bg-white'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-800 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                        <span className="ml-3 text-sm font-medium text-gray-300">Allow Booking</span>
                      </label>
                    </div>
                    
                    {/* Event Type */}
                    <div>
                      <label htmlFor="eventType" className="block text-sm font-medium text-gray-300 mb-1">
                        Event Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="eventType"
                        name="eventType"
                        value={newEvent.eventType}
                        onChange={handleEventInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      <label htmlFor="matchType" className="block text-sm font-medium text-gray-300 mb-1">
                        Match Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="matchType"
                        name="matchType"
                        value={newEvent.matchType}
                        onChange={handleEventInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      >
                        <option value="">Select Match Type</option>
                        <option value="Knockout">Knockout</option>
                        <option value="League">League</option>
                        <option value="Group+Knockout">Group + Knockout</option>
                      </select>
                    </div>
                    
                    {/* Max Participants */}
                    <div>
                      <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-300 mb-1">
                        Max Participants <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="maxParticipants"
                        name="maxParticipants"
                        value={newEvent.maxParticipants}
                        onChange={handleEventInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        min="2"
                        required
                      />
                    </div>
                    
                    {/* Entry Fee */}
                    <div>
                      <label htmlFor="entryFee" className="block text-sm font-medium text-gray-300 mb-1">
                        Entry Fee (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="entryFee"
                        name="entryFee"
                        value={newEvent.entryFee}
                        onChange={handleEventInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        min="0"
                        required
                      />
                    </div>
                    
                    {/* Discount */}
                    <div>
                      <label htmlFor="discount" className="block text-sm font-medium text-gray-300 mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        id="discount"
                        name="discount"
                        value={newEvent.discount}
                        onChange={handleEventInputChange}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={toggleEventForm}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 flex items-center"
                      disabled={isCreatingEvent}
                    >
                      {isCreatingEvent ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        'Add Event'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {tournament.events && tournament.events.length > 0 ? (
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Type
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Match Format
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Entry Fee
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                        >
                          Max Players
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                      {tournament.events.map((event, index) => (
                        <tr
                          key={event._id || index}
                          className="hover:bg-gray-700"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {event.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {event.eventType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {event.matchType}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            ₹{event.entryFee}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {event.maxParticipants}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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