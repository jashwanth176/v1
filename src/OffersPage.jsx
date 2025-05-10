import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Clock, Tag, Copy, Scissors, CheckCircle, Gift, Percent, Award, TrendingUp, Zap, X, ChevronLeft, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// API URL
const API_URL = 'http://localhost:8080/api';

// Mock offers data
const offersList = [
  {
    id: 'WELCOME50',
    title: 'Welcome Offer',
    code: 'WELCOME50',
    discount: '50% OFF',
    maxDiscount: 'Up to ₹150',
    validity: '31 May 2023',
    description: 'Valid on your first order. Minimum order value ₹299.',
    terms: [
      'Valid on your first order only',
      'Minimum order value ₹299',
      'Maximum discount ₹150',
      'Not valid on combo offers'
    ],
    type: 'new',
    bgColor: 'from-green-500 to-emerald-700',
    icon: Gift
  },
  {
    id: 'SUMMER25',
    title: 'Summer Special',
    code: 'SUMMER25',
    discount: '25% OFF',
    maxDiscount: 'Up to ₹100',
    validity: '15 June 2023',
    description: 'Beat the heat with special summer discounts!',
    terms: [
      'Valid on all restaurants',
      'Minimum order value ₹199',
      'Maximum discount ₹100',
      'Cannot be combined with other offers'
    ],
    type: 'special',
    bgColor: 'from-orange-500 to-amber-700',
    icon: TrendingUp
  },
  {
    id: 'FREEDEL',
    title: 'Free Delivery',
    code: 'FREEDEL',
    discount: 'FREE DELIVERY',
    maxDiscount: 'Save ₹40',
    validity: '30 June 2023',
    description: 'Free delivery on all orders above ₹199',
    terms: [
      'Valid on orders above ₹199',
      'Limited to 5 uses per user',
      'Valid for delivery within 5km',
      'Not applicable during peak hours'
    ],
    type: 'delivery',
    bgColor: 'from-blue-500 to-indigo-700',
    icon: Zap
  },
  {
    id: 'WEEKEND30',
    title: 'Weekend Bonanza',
    code: 'WEEKEND30',
    discount: '30% OFF',
    maxDiscount: 'Up to ₹300',
    validity: 'Every Sat-Sun',
    description: 'Make your weekends special with extra discounts',
    terms: [
      'Valid only on weekends (Sat-Sun)',
      'Minimum order value ₹499',
      'Maximum discount ₹300',
      'Valid on select restaurants only'
    ],
    type: 'weekend',
    bgColor: 'from-purple-500 to-violet-700',
    icon: Award
  },
  {
    id: 'VEGGIE20',
    title: 'Vegetarian Special',
    code: 'VEGGIE20',
    discount: '20% OFF',
    maxDiscount: 'Up to ₹120',
    validity: '31 May 2023',
    description: 'Special discount on all vegetarian items',
    terms: [
      'Valid on vegetarian items only',
      'Minimum order value ₹249',
      'Maximum discount ₹120',
      'Valid on all restaurants'
    ],
    type: 'category',
    bgColor: 'from-emerald-400 to-green-700',
    icon: Percent
  }
];

// Coupon management functions
const saveCoupon = (couponCode) => {
  const savedCoupons = JSON.parse(localStorage.getItem('savedCoupons') || '[]');
  if (!savedCoupons.includes(couponCode)) {
    savedCoupons.push(couponCode);
    localStorage.setItem('savedCoupons', JSON.stringify(savedCoupons));
    return true; // New coupon added
  }
  return false; // Coupon already exists
};

const removeCoupon = (couponCode) => {
  const savedCoupons = JSON.parse(localStorage.getItem('savedCoupons') || '[]');
  const updatedCoupons = savedCoupons.filter(code => code !== couponCode);
  localStorage.setItem('savedCoupons', JSON.stringify(updatedCoupons));
  
  // If removing the active coupon, clear it
  if (localStorage.getItem('activeCoupon') === couponCode) {
    localStorage.removeItem('activeCoupon');
    localStorage.removeItem('couponDiscount');
  }
};

const applyCoupon = (couponCode, discountDetails) => {
  localStorage.setItem('activeCoupon', couponCode);
  
  // Save discount information
  localStorage.setItem('couponDiscount', JSON.stringify(discountDetails));
};

// Main OffersPage component
const OffersPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [savedCoupons, setSavedCoupons] = useState([]);
  const [activeCoupon, setActiveCoupon] = useState('');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load saved coupons from localStorage on component mount
  useEffect(() => {
    const storedCoupons = JSON.parse(localStorage.getItem('savedCoupons') || '[]');
    setSavedCoupons(storedCoupons);
    setActiveCoupon(localStorage.getItem('activeCoupon') || '');
  }, []);

  // Filter categories
  const filterCategories = [
    { id: 'all', label: 'All Offers' },
    { id: 'saved', label: 'Saved' },
    { id: 'new', label: 'New' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'special', label: 'Special' },
    { id: 'weekend', label: 'Weekend' }
  ];

  // Filtered offers based on active filter and search
  const filteredOffers = offersList.filter(offer => {
    // First apply the category filter
    if (activeFilter === 'all') {
      // Show all except those already filtered by search
    } else if (activeFilter === 'saved') {
      if (!savedCoupons.includes(offer.id)) return false;
    } else if (offer.type !== activeFilter) {
      return false;
    }
    
    // Then apply search filter if any
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        offer.title.toLowerCase().includes(query) ||
        offer.code.toLowerCase().includes(query) ||
        offer.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Handle copy coupon code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        toast.success(`Coupon code ${code} copied!`, {
          position: "top-right"
        });
      })
      .catch(err => {
        toast.error('Failed to copy code', {
          position: "top-right"
        });
        console.error('Could not copy text: ', err);
      });
  };

  // Handle save coupon
  const handleSaveCoupon = (couponCode) => {
    const isNewlySaved = saveCoupon(couponCode);
    setSavedCoupons(JSON.parse(localStorage.getItem('savedCoupons') || '[]'));
    
    if (isNewlySaved) {
      // Trigger confetti effect on new save
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success(`Coupon ${couponCode} saved successfully!`, {
        position: "top-right"
      });
    } else {
      toast.info(`Coupon ${couponCode} already saved`, {
        position: "top-right"
      });
    }
  };

  // Handle remove coupon
  const handleRemoveCoupon = (couponCode) => {
    removeCoupon(couponCode);
    setSavedCoupons(JSON.parse(localStorage.getItem('savedCoupons') || '[]'));
    toast.info(`Coupon ${couponCode} removed`, {
      position: "top-right"
    });
    
    // If the active coupon is removed, clear it
    if (activeCoupon === couponCode) {
      setActiveCoupon('');
      localStorage.removeItem('activeCoupon');
    }
  };

  // Check if this is the user's first order
  const checkFirstTimeUser = async () => {
    try {
      // Get the userName from localStorage
      const userName = localStorage.getItem('userName');
      if (!userName) {
        return false; // Can't determine if first time if no user is logged in
      }
      
      // Call API to check if user has previous orders
      const response = await axios.get(`${API_URL}/orders/user/${userName}`);
      
      // If user has no orders, they're eligible for the welcome offer
      return response.data.length === 0;
    } catch (error) {
      console.error('Error checking first-time user status:', error);
      return false; // If there's an error, default to not eligible
    }
  };

  // Handle apply coupon
  const handleApplyCoupon = async (couponCode) => {
    // Find the offer details
    const offer = offersList.find(o => o.id === couponCode);
    
    // Check if it's the welcome offer and not the first order
    if (couponCode === 'WELCOME50') {
      const isFirstTimeUser = await checkFirstTimeUser();
      if (!isFirstTimeUser) {
        toast.error("Welcome offer can only be applied on your first order", {
          position: "top-right"
        });
        return;
      }
    }
    
    // Calculate discount information
    const discountInfo = {
      code: couponCode,
      type: offer.type,
      discountText: offer.discount,
      maxDiscount: offer.maxDiscount.replace('Up to ₹', '').replace('Save ₹', '')
    };
    
    // If it's a percentage discount, extract the percentage value
    if (offer.discount.includes('%')) {
      discountInfo.percentOff = parseInt(offer.discount.replace('% OFF', ''), 10);
    }
    
    // Apply the coupon
    applyCoupon(couponCode, discountInfo);
    setActiveCoupon(couponCode);
    
    toast.success(`Coupon ${couponCode} applied! Discount will be applied at checkout.`, {
      position: "top-right"
    });
    
    // Super confetti celebration
    confetti({
      particleCount: 200,
      spread: 180,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="pt-16 bg-gradient-to-r from-orange-500 to-pink-500">
        <div className="container mx-auto px-4 py-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="mr-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-white">Special Offers & Discounts</h1>
            </div>
            
            <button 
              onClick={() => navigate('/restaurants')}
              className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-full shadow-md hover:bg-orange-50 transition-all"
            >
              <MapPin size={16} />
              <span className="hidden sm:inline">Restaurants</span>
            </button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6"
          >
            <p className="text-white text-opacity-90 max-w-2xl mx-auto">
              Discover amazing deals and save on your favorite food. Apply these coupon codes at checkout.
            </p>
          </motion.div>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md mx-auto mt-8 relative"
          >
            <input
              type="text"
              placeholder="Search for offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 px-4 pr-10 rounded-full shadow-lg border-0 focus:ring-2 focus:ring-orange-300"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Filter Categories */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex overflow-x-auto py-4 no-scrollbar"
          >
            {filterCategories.map((category, index) => (
              <motion.button
                key={category.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(category.id)}
                className={`px-4 py-2 mx-2 rounded-full whitespace-nowrap transition-all ${
                  activeFilter === category.id 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              >
                {category.label}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Offers Grid */}
      <div className="container mx-auto px-4 py-8">
        {activeCoupon && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 shadow-lg text-white relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 bottom-0 opacity-10">
              <CheckCircle size={150} />
            </div>
            <div className="flex items-center">
              <CheckCircle className="mr-3" size={24} />
              <div>
                <h3 className="font-bold">Active Coupon: {activeCoupon}</h3>
                <p className="text-sm text-white text-opacity-90">This coupon will be automatically applied at checkout</p>
              </div>
              <button 
                onClick={() => {
                  setActiveCoupon('');
                  localStorage.removeItem('activeCoupon');
                  toast.info(`Coupon ${activeCoupon} removed`, {
                    position: "top-right"
                  });
                }}
                className="ml-auto bg-white bg-opacity-20 rounded-full p-1 hover:bg-opacity-30 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
        
        {filteredOffers.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Tag className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">No offers found</h3>
            <p className="text-gray-500">Try adjusting your filters or search criteria</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredOffers.map((offer, index) => (
                <motion.div
                  key={offer.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 relative group"
                >
                  {/* Coupon header */}
                  <div className={`bg-gradient-to-r ${offer.bgColor} p-4 text-white relative`}>
                    <div className="absolute right-0 top-0 bottom-0 opacity-10">
                      <offer.icon size={100} />
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-medium bg-white bg-opacity-20 rounded-full px-2 py-1">
                          {offer.type.toUpperCase()}
                        </span>
                        <h3 className="text-lg font-bold mt-1">{offer.title}</h3>
                        <p className="text-xs text-white text-opacity-90">Valid till {offer.validity}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{offer.discount}</div>
                        <div className="text-xs text-white text-opacity-90">{offer.maxDiscount}</div>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 left-0 right-0 h-4 bg-[radial-gradient(circle_at_center,transparent_70%,white_0%)] bg-[length:12px_12px]"></div>
                  </div>
                  
                  {/* Coupon body */}
                  <div className="p-4">
                    <p className="text-gray-600 text-sm">{offer.description}</p>
                    
                    <div className="mt-4 flex items-center">
                      <div className="bg-gray-100 rounded-md px-3 py-2 text-gray-700 font-mono font-medium flex-grow text-center relative overflow-hidden">
                        {offer.code}
                        <div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 pointer-events-none"
                          style={{ transform: 'translateX(-100%)' }}
                        ></div>
                      </div>
                      <button 
                        onClick={() => handleCopyCode(offer.code)}
                        className="ml-2 p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Copy code"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="mt-4 flex justify-between">
                      {savedCoupons.includes(offer.id) ? (
                        <button 
                          onClick={() => handleRemoveCoupon(offer.id)}
                          className="text-sm text-red-500 flex items-center hover:text-red-600 transition-colors"
                        >
                          <X size={16} className="mr-1" />
                          Remove
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleSaveCoupon(offer.id)}
                          className="text-sm text-gray-600 flex items-center hover:text-orange-500 transition-colors"
                        >
                          <Scissors size={16} className="mr-1" />
                          Save
                        </button>
                      )}
                      
                      <button 
                        onClick={() => setSelectedOffer(offer)}
                        className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
                      >
                        View Details
                      </button>
                      
                      <button 
                        onClick={() => handleApplyCoupon(offer.id)}
                        className={`text-sm ${
                          activeCoupon === offer.id 
                            ? 'text-green-500 hover:text-green-600' 
                            : 'text-orange-500 hover:text-orange-600'
                        } font-medium transition-colors`}
                      >
                        {activeCoupon === offer.id ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      
      {/* Terms and Conditions Modal */}
      <AnimatePresence>
        {selectedOffer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOffer(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-xl max-w-md w-full shadow-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className={`bg-gradient-to-r ${selectedOffer.bgColor} p-4 text-white`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">{selectedOffer.title}</h3>
                  <button onClick={() => setSelectedOffer(null)} className="text-white">
                    <X size={20} />
                  </button>
                </div>
                <div className="text-2xl font-bold mt-2">{selectedOffer.discount}</div>
                <p className="text-sm text-white text-opacity-90">Code: {selectedOffer.code}</p>
              </div>
              
              {/* Modal body */}
              <div className="p-5">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">DESCRIPTION</h4>
                  <p className="text-gray-800">{selectedOffer.description}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">VALID TILL</h4>
                  <div className="flex items-center text-gray-800">
                    <Clock size={16} className="mr-2 text-gray-500" />
                    {selectedOffer.validity}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">TERMS & CONDITIONS</h4>
                  <ul className="space-y-2">
                    {selectedOffer.terms.map((term, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">•</span>
                        <span className="text-gray-700 text-sm">{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex justify-between mt-6">
                  <button 
                    onClick={() => {
                      handleCopyCode(selectedOffer.code);
                      setSelectedOffer(null);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <Copy size={16} className="mr-2" />
                    Copy Code
                  </button>
                  
                  <button 
                    onClick={() => {
                      handleApplyCoupon(selectedOffer.id);
                      setSelectedOffer(null);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-md hover:from-orange-600 hover:to-pink-600 transition-colors"
                  >
                    Apply Coupon
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OffersPage; 