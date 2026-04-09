
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

\`\`\`json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 characters)"
}
\`\`\`

**Success:** `201` — `{ "success": true, "message": "User signed up successfully", "user": { "id", "name", "email", "role", "createdAt" } }`. Sets `auth_token` cookie.  
**Errors:** `400` missing/invalid fields or password too short; `409` email already exists.

---

### POST `/api/auth/signin`

**Auth:** None  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

\`\`\`json
{
  "email": "string (required)",
  "password": "string (required)"
}
\`\`\`

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
| `restaurantId` | string | No       | Restaurant UUID |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.

**Notes:** `restaurantId` is optional. When omitted, returns categories across restaurants and uncategorized categories.

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

**Auth:** Admin  
**Headers:** Either `Content-Type: application/json` or `Content-Type: multipart/form-data`  
**Query:** None

**Body (required):**

\`\`\`json
{
  "name": "string (required)"
}
\`\`\`

**Multipart form-data:**
- `name` — string
- `image` — optional file upload (JPEG/PNG/WebP/GIF)

**Success:** `201` — `{ "success": true, "message": "Category created successfully", "data": { ... } }`.  
**Errors:** `400` missing/invalid name; `409` category name already exists.

---

### PUT `/api/categories/:id`

**Auth:** Admin  
**Headers:** Either `Content-Type: application/json` or `Content-Type: multipart/form-data`  
**Query:** None

**Params:** `id` — Category UUID.

**Body (required):**

\`\`\`json
{
  "name": "string (required)"
}
\`\`\`

**Multipart form-data:** same fields as above; `image` is optional and overwrites the previous image if provided.

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
| `restaurantId` | string | No       | Restaurant UUID            |
| `categoryId`   | string | No       | Filter by category UUID    |
| `search`       | string | No       | Search in name/description |
| `isActive`     | string | No       | `true` or `false`          |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.

---

### GET `/api/products/:id`

**Auth:** None  
**Headers:** None required  
**Query:** None  
**Body:** None

**Params:** `id` — Product UUID.

**Success:** `200` — `{ "success": true, "data": { ... } }`.

**Important:** Response includes `sizes`, `components`, and `extras` when available.

---

### POST `/api/products`

**Auth:** Admin  
**Headers:** Either `Content-Type: application/json` or `Content-Type: multipart/form-data`  
**Query:** None

**Body (required):**

\`\`\`json
{
  "name": "string (required)",
  "description": "string (optional)",
  "basePrice": "number or string (required)",
  "imageUrl": "string (optional)",
  "categoryId": "string (required, UUID)",
  "componentIds": ["string"],
  "extraIds": ["string"],
  "sizes": [
    { "size": "SMALL|MEDIUM|LARGE|EXTRA_LARGE", "priceModifier": "number or string" }
  ]
}
\`\`\`

**Multipart form-data:**
- `name`, `description`, `basePrice`, `categoryId`, `componentIds` (comma-separated), `extraIds` (comma-separated), `sizes` (JSON string)
- `image` — optional file upload

**Notes:**
- `sizes` is optional.
- `priceModifier` is added to `basePrice` when a product is added to cart with that `size`.

**Success:** `201` — `{ "success": true, "message": "Product created successfully", "data": { ... } }`.  
**Errors:** `400` missing/invalid fields, invalid sizes, invalid file upload; `404` category not found.

---

### PUT `/api/products/:id`

**Auth:** Admin  
**Headers:** Either `Content-Type: application/json` or `Content-Type: multipart/form-data`  
**Query:** None

**Params:** `id` — Product UUID.

**Body (optional):**

\`\`\`json
{
  "name": "string",
  "description": "string",
  "basePrice": "number or string",
  "imageUrl": "string",
  "categoryId": "string",
  "isActive": true,
  "componentIds": ["string"],
  "extraIds": ["string"],
  "sizes": [
    { "size": "SMALL|MEDIUM|LARGE|EXTRA_LARGE", "priceModifier": "number or string" }
  ]
}
\`\`\`

**Multipart form-data:** same fields as above; `image` is optional.

**Success:** `200` — `{ "success": true, "message": "Product updated successfully", "data": { ... } }`.  
**Errors:** `400` invalid data; `404` product or category not found.

---

### DELETE `/api/products/:id`

**Auth:** Admin  
**Headers:** None required  
**Query:** None  
**Body:** None

**Params:** `id` — Product UUID.

**Success:** `200` — `{ "success": true, "message": "Product deleted successfully" }`.  
**Error:** `404` product not found.

---

### PATCH `/api/products/:id/toggle`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Params:** `id` — Product UUID.

**Body:** None (or empty `{}`).

**Success:** `200` — `{ "success": true, "message": "Product activated/deactivated successfully", "data": { ... } }`.  
**Error:** `404` not found.

---

## Cart

**Auth:** Optional. Cart routes support authenticated users and guests. The server uses either `req.userId` or `req.sessionId`.

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

**Auth:** Optional  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

\`\`\`json
{
  "productId": "string (required, UUID)",
  "quantity": "number (required, >= 1)",
  "size": "SMALL|MEDIUM|LARGE|EXTRA_LARGE (optional)",
  "customizations": [
    {
      "type": "EXTRA | REMOVED_COMPONENT",
      "referenceId": "string (required)"
    }
  ],
  "note": "string (optional)"
}
\`\`\`

**Notes:**
- `size` is optional and must match a product size if provided.
- `customizations` is optional.
- Cart pricing includes `basePrice`, size `priceModifier`, and customization adjustments.

**Success:** `201` — `{ "success": true, "message": "Item added to cart", "data": { ... } }`.  
**Errors:** `400` invalid input; `404` product not found.

---

### PUT `/api/cart/:id`

**Auth:** Optional  
**Headers:** `Content-Type: application/json`  
**Params:** `id` — Cart item UUID.

**Body (optional):**

\`\`\`json
{
  "quantity": "number (>= 1)",
  "size": "SMALL|MEDIUM|LARGE|EXTRA_LARGE",
  "note": "string"
}
\`\`\`

**Success:** `200` — `{ "success": true, "message": "Cart item updated", "data": { ... } }`.  
**Errors:** `400` invalid data; `404` cart item not found.

---

### DELETE `/api/cart/:id`

**Auth:** Optional  
**Params:** `id` — Cart item UUID.

**Success:** `200` — `{ "success": true, "message": "Cart item removed" }`.  
**Errors:** `404` cart item not found.

---

### DELETE `/api/cart`

**Auth:** Optional  
**Body:** None

**Success:** `200` — `{ "success": true, "message": "Cart cleared" }`.

---

## Orders

### GET `/api/orders`

**Auth:** Cookie `auth_token` required  
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

**Auth:** Cookie `auth_token` required  
**Params:** `id` — Order UUID.  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { ... } }`.  
**Error:** `404` order not found.

