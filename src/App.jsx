import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Search, User, MapPin, Truck, Store, ArrowRight, Star, Utensils, Coffee, Pizza, Salad, IceCream, Beef, Navigation, MapIcon, X, CheckCircle2, Clock, Home, Plus, Minus, Heart, Filter, Phone, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import LoginPage from './LoginPage';
import AdminDashboard from './AdminDashboard';
import OffersPage from './OffersPage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import MFASetup from './components/MFASetup';
import OTPVerification from './components/OTPVerification';
import UserDashboard from './components/UserDashboard';
import RestaurantDetails from './components/RestaurantDetails';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderConfirmation from './components/OrderConfirmation';
import ChatbotPopup from './components/ChatbotPopup';
import axios from 'axios';

// Export SiteHeader so it can be imported in other components
export const SiteHeader = () => {
  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('welcomeShown');
    
    toast.success('Logged out successfully!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
    
    window.location.href = '/';
  };

  const userName = localStorage.getItem('userName');

  return (
    <header className="fixed top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-gray-200/20">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 text-transparent bg-clip-text">
            FoodieHub
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link to="/" className="text-gray-800 hover:text-orange-600 transition-colors">Home</Link>
          <Link to="/restaurants" className="text-gray-800 hover:text-orange-600 transition-colors">Restaurants</Link>
          <Link to="/offers" className="text-gray-800 hover:text-orange-600 transition-colors">Offers</Link>
          <Link to="/restaurants" className="text-gray-800 hover:text-orange-600 transition-colors">Explore Cuisines</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search for food..."
              className="w-[300px] pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:border-orange-500 transition-colors"
            />
          </div>
          {userName ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hello, {userName.split(' ')[0]}</span>
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-orange-600 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2 rounded-full flex items-center"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2 rounded-full flex items-center">
              <User className="mr-2 h-4 w-4" />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

// Map Selector Component
const MapSelector = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState(localStorage.getItem('selectedAddress') || 'KL University, Guntur, Andhra Pradesh, India');
  const [selectedLocation, setSelectedLocation] = useState({
    lat: parseFloat(localStorage.getItem('selectedLat')) || 16.4419,
    lng: parseFloat(localStorage.getItem('selectedLng')) || 80.6226
  });
  const mapRef = useRef(null);

  // Custom Leaflet marker icon
  const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const mockLocations = [
    { name: "KL University", address: "KL University, Guntur, Andhra Pradesh, India", lat: 16.4419, lng: 80.6226 },
    { name: "Vijayawada", address: "Vijayawada, Krishna District, Andhra Pradesh, India", lat: 16.5062, lng: 80.6480 },
    { name: "Guntur", address: "Guntur, Andhra Pradesh, India", lat: 16.3067, lng: 80.4365 }
  ];

  const handleSaveLocation = () => {
    if (address) {
      localStorage.setItem('selectedAddress', address);
      localStorage.setItem('selectedLat', selectedLocation.lat);
      localStorage.setItem('selectedLng', selectedLocation.lng);
      toast.success('Location saved successfully!', {
        position: "top-right",
        autoClose: 2000
      });
      navigate('/');
    } else {
      toast.error('Please select a location first', {
        position: "top-right",
        autoClose: 2000
      });
    }
  };

  const selectSavedLocation = (location) => {
    setSelectedLocation({ lat: location.lat, lng: location.lng });
    setAddress(location.address);
    
    if (mapRef.current) {
      mapRef.current.setView([location.lat, location.lng], 15);
    }
  };

  // Component for map click events
  const LocationMarker = () => {
    const map = useMap();
    mapRef.current = map;
    
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setSelectedLocation({ lat, lng });
        
        // Reverse geocoding using Nominatim (OpenStreetMap's free geocoder)
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
          .then(response => response.json())
          .then(data => {
            if (data && data.display_name) {
              setAddress(data.display_name);
            }
          })
          .catch(error => {
            console.error("Error with geocoding:", error);
            setAddress(`Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          });
      }
    });

    return selectedLocation ? (
      <Marker 
        position={[selectedLocation.lat, selectedLocation.lng]} 
        icon={customIcon}
      >
        <Popup>Selected location</Popup>
      </Marker>
    ) : null;
  };

  // Map control buttons component
  const MapControls = () => {
    const map = useMap();
    
    return (
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-1000">
        <button 
          className="map-control"
          onClick={() => map.zoomIn()}
        >
          <Plus size={20} />
        </button>
        <button 
          className="map-control"
          onClick={() => map.zoomOut()}
        >
          <Minus size={20} />
        </button>
        <button 
          className="map-control"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  };
                  setSelectedLocation(pos);
                  map.setView([pos.lat, pos.lng], 15);
                  
                  // Get address for the location
                  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}&zoom=18&addressdetails=1`)
                    .then(response => response.json())
                    .then(data => {
                      if (data && data.display_name) {
                        setAddress(data.display_name);
                      }
                    })
                    .catch(error => {
                      console.error("Error with geocoding:", error);
                      setAddress(`Current location`);
                    });
                },
                () => {
                  toast.error("Error getting your location");
                }
              );
            }
          }}
        >
          <Navigation size={20} />
        </button>
      </div>
    );
  };

  // Search handler using Nominatim
  const handleSearch = () => {
    if (address.trim() === '') return;
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const location = data[0];
          const lat = parseFloat(location.lat);
          const lng = parseFloat(location.lon);
          
          setSelectedLocation({ lat, lng });
          setAddress(location.display_name);
          
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 15);
          }
        } else {
          toast.error("Location not found. Try a different search term.");
        }
      })
      .catch(error => {
        console.error("Error with geocoding search:", error);
        toast.error("Error searching for location. Please try again.");
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
            <h1 className="text-2xl font-bold">Select Delivery Location</h1>
          </div>
          <button 
            onClick={handleSaveLocation}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full flex items-center"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Save Location
          </button>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* OpenStreetMap Display */}
          <div className="flex-grow lg:w-2/3 h-[350px] md:h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow-lg bg-white relative">
            <MapContainer 
              center={[16.4419, 80.6226]} 
              zoom={15} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker />
              <MapControls />
            </MapContainer>
          </div>

          {/* Location Selection */}
          <div className="lg:w-1/3">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
              <div className="relative mb-6">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-14 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                    placeholder="Enter or search your location"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  {address && (
                    <button 
                      onClick={() => setAddress('')}
                      className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  )}
                  <button 
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 p-1 rounded-full transition-colors"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Saved Places</h3>
                <div className="space-y-2 location-list max-h-[250px] overflow-y-auto">
                  {mockLocations.map((location, index) => (
                    <div 
                      key={index}
                      onClick={() => selectSavedLocation(location)}
                      className={`location-card p-3 rounded-lg cursor-pointer flex items-start transition-colors ${
                        address === location.address ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      {location.name === "KL University" ? (
                        <Home className={`mr-2 mt-1 flex-shrink-0 ${address === location.address ? 'text-orange-500' : 'text-gray-400'}`} size={18} />
                      ) : (
                        <MapPin className={`mr-2 mt-1 flex-shrink-0 ${address === location.address ? 'text-orange-500' : 'text-gray-400'}`} size={18} />
                      )}
                      <div>
                        <p className="font-medium">{location.name}</p>
                        <p className="text-sm text-gray-500 line-clamp-2">{location.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [deliveryType, setDeliveryType] = React.useState('delivery');
  const [showingNearbyOptions, setShowingNearbyOptions] = React.useState(false);
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userName = localStorage.getItem('userName');
  const savedAddress = localStorage.getItem('selectedAddress') || 'KL University, Guntur, Andhra Pradesh, India';
  const savedLat = parseFloat(localStorage.getItem('selectedLat')) || 16.4419;
  const savedLng = parseFloat(localStorage.getItem('selectedLng')) || 80.6226;
  
  // Pizza rotation states
  const [pizzaRotation, setPizzaRotation] = React.useState(0);
  const pizzaRef = React.useRef(null);
  const prevAngleRef = React.useRef(0);
  const totalRotationRef = React.useRef(0);
  const [isMouseMoving, setIsMouseMoving] = React.useState(false);
  const mouseIdleTimerRef = React.useRef(null);
  const autoRotationRef = React.useRef(null);
  
  // Set up automatic rotation with slower speed
  React.useEffect(() => {
    // Function for automatic rotation
    const rotateAutomatically = () => {
      if (!isMouseMoving) {
        // Rotate 0.2 degrees every frame for a slower continuous rotation (reduced from 0.5)
        totalRotationRef.current += 0.2;
        setPizzaRotation(totalRotationRef.current);
        autoRotationRef.current = requestAnimationFrame(rotateAutomatically);
      }
    };
    
    // Start automatic rotation
    autoRotationRef.current = requestAnimationFrame(rotateAutomatically);
    
    // Cleanup
    return () => {
      if (autoRotationRef.current) {
        cancelAnimationFrame(autoRotationRef.current);
      }
      if (mouseIdleTimerRef.current) {
        clearTimeout(mouseIdleTimerRef.current);
      }
    };
  }, [isMouseMoving]);
  
  // Mouse movement handler with reduced wait time
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (pizzaRef.current) {
        // Set mouse as moving
        setIsMouseMoving(true);
        
        // Cancel automatic rotation
        if (autoRotationRef.current) {
          cancelAnimationFrame(autoRotationRef.current);
        }
        
        // Clear any existing idle timer
        if (mouseIdleTimerRef.current) {
          clearTimeout(mouseIdleTimerRef.current);
        }
        
        const rect = pizzaRef.current.getBoundingClientRect();
        // Calculate the center of the pizza element
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        // Calculate the angle between the mouse pointer and the center (in degrees)
        const rawAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        
        // Convert to 0-360 range
        const currentAngle = rawAngle < 0 ? rawAngle + 360 : rawAngle;
        
        // Handle the case when crossing the 0/360 boundary
        if (Math.abs(currentAngle - prevAngleRef.current) > 270) {
          // We crossed the boundary - adjust total rotation
          if (prevAngleRef.current > 270 && currentAngle < 90) {
            // Moving clockwise across boundary
            totalRotationRef.current += (currentAngle + (360 - prevAngleRef.current));
          } else if (prevAngleRef.current < 90 && currentAngle > 270) {
            // Moving counter-clockwise across boundary
            totalRotationRef.current -= ((360 - currentAngle) + prevAngleRef.current);
          }
        } else {
          // Normal case - add the difference
          totalRotationRef.current += (currentAngle - prevAngleRef.current);
        }
        
        // Store current angle for next comparison
        prevAngleRef.current = currentAngle;
        
        // Use requestAnimationFrame for smoother animation
        requestAnimationFrame(() => {
          setPizzaRotation(totalRotationRef.current);
        });
        
        // Set a timer to detect when mouse stops moving - reduced from 2000ms to 500ms
        mouseIdleTimerRef.current = setTimeout(() => {
          setIsMouseMoving(false);
        }, 500);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup the listener when the component unmounts
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseIdleTimerRef.current) {
        clearTimeout(mouseIdleTimerRef.current);
      }
      if (autoRotationRef.current) {
        cancelAnimationFrame(autoRotationRef.current);
      }
    };
  }, []);
  
  // Search for nearby places using restaurant API instead of OpenStreetMap
  React.useEffect(() => {
    if (showingNearbyOptions) {
      searchNearbyRestaurants();
    }
  }, [showingNearbyOptions]);
  
  const searchNearbyRestaurants = () => {
    setIsLoadingPlaces(true);
    
    // Using our backend API to get restaurants instead of OpenStreetMap
    const API_URL = 'http://localhost:8080/api';
    
    axios.get(`${API_URL}/restaurants`)
      .then(response => {
        if (response.data && response.data.length > 0) {
          // Format results to match our structure
          const formattedResults = response.data.map(restaurant => ({
            id: restaurant.id,
            name: restaurant.name,
            address: restaurant.address || "Address not available",
            distance: calculateDistance(
              savedLat,
              savedLng,
              restaurant.lat || savedLat + (Math.random() - 0.5) * 0.05,
              restaurant.lng || savedLng + (Math.random() - 0.5) * 0.05,
            ),
            eta: restaurant.deliveryTime || generateETA(
              restaurant.lat || savedLat + (Math.random() - 0.5) * 0.05, 
              restaurant.lng || savedLng + (Math.random() - 0.5) * 0.05
            )
          }));
          
          // Filter by search query if provided
          let filtered = formattedResults;
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = formattedResults.filter(restaurant => 
              restaurant.name.toLowerCase().includes(query) ||
              restaurant.address.toLowerCase().includes(query)
            );
          }
          
          setNearbyRestaurants(filtered);
        } else {
          setNearbyRestaurants([]);
          toast.info("No restaurants found in your area.");
        }
        
        setIsLoadingPlaces(false);
      })
      .catch(error => {
        console.error("Error fetching restaurants:", error);
        setNearbyRestaurants([]);
        toast.error("Failed to load restaurants. Please try again later.");
        setIsLoadingPlaces(false);
      });
  };
  
  // Handle search input for restaurants
  const handleRestaurantSearch = (e) => {
    setSearchQuery(e.target.value);
    // Debounce the search to avoid too many API calls
    const debounceTimeout = setTimeout(() => {
      searchNearbyRestaurants();
    }, 500);
    
    return () => clearTimeout(debounceTimeout);
  };

  // Helper function to calculate rough distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Simple distance calculation using Haversine formula
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance.toFixed(1) + " mi";
  };
  
  // Generate a realistic ETA based on distance
  const generateETA = (lat, lng) => {
    const distance = calculateDistance(savedLat, savedLng, lat, lng);
    const distanceValue = parseFloat(distance);
    
    // Rough estimate: 5 minutes per mile + 10 minutes preparation
    const minTime = Math.round(distanceValue * 5 + 10);
    const maxTime = Math.round(minTime * 1.3); // Add 30% buffer
    
    return `${minTime}-${maxTime} min`;
  };
  
  // Handle delivery type change with toast notification
  const handleDeliveryTypeChange = (type) => {
    if (type !== deliveryType) {
      setDeliveryType(type);
      
      // Show different toast messages based on the selected type
      if (type === 'delivery') {
        toast.info('Switched to delivery mode! 🚚', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "🚚"
        });
        setShowingNearbyOptions(false);
      } else {
        toast.info('Switched to pickup mode! 🏪', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: "🏪"
        });
        setShowingNearbyOptions(true);
      }
    }
  };

  // Define different delivery/pickup options based on the selected type
  const deliveryOptions = {
    delivery: {
      placeholder: savedAddress || "Enter your delivery address",
      icon: <Truck className="mr-2 h-5 w-5" />,
      buttonText: "Deliver Now",
      timeEstimate: "20-35 min",
      tooltip: "Delivery to your doorstep"
    },
    pickup: {
      placeholder: "Find restaurants for pickup",
      icon: <Store className="mr-2 h-5 w-5" />,
      buttonText: "Find Restaurants",
      timeEstimate: "10-15 min",
      tooltip: "Ready for pickup"
    }
  };

  // Select current options based on the selected type
  const currentOptions = deliveryOptions[deliveryType];

  // Modified restaurant handling to navigate to restaurant details page
  const handleRestaurantSelect = (restaurant) => {
    if (!userName) {
      // Redirect to login if not logged in
      toast.error('Please login to view restaurants', {
        position: "top-right",
        autoClose: 2000
      });
      navigate('/login');
    } else {
      // Navigate to specific restaurant page instead of general restaurants list
      navigate(`/restaurants/${restaurant.id}`);
      toast.info(`Selected ${restaurant.name}`, {
        position: "top-right",
        autoClose: 2000
      });
    }
  };

  React.useEffect(() => {
    if (userName) {
      // Adding a reference check to avoid repeated notifications
      const hasShownWelcome = sessionStorage.getItem('welcomeShown');
      if (!hasShownWelcome) {
        toast.success(`Welcome back, ${userName}! 😊`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        // Mark as shown for this session
        sessionStorage.setItem('welcomeShown', 'true');
      }
    }
  }, [userName]); // Runs when userName changes

  // Modified to check login before proceeding
  const handleFindFoodClick = () => {
    if (!userName) {
      // Redirect to login if not logged in
      toast.error('Please login to view restaurants', {
        position: "top-right",
        autoClose: 2000
      });
      navigate('/login');
    } else {
      navigate('/restaurants');
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="parallax absolute inset-0" 
           style={{ backgroundImage: "url('/hero-bg.jpg')", transform: 'translateZ(0)' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/80 via-orange-400/70 to-yellow-300/60" />
      
      <div className="container mx-auto relative z-10 pt-24 pb-24 px-4">
        <div className="max-w-2xl backdrop-blur-sm bg-black/20 p-7 rounded-2xl border border-white/10 shadow-xl">
          <h2 className="text-6xl font-bold mb-5 leading-tight text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
            {userName ? (
              <div className="min-h-[120px] flex items-center">
                <span>Welcome, {userName.split(' ')[0]}!</span>
              </div>
            ) : (
              <>
                <span className="block">Discover</span>
                <span className="block">Local Flavors</span>
              </>
            )}
          </h2>
          <p className="text-xl mb-8 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] leading-relaxed">
            Experience the finest local cuisines delivered right to your doorstep.
            Start your culinary journey today.
          </p>

          <div className="backdrop-blur-md bg-white/80 rounded-2xl p-4 shadow-xl max-w-xl border border-white/20 transition-all duration-300 ease-in-out">
            <div className="flex gap-2 mb-5 relative">
              <div className="absolute h-full top-0 bottom-0 left-0 right-0 bg-gray-100 rounded-full -z-10" />
              <div 
                className={`absolute h-full top-0 bottom-0 rounded-full transition-all duration-300 ease-in-out -z-10 ${
                  deliveryType === 'delivery' ? 'left-0 right-1/2' : 'left-1/2 right-0'
                } bg-gradient-to-r from-orange-500 to-pink-500`} 
              />
              {['delivery', 'pickup'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleDeliveryTypeChange(type)}
                  className={`flex-1 rounded-full text-base py-2 px-4 flex items-center justify-center transition-all duration-300 ${
                    deliveryType === type
                      ? 'text-white font-medium transform scale-105'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {type === 'delivery' ? (
                    <Truck className={`mr-2 h-5 w-5 transition-all duration-300 ${deliveryType === type ? 'text-white' : 'text-gray-500'}`} />
                  ) : (
                    <Store className={`mr-2 h-5 w-5 transition-all duration-300 ${deliveryType === type ? 'text-white' : 'text-gray-500'}`} />
                  )}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Delivery Options or Pickup Options */}
            {!showingNearbyOptions ? (
              <div className="flex gap-3">
                <div className="flex-1 relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
                  <input
                    type="text"
                    placeholder={currentOptions.placeholder}
                    value={savedAddress || ""}
                    readOnly
                    className="w-full pl-11 pr-4 py-2.5 rounded-full text-base border border-gray-200 group-hover:border-orange-300 transition-all duration-300 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none cursor-pointer"
                    onClick={() => navigate('/map')}
                  />
                  {savedAddress && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Saved
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => navigate('/map')}
                  className="bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 rounded-full px-4 py-2.5 text-base flex items-center transition-all duration-300 hover:shadow-sm"
                >
                  <MapIcon className="h-5 w-5 mr-2" />
                  Pick on Map
                </button>
                <button 
                  onClick={handleFindFoodClick}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full px-6 py-2.5 text-base flex items-center transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                >
                  {currentOptions.buttonText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-3 border border-gray-100">
                <div className="mb-3 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search nearby restaurants"
                    className="w-full pl-9 pr-4 py-2 rounded-full text-sm border border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                    value={searchQuery}
                    onChange={handleRestaurantSearch}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        searchNearbyRestaurants();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                
                <div className="max-h-[200px] overflow-y-auto space-y-2 location-list">
                  {isLoadingPlaces ? (
                    <div className="py-4 text-center text-gray-500">Loading nearby restaurants...</div>
                  ) : nearbyRestaurants.length === 0 ? (
                    <div className="py-4 text-center text-gray-500">No restaurants found nearby</div>
                  ) : (
                    nearbyRestaurants.map((restaurant) => (
                      <div 
                        key={restaurant.id}
                        className="location-card flex items-center justify-between p-2 hover:bg-orange-50 rounded-lg cursor-pointer transition-colors"
                        onClick={() => handleRestaurantSelect(restaurant)}
                      >
                        <div className="flex items-center">
                          <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center mr-3">
                            <Store className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <h4 className="font-medium">{restaurant.name}</h4>
                            <p className="text-xs text-gray-500">{restaurant.address} • {restaurant.distance}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                        <div className="flex items-center text-sm text-gray-700">
                          <Clock className="h-4 w-4 mr-1 text-orange-500" />
                          {restaurant.eta}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pizza container: rotates based on the mouse pointer with smoother animation */}
      <div
        className="absolute right-0 top-1/2 hidden lg:block pizza-rotation"
        ref={pizzaRef}
        style={{ transform: `translateY(-50%) rotate(${pizzaRotation}deg)`, transformOrigin: 'center' }}
      >
        <img
          src="/pizza.png"
          alt="Delicious pizza"
          className="w-[700px] h-[700px] object-cover rounded-full shadow-2xl"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};

const CategoriesSection = () => {
    const navigate = useNavigate();
    const categoriesRef = useRef(null);
    const [animateCategories, setAnimateCategories] = useState(false);
    const categories = [
        { icon: Pizza, name: "Pizza", count: "" },
        { icon: Salad, name: "Healthy", count: "" },
        { icon: Coffee, name: "Breakfast", count: "" },
        { icon: IceCream, name: "Desserts", count: "" },
        { icon: Beef, name: "Meat", count: "" },
        { icon: Utensils, name: "More", count: "" }
    ];
    
    useEffect(() => {
      // Create an Intersection Observer to detect when categories enter viewport
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting) {
            // Delay animation slightly for better effect
            setTimeout(() => {
              setAnimateCategories(true);
            }, 200);
            // Once animation is triggered, disconnect the observer
            observer.disconnect();
          }
        },
        { threshold: 0.2 } // Trigger when 20% of the section is visible
      );
      
      if (categoriesRef.current) {
        observer.observe(categoriesRef.current);
      }
      
      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    }, []);
    
    const handleCategoryClick = (categoryName) => {
      const userName = localStorage.getItem('userName');
      if (!userName) {
        // Redirect to login if not logged in
        toast.error('Please login to view restaurants', {
          position: "top-right",
          autoClose: 2000
        });
        navigate('/login');
      } else {
        // Store the selected cuisine in localStorage to access it on the restaurants page
        localStorage.setItem('selectedCuisine', categoryName);
        localStorage.setItem('openFilters', 'true');
        
        // Navigate to restaurants page
        navigate('/restaurants');
        
        toast.info(`Browsing ${categoryName} options`, {
          position: "top-right",
          autoClose: 2000
        });
      }
    };

    return (
      <section className="py-20 bg-gray-50 overflow-hidden" ref={categoriesRef}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 
            transition-all duration-700 
            transform-gpu translate-y-0 opacity-100"
            style={{ 
              opacity: animateCategories ? 1 : 0, 
              transform: animateCategories ? 'translateY(0)' : 'translateY(-20px)'
            }}
          >
            Popular Categories
          </h2>
          <p className="text-gray-600 text-center mb-12 transition-all duration-700 delay-100"
            style={{ 
              opacity: animateCategories ? 1 : 0, 
              transform: animateCategories ? 'translateY(0)' : 'translateY(-20px)'
            }}
          >
            Explore restaurants by your favorite cuisine type
          </p>
          
          <div className="relative h-[500px] md:h-[400px] lg:h-[300px]">
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative`}>
              {categories.map((category, index) => (
                <div
                  key={category.name}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`
                    group relative overflow-hidden rounded-2xl bg-white p-6 text-center shadow-lg cursor-pointer
                    transition-all ease-out duration-1000
                    ${animateCategories ? 'opacity-100 translate-y-0 rotate-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}
                    hover:shadow-xl hover:-translate-y-2 active:translate-y-0 active:shadow-md
                  `}
                  style={{ 
                    transformOrigin: 'center center',
                    position: animateCategories ? 'relative' : 'absolute',
                    top: animateCategories ? 'auto' : '50%',
                    left: animateCategories ? 'auto' : '50%',
                    transform: animateCategories 
                      ? `translateY(0) rotate(0) scale(1)` 
                      : `translate(-50%, -50%) rotate(${index * 5 - 12.5}deg) scale(0.9) translateY(${index * 10}px)`,
                    zIndex: animateCategories ? 1 : categories.length - index,
                    transitionDelay: `${index * 100}ms`,
                    boxShadow: animateCategories ? '' : '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 transition-transform duration-500 transform-gpu group-hover:scale-110">
                    <category.icon className="mx-auto h-12 w-12 text-orange-500 mb-4 transition-all duration-500 transform-gpu group-hover:text-orange-600 group-hover:drop-shadow-md" />
                    <h3 className="font-semibold mb-1 transition-all duration-500 group-hover:text-orange-600">{category.name}</h3>
                    <p className="text-sm text-gray-500 transition-all duration-500 group-hover:text-gray-700">{category.count}</p>
                  </div>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 group-active:opacity-0 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
};

const FoodGrid = () => {
    const [trendingItems, setTrendingItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchTrendingItems = async () => {
        setLoading(true);
        const API_URL = 'http://localhost:8080/api';

        try {
          // Fetch all menu items
          const response = await axios.get(`${API_URL}/menu-items`);
          
          // Get a list of restaurants to add restaurant names to menu items
          const restaurantsResponse = await axios.get(`${API_URL}/restaurants`);
          const restaurants = restaurantsResponse.data;
          
          // Transform and add restaurant information to menu items
          const menuItemsWithRestaurant = response.data.map(item => {
            const restaurant = restaurants.find(r => r.id === item.restaurant);
            return {
              id: item.id,
              title: item.name,
              description: item.description,
              price: `₹${item.price}`,
              image: item.imageUrl || "/food.jpg",
              restaurant: restaurant ? restaurant.name : "Restaurant",
              restaurantId: item.restaurant,
              rating: (4 + Math.random()).toFixed(1), // Generate a random high rating between 4.0-5.0
              reviews: Math.floor(Math.random() * 300) + 50, // Random number of reviews
              time: `${Math.floor(Math.random() * 15) + 15}-${Math.floor(Math.random() * 15) + 30} min`, // Random delivery time
              tags: item.tags || ["Popular"], // Use actual tags or default to "Popular"
              isVeg: item.isVeg
            };
          });
          
          // Sort by "rating" and take top 8 items to show as trending
          const sortedItems = menuItemsWithRestaurant
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 8);
          
          setTrendingItems(sortedItems);
        } catch (error) {
          console.error("Error fetching trending items:", error);
          // Fallback to static data if API fails
          setTrendingItems([
            {
              id: 1,
              image: "/food.jpg",
              title: "Spicy Ramen Bowl",
              restaurant: "Noodle House",
              restaurantId: 1,
              rating: 4.8,
              reviews: 234,
              price: "₹200",
              time: "20-30 min",
              tags: ["Japanese", "Spicy", "Popular"]
            },
            {
              id: 2,  
              image: "/food.jpg",
              title: "Mediterranean Pasta",
              restaurant: "Bella Italia",
              restaurantId: 2,
              rating: 4.6,
              reviews: 189,
              price: "₹250",
              time: "25-35 min",
              tags: ["Italian", "Vegetarian"]
            },
            {
              id: 3,
              image: "/food.jpg",
              title: "Fresh Garden Bowl",
              restaurant: "Green Eats",
              restaurantId: 3,
              rating: 4.9,
              reviews: 156,
              price: "₹300",
              time: "15-25 min",
              tags: ["Healthy", "Vegan"]
            },
            {
              id: 4,
              image: "/food.jpg",
              title: "Spicy Thai Curry",
              restaurant: "Thai Flavors",
              restaurantId: 4,
              rating: 4.7,
              reviews: 203,
              price: "₹300",
              time: "30-40 min",
              tags: ["Thai", "Spicy"]
            }
          ]);
        } finally {
          setLoading(false);
        }
      };

      fetchTrendingItems();
    }, []);
    
    // Display only first row items or all items based on showAll state
    const displayItems = showAll ? trendingItems : trendingItems.slice(0, 4);
    
    const toggleShowAll = () => {
      setShowAll(!showAll);
    };
    
    const handleFoodItemClick = (food) => {
      if (food.restaurantId) {
        navigate(`/restaurants/${food.restaurantId}`);
        toast.info(`Viewing ${food.restaurant}`, {
          position: "top-right",
          autoClose: 2000
        });
      } else {
        toast.error("Restaurant information not available", {
          position: "top-right",
          autoClose: 2000
        });
      }
    };
    
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold">Trending Now</h2>
            {trendingItems.length > 4 && (
              <button 
                onClick={toggleShowAll}
                className="text-orange-500 hover:text-orange-600 font-medium flex items-center"
              >
                {showAll ? 'Show Less' : 'View More'}
                <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-gray-600 mb-12">Our most popular and highly rated dishes from all restaurants</p>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {displayItems.map((food) => (
                  <div
                    key={food.id}
                    className="group rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => handleFoodItemClick(food)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={food.image || "/placeholder.svg"}
                        alt={food.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-4 right-4">
                        {food.isVeg ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            Veg
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                            Non-Veg
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="flex gap-2 flex-wrap">
                          {food.tags && food.tags.map((tag) => (
                            <span key={tag} className="bg-white/90 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{food.title}</h3>
                          <p className="text-gray-600 text-sm">{food.restaurant}</p>
                        </div>
                        <div className="flex items-center bg-orange-50 px-2 py-1 rounded-lg">
                          <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
                          <span className="ml-1 text-sm font-medium">{food.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-gray-600 text-sm">{food.time}</div>
                        <div className="text-lg font-semibold text-orange-600">{food.price}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {!showAll && trendingItems.length > 4 && (
                <div className="flex justify-center mt-8">
                  <button 
                    onClick={toggleShowAll}
                    className="bg-white border border-orange-200 text-orange-500 hover:bg-orange-50 font-medium rounded-full px-5 py-2 flex items-center shadow-sm hover:shadow transition-all"
                  >
                    View All Trending Items
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    );
};

const HomePage = () => (
  <div className="min-h-screen bg-white">
    <SiteHeader />
    <main>
      <HeroSection />
      <CategoriesSection />
      <FoodGrid />
    </main>
  </div>
);

// Restaurants Page Component
const RestaurantsPage = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCuisines, setShowAllCuisines] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    cuisine: [],
    priceRange: null,
    rating: null,
    sortBy: 'distance'
  });
  
  // Get user authentication status
  const userName = localStorage.getItem('userName');
  
  // Redirect if not logged in - with useRef to ensure it only runs once
  const hasCheckedAuth = React.useRef(false);
  
  useEffect(() => {
    if (!userName && !hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      toast.error('Please login to view restaurants', {
        position: "top-right",
        autoClose: 2000
      });
      navigate('/login');
    }
  }, [userName, navigate]);

  // Check for selected cuisine from categories and open filters if needed
  useEffect(() => {
    const selectedCuisine = localStorage.getItem('selectedCuisine');
    const shouldOpenFilters = localStorage.getItem('openFilters') === 'true';
    
    if (selectedCuisine) {
      // Update the filters with the selected cuisine
      setSelectedFilters(prev => ({
        ...prev,
        cuisine: [selectedCuisine]
      }));
      
      // Open the filter panel if requested
      if (shouldOpenFilters) {
        setFilterOpen(true);
      }
      
      // Clear the localStorage values after applying
      localStorage.removeItem('selectedCuisine');
      localStorage.removeItem('openFilters');
    }
  }, []);

  // Check if on mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
      setShowAllCuisines(window.innerWidth >= 640);
    };
    
    // Check on mount
    checkIfMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Get user's saved location or KL University as default
  const savedAddress = localStorage.getItem('selectedAddress') || 'KL University, Guntur, Andhra Pradesh, India';
  const savedLat = parseFloat(localStorage.getItem('selectedLat')) || 16.4419;
  const savedLng = parseFloat(localStorage.getItem('selectedLng')) || 80.6226;

  // Mock cuisine types - ensure these match with the category names used in CategoriesSection
  const cuisineTypes = [
    "Pizza", "Healthy", "Breakfast", "Desserts", "Meat", "Indian", 
    "South Indian", "North Indian", "Chinese", "Italian",
    "Continental", "Fast Food", "Beverages", "Biryani",
    "Andhra", "Vegetarian", "Burgers"
  ];

  // Mock price ranges
  const priceRanges = [
    { id: 'budget', label: '₹ (Under ₹200)', range: [0, 200] },
    { id: 'moderate', label: '₹₹ (₹200-₹500)', range: [200, 500] },
    { id: 'expensive', label: '₹₹₹ (₹500+)', range: [500, 1000] }
  ];
  
  // Mock sort options
  const sortOptions = [
    { id: 'distance', label: 'Distance' },
    { id: 'rating', label: 'Rating (High to Low)' },
    { id: 'price', label: 'Price (Low to High)' },
    { id: 'price-desc', label: 'Price (High to Low)' }
  ];

  // Helper function to calculate rough distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Simple distance calculation using Haversine formula
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance.toFixed(1) + " mi";
  };
  
  // Generate a realistic ETA based on distance
  const generateETA = (lat, lng) => {
    const distance = calculateDistance(savedLat, savedLng, lat, lng);
    const distanceValue = parseFloat(distance);
    
    // Rough estimate: 5 minutes per mile + 10 minutes preparation
    const minTime = Math.round(distanceValue * 5 + 10);
    const maxTime = Math.round(minTime * 1.3); // Add 30% buffer
    
    return `${minTime}-${maxTime} min`;
  };

  // Fetch restaurants from API instead of using mock data
  useEffect(() => {
    const fetchRestaurants = async () => {
    setLoading(true);
      const API_URL = 'http://localhost:8080/api';

      try {
        const response = await axios.get(`${API_URL}/restaurants`);
        
        // Transform API response to match our component's expected format
        const transformedRestaurants = response.data.map(restaurant => {
          // Generate random lat/lng offsets for distance calculation if they don't exist
          const lat = restaurant.lat || savedLat + (Math.random() - 0.5) * 0.05;
          const lng = restaurant.lng || savedLng + (Math.random() - 0.5) * 0.05;
          const distance = parseFloat(calculateDistance(savedLat, savedLng, lat, lng));
        
          return {
            id: restaurant.id,
            name: restaurant.name,
            address: restaurant.address || 'Address unavailable',
            distance: distance.toFixed(1),
            rating: restaurant.rating || 4.0,
            reviewCount: restaurant.reviewCount || Math.floor(Math.random() * 500) + 50,
            priceForTwo: restaurant.priceForTwo || 250,
            timeEstimate: restaurant.deliveryTime || generateETA(lat, lng),
            image: restaurant.imageUrl || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=3274",
            veg: restaurant.isVeg || false,
            openNow: restaurant.isOpen !== undefined ? restaurant.isOpen : true,
            lat,
            lng
        };
      });
      
        setRestaurants(transformedRestaurants);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        toast.error("Failed to load restaurants. Please try again later.");
      } finally {
      setLoading(false);
      }
    };

    if (userName) {
      fetchRestaurants();
    }
  }, [savedLat, savedLng, userName, navigate]);

  // Filter restaurants based on search query and selected filters
  const filteredRestaurants = restaurants.filter(restaurant => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !restaurant.name.toLowerCase().includes(query) && 
        !restaurant.address.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Price range filter
    if (selectedFilters.priceRange) {
      const range = priceRanges.find(p => p.id === selectedFilters.priceRange)?.range;
      if (range && (restaurant.priceForTwo < range[0] || restaurant.priceForTwo > range[1])) {
        return false;
      }
    }

    // Rating filter
    if (selectedFilters.rating && restaurant.rating < selectedFilters.rating) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Sort results
    switch (selectedFilters.sortBy) {
      case 'distance':
        return parseFloat(a.distance) - parseFloat(b.distance);
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return a.priceForTwo - b.priceForTwo;
      case 'price-desc':
        return b.priceForTwo - a.priceForTwo;
      default:
        return parseFloat(a.distance) - parseFloat(b.distance);
    }
  });

  const clearFilters = () => {
    setSelectedFilters({
      cuisine: [],
      priceRange: null,
      rating: null,
      sortBy: 'distance'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <SiteHeader />
      <div className="container mx-auto px-4">
        {/* Address and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-white p-2 rounded-full shadow-sm mr-3">
              <MapPin className="text-orange-500 h-5 w-5" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Delivery to</div>
              <div className="font-medium">{savedAddress}</div>
            </div>
          </div>
          
          <div className="relative flex-1 md:max-w-md">
            <input
              type="text"
              placeholder="Search for restaurants, cuisines..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
          
          {/* Filter button (mobile only) */}
          <button
            className="md:hidden flex items-center justify-center bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 mt-4"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
        
        {/* Filter section for mobile */}
        {filterOpen && (
          <div className="bg-white shadow-md border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Filters</h3>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-orange-500 hover:text-orange-600"
                >
                  Clear All
                </button>
              </div>
              
              {/* Sort By */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Sort By</h4>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedFilters({...selectedFilters, sortBy: option.id})}
                      className={`px-3 py-1 rounded-full text-xs ${
                        selectedFilters.sortBy === option.id 
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Price Range</h4>
                <div className="flex flex-wrap gap-2">
                  {priceRanges.map(range => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedFilters({
                        ...selectedFilters, 
                        priceRange: selectedFilters.priceRange === range.id ? null : range.id
                      })}
                      className={`px-3 py-1 rounded-full text-xs ${
                        selectedFilters.priceRange === range.id 
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Rating */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Rating</h4>
                <div className="flex flex-wrap gap-2">
                  {[3, 3.5, 4, 4.5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setSelectedFilters({
                        ...selectedFilters, 
                        rating: selectedFilters.rating === rating ? null : rating
                      })}
                      className={`px-3 py-1 rounded-full text-xs ${
                        selectedFilters.rating === rating 
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {rating}+ <Star className="inline h-3 w-3 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Cuisine Types - Limited display for mobile */}
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Cuisine</h4>
                <div className="flex flex-wrap gap-2">
                  {cuisineTypes.slice(0, showAllCuisines ? cuisineTypes.length : 8).map(cuisine => (
                    <button
                      key={cuisine}
                      onClick={() => {
                        const newCuisines = selectedFilters.cuisine.includes(cuisine)
                          ? selectedFilters.cuisine.filter(c => c !== cuisine)
                          : [...selectedFilters.cuisine, cuisine];
                        setSelectedFilters({...selectedFilters, cuisine: newCuisines});
                      }}
                      className={`px-3 py-1 rounded-full text-xs ${
                        selectedFilters.cuisine.includes(cuisine) 
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                  {isMobile && !showAllCuisines && cuisineTypes.length > 8 && (
                    <button
                      onClick={() => setShowAllCuisines(true)}
                      className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      + More
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main content with sidebar filter (desktop) and restaurant listings */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden md:block w-64 shrink-0">
            {/* ... existing sidebar filters ... */}
          </div>
          
          {/* Restaurant Listings */}
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center py-12">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Finding restaurants near you...</p>
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Utensils className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">No restaurants found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
                <button 
                  onClick={clearFilters}
                  className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div>
                {/* Results summary */}
                <div className="mb-4 text-sm text-gray-500">
                  Found {filteredRestaurants.length} restaurants
                  {selectedFilters.cuisine.length > 0 && (
                    <span> • {selectedFilters.cuisine.join(', ')}</span>
                  )}
                  {selectedFilters.priceRange && (
                    <span> • {priceRanges.find(p => p.id === selectedFilters.priceRange)?.label}</span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {filteredRestaurants.map((restaurant) => (
                    <div 
                      key={restaurant.id} 
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow active:bg-gray-50"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Restaurant Image */}
                        <div className="relative md:w-1/3 h-48 md:h-auto overflow-hidden">
                          <div className="w-full h-full" style={{ aspectRatio: "4/3" }}>
                            <img 
                              src={restaurant.image} 
                              alt={restaurant.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-white transition-colors">
                            <Heart className="h-5 w-5 text-gray-500 hover:text-pink-500" />
                          </button>
                        </div>
                        
                        {/* Restaurant Details */}
                        <div className="p-4 md:p-5 flex-grow">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
                              <div className="flex items-center mb-1 text-sm text-gray-500">
                                <div className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-medium mr-2">
                                  {restaurant.rating} <Star className="inline h-3 w-3 fill-current" />
                                </div>
                                <span>{restaurant.reviewCount} reviews</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm">
                                <span className="font-medium text-gray-900">₹{restaurant.priceForTwo}</span> <span className="text-gray-500">for two</span>
                                <span className="text-gray-500 mx-1">•</span> <span className="text-gray-500">avg ₹{Math.round(restaurant.priceForTwo / 2)}/person</span>
                              </div>
                              <div className="flex items-center justify-end text-sm text-gray-500 mt-1">
                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span>{restaurant.distance} km</span>
                              </div>
                              <div className="flex items-center justify-end text-sm text-gray-500 mt-1">
                                <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span>{restaurant.timeEstimate} min</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 mb-3 mt-2">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="line-clamp-1">{restaurant.address}</span>
                          </div>
                          
                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {restaurant.veg && (
                              <span className="bg-green-50 text-green-700 px-2 py-0.5 text-xs rounded-full border border-green-100">
                                Pure Veg
                              </span>
                            )}
                            {restaurant.openNow && (
                              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 text-xs rounded-full border border-blue-100">
                                Open Now
                              </span>
                            )}
                            {restaurant.offers && restaurant.offers.length > 0 && (
                              <span className="bg-orange-50 text-orange-700 px-2 py-0.5 text-xs rounded-full border border-orange-100">
                                {restaurant.offers[0]}
                              </span>
                            )}
                          </div>
                          
                          {/* Action Buttons with active states for touch */}
                          <div className="flex flex-wrap justify-between items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                            <div className="flex gap-3">
                              <a href={`tel:+919876543210`} className="text-gray-600 flex items-center text-sm hover:text-orange-500 active:scale-95 transition-transform">
                                <Phone className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Call</span>
                              </a>
                              <Link 
                                to={`/restaurants/${restaurant.id}`} 
                                className="text-gray-600 flex items-center text-sm hover:text-orange-500 active:scale-95 transition-transform"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Menu</span>
                              </Link>
                            </div>
                            <Link 
                              to={`/restaurants/${restaurant.id}`} 
                              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-1.5 rounded-full text-sm active:scale-95 transition-transform"
                            >
                              Order Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add the ChatbotPopup component */}
      <ChatbotPopup restaurants={restaurants} />
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/map" element={<MapSelector />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/setup-mfa" element={<MFASetup />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/dashboard" element={<UserDashboard />} />
        </Routes>
        {/* Single ToastContainer for the entire application */}
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          limit={1}
          style={{ marginTop: '70px' }}
        />
      </div>
    </Router>
  );
}

export default App;