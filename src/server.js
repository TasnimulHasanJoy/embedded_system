
require("dotenv").config();

const express = require("express");

const dataRoutes = require("./routes/data");
const settingsRoutes = require("./routes/settings");

const app = express();

app.use(express.json());

// Main route
app.get("/", (req, res) => {
    res.json({
        message: "Embedded System API is running!"
    });
});

// GET sensor data
app.use("/api/data", dataRoutes);

// POST wake-up time and blind status
app.use("/api", settingsRoutes);

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found"
    });
});

// Handle invalid JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400) {
        return res.status(400).json({
            success: false,
            error: "Invalid JSON format"
        });
    }

    next(err);
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
});
