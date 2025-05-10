import { useState, useEffect } from 'react';
import { FaPencilAlt, FaTrash, FaPlus, FaUtensils } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

// Backend API URL
const API_URL = 'http://localhost:8080/api';

const MenuItemManagement = ({ restaurantId, onClose }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/menu-items/restaurant/${restaurantId}`);
        setMenuItems(response.data);
      } catch (err) {
        console.error("Error fetching menu items:", err);
        setError("Failed to load menu items. Please try again later.");
        toast.error("Failed to load menu items. Please try again later.", { autoClose: 2000 });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenuItems();
  }, [restaurantId]);
  
  const handleEditMenuItem = (menuItem) => {
    setCurrentMenuItem(menuItem);
    setIsEditing(true);
  };
  
  const handleDeleteMenuItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await axios.delete(`${API_URL}/menu-items/${id}`);
        const updatedMenuItems = menuItems.filter(item => item.id !== id);
        setMenuItems(updatedMenuItems);
        toast.success('Menu item deleted successfully', { autoClose: 2000 });
      } catch (err) {
        console.error("Error deleting menu item:", err);
        toast.error("Failed to delete menu item. Please try again.", { autoClose: 2000 });
      }
    }
  };
  
  const handleToggleAvailability = async (id) => {
    try {
      const menuItem = menuItems.find(item => item.id === id);
      const updatedAvailability = !menuItem.isAvailable;
      
      // Create a clean object with only the properties that the backend expects
      const menuItemData = {
        id: menuItem.id,
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        imageUrl: menuItem.imageUrl,
        isVeg: menuItem.isVeg,
        isAvailable: updatedAvailability,
        restaurant: { id: restaurantId },
        tags: menuItem.tags || []
      };
      
      // Update the menu item in the backend
      await axios.put(`${API_URL}/menu-items/${id}`, menuItemData);
      
      const updatedMenuItems = menuItems.map(item => {
        if (item.id === id) {
          const newStatus = updatedAvailability ? 'available' : 'unavailable';
          toast.info(`Menu item is now ${newStatus}`, { autoClose: 2000 });
          return { ...item, isAvailable: updatedAvailability };
        }
        return item;
      });
      
      setMenuItems(updatedMenuItems);
    } catch (err) {
      console.error("Error updating menu item availability:", err);
      toast.error("Failed to update availability. Please try again.", { autoClose: 2000 });
    }
  };
  
  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    
    try {
      // Get form values
      const formData = {
        name: e.target.name.value,
        description: e.target.description.value,
        price: parseFloat(e.target.price.value),
        imageUrl: e.target.imageUrl.value,
        isVeg: e.target.isVeg.checked,
        isAvailable: e.target.isAvailable.checked,
        restaurant: { id: restaurantId },
        tags: e.target.tags.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      };
      
      if (currentMenuItem) {
        // Update existing menu item
        const response = await axios.put(`${API_URL}/menu-items/${currentMenuItem.id}`, {
          ...formData,
          id: currentMenuItem.id
        });
        
        const updatedMenuItems = menuItems.map(item => 
          item.id === response.data.id ? response.data : item
        );
        setMenuItems(updatedMenuItems);
        toast.success('Menu item updated successfully', { autoClose: 2000 });
      } else {
        // Add new menu item
        const response = await axios.post(`${API_URL}/menu-items`, formData);
        setMenuItems([...menuItems, response.data]);
        toast.success('Menu item added successfully', { autoClose: 2000 });
      }
    } catch (err) {
      console.error("Error saving menu item:", err);
      toast.error("Failed to save menu item. Please try again.", { autoClose: 2000 });
      return; // Don't close the modal on error
    }
    
    setIsEditing(false);
    setCurrentMenuItem(null);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Menu Management
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {isEditing ? (
            <form onSubmit={handleSaveMenuItem}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    defaultValue={currentMenuItem?.name || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    defaultValue={currentMenuItem?.price || ''}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    defaultValue={currentMenuItem?.description || ''}
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    name="imageUrl"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    defaultValue={currentMenuItem?.imageUrl || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    defaultValue={currentMenuItem?.tags?.join(', ') || ''}
                    placeholder="e.g., Spicy, Breakfast, Popular"
                  />
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isVeg"
                      id="isVeg"
                      className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      defaultChecked={currentMenuItem?.isVeg || false}
                    />
                    <label htmlFor="isVeg" className="ml-2 block text-sm text-gray-700">
                      Vegetarian
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      id="isAvailable"
                      className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      defaultChecked={currentMenuItem?.isAvailable !== false}
                    />
                    <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                      Available
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => {setIsEditing(false); setCurrentMenuItem(null)}}
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  {currentMenuItem ? 'Update Menu Item' : 'Add Menu Item'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-gray-600">
                    Manage the menu items for this restaurant. Add new items or edit existing ones.
                  </p>
                </div>
                <button
                  onClick={() => {setIsEditing(true); setCurrentMenuItem(null)}}
                  className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center"
                >
                  <FaPlus className="mr-2" /> Add Menu Item
                </button>
              </div>
              
              {isLoading ? (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                  <p className="text-gray-500">Loading menu items...</p>
                </div>
              ) : error ? (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                  <p className="text-red-500">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg"
                  >
                    Retry
                  </button>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                  <div className="flex flex-col items-center">
                    <FaUtensils className="text-4xl text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium mb-2">No menu items yet</h3>
                    <p className="text-gray-500 mb-4">This restaurant doesn&apos;t have any menu items yet. Add your first menu item to get started!</p>
                    <button 
                      onClick={() => {setIsEditing(true); setCurrentMenuItem(null)}}
                      className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center"
                    >
                      <FaPlus className="mr-2" /> Add First Menu Item
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {menuItems.map((menuItem) => (
                        <tr key={menuItem.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                                <img 
                                  src={menuItem.imageUrl || 'https://via.placeholder.com/150?text=No+Image'} 
                                  alt={menuItem.name} 
                                  className="h-full w-full object-cover" 
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {menuItem.name} 
                                  {menuItem.isVeg && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                      Veg
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">{menuItem.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ₹{menuItem.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                menuItem.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {menuItem.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleToggleAvailability(menuItem.id)}
                                className={`px-2 py-1 rounded ${
                                  menuItem.isAvailable ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'
                                }`}
                              >
                                {menuItem.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                              </button>
                              <button 
                                onClick={() => handleEditMenuItem(menuItem)}
                                className="px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                              >
                                <FaPencilAlt />
                              </button>
                              <button 
                                onClick={() => handleDeleteMenuItem(menuItem.id)}
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

MenuItemManagement.propTypes = {
  restaurantId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onClose: PropTypes.func.isRequired
};

export default MenuItemManagement; 