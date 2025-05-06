import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Viewer, Entity, CameraFlyTo } from "resium";
import { Cartesian3, Ion, IonResource } from "cesium";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import CloseIcon from "@mui/icons-material/Close";
import "./App.css";

// Set your Cesium ion access token here
Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYWE1OWUxNy1mMWZiLTQzYjYtYTQ0OS1kMWFjYmFkNjc5YzciLCJpZCI6NTc3MzMsImlhdCI6MTYyMjY0NjQ2NH0.XcKpgANiY19MC4bdFUXMVEBToBmBLyq7_B1KkFgwF7Y";

const PlaceholderShutter = ({ isOpen, toggleShutter }) => {
  return (
    <div className={`shutter ${isOpen ? "open" : ""}`}>
      <Button
        variant="outline-light"
        className="shutter-close-btn"
        onClick={toggleShutter}
      >
        <CloseIcon />
      </Button>
      <div className="shutter-content">
        <h3>CLASSIFIED</h3>
        <p>Access restricted</p>
      </div>
    </div>
  );
};

const ShutterButton = ({ onClick }) => {
  return (
    <Button
      variant="outline-secondary"
      size="sm"
      className="shutter-btn"
      onClick={onClick}
    >
      Classify
    </Button>
  );
};

const CardWithShutter = ({ title, children }) => {
  const [shutterOpen, setShutterOpen] = useState(false);

  const toggleShutter = () => setShutterOpen(!shutterOpen);

  return (
    <Card className="custom-card mb-4 position-relative">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="m-0">{title}</h5>
        <ShutterButton onClick={toggleShutter} />
      </Card.Header>
      <Card.Body>{children}</Card.Body>
      <PlaceholderShutter isOpen={shutterOpen} toggleShutter={toggleShutter} />
    </Card>
  );
};
const LocationSearch = ({ onLocationSubmit }) => {
  const [location, setLocation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) {
      onLocationSubmit(location);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Control
          type="text"
          placeholder="Enter mountain peak (e.g., 'Mount Everest')"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="custom-input"
        />
      </Form.Group>
      <Button variant="primary" type="submit" className="mt-2 w-100">
        Locate Target
      </Button>
    </Form>
  );
};

const WeatherInfo = ({ location }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        // This is a mock API call
        // In production, replace with actual API like OpenWeatherMap
        // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=YOUR_API_KEY&units=metric`);

        // Simulating API response
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockData = {
          main: {
            temp: Math.floor(Math.random() * 15) - 5,
            humidity: Math.floor(Math.random() * 30) + 50,
          },
          wind: { speed: Math.floor(Math.random() * 10) + 5 },
          weather: [{ description: "Scattered clouds", icon: "03d" }],
          visibility: 10000,
        };

        setWeather(mockData);
        setError(null);
      } catch (err) {
        setError("Failed to fetch weather data. Try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [location]);

  if (loading)
    return (
      <div className="text-center py-4">Establishing satellite link...</div>
    );
  if (error) return <div className="text-danger">{error}</div>;
  if (!weather)
    return (
      <div className="text-center py-4">
        Weather intelligence awaiting coordinates
      </div>
    );

  return (
    <div className="weather-container">
      <Row className="align-items-center">
        <Col xs={8}>
          <h6 className="mb-0">Current Conditions</h6>
          <p className="text-capitalize mb-0">
            {weather.weather[0].description}
          </p>
        </Col>
        <Col xs={4} className="text-center">
          <div className="temperature">{Math.round(weather.main.temp)}°C</div>
        </Col>
      </Row>

      <hr className="my-3" />

      <Row className="weather-details">
        <Col xs={6}>
          <div className="detail-label">Wind</div>
          <div className="detail-value">{weather.wind.speed} m/s</div>
        </Col>
        <Col xs={6}>
          <div className="detail-label">Humidity</div>
          <div className="detail-value">{weather.main.humidity}%</div>
        </Col>
        <Col xs={6}>
          <div className="detail-label">Visibility</div>
          <div className="detail-value">{weather.visibility / 1000} km</div>
        </Col>
      </Row>
    </div>
  );
};

const NotesEditor = () => {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem("mountainAdventureNotes");
    return (
      savedNotes ||
      "## Mission Notes\n\nRecord observations and intelligence here..."
    );
  });

  const handleChange = (value) => {
    setNotes(value);
    localStorage.setItem("mountainAdventureNotes", value);
  };

  const options = {
    spellChecker: false,
    placeholder: "Enter your notes here...",
    status: false,
    autofocus: false,
    toolbar: [
      "bold",
      "italic",
      "heading",
      "|",
      "unordered-list",
      "ordered-list",
      "|",
      "link",
    ],
  };

  return <SimpleMDE value={notes} onChange={handleChange} options={options} />;
};

