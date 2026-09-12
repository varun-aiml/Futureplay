const TournamentDetails = ({ tournament, setShowImageModal }) => {
    return (
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-6 w-full min-w-0">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 flex-shrink-0">
            {tournament.posterUrl ? (
              <img
                src={tournament.posterUrl}
                alt={tournament.name}
                className="w-full h-48 sm:h-64 md:h-full min-h-[180px] object-cover cursor-pointer"
                onClick={() => setShowImageModal(true)}
                onError={(e) => {
                  console.error("Image failed to load:", e.target.src);
                  e.target.src =
                    "https://via.placeholder.com/400x200?text=Image+Error";
                }}
              />
            ) : (
              <div className="w-full h-48 sm:h-64 md:h-full min-h-[180px] bg-gray-700 flex items-center justify-center">
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
  
          <div className="p-4 sm:p-6 w-full md:w-2/3 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 break-words">
                  {tournament.name}
                </h2>
                <p className="text-gray-400 mb-4 break-words text-sm sm:text-base">{tournament.description}</p>
              </div>
              <span
                className={`self-start px-3 py-1 text-xs rounded-full flex-shrink-0 ${
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
  
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-400">
                  Location
                </h3>
                <p className="text-white break-words text-sm sm:text-base">{tournament.location}</p>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-400">
                  Registration Deadline
                </h3>
                <p className="text-white break-words text-sm sm:text-base">
                  {new Date(
                    tournament.registrationDeadline
                  ).toLocaleDateString()}
                </p>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-400">
                  Start Date
                </h3>
                <p className="text-white break-words text-sm sm:text-base">
                  {new Date(tournament.startDate).toLocaleDateString()}
                </p>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-gray-400">
                  End Date
                </h3>
                <p className="text-white break-words text-sm sm:text-base">
                  {new Date(tournament.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default TournamentDetails;