require("dotenv").config();

const path = require("path");
const employeeRoutes = require("./routes/employeeRoutes");
const adminSetupRoutes = require("./routes/adminSetupRoutes");
const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const attendanceRoutes = require('./routes/attendanceRoutes');
 
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173"
    })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to EmployEase API"
    });
});

app.use("/api/employees", employeeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth", adminSetupRoutes);
app.use('/api/attendance', attendanceRoutes)
app.use("/api/departments", departmentRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        server: "running"
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

async function startServer() {
    try {
        await connectDB();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log(`EmployEase server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Startup failed:", error.message);
        process.exit(1);
    }
}

startServer();
