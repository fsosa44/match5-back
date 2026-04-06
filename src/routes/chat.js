const router = require("express").Router();
const { getMessages, sendMessage } = require("../controllers/chatController");
const auth = require("../middleware/auth");

router.get("/:matchId", auth, getMessages);
router.post("/:matchId", auth, sendMessage);

module.exports = router;
