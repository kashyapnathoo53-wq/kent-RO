# KENT RO Water Purifier — Official E-Commerce & Doorstep Demo Platform

A high-performance, conversion-optimized web platform for **KENT RO Water Purifiers**, featuring interactive product discovery, multi-stage water filtration storytelling, a slide-over cart with checkout flow, and home demonstration booking.

---

## ✨ Features

- **Responsive Navigation**:
  - Desktop: Full sticky navigation with real-time purifier search autocomplete and dynamic cart item counter.
  - Mobile & Tablet: Modern two-row header with logo, Cart button positioned directly to the left of the hamburger menu, and a full-width search bar.
- **Hero Showcase & Stage Carousel**:
  - Studio-grade product showcase highlighting KENT's flagship RO lineup.
- **Interactive Product Catalog**:
  - Multi-attribute purification filters (Mineral RO, UV, UF, Alkaline, IoT).
  - Quick view modal with detailed specifications, warranty badges, and "Add to Cart" actions.
- **Interactive Cart & Frictionless Checkout Flow**:
  - Slide-over cart drawer with real-time subtotal calculation, coupon support, and free doorstep shipping.
  - Dedicated multi-step checkout (`checkout.html`) with payment method selector (UPI, Cards, NetBanking, COD).
  - **Strict 10-Digit Mobile Number Hard Cap**: Hardware-level prevention of >10 digits, stripping `+91` / `0` prefixes, blocking non-digits on paste/input, and numeric keypad triggering (`inputmode="numeric"`).
- **Complimentary Doorstep Home Demo Booking**:
  - Booking form with Doorstep Address and preferred 3-hour demo time slot picker (`09:00 AM - 12:00 PM`, `01:00 PM - 04:00 PM`, `05:00 PM - 08:00 PM`).
  - Client-side validation with real-time feedback and appointment confirmation.
- **Technology & Social Proof**:
  - Interactive Before/After TDS Water Comparison slider.
  - Verified customer reviews carousel, video demo modal, and interactive FAQ accordion.

---

## 📁 Project Structure

```text
├── index.html                 # Main landing page & storefront
├── checkout.html              # Dedicated frictionless checkout flow
├── styles.css                 # Comprehensive responsive design & animations
├── script.js                  # Frontend interactions, cart state & validations
├── images/                    # Purifier models, banners & brand assets
├── docs/
│   ├── PRD.md                 # Product Requirement Document (PRD)
│   └── DRD.md                 # Detailed Requirements & Design Document (DRD)
├── .gitignore                 # Version control exclusions
└── README.md                  # Project documentation
```

---

## 🚀 Getting Started

1. Clone or download the repository:
   ```bash
   git clone https://github.com/kashyapnathoo53-wq/ShoppingWebsite.git
   ```
2. Open `index.html` in any modern web browser or serve locally using:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js npx serve
   npx serve .
   ```
3. Visit `http://localhost:8000` in your browser.

---

## 📄 Documentation

- [Product Requirement Document (PRD)](docs/PRD.md)
- [Design & Architecture Requirements Document (DRD)](docs/DRD.md)
