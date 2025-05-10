package com.foodiehub.repository;

import com.foodiehub.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByCuisineContaining(String cuisine);
    List<Restaurant> findByPriceRange(String priceRange);
    List<Restaurant> findByRatingGreaterThanEqual(Double rating);
    List<Restaurant> findByIsVeg(Boolean isVeg);
    List<Restaurant> findByIsOpen(Boolean isOpen);
} 