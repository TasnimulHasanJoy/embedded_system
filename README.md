# Embedded System Backend API

A Node.js and Express API that reads the latest sensor and blind settings from ThingSpeak and lets clients update the blind status and wake-up time.

## Features

- Reads the latest ThingSpeak values for fields 1–5.
- Converts the latest wake-up time from decimal hours to `HH:MM` for the API response.
- Writes wake-up time updates to `field5` as decimal hours.
- Writes blind status updates to `field4` using the current provisional mapping below.

## Requirements

- Node.js and npm
- A ThingSpeak channel and its read/write API keys

## Setup

Open a terminal in the backend project folder:

```powershell
cd C:\Embedded_System\backend-api
npm install
```

Create a `.env` file in the project root with your own ThingSpeak credentials and local port:

```dotenv
THINGSPEAK_CHANNEL_ID=3562909
THINGSPEAK_READ_API_KEY=your_read_api_key
THINGSPEAK_WRITE_API_KEY=your_write_api_key
PORT=3000
```

Keep `.env` private. It is excluded from Git by `.gitignore`; do not commit or share API keys.

After cloning the GitHub repository, run these commands from the folder containing `package.json` (the project root). The `C:\Embedded_System\backend-api` path above is the original local development location.

Start the server:

```powershell
node src/server.js
```

By default, the API is available at `http://localhost:3000`. Set `PORT` to use another port.

## API

All endpoints return JSON. The POST endpoints expect `Content-Type: application/json`.

### `GET /api/data`

Reads the latest values from ThingSpeak channel `3562909`: `field1` (motion), `field2` (light), `field3` (rain), `field4` (blind status), and `field5` (wake-up time).

Example request:

```http
GET http://localhost:3000/api/data
```

Example response:

```json
{
  "success": true,
  "data": {
    "motion": "1",
    "light": "75",
    "rain": "0",
    "blindStatus": "open",
    "wakeupTime": "08:30",
    "updatedAt": "2026-11-15T08:30:00Z"
  }
}
```

`updatedAt` is the most recent timestamp among the available field readings. Values may be `null` when ThingSpeak has no value for a field. Unknown status codes are returned as `"unknown"`.

If ThingSpeak cannot be reached, the API returns HTTP `502` with an error response.

### `POST /api/wakeup-time`

Validates a 24-hour `HH:MM` time and writes it to `field5` as decimal hours, rounded to four decimal places. For example, `08:30` is stored as `8.5000`.

```http
POST http://localhost:3000/api/wakeup-time
Content-Type: application/json
```

```json
{
  "wakeupTime": "08:30"
}
```

A successful response includes the submitted time and ThingSpeak entry ID. Invalid time formats receive HTTP `400`; a failed ThingSpeak update receives HTTP `502`.

### `POST /api/status`

Accepts one of the status strings below and writes its numeric code to `field4`:

| Request status | ThingSpeak value |
| --- | ---: |
| `closed` | `0` |
| `open` | `1` |
| `automatic` | `2` |

```http
POST http://localhost:3000/api/status
Content-Type: application/json
```

```json
{
  "status": "open"
}
```

A successful response includes the submitted status and ThingSpeak entry ID. Unsupported values receive HTTP `400`; a failed ThingSpeak update receives HTTP `502`.

## ThingSpeak field mapping

| Field | Meaning | Representation used by this API |
| --- | --- | --- |
| `field1` | Motion | Latest ThingSpeak value |
| `field2` | Light | Latest ThingSpeak value |
| `field3` | Rain | Latest ThingSpeak value |
| `field4` | Blind status | `0` = closed, `1` = open, `2` = automatic |
| `field5` | Wake-up time | Decimal hours; for example `08:30` = `8.5000` |

The `field4` status codes and `field5` decimal-hour format are the current provisional mapping. Confirm that the status and time encodings match the hardware team's implementation before integration. Hardware and wiring are outside this backend assignment's scope.

## Project structure

```text
backend-api/
├── src/
│   ├── routes/
│   │   ├── data.js
│   │   ├── settings.js
│   │   └── thingspeak.js
│   └── server.js
├── .env                 # Local secrets; do not commit
├── .gitignore
├── package.json
└── package-lock.json
```

## Dependencies

- Express — HTTP server and routes
- Axios — ThingSpeak HTTP requests
- dotenv — loads local environment variables from `.env`

