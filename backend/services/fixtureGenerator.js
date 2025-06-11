const Tournament = require('../models/Tournament');
const tournamentController = require('../controllers/tournamentController');

async function generateFixturesForClosedEvents() {
  try {
    const now = new Date();
    
    // Find tournaments where registration deadline has passed
    const tournaments = await Tournament.find({
      registrationDeadline: { $lt: now },
      'events.fixtures': { $size: 0 } // Events without fixtures
    });
    
    for (const tournament of tournaments) {
      let modified = false;
      
      for (const event of tournament.events) {
        // Skip events that already have fixtures
        if (event.fixtures && event.fixtures.length > 0) continue;
        
        // Generate fixtures even for events with insufficient participants
        // but mark them differently
        if (!event.participants || event.participants.length < 2) {
          // Create a placeholder fixture to indicate insufficient participants
          event.fixtures = [{
            eventId: event._id,
            matchType: event.matchType,
            status: 'Insufficient Participants',
            matches: [],
            groups: []
          }];
          modified = true;
          continue;
        }
        
        // Generate fixtures based on match type
        let fixtures = {
          eventId: event._id,
          matchType: event.matchType,
          status: 'Generated',
          matches: [],
          groups: []
        };

        switch (event.matchType) {
          case 'Knockout':
            fixtures = tournamentController.generateKnockoutFixtures(fixtures, event.participants);
            break;
          case 'League':
            fixtures = tournamentController.generateLeagueFixtures(fixtures, event.participants);
            break;
          case 'Group+Knockout':
            fixtures = tournamentController.generateGroupKnockoutFixtures(fixtures, event.participants);
            break;
        }

        // Add fixtures to event
        event.fixtures = [fixtures];
        modified = true;
      }
      
      // Only save if modifications were made
      if (modified) {
        await tournament.save();
        console.log(`Generated fixtures for tournament: ${tournament.name}`);
      }
    }
  } catch (error) {
    console.error('Error generating fixtures:', error);
  }
}

module.exports = {
  generateFixturesForClosedEvents
};