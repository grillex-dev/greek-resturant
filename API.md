# Greek Restaurant API – Full Documentation

**Base URL:** `http://localhost:5000` (or value of `APP_PORT` in `.env`)

**Authentication:** Protected routes use cookie-based JWT. The server sets an HTTP-only cookie `auth_token` on signin/signup. Send cookies with every request (e.g. `credentials: 'include'` in fetch, or send the `Cookie` header).

**Standard headers for all requests:**

- `Content-Type: application/json` — for any request with a JSON body (POST, PUT, PATCH).

**Standard response shape:**

- Success: `{ "success": true, "data"?: ..., "message"?: ... }`
- Error: `{ "success": false, "message": "..." }`

---

## Table of Contents

1. [Debug](#debug)
2. [Home](#home)
3. [Auth](#auth)
4. [Categories](#categories)
5. [Products](#products)
6. [Cart](#cart)
7. [Orders](#orders)
8. [Tables](#tables)
9. [Users](#users)
10. [Admin – Users](#admin--users)
11. [Customizations](#customizations)
12. [Restaurants](#restaurants)

---

## Debug

### GET `/debug-env`

**Auth:** None  
**Headers:** None required  
**Query:** None  
**Body:** None

**Description:** Returns environment flags (DB URL present, Cloudinary, NODE_ENV, etc.).

**Response:** `200` — JSON with `hasDbUrl`, `hasDirectUrl`, `hasCloudinary`, `cwd`, `nodeEnv`.

---

## Home

### GET `/home`

**Auth:** None  
**Headers:** None required  
**Query:** None  
**Body:** None

**Description:** Simple home/welcome endpoint.

**Response:** `200` — Plain text `"home"`.

---

## Auth

All auth endpoints use **Headers:** `Content-Type: application/json`. No cookie required for signup/signin; signout should be called with the auth cookie if the user is logged in.

### POST `/api/auth/signup`

**Auth:** None  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 characters)"
}
```

**Success:** `201` — `{ "success": true, "message": "User signed up successfully", "user": { "id", "name", "email", "role", "createdAt" } }`. Sets `auth_token` cookie.  
**Errors:** `400` missing/invalid fields or password too short; `409` email already exists.

---

### POST `/api/auth/signin`

**Auth:** None  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success:** `200` — `{ "success": true, "message": "User signed in successfully", "user": { ... } }`. Sets `auth_token` cookie.  
**Errors:** `400` missing fields; `401` invalid email or password.

---

### POST `/api/auth/signout`

**Auth:** None (cookie sent if user is logged in)  
**Headers:** `Content-Type: application/json`  
**Query:** None  
**Body:** None (or empty `{}`).

**Success:** `200` — `{ "success": true, "message": "User signed out successfully" }`. Clears `auth_token` cookie.

---

## Categories

**Protected (Admin) routes require:** Cookie `auth_token` (Admin role).

### GET `/api/categories`

**Auth:** None  
**Headers:** None required  
**Query:**

| Name           | Type   | Required | Description     |
| -------------- | ------ | -------- | --------------- |
| `restaurantId` | string | Yes      | Restaurant UUID |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.  
**Error:** `400` if `restaurantId` missing.

---

### GET `/api/categories/:id`

**Auth:** None  
**Headers:** None required  
**Query:** None  
**Body:** None

**Params:** `id` — Category UUID.

**Success:** `200` — `{ "success": true, "data": { ... } }`.  
**Error:** `404` category not found.

---

### POST `/api/categories`

**Auth:** Admin (cookie)  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

```json
{
  "name": "string (required)",
  "restaurantId": "string (required, UUID)"
}
```

**Success:** `201` — `{ "success": true, "message": "Category created successfully", "data": { ... } }`.  
**Errors:** `400` missing name/restaurantId; `409` category name already exists for restaurant.

---

### PUT `/api/categories/:id`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Params:** `id` — Category UUID.

**Body (required):**

```json
{
  "name": "string (required)"
}
```

**Success:** `200` — `{ "success": true, "message": "Category updated successfully", "data": { ... } }`.  
**Errors:** `400` empty name; `404` not found; `409` name already exists.

---

### DELETE `/api/categories/:id`

**Auth:** Admin  
**Headers:** None required  
**Query:** None  
**Body:** None

**Params:** `id` — Category UUID.

**Success:** `200` — `{ "success": true, "message": "Category deleted successfully" }`.  
**Errors:** `404` not found; `400` category has products.

---

## Products

### GET `/api/products`

**Auth:** None  
**Headers:** None required  
**Query:**

| Name           | Type   | Required | Description                |
| -------------- | ------ | -------- | -------------------------- |
| `restaurantId` | string | Yes      | Restaurant UUID            |
| `categoryId`   | string | No       | Filter by category UUID    |
| `search`       | string | No       | Search in name/description |
| `isActive`     | string | No       | `"true"` or `"false"`      |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.  
**Error:** `400` if `restaurantId` missing.

---

### GET `/api/products/:id`

**Auth:** None  
**Headers:** None required  
**Query:** None  
**Body:** None

**Params:** `id` — Product UUID.

**Success:** `200` — `{ "success": true, "data": { ... } }` (includes category, components, extras).  
**Error:** `404` product not found.

---

### POST `/api/products`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "basePrice": "number or string (required)",
  "imageUrl": "string (optional)",
  "categoryId": "string (required, UUID)",
  "restaurantId": "string (required, UUID)",
  "componentIds": "string[] (optional)",
  "extraIds": "string[] (optional)"
}
```

**Success:** `201` — `{ "success": true, "message": "Product created successfully", "data": { ... } }`.  
**Errors:** `400` missing/invalid fields; `404` category not found.

---

### PUT `/api/products/:id`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Params:** `id` — Product UUID.

**Body (all optional):**

```json
{
  "name": "string",
  "description": "string",
  "basePrice": "number or string",
  "imageUrl": "string",
  "categoryId": "string (UUID)",
  "isActive": "boolean",
  "componentIds": "string[]",
  "extraIds": "string[]"
}
```

**Success:** `200` — `{ "success": true, "message": "Product updated successfully", "data": { ... } }`.  
**Errors:** `400` invalid data; `404` product or category not found.

---

### DELETE `/api/products/:id`

**Auth:** Admin  
**Headers:** None required  
**Query:** None  
**Body:** None

**Params:** `id` — Product UUID.

**Success:** `200` — Product deleted or soft-deactivated (message indicates which).  
**Error:** `404` product not found.

---

### PATCH `/api/products/:id/toggle`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Query:** None  
**Body:** None (or empty `{}`).

**Params:** `id` — Product UUID.

**Success:** `200` — `{ "success": true, "message": "Product activated/deactivated successfully", "data": { ... } }`.  
**Error:** `404` product not found.

---

## Cart

All cart routes require **Auth:** Cookie `auth_token` (any authenticated user).

**Headers:** `Content-Type: application/json` for requests with a body.

### GET `/api/cart`

**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { "items": [ ... ], "totals": { ... } } }`.

---

### GET `/api/cart/totals`

**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { "subtotal", "tax", "totalAmount", ... } }`.

---

### POST `/api/cart`

**Body (required):**

```json
{
  "productId": "string (required, UUID)",
  "quantity": "number (required, >= 1, default 1)",
  "customizations": [
    {
      "type": "EXTRA | REMOVED_COMPONENT",
      "referenceId": "string (extra ID or component ID)"
    }
  ]
}
```

`customizations` is optional; use `EXTRA` for added extras and `REMOVED_COMPONENT` for removed components. `referenceId` must be an extra or component linked to the product.

**Success:** `201` — `{ "success": true, "message": "Item added to cart", "data": { ... } }`.  
**Errors:** `400` invalid input or product unavailable; `404` product not found.

---

### PUT `/api/cart/:id`

**Params:** `id` — Cart item UUID (not product ID).

**Body (required):**

```json
{
  "quantity": "number (required, >= 1)"
}
```

**Success:** `200` — `{ "success": true, "message": "Cart item updated", "data": { ... } }`.  
**Errors:** `400` quantity &lt; 1; `404` cart item not found.

---

### DELETE `/api/cart/:id`

**Params:** `id` — Cart item UUID.  
**Body:** None

**Success:** `200` — `{ "success": true, "message": "..." }`.  
**Error:** `404` cart item not found.

---

### DELETE `/api/cart`

**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "message": "Cart cleared" }`.

---

## Orders

### Customer orders (require auth cookie)

### GET `/api/orders`

**Auth:** Cookie `auth_token`  
**Headers:** None required  
**Query:**

| Name     | Type   | Required | Description      |
| -------- | ------ | -------- | ---------------- |
| `status` | string | No       | Filter by status |
| `limit`  | number | No       | Default 20       |
| `offset` | number | No       | Default 0        |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.

---

### GET `/api/orders/:id`

**Auth:** Cookie `auth_token`  
**Params:** `id` — Order UUID (must belong to current user).  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { ... } }`.  
**Error:** `404` order not found.

---

### POST `/api/orders`

**Auth:** Cookie `auth_token`  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

```json
{
  "restaurantId": "string (required, UUID)",
  "fulfillmentType": "DELIVERY | PICKUP | DINE_IN",
  "fulfillmentDetails": {
    "contactName": "string (optional)",
    "phoneNumber": "string (required for DELIVERY)",
    "street": "string (required for DELIVERY)",
    "building": "string (optional)",
    "state": "string (optional)",
    "locationNote": "string (optional)",
    "pickupTime": "string ISO date (required for PICKUP)",
    "reservationTime": "string ISO date (required for DINE_IN)",
    "tableId": "string UUID (required for DINE_IN)"
  }
}
```

- **DELIVERY:** `street` and `phoneNumber` required.
- **PICKUP:** `pickupTime` required.
- **DINE_IN:** `tableId` and `reservationTime` required.

Cart must not be empty; cart is cleared on success.

**Success:** `201` — `{ "success": true, "message": "Order created successfully", "data": { ... } }`.  
**Errors:** `400` validation (empty cart, missing fulfillment fields, etc.).

---

### Admin order routes (require Admin role + auth cookie)

### GET `/api/orders/admin/all`

**Auth:** Admin  
**Query:**

| Name              | Type   | Required | Description             |
| ----------------- | ------ | -------- | ----------------------- |
| `status`          | string | No       | Filter by status        |
| `fulfillmentType` | string | No       | DELIVERY/PICKUP/DINE_IN |
| `dateFrom`        | string | No       | ISO date                |
| `dateTo`          | string | No       | ISO date                |
| `limit`           | number | No       | Default 50              |
| `offset`          | number | No       | Default 0               |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.

---

### GET `/api/orders/admin/stats`

**Auth:** Admin  
**Query:**

| Name           | Type   | Required | Description     |
| -------------- | ------ | -------- | --------------- |
| `restaurantId` | string | Yes      | Restaurant UUID |

**Body:** None

**Success:** `200` — `{ "success": true, "data": { ... } }`.  
**Error:** `400` if `restaurantId` missing.

---

### GET `/api/orders/admin/:id`

**Auth:** Admin  
**Params:** `id` — Order UUID.  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { ... } }`.  
**Error:** `404` order not found.

---

### PATCH `/api/orders/admin/:id/status`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Params:** `id` — Order UUID.

**Body (required):**

```json
{
  "status": "PENDING | CONFIRMED | PREPARING | READY | OUT_FOR_DELIVERY | COMPLETED | CANCELLED"
}
```

**Success:** `200` — `{ "success": true, "message": "Order status updated to ...", "data": { ... } }`.  
**Errors:** `400` invalid or invalid transition; `404` not found.

---

### POST `/api/orders/admin/:id/confirm`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Params:** `id` — Order UUID.  
**Body:** None (or empty `{}`).

**Success:** `200` — `{ "success": true, "message": "Order confirmed successfully", "data": { ... } }`.  
**Errors:** `400` invalid state transition; `404` not found.

---

### POST `/api/orders/admin/:id/reject`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Params:** `id` — Order UUID.

**Body (optional):**

```json
{
  "reason": "string (optional)"
}
```

**Success:** `200` — `{ "success": true, "message": "Order rejected/cancelled successfully", "data": { ... } }`.  
**Errors:** `400` invalid transition; `404` not found.

---

## Tables

### GET `/api/tables`

**Auth:** None  
**Query:**

| Name           | Type   | Required | Description     |
| -------------- | ------ | -------- | --------------- |
| `restaurantId` | string | Yes      | Restaurant UUID |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.  
**Error:** `400` if `restaurantId` missing.

---

### GET `/api/tables/available`

**Auth:** None  
**Query:**

| Name           | Type   | Required | Description     |
| -------------- | ------ | -------- | --------------- |
| `restaurantId` | string | Yes      | Restaurant UUID |
| `dateTime`     | string | Yes      | ISO date-time   |
| `partySize`    | number | No       | Optional filter |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.  
**Error:** `400` if `restaurantId` or `dateTime` missing.

---

### GET `/api/tables/:id`

**Auth:** None  
**Params:** `id` — Table UUID.  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { ... } }`.  
**Error:** `404` table not found.

---

### GET `/api/tables/:id/availability`

**Auth:** None  
**Params:** `id` — Table UUID.  
**Query:**

| Name       | Type   | Required | Description   |
| ---------- | ------ | -------- | ------------- |
| `dateTime` | string | Yes      | ISO date-time |

**Body:** None

**Success:** `200` — `{ "success": true, "data": { "isAvailable", "tableId", "dateTime" } }`.  
**Errors:** `400` missing `dateTime`; `404` table not found.

---

### POST `/api/tables`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

```json
{
  "tableNumber": "string (required)",
  "capacity": "number (optional)",
  "restaurantId": "string (required, UUID)"
}
```

**Success:** `201` — `{ "success": true, "message": "Table created successfully", "data": { ... } }`.  
**Errors:** `400` missing fields; `409` table number already exists.

---

### PUT `/api/tables/:id`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Params:** `id` — Table UUID.

**Body (optional):**

```json
{
  "tableNumber": "string",
  "capacity": "number"
}
```

**Success:** `200` — `{ "success": true, "message": "Table updated successfully", "data": { ... } }`.  
**Errors:** `400` invalid data or duplicate number; `404` not found.

---

### DELETE `/api/tables/:id`

**Auth:** Admin  
**Params:** `id` — Table UUID.  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "message": "Table deleted successfully" }`.  
**Errors:** `404` not found; `400` table has active orders.

---

## Users

All user routes require **Auth:** Cookie `auth_token`.

### GET `/api/users/profile`

**Headers:** None required  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { "id", "name", "email", "role", "createdAt" } }`.  
**Error:** `404` user not found.

---

### PUT `/api/users/profile`

**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (optional):**

```json
{
  "name": "string",
  "email": "string (valid email, unique)"
}
```

**Success:** `200` — `{ "success": true, "message": "Profile updated successfully", "data": { ... } }`.  
**Errors:** `400` empty name or invalid email; `409` email already in use; `404` user not found.

---

### PUT `/api/users/password`

**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 6 characters)"
}
```

**Success:** `200` — `{ "success": true, "message": "..." }`.  
**Errors:** `400` missing/invalid passwords or current password incorrect; `404` user not found.

---

### GET `/api/users/orders`

**Headers:** None required  
**Query:**

| Name     | Type   | Required | Description |
| -------- | ------ | -------- | ----------- |
| `limit`  | number | No       | Default 20  |
| `offset` | number | No       | Default 0   |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.

---

## Admin – Users

All routes require **Auth:** Cookie `auth_token` with **Admin** role.

### GET `/api/admin/users/stats`

**Headers:** None required  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { ... } }` (user counts, etc.).

---

### GET `/api/admin/users`

**Headers:** None required  
**Query:**

| Name     | Type   | Required | Description      |
| -------- | ------ | -------- | ---------------- |
| `role`   | string | No       | CUSTOMER / ADMIN |
| `search` | string | No       | Search term      |
| `limit`  | number | No       | Default 50       |
| `offset` | number | No       | Default 0        |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.

---

### GET `/api/admin/users/:id`

**Params:** `id` — User UUID.  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { ... } }`.  
**Error:** `404` user not found.

---

### PUT `/api/admin/users/:id/role`

**Headers:** `Content-Type: application/json`  
**Params:** `id` — User UUID.

**Body (required):**

```json
{
  "role": "CUSTOMER | ADMIN"
}
```

**Success:** `200` — `{ "success": true, "message": "User role updated to ...", "data": { ... } }`.  
**Errors:** `400` invalid role; `404` user not found.

---

### DELETE `/api/admin/users/:id`

**Params:** `id` — User UUID.  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "message": "User deleted successfully", "data": { ... } }`.  
**Errors:** `404` not found; `400` user has active orders.

---

## Customizations

### GET `/api/customizations/extras`

**Auth:** None  
**Query:**

| Name           | Type   | Required | Description     |
| -------------- | ------ | -------- | --------------- |
| `restaurantId` | string | Yes      | Restaurant UUID |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.  
**Error:** `400` if `restaurantId` missing.

---

### GET `/api/customizations/components`

**Auth:** None  
**Query:**

| Name           | Type   | Required | Description     |
| -------------- | ------ | -------- | --------------- |
| `restaurantId` | string | Yes      | Restaurant UUID |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.  
**Error:** `400` if `restaurantId` missing.

---

### POST `/api/customizations/extras`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

```json
{
  "name": "string (required)",
  "price": "number or string (required, >= 0)",
  "restaurantId": "string (required, UUID)"
}
```

**Success:** `201` — `{ "success": true, "message": "Extra created successfully", "data": { ... } }`.  
**Error:** `400` missing/invalid fields.

---

### PUT `/api/customizations/extras/:id`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Params:** `id` — Extra UUID.

**Body (optional):**

```json
{
  "name": "string",
  "price": "number or string (>= 0)"
}
```

**Success:** `200` — `{ "success": true, "message": "Extra updated successfully", "data": { ... } }`.  
**Errors:** `400` invalid data; `404` extra not found.

---

### DELETE `/api/customizations/extras/:id`

**Auth:** Admin  
**Params:** `id` — Extra UUID.  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "message": "Extra deleted successfully" }`.  
**Errors:** `404` not found; `400` extra used in products.

---

### POST `/api/customizations/components`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

```json
{
  "name": "string (required)",
  "costImpact": "number or string (required)",
  "restaurantId": "string (required, UUID)"
}
```

**Success:** `201` — `{ "success": true, "message": "Component created successfully", "data": { ... } }`.  
**Error:** `400` missing/invalid fields.

---

### PUT `/api/customizations/components/:id`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Params:** `id` — Component UUID.

**Body (optional):**

```json
{
  "name": "string",
  "costImpact": "number or string"
}
```

**Success:** `200` — `{ "success": true, "message": "Component updated successfully", "data": { ... } }`.  
**Errors:** `400` invalid data; `404` component not found.

---

### DELETE `/api/customizations/components/:id`

**Auth:** Admin  
**Params:** `id` — Component UUID.  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "message": "Component deleted successfully" }`.  
**Errors:** `404` not found; `400` component used in products.

---

## Restaurants

### GET `/api/restaurants/:id`

**Auth:** None  
**Params:** `id` — Restaurant UUID.  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { ... } }` (full details, includes counts).  
**Error:** `404` restaurant not found.

---

### GET `/api/restaurants/:id/public`

**Auth:** None  
**Params:** `id` — Restaurant UUID.  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { ... } }` (public info: name, description, hours, delivery settings, etc., no sensitive data).  
**Error:** `404` restaurant not found.

---

### POST `/api/restaurants`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

```json
{
  "name": "string (required)"
}
```

**Success:** `201` — `{ "success": true, "message": "Restaurant created successfully", "data": { ... } }`.  
**Error:** `400` name missing.

---

### PUT `/api/restaurants/:id`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Params:** `id` — Restaurant UUID.

**Body (optional):** Any updatable restaurant fields (e.g. `name`, `description`, `address`, `phone`, `email`, `city`, `state`, `zipCode`, `country`, `logoUrl`, `coverImageUrl`, business hours, `deliveryEnabled`, `deliveryFee`, `minOrderAmount`, `taxRate`).

**Success:** `200` — `{ "success": true, "message": "Restaurant updated successfully", "data": { ... } }`.  
**Errors:** `400` empty name; `404` not found.

---

### DELETE `/api/restaurants/:id`

**Auth:** Admin  
**Params:** `id` — Restaurant UUID.  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "message": "Restaurant deleted successfully" }`.  
**Errors:** `404` not found; `400` restaurant has active orders.

---

## Auth summary

| Requirement            | Routes                                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| No auth                | Debug, Home, Auth (signup/signin/signout), GET categories/products/tables/restaurants/customizations                       |
| Any authenticated user | Cart, User profile/password/orders, Customer orders (GET/POST)                                                             |
| Admin only             | All POST/PUT/DELETE/PATCH for categories, products, tables, restaurants, customizations; Admin order and admin user routes |
