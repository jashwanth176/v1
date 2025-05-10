import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaStore, FaPencilAlt, FaTrash, FaPlus, FaSignOutAlt, FaHome, FaUtensils, FaList } from 'react-icons/fa';
import { Search } from 'lucide-react';
import axios from 'axios';
import MenuItemManagement from './components/MenuItemManagement';

// Backend API URL
const API_URL = 'http://localhost:8080/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState('restaurants');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showMenuManager, setShowMenuManager] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  
  // Check for admin authentication
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      toast.error('Unauthorized access. Please login as admin.', { autoClose: 2000 });
      navigate('/login');
    }
  }, [navigate]);

  // Fetch restaurants from API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/restaurants`);
        // Transform data to match our component's expected format if needed
        const formattedRestaurants = response.data.map(restaurant => ({
          ...restaurant,
          // Ensure all required properties exist
          status: restaurant.isOpen ? 'active' : 'inactive',
          deliveryTime: restaurant.deliveryTime || "30-40",
          priceRange: getPriceRangeSymbol(restaurant.priceRange || "Moderate"),
          distance: "1.0 km", // This might not be available from the API
          image: restaurant.imageUrl // Maintain compatibility with existing code
        }));
        setRestaurants(formattedRestaurants);
        setFilteredRestaurants(formattedRestaurants);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Failed to load restaurants. Please try again later.");
        toast.error("Failed to load restaurants. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Helper function to convert price range to symbols
  const getPriceRangeSymbol = (priceRange) => {
    switch(priceRange.toLowerCase()) {
      case 'cheap': return '$';
      case 'moderate': return '$$';
      case 'expensive': return '$$$';
      case 'very expensive': return '$$$$';
      default: return '$$';
    }
  };

  // Convert symbol back to price range text
  const getPriceRangeText = (symbol) => {
    switch(symbol) {
      case '$': return 'Cheap';
      case '$$': return 'Moderate';
      case '$$$': return 'Expensive';
      case '$$$$': return 'Very Expensive';
      default: return 'Moderate';
    }
  };
  
  // Apply filters and search
  useEffect(() => {
    let filtered = restaurants;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (restaurant.cuisine && Array.isArray(restaurant.cuisine) && 
          restaurant.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.status === statusFilter);
    }
    
    setFilteredRestaurants(filtered);
  }, [searchQuery, statusFilter, restaurants]);

  // Fetch orders data (for the Orders tab)
  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        try {
          const response = await axios.get(`${API_URL}/orders`);
          setOrders(response.data);
        } catch (err) {
          console.error("Error fetching orders:", err);
          toast.error("Failed to load orders. Please try again later.");
        }
      };

      fetchOrders();
    }
  }, [activeTab]);
  
  const handleEditRestaurant = (restaurant) => {
    setCurrentRestaurant(restaurant);
    setIsEditing(true);
  };
  
  const handleDeleteRestaurant = async (id) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await axios.delete(`${API_URL}/restaurants/${id}`);
        const updatedRestaurants = restaurants.filter(r => r.id !== id);
        setRestaurants(updatedRestaurants);
        toast.success('Restaurant deleted successfully', { autoClose: 2000 });
      } catch (err) {
        console.error("Error deleting restaurant:", err);
        toast.error("Failed to delete restaurant. Please try again.");
      }
    }
  };
  
  const handleToggleStatus = async (id) => {
    try {
      const restaurant = restaurants.find(r => r.id === id);
      const updatedStatus = restaurant.status === 'active' ? false : true;
      
      // Create a clean object with only the properties that the backend expects
      const restaurantData = {
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        priceRange: getPriceRangeText(restaurant.priceRange),
        rating: restaurant.rating,
        reviewCount: restaurant.reviewCount || 0,
        deliveryTime: restaurant.deliveryTime,
        imageUrl: restaurant.imageUrl || restaurant.image,
        address: restaurant.address,
        priceForTwo: restaurant.priceForTwo || 500,
        isVeg: restaurant.isVeg || false,
        isOpen: updatedStatus
      };
      
      // Update the restaurant status in the backend
      await axios.put(`${API_URL}/restaurants/${id}`, restaurantData);
      
      const updatedRestaurants = restaurants.map(r => {
        if (r.id === id) {
          const newStatus = r.status === 'active' ? 'inactive' : 'active';
          toast.info(`Restaurant status changed to ${newStatus}`, { autoClose: 2000 });
          return { ...r, status: newStatus, isOpen: updatedStatus };
        }
        return r;
      });
      
      setRestaurants(updatedRestaurants);
    } catch (err) {
      console.error("Error updating restaurant status:", err);
      toast.error("Failed to update restaurant status. Please try again.");
    }
  };
  
  const handleSaveRestaurant = async (e) => {
    e.preventDefault();
    
    try {
      if (currentRestaurant) {
        // Create a clean object with only the properties that the backend expects
        const restaurantData = {
          id: currentRestaurant.id,
          name: currentRestaurant.name,
          cuisine: currentRestaurant.cuisine,
          priceRange: getPriceRangeText(currentRestaurant.priceRange),
          rating: currentRestaurant.rating,
          reviewCount: currentRestaurant.reviewCount || 0,
          deliveryTime: currentRestaurant.deliveryTime,
          imageUrl: currentRestaurant.imageUrl || currentRestaurant.image,
          address: currentRestaurant.address,
          priceForTwo: currentRestaurant.priceForTwo || 500,
          isVeg: currentRestaurant.isVeg || false,
          isOpen: currentRestaurant.status === 'active'
        };
        
        // Update existing restaurant
        const response = await axios.put(`${API_URL}/restaurants/${currentRestaurant.id}`, restaurantData);
        
        // Format the response to match our component's expected structure
        const updatedRestaurant = {
          ...response.data,
          status: response.data.isOpen ? 'active' : 'inactive',
          priceRange: getPriceRangeSymbol(response.data.priceRange),
          image: response.data.imageUrl
        };
        
        const updatedRestaurants = restaurants.map(r => 
          r.id === updatedRestaurant.id ? updatedRestaurant : r
        );
        setRestaurants(updatedRestaurants);
        toast.success('Restaurant updated successfully', { autoClose: 2000 });
      } else {
        // Create a clean object for a new restaurant
        const newRestaurantData = {
          name: e.target.name.value,
          cuisine: [e.target.cuisine.value], // API expects an array
          priceRange: getPriceRangeText(e.target.priceRange.value),
          rating: parseFloat(e.target.rating.value) || 4.0,
          reviewCount: 0,
          deliveryTime: e.target.deliveryTime.value,
          imageUrl: e.target.image.value || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=3274",
          address: e.target.address.value,
          priceForTwo: 500, // Default value
          isVeg: false, // Default value
          isOpen: true // Default to active
        };
        
        // Add new restaurant
        const response = await axios.post(`${API_URL}/restaurants`, newRestaurantData);
        
        // Format the response to match our component's expected structure
        const newRestaurant = {
          ...response.data,
          status: response.data.isOpen ? 'active' : 'inactive',
          priceRange: getPriceRangeSymbol(response.data.priceRange),
          distance: "1.0 km", // This might not be available from the API
          image: response.data.imageUrl
        };
        
        setRestaurants([...restaurants, newRestaurant]);
        toast.success('Restaurant added successfully', { autoClose: 2000 });
      }
    } catch (err) {
      console.error("Error saving restaurant:", err);
      toast.error("Failed to save restaurant. Please try again.");
      return; // Don't close the modal on error
    }
    
    setIsEditing(false);
    setCurrentRestaurant(null);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userRole');
    toast.success('Logged out successfully', { autoClose: 2000 });
    navigate('/login');
  };
  
  const handleManageMenu = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setShowMenuManager(true);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaStore className="text-2xl text-orange-500" />
            <h1 className="text-xl font-bold">FoodieHub Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center text-gray-300 hover:text-white"
            >
              <FaHome className="mr-1" /> View Site
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center text-gray-300 hover:text-white"
            >
              <FaSignOutAlt className="mr-1" /> Logout
            </button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
          <p className="text-gray-600">Welcome to the FoodieHub admin panel. Manage your restaurants and orders here.</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'restaurants' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaStore className="mr-2" /> Restaurants
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'orders' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaUtensils className="mr-2" /> Orders
            </button>
          </nav>
        </div>
        
        {activeTab === 'restaurants' && (
          <>
            {/* Restaurant Management Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div className="flex items-center w-full md:w-auto relative">
                <Search className="absolute left-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full md:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-4 w-full md:w-auto">
                <select
                  className="border border-gray-200 rounded-lg px-3 py-2"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button
                  onClick={() => {setIsEditing(true); setCurrentRestaurant(null)}}
                  className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center"
                >
                  <FaPlus className="mr-2" /> Add Restaurant
                </button>
              </div>
            </div>
            
            {/* Loading and Error states */}
            {isLoading && (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500">Loading restaurants...</p>
              </div>
            )}
            
            {error && !isLoading && (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-red-500">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg"
                >
                  Retry
                </button>
              </div>
            )}
            
            {/* Restaurant List */}
            {!isLoading && !error && filteredRestaurants.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuisine</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRestaurants.map((restaurant) => (
                      <tr key={restaurant.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                              <img src={restaurant.imageUrl || restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{restaurant.address}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Array.isArray(restaurant.cuisine) 
                            ? restaurant.cuisine.join(', ') 
                            : restaurant.cuisine}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{restaurant.rating}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-1 text-yellow-400">
                              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{restaurant.priceRange}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              restaurant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {restaurant.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleToggleStatus(restaurant.id)}
                              className={`px-2 py-1 rounded ${
                                restaurant.status === 'active' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'
                              }`}
                            >
                              {restaurant.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button 
                              onClick={() => handleManageMenu(restaurant.id)}
                              className="px-2 py-1 bg-orange-100 text-orange-600 rounded hover:bg-orange-200"
                              title="Manage Menu"
                            >
                              <FaList />
                            </button>
                            <button 
                              onClick={() => handleEditRestaurant(restaurant)}
                              className="px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                            >
                              <FaPencilAlt />
                            </button>
                            <button 
                              onClick={() => handleDeleteRestaurant(restaurant.id)}
                              className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !isLoading && !error ? (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500">No restaurants found matching your filters.</p>
              </div>
            ) : null}
          </>
        )}
        
        {activeTab === 'orders' && (
          <>
            {orders.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.userName}</div>
                          <div className="text-sm text-gray-500">{order.userEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {typeof order.menuItem === 'object' && order.menuItem !== null
                            ? order.menuItem.name || `Item #${order.menuItem.id}`
                            : typeof order.menuItem === 'number'
                              ? `Item #${order.menuItem}`
                              : 'Unknown Item'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{order.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500">No orders found.</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Restaurant Edit/Add Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
                </h2>
                <button 
                  onClick={() => {setIsEditing(false); setCurrentRestaurant(null)}}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSaveRestaurant}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      defaultValue={currentRestaurant?.name || ''}
                      onChange={(e) => currentRestaurant && setCurrentRestaurant({...currentRestaurant, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
                    <input
                      type="text"
                      name="cuisine"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      defaultValue={currentRestaurant?.cuisine && Array.isArray(currentRestaurant.cuisine) 
                        ? currentRestaurant.cuisine[0] 
                        : currentRestaurant?.cuisine || ''}
                      onChange={(e) => currentRestaurant && setCurrentRestaurant({
                        ...currentRestaurant, 
                        cuisine: [e.target.value]
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                    <select
                      name="priceRange"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      defaultValue={currentRestaurant?.priceRange || '$$'}
                      onChange={(e) => currentRestaurant && setCurrentRestaurant({...currentRestaurant, priceRange: e.target.value})}
                    >
                      <option value="$">$ (Inexpensive)</option>
                      <option value="$$">$$ (Moderate)</option>
                      <option value="$$$">$$$ (Expensive)</option>
                      <option value="$$$$">$$$$ (Very Expensive)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <input
                      type="number"
                      name="rating"
                      min="1"
                      max="5"
                      step="0.1"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      defaultValue={currentRestaurant?.rating || 4.0}
                      onChange={(e) => currentRestaurant && setCurrentRestaurant({...currentRestaurant, rating: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (min)</label>
                    <input
                      type="text"
                      name="deliveryTime"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      defaultValue={currentRestaurant?.deliveryTime || '20-30'}
                      onChange={(e) => currentRestaurant && setCurrentRestaurant({...currentRestaurant, deliveryTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="text"
                      name="image"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      defaultValue={currentRestaurant?.imageUrl || currentRestaurant?.image || ''}
                      onChange={(e) => currentRestaurant && setCurrentRestaurant({
                        ...currentRestaurant, 
                        imageUrl: e.target.value,
                        image: e.target.value
                      })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      defaultValue={currentRestaurant?.address || 'Near KL University, Guntur'}
                      onChange={(e) => currentRestaurant && setCurrentRestaurant({...currentRestaurant, address: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {setIsEditing(false); setCurrentRestaurant(null)}}
                    className="mr-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {currentRestaurant ? 'Update Restaurant' : 'Add Restaurant'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Menu Item Management Modal */}
      {showMenuManager && selectedRestaurantId && (
        <MenuItemManagement
          restaurantId={selectedRestaurantId}
          onClose={() => {
            setShowMenuManager(false);
            setSelectedRestaurantId(null);
          }}
        />
      )}
    </div>
  );
}

export default AdminDashboard; 