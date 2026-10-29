const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} = require("../controllers/employeeController");

const router = express.Router();

// College demo only: authentication is disabled on these routes.

// Create employee
router.post("/", createEmployee);

// Upload employee profile photo
router.post("/:id/photo", upload.single("profilePhoto"), async (req, res, next) => {
    try {
        const Employee = require("../models/Employee");

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select an image"
            });
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            { profilePhoto: `/uploads/${req.file.filename}` },
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile photo uploaded successfully",
            employee
        });
    } catch (error) {
        next(error);
    }
});

// Get all employees
router.get("/", getEmployees);

// Get employee by ID
router.get("/:id", getEmployeeById);

// Update employee
router.put("/:id", updateEmployee);

// Delete employee
router.delete("/:id", deleteEmployee);

module.exports = router;