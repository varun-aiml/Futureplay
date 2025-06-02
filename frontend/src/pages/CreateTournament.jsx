import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OrganizerLayout from "../components/OrganizerLayout";
import { createTournament, updateTournament } from "../services/tournamentService";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useParams } from 'react-router-dom';
import { getTournamentById } from '../services/tournamentService';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Location picker component
const LocationMarker = ({
  selectedLocation,
  setSelectedLocation,
  setFormData,
}) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setSelectedLocation([lat, lng]);

      // Reverse geocode using Nominatim
      fetch(`http://localhost:5000/api/reverse-geocode?lat=${lat}&lon=${lng}`)
        .then((res) => res.json())
        .then((data) => {
          const address = data.display_name || "Unknown location";
          setFormData((prev) => ({ ...prev, location: address }));
        })
        .catch((err) => {
          console.error("Reverse geocoding error:", err);
        });
    },
  });

  return selectedLocation ? (
    <Marker position={selectedLocation}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
};

const CreateTournament = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [events, setEvents] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    status: "Upcoming",
    events: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      // Check file type
      if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
        setError("Only JPEG, PNG and GIF images are allowed");
        return;
      }

      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate first step fields
    if (step === 1) {
      if (!formData.name.trim()) errors.name = "Tournament name is required";
      if (!formData.description.trim())
        errors.description = "Description is required";
      if (!formData.location.trim()) errors.location = "Location is required";
      if (!formData.registrationDeadline)
        errors.registrationDeadline = "Registration deadline is required";
      if (!formData.startDate) errors.startDate = "Start date is required";
      if (!formData.endDate) errors.endDate = "End date is required";

      // Validate date logic
      if (
        formData.startDate &&
        formData.endDate &&
        formData.registrationDeadline
      ) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const regDeadline = new Date(formData.registrationDeadline);

        if (start > end) {
          errors.endDate = "End date must be after start date";
        }

        if (regDeadline > start) {
          errors.registrationDeadline =
            "Registration deadline must be before start date";
        }
      }
    }

    // Validate second step fields
    if (step === 2 && formData.events.length === 0) {
      errors.events = "At least one event is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    // If we have an ID, we're in edit mode
    if (id) {
      setIsEditMode(true);
      fetchTournamentData();
    }
  }, [id]);

  const fetchTournamentData = async () => {
    try {
      setIsLoading(true);
      const response = await getTournamentById(id);
      const tournament = response.data.data;
      
      // Populate form with tournament data
      setFormData({
        name: tournament.name,
        description: tournament.description,
        location: tournament.location,
        registrationDeadline: formatDateForInput(new Date(tournament.registrationDeadline)),
        startDate: formatDateForInput(new Date(tournament.startDate)),
        endDate: formatDateForInput(new Date(tournament.endDate)),
        events: tournament.events || [],
      });
      
      // Set events
      setEvents(tournament.events || []);
      
      // Handle poster preview if exists
      if (tournament.posterUrl) {
        setPosterPreview(tournament.posterUrl);
      }
      
      setIsLoading(false);
    } catch (error) {
      setError('Failed to fetch tournament data');
      setIsLoading(false);
    }
  };

  const validateEvents = () => {
    const requiredFields = ['name', 'maxParticipants', 'entryFee', 'eventType', 'matchType'];
    
    for (const event of formData.events) {
      for (const field of requiredFields) {
        if (!event[field] || event[field] === '') {
          setError(`Event ${event.name || 'unnamed'} is missing ${field}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !validateEvents()) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const formDataObj = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'events') { // Don't append events here
          formDataObj.append(key, formData[key]);
        }
      });
      
      // Append poster if selected
      if (posterFile) {
        formDataObj.append('poster', posterFile);
      }
      
      // Append events from the events state
      formDataObj.append('events', JSON.stringify(formData.events));
      
      let response;
      if (isEditMode) {
        // Update existing tournament
        response = await updateTournament(id, formDataObj);
      } else {
        // Create new tournament
        response = await createTournament(formDataObj);
      }
      
      navigate(`/organizer/tournaments/${response.data.data._id}`);
    } catch (error) {
      console.error('Update error:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to save tournament');
      setIsLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const addEvent = () => {
    const newEvent = {
      name: "",
      maxParticipants: "",
      entryFee: "",
      eventType: "",
      matchType: "",
      allowBooking: false,
      discount: "0",
    };
    
    // Update formData.events
    setFormData((prev) => ({
      ...prev,
      events: [...prev.events, newEvent],
    }));
    
    // Also update the events state
    setEvents((prev) => [...prev, newEvent]);
  };

  const updateEvent = (index, field, value) => {
    // Update in formData.events
    const updatedEvents = [...formData.events];
    updatedEvents[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      events: updatedEvents,
    }));
    
    // Also update in events state
    const updatedEventsState = [...events];
    updatedEventsState[index][field] = value;
    setEvents(updatedEventsState);
  };
  
  const removeEvent = (index) => {
    // Update in formData.events
    const updatedEvents = formData.events.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      events: updatedEvents,
    }));
    
    // Also update in events state
    const updatedEventsState = events.filter((_, i) => i !== index);
    setEvents(updatedEventsState);
  };

  const nextStep = () => {
    if (validateForm()) {
      setStep(step + 1);
      setError("");
    } else {
      setError("Please fix the errors before proceeding");
    }
  };

  const prevStep = () => setStep(step - 1);

  // Function to toggle map visibility
  const toggleMap = () => {
    setMapVisible(!mapVisible);
  };

  return (
    <OrganizerLayout>
      <div className="container mx-auto max-w-4xl">
        <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold text-white mb-6">
          {isEditMode ? 'Edit Tournament' : 'Create Tournament'}
        </h1>
          <p className="text-gray-400">
            Fill in the details to create a new tournament
          </p>
        </div>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            <div className="w-full flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                1
              </div>
              <div
                className={`flex-1 h-1 mx-2 ${
                  step >= 2 ? "bg-red-500" : "bg-gray-700"
                }`}
              ></div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? "bg-red-500 text-white"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                2
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Tournament Details
                </h2>

                {/* Tournament Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Tournament Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 bg-gray-700 border ${
                      formErrors.name ? "border-red-500" : "border-gray-600"
                    } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                    placeholder="e.g. Summer Tennis Championship 2023"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className={`w-full px-4 py-2 bg-gray-700 border ${
                      formErrors.description
                        ? "border-red-500"
                        : "border-gray-600"
                    } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                    placeholder="Provide details about your tournament..."
                  ></textarea>
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2 bg-gray-700 border ${
                        formErrors.location
                          ? "border-red-500"
                          : "border-gray-600"
                      } rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                      placeholder="e.g. City Sports Complex, New York"
                    />
                    <button
                      type="button"
                      onClick={toggleMap}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-md transition duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>
                  </div>
                  {formErrors.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.location}
                    </p>
                  )}
                  {mapVisible && (
                    <div className="mt-2 h-64 rounded-md overflow-hidden">
                      <MapContainer
                        center={selectedLocation || [20.5937, 78.9629]}
                        zoom={10}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker
                          selectedLocation={selectedLocation}
                          setSelectedLocation={setSelectedLocation}
                          setFormData={setFormData}
                        />
                      </MapContainer>
                      <p className="text-xs text-gray-400 mt-1">
                        Click on the map to select a location
                      </p>
                    </div>
                  )}
                </div>

                {/* Registration Deadline */}
                <div>
                  <label
                    htmlFor="registrationDeadline"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Registration Deadline{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="registrationDeadline"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    max={formData.startDate ? formData.startDate : undefined}
                    required
                    className={`w-full px-4 py-2 bg-gray-700 border ${
                      formErrors.registrationDeadline
                        ? "border-red-500"
                        : "border-gray-600"
                    } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                  />
                  {formErrors.registrationDeadline && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.registrationDeadline}
                    </p>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={formatDateForInput(new Date())}
                    max={formData.endDate ? formData.endDate : undefined}
                    required
                    className={`w-full px-4 py-2 bg-gray-700 border ${
                      formErrors.startDate
                        ? "border-red-500"
                        : "border-gray-600"
                    } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                  />
                  {formErrors.startDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.startDate}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={
                      formData.startDate
                        ? formData.startDate
                        : formatDateForInput(new Date())
                    }
                    required
                    className={`w-full px-4 py-2 bg-gray-700 border ${
                      formErrors.endDate ? "border-red-500" : "border-gray-600"
                    } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                  />
                  {formErrors.endDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.endDate}
                    </p>
                  )}
                </div>

                {/* Tournament Poster */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tournament Poster
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md hover:border-red-500 transition-colors duration-300">
                    {posterPreview ? (
                      <div className="text-center">
                        <img
                          src={posterPreview}
                          alt="Poster preview"
                          className="mx-auto h-48 object-cover rounded-md shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPosterFile(null);
                            setPosterPreview("");
                          }}
                          className="mt-2 text-sm text-red-500 hover:text-red-400 transition-colors duration-300"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-400">
                          <label
                            htmlFor="poster-upload"
                            className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-red-500 hover:text-red-400 focus-within:outline-none transition-colors duration-300"
                          >
                            <span className="px-3 py-2 rounded-md">
                              Upload a file
                            </span>
                            <input
                              id="poster-upload"
                              name="poster"
                              type="file"
                              className="sr-only"
                              onChange={handlePosterChange}
                              accept="image/*"
                            />
                          </label>
                          <p className="pl-1 pt-2">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition duration-300 flex items-center"
                  >
                    Next: Add Events
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Tournament Events
                </h2>
                <p className="text-gray-400 mb-4">
                  Add one or more events to your tournament
                </p>

                {formErrors.events && (
                  <p className="text-red-500 text-sm mb-4">
                    {formErrors.events}
                  </p>
                )}

                {formData.events.length > 0 && (
                  <div className="space-y-6 mb-6">
                    {formData.events.map((event, index) => (
                      <div
                        key={index}
                        className="bg-gray-700 p-4 rounded-md relative border border-gray-600 hover:border-red-500 transition-colors duration-300"
                      >
                        <button
                          type="button"
                          onClick={() => removeEvent(index)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors duration-300"
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>

                        <h3 className="text-white font-medium mb-3">
                          Event #{index + 1}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Event Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Event Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={event.name}
                              onChange={(e) =>
                                updateEvent(index, "name", e.target.value)
                              }
                              required
                              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                              placeholder="e.g. Men's Singles"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {/* Event Type */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Event Type <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={event.eventType}
                              onChange={(e) =>
                                updateEvent(index, "eventType", e.target.value)
                              }
                              required
                              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              <option value="">Select Event Type</option>
                              <option value="Singles">Singles</option>
                              <option value="Doubles">Doubles</option>
                              <option value="Team">Team</option>
                            </select>
                          </div>

                          {/* Match Type */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Match Type <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={event.matchType}
                              onChange={(e) =>
                                updateEvent(index, "matchType", e.target.value)
                              }
                              required
                              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              <option value="">Select Match Type</option>
                              <option value="Knockout">Knockout</option>
                              <option value="League">League</option>
                              <option value="Group+Knockout">
                                Group + Knockout
                              </option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {/* Max Participants */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Max Participants{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={event.maxParticipants}
                              onChange={(e) =>
                                updateEvent(
                                  index,
                                  "maxParticipants",
                                  e.target.value
                                )
                              }
                              required
                              min="2"
                              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                              placeholder="e.g. 16"
                            />
                          </div>

                          {/* Entry Fee */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Entry Fee (₹){" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={event.entryFee}
                              onChange={(e) =>
                                updateEvent(index, "entryFee", e.target.value)
                              }
                              required
                              min="0"
                              step="1"
                              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {/* Discount */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Discount (%)
                            </label>
                            <input
                              type="number"
                              value={event.discount}
                              onChange={(e) =>
                                updateEvent(index, "discount", e.target.value)
                              }
                              min="0"
                              max="100"
                              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                              placeholder="0"
                            />
                          </div>

                          {/* Allow Booking */}
                          <div className="flex items-center mt-6">
                            <input
                              type="checkbox"
                              id={`allowBooking-${index}`}
                              checked={event.allowBooking}
                              onChange={(e) =>
                                updateEvent(
                                  index,
                                  "allowBooking",
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`allowBooking-${index}`}
                              className="ml-2 block text-sm text-gray-300"
                            >
                              Allow Booking
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={addEvent}
                  className="w-full py-3 border-2 border-dashed border-gray-600 rounded-md text-gray-400 hover:text-red-500 hover:border-red-500 transition duration-300 flex items-center justify-center"
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

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-md transition duration-300 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Back
                  </button>
                  <button
          type="submit"
          disabled={isLoading || formData.events.length === 0}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isEditMode ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            isEditMode ? 'Update Tournament' : 'Create Tournament'
          )}
        </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </OrganizerLayout>
  );
};

export default CreateTournament;
