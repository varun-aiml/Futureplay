const EventsList = ({ events, onEventClick }) => {
  return (
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
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Allow Booking
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {events.map((event, index) => (
              <tr
                key={event._id || index}
                className="hover:bg-gray-700 cursor-pointer"
                onClick={() => onEventClick(event)}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {event.allowBooking ? (
                    <span className="text-red-500 font-medium">Active</span>
                  ) : (
                    <span className="text-gray-400">Closed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventsList;