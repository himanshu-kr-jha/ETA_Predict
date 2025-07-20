const express = require("express");
const cors = require("cors");
// const bodyParser = require('body-parser'); // This is no longer needed
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
// Use the modern, built-in Express middleware for parsing JSON.
// This is the key fix for the "req.body is undefined" error.
app.use(cors());
app.use(express.json());

// --- Data from your Python script ---
const restaurants = {
  "Pizza Place (MG Road)": { lat: 12.9716, lng: 77.5946 },
  "Burger Joint (Koramangala)": { lat: 12.9352, lng: 77.6146 },
  "Noodle House (HSR Layout)": { lat: 12.9279, lng: 77.6271 },
  "Curry Corner (Malleshwaram)": { lat: 13.0358, lng: 77.597 },
  "Sandwich Shop (Whitefield)": { lat: 12.949, lng: 77.7 },
};

const deliveryAgents = [
  { name: "Rohan", experience: 1, vehicle: "Bike" },
  { name: "Priya", experience: 5, vehicle: "Scooter" },
  { name: "Amit", experience: 3, vehicle: "Bike" },
  { name: "Sunita", experience: 8, vehicle: "Car" },
  { name: "Vikram", experience: 0.5, vehicle: "Scooter" },
  { name: "Deepa", experience: 4, vehicle: "Bike" },
];

// --- Helper Functions (converted from Python) ---
const getSimpleWeather = (weatherMain) => {
  const main = weatherMain.toLowerCase();
  if (main.includes("clear")) return "Clear";
  if (main.includes("clouds") || main.includes("mist") || main.includes("haze"))
    return "Cloudy";
  if (
    main.includes("rain") ||
    main.includes("drizzle") ||
    main.includes("thunderstorm")
  )
    return "Rainy";
  return "Clear";
};

const getTrafficLevel = (trafficDuration, normalDuration) => {
  if (!trafficDuration || !normalDuration) return "Medium";
  if (trafficDuration <= normalDuration * 1.2) return "Low";
  if (trafficDuration <= normalDuration * 1.5) return "Medium";
  return "High";
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";
  return "Night";
};

// --- API Endpoint ---
app.post("/api/predict", async (req, res) => {
  try {
    const { userLat, userLon, restaurantName, prepTime } = req.body;

    if (!userLat || !userLon || !restaurantName || prepTime === undefined) {
      return res.status(400).json({ error: "Missing required parameters." });
    }

    // 1. Get Restaurant and Agent Details
    const restaurant = restaurants[restaurantName];
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found." });
    }
    const assignedAgent =
      deliveryAgents[Math.floor(Math.random() * deliveryAgents.length)];

    // 2. Fetch Google Maps Data
    const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    const mapsUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${restaurant.lat},${restaurant.lng}&destinations=${userLat},${userLon}&departure_time=now&key=${mapsApiKey}`;
    const mapsResponse = await axios.get(mapsUrl);
    const element = mapsResponse.data.rows[0].elements[0];

    if (element.status !== "OK") {
      return res
        .status(500)
        .json({ error: "Could not calculate route from Google Maps." });
    }

    const distanceKm = element.distance.value / 1000;
    const durationInTrafficSec = element.duration_in_traffic.value;
    const durationSec = element.duration.value;
    const normalTimeText = element.duration.text;

    // 3. Fetch Weather Data
    const weatherApiKey = process.env.OPENWEATHER_API_KEY;
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${userLat}&lon=${userLon}&appid=${weatherApiKey}`;
    const weatherResponse = await axios.get(weatherUrl);
    const weatherMain = weatherResponse.data.weather[0].main;

    // 4. Process Data
    const weather = getSimpleWeather(weatherMain);
    const trafficLevel = getTrafficLevel(durationInTrafficSec, durationSec);
    const timeOfDay = getTimeOfDay();

    // 5.  Call the ML Model Endpoint (as in the python script)
    // IMPORTANT: Replace with your actual Cloud Run URL if you have one.
    // If not, we will simulate a prediction.
    let prediction;
    const cloudRunUrl = process.env.CLOUD_RUN_URL; // e.g., "https://prediction-server-xyz.run.app/predict"

    if (cloudRunUrl) {
      const payload = {
        Distance_km: distanceKm,
        Weather: weather,
        Traffic_Level: trafficLevel,
        Time_of_Day: timeOfDay,
        Vehicle_Type: assignedAgent.vehicle,
        Preparation_Time_min: prepTime,
        Courier_Experience_yrs: assignedAgent.experience,
      };
      const predictionResponse = await axios.post(cloudRunUrl, payload);
      prediction = predictionResponse.data.predicted_delivery_time_min;
    } else {
      // Fallback: Simple calculation if no ML model URL is provided
      let time = prepTime + durationSec / 60;
      if (trafficLevel === "Medium") time *= 1.1;
      if (trafficLevel === "High") time *= 1.3;
      if (weather === "Rainy") time *= 1.2;
      prediction = Math.round(time);
    }

    // 6. Send Response
    res.json({
      distanceKm: distanceKm.toFixed(1),
      weather,
      trafficLevel,
      timeOfDay,
      assignedAgent,
      normalTimeText,
      prediction: Math.round(prediction),
    });
  } catch (error) {
    console.error("Error in /api/predict:", error.message);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