---

### POST `/api/orders`

**Auth:** None (guest and authenticated users can create orders)  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

\`\`\`json
{
  "fulfillmentType": "DELIVERY | PICKUP | DINE_IN",
  "fulfillmentDetails": {
    "contactName": "string (optional)",
    "phoneNumber": "string (required for DELIVERY)",
    "street": "string (required for DELIVERY)",
    "building": "string (optional)",
    "state": "string (optional)",
    "locationNote": "string (optional)",
    "pickupTime": "string ISO date (required for PICKUP)",
    "reservationTime": "string ISO date (optional for DINE_IN)",
    "tableId": "string UUID (optional for DINE_IN)"
  },
  "guestName": "string (optional)",
  "guestEmail": "string (optional)",
  "guestPhone": "string (optional)"
}
\`\`\`

**Notes:**
- Cart items are taken from the current user session or guest session.
- `restaurantId` is optional in the order payload and will be stored if provided.

**Success:** `201` — `{ "success": true, "message": "Order created successfully", "data": { ... } }`.  
**Errors:** `400` validation errors or empty cart.

---

## Orders (Admin)

All admin routes require **Auth:** Cookie `auth_token` with **Admin** role.

### GET `/api/orders/admin/all`

**Headers:** None required  
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

**Headers:** None required  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { ... } }`.

---

### GET `/api/orders/admin/:id`

