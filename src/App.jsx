import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Search, User, MapPin, Truck, Store, ArrowRight, Star, Utensils, Coffee, Pizza, Salad, IceCream, Beef, Navigation, MapIcon, X, CheckCircle2, Clock, Home, Plus, Minus, ChevronLeft, Heart, Filter, Phone, ExternalLink, Tag } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import LoginPage from './LoginPage';
import AdminDashboard from './AdminDashboard';
import OffersPage from './OffersPage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';

const SiteHeader = () => {
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
          <Link to="#" className="text-gray-800 hover:text-orange-600 transition-colors">Categories</Link>
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
  
  // Search for nearby places using OpenStreetMap Overpass API
  React.useEffect(() => {
    if (showingNearbyOptions) {
      searchNearbyRestaurants();
    }
  }, [showingNearbyOptions]);
  
  const searchNearbyRestaurants = () => {
    setIsLoadingPlaces(true);
    
    // Using OpenStreetMap's Overpass API to search for restaurants
    // This is a simplified version; for production, you might want to use a more sophisticated approach
    const searchTerm = searchQuery || 'restaurant near KL University';
    const radius = 5000; // 5km radius around KL University
    
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&limit=5&addressdetails=1&lat=16.4419&lon=80.6226&radius=${radius}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          // Format results to match our restaurant structure
          const formattedResults = data.map(place => ({
            name: place.name || place.display_name.split(',')[0],
            address: place.display_name,
            distance: calculateDistance(
              savedLat,
              savedLng,
              parseFloat(place.lat),
              parseFloat(place.lon)
            ),
            eta: generateETA(parseFloat(place.lat), parseFloat(place.lon)),
            id: place.place_id
          }));
          
          setNearbyRestaurants(formattedResults);
        } else {
          // Fallback to mock data if API returns no results
          setNearbyRestaurants([
            { name: "Campus Cafeteria", address: "KL University, Guntur", distance: "0.1 mi", eta: "5-10 min" },
            { name: "Green Valley Restaurant", address: "Near KL University", distance: "0.6 mi", eta: "15-20 min" },
            { name: "Spicy Bites", address: "Vaddeswaram, Guntur", distance: "1.2 mi", eta: "20-25 min" },
            { name: "Food Court", address: "Mangalagiri Road, Guntur", distance: "2.5 mi", eta: "30-40 min" }
          ]);
        }
        
        setIsLoadingPlaces(false);
      })
      .catch(error => {
        console.error("Error fetching places:", error);
        // Fallback to mock data on error
        setNearbyRestaurants([
          { name: "Campus Cafeteria", address: "KL University, Guntur", distance: "0.1 mi", eta: "5-10 min" },
          { name: "Green Valley Restaurant", address: "Near KL University", distance: "0.6 mi", eta: "15-20 min" },
          { name: "Spicy Bites", address: "Vaddeswaram, Guntur", distance: "1.2 mi", eta: "20-25 min" },
          { name: "Food Court", address: "Mangalagiri Road, Guntur", distance: "2.5 mi", eta: "30-40 min" }
        ]);
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

  // Modified restaurant handling to check for login
  const handleRestaurantSelect = (restaurant) => {
    if (!userName) {
      // Redirect to login if not logged in
      toast.error('Please login to view restaurants', {
        position: "top-right",
        autoClose: 2000
      });
      navigate('/login');
    } else {
      navigate('/restaurants');
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
                    nearbyRestaurants.map((restaurant, index) => (
                      <div 
                        key={index}
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
                        <div className="flex items-center text-sm text-gray-700">
                          <Clock className="h-4 w-4 mr-1 text-orange-500" />
                          {restaurant.eta}
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
    const categories = [
        { icon: Pizza, name: "Pizza", count: "" },
        { icon: Salad, name: "Healthy", count: "" },
        { icon: Coffee, name: "Breakfast", count: "" },
        { icon: IceCream, name: "Desserts", count: "" },
        { icon: Beef, name: "Meat", count: "" },
        { icon: Utensils, name: "More", count: "" }
      ];
    

      return (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Popular Categories</h2>
            <p className="text-gray-600 text-center mb-12">
              Explore restaurants by your favorite cuisine type
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="group relative overflow-hidden rounded-2xl bg-white p-6 text-center shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <category.icon className="mx-auto h-12 w-12 text-orange-500 mb-4" />
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
};

const FoodGrid = () => {
    const foods = [
        {
          id: 1,
          image: "/food.jpg",
          title: "Spicy Ramen Bowl",
          restaurant: "Noodle House",
          rating: 4.8,
          reviews: 234,
          price: "200₹",
          time: "20-30 min",


          tags: ["Japanese", "Spicy", "Popular"]

        },
        {
          id: 2,  
          image: "/food.jpg",


          title: "Mediterranean Pasta",
          restaurant: "Bella Italia",
          rating: 4.6,
          reviews: 189,
          price: "250₹",


          time: "25-35 min",
          tags: ["Italian", "Vegetarian"]
        },
        {
          id: 3,
          image: "/food.jpg",


          title: "Fresh Garden Bowl",
          restaurant: "Green Eats",
          rating: 4.9,
          reviews: 156,
          price: "300₹",


          time: "15-25 min",
          tags: ["Healthy", "Vegan"]
        },
        {
          id: 4,
          image: "/food.jpg",

          title: "Spicy Thai Curry",
          restaurant: "Thai Flavors",
          rating: 4.7,
          reviews: 203,
          price: "300₹",

          time: "30-40 min",
          tags: ["Thai", "Spicy"]
        }
      ];
    
      return (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Trending Now</h2>
            <p className="text-gray-600 mb-12">Our most popular and highly rated dishes</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {foods.map((food) => (
                <div
                  key={food.id}
                  className="group rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={food.image || "/placeholder.svg"}
                      alt={food.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex gap-2">
                        {food.tags.map((tag) => (
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

  // Mock cuisine types
  const cuisineTypes = [
    "Indian", "South Indian", "North Indian", "Chinese", "Italian",
    "Continental", "Fast Food", "Desserts", "Beverages", "Biryani",
    "Andhra", "Vegetarian", "Pizza", "Burgers"
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

  // Mock restaurant data that would normally come from an API
  const mockRestaurants = [
    {
      id: 1,
      name: "KL Food Court",
      cuisine: ["Indian", "South Indian", "Fast Food"],
      address: "KL University Campus, Vaddeswaram",
      distance: "0.1",
      rating: 4.2,
      reviewCount: 320,
      priceForTwo: 150,
      timeEstimate: "15-20",
      image: "https://b.zmtcdn.com/data/pictures/chains/8/900508/0696d6e983cd0116889760534dfe4882.jpg",
      veg: true,
      openNow: true,
      offers: ["10% off on all orders", "Free delivery on campus"]
    },
    {
      id: 2,
      name: "Bawarchi Biryani",
      cuisine: ["Biryani", "Indian", "North Indian"],
      address: "Mangalagiri Road, 2.5 km from KL University",
      distance: "2.5",
      rating: 4.5,
      reviewCount: 1430,
      priceForTwo: 400,
      timeEstimate: "30-40",
      image: "https://b.zmtcdn.com/data/pictures/chains/1/91781/a44129196d5468d244b1c1f8969d8e51.jpg",
      veg: false,
      openNow: true,
      offers: ["20% off on orders above ₹500"]
    },
    {
      id: 3,
      name: "Spicy Paradise",
      cuisine: ["Andhra", "Biryani", "South Indian"],
      address: "Vaddeswaram, 1.8 km from KL University",
      distance: "1.8",
      rating: 4.0,
      reviewCount: 768,
      priceForTwo: 300,
      timeEstimate: "25-35",
      image: "https://b.zmtcdn.com/data/pictures/chains/9/90129/f9f1e95f255077b8686910ebb46e05cd.jpg",
      veg: false,
      openNow: true,
      offers: []
    },
    {
      id: 4,
      name: "Green Leaf Veg Restaurant",
      cuisine: ["Vegetarian", "South Indian", "North Indian"],
      address: "Mangalagiri, 3.2 km from KL University",
      distance: "3.2",
      rating: 4.3,
      reviewCount: 632,
      priceForTwo: 250,
      timeEstimate: "35-45",
      image: "https://b.zmtcdn.com/data/pictures/0/19665560/a6c8129329bf976270f0df240aa1b3b3.jpg",
      veg: true,
      openNow: true,
      offers: ["15% off on dine-in", "Free dessert on orders above ₹500"]
    },
    {
      id: 5,
      name: "Pizza Hub",
      cuisine: ["Pizza", "Fast Food", "Italian"],
      address: "Vaddeswaram, 1.5 km from KL University",
      distance: "1.5",
      rating: 3.9,
      reviewCount: 450,
      priceForTwo: 350,
      timeEstimate: "30-40",
      image: "https://b.zmtcdn.com/data/pictures/chains/6/10506/bd8dfea96f558f70726e9adeea69ad59.jpg",
      veg: false,
      openNow: true,
      offers: ["Buy 1 Get 1 on Medium Pizzas"]
    },
    {
      id: 6,
      name: "Krishna Grand",
      cuisine: ["Biryani", "North Indian", "Chinese"],
      address: "Guntur Highway, 4.1 km from KL University",
      distance: "4.1",
      rating: 4.4,
      reviewCount: 1210,
      priceForTwo: 450,
      timeEstimate: "40-50",
      image: "https://b.zmtcdn.com/data/pictures/chains/3/93043/fa48a84c14ed2f2177fa14af7b18df3f.jpg",
      veg: false,
      openNow: true,
      offers: ["10% cashback using wallet"]
    },
    {
      id: 7,
      name: "Cafe Coffee Day",
      cuisine: ["Beverages", "Desserts", "Continental"],
      address: "Vaddeswaram Main Road, 1.2 km from KL University",
      distance: "1.2",
      rating: 4.1,
      reviewCount: 520,
      priceForTwo: 400,
      timeEstimate: "20-30",
      image: "https://b.zmtcdn.com/data/pictures/chains/2/50812/7c1693cabaecac046b1479b09932c3a5.jpg",
      veg: true,
      openNow: true,
      offers: ["1+1 on coffees weekdays 2-6pm"]
    },
    {
      id: 8,
      name: "Guntur Spice",
      cuisine: ["Andhra", "Biryani"],
      address: "Guntur Road, 5 km from KL University",
      distance: "5.0",
      rating: 4.6,
      reviewCount: 890,
      priceForTwo: 500,
      timeEstimate: "45-55",
      image: "https://b.zmtcdn.com/data/pictures/5/19602775/78ad725e8e576a89d8e1d11992797805.jpg",
      veg: false,
      openNow: false,
      offers: ["20% off on weekends"]
    }
  ];

  // Fetch restaurants from OpenStreetMap or use mock data
  useEffect(() => {
    // In a real app, we would fetch from an API
    // For now, we'll use our mock data and simulate a loading delay
    setLoading(true);

    // Simulated API call
    setTimeout(() => {
      // Apply distance calculation to mock data using user's location
      const restaurantsWithDistance = mockRestaurants.map(restaurant => {
        // For demonstration, we're using a simple randomization for lat/lng offsets
        const lat = savedLat + (Math.random() - 0.5) * 0.1;
        const lng = savedLng + (Math.random() - 0.5) * 0.1;
        const distance = parseFloat(calculateDistance(savedLat, savedLng, lat, lng));
        
        return {
          ...restaurant,
          lat,
          lng,
          distance: distance.toFixed(1),
          timeEstimate: generateETA(lat, lng)
        };
      });
      
      setRestaurants(restaurantsWithDistance);
      setLoading(false);
    }, 1000);
  }, [savedLat, savedLng]);

  // Filter restaurants based on search query and selected filters
  const filteredRestaurants = restaurants.filter(restaurant => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !restaurant.name.toLowerCase().includes(query) && 
        !restaurant.address.toLowerCase().includes(query) &&
        !restaurant.cuisine.some(c => c.toLowerCase().includes(query))
      ) {
        return false;
      }
    }

    // Cuisine filter
    if (selectedFilters.cuisine.length > 0) {
      if (!restaurant.cuisine.some(c => selectedFilters.cuisine.includes(c))) {
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
    <div className="min-h-screen bg-gray-50 pb-8">
      <SiteHeader />
      
      {/* Header Section */}
      <div className="pt-20 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="mr-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold">Restaurants Near You</h1>
            </div>
            
            <button 
              onClick={() => navigate('/offers')}
              className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-full shadow-md hover:bg-orange-50 transition-all"
            >
              <Tag size={16} />
              <span className="hidden sm:inline">View Offers</span>
            </button>
          </div>
          
          <div className="flex items-center text-sm mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <p className="line-clamp-1">{savedAddress}</p>
          </div>
          
          {/* Search and Filter */}
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants, cuisines..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full text-gray-800 text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className={`min-w-[40px] p-2 rounded-full flex items-center justify-center ${filterOpen ? 'bg-white text-orange-500' : 'bg-white/20'}`}
            >
              <Filter size={20} />
              <span className="ml-1 hidden md:inline">Filters</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters Panel */}
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
      
      {/* Restaurant Listing */}
      <div className="container mx-auto px-4 py-6">
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
              {filteredRestaurants.map(restaurant => (
                <div 
                  key={restaurant.id} 
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow active:bg-gray-50"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Restaurant Image */}
                    <div className="relative md:w-1/3 h-48 md:h-auto">
                      <img 
                        src={restaurant.image} 
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                      <button className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-white transition-colors">
                        <Heart className="h-5 w-5 text-gray-500 hover:text-pink-500" />
                      </button>
                    </div>
                    
                    {/* Restaurant Details */}
                    <div className="p-4 md:p-5 flex-grow">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <h3 className="text-lg font-bold mb-1">{restaurant.name}</h3>
                          <div className="flex items-center mb-1 text-sm text-gray-500">
                            <div className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-medium mr-2">
                              {restaurant.rating} <Star className="inline h-3 w-3 fill-current" />
                            </div>
                            <span>{restaurant.reviewCount} reviews</span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2 flex flex-wrap gap-1">
                            {restaurant.cuisine.map((item, index) => (
                              <span key={index} className="after:content-[','] last:after:content-[''] after:mr-1">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">₹{restaurant.priceForTwo}</span> <span className="text-gray-500">for two</span>
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
                      </div>
                      
                      {/* Action Buttons with active states for touch */}
                      <div className="flex flex-wrap justify-between items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                        <div className="flex gap-3">
                          <a href={`tel:+919876543210`} className="text-gray-600 flex items-center text-sm hover:text-orange-500 active:scale-95 transition-transform">
                            <Phone className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Call</span>
                          </a>
                          <a href="#" target="_blank" className="text-gray-600 flex items-center text-sm hover:text-orange-500 active:scale-95 transition-transform">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Menu</span>
                          </a>
                        </div>
                        <button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-1.5 rounded-full text-sm active:scale-95 transition-transform">
                          Order Now
                        </button>
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
          <Route path="/offers" element={<OffersPage />} />
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