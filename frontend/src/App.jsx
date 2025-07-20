import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import axios from "axios";
import "./App.css";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapPin,
  Utensils,
  Clock,
  Cloud,
  TrafficCone,
  Bike,
  User,
  SlidersHorizontal,
  LocateFixed,
  Info,
  HelpCircle,
  GitMerge,
} from "lucide-react";

// --- LEAFLET ICON FIX ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// --- CUSTOM ICONS ---
const restaurantIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448609.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684809.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

// --- DATA ---
const restaurants = {
  "Pizza Place (MG Road)": { lat: 12.9716, lng: 77.5946 },
  "Burger Joint (Koramangala)": { lat: 12.9352, lng: 77.6146 },
  "Noodle House (HSR Layout)": { lat: 12.9279, lng: 77.6271 },
  "Curry Corner (Malleshwaram)": { lat: 13.0358, lng: 77.597 },
  "Sandwich Shop (Whitefield)": { lat: 12.949, lng: 77.7 },
};

// --- PAGE COMPONENTS ---

const Header = ({ currentPage, setCurrentPage }) => {
  const navLinks = [
    { name: "Predictor", id: "home" },
    { name: "How to Use", id: "usage" },
    { name: "About", id: "about" },
  ];

  return (
    <header className="bg-white shadow-lg sticky top-0 z-9999 border-b-2 border-orange-500">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <div className="bg-orange-500 p-2 rounded-full">
              <Bike className="h-8 w-8 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold text-gray-900">
              DeliveryPredict
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setCurrentPage(link.id)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  currentPage === link.id
                    ? "bg-orange-500 text-orange shadow-lg"
                    : "text-orange-700 hover:bg-orange-100 hover:text-orange-600"
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
};

const UsageGuide = () => (
  <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-500 hover:shadow-2xl">
    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
      <div className="bg-orange-500 p-2 rounded-full mr-3">
        <HelpCircle className="text-white" size={24} />
      </div>
      How to Use This Predictor
    </h2>
    <div className="space-y-6 text-gray-700">
      <div className="flex items-start group">
        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
          1
        </div>
        <div className="pt-1">
          <p className="text-lg">
            <strong className="text-gray-900">Set Your Location:</strong> Click
            the "Get My Location" button for automatic detection, or simply
            click anywhere on the map to place a pin for your delivery address.
          </p>
        </div>
      </div>
      <div className="flex items-start group">
        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
          2
        </div>
        <div className="pt-1">
          <p className="text-lg">
            <strong className="text-gray-900">Configure Your Order:</strong> Use
            the controls on the left to select a restaurant and estimate the
            food preparation time using the slider.
          </p>
        </div>
      </div>
      <div className="flex items-start group">
        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
          3
        </div>
        <div className="pt-1">
          <p className="text-lg">
            <strong className="text-gray-900">Get Your Prediction:</strong>{" "}
            Click the "Predict Delivery Time" button. The app will analyze
            real-time data and display the estimated delivery time with details
            like courier info, weather, and traffic conditions.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const AboutSection = () => (
  <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-500 hover:shadow-2xl">
    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
      <div className="bg-orange-500 p-2 rounded-full mr-3">
        <Info className="text-white" size={24} />
      </div>
      About This Project
    </h2>
    <p className="text-gray-700 mb-6 text-lg leading-relaxed">
      This Food Delivery Time Predictor is a full-stack web application designed
      to demonstrate the integration of a machine learning model with a modern
      web interface. It provides users with realistic estimates of food delivery
      times by leveraging real-time, external data sources.
    </p>
    <h3 className="text-xl font-bold text-gray-900 mb-4">Technology Stack</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-orange-500">
        <h4 className="font-semibold text-gray-900">Frontend</h4>
        <p className="text-gray-600">
          React with Vite, styled using Tailwind CSS
        </p>
      </div>
      <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-orange-500">
        <h4 className="font-semibold text-gray-900">Mapping</h4>
        <p className="text-gray-600">React-Leaflet for interactive maps</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-orange-500">
        <h4 className="font-semibold text-gray-900">Backend</h4>
        <p className="text-gray-600">Node.js with Express for the API server</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-orange-500">
        <h4 className="font-semibold text-gray-900">External APIs</h4>
        <p className="text-gray-600">Google Maps & OpenWeatherMap</p>
      </div>
    </div>
  </div>
);

const Footer = ({ setCurrentPage }) => (
  <footer className="bg-gray-900 text-white border-t-4 border-orange-500 mt-12">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <div className="flex items-center justify-center md:justify-start mb-4">
            <div className="bg-orange-500 p-2 rounded-full">
              <Bike className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold ml-2">DeliveryPredict</h3>
          </div>
          <p className="text-gray-400">
            Smarter delivery estimates using advanced algorithms and real-time
            data.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-orange-400 tracking-wider uppercase mb-4">
            Navigation
          </h3>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setCurrentPage("home")}
                className="text-red-300 hover:text-orange-400 transition-colors duration-200"
              >
                Predictor
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentPage("usage")}
                className="text-red-300 hover:text-orange-400 transition-colors duration-200"
              >
                How to Use
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentPage("about")}
                className="text-red-300 hover:text-orange-400 transition-colors duration-200"
              >
                About
              </button>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-orange-400 tracking-wider uppercase mb-4">
            Powered By
          </h3>
          <p className="text-gray-300">
            React, Node.js, and machine learning algorithms working together
            seamlessly.
          </p>
        </div>
      </div>
      <div className="mt-8 border-t border-gray-700 pt-6 text-center">
        <p className="text-gray-400">
          &copy; {new Date().getFullYear()} ETA Predict. All rights
          reserved.
        </p>
      </div>
    </div>
  </footer>
);

// --- LEAFLET HELPER COMPONENT ---
function LocationMarker({ userLocation, setUserLocation, mapRef }) {
  const map = useMapEvents({
    click(e) {
      setUserLocation(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo(userLocation, 13);
    }
  }, [userLocation, mapRef]);

  return userLocation === null ? null : (
    <Marker position={userLocation} icon={userIcon}>
      <Popup>Your Delivery Location</Popup>
    </Marker>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(
    Object.keys(restaurants)[0]
  );
  const [prepTime, setPrepTime] = useState(15);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");
  const mapRef = React.useRef(null);

  const handleGetLocation = () => {
    setIsLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);
      },
      (err) => {
        setError(`Could not get location: ${err.message}`);
        setIsLocating(false);
      }
    );
  };

  const handlePredict = async () => {
    if (!userLocation) {
      setError("Please select a delivery location on the map.");
      return;
    }
    setError("");
    setIsLoading(true);
    setPrediction(null);
    try {
      const response = await axios.post("https://gcp-learning-464207.el.r.appspot.com/api/predict", {
        userLat: userLocation.lat,
        userLon: userLocation.lng,
        restaurantName: selectedRestaurant,
        prepTime: Number(prepTime),
      });
      setPrediction(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to get prediction. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case "usage":
        return <UsageGuide />;
      case "about":
        return <AboutSection />;
      case "home":
      default:
        return (
          <div className="animate-in fade-in duration-700">
            {/* Top Row: Controls & Map */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Left Column: Controls */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:shadow-2xl h-full">
                  <h2 className="text-xl font-bold mb-6 flex items-center text-gray-900">
                    <SlidersHorizontal
                      className="mr-3 text-orange-500"
                      size={20}
                    />
                    Controls
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="restaurant"
                        className="block text-sm font-semibold text-gray-900 mb-2"
                      >
                        Restaurant
                      </label>
                      <select
                        id="restaurant"
                        value={selectedRestaurant}
                        onChange={(e) => setSelectedRestaurant(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white text-gray-900 font-medium"
                      >
                        {Object.keys(restaurants).map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="prepTime"
                        className="block text-sm font-semibold text-gray-900 mb-2"
                      >
                        Food Preparation Time:{" "}
                        <span className="text-orange-600 font-bold">
                          {prepTime} mins
                        </span>
                      </label>
                      <input
                        type="range"
                        id="prepTime"
                        min="5"
                        max="45"
                        value={prepTime}
                        onChange={(e) => setPrepTime(e.target.value)}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                        style={{
                          background: `linear-gradient(to right, #f97316 0%, #f97316 ${
                            ((prepTime - 5) / 40) * 100
                          }%, #e5e7eb ${
                            ((prepTime - 5) / 40) * 100
                          }%, #e5e7eb 100%)`,
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>5 min</span>
                        <span>45 min</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handlePredict}
                    disabled={isLoading || isLocating}
                    className="w-full mt-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 flex items-center justify-center shadow-lg transform hover:scale-105 disabled:scale-100"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Clock className="mr-2" size={20} />
                        Predict Delivery Time
                      </>
                    )}
                  </button>
                  {error && (
                    <p className="text-red-500 text-sm mt-3 bg-red-50 p-3 rounded-lg border border-red-200">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Map */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                  <h2 className="text-xl font-bold flex items-center text-gray-900">
                    <MapPin className="mr-3 text-orange-500" size={20} />
                    Select Delivery Location
                  </h2>
                  <button
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="flex items-center justify-center px-6 py-3 border-2 border-orange-500 text-sm font-semibold rounded-xl text-orange-600 bg-white hover:bg-orange-50 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-500 transition-all duration-200 transform hover:scale-105 disabled:scale-100"
                  >
                    <LocateFixed
                      className={`w-4 h-4 mr-2 ${
                        isLocating ? "animate-spin" : ""
                      }`}
                    />
                    {isLocating ? "Locating..." : "Get My Location"}
                  </button>
                </div>
                <div className="h-[300px] sm:h-[400px] lg:h-[calc(100%-88px)] rounded-xl overflow-hidden border-2 border-gray-200 shadow-inner">
                  <MapContainer
                    ref={mapRef}
                    center={[12.9716, 77.5946]}
                    zoom={12}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {Object.entries(restaurants).map(([name, { lat, lng }]) => (
                      <Marker
                        key={name}
                        position={[lat, lng]}
                        icon={restaurantIcon}
                      >
                        <Popup>{name}</Popup>
                      </Marker>
                    ))}
                    <LocationMarker
                      userLocation={userLocation}
                      setUserLocation={setUserLocation}
                      mapRef={mapRef}
                    />
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* Prediction/Loading Section */}
            <div className="mt-8">
              {/* Loading Card */}
              {isLoading && (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 text-center animate-pulse">
                  <div className="h-8 bg-gradient-to-r from-orange-200 to-orange-300 rounded w-1/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
                </div>
              )}

              {/* Prediction Card */}
              {prediction && !isLoading && (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-500 animate-in slide-in-from-bottom">
                  <h2 className="text-xl font-bold mb-6 text-center text-gray-900">
                    Prediction Result
                  </h2>
                  <div className="text-center my-6 bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <p className="text-gray-700 font-medium mb-2">
                      Estimated Delivery Time
                    </p>
                    <p className="text-6xl font-bold text-orange-600 mb-2">
                      {prediction.prediction}
                    </p>
                    <p className="text-gray-700 font-medium">minutes</p>
                  </div>
                  <div className="space-y-3 text-sm">
                    {[
                      {
                        icon: User,
                        label: "Courier",
                        value: `${prediction.assignedAgent.name} (${prediction.assignedAgent.experience} yrs)`,
                      },
                      {
                        icon: Bike,
                        label: "Vehicle",
                        value: prediction.assignedAgent.vehicle,
                      },
                      {
                        icon: MapPin,
                        label: "Distance",
                        value: `${prediction.distanceKm} km`,
                      },
                      {
                        icon: Clock,
                        label: "Travel Time",
                        value: `~${prediction.normalTimeText}`,
                      },
                      {
                        icon: Cloud,
                        label: "Weather",
                        value: prediction.weather,
                      },
                      {
                        icon: TrafficCone,
                        label: "Traffic",
                        value: prediction.trafficLevel,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <span className="font-semibold flex items-center text-gray-700">
                          <item.icon className="w-4 h-4 mr-3 text-orange-500" />
                          {item.label}
                        </span>
                        <span className="text-gray-900 font-medium">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans text-gray-800 flex flex-col">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        {renderContent()}
      </main>
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}
