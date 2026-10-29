const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Employee name is required"],
            trim: true,
            minlength: 2,
            maxlength: 60
        },

        email: {
            type: String,
            required: [true, "Employee email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true
        },

        department: {
            type: String,
            required: [true, "Department is required"],
            enum: ["IT", "HR", "Sales", "Finance", "Marketing", "Design","Production"]
        },

        position: {
            type: String,
            required: [true, "Position is required"],
            trim: true
        },

        salary: {
            type: Number,
            required: [true, "Salary is required"],
            min: 0
        },

        joiningDate: {
            type: Date,
            required: [true, "Joining date is required"]
        },

        status: {
            type: String,
            enum: ["Active", "Inactive", "On Leave"],
            default: "Active"
        },

        profilePhoto: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Employee", employeeSchema);
