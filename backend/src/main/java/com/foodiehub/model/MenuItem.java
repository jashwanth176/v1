package com.foodiehub.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "menu_items")
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_veg")
    private Boolean isVeg;

    @Column(name = "is_available")
    private Boolean isAvailable;

    @ManyToOne
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @ElementCollection
    @CollectionTable(name = "menu_item_tags", joinColumns = @JoinColumn(name = "menu_item_id"))
    @Column(name = "tag")
    private List<String> tags;
} 