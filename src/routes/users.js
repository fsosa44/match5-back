const router = require("express").Router();
const { getUserById, updateProfile, searchUsers } = require("../controllers/userController");
const auth = require("../middleware/auth");

router.get("/search", auth, searchUsers);
router.get("/:id", getUserById);
router.put("/me", auth, updateProfile);

module.exports = router;
