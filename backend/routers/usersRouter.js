const express = require("express");
const { getAllUsers, getUser, getMe, updateMe, updateUser, deleteUser, adminCreateUser, adminResetPassword } = require("../controllers/userController");
const { signUp, login, logout, updatePassword, restrictTo } = require("../controllers/authController");

const router = express.Router();

const auth = require("../middleware/auth");

router.post("/signup", signUp);
router.post("/login", login);
router.get('/logout', logout);

router.get("/me", auth, getMe, getUser);
router.patch('/updateMe', auth, updateMe);
router.patch('/updateMyPassword', auth, updatePassword);

// Admin only routes
router.post("/", auth, restrictTo('admin'), adminCreateUser);
router.patch("/:id/reset-password", auth, restrictTo('admin'), adminResetPassword);
router.patch("/:id", auth, restrictTo('admin'), updateUser);
router.delete("/:id", auth, restrictTo('admin'), deleteUser);
router.get("/", auth, restrictTo('admin'), getAllUsers);

// Keep this available to auth users, but usually you only fetch yourself or if you're admin.
router.get("/:id", auth, getUser);

module.exports = router;