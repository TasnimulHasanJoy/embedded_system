
const axios = require("axios");

const CHANNEL_ID = process.env.THINGSPEAK_CHANNEL_ID;
const READ_API_KEY = process.env.THINGSPEAK_READ_API_KEY;
const WRITE_API_KEY = process.env.THINGSPEAK_WRITE_API_KEY;

const BASE_URL = "https://api.thingspeak.com";

// Fetch the latest value of an individual field
async function getField(fieldNumber) {
    const response = await axios.get(
        `${BASE_URL}/channels/${CHANNEL_ID}/fields/${fieldNumber}/last.json`,
        {
            params: { api_key: READ_API_KEY },
            timeout: 10000
        }
    );

    return {
        value: response.data[`field${fieldNumber}`],
        updatedAt: response.data.created_at
    };
}

// Convert decimal hours into HH:MM
function formatTime(value) {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const totalMinutes = Math.round(Number(value) * 60);

    if (!Number.isFinite(totalMinutes)) return null;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Get latest values from all five fields
async function getLatestData() {
    try {
        const fields = await Promise.all([
            getField(1),
            getField(2),
            getField(3),
            getField(4),
            getField(5)
        ]);

        const statusMap = {
            "0": "closed",
            "1": "open",
            "2": "automatic"
        };

        const rawStatus = fields[3].value;

        return {
            motion: fields[0].value,
            light: fields[1].value,
            rain: fields[2].value,
            blindStatus: rawStatus == null
                ? null
                : statusMap[String(rawStatus)] ?? "unknown",
            wakeupTime: formatTime(fields[4].value),
            updatedAt: fields
                .map(field => field.updatedAt)
                .filter(Boolean)
                .sort()
                .at(-1) || null
        };

    } catch (error) {
        console.error("ThingSpeak Read Error:", error.message);
        throw new Error("Unable to fetch ThingSpeak data");
    }
}

// Update a specific field
async function updateThingSpeakField(fieldName, value) {
    try {
        const payload = new URLSearchParams();

        payload.append("api_key", WRITE_API_KEY);
        payload.append(fieldName, String(value));

        const response = await axios.post(
            `${BASE_URL}/update`,
            payload,
            { timeout: 10000 }
        );

        const entryId = Number(response.data);

        if (!Number.isInteger(entryId) || entryId <= 0) {
            throw new Error("ThingSpeak rejected the update");
        }

        return entryId;

    } catch (error) {
        console.error("ThingSpeak Write Error:", error.message);
        throw new Error("Unable to update ThingSpeak");
    }
}

module.exports = {
    getLatestData,
    updateThingSpeakField
};