const TerrainViewer = ({ location, coordinates }) => {
  const viewerRef = useRef(null);

  if (!coordinates) {
    return (
      <div className="terrain-placeholder">
        <div className="terrain-message">
          <h4>Awaiting Target Coordinates</h4>
          <p>Enter mountain peak location to activate terrain intelligence</p>
        </div>
      </div>
    );
  }
  return (
    <div className="terrain-viewer">
      <Viewer
        ref={viewerRef}
        full
        terrainProvider={new Cesium.createWorldTerrain()}
        timeline={false}
        animation={false}
        homeButton={false}
        sceneModePicker={false}
        baseLayerPicker={true}
        navigationHelpButton={false}
        geocoder={false}
      >
        <Entity
          name={location}
          position={Cartesian3.fromDegrees(
            coordinates.longitude,
            coordinates.latitude
          )}
          point={{ pixelSize: 10, color: Cesium.Color.RED }}
        />
        <CameraFlyTo
          destination={Cartesian3.fromDegrees(
            coordinates.longitude,
            coordinates.latitude,
            coordinates.height || 10000
          )}
          orientation={{
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-25),
          }}
        />
      </Viewer>
    </div>
  );
};

const App = () => {
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [terrainShutterOpen, setTerrainShutterOpen] = useState(false);

  const handleLocationSubmit = async (locationName) => {
    setLocation(locationName);

    // Mock geocoding - in production use a real service like Google Geocoding API
    // This simulates finding coordinates for famous mountains
    const mockCoordinates = {
      "mount everest": { latitude: 27.9881, longitude: 86.925, height: 20000 },
      k2: { latitude: 35.8818, longitude: 76.5133, height: 20000 },
      matterhorn: { latitude: 45.9766, longitude: 7.6586, height: 12000 },
      denali: { latitude: 63.0695, longitude: -151.0074, height: 15000 },
      "mont blanc": { latitude: 45.8326, longitude: 6.8652, height: 12000 },
    };

    const normalizedLocation = locationName.toLowerCase();

    // Default to a random mountain location if not found
    if (mockCoordinates[normalizedLocation]) {
      setCoordinates(mockCoordinates[normalizedLocation]);
    } else {
      // Random coordinates for mountains not in our mock database
      setCoordinates({
        latitude: 40 + (Math.random() * 20 - 10),
        longitude: -100 + (Math.random() * 40 - 20),
        height: 10000 + Math.random() * 10000,
      });
    }
  };
  return (
    <div className="app-container">
      <header className="app-header">
        <Container fluid>
          <h1 className="app-title">MOUNTAIN INTELLIGENCE HUB</h1>
          <p className="app-subtitle">TOP SECRET - AUTHORIZED ACCESS ONLY</p>
        </Container>
      </header>

      <Container fluid className="main-content">
        <Row>
          <Col md={4} className="left-panel">
            <CardWithShutter title="MISSION COORDINATES">
              <LocationSearch onLocationSubmit={handleLocationSubmit} />
            </CardWithShutter>

            <CardWithShutter title="WEATHER INTELLIGENCE">
              <WeatherInfo location={location} />
            </CardWithShutter>

            <CardWithShutter title="FIELD NOTES">
              <NotesEditor />
            </CardWithShutter>
          </Col>

          <Col md={8} className="right-panel position-relative">
            <div className="terrain-container">
              <div className="terrain-header d-flex justify-content-between align-items-center">
                <h5>{location || "Terrain Intelligence"}</h5>
                <ShutterButton
                  onClick={() => setTerrainShutterOpen(!terrainShutterOpen)}
                />
              </div>
              <TerrainViewer location={location} coordinates={coordinates} />
              <PlaceholderShutter
                isOpen={terrainShutterOpen}
                toggleShutter={() => setTerrainShutterOpen(!terrainShutterOpen)}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default App;
