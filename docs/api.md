# Multi-Vendor Ecommerce API Documentation

All routes are prefixed with `/api`.
Base Response Format:
- Success: `{ "success": true, "data": ..., "message": "...", "pagination": ... }`
- Error: `{ "success": false, "error": "...", "code": "..." }`

## Authentication (`/api/auth`)
- `POST /api/auth/register`: Create user account (`name`, `email`, `password`, `phone`, optional `role: 'customer' | 'seller'`).
- `POST /api/auth/login`: Authenticate and receive `accessToken` + `user`.
- `GET /api/auth/me`: Get profile of authenticated user.
- `POST /api/auth/logout`: Revoke session.
- `GET /api/auth/addresses`: Get customer delivery addresses.
- `POST /api/auth/addresses`: Add new delivery address.

## Catalog & Products (`/api/products`)
- `GET /api/products`: Browse products with query filters (`category`, `search`, `shopId`, `page`, `limit`).
- `GET /api/products/featured`: Featured editorial pieces for storefront.
- `GET /api/products/:id`: Get product details by ID or slug with reviews and vendor information.
- `GET /api/products/shop/:shopId`: Products belonging to a specific artisan studio.
- `GET /api/products/seller/my-products`: Products belonging to the logged-in seller's shop.
- `POST /api/products`: Create a product (Seller/Admin only).
- `PATCH /api/products/:id`: Update product attributes, status or inventory.
- `DELETE /api/products/:id`: Remove product from catalog.

## Shops & Vendors (`/api/shops`)
- `GET /api/shops`: List approved artisan shops.
- `GET /api/shops/:id`: Get shop details by ID or slug.
- `GET /api/shops/seller/my-shop`: Get the logged-in seller's shop and KYC verification status.
- `POST /api/shops`: Register new shop application (`shopName`, `category`, `address`, `gstin`, `pan`, `returnPolicy`).
- `PATCH /api/shops/:id`: Update studio branding and settings.
- `PATCH /api/shops/admin/:id/approve`: Approve shop application (Admin only).
- `PATCH /api/shops/admin/:id/reject`: Reject shop application (Admin only).
- `PATCH /api/shops/admin/:id/block`: Toggle shop block status (Admin only).

## Cart & Orders (`/api/cart`, `/api/orders`)
- `GET /api/cart`: Get current customer cart with multi-vendor grouped lines.
- `POST /api/cart/items`: Add item to cart with quantity, size and color.
- `PATCH /api/cart/items/:id`: Update item quantity.
- `DELETE /api/cart/items/:id`: Remove item from cart.
- `DELETE /api/cart`: Empty cart.
- `POST /api/orders`: Create sub-orders from cart (`deliveryAddress`, `paymentMethod`).
- `GET /api/orders/customer/my-orders`: Get customer's orders history.
- `GET /api/orders/seller/shop-orders`: Get vendor's incoming sub-orders.
- `GET /api/orders/admin/all`: Get all platform orders (Admin only).
- `GET /api/orders/:id`: Get order details by ID.
- `PATCH /api/orders/:id/status`: Update sub-order fulfillment status (`packed`, `shipped`, `delivered`).
- `PATCH /api/orders/:id/cancel`: Customer cancellation before dispatch with refund trigger.

## Payments (`/api/payments`)
- `POST /api/payments/create-order`: Generate Razorpay Order strictly using order ID and server-side verified amount.
- `POST /api/payments/verify`: Verify Razorpay signature (`razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`).
- `GET /api/payments/:id`: Get verified payment details (Caller ownership or Admin only).

## Categories, Videos, Reviews & Tailoring
- `GET /api/categories`: Retrieve all marketplace departments.
- `GET /api/shoppable-videos`: Video reels with linked products.
- `GET /api/reviews/:productId`: Customer reviews for a product.
- `POST /api/reviews/:productId`: Post a customer review with rating.
- `POST /api/tailoring`: Submit bespoke measurement request.
- `GET /api/tailoring/my`: Retrieve customer's custom tailoring requests.
- `GET /api/coupons/active`: Retrieve available discount coupons.

## Admin Operations (`/api/admin`)
- `GET /api/admin/stats`: GMV, commission margins, active shops, orders count, and users count.
- `GET /api/admin/users`: List registered users with role and status filters.
- `PATCH /api/admin/users/:id/block`: Toggle user block.
- `GET /api/admin/ledger`: Financial transactions ledger.
- `POST /api/admin/shops/:id/payout`: Trigger seller settlement.
