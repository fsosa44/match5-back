const router = require("express").Router();
const { getUserById, updateProfile, searchUsers, uploadPhoto } = require("../controllers/userController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/search", auth, searchUsers);
router.get("/:id", getUserById);
router.put("/me", auth, updateProfile);
router.post("/me/photo", auth, upload.single("photo"), uploadPhoto);

module.exports = router;
