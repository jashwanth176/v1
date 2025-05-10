package com.foodiehub.repository;

import com.foodiehub.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurantId(Long restaurantId);
    List<MenuItem> findByRestaurantIdAndIsAvailable(Long restaurantId, Boolean isAvailable);
    List<MenuItem> findByRestaurantIdAndIsVeg(Long restaurantId, Boolean isVeg);
    List<MenuItem> findByRestaurantIdAndTagsContaining(Long restaurantId, String tag);
} 