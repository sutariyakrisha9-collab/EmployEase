const Attendance = require('../models/Attendance')
const Employee = require('../models/Employee')

// Create or update an attendance record
exports.markAttendance = async (req, res) => {
  try {
    const { employee, date, status, remarks = '' } = req.body

    if (!employee || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'Employee, date and status are required.'
      })
    }

    if (!['Present', 'Absent', 'Late', 'Half Day', 'Leave'].includes(status)) {
  return res.status(400).json({
    message: 'Status must be Present, Absent, Late, Half Day or Leave'
  })
}

    const employeeExists = await Employee.findById(employee)

    if (!employeeExists) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      })
    }

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date.'
      })
    }

    // Normalize date to midnight UTC so same-day records match
    const normalizedDate = new Date(
      Date.UTC(
        parsedDate.getUTCFullYear(),
        parsedDate.getUTCMonth(),
        parsedDate.getUTCDate()
      )
    )

    const attendance = await Attendance.findOneAndUpdate(
      { employee, date: normalizedDate },
      { employee, date: normalizedDate, status, remarks },
      { new: true, upsert: true, runValidators: true }
    ).populate('employee', 'name email department position')

    return res.status(200).json({
      success: true,
      message: 'Attendance saved successfully.',
      attendance
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Attendance already exists for this employee and date.'
      })
    }

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Get attendance records, optionally filtered by date
exports.getAttendance = async (req, res) => {
  try {
    const filter = {}

    if (req.query.date) {
      const parsedDate = new Date(req.query.date)

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid date.'
        })
      }

      const start = new Date(
        Date.UTC(
          parsedDate.getUTCFullYear(),
          parsedDate.getUTCMonth(),
          parsedDate.getUTCDate()
        )
      )

      const end = new Date(start)
      end.setUTCDate(end.getUTCDate() + 1)

      filter.date = { $gte: start, $lt: end }
    }

    if (req.query.employee) {
      filter.employee = req.query.employee
    }

    const records = await Attendance.find(filter)
      .populate('employee', 'name email department position')
      .sort({ date: -1, createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: records.length,
      attendance: records
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Update an existing attendance record
exports.updateAttendance = async (req, res) => {
  try {
    const { status, remarks } = req.body
    const updates = {}

    if (status !== undefined) {
      if (!['Present', 'Absent', 'Leave'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid attendance status.'
        })
      }

      updates.status = status
    }

    if (remarks !== undefined) {
      updates.remarks = remarks
    }

    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('employee', 'name email department position')

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found.'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Attendance updated successfully.',
      attendance: record
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Delete an attendance record
exports.deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id)

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found.'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Attendance deleted successfully.'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}