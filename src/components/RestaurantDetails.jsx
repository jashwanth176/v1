import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Star, Plus, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { SiteHeader } from '../App';

// Backend API URL
const API_URL = 'http://localhost:8080/api';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  
  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
      
      // Calculate total
      const total = parsedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setCartTotal(total);
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      // Calculate total
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setCartTotal(total);
    }
  }, [cartItems]);

  // Function to add item to cart
  const addToCart = (item) => {
    // Check if user is logged in
    const userName = localStorage.getItem('userName');
    if (!userName) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    // Check if restaurant is the same
    if (cartItems.length > 0 && cartItems[0].restaurantId !== restaurant.id) {
      if (window.confirm('Your cart contains items from a different restaurant. Would you like to clear your cart and add this item?')) {
        setCartItems([]);
      } else {
        return;
      }
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += 1;
      setCartItems(updatedCartItems);
    } else {
      // Add new item to cart
      setCartItems([...cartItems, {
        ...item,
        quantity: 1,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantImage: restaurant.imageUrl || restaurant.image
      }]);
    }
    
    // Show notification
    toast.success(`${item.name} added to cart!`);
  };
  
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch restaurant details
        const restaurantResponse = await axios.get(`${API_URL}/restaurants/${id}`);
        setRestaurant(restaurantResponse.data);
        
        // Fetch menu items for the restaurant
        const menuResponse = await axios.get(`${API_URL}/menu-items/restaurant/${id}`);
        setMenuItems(menuResponse.data);
      } catch (err) {
        console.error("Error fetching restaurant details:", err);
        setError("Failed to load restaurant details. Please try again later.");
        toast.error("Failed to load restaurant details.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchRestaurantDetails();
    }
  }, [id]);
  
  // Extract unique categories from menu items
  const categories = menuItems.length > 0 
    ? ['all', ...new Set(menuItems.flatMap(item => item.tags || []))]
    : ['all'];
  
  // Filter menu items by category
  const filteredMenuItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.tags && item.tags.includes(activeCategory));
  
  // Function to navigate to cart
  const goToCart = () => {
    if (cartItems.length === 0) {
      toast.info('Your cart is empty');
      return;
    }
    navigate('/cart');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <SiteHeader />
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading restaurant details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <SiteHeader />
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🍽️</span>
            </div>
            <h3 className="text-xl font-medium mb-2">Restaurant not found</h3>
            <p className="text-gray-500 mb-4">{error || "The restaurant you're looking for doesn't exist or has been removed."}</p>
            <button 
              onClick={() => navigate('/restaurants')}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Go to Restaurants
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12">
      <SiteHeader />
      {/* Restaurant Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-orange-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </button>
              
              <button 
                onClick={goToCart}
                className="relative flex items-center text-gray-600 hover:text-orange-500 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-full transition-colors"
              >
                <ShoppingCart className="h-5 w-5 mr-1" />
                <span>Cart</span>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
                <div className="flex items-center mt-1 text-sm text-gray-500 flex-wrap">
                  <div className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-medium mr-2">
                    {restaurant.rating} <Star className="inline h-3 w-3 fill-current" />
                  </div>
                  <span className="mr-3">{restaurant.reviewCount || 0} reviews</span>
                  <span>{
                    Array.isArray(restaurant.cuisine) 
                      ? restaurant.cuisine.join(', ') 
                      : typeof restaurant.cuisine === 'string' && restaurant.cuisine.includes(',')
                        ? restaurant.cuisine  // Already formatted as comma-separated string
                        : restaurant.cuisine || 'Various'
                  }</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>{restaurant.address}</span>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{restaurant.deliveryTime} mins</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">₹{restaurant.priceForTwo}</span> <span className="text-gray-500">for two</span>
                    <span className="text-gray-500 mx-1">•</span> <span className="text-gray-500">avg ₹{Math.round(restaurant.priceForTwo / 2)}/person</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0">
                <img 
                  src={restaurant.imageUrl || restaurant.image} 
                  alt={restaurant.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu Categories */}
      <div className="sticky top-16 bg-white shadow-sm z-10">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto py-3 scrollbar-hide">
            <div className="flex space-x-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium ${
                    activeCategory === category 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Menu Items */}
      <div className="container mx-auto px-4 py-6">
        {filteredMenuItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="flex flex-col items-center">
              <span className="text-5xl mb-4">🍽️</span>
              <h3 className="text-lg font-medium mb-2">No menu items available</h3>
              <p className="text-gray-500">This restaurant hasn&apos;t added any menu items yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenuItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="flex h-full">
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex items-center">
                          {item.isVeg && (
                            <div className="h-5 w-5 border border-green-500 flex items-center justify-center rounded-sm mr-1">
                              <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="font-medium">₹{item.price.toFixed(2)}</span>
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-100 px-2 py-0.5 rounded-full text-xs text-gray-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <button 
                        className="bg-white border border-orange-500 text-orange-500 hover:bg-orange-50 px-3 py-1 rounded-lg text-sm flex items-center"
                        disabled={!item.isAvailable}
                        onClick={() => item.isAvailable && addToCart(item)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </button>
                      {!item.isAvailable && (
                        <span className="text-xs text-red-500 block mt-1">Currently unavailable</span>
                      )}
                    </div>
                  </div>
                  {item.imageUrl && (
                    <div className="w-1/3 relative">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Floating Cart Button (Mobile) */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 md:hidden">
          <button
            onClick={goToCart}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-5 py-3 rounded-full shadow-lg flex items-center space-x-2"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>View Cart</span>
            <span className="font-bold">({cartItems.reduce((total, item) => total + item.quantity, 0)} items)</span>
            <span>•</span>
            <span className="font-bold">₹{cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetails; 