const router = require("express").Router();
const {
  getConversations,
  getOrCreateConversation,
  getPrivateMessages,
} = require("../controllers/conversationController");
const auth = require("../middleware/auth");

router.get("/", auth, getConversations);
router.post("/", auth, getOrCreateConversation);
router.get("/:conversationId/messages", auth, getPrivateMessages);

module.exports = router;
