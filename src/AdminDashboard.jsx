import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaStore, FaPencilAlt, FaTrash, FaPlus, FaSignOutAlt, FaHome, FaUtensils } from 'react-icons/fa';
import { Search } from 'lucide-react';

// Mock restaurant data
const mockRestaurants = [
  {
    id: 1,
    name: "Thai Spice",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=3374&auto=format&fit=crop",
    cuisine: "Thai",
    rating: 4.5,
    deliveryTime: "25-35",
    priceRange: "$$",
    address: "Near KL University, Green Fields, Guntur",
    distance: "1.2 km",
    status: "active"
  },
  {
    id: 2,
    name: "Burger Junction",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=3398&auto=format&fit=crop",
    cuisine: "American",
    rating: 4.2,
    deliveryTime: "15-25",
    priceRange: "$",
    address: "123 College Road, Vaddeswaram, Guntur",
    distance: "0.5 km",
    status: "active"
  },
  {
    id: 3,
    name: "Roma Italian",
    image: "https://images.unsplash.com/photo-1579684947550-23c9450c58cd?q=80&w=3474&auto=format&fit=crop",
    cuisine: "Italian",
    rating: 4.7,
    deliveryTime: "30-40",
    priceRange: "$$$",
    address: "Vidya Nagar, Near KL University, Guntur",
    distance: "0.8 km",
    status: "active"
  },
  {
    id: 4,
    name: "Biryani House",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=3387&auto=format&fit=crop",
    cuisine: "Indian",
    rating: 4.8,
    deliveryTime: "20-30",
    priceRange: "$$",
    address: "KL Campus Road, Vaddeswaram, Guntur",
    distance: "0.2 km",
    status: "inactive"
  },
  {
    id: 5,
    name: "Sushi Kingdom",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=3840&auto=format&fit=crop",
    cuisine: "Japanese",
    rating: 4.6,
    deliveryTime: "25-35",
    priceRange: "$$$",
    address: "Highway Junction, Near KL University, Guntur",
    distance: "1.5 km",
    status: "active"
  },
  {
    id: 6,
    name: "Campus Cafe",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=2940&auto=format&fit=crop",
    cuisine: "Cafe",
    rating: 4.1,
    deliveryTime: "10-20",
    priceRange: "$",
    address: "Inside KL University, Vaddeswaram, Guntur",
    distance: "0.1 km",
    status: "active"
  }
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState(mockRestaurants);
  const [filteredRestaurants, setFilteredRestaurants] = useState(mockRestaurants);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [activeTab, setActiveTab] = useState('restaurants');
  
  // Check for admin authentication
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
      toast.error('Unauthorized access. Please login as admin.', { autoClose: 2000 });
      navigate('/login');
    }
  }, [navigate]);
  
  // Apply filters and search
  useEffect(() => {
    let filtered = restaurants;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.status === statusFilter);
    }
    
    setFilteredRestaurants(filtered);
  }, [searchQuery, statusFilter, restaurants]);
  
  const handleEditRestaurant = (restaurant) => {
    setCurrentRestaurant(restaurant);
    setIsEditing(true);
  };
  
  const handleDeleteRestaurant = (id) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      const updatedRestaurants = restaurants.filter(r => r.id !== id);
      setRestaurants(updatedRestaurants);
      toast.success('Restaurant deleted successfully', { autoClose: 2000 });
    }
  };
  
  const handleToggleStatus = (id) => {
    const updatedRestaurants = restaurants.map(restaurant => {
      if (restaurant.id === id) {
        const newStatus = restaurant.status === 'active' ? 'inactive' : 'active';
        toast.info(`Restaurant status changed to ${newStatus}`, { autoClose: 2000 });
        return { ...restaurant, status: newStatus };
      }
      return restaurant;
    });
    setRestaurants(updatedRestaurants);
  };
  
  const handleSaveRestaurant = (e) => {
    e.preventDefault();
    
    if (currentRestaurant) {
      // Update existing restaurant
      const updatedRestaurants = restaurants.map(r => 
        r.id === currentRestaurant.id ? currentRestaurant : r
      );
      setRestaurants(updatedRestaurants);
      toast.success('Restaurant updated successfully', { autoClose: 2000 });
    } else {
      // Add new restaurant
      const newRestaurant = {
        id: restaurants.length + 1,
        name: e.target.name.value,
        cuisine: e.target.cuisine.value,
        priceRange: e.target.priceRange.value,
        image: e.target.image.value || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=3274",
        rating: parseFloat(e.target.rating.value) || 4.0,
        deliveryTime: e.target.deliveryTime.value,
        address: e.target.address.value,
        distance: "0.5 km",
        status: 'active'
      };
      setRestaurants([...restaurants, newRestaurant]);
      toast.success('Restaurant added successfully', { autoClose: 2000 });
    }
    
    setIsEditing(false);
    setCurrentRestaurant(null);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userRole');
    toast.success('Logged out successfully', { autoClose: 2000 });
    navigate('/login');
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
            
            {/* Restaurant List */}
            {filteredRestaurants.length > 0 ? (
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
                              <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{restaurant.address}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{restaurant.cuisine}</td>
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
            ) : (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <p className="text-gray-500">No restaurants found matching your filters.</p>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'orders' && (
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">Order management will be implemented in the next phase.</p>
            <p className="text-gray-400 mt-2">Coming soon with Spring Boot backend integration.</p>
          </div>
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
                      defaultValue={currentRestaurant?.cuisine || ''}
                      onChange={(e) => currentRestaurant && setCurrentRestaurant({...currentRestaurant, cuisine: e.target.value})}
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
                      defaultValue={currentRestaurant?.image || ''}
                      onChange={(e) => currentRestaurant && setCurrentRestaurant({...currentRestaurant, image: e.target.value})}
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
    </div>
  );
}

export default AdminDashboard; 