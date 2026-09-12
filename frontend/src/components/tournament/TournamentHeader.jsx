import { useNavigate } from "react-router-dom";

const TournamentHeader = ({ tournament, handleEdit }) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
      <h1 className="text-xl sm:text-2xl font-bold text-white break-words min-w-0">
        {tournament.name}
      </h1>
      <div className="flex items-center space-x-3 flex-shrink-0 self-start sm:self-auto">
        <button
          onClick={handleEdit}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 sm:px-4 rounded-md transition duration-300 flex items-center text-sm sm:text-base"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit
        </button>
        <button
          onClick={() => navigate("/organizer/tournaments")}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-3 sm:px-4 rounded-md transition duration-300 flex items-center text-sm sm:text-base"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5 mr-1"
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
  );
};

export default TournamentHeader;