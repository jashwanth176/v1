package com.foodiehub.service;

import com.foodiehub.model.MenuItem;
import com.foodiehub.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class MenuItemService {
    
    @Autowired
    private MenuItemRepository menuItemRepository;
    
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }
    
    public Optional<MenuItem> getMenuItemById(Long id) {
        return menuItemRepository.findById(id);
    }
    
    public List<MenuItem> getMenuItemsByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId);
    }
    
    public List<MenuItem> getAvailableMenuItemsByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantIdAndIsAvailable(restaurantId, true);
    }
    
    public List<MenuItem> getVegMenuItemsByRestaurant(Long restaurantId) {
        return menuItemRepository.findByRestaurantIdAndIsVeg(restaurantId, true);
    }
    
    public List<MenuItem> getMenuItemsByTag(Long restaurantId, String tag) {
        return menuItemRepository.findByRestaurantIdAndTagsContaining(restaurantId, tag);
    }
    
    public MenuItem saveMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }
    
    public void deleteMenuItem(Long id) {
        menuItemRepository.deleteById(id);
    }
} 