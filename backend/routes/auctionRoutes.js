const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createAuction,
  getOrganizerAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction
} = require('../controllers/auctionController');

// All routes are protected and require authentication
router.use(protect);

// Auction routes
router.route('/')
  .get(getOrganizerAuctions)
  .post(createAuction);

router.route('/:id')
  .get(getAuctionById)
  .put(updateAuction)
  .delete(deleteAuction);

module.exports = router;