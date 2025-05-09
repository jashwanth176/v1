import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Search, User, MapPin, Truck, Store, ArrowRight, Star, Utensils, Coffee, Pizza, Salad, IceCream, Beef } from 'lucide-react';
import LoginPage from './LoginPage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SiteHeader = () => {
  const handleLogout = () => {
    localStorage.removeItem('userName');
    toast.success('Logged out successfully!');
    window.location.reload(); // Refresh to update UI
  };

  const userName = localStorage.getItem('userName');

  return (
    <header className="fixed top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-gray-200/20">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 text-transparent bg-clip-text">
            FoodieHub
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link to="/" className="hover:text-orange-600 transition-colors">Home</Link>
          <Link to="#" className="hover:text-orange-600 transition-colors">Restaurants</Link>
          <Link to="#" className="hover:text-orange-600 transition-colors">Categories</Link>
          <Link to="#" className="hover:text-orange-600 transition-colors">Offers</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search for food..."
              className="w-[300px] pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:border-orange-500 transition-colors"
            />
          </div>
          {userName ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hello, {userName.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2 rounded-full flex items-center"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2 rounded-full flex items-center">
              <User className="mr-2 h-4 w-4" />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

const HeroSection = () => {
  const [deliveryType, setDeliveryType] = React.useState('delivery');
  const userName = localStorage.getItem('userName');
  // New state for the pizza rotation angle, in degrees
  const [pizzaRotation, setPizzaRotation] = React.useState(0);
  // Ref for the pizza container (we'll attach the rotation here)
  const pizzaRef = React.useRef(null);

  React.useEffect(() => {
    if (userName) {
      toast.success(`Welcome back, ${userName}! 😊`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [userName]); // Runs once when component mounts

  // Global mouse move handler attached to the window to get the cursor position everywhere (including over the header)
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (pizzaRef.current) {
        const rect = pizzaRef.current.getBoundingClientRect();
        // Calculate the center of the pizza element
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        // Calculate the angle between the mouse pointer and the center (in degrees)
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        setPizzaRotation(angle);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup the listener when the component unmounts
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="parallax absolute inset-0" 
           style={{ backgroundImage: "url('/hero-bg.jpg')", transform: 'translateZ(0)' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/70 via-orange-400/60 to-yellow-300/50" />
      
      <div className="container mx-auto relative z-10 pt-32 pb-32 px-4">
        <div className="max-w-2xl backdrop-blur-sm bg-white/10 p-8 rounded-2xl">
          <h2 className="text-7xl font-bold mb-6 leading-tight text-white">
            {userName ? (
              <span className="block">
                Welcome, {userName.split(' ')[0]}!
              </span>
            ) : (
              <>
                <span className="block">Discover</span>
                <span className="block">Local Flavors</span>
              </>
            )}
          </h2>
          <p className="text-xl mb-12 text-white/90 leading-relaxed">
            Experience the finest local cuisines delivered right to your doorstep.
            Start your culinary journey today.
          </p>

          <div className="backdrop-blur-md bg-white/80 rounded-2xl p-4 shadow-xl max-w-xl border border-white/20">
            <div className="flex gap-2 mb-6">
              {['delivery', 'pickup'].map((type) => (
                <button
                  key={type}
                  onClick={() => setDeliveryType(type)}
                  className={`flex-1 rounded-full text-lg py-2 px-4 flex items-center justify-center ${
                    deliveryType === type
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                      : 'bg-transparent text-gray-700'
                  }`}
                >
                  {type === 'delivery' ? (
                    <Truck className="mr-2 h-5 w-5" />
                  ) : (
                    <Store className="mr-2 h-5 w-5" />
                  )}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your delivery address"
                  className="w-full pl-12 pr-4 py-3 rounded-full text-lg border border-gray-200"
                />
              </div>
              <button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full px-8 py-3 text-lg flex items-center">
                Find Food
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pizza container: rotates based on the mouse pointer */}
      <div
        className="absolute right-0 top-1/2 hidden lg:block"
        ref={pizzaRef}
        style={{ transform: `translateY(-50%) rotate(${pizzaRotation}deg)`, transformOrigin: 'center' }}
      >
        <img
          src="/pizza.png"
          alt="Delicious pizza"
          className="w-[700px] h-[700px] object-cover rounded-full shadow-2xl"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};

const CategoriesSection = () => {
    const categories = [
        { icon: Pizza, name: "Pizza", count: "" },
        { icon: Salad, name: "Healthy", count: "" },
        { icon: Coffee, name: "Breakfast", count: "" },
        { icon: IceCream, name: "Desserts", count: "" },
        { icon: Beef, name: "Meat", count: "" },
        { icon: Utensils, name: "More", count: "" }
      ];
    

      return (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Popular Categories</h2>
            <p className="text-gray-600 text-center mb-12">
              Explore restaurants by your favorite cuisine type
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="group relative overflow-hidden rounded-2xl bg-white p-6 text-center shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <category.icon className="mx-auto h-12 w-12 text-orange-500 mb-4" />
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
};

const FoodGrid = () => {
    const foods = [
        {
          id: 1,
          image: "/food.jpg",
          title: "Spicy Ramen Bowl",
          restaurant: "Noodle House",
          rating: 4.8,
          reviews: 234,
          price: "200₹",
          time: "20-30 min",


          tags: ["Japanese", "Spicy", "Popular"]

        },
        {
          id: 2,  
          image: "/food.jpg",


          title: "Mediterranean Pasta",
          restaurant: "Bella Italia",
          rating: 4.6,
          reviews: 189,
          price: "250₹",


          time: "25-35 min",
          tags: ["Italian", "Vegetarian"]
        },
        {
          id: 3,
          image: "/food.jpg",


          title: "Fresh Garden Bowl",
          restaurant: "Green Eats",
          rating: 4.9,
          reviews: 156,
          price: "300₹",


          time: "15-25 min",
          tags: ["Healthy", "Vegan"]
        },
        {
          id: 4,
          image: "/food.jpg",

          title: "Spicy Thai Curry",
          restaurant: "Thai Flavors",
          rating: 4.7,
          reviews: 203,
          price: "300₹",

          time: "30-40 min",
          tags: ["Thai", "Spicy"]
        }
      ];
    
      return (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Trending Now</h2>
            <p className="text-gray-600 mb-12">Our most popular and highly rated dishes</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {foods.map((food) => (
                <div
                  key={food.id}
                  className="group rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={food.image || "/placeholder.svg"}
                      alt={food.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="flex gap-2">
                        {food.tags.map((tag) => (
                          <span key={tag} className="bg-white/90 text-gray-800 text-xs px-2 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{food.title}</h3>
                        <p className="text-gray-600 text-sm">{food.restaurant}</p>
                      </div>
                      <div className="flex items-center bg-orange-50 px-2 py-1 rounded-lg">
                        <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
                        <span className="ml-1 text-sm font-medium">{food.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-gray-600 text-sm">{food.time}</div>
                      <div className="text-lg font-semibold text-orange-600">{food.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
};

const HomePage = () => (
  <div className="min-h-screen bg-white">
    <SiteHeader />
    <main>
      <HeroSection />
      <CategoriesSection />
      <FoodGrid />
    </main>
    <ToastContainer />
  </div>
);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;