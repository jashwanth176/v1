package com.foodiehub.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "restaurants")
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ElementCollection
    @CollectionTable(name = "restaurant_cuisines", joinColumns = @JoinColumn(name = "restaurant_id"))
    @Column(name = "cuisine")
    private List<String> cuisine;

    @Column(name = "price_range", nullable = false)
    private String priceRange;

    @Column(nullable = false)
    private Double rating;

    @Column(name = "review_count")
    private Integer reviewCount;

    @Column(name = "delivery_time", nullable = false)
    private String deliveryTime;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    private String address;

    @Column(name = "price_for_two")
    private Integer priceForTwo;

    @Column(name = "is_veg")
    private Boolean isVeg;

    @Column(name = "is_open")
    private Boolean isOpen;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL)
    private List<MenuItem> menuItems;
} 