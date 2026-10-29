const express = require('express');
const router = express.Router();

const {
  markAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');

// College demo only: authentication disabled temporarily

// Mark attendance
router.post('/', markAttendance);

// Get attendance records
router.get('/', getAttendance);

// Update attendance
router.put('/:id', updateAttendance);

// Delete attendance
router.delete('/:id', deleteAttendance);

module.exports = router;