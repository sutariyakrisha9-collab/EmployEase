const express = require("express");

const upload = require("../middleware/uploadMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} = require("../controllers/employeeController");

const router = express.Router();

// All routes require a valid admin token
router.use(authMiddleware, adminMiddleware);

router.post("/", createEmployee);
router.post(
    "/:id/photo",
    upload.single("profilePhoto"),
    async (req, res, next) => {
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
    }
);
router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;
