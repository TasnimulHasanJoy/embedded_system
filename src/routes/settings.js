
const express = require("express");
const router = express.Router();

const {
    updateThingSpeakField
} = require("./thingspeak");

// POST: Update wake-up time
router.post("/wakeup-time", async (req, res) => {
    try {
        const { wakeupTime } = req.body;

        if (
            typeof wakeupTime !== "string" ||
            !/^([01]\d|2[0-3]):[0-5]\d$/.test(wakeupTime)
        ) {
            return res.status(400).json({
                success: false,
                error: "Use HH:MM format"
            });
        }

        const [hours, minutes] = wakeupTime.split(":").map(Number);

        const decimalTime = (
            hours + minutes / 60
        ).toFixed(4);

        const entryId = await updateThingSpeakField(
            "field5",
            decimalTime
        );

        res.json({
            success: true,
            message: "Wake-up time updated",
            wakeupTime,
            entryId
        });

    } catch (error) {
        res.status(502).json({
            success: false,
            error: error.message
        });
    }
});

// POST: Update blind status
router.post("/status", async (req, res) => {
    try {
        const { status } = req.body;

        const statusCodes = {
            closed: 0,
            open: 1,
            automatic: 2
        };

        if (
            typeof status !== "string" ||
            !Object.hasOwn(statusCodes, status)
        ) {
            return res.status(400).json({
                success: false,
                error: "Use open, closed or automatic"
            });
        }

        const entryId = await updateThingSpeakField(
            "field4",
            statusCodes[status]
        );

        res.json({
            success: true,
            message: "Blind status updated",
            status,
            entryId
        });

    } catch (error) {
        res.status(502).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
