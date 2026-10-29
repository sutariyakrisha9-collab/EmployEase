
const Department = require("../models/Department");

// Add Department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description, manager } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Department name is required"
      });
    }

    const department = await Department.create({
      name: name.trim(),
      description,
      manager
    });

    res.status(201).json({
      message: "Department created successfully",
      department
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Department already exists"
      });
    }

    res.status(500).json({
      message: "Failed to create department",
      error: error.message
    });
  }
};

// View All Departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({
      createdAt: -1
    });

    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch departments",
      error: error.message
    });
  }
};

// View One Department
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        message: "Department not found"
      });
    }

    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch department",
      error: error.message
    });
  }
};

// Update Department
exports.updateDepartment = async (req, res) => {
  try {
    const { name, description, manager } = req.body;

    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description, manager },
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({
        message: "Department not found"
      });
    }

    res.status(200).json({
      message: "Department updated successfully",
      department
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Department name already exists"
      });
    }

    res.status(500).json({
      message: "Failed to update department",
      error: error.message
    });
  }
};

// Delete Department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(
      req.params.id
    );

    if (!department) {
      return res.status(404).json({
        message: "Department not found"
      });
    }

    res.status(200).json({
      message: "Department deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete department",
      error: error.message
    });
  }
};
