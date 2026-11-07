# Real-Time Image & Product Preview Component in Admin Dashboard

Upgrade the **Add New Product** page in the Admin Dashboard with a real-time preview component that dynamically displays the selected image file or external URL alongside full live product details (title, brand, MRP, selling price, automatic discount, weight, and stock status) before saving to the database.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed during the interactive clarification step:
> - **Preview Position**: Live customer storefront card preview positioned in a responsive sticky column beside the form.
> - **Preview Contents**: Full live customer card displaying the uploaded/URL image, product title, brand, unit/weight, selling price, MRP strikethrough, auto-calculated discount percentage badge, and in-stock indicator.

---

## 1. Overview & Core Concept

- **What It Does**: Provides the store administrator with an immediate, high-fidelity visual preview of how a grocery item will appear to shoppers on the customer homepage and category aisles before committing changes to the database.
- **Target Audience / Persona**: Store Owner / Administrator (`7975614686`) adding new grocery staples or updating prices, packaging weights, and product photos.
- **Key Value**: Eliminates guesswork and formatting errors by providing instant feedback for device photo uploads, external image URLs, price discount math, and availability indicators.

---

## 2. User Experience & Visual Design

### 2-Column Responsive Layout
- **Desktop (1024px+)**: A balanced 12-column split layout:
  - **Left Area (8 columns)**: Comprehensive Add/Edit Product form (Title, Brand, Category, Unit, MRP, Selling Price, Discount, File/URL Image Upload, Expiry Dates, Stock, Status, Description, and large green Save button).
  - **Right Area (4 columns)**: Sticky desktop sidebar housing the **Real-Time Customer Storefront Preview** card that updates instantaneously on every keystroke or file upload.
- **Mobile / Tablet (< 1024px)**: Stacked layout with the live preview card cleanly docked above the action buttons or below the image upload field for thumb-friendly inspection.

### Real-Time Preview Component Features
1. **Dynamic Image Rendering**:
   - Renders device gallery/camera photo uploads (via `FileReader` data URLs) or external HTTP/HTTPS image links with zero latency.
   - Elegant image placeholder state with grocery icon when no photo is uploaded yet.
   - Image format badge (`JPG`, `PNG`, `WebP`) and source indicator (`Local Upload` vs `External URL`).
2. **Complete Customer Card Simulation**:
   - **Product Image**: Clean aspect ratio container with object-contain formatting and neutral backing.
   - **Brand & Category Kicker**: Displays entered Brand and Category.
   - **Product Title**: Live title text with proper typography and wrapping.
   - **Weight / Unit**: Displays `1 kg`, `500 g`, `1 litre`, etc.
   - **Pricing Hierarchy**: Prominent selling price in bold INR (`₹`), original MRP with strikethrough, and emerald discount badge (`X% OFF`).
   - **Stock & Storefront Status**: Real-time indicators for `In Stock` vs `Out of Stock`, and `Active Online` vs `Inactive (Hidden)`.
3. **Form Integrity Callouts**:
   - Quick visual checklist below the preview card indicating whether Title, Image, and Prices meet validation criteria before clicking "ADD PRODUCT".

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full Card Replica vs. Isolated Image Box**
  - *Chosen Approach*: Full live storefront card preview displaying image together with title, pricing, discount, and unit.
  - *Why*: Allows the admin to evaluate the complete customer experience—checking that the image contrasts well with the discount badge and title length before saving.

- **Decision 2: Universal Support for Device Uploads & Web URLs**
  - *Chosen Approach*: Reactive data binding on `imagePreview` and `formImageUrl`.
  - *Why*: Supports both direct phone camera snapshots (base64 data URL) and curated web URLs with instant fallback error handling if an external image link fails to load.

---

## 4. Technical Architecture & System Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Admin Dashboard (ADD_PRODUCT Tab)                    │
│                                                                        │
│   ┌───────────────────────────────────┐  ┌───────────────────────────┐ │
│   │       Product Entry Form          │  │   Real-Time Live Preview  │ │
│   │                                   │  │                           │ │
│   │ • Title: [ Aashirvaad Atta     ]  │  │ ┌───────────────────────┐ │ │
│   │ • Image: [ File / Web URL       ]──┼──┼─▶ Image Rendered Here  │ │ │
│   │ • MRP:   [ 300 ]                  │  │ │ (Local File or URL)   │ │ │
│   │ • Price: [ 270 ]                  │  │ └───────────────────────┘ │ │
│   │ • Auto Discount: 10% OFF          │  │ • Aashirvaad Atta - 1 kg  │ │
│   │ • Weight: 1 kg                    │  │ • ₹270  ₹300 (10% OFF)    │ │
│   │ • Stock: 50 | In Stock            │  │ • In Stock (50 Units)     │ │
│   │                                   │  │ • Active on Storefront    │ │
│   │ [ ADD PRODUCT / SAVE BUTTON ]     │  │                           │ │
│   └───────────────────────────────────┘  └───────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Verification & Testing Steps
1. Verify device image upload from computer/phone renders immediately in the live card preview.
2. Verify switching to external URL mode loads and updates the preview card.
3. Verify changing title, MRP, selling price, weight, or category updates the preview in real time.
4. Verify invalid/empty image state shows a clean placeholder without broken image icons.
5. Co-execute `compile_applet` and `lint_applet` together to verify 0 errors.
