const express = require("express");
const setupAdmin = require("../controllers/adminSetupController");

const router = express.Router();

router.post("/setup-admin", setupAdmin);

module.exports = router;
