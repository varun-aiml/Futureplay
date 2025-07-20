import { useState } from 'react';
import { toast } from 'react-toastify';

const TimerModal = ({ match, onClose, onSave }) => {
  // Get current time as default
  const now = new Date();
  const defaultHour = now.getHours() % 12 || 12; // Convert 24h to 12h format
  const defaultMinute = now.getMinutes();
  const defaultPeriod = now.getHours() >= 12 ? 'PM' : 'AM';

  // State for time input
  const [hour, setHour] = useState(defaultHour);
  const [minute, setMinute] = useState(defaultMinute);
  const [period, setPeriod] = useState(defaultPeriod);

  // Handle hour input change
  const handleHourChange = (e) => {
    let value = parseInt(e.target.value, 10);
    // Ensure hour is between 1 and 12
    if (value < 1) value = 1;
    if (value > 12) value = 12;
    setHour(value);
  };

  // Handle minute input change
  const handleMinuteChange = (e) => {
    let value = parseInt(e.target.value, 10);
    // Ensure minute is between 0 and 59
    if (value < 0) value = 0;
    if (value > 59) value = 59;
    setMinute(value);
  };

  // Handle period change (AM/PM)
  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  // Handle confirm button click
  const handleConfirm = () => {
    // Create a formatted time string (e.g., "10:30 AM")
    const formattedTime = `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
    
    // Save the scheduled time
    onSave({
      scheduledTime: formattedTime
    });
    
    toast.success('Time scheduled successfully');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-medium text-white">
            Schedule Match Time
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 text-center">
            <h4 className="text-lg font-medium text-white mb-2">
              {match.franchise1Name} vs {match.franchise2Name}
            </h4>
            <p className="text-gray-400">{match.poolType === 'knockout' ? match.round : `Pool ${match.poolType}`}</p>
          </div>

          <div className="bg-gray-700 p-4 rounded-md mb-6">
            <p className="text-gray-400 text-sm mb-3">Enter Match Time:</p>
            
            <div className="flex items-center justify-center space-x-2">
              {/* Hour input */}
              <input
                type="number"
                min="1"
                max="12"
                value={hour}
                onChange={handleHourChange}
                className="w-16 bg-gray-800 text-white border border-gray-600 rounded-md py-2 px-3 text-center focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              
              <span className="text-white text-xl">:</span>
              
              {/* Minute input */}
              <input
                type="number"
                min="0"
                max="59"
                value={minute}
                onChange={handleMinuteChange}
                className="w-16 bg-gray-800 text-white border border-gray-600 rounded-md py-2 px-3 text-center focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              
              {/* AM/PM selector */}
              <select
                value={period}
                onChange={handlePeriodChange}
                className="bg-gray-800 text-white border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleConfirm}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerModal;