import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MessageSquare, Send, X, Filter, Star, DollarSign, Utensils } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ChatbotPopup = ({ restaurants }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBackdropVisible, setIsBackdropVisible] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFilterBackdropVisible, setIsFilterBackdropVisible] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: '',
    cuisine: '',
    rating: '',
  });
  const messagesEndRef = useRef(null);
  
  // Get user information from localStorage
  const userName = localStorage.getItem('userName') || 'Guest';
  const savedAddress = localStorage.getItem('selectedAddress') || 'No address saved';

  // Helper function to convert markdown-style bold text to HTML
  const formatMessageWithBold = (text) => {
    // Escape any HTML to prevent XSS
    const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Replace **text** with <strong>text</strong>
    return escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  useEffect(() => {
    // Scroll to bottom of chat when messages update
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle animations with proper timing
  useEffect(() => {
    if (isOpen) {
      // Show backdrop immediately when opening
      setIsBackdropVisible(true);
    } else {
      // Delay hiding backdrop to allow chat window to animate out
      const timer = setTimeout(() => {
        setIsBackdropVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle filter backdrop animations
  useEffect(() => {
    if (isFilterOpen) {
      // Show backdrop immediately when opening
      setIsFilterBackdropVisible(true);
    } else {
      // Delay hiding backdrop to allow filter panel to animate out
      const timer = setTimeout(() => {
        setIsFilterBackdropVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isFilterOpen]);

  const toggleChat = () => {
    if (!isOpen && messages.length === 0) {
      // Send welcome message when first opening chat
      setMessages([
        {
          role: 'assistant',
          content: `Hi ${userName}! I can recommend restaurants based on your preferences. What kind of food are you in the mood for today?`
        }
      ]);
    }
    setIsOpen(!isOpen);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const applyFilters = () => {
    const filterMessage = `I'm looking for restaurants ${filters.cuisine ? `with ${filters.cuisine} cuisine` : ''} ${filters.priceRange ? `in the ${filters.priceRange} price range` : ''} ${filters.rating ? `with at least ${filters.rating} star rating` : ''}`.trim();
    
    if (filterMessage !== "I'm looking for restaurants") {
      setInputMessage(filterMessage);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message to chat with animation class
    const userMessage = { role: 'user', content: inputMessage, isNew: true };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Remove 'isNew' flag after animation completes
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg === userMessage ? { ...msg, isNew: false } : msg
        )
      );
    }, 500);

    try {
      // First log the entire restaurants array structure
      console.log('Full restaurants array:', restaurants);
      
      // Check the first restaurant to understand the structure
      if (restaurants && restaurants.length > 0) {
        console.log('First restaurant complete structure:', JSON.stringify(restaurants[0], null, 2));
        console.log('First restaurant keys:', Object.keys(restaurants[0]));
      }

      // Format restaurant data to send to Gemini
      const restaurantOptions = restaurants.map(r => {
        // Define an array of common cuisines
        const cuisines = [
          'Indian', 
          'Chinese', 
          'North Indian',
          'South Indian',
          'Breakfast'
        ];
        
        // Assign a random cuisine from the array
        const randomCuisine = cuisines[Math.floor(Math.random() * cuisines.length)];
        
        return {
          id: r.id,
          name: r.name, 
          cuisine: randomCuisine, // Use random cuisine instead
          priceLevel: r.priceForTwo ? `₹${r.priceForTwo} for two` : 'Unknown',
          rating: r.rating || 'Not rated',
          distance: r.distance || 'Unknown',
          deliveryTime: r.timeEstimate || 'Unknown'
        };
      });

      console.log('Sending restaurant options to Gemini:', restaurantOptions);
      
      // Initialize the Gemini API client
      const apiKey = 'AIzaSyBupL0wRBvGL2TPsRZ2RTSwecRF1hq4tBc';
      const ai = new GoogleGenAI({ apiKey });
      
      // Create system prompt with context
      const systemPrompt = `You are a helpful restaurant recommendation assistant. Your job is to recommend a restaurant based on user preferences in short, use emojis. 
      Here is some information about the user:
      - Username: ${userName}
      - User's address: ${savedAddress}
      
      Here is the list of all available restaurants: ${JSON.stringify(restaurantOptions)}
      
      CRUCIAL: The cuisine type is a critical factor in recommendations. 
      You MUST ALWAYS mention the cuisine type of any restaurant you recommend using this format:
      "I recommend **Restaurant Name** which serves **Cuisine Type** cuisine."
      
      If a user asks for a specific type of cuisine, prioritize restaurants matching that cuisine type.
      
      Be friendly, conversational and helpful. If no restaurant matches their specific criteria, suggest alternatives.
      Keep responses concise and engaging, Keep it short and sweet. If the conversation is not related to restaurants, say "I'm sorry, I can only help with restaurant recommendations."`;
      
      // Construct conversation history
      let chatHistory = [];
      
      // Add previous messages to history
      for (const message of messages) {
        chatHistory.push({
          role: message.role,
          parts: [{ text: message.content }]
        });
      }
      
      // Add current message
      chatHistory.push({
        role: 'user',
        parts: [{ text: inputMessage }]
      });
      
      // Generate response
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...chatHistory
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      });
      
      // Get response text (handle different response structures)
      let responseText = '';
      if (response && response.text) {
        responseText = response.text;
      } else if (response && response.candidates && response.candidates[0] && response.candidates[0].content) {
        responseText = response.candidates[0].content.parts[0].text;
      } else if (response && response.response && response.response.text) {
        responseText = response.response.text;
      } else {
        console.log('Response structure:', response);
        responseText = 'I received your message, but had trouble formatting my response.';
      }
      
      // Add the response to chat with animation flag
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: responseText,
        isNew: true
      }]);

      // Remove 'isNew' flag after animation completes
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.role === 'assistant' && msg.isNew ? { ...msg, isNew: false } : msg
          )
        );
      }, 500);
    } catch (error) {
      console.error('Error with Gemini API:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I had trouble processing your request. Please try again later.',
        isNew: true
      }]);

      // Remove 'isNew' flag after animation completes
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.role === 'assistant' && msg.isNew ? { ...msg, isNew: false } : msg
          )
        );
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Blurred backdrop for chat */}
      {isBackdropVisible && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 transition-opacity duration-300 ease-in-out"
          style={{ opacity: isOpen ? 1 : 0 }}
          onClick={toggleChat}
        />
      )}

      {/* Blurred backdrop for filter sidebar */}
      {isFilterBackdropVisible && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300 ease-in-out"
          style={{ opacity: isFilterOpen ? 1 : 0 }}
          onClick={toggleFilter}
        />
      )}

      {/* Filter button */}
      <button
        onClick={toggleFilter}
        className="fixed bottom-6 left-6 bg-orange-500 text-white rounded-full p-4 
          shadow-xl hover:shadow-2xl hover:shadow-orange-300/50
          transition-all duration-300 ease-in-out z-30 
          hover:scale-110 active:scale-90
          animate-float hover:animate-none"
        aria-label="Filter restaurants"
      >
        <Filter size={24} className="animate-pulse-subtle" />
      </button>

      {/* Filter sidebar */}
      <div 
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isFilterOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 bg-orange-500 text-white flex justify-between items-center">
          <h3 className="font-medium flex items-center gap-2">
            <Filter size={18} />
            Filters
          </h3>
          <button 
            onClick={toggleFilter}
            className="text-white hover:bg-orange-600 rounded-full p-1 transition-colors"
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-6">
          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="font-medium flex items-center gap-2 text-gray-700">
              <DollarSign size={18} /> 
              Price Range
            </label>
            <select 
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            >
              <option value="">Any Price</option>
              <option value="budget">Budget (₹0-₹300)</option>
              <option value="mid-range">Mid-range (₹300-₹600)</option>
              <option value="high-end">High-end (₹600+)</option>
            </select>
          </div>

          {/* Cuisine Filter */}
          <div className="space-y-2">
            <label className="font-medium flex items-center gap-2 text-gray-700">
              <Utensils size={18} />
              Cuisine
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={filters.cuisine}
              onChange={(e) => handleFilterChange('cuisine', e.target.value)}
            >
              <option value="">Any Cuisine</option>
              <option value="Indian">Indian</option>
              <option value="Chinese">Chinese</option>
              <option value="North Indian">North Indian</option>
              <option value="South Indian">South Indian</option>
              <option value="Breakfast">Breakfast</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="font-medium flex items-center gap-2 text-gray-700">
              <Star size={18} />
              Rating
            </label>
            <select
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
            >
              <option value="">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          <button
            className="w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-600 transition-colors mt-4 font-medium shadow-md"
            onClick={() => {
              applyFilters();
              if (inputMessage) {
                setIsFilterOpen(false);
                setIsOpen(true);
              }
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Chat bubble button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-orange-500 text-white rounded-full p-4 
          shadow-xl hover:shadow-2xl hover:shadow-orange-300/50
          transition-all duration-300 ease-in-out z-30 
          hover:scale-110 active:scale-90
          animate-float hover:animate-none"
        aria-label="Chat with AI assistant"
      >
        <MessageSquare size={24} className="animate-pulse-subtle" />
      </button>

      {/* Chat popup window */}
      <div 
        className={`fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col z-30 max-h-[70vh] overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-12 pointer-events-none'
        }`}
      >
        {/* Chat header */}
        <div className="bg-orange-500 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MessageSquare size={20} />
            <h3 className="font-medium">Restaurant Advisor</h3>
          </div>
          <button 
            onClick={toggleChat}
            className="text-white hover:bg-orange-600 rounded-full p-1 transition-colors"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 min-h-[300px] max-h-[50vh]">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`mb-3 ${message.role === 'user' ? 'text-right' : ''} ${
                message.isNew 
                  ? message.role === 'user' 
                    ? 'animate-slideInRight' 
                    : 'animate-slideInLeft'
                  : ''
              }`}
            >
              <div 
                className={`inline-block p-3 rounded-lg max-w-[85%] ${
                  message.role === 'user' 
                    ? 'bg-orange-100 text-gray-800 rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                }`}
                dangerouslySetInnerHTML={{ __html: formatMessageWithBold(message.content) }}
              >
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="mb-3 animate-fadeIn">
              <div className="inline-block p-3 rounded-lg max-w-[85%] bg-white border border-gray-200 rounded-bl-none shadow-sm">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-3 flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about restaurants..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="ml-2 bg-orange-500 text-white rounded-full p-2 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
            disabled={!inputMessage.trim() || isLoading}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
};

ChatbotPopup.propTypes = {
  restaurants: PropTypes.array.isRequired
};

// Define the necessary CSS animations
const animationStyles = document.createElement('style');
animationStyles.innerHTML = `
  @keyframes slideInRight {
    from { transform: translateX(20%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideInLeft {
    from { transform: translateX(-20%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
    100% { transform: translateY(0px); }
  }
  
  @keyframes pulse-subtle {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .animate-slideInRight {
    animation: slideInRight 0.3s ease-out forwards;
  }
  
  .animate-slideInLeft {
    animation: slideInLeft 0.3s ease-out forwards;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-pulse-subtle {
    animation: pulse-subtle 2s ease-in-out infinite;
  }
`;
document.head.appendChild(animationStyles);

export default ChatbotPopup; 