# Remove Store Owner Login Options & Customer-Facing Phone Number

Remove all administrative login shortcuts, store owner prompts, and occurrences of the mobile number `7975614686` from customer-facing screens, while keeping regular login seamlessly functional to unlock the admin dashboard for the verified store owner.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed during the clarification step:
> - **Admin Access Strategy**: Normal customer login automatically unlocks the admin portal when mobile number `7975614686` is authenticated. No public "Store Owner" buttons or shortcuts are exposed to visitors.
> - **Customer Support Presentation**: Customer support is presented as "Order Support" with direct WhatsApp messaging, hiding the raw phone number `7975614686` from public text displays.

---

## 1. Overview & Core Concept

- **What It Does**: Sanitizes the customer-facing storefront to present a clean, professional retail shopping experience. All references to administrative control, store owner login buttons, and the private phone number `7975614686` are stripped from public customer views.
- **Target Audience / Persona**: Kirana store customers browsing groceries, placing orders, and seeking support, alongside the store owner who logs in through the standard login field to manage the store.
- **Key Value**: Preserves store owner privacy and prevents customer confusion by eliminating admin login prompts and public telephone numbers from the storefront, while retaining automated role-based dashboard access.

---

## 2. User Experience & Visual Design

### Customer Storefront Views
- **Header Top Strip**: Replaces `Support: 7975614686` with an elegant, non-intrusive `Order Support` action that connects directly to support without printing the raw phone number.
- **Homepage Hero Value Card**: Replaces the `Helpline: 7975614686` line with `Support: Daily 8 AM – 10 PM · WhatsApp Enabled`.
- **Empty Catalogue Banner**: Removes the `Store Owner Login (7975614686)` button for guests. Replaces `Customer Helpline & WhatsApp: 7975614686` with `Customer Support: Active on WhatsApp`.
- **Storefront Footer**: Removes the entire "Store Administrator / 7975614686" column and login button. Replaces it with a customer-centric "Customer Assistance" column highlighting fast delivery guarantees and WhatsApp ordering.
- **Order Details & Order History**: Updates contact links from `Call Store (7975614686)` to `Contact Store Support`.
- **Checkout Confirmation Screen**: Changes `Call: 7975614686` to `Order Support: WhatsApp & Helpline`.

### Login Modal (`AuthModal`)
- Removes the `Store Owner / Admin Login (7975614686)` shortcut button.
- Removes any prefilled mobile numbers or admin banner descriptions (`Authorized store administrator login for 7975614686`).
- Presents a unified, clean "Sign In / Register" screen for all users.
- When `7975614686` enters their number and verifies via OTP, the backend securely returns `isAdmin: true` and the app automatically switches or unlocks the Admin Dashboard option in the user menu.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Silent Admin Recognition on Standard Login**
  - *Chosen Approach*: The standard login input accepts `7975614686`. On OTP validation, backend authorization checks `mobile === '7975614686'` and marks the session as admin.
  - *Why*: Eliminates clutter and public exposure of administrative roles while ensuring the store owner can log in effortlessly from any phone or computer.
  - *Alternative Considered*: Secret URL parameters or hidden tap gestures. Passed over in favor of standard single-door login with backend role assignment.

- **Decision 2: Support Privacy & WhatsApp Connectivity**
  - *Chosen Approach*: Maintain functional WhatsApp chat links via the floating button and header action, but suppress the visual rendering of the raw phone number digits `7975614686`.
  - *Why*: Allows customers to easily message the store while preventing screen scraping and unwanted cold calls.

---

## 4. Technical Architecture & System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 Customer Storefront Surfaces                │
│                                                             │
│  [Navbar]             → Shows "Order Support" (No raw digits)│
│  [StoreHero]          → Shows "Support: Daily 8 AM - 10 PM" │
│  [EmptyState]         → No "Store Owner Login" button       │
│  [Footer]             → Pure customer assistance (No admin) │
│  [Checkout & Orders]  → "Contact Store Support"             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Unified AuthModal (Login)                   │
│                                                             │
│  • Clean mobile + OTP input (No admin quick-fill button)    │
│  • Submits to POST /api/auth/verify-otp                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend Server Verification                 │
│                                                             │
│  • If mobile === '7975614686' → returns isAdmin: true       │
│  • Otherwise                  → returns isAdmin: false      │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
     isAdmin: true                         isAdmin: false
┌───────────────────────┐             ┌───────────────────────┐
│ Admin Dashboard shown │             │ Regular customer view │
│ in Navbar & view menu │             │ Standard customer cart│
└───────────────────────┘             └───────────────────────┘
```

### Verification & Testing Steps
1. Verify `AuthModal.tsx` contains no store owner quick-fill buttons, pre-fills, or admin text tags.
2. Verify `App.tsx` has no `Store Owner Login` buttons in the empty state or footer, and no `7975614686` printed in customer views.
3. Verify `Navbar.tsx` and `StoreHero.tsx` display generic support labels without the digits `7975614686`.
4. Verify `OrdersView.tsx` and `CheckoutModal.tsx` display generic support contact buttons.
5. Log in with `7975614686` and verify that `isAdmin: true` is awarded and the Admin Dashboard opens properly.
6. Run `compile_applet` and `lint_applet` to confirm 0 errors.
