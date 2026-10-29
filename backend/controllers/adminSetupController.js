const User = require("../models/User");

async function setupAdmin(req, res) {
    try {
        const { email, setupSecret } = req.body;

        if (
            !process.env.ADMIN_SETUP_SECRET ||
            setupSecret !== process.env.ADMIN_SETUP_SECRET
        ) {
            return res.status(403).json({
                success: false,
                message: "Invalid setup secret"
            });
        }

        const existingAdmin = await User.findOne({ role: "admin" });

        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "An admin already exists"
            });
        }

        const user = await User.findOne({
            email: String(email || "").trim().toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Register this user before admin setup"
            });
        }

        user.role = "admin";
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Admin account configured successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Admin setup error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Admin setup failed"
        });
    }
}

module.exports = setupAdmin;
