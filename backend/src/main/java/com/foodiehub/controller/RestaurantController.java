package com.foodiehub.controller;

import com.foodiehub.model.Restaurant;
import com.foodiehub.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
public class RestaurantController {
    
    @Autowired
    private RestaurantService restaurantService;
    
    @GetMapping
    public List<Restaurant> getAllRestaurants() {
        return restaurantService.getAllRestaurants();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Long id) {
        return restaurantService.getRestaurantById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/cuisine/{cuisine}")
    public List<Restaurant> getRestaurantsByCuisine(@PathVariable String cuisine) {
        return restaurantService.getRestaurantsByCuisine(cuisine);
    }
    
    @GetMapping("/price-range/{priceRange}")
    public List<Restaurant> getRestaurantsByPriceRange(@PathVariable String priceRange) {
        return restaurantService.getRestaurantsByPriceRange(priceRange);
    }
    
    @GetMapping("/rating/{rating}")
    public List<Restaurant> getRestaurantsByRating(@PathVariable Double rating) {
        return restaurantService.getRestaurantsByRating(rating);
    }
    
    @GetMapping("/veg")
    public List<Restaurant> getVegRestaurants() {
        return restaurantService.getVegRestaurants();
    }
    
    @GetMapping("/open")
    public List<Restaurant> getOpenRestaurants() {
        return restaurantService.getOpenRestaurants();
    }
    
    @PostMapping
    public Restaurant createRestaurant(@RequestBody Restaurant restaurant) {
        return restaurantService.saveRestaurant(restaurant);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable Long id, @RequestBody Restaurant restaurant) {
        return restaurantService.getRestaurantById(id)
                .map(existingRestaurant -> {
                    restaurant.setId(id);
                    return ResponseEntity.ok(restaurantService.saveRestaurant(restaurant));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
        return restaurantService.getRestaurantById(id)
                .map(restaurant -> {
                    restaurantService.deleteRestaurant(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 