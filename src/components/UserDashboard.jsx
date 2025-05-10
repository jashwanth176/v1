import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  History, 
  Shield, 
  BarChart2, 
  Settings,
  LogOut,
  Heart,
  MapPin,
  CreditCard,
  Package,
  DollarSign,
  AlertTriangle,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { SiteHeader } from '../App';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Backend API URL
const API_URL = 'http://localhost:8080/api';

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to get order status badge color
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'processing':
      return 'bg-blue-100 text-blue-700';
    case 'completed':
    case 'delivered':
      return 'bg-green-100 text-green-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteRestaurant: null,
    monthlyOrders: []
  });
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'Credit Card', last4: '4242', expiry: '05/25', default: true },
    { id: 2, type: 'Debit Card', last4: '8765', expiry: '09/26', default: false }
  ]);
  const [addresses, setAddresses] = useState([
    { 
      id: 1, 
      name: 'KL University', 
      line1: 'Vaddeswaram', 
      line2: 'Guntur District', 
      city: 'Guntur', 
      state: 'Andhra Pradesh', 
      postal: '522302', 
      default: true 
    },
    { 
      id: 2, 
      name: 'Home', 
      line1: '123 Main Street', 
      line2: 'Apartment 4B', 
      city: 'Vijayawada', 
      state: 'Andhra Pradesh', 
      postal: '520001', 
      default: false 
    }
  ]);
  
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail') || `${userName?.toLowerCase().replace(/\s+/g, '')}@example.com`;

  // Fetch orders from API
  useEffect(() => {
    if (activeTab === 'history' || activeTab === 'analytics') {
      setLoading(true);
      setError(null);
      
      // Fetch orders for the current user
      axios.get(`${API_URL}/orders/user/${userName}`)
        .then(response => {
          setOrders(response.data);
          
          // Process analytics data
          if (activeTab === 'analytics') {
            processAnalyticsData(response.data);
          }
          
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching orders:', err);
          setError('Failed to load your orders. Please try again later.');
          setLoading(false);
          
          // Show error toast
          toast.error('Failed to load order data');
        });
    }
  }, [activeTab, userName]);
  
  // Process order data for analytics
  const processAnalyticsData = (orderData) => {
    if (!orderData || orderData.length === 0) {
      return;
    }
    
    // Calculate total spent
    const totalSpent = orderData.reduce((sum, order) => sum + order.price, 0);
    
    // Count by restaurant to find favorite
    const restaurantCounts = {};
    orderData.forEach(order => {
      if (order.menuItem && order.menuItem.restaurant) {
        const restaurantId = order.menuItem.restaurant.id;
        const restaurantName = order.menuItem.restaurant.name;
        
        if (!restaurantCounts[restaurantId]) {
          restaurantCounts[restaurantId] = {
            name: restaurantName,
            count: 0
          };
        }
        
        restaurantCounts[restaurantId].count++;
      }
    });
    
    // Find restaurant with highest count
    let favoriteRestaurant = null;
    let maxCount = 0;
    
    Object.values(restaurantCounts).forEach(restaurant => {
      if (restaurant.count > maxCount) {
        maxCount = restaurant.count;
        favoriteRestaurant = restaurant.name;
      }
    });
    
    // Prepare monthly order data for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    
    // Initialize with last 6 months
    const monthLabels = [];
    const monthData = [];
    
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - 5 + i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      monthLabels.push(monthName);
      monthData.push(0);
    }
    
    // Fill in actual order counts
    orderData.forEach(order => {
      const orderDate = new Date(order.orderDate);
      if (orderDate >= sixMonthsAgo) {
        const monthIndex = orderDate.getMonth();
        const currentMonth = new Date().getMonth();
        
        // Calculate position in our 6-month array
        const adjustedIndex = (monthIndex - (currentMonth - 5) + 12) % 12;
        
        // Only count if it's within our 6-month window
        if (adjustedIndex >= 0 && adjustedIndex < 6) {
          monthData[adjustedIndex]++;
        }
      }
    });
    
    setAnalyticsData({
      totalOrders: orderData.length,
      totalSpent,
      favoriteRestaurant,
      monthlyOrders: {
        labels: monthLabels,
        data: monthData
      }
    });
  };
  
  // Prepare chart data
  const chartData = {
    labels: analyticsData.monthlyOrders.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Orders',
        data: analyticsData.monthlyOrders.data || [0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Order History'
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    
    // Use navigate instead of window.location
    navigate('/');
  };

  const handleSetDefaultPayment = (id) => {
    setPaymentMethods(methods => 
      methods.map(method => ({
        ...method,
        default: method.id === id
      }))
    );
    toast.success('Default payment method updated');
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(addrs => 
      addrs.map(addr => ({
        ...addr,
        default: addr.id === id
      }))
    );
    toast.success('Default address updated');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{userName}</h2>
                  <p className="text-gray-600">{userEmail}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'history' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <History className="w-5 h-5" />
                  <span>Order History</span>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'analytics' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BarChart2 className="w-5 h-5" />
                  <span>Analytics</span>
                </button>

                <button
                  onClick={() => setActiveTab('payment')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'payment' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Methods</span>
                </button>

                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'addresses' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  <span>Saved Addresses</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'security' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Security</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'settings' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                          type="text"
                          value={userName || ''}
                          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          value={userEmail || ''}
                          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Member Since</label>
                        <input
                          type="text"
                          value="March 2024"
                          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Account Type</label>
                        <input
                          type="text"
                          value="Standard"
                          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Order History</h3>
                  
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <p className="text-red-600 mb-4">{error}</p>
                      <button 
                        onClick={() => setActiveTab('history')} 
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No orders yet</p>
                      <Link 
                        to="/restaurants" 
                        className="mt-4 inline-block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                      >
                        Browse Restaurants
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(order.orderDate)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {order.menuItem ? (
                                  <div className="flex items-center">
                                    <span className="font-medium">{order.menuItem.name}</span>
                                    {order.deliveryNotes && (
                                      <span className="ml-2 text-gray-500">({order.deliveryNotes})</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">Unknown item</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ₹{order.price ? order.price.toFixed(2) : '0.00'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                  {order.status || 'Unknown'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h3>
                  
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-12 h-12 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <p className="text-red-600 mb-4">{error}</p>
                      <button 
                        onClick={() => setActiveTab('analytics')} 
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <BarChart2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No order data available for analysis</p>
                      <Link 
                        to="/restaurants" 
                        className="mt-4 inline-block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                      >
                        Browse Restaurants
                      </Link>
                    </div>
                  ) : (
                    <div>
                      {/* Analytics Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-gray-600 text-sm">Total Orders</h4>
                            <Package className="h-5 w-5 text-orange-500" />
                          </div>
                          <p className="text-2xl font-bold">{analyticsData.totalOrders}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-gray-600 text-sm">Total Spent</h4>
                            <DollarSign className="h-5 w-5 text-orange-500" />
                          </div>
                          <p className="text-2xl font-bold">₹{analyticsData.totalSpent.toFixed(2)}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-gray-600 text-sm">Favorite Restaurant</h4>
                            <Heart className="h-5 w-5 text-orange-500" />
                          </div>
                          <p className="text-lg font-bold">
                            {analyticsData.favoriteRestaurant || 'Not enough data'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Order Trend Chart */}
                      <div className="h-[400px]">
                        <Line data={chartData} options={chartOptions} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payment' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Payment Methods</h3>
                  
                  <div className="space-y-4">
                    {paymentMethods.map(method => (
                      <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center">
                                <h4 className="font-medium">{method.type} •••• {method.last4}</h4>
                                {method.default && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Default</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {!method.default && (
                              <button 
                                onClick={() => handleSetDefaultPayment(method.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                                title="Set as default"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="Edit">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Remove">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button className="mt-4 w-full flex items-center justify-center space-x-2 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                      <PlusCircle className="w-5 h-5" />
                      <span>Add Payment Method</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Saved Addresses</h3>
                  
                  <div className="space-y-4">
                    {addresses.map(address => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between">
                          <div>
                            <div className="flex items-center mb-1">
                              <h4 className="font-medium">{address.name}</h4>
                              {address.default && (
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Default</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700">{address.line1}</p>
                            {address.line2 && <p className="text-sm text-gray-700">{address.line2}</p>}
                            <p className="text-sm text-gray-700">{address.city}, {address.state} {address.postal}</p>
                          </div>
                          <div className="flex space-x-2">
                            {!address.default && (
                              <button 
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                                title="Set as default"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="Edit">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Remove">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button className="mt-4 w-full flex items-center justify-center space-x-2 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors">
                      <PlusCircle className="w-5 h-5" />
                      <span>Add New Address</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Security Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Shield className="w-6 h-6 text-orange-500" />
                        <div>
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      <Link
                        to="/setup-mfa"
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Setup
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Heart className="w-6 h-6 text-orange-500" />
                        <div>
                          <h4 className="font-medium">Favorites</h4>
                          <p className="text-sm text-gray-600">Manage your favorite restaurants and dishes</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                        View
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Settings className="w-6 h-6 text-orange-500" />
                        <div>
                          <h4 className="font-medium">Preferences</h4>
                          <p className="text-sm text-gray-600">Customize your FoodieHub experience</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
