import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingCart, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(40);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  
  // Load cart from localStorage on component mount
  useEffect(() => {
    const userName = localStorage.getItem('userName');
    if (!userName) {
      toast.error('Please login to view your cart');
      navigate('/login');
      return;
    }
    
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
    }
  }, [navigate]);
  
  // Calculate totals whenever cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      const newSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      setSubtotal(newSubtotal);
      
      // Update delivery fee based on subtotal (free delivery for orders over ₹500)
      const newDeliveryFee = newSubtotal > 500 ? 0 : 40;
      setDeliveryFee(newDeliveryFee);
      
      // Calculate tax (5% of subtotal)
      const newTax = newSubtotal * 0.05;
      setTax(newTax);
      
      // Calculate total
      setTotal(newSubtotal + newDeliveryFee + newTax);
    } else {
      setSubtotal(0);
      setTax(0);
      setTotal(0);
    }
  }, [cartItems]);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cartItems]);
  
  // Functions to handle cart item quantity
  const increaseQuantity = (itemId) => {
    const updatedCartItems = cartItems.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    setCartItems(updatedCartItems);
  };
  
  const decreaseQuantity = (itemId) => {
    const updatedCartItems = cartItems.map(item => {
      if (item.id === itemId && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });
    setCartItems(updatedCartItems);
  };
  
  const removeItem = (itemId) => {
    const updatedCartItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCartItems);
    toast.info('Item removed from cart');
  };
  
  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    // Store cart totals in localStorage for the checkout page
    localStorage.setItem('cartTotals', JSON.stringify({
      subtotal,
      deliveryFee,
      tax,
      total
    }));
    
    navigate('/checkout');
  };
  
  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-orange-500 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </button>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="flex flex-col items-center py-8">
                <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Add items from restaurants to start an order</p>
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
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-orange-500 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          
          <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
          
          {/* Restaurant info */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-4 flex items-center">
            <img 
              src={cartItems[0].restaurantImage} 
              alt={cartItems[0].restaurantName}
              className="h-16 w-16 object-cover rounded-lg mr-4"
            />
            <div>
              <h2 className="font-bold">{cartItems[0].restaurantName}</h2>
              <p className="text-sm text-gray-500">{cartItems[0].restaurantId}</p>
            </div>
          </div>
          
          {/* Cart Items */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold">Items ({cartItems.reduce((total, item) => total + item.quantity, 0)})</h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {cartItems.map(item => (
                <div key={item.id} className="p-4 flex items-center">
                  {/* Item details */}
                  <div className="flex-1">
                    {item.isVeg && (
                      <div className="h-4 w-4 border border-green-500 flex items-center justify-center rounded-sm mb-1">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                    )}
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{item.description}</p>
                    <p className="font-medium">₹{item.price.toFixed(2)}</p>
                  </div>
                  
                  {/* Quantity controls */}
                  <div className="flex items-center">
                    <button 
                      onClick={() => decreaseQuantity(item.id)}
                      className="p-1 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="mx-3 font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => increaseQuantity(item.id)}
                      className="p-1 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="ml-4 p-1 text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold">Order Summary</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes (5%)</span>
                <span className="font-medium">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <span className="font-bold">Total</span>
                <span className="font-bold">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Checkout Button */}
          <button 
            onClick={proceedToCheckout}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-4 rounded-xl flex items-center justify-center font-semibold text-lg"
          >
            Proceed to Checkout <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart; 