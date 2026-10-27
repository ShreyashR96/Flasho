# Flasho Website — Complete Requirements Document

> **For AI Agents:** This document contains all the information needed to build the Flasho website from scratch. Read every section carefully before generating code.

---

## 1. Brand Identity

| Property | Value |
|---|---|
| **Brand Name** | Flasho |
| **Tagline** | "Pass hai, Fast hai" |
| **Founder & CEO** | Yashodip Devakar |
| **Headquarters** | Kolhapur, Maharashtra, India |
| **Email** | hello@flasho.services |
| **Phone** | +91 9561850928 |
| **Mission** | To simplify service booking by providing customers with instant access to trusted professionals while creating sustainable earning opportunities for skilled workers and service providers. |
| **Vision** | To build India's most trusted service ecosystem that empowers skilled individuals, creates employment opportunities, and makes quality services accessible to everyone. |

---

## 2. Reference Website

- **Reference:** [https://www.safsafaiwala.com](https://www.safsafaiwala.com)
- **Style to emulate:** Indian home services website — clean, professional, service-category-driven layout, mobile-first, easy booking flow, trust signals prominently displayed.
- **Differentiation:** Flasho is more tech-forward and employment-focused vs. a pure cleaning company.

---

## 3. Color Palette & Visual Identity

| Token | Usage | Suggested Value |
|---|---|---|
| `--color-primary` | Brand yellow/electric accent | `#F5C400` (electric yellow) |
| `--color-secondary` | Deep trust anchor | `#1A1A2E` (deep navy) |
| `--color-accent` | CTA buttons, highlights | `#FF6B35` (energetic orange) |
| `--color-bg` | Page background | `#FAFAFA` |
| `--color-surface` | Card backgrounds | `#FFFFFF` |
| `--color-text` | Body copy | `#2D2D2D` |
| `--color-muted` | Subtext | `#6B7280` |

> **Note to AI agent:** You may creatively adjust this palette while keeping the yellow primary and the "fast, energetic, trustworthy" brand feel. The logo mark should use a lightning bolt ⚡ motif.

---

## 4. Typography

- **Display / Hero Font:** Bold, chunky Indian-market feel — suggest `Poppins` (700/900 weight) or `Baloo 2`
- **Body Font:** Clean and readable — `DM Sans` or `Nunito`
- **Accent / Tagline:** Italic or semi-bold variation of display font

---

## 5. Page Structure & Sections

Build a **single-page website** (all sections on one scrollable page) with a sticky navigation header.

### 5.1 Navigation Bar (Sticky)

- Logo: ⚡ Flasho (text logo with lightning bolt icon)
- Nav links: Home | Services | How It Works | About | Contact
- CTA Button: **"Book a Service"** (accent color)
- Mobile: Hamburger menu

---

### 5.2 Hero Section

**Purpose:** Immediate impact — communicate speed, trust, and service range.

**Content:**
- **Headline:** "Fast hai, Pass hai." OR "Your Trusted Home Service Partner"
- **Sub-headline:** "Book verified professionals for home & office needs in Kolhapur — Instantly."
- **CTA Buttons:**
  - Primary: "Book a Service Now" → scrolls to Services
  - Secondary: "Become a Partner" → scrolls to Contact
- **Trust badges below CTA:**
  - ✅ Verified Professionals
  - ⚡ Fast Booking
  - 💰 Transparent Pricing
- **Visual:** Hero image or illustrated background showing a professional at work in a home setting. Use a grid/collage of service icons as a background motif.
- **Floating stats strip (optional):**
  - 10+ Service Categories | 100+ Professionals | Kolhapur's #1 Platform

---

### 5.3 Services Section

**Heading:** "Services We Offer"
**Sub-heading:** "From electrical fixes to deep cleaning — we've got it all."

Display services in a **card grid** (3 columns desktop, 2 tablet, 1 mobile). Each card has:
- Emoji icon (large)
- Service name
- Short 1-line description
- "Book Now" button

**Service Categories:**

#### 🏠 Home Services
| Icon | Name | Short Description |
|---|---|---|
| ⚡ | Electrician Services | Wiring, repairs, installations |
| 🚰 | Plumbing Services | Leaks, pipe fitting, drainage |
| 🪚 | Carpenter Services | Furniture, doors, woodwork |
| 🧹 | Cleaning Services | Deep cleaning, floor care |
| 🏠 | Housekeeping | Regular home maintenance help |

#### 🔧 Maintenance Services
| Icon | Name | Short Description |
|---|---|---|
| ❄️ | AC Repair & Maintenance | Service, gas refill, installation |
| 🔧 | Appliance Repair | Washing machine, fridge, TV |
| 🎨 | Painting Services | Interior & exterior painting |
| 🐜 | Pest Control | Home & office pest solutions |

#### 🏢 Business Services
| Icon | Name | Short Description |
|---|---|---|
| 🏢 | Office Maintenance | End-to-end office upkeep |
| 🛠 | Facility Management | Managed service packages |
| 📦 | Custom Solutions | Tailored service bundles |

---

### 5.4 How It Works Section

**Heading:** "How Flasho Works"
**Sub-heading:** "Book in seconds. Served in hours."

Display as a **4-step horizontal process** (with connecting arrows or a progress line):

| Step | Icon | Title | Description |
|---|---|---|---|
| 1 | 📱 | Choose Your Service | Select from our wide range of home and office services |
| 2 | 🔍 | We Find the Best | Flasho matches you with the nearest verified professional |
| 3 | ✅ | Professional Assigned | Get instant confirmation with professional's details |
| 4 | ⭐ | Service Delivered | Enjoy quality service and rate your experience |

---

### 5.5 Why Choose Flasho Section

**Heading:** "Why Customers Trust Flasho"

Display as **icon + text feature cards** in a 3-column grid:

| Icon | Feature | Description |
|---|---|---|
| ✅ | Verified Professionals | Every worker is background-checked and skill-verified |
| ⚡ | Fast Service Allocation | Nearest professional assigned within minutes |
| 💰 | Transparent Pricing | No hidden charges — know the cost before booking |
| 🛡️ | Trusted Platform | Rated and reviewed by real customers |
| 📱 | Tech-Driven | Smart matching ensures the right professional every time |
| 🤝 | Reliable Support | Customer support available throughout your service journey |

---

### 5.6 Social Impact Section

**Heading:** "More Than a Service Platform"
**Sub-heading:** "Flasho is building a livelihood ecosystem for skilled India."

Two-column layout:
- **Left column:** Illustrative or icon-based stat block
  - 🏘️ Creating Employment Opportunities
  - 📲 Digitizing the Service Sector
  - 💼 Promoting Self-Employment
  - 🤝 Supporting Local Businesses

- **Right column:** Quote card
  > "Every skilled person deserves an opportunity to work, earn, and grow."
  > — Shreyash Rakhunde, Founder & CEO

---

### 5.7 Roadmap Section

**Heading:** "Our Growth Journey"

Display as a **horizontal or vertical timeline** with 4 phases:

| Phase | Title | Key Points |
|---|---|---|
| Phase 1 🟢 | Launch in Kolhapur | Local launch · Agency partnerships · Build trust |
| Phase 2 🔵 | Expand Across Maharashtra | Mobile app launch · More service categories |
| Phase 3 🟣 | Direct Worker Onboarding | AI-powered matching · Quality assurance systems |
| Phase 4 🔴 | Pan-India Expansion | National service network · Large-scale employment |

---

### 5.8 Founder / About Section

**Heading:** "Meet Our Founder"

Card layout with:
- Avatar/placeholder image
- Name: **Shreyash Rakhunde**
- Title: **Founder & CEO, Flasho**
- Quote: *"Building technology that creates opportunities for skilled workers while simplifying service access for customers."*
- Short bio paragraph about the mission and Kolhapur roots

---

### 5.9 Partner / CTA Section

**Heading:** "Join the Flasho Ecosystem"
**Sub-heading:** "Whether you're a customer, a skilled worker, or a business — there's a place for you at Flasho."

Three cards side by side:

| Card | Icon | Title | CTA |
|---|---|---|---|
| Customers | 🏠 | Book Quality Services | Book Now |
| Skilled Workers | 🔧 | Grow Your Career | Join as Professional |
| Businesses / Partners | 🏢 | Partner With Us | Get in Touch |

---

### 5.10 Contact Section

**Heading:** "Get in Touch"

Two-column layout:
- **Left:** Contact details
  - 📧 hello@flasho.services
  - 📞 +91 9561850928
  - 📍 Kolhapur, Maharashtra, India
  - We welcome: Service Agencies · Skilled Workers · Business Partners · Investors · Community Organizations

- **Right:** Contact form with fields:
  - Name (text input)
  - Phone (tel input)
  - Email (email input)
  - I am a... (dropdown: Customer / Service Professional / Business Partner / Investor)
  - Message (textarea)
  - Submit button: **"Send Message"**

---

### 5.11 Footer

- Logo + tagline: **"Fast hai, pass hai."**
- Quick links: Home | Services | How It Works | About | Contact
- Social icons: Instagram, LinkedIn, Facebook, WhatsApp
- Copyright: `© 2025 Flasho. Building India's Future Service Ecosystem.`
- Location: Kolhapur, Maharashtra, India

---

## 6. Technical Requirements

| Property | Requirement |
|---|---|
| **Framework** | Pure HTML + CSS + Vanilla JavaScript (single file) OR React (JSX) |
| **Responsiveness** | Fully mobile-first responsive (320px → 1440px) |
| **Performance** | No large external dependencies; use Google Fonts CDN only |
| **Animations** | Smooth scroll, fade-in on scroll (Intersection Observer), hover effects on cards |
| **Accessibility** | ARIA labels on buttons, alt text on images, keyboard-navigable nav |
| **SEO** | Proper `<meta>` title, description, OG tags for Flasho |
| **Forms** | Client-side validation; no backend required (show success message) |
| **Icons** | Use emoji icons or Font Awesome / Lucide icons via CDN |

---

## 7. UX/UI Interaction Notes

- **Sticky header:** Changes background on scroll (transparent → solid white/dark)
- **Smooth scroll:** All nav links scroll smoothly to sections
- **Card hover:** Slight lift (translateY) + shadow on service cards
- **CTA pulse:** Subtle pulse animation on the primary CTA button
- **Mobile nav:** Slide-in hamburger menu
- **Process steps:** Animated number counters or step highlight on scroll
- **Form:** Inline validation with success toast/message

---

## 8. SEO & Meta Tags

```html
<title>Flasho — Fast hai, Pass hai | Home Services in Kolhapur</title>
<meta name="description" content="Flasho connects you with verified home service professionals in Kolhapur — Electrician, Plumber, Carpenter, Cleaning & more. Book instantly. Fast hai, pass hai." />
<meta property="og:title" content="Flasho — India's Trusted Service Platform" />
<meta property="og:description" content="Book verified home service professionals instantly. Starting from Kolhapur, building India's most trusted service ecosystem." />
```

---

## 9. Content Tone & Voice

- **Language:** Primarily English with occasional Hindi phrases (e.g., "Fast hai, pass hai")
- **Tone:** Friendly, trustworthy, energetic, aspirational
- **Avoid:** Corporate jargon, overly formal language
- **Target audience:** Middle-class Indian homeowners, office managers, and skilled workers looking for digital opportunities

---

## 10. Assets & Placeholders

Since no actual images are provided, the AI agent should:
- Use **placeholder image blocks** with descriptive alt text
- Use **emoji icons** for all service cards and feature blocks
- Use **CSS gradients and geometric patterns** for hero background
- Use **SVG illustrations** or pure CSS shapes where possible
- The logo can be a text logo: `⚡ Flasho` styled with CSS

---

*Document Version: 1.0 | Created for Flasho | Kolhapur, Maharashtra, India*
