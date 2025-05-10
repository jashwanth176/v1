# Base URL
$BASE_URL = "http://localhost:8080/api"

Write-Host "=== Order Creation Debug Script ===" -ForegroundColor Cyan

# Step 1: Initialize sample data
Write-Host "1. Initializing sample data..." -ForegroundColor Green
try {
    $result = Invoke-RestMethod -Method Post -Uri "$BASE_URL/data/initialize" -ContentType "application/json"
    Write-Host "Data initialization successful" -ForegroundColor Green
} catch {
    Write-Host "Error initializing data: $_" -ForegroundColor Red
    # Continue despite error
}

# Step 2: Verify menu items exist
Write-Host "`n2. Verifying menu items exist..." -ForegroundColor Green
try {
    $menuItems = Invoke-RestMethod -Method Get -Uri "$BASE_URL/menu-items"
    
    if ($menuItems -and $menuItems.Count -gt 0) {
        Write-Host "Found $($menuItems.Count) menu items" -ForegroundColor Green
        $menuItemId = $menuItems[0].id
        Write-Host "Will use menu item with ID: $menuItemId" -ForegroundColor Green
        Write-Host "Menu item details: $($menuItems[0] | ConvertTo-Json -Depth 3)" -ForegroundColor Yellow
    } else {
        Write-Host "No menu items found. Will need to create one." -ForegroundColor Yellow
        $menuItemId = $null
    }
} catch {
    Write-Host "Error getting menu items: $_" -ForegroundColor Red
    $menuItemId = $null
}

# Step 3: Create a menu item if none found
if (-not $menuItemId) {
    Write-Host "`n3. Creating a menu item..." -ForegroundColor Green
    
    # First get a restaurant
    try {
        $restaurants = Invoke-RestMethod -Method Get -Uri "$BASE_URL/restaurants"
        if ($restaurants -and $restaurants.Count -gt 0) {
            $restaurantId = $restaurants[0].id
            Write-Host "Using restaurant with ID: $restaurantId" -ForegroundColor Green
        } else {
            Write-Host "No restaurants found. Creating one..." -ForegroundColor Yellow
            
            $newRestaurant = @{
                name = "Debug Restaurant"
                cuisine = @("Debug", "Test")
                priceRange = "Moderate"
                rating = 4.0
                reviewCount = 10
                deliveryTime = "30 min"
                imageUrl = "https://example.com/debug.jpg"
                address = "123 Debug St"
                priceForTwo = 500
                isVeg = $true
                isOpen = $true
            }
            
            $restaurantJson = $newRestaurant | ConvertTo-Json
            $createdRestaurant = Invoke-RestMethod -Method Post -Uri "$BASE_URL/restaurants" -Body $restaurantJson -ContentType "application/json"
            $restaurantId = $createdRestaurant.id
            Write-Host "Created restaurant with ID: $restaurantId" -ForegroundColor Green
        }
        
        # Now create a menu item
        $newMenuItem = @{
            name = "Debug Dish"
            description = "A dish for debugging"
            price = 199.99
            isVeg = $true
            isAvailable = $true
            restaurant = @{id = $restaurantId}
        }
        
        $menuItemJson = $newMenuItem | ConvertTo-Json
        $createdMenuItem = Invoke-RestMethod -Method Post -Uri "$BASE_URL/menu-items" -Body $menuItemJson -ContentType "application/json"
        $menuItemId = $createdMenuItem.id
        Write-Host "Created menu item with ID: $menuItemId" -ForegroundColor Green
    } catch {
        Write-Host "Error creating menu item: $_" -ForegroundColor Red
        exit
    }
}

# Step 4: Create an order with the menu item
Write-Host "`n4. Creating an order with menu item ID: $menuItemId" -ForegroundColor Green

$order = @{
    menuItem = @{id = $menuItemId}
    userName = "Debug User"
    userEmail = "debug@example.com"
    price = 199.99
    address = "456 Debug Ave"
    phoneNumber = "555-DEBUG"
    paymentMethod = "Credit Card"
    deliveryNotes = "Debug notes"
}

$orderJson = $order | ConvertTo-Json
Write-Host "Order JSON to be sent:" -ForegroundColor Yellow
Write-Host $orderJson -ForegroundColor Yellow

try {
    # Add a delay to ensure database operations are complete
    Start-Sleep -Seconds 2
    
    $createdOrder = Invoke-RestMethod -Method Post -Uri "$BASE_URL/orders" -Body $orderJson -ContentType "application/json"
    Write-Host "Successfully created order with ID: $($createdOrder.id)" -ForegroundColor Green
    Write-Host "Created order details:" -ForegroundColor Green
    $createdOrder | ConvertTo-Json -Depth 5 | Write-Host
} catch {
    Write-Host "Error creating order: $_" -ForegroundColor Red
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response content: $responseBody" -ForegroundColor Red
    } catch {
        Write-Host "Could not read response: $_" -ForegroundColor Red
    }
}

Write-Host "`nDebug script completed!" -ForegroundColor Cyan 