**Headers:** None required  
**Params:** `id` — Order UUID.  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { ... } }`.  
**Error:** `404` order not found.

---

### PATCH `/api/orders/admin/:id/status`

**Headers:** `Content-Type: application/json`  
**Params:** `id` — Order UUID.

**Body (required):**

\`\`\`json
{
  "status": "PENDING | CONFIRMED | PREPARING | READY | OUT_FOR_DELIVERY | COMPLETED | CANCELLED"
}
\`\`\`

**Success:** `200` — `{ "success": true, "message": "Order status updated to ...", "data": { ... } }`.  
**Errors:** `400` invalid transition; `404` not found.

---

### POST `/api/orders/admin/:id/confirm`

**Headers:** `Content-Type: application/json`  
**Params:** `id` — Order UUID.  
**Body:** None

**Success:** `200` — `{ "success": true, "message": "Order confirmed successfully", "data": { ... } }`.

---

### POST `/api/orders/admin/:id/reject`

**Headers:** `Content-Type: application/json`  
**Params:** `id` — Order UUID.

**Body (optional):**

\`\`\`json
{
  "reason": "string (optional)"
}
\`\`\`

**Success:** `200` — `{ "success": true, "message": "Order rejected/cancelled successfully", "data": { ... } }`.

---

## Tables

### GET `/api/tables`

**Auth:** None  
**Headers:** None required  
**Query:**

| Name           | Type   | Required | Description     |
| -------------- | ------ | -------- | --------------- |
| `restaurantId` | string | No       | Restaurant UUID |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.

---

### GET `/api/tables/available`

**Auth:** None  
**Headers:** None required  
**Query:**

| Name           | Type   | Required | Description     |
| -------------- | ------ | -------- | --------------- |
| `restaurantId` | string | Yes      | Restaurant UUID |
| `dateTime`     | string | Yes      | ISO date-time   |
| `partySize`    | number | No       | Optional filter |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.

---

### GET `/api/tables/:id`

**Auth:** None  
**Headers:** None required  
**Params:** `id` — Table UUID.  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { ... } }`.  
**Error:** `404` table not found.

---

### GET `/api/tables/:id/availability`

**Auth:** None  
**Headers:** None required  
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

\`\`\`json
{
  "tableNumber": "string (required)",
  "capacity": "number (optional)",
  "restaurantId": "string (optional, UUID)"
}
\`\`\`

**Success:** `201` — `{ "success": true, "message": "Table created successfully", "data": { ... } }`.  
**Errors:** `400` missing table number; `409` table number already exists.

---

### PUT `/api/tables/:id`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Params:** `id` — Table UUID.

**Body (optional):**

\`\`\`json
{
  "tableNumber": "string",
  "capacity": "number"
}
\`\`\`

**Success:** `200` — `{ "success": true, "message": "Table updated successfully", "data": { ... } }`.  
**Errors:** `400` invalid data or duplicate number; `404` not found.

---

### DELETE `/api/tables/:id`

**Auth:** Admin  
**Headers:** None required  
**Params:** `id` — Table UUID.  
**Body:** None

**Success:** `200` — `{ "success": true, "message": "Table deleted successfully" }`.  
**Errors:** `404` not found.

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

**Body:**

\`\`\`json
{
  "name": "string",
  "email": "string"
}
\`\`\`

**Success:** `200` — `{ "success": true, "message": "Profile updated successfully", "data": { ... } }`.  
**Errors:** `400` invalid data; `409` email already in use; `404` user not found.

---

### PUT `/api/users/password`

**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

\`\`\`json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 6 characters)"
}
\`\`\`

**Success:** `200` — `{ "success": true, "message": "Password changed successfully" }`.  
**Errors:** `400` invalid request; `404` user not found.

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

**Success:** `200` — `{ "success": true, "data": { ... } }`.

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

\`\`\`json
{
  "role": "CUSTOMER | ADMIN"
}
\`\`\`

**Success:** `200` — `{ "success": true, "message": "User role updated to ...", "data": { ... } }`.  
**Errors:** `400` invalid role; `404` user not found.

---

### DELETE `/api/admin/users/:id`

**Params:** `id` — User UUID.  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "message": "User deleted successfully", "data": { ... } }`.  
**Errors:** `404` not found.

---

## Customizations

### GET `/api/customizations/extras`

**Auth:** None  
**Headers:** None required  
**Query:**

| Name           | Type   | Required | Description     |
| -------------- | ------ | -------- | --------------- |
| `restaurantId` | string | No       | Restaurant UUID |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.

---

### GET `/api/customizations/components`

**Auth:** None  
**Headers:** None required  
**Query:**

