const EventForm = ({
  event,
  handleEventInputChange,
  handleSubmitEvent,
  isProcessing,
  eventError,
  toggleEventForm,
  generateFixtures,
  setShowFixtureModal,
  isEditMode,
  handleDeleteEvent,
}) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 mb-6 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">
        {isEditMode ? "Edit Event" : "Create New Event"}
      </h3>

      {eventError && (
        <div className="bg-red-500 text-white p-3 rounded-md mb-4">
          {eventError}
        </div>
      )}

      <form onSubmit={handleSubmitEvent}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Event Name */}
          <div>
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
              value={event.name}
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
                checked={event.allowBooking}
                onChange={handleEventInputChange}
                className="sr-only peer"
              />
              <div
                className={`w-11 h-6 ${
                  event.allowBooking ? "bg-red-600" : "bg-white"
                } peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-800 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}
              ></div>
              <span className="ml-3 text-sm font-medium text-gray-300">
                Allow Booking
              </span>
            </label>
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
              value={event.eventType}
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
            <label
              htmlFor="matchType"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Match Type <span className="text-red-500">*</span>
            </label>
            <select
              id="matchType"
              name="matchType"
              value={event.matchType}
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
            <label
              htmlFor="maxParticipants"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Max Participants <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="maxParticipants"
              name="maxParticipants"
              value={event.maxParticipants}
              onChange={handleEventInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              min="2"
              required
            />
          </div>

          {/* Entry Fee */}
          <div>
            <label
              htmlFor="entryFee"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Entry Fee (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="entryFee"
              name="entryFee"
              value={event.entryFee}
              onChange={handleEventInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
              value={event.discount}
              onChange={handleEventInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              min="0"
              max="100"
            />
          </div>

          {/* Generate Fixtures Button */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Fixture Calculator
            </label>
            <button
              type="button"
              className={`w-full py-2 px-4 rounded-md ${
                event.matchType && event.maxParticipants > 0
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
              onClick={() => {
                if (event.matchType && event.maxParticipants > 0) {
                  generateFixtures();
                  setShowFixtureModal(true);
                }
              }}
              disabled={!event.matchType || event.maxParticipants <= 0}
            >
              Generate Fixtures
            </button>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          {isEditMode && (
            <button
              type="button"
              onClick={handleDeleteEvent}
              className="bg-red-800 hover:bg-red-900 text-white font-medium py-2 px-4 rounded-md transition duration-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Delete Event
            </button>
          )}
          <div className="flex space-x-3 ml-auto">
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
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditMode ? "Update Event" : "Add Event"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EventForm;