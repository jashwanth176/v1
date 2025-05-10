package com.foodiehub.controller;

import com.foodiehub.model.MenuItem;
import com.foodiehub.service.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
@CrossOrigin(origins = "*")
public class MenuItemController {
    
    @Autowired
    private MenuItemService menuItemService;
    
    @GetMapping
    public List<MenuItem> getAllMenuItems() {
        return menuItemService.getAllMenuItems();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getMenuItemById(@PathVariable Long id) {
        return menuItemService.getMenuItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/restaurant/{restaurantId}")
    public List<MenuItem> getMenuItemsByRestaurant(@PathVariable Long restaurantId) {
        return menuItemService.getMenuItemsByRestaurant(restaurantId);
    }
    
    @GetMapping("/restaurant/{restaurantId}/available")
    public List<MenuItem> getAvailableMenuItemsByRestaurant(@PathVariable Long restaurantId) {
        return menuItemService.getAvailableMenuItemsByRestaurant(restaurantId);
    }
    
    @GetMapping("/restaurant/{restaurantId}/veg")
    public List<MenuItem> getVegMenuItemsByRestaurant(@PathVariable Long restaurantId) {
        return menuItemService.getVegMenuItemsByRestaurant(restaurantId);
    }
    
    @GetMapping("/restaurant/{restaurantId}/tag/{tag}")
    public List<MenuItem> getMenuItemsByTag(@PathVariable Long restaurantId, @PathVariable String tag) {
        return menuItemService.getMenuItemsByTag(restaurantId, tag);
    }
    
    @PostMapping
    public MenuItem createMenuItem(@RequestBody MenuItem menuItem) {
        return menuItemService.saveMenuItem(menuItem);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable Long id, @RequestBody MenuItem menuItem) {
        return menuItemService.getMenuItemById(id)
                .map(existingMenuItem -> {
                    menuItem.setId(id);
                    return ResponseEntity.ok(menuItemService.saveMenuItem(menuItem));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        return menuItemService.getMenuItemById(id)
                .map(menuItem -> {
                    menuItemService.deleteMenuItem(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 