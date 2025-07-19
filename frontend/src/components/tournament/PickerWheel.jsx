import React, { useState, useEffect } from 'react';
import { Wheel } from 'react-custom-roulette';
import { toast } from 'react-toastify';

const PickerWheel = ({ franchises, onFranchiseSelected }) => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [wheelData, setWheelData] = useState([{ option: 'Yes' }, { option: 'No' }]);
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  
  // Update wheel data when franchises change
  useEffect(() => {
    if (franchises && franchises.length > 0) {
      const data = franchises.map(franchise => ({
        option: franchise.franchiseName,
        style: {
          backgroundColor: getRandomColor(franchise.franchiseName),
          textColor: 'white'
        }
      }));
      setWheelData(data);
      console.log('Wheel data updated:', data);
    } else {
      setWheelData([{ option: 'Yes' }, { option: 'No' }]);
      console.log('No franchises available, using default wheel data');
    }
  }, [franchises]);

  // Generate a random color based on franchise name
  const getRandomColor = (name) => {
    const colors = [
      '#EE4040', '#F0CF50', '#815CD1', '#3DA5E0', 
      '#34A24F', '#F9AA1F', '#EC3F3F', '#FF9000'
    ];
    
    // Use the franchise name to deterministically select a color
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleSpinClick = () => {
    if (!mustSpin) {
      // Generate random prize number
      const newPrizeNumber = Math.floor(Math.random() * wheelData.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    const winner = wheelData[prizeNumber].option;
    setSelectedFranchise(winner);
    setShowModal(true);
  };

  const handleDone = () => {
    // Increment spin count
    const newSpinCount = spinCount + 1;
    setSpinCount(newSpinCount);
    
    // Determine pool based on odd/even spin count
    const pool = newSpinCount % 2 === 1 ? 'A' : 'B';
    
    // Find the franchise object that matches the selected name
    const selectedFranchiseObj = franchises.find(
      franchise => franchise.franchiseName === selectedFranchise
    );
    
    // Call the callback with the selected franchise and pool
    if (selectedFranchiseObj) {
      onFranchiseSelected(selectedFranchiseObj, pool);
      toast.success(`${selectedFranchise} has been allocated to Pool ${pool}`);
    }
    
    setShowModal(false);
  };

  // Add debug information
  console.log('Rendering PickerWheel with franchises:', franchises);

  return (
    <div className="bg-gray-800 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Franchise Picker Wheel</h2>
      
      <div className="flex flex-col items-center">
        {/* Add debug info */}
        {franchises && franchises.length === 0 && (
          <p className="text-yellow-400 mb-4">No franchises available. Please add franchises first.</p>
        )}
        
        {/* Add a container with explicit dimensions */}
        <div style={{ width: '300px', height: '300px', margin: '0 auto' }}>
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={wheelData}
            onStopSpinning={handleStopSpinning}
            backgroundColors={['#3e3e3e', '#df3428']}
            textColors={['#ffffff']}
            outerBorderColor="#eeeeee"
            outerBorderWidth={3}
            innerRadius={0}
            innerBorderColor="#30261a"
            innerBorderWidth={0}
            radiusLineColor="#eeeeee"
            radiusLineWidth={2}
            fontSize={16}
            perpendicularText={false}
            textDistance={60}
          />
        </div>
        
        <button
          onClick={handleSpinClick}
          disabled={mustSpin}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition duration-300 disabled:opacity-50"
        >
          SPIN
        </button>
      </div>
      
      {/* Selected Franchise Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Selected Franchise</h3>
            <p className="text-white text-lg mb-6">
              {selectedFranchise}
            </p>
            <p className="text-gray-400 mb-6">
              This franchise will be allocated to Pool {spinCount % 2 === 0 ? 'A' : 'B'}
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleDone}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-300"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickerWheel;