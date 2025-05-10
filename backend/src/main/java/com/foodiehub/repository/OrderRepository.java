package com.foodiehub.repository;

import com.foodiehub.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserName(String userName);
    List<Order> findByUserEmail(String userEmail);
    List<Order> findByStatus(String status);
    List<Order> findByMenuItemId(Long menuItemId);
} 