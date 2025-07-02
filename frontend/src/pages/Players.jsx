// // import React from 'react';
// // import OrganizerLayout from '../components/OrganizerLayout';
// // import TeamsListView from '../components/franchise/TeamsListView';

// // function Players() {
// //   return (
// //     <OrganizerLayout>
// //       <div className="space-y-6">
// //         <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
// //           <div>
// //             <h1 className="text-2xl font-bold text-white">Players</h1>
// //             <p className="text-gray-400 mt-1">View and manage all registered players</p>
// //           </div>
// //         </div>
        
// //         {/* Teams/Players List */}
// //         <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
// //           <h2 className="text-xl font-semibold text-white mb-4">Registered Players</h2>
// //           <TeamsListView />
// //         </div>
// //       </div>
// //     </OrganizerLayout>
// //   );
// // }

// // export default Players;

import React from 'react';
import OrganizerLayout from '../components/OrganizerLayout';
import OrganizerTeamsView from '../components/organizer/OrganizerTeamsView';

function Players() {
  return (
    <OrganizerLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Players</h1>
            <p className="text-gray-400 mt-1">View and manage all registered players</p>
          </div>
        </div>
        
        {/* Teams/Players List */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Registered Players</h2>
          <OrganizerTeamsView />
        </div>
      </div>
    </OrganizerLayout>
  );
}

export default Players;