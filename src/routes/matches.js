const router = require("express").Router();
const { body } = require("express-validator");
const {
  getMatches,
  getMatchById,
  createMatch,
  joinMatch,
  leaveMatch,
  finishMatch,
} = require("../controllers/matchController");
const auth = require("../middleware/auth");

router.get("/", getMatches);
router.get("/:id", getMatchById);

router.post(
  "/",
  auth,
  [
    body("location").trim().notEmpty().withMessage("La ubicación es requerida"),
    body("lat").isFloat().withMessage("Latitud inválida"),
    body("lng").isFloat().withMessage("Longitud inválida"),
    body("date").isISO8601().withMessage("Fecha inválida"),
    body("time").trim().notEmpty().withMessage("La hora es requerida"),
    body("maxPlayers").isIn([10, 12, 14, 16, 18, 20, 22]).withMessage("Cantidad de jugadores inválida"),
  ],
  createMatch
);

router.post("/:id/join", auth, joinMatch);
router.post("/:id/leave", auth, leaveMatch);
router.patch("/:id/finish", auth, finishMatch);

module.exports = router;
