const express = require('express')
const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')

const {
  markAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController')

router.use(authMiddleware, adminMiddleware)

router.post('/', markAttendance)
router.get('/', getAttendance)
router.put('/:id', updateAttendance)
router.delete('/:id', deleteAttendance)

module.exports = router