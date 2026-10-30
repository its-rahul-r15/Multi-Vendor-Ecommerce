# Architectural & Design Decisions

This document records architectural decisions made according to the *Multi-Vendor Ecommerce: Audit and Build Blueprint*.

1. **Hyperlocal vs. Direct Vendor Routing**: Keep hyperlocal routing behind `ENABLE_NEAREST_ROUTING=false` (default off) and route by the specific vendor product the customer actually added to their bag.
2. **Frontend App Topology**: Implemented one consolidated Vite React application in `client/` divided into three modular route trees: storefront (`/`), vendor dashboard (`/vendor/*`), and platform administration (`/admin/*`), guarded by authenticated role policies.
3. **Shipping Calculations**: Flat fee per vendor sub-order applied at checkout, with free shipping threshold configurable via platform policies.
4. **Cart State & Guest Merge**: Multi-vendor grouped cart stored in server session for signed-in members, merged from local storage upon user login with quantities bounded by real inventory stock.
5. **SEO & Prerendering**: Deployed clean client-rendered single-page application with per-page metadata, semantic headings, OpenGraph tags, and clean descriptive URL slugs.
6. **Currency Representation**: Prices and transactions formatted and displayed cleanly in Indian Rupees (INR) with sub-order paise precision.