| Name           | Type   | Required | Description     |
| -------------- | ------ | -------- | --------------- |
| `restaurantId` | string | No       | Restaurant UUID |

**Body:** None

**Success:** `200` — `{ "success": true, "data": [ ... ] }`.

---

### POST `/api/customizations/extras`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

\`\`\`json
{
  "name": "string (required)",
  "price": "number or string (required, >= 0)",
  "restaurantId": "string (optional, UUID)"
}
\`\`\`

**Success:** `201` — `{ "success": true, "message": "Extra created successfully", "data": { ... } }`.  
**Errors:** `400` missing/invalid fields.

---

### PUT `/api/customizations/extras/:id`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Params:** `id` — Extra UUID.

**Body (optional):**

\`\`\`json
{
  "name": "string",
  "price": "number or string"
}
\`\`\`

**Success:** `200` — `{ "success": true, "message": "Extra updated successfully", "data": { ... } }`.  
**Errors:** `400` invalid data; `404` extra not found.

---

### DELETE `/api/customizations/extras/:id`

**Auth:** Admin  
**Headers:** None required  
**Params:** `id` — Extra UUID.  
**Body:** None

**Success:** `200` — `{ "success": true, "message": "Extra deleted successfully" }`.  
**Errors:** `404` not found; `400` extra used in products.

---

### POST `/api/customizations/components`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

\`\`\`json
{
  "name": "string (required)",
  "costImpact": "number or string (required)",
  "restaurantId": "string (optional, UUID)"
}
\`\`\`

**Success:** `201` — `{ "success": true, "message": "Component created successfully", "data": { ... } }`.  
**Errors:** `400` missing/invalid fields.

---

### PUT `/api/customizations/components/:id`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Params:** `id` — Component UUID.

**Body (optional):**

\`\`\`json
{
  "name": "string",
  "costImpact": "number or string"
}
\`\`\`

**Success:** `200` — `{ "success": true, "message": "Component updated successfully", "data": { ... } }`.  
**Errors:** `400` invalid data; `404` component not found.

---

### DELETE `/api/customizations/components/:id`

**Auth:** Admin  
**Headers:** None required  
**Params:** `id` — Component UUID.  
**Body:** None

**Success:** `200` — `{ "success": true, "message": "Component deleted successfully" }`.  
**Errors:** `404` not found; `400` component used in products.

---

## Restaurants

### GET `/api/restaurants/:id`

**Auth:** None  
**Headers:** None required  
**Params:** `id` — Restaurant UUID.  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { ... } }`.

---

### GET `/api/restaurants/:id/public`

**Auth:** None  
**Headers:** None required  
**Params:** `id` — Restaurant UUID.  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "data": { ... } }`.

---

### POST `/api/restaurants`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Query:** None

**Body (required):**

\`\`\`json
{
  "name": "string (required)"
}
\`\`\`

**Success:** `201` — `{ "success": true, "message": "Restaurant created successfully", "data": { ... } }`.  
**Errors:** `400` name missing.

---

### PUT `/api/restaurants/:id`

**Auth:** Admin  
**Headers:** `Content-Type: application/json`  
**Params:** `id` — Restaurant UUID.

**Body (optional):** any restaurant fields such as `name`, `description`, `phone`, `email`, `address`, `city`, `state`, `zipCode`, `country`, `logoUrl`, `coverImageUrl`, business hours, `deliveryEnabled`, `deliveryFee`, `minOrderAmount`, `taxRate`.

**Success:** `200` — `{ "success": true, "message": "Restaurant updated successfully", "data": { ... } }`.  
**Errors:** `400` invalid data; `404` not found.

---

### DELETE `/api/restaurants/:id`

**Auth:** Admin  
**Headers:** None required  
**Params:** `id` — Restaurant UUID.  
**Query:** None  
**Body:** None

**Success:** `200` — `{ "success": true, "message": "Restaurant deleted successfully" }`.  
**Errors:** `404` not found.

---

## Auth summary

| Requirement            | Routes                                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| No auth                | Debug, Home, Auth (signup/signin/signout), GET categories/products/tables/restaurants/customizations, POST orders          |
| Authenticated user     | User profile/password/orders, Customer order GET                                                                        |
| Admin only             | All POST/PUT/DELETE/PATCH for categories, products, tables, restaurants, customizations; Admin order and admin user routes |
