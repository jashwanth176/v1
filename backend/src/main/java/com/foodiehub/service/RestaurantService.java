package com.foodiehub.service;

import com.foodiehub.model.Restaurant;
import com.foodiehub.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RestaurantService {
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }
    
    public Optional<Restaurant> getRestaurantById(Long id) {
        return restaurantRepository.findById(id);
    }
    
    public List<Restaurant> getRestaurantsByCuisine(String cuisine) {
        return restaurantRepository.findByCuisineContaining(cuisine);
    }
    
    public List<Restaurant> getRestaurantsByPriceRange(String priceRange) {
        return restaurantRepository.findByPriceRange(priceRange);
    }
    
    public List<Restaurant> getRestaurantsByRating(Double rating) {
        return restaurantRepository.findByRatingGreaterThanEqual(rating);
    }
    
    public List<Restaurant> getVegRestaurants() {
        return restaurantRepository.findByIsVeg(true);
    }
    
    public List<Restaurant> getOpenRestaurants() {
        return restaurantRepository.findByIsOpen(true);
    }
    
    public Restaurant saveRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }
    
    public void deleteRestaurant(Long id) {
        restaurantRepository.deleteById(id);
    }
} 