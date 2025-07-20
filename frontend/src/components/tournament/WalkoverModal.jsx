import { useState } from 'react';
import { toast } from 'react-toastify';

const WalkoverModal = ({ match, unscoredMatches, onClose, onWalkover }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Unscored Matches</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
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
        
        <div className="p-6">
          <div className="mb-4 text-white">
            <p>The following matches haven't been scored. Please select a walkover winner for each match:</p>
          </div>
          
          {unscoredMatches.map((eventMatch, index) => (
            <div key={index} className="mb-6 bg-gray-700 p-4 rounded-lg">
              <div className="mb-3">
                <h3 className="text-lg font-medium text-white">{eventMatch.eventName}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <p className="text-white mb-3">{eventMatch.team1Name}</p>
                  <button
                    onClick={() => onWalkover(eventMatch.eventId, 0)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md w-full"
                  >
                    Walkover Win
                  </button>
                </div>
                
                <div className="flex flex-col items-center">
                  <p className="text-white mb-3">{eventMatch.team2Name}</p>
                  <button
                    onClick={() => onWalkover(eventMatch.eventId, 1)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md w-full"
                  >
                    Walkover Win
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkoverModal;