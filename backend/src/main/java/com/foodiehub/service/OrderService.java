package com.foodiehub.service;

import com.foodiehub.model.Order;
import com.foodiehub.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }
    
    public List<Order> getOrdersByUserName(String userName) {
        return orderRepository.findByUserName(userName);
    }
    
    public List<Order> getOrdersByUserEmail(String userEmail) {
        return orderRepository.findByUserEmail(userEmail);
    }
    
    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }
    
    public List<Order> getOrdersByMenuItem(Long menuItemId) {
        return orderRepository.findByMenuItemId(menuItemId);
    }
    
    public Order createOrder(Order order) {
        return orderRepository.save(order);
    }
    
    public Optional<Order> updateOrder(Long id, Order orderDetails) {
        return orderRepository.findById(id).map(order -> {
            // Update only non-null fields from orderDetails to order
            if (orderDetails.getUserName() != null) order.setUserName(orderDetails.getUserName());
            if (orderDetails.getUserEmail() != null) order.setUserEmail(orderDetails.getUserEmail());
            if (orderDetails.getPrice() != null) order.setPrice(orderDetails.getPrice());
            if (orderDetails.getAddress() != null) order.setAddress(orderDetails.getAddress());
            if (orderDetails.getPhoneNumber() != null) order.setPhoneNumber(orderDetails.getPhoneNumber());
            if (orderDetails.getStatus() != null) order.setStatus(orderDetails.getStatus());
            if (orderDetails.getDeliveryNotes() != null) order.setDeliveryNotes(orderDetails.getDeliveryNotes());
            if (orderDetails.getPaymentMethod() != null) order.setPaymentMethod(orderDetails.getPaymentMethod());
            if (orderDetails.getPaymentStatus() != null) order.setPaymentStatus(orderDetails.getPaymentStatus());
            
            return orderRepository.save(order);
        });
    }
    
    public boolean deleteOrder(Long id) {
        return orderRepository.findById(id).map(order -> {
            orderRepository.delete(order);
            return true;
        }).orElse(false);
    }
    
    public Order updateOrderStatus(Long id, String status) {
        Optional<Order> orderOpt = orderRepository.findById(id);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(status);
            return orderRepository.save(order);
        }
        return null;
    }
} 