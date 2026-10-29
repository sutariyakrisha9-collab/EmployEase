const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Protected route
router.get("/me", authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Protected route accessed successfully",
        user: req.user
    });
});

module.exports = router;
