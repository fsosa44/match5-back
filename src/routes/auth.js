const router = require("express").Router();
const { body } = require("express-validator");
const { register, login, getMe } = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("El nombre es requerido"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("birthDate").optional().isISO8601().withMessage("Fecha de nacimiento inválida"),
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("La contraseña es requerida"),
  ],
  login
);

router.get("/me", auth, getMe);

module.exports = router;
