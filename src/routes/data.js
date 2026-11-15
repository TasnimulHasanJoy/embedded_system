
const express = require("express");
const router = express.Router();

const { getLatestData } = require("./thingspeak");

// GET: Fetch latest sensor and system data
router.get("/", async (req, res) => {
    try {
        const data = await getLatestData();

        res.status(200).json({
            success: true,
            data: {
                motion: data.motion,
                light: data.light,
                rain: data.rain,
                blindStatus: data.blindStatus,
                wakeupTime: data.wakeupTime,
                updatedAt: data.updatedAt
            }
        });

    } catch (error) {
        console.error("Data API Error:", error.message);

        res.status(502).json({
            success: false,
            error: "Unable to retrieve data from ThingSpeak"
        });
    }
});

module.exports = router;
