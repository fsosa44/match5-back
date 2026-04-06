const router = require("express").Router();
const { rateMatch, getMatchRatings, getPendingRatings } = require("../controllers/ratingController");
const auth = require("../middleware/auth");

router.get("/pending", auth, getPendingRatings);
router.get("/:matchId", auth, getMatchRatings);
router.post("/:matchId", auth, rateMatch);

module.exports = router;
