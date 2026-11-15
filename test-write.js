
require("dotenv").config();
const axios = require("axios");

async function sendTestData() {
    try {
        const data = new URLSearchParams({
            api_key: process.env.THINGSPEAK_WRITE_API_KEY,
            field1: "1",
            field2: "75",
            field3: "0",
            field4: "1",
            field5: "7.5"
        });

        const response = await axios.post(
            "https://api.thingspeak.com/update",
            data
        );

        if (response.data === 0) {
            throw new Error("ThingSpeak rejected the update");
        }

        console.log("Test data sent successfully!");
        console.log("Entry ID:", response.data);

    } catch (error) {
        console.error("Error:", error.message);
    }
}

sendTestData();
