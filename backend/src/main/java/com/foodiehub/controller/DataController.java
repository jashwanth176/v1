package com.foodiehub.controller;

import com.foodiehub.config.DataInitializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/data")
@CrossOrigin(origins = "*")
public class DataController {
    
    @Autowired
    private DataInitializer dataInitializer;
    
    @PostMapping("/initialize")
    public ResponseEntity<Map<String, String>> initializeData() {
        try {
            dataInitializer.init();
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Data initialization triggered successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to initialize data: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
} 