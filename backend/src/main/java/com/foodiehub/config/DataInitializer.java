package com.foodiehub.config;

import com.foodiehub.model.MenuItem;
import com.foodiehub.model.Restaurant;
import com.foodiehub.repository.MenuItemRepository;
import com.foodiehub.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    private volatile boolean initialized = false;
    
    @PostConstruct
    public void init() {
        // Initialize data directly in @PostConstruct to ensure it runs
        try {
            if (!initialized) {
                logger.info("Starting data initialization from @PostConstruct...");
                initializeData();
                initialized = true;
                logger.info("Data initialization from @PostConstruct completed successfully!");
            } else {
                logger.info("Data already initialized. Skipping @PostConstruct initialization.");
            }
        } catch (Exception e) {
            logger.error("Error initializing data from @PostConstruct: {}", e.getMessage(), e);
        }
    }

    @Bean
    public CommandLineRunner loadData() {
        return args -> {
            try {
                if (!initialized) {
                    logger.info("Starting data initialization from CommandLineRunner...");
                    initializeData();
                    initialized = true;
                    logger.info("Data initialization from CommandLineRunner completed successfully!");
                } else {
                    logger.info("Data already initialized. Skipping CommandLineRunner initialization.");
                }
            } catch (Exception e) {
                logger.error("Error initializing data from CommandLineRunner: {}", e.getMessage(), e);
            }
        };
    }

    @Transactional
    public void initializeData() {
        // Check if we already have data
        if (restaurantRepository.count() == 0) {
            logger.info("No restaurants found. Creating sample data...");
            
            // Create a test restaurant
            Restaurant spiceGarden = new Restaurant();
            spiceGarden.setName("Spice Garden");
            spiceGarden.setCuisine(Arrays.asList("Indian", "Vegetarian"));
            spiceGarden.setPriceRange("Moderate");
            spiceGarden.setRating(4.5);
            spiceGarden.setReviewCount(120);
            spiceGarden.setDeliveryTime("25-35 min");
            spiceGarden.setImageUrl("https://example.com/spice-garden.jpg");
            spiceGarden.setAddress("123 Main St, City, State");
            spiceGarden.setPriceForTwo(800);
            spiceGarden.setIsVeg(true);
            spiceGarden.setIsOpen(true);
            
            Restaurant savedRestaurant = restaurantRepository.save(spiceGarden);
            logger.info("Restaurant saved with ID: {}", savedRestaurant.getId());
            
            // Create some menu items
            MenuItem paneerTikka = new MenuItem();
            paneerTikka.setName("Paneer Tikka");
            paneerTikka.setDescription("Marinated cottage cheese grilled to perfection");
            paneerTikka.setPrice(250.0);
            paneerTikka.setImageUrl("https://example.com/paneer-tikka.jpg");
            paneerTikka.setIsVeg(true);
            paneerTikka.setIsAvailable(true);
            paneerTikka.setRestaurant(savedRestaurant);
            paneerTikka.setTags(Arrays.asList("Popular", "Starter"));
            
            MenuItem butterNaan = new MenuItem();
            butterNaan.setName("Butter Naan");
            butterNaan.setDescription("Soft bread baked in tandoor with butter");
            butterNaan.setPrice(50.0);
            butterNaan.setImageUrl("https://example.com/butter-naan.jpg");
            butterNaan.setIsVeg(true);
            butterNaan.setIsAvailable(true);
            butterNaan.setRestaurant(savedRestaurant);
            butterNaan.setTags(Arrays.asList("Bread", "Essential"));
            
            MenuItem palakPaneer = new MenuItem();
            palakPaneer.setName("Palak Paneer");
            palakPaneer.setDescription("Cottage cheese in spinach gravy");
            palakPaneer.setPrice(200.0);
            palakPaneer.setImageUrl("https://example.com/palak-paneer.jpg");
            palakPaneer.setIsVeg(true);
            palakPaneer.setIsAvailable(true);
            palakPaneer.setRestaurant(savedRestaurant);
            palakPaneer.setTags(Arrays.asList("Main Course", "Healthy"));
            
            List<MenuItem> menuItems = Arrays.asList(paneerTikka, butterNaan, palakPaneer);
            List<MenuItem> savedItems = menuItemRepository.saveAll(menuItems);
            
            for (MenuItem item : savedItems) {
                logger.info("Menu item saved: ID={}, Name={}", item.getId(), item.getName());
            }
            
            logger.info("Sample data initialized successfully!");
        } else {
            logger.info("Data already exists. Skipping initialization.");
        }
    }
} 