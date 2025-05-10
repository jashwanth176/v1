import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, Wallet, CheckCircle, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

// Backend API URL
const API_URL = 'http://localhost:8080/api';

const Checkout = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotals, setCartTotals] = useState({
    subtotal: 0,
    deliveryFee: 0,
    tax: 0,
    total: 0
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (!userName) {
      toast.error('Please login to proceed with checkout');
      navigate('/login');
      return;
    }
    
    // Load cart items
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }
    const parsedCart = JSON.parse(savedCart);
    setCartItems(parsedCart);
    
    // Load cart totals
    const savedTotals = localStorage.getItem('cartTotals');
    if (savedTotals) {
      setCartTotals(JSON.parse(savedTotals));
    }
    
    // Set default user details
    setUserDetails({
      name: userName,
      email: `${userName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: '9876543210',
      address: localStorage.getItem('selectedAddress') || 'KL University, Guntur, Andhra Pradesh, India'
    });
  }, [navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({
      ...userDetails,
      [name]: value
    });
  };
  
  const placeOrder = async () => {
    // Validate input fields
    if (!userDetails.name || !userDetails.email || !userDetails.phone || !userDetails.address) {
      toast.error('Please fill in all delivery details');
      return;
    }
    
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create orders for each cart item
      // Note: In a real app, you might want to create a single order with multiple items
      const orderPromises = cartItems.map(item => {
        const orderData = {
          menuItem: { id: item.id },
          userName: userDetails.name,
          userEmail: userDetails.email,
          price: item.price * item.quantity,
          address: userDetails.address,
          phoneNumber: userDetails.phone,
          paymentMethod: paymentMethod,
          deliveryNotes: `${item.quantity} x ${item.name}`
        };
        
        return axios.post(`${API_URL}/orders`, orderData);
      });
      
      await Promise.all(orderPromises);
      
      // Clear cart and totals
      localStorage.removeItem('cart');
      localStorage.removeItem('cartTotals');
      
      // Save order summary for confirmation page
      localStorage.setItem('orderSummary', JSON.stringify({
        items: cartItems,
        totals: cartTotals,
        paymentMethod,
        userDetails,
        orderDate: new Date().toISOString()
      }));
      
      // Navigate to confirmation page
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (cartItems.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">No items in cart</h2>
              <p className="text-gray-500 mb-6">Your cart is empty. Add items to proceed with checkout.</p>
              <button 
                onClick={() => navigate('/restaurants')}
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3 rounded-full hover:from-orange-600 hover:to-pink-600"
              >
                Browse Restaurants
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center text-gray-600 hover:text-orange-500 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Cart
          </button>
          
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - Delivery and Payment Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Delivery Details */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-semibold">Delivery Details</h2>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={userDetails.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={userDetails.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                      placeholder="Your email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={userDetails.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                      placeholder="Your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                    <textarea
                      name="address"
                      value={userDetails.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                      placeholder="Your delivery address"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
              
              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-semibold">Payment Method</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div 
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <div className={`p-2 rounded-full ${paymentMethod === 'card' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                        <CreditCard className={`h-5 w-5 ${paymentMethod === 'card' ? 'text-orange-500' : 'text-gray-500'}`} />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">Credit/Debit Card</p>
                        <p className="text-xs text-gray-500">Pay with Visa, Mastercard, RuPay</p>
                      </div>
                      {paymentMethod === 'card' && <CheckCircle className="ml-auto h-5 w-5 text-orange-500" />}
                    </div>
                    
                    <div 
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${paymentMethod === 'upi' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                      onClick={() => setPaymentMethod('upi')}
                    >
                      <div className={`p-2 rounded-full ${paymentMethod === 'upi' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                        <Smartphone className={`h-5 w-5 ${paymentMethod === 'upi' ? 'text-orange-500' : 'text-gray-500'}`} />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">UPI / QR Code</p>
                        <p className="text-xs text-gray-500">Pay with Google Pay, PhonePe, Paytm</p>
                      </div>
                      {paymentMethod === 'upi' && <CheckCircle className="ml-auto h-5 w-5 text-orange-500" />}
                    </div>
                    
                    <div 
                      className={`flex items-center p-3 border rounded-lg cursor-pointer ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <div className={`p-2 rounded-full ${paymentMethod === 'cod' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                        <Wallet className={`h-5 w-5 ${paymentMethod === 'cod' ? 'text-orange-500' : 'text-gray-500'}`} />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-xs text-gray-500">Pay when your order arrives</p>
                      </div>
                      {paymentMethod === 'cod' && <CheckCircle className="ml-auto h-5 w-5 text-orange-500" />}
                    </div>
                  </div>
                  
                  {/* Demo Payment UI */}
                  {paymentMethod === 'card' && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium mb-3">Card Details</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Card Number</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                            placeholder="4242 4242 4242 4242"
                            maxLength="19"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Expiry Date</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                              placeholder="MM/YY"
                              maxLength="5"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">CVV</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                              placeholder="123"
                              maxLength="3"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {paymentMethod === 'upi' && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium mb-3">Scan QR Code</h3>
                      <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
                          <img 
                            src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                            alt="QR Code"
                            className="h-48 w-48"
                          />
                        </div>
                      </div>
                      <p className="text-center text-sm text-gray-500 mt-3">Scan this QR code with any UPI app to pay</p>
                      <div className="mt-3">
                        <label className="block text-sm text-gray-600 mb-1">Or enter UPI ID</label>
                        <div className="flex">
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
                            placeholder="yourname@upi"
                          />
                          <button className="bg-orange-500 text-white px-4 py-2 rounded-r-lg hover:bg-orange-600">
                            Pay
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right column - Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-semibold">Order Summary</h2>
                </div>
                
                <div className="p-4">
                  <div className="max-h-48 overflow-y-auto mb-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center py-2">
                        <div className="w-6 text-gray-500">{item.quantity}x</div>
                        <div className="ml-2 flex-1">
                          <p className="font-medium">{item.name}</p>
                        </div>
                        <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span>₹{cartTotals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Delivery Fee</span>
                      <span>₹{cartTotals.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Taxes</span>
                      <span>₹{cartTotals.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                      <span>Total</span>
                      <span>₹{cartTotals.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={placeOrder}
                    disabled={isProcessing}
                    className={`w-full mt-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-lg flex items-center justify-center font-semibold ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing ? 'Processing...' : (
                      <>
                        Place Order <ChevronRight className="ml-1 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 