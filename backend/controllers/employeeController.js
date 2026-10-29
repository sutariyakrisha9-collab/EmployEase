
const Employee = require("../models/Employee");

// Escape special characters in search input
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// CREATE employee
async function createEmployee(req, res) {
    try {
        const employee = await Employee.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            employee
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Employee email already exists"
            });
        }

        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create employee"
        });
    }
}

// READ employees with search, filters and pagination
async function getEmployees(req, res) {
    try {
        const {
            search = "",
            department,
            status,
            page = "1",
            limit = "10",
            sortBy = "createdAt",
            order = "desc"
        } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (
            !Number.isInteger(pageNumber) ||
            pageNumber < 1 ||
            !Number.isInteger(limitNumber) ||
            limitNumber < 1 ||
            limitNumber > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid page or limit"
            });
        }

        const filter = {};

        if (search.trim()) {
            const pattern = new RegExp(
                escapeRegex(search.trim()),
                "i"
            );

            filter.$or = [
                { name: pattern },
                { email: pattern }
            ];
        }

        const allowedDepartments = [
            "IT", "HR", "Sales", "Finance", "Marketing", "Design"
        ];

        const allowedStatuses = ["Active", "Inactive", "On Leave"];

        if (department) {
            if (!allowedDepartments.includes(department)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department"
                });
            }

            filter.department = department;
        }

        if (status) {
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status"
                });
            }

            filter.status = status;
        }

        const allowedSortFields = [
            "name", "salary", "joiningDate", "createdAt"
        ];

        if (
            !allowedSortFields.includes(sortBy) ||
            !["asc", "desc"].includes(order)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid sorting options"
            });
        }

        const skip = (pageNumber - 1) * limitNumber;
        const sortOrder = order === "asc" ? 1 : -1;

        const [employees, totalEmployees] = await Promise.all([
            Employee.find(filter)
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limitNumber),

            Employee.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            employees,
            pagination: {
                currentPage: pageNumber,
                limit: limitNumber,
                totalEmployees,
                totalPages: Math.ceil(totalEmployees / limitNumber)
            }
        });
    } catch (error) {
        console.error("Get employees error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch employees"
        });
    }
}

// READ one employee
async function getEmployeeById(req, res) {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        return res.status(200).json({
            success: true,
            employee
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to fetch employee"
        });
    }
}

// UPDATE employee
async function updateEmployee(req, res) {
    try {
        const allowedFields = [
            "name", "email", "phone", "department",
            "position", "salary", "joiningDate", "status"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update"
            });
        }

        const employee = await Employee.findByIdAndUpdate(
            req.params.id,
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            employee
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Employee email already exists"
            });
        }

        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update employee"
        });
    }
}

// DELETE employee
async function deleteEmployee(req, res) {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully"
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid employee ID"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to delete employee"
        });
    }
}

module.exports = {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};
