const express = require("express");
const { getAllUsers, getUser, getMe, updateMe } = require("../controllers/userController");
const { signUp, login, logout, updatePassword } = require("../controllers/authController");

const router = express.Router();

const auth = require("../middleware/auth");

router.post("/signup", signUp);
router.post("/login", login);
router.get('/logout', logout);

router.get("/me", auth, getMe, getUser)
router.patch('/updateMe', auth, updateMe);
router.patch('/updateMyPassword', auth, updatePassword);
router.get("/", auth, getAllUsers);
router.get("/:id", auth, getUser);

module.exports = router;