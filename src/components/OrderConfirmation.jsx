import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, ChevronRight, Package, CreditCard, Phone } from 'lucide-react';
import { toast } from 'react-toastify';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [orderSummary, setOrderSummary] = useState(null);
  
  useEffect(() => {
    const savedOrderSummary = localStorage.getItem('orderSummary');
    if (!savedOrderSummary) {
      toast.error('No order details found');
      navigate('/restaurants');
      return;
    }
    
    setOrderSummary(JSON.parse(savedOrderSummary));
  }, [navigate]);
  
  // If no order summary data
  if (!orderSummary) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading order information...</p>
        </div>
      </div>
    );
  }
  
  // Format date for display
  const orderDate = new Date(orderSummary.orderDate);
  const formattedDate = orderDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Get payment method display text
  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'upi':
        return 'UPI Payment';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return 'Online Payment';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-6 text-center">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-4">Thank you for your order. We&apos;ve received your order and will begin processing it right away.</p>
            <div className="text-gray-500 mb-6">
              <p>Order placed on {formattedDate}</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/restaurants')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-3 rounded-lg flex items-center justify-center"
              >
                Order More Food
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-5 py-3 rounded-lg flex items-center justify-center"
              >
                Track Order <ChevronRight className="ml-1 h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Order Details */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold">Order Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Delivery Info */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Delivery Information</h3>
                  <div className="space-y-3">
                    <div className="flex">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{orderSummary.userDetails.name}</p>
                        <p className="text-gray-600">{orderSummary.userDetails.address}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <p className="text-gray-600">{orderSummary.userDetails.phone}</p>
                    </div>
                    <div className="flex">
                      <Clock className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Estimated Delivery Time</p>
                        <p className="text-gray-600">30-45 minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Order Info */}
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Order Information</h3>
                  <div className="space-y-3">
                    <div className="flex">
                      <Package className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Order Items</p>
                        <p className="text-gray-600">{orderSummary.items.reduce((total, item) => total + item.quantity, 0)} Items from {orderSummary.items[0].restaurantName}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <CreditCard className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Payment Method</p>
                        <p className="text-gray-600">{getPaymentMethodDisplay(orderSummary.paymentMethod)}</p>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="h-5 w-5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Total Amount</p>
                        <p className="text-gray-600">₹{orderSummary.totals.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold">Order Summary</h2>
            </div>
            <div className="p-4">
              <div className="divide-y divide-gray-100">
                {orderSummary.items.map(item => (
                  <div key={item.id} className="py-3 flex items-center">
                    <div className="w-6 text-gray-500">{item.quantity}x</div>
                    <div className="ml-2 flex-1">
                      <p className="font-medium">{item.name}</p>
                      {item.isVeg && (
                        <div className="inline-flex items-center mt-1">
                          <div className="h-4 w-4 border border-green-500 flex items-center justify-center rounded-sm mr-1">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          </div>
                          <span className="text-xs text-green-600">Veg</span>
                        </div>
                      )}
                    </div>
                    <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 border-t border-gray-100 pt-3 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{orderSummary.totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>₹{orderSummary.totals.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes</span>
                  <span>₹{orderSummary.totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>₹{orderSummary.totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation; 