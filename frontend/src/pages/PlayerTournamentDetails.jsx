import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTournamentById } from "../services/tournamentService";
import { createBooking } from '../services/bookingService';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const PlayerTournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "Male",
    tShirtSize: "M"
  });

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await getTournamentById(id);
        setTournament(response.data.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching tournament:", error);
        setError(
          error.response?.data?.message || "Failed to fetch tournament details"
        );
        setIsLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    try {
      const date = new Date(dateString);
      return format(date, "MMMM d, yyyy");
    } catch (error) {
      console.log(error);
      return dateString;
    }
  };

  // Handle booking for a specific event
  const handleBookEvent = (event) => {
    setSelectedEvent(event);
    setShowBookingForm(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle booking submission
const handleSubmitBooking = async (e) => {
  e.preventDefault();
  try {
    const bookingData = {
      tournamentId: tournament._id,
      eventId: selectedEvent._id,
      playerName: bookingForm.name,
      email: bookingForm.email,
      phone: bookingForm.phone,
      dateOfBirth: bookingForm.dateOfBirth,
      gender: bookingForm.gender,
      tShirtSize: bookingForm.tShirtSize
    };

    await createBooking(bookingData);
    toast.success(`Successfully booked for ${selectedEvent.name}`);

    // Reset form and close modal
    setBookingForm({ 
      name: "", 
      email: "", 
      phone: "", 
      dateOfBirth: "", 
      gender: "Male", 
      tShirtSize: "M" 
    });
    setShowBookingForm(false);
    setSelectedEvent(null);
  } catch (error) {
    console.error("Booking error:", error);
    toast.error(error.response?.data?.message || "Failed to book event");
  }
};

  // Go back to tournaments list
  const handleBackClick = () => {
    navigate("/tournaments");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">
            {error}
          </div>
          <button
            onClick={handleBackClick}
            className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 flex items-center"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-400">Tournament not found.</p>
          </div>
          <button
            onClick={handleBackClick}
            className="mt-4 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 flex items-center"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={handleBackClick}
          className="mb-6 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-300 flex items-center"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Tournaments
        </button>

        {/* Tournament Header with Portrait Image Layout */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg mb-6 border border-gray-700">
          <div className="flex flex-col md:flex-row">
            {/* Tournament poster/image - Portrait orientation */}
            <div className="md:w-1/3 lg:w-1/4 bg-gray-700 relative">
              {tournament.posterUrl ? (
                <img
                  src={tournament.posterUrl}
                  alt={tournament.name}
                  className="w-full h-full object-cover cursor-pointer md:h-[500px]"
                  onClick={() => setShowImageModal(true)}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x600?text=Tournament";
                  }}
                />
              ) : (
                <div className="w-full h-64 md:h-full flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-700">
                  <svg
                    className="w-24 h-24 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
              )}

              {/* Status badge */}
              <div className="absolute top-4 right-4">
                <span
                  className={`px-4 py-2 text-sm font-semibold rounded-full ${
                    tournament.status === "Active"
                      ? "bg-green-900 text-green-300"
                      : tournament.status === "Upcoming"
                      ? "bg-blue-900 text-blue-300"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {tournament.status}
                </span>
              </div>
            </div>

            {/* Tournament details */}
            <div className="p-6 md:w-2/3 lg:w-3/4">
              <h1 className="text-3xl font-bold text-white mb-4">
                {tournament.name}
              </h1>

              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Description
                  </h3>
                  <div className="text-gray-300 max-h-[300px] overflow-y-auto pr-2">
                    {tournament.description}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      {formatDate(tournament.registrationDeadline)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      Start Date
                    </h3>
                    <p className="text-white">
                      {formatDate(tournament.startDate)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">
                      End Date
                    </h3>
                    <p className="text-white">
                      {formatDate(tournament.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg mb-6 border border-gray-700">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Events</h2>

            {tournament.events && tournament.events.length > 0 ? (
              <div className="space-y-4">
                {tournament.events.map((event) => (
                  <div
                    key={event._id}
                    className={`bg-gray-700 rounded-lg p-4 transition-all duration-300 border border-gray-600`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {event.name}
                        </h3>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-300">
                          <span>Type: {event.eventType}</span>
                          <span>Format: {event.matchType}</span>
                          <span>Max Participants: {event.maxParticipants}</span>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0 flex items-center">
                        <div className="text-xl font-bold text-white mr-4">
                          ₹{event.entryFee}
                        </div>
                        {event.allowBooking ? (
                          <button
                            onClick={() => handleBookEvent(event)}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
                          >
                            Book
                          </button>
                        ) : (
                          <button
                            disabled
                            className="bg-gray-600 text-gray-400 font-medium py-2 px-4 rounded-md cursor-not-allowed opacity-50"
                          >
                            Book
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-400">
                  No events available for this tournament.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen image modal */}
      {showImageModal && tournament.posterUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              className="absolute top-4 right-4 bg-gray-800 rounded-full p-2 text-white hover:bg-gray-700 transition-colors duration-300"
              onClick={() => setShowImageModal(false)}
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
            <img
              src={tournament.posterUrl}
              alt={tournament.name}
              className="w-full h-auto max-h-[80vh] object-contain"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x400?text=Tournament";
              }}
            />
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      // ... existing code ...

{/* Booking Form Modal */}
{showBookingForm && selectedEvent && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 relative">
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
        onClick={() => {
          setShowBookingForm(false);
          setSelectedEvent(null);
          setBookingForm({ 
            name: "", 
            email: "", 
            phone: "", 
            dateOfBirth: "", 
            gender: "Male", 
            tShirtSize: "M" 
          });
        }}
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

      <h2 className="text-xl font-bold text-white mb-4">
        Book Event: {selectedEvent.name}
      </h2>
      <p className="text-gray-300 mb-4">
        Entry Fee: ₹{selectedEvent.entryFee}
      </p>

      <form onSubmit={handleSubmitBooking}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="name">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={bookingForm.name}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="email">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={bookingForm.email}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={bookingForm.phone}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        
        {/* New fields */}
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="dateOfBirth">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={bookingForm.dateOfBirth}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          <p className="text-yellow-500 text-xs mt-1">Note: Please carry a Government ID Proof when you arrive.</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="gender">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={bookingForm.gender}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-300 mb-2" htmlFor="tShirtSize">
            T-shirt Size <span className="text-red-500">*</span>
          </label>
          <select
            id="tShirtSize"
            name="tShirtSize"
            value={bookingForm.tShirtSize}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          >
            <option value="S">S - 38</option>
            <option value="M">M - 40</option>
            <option value="L">L - 42</option>
            <option value="XL">XL - 44</option>
            <option value="XXL">XXL - 45</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
        >
          Confirm Booking
        </button>
      </form>
    </div>
  </div>
)}
    </div>
  );
};

export default PlayerTournamentDetails;
