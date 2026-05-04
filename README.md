# ◉ Vinyl Shop - Premium Records & CDs

A modern, full-stack e-commerce platform dedicated to music lovers. This platform specializes in premium vinyl records, CDs, and rare EX-YU pressings, featuring a stunning dark-themed UI, comprehensive admin dashboard, and localized experience.

![Hero Section](https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=1200)

## ✨ Features

### 🛒 Storefront
- **Dynamic Catalog**: Browse products with advanced filtering by category, genre, and region.
- **Localized Experience**: Full support for English and Serbian (Latin) languages.
- **Interactive Product Details**: Multi-image galleries, store availability checks, and wishlist integration.
- **Premium Checkout**: Streamlined checkout process with saved address support and multiple payment methods (Credit Card, PayPal, Cash on Delivery, Local Pick-up).
- **User Accounts**: Manage profiles, delivery addresses, and track order history with detailed itemized views.

### 🛡️ Admin Dashboard
- **Cash Flow Analysis**: Visualized revenue statistics with interactive charts (powered by Recharts).
- **Inventory Management**: Full CRUD operations for products, categories, and genres.
- **Stock Control**: Automated low-stock alerts and multi-store inventory tracking.
- **Order Management**: Process orders, update shipping statuses, and view detailed customer transaction history.
- **User Management**: Monitor user activity and manage account statuses.

## 🚀 Tech Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Vanilla CSS (Custom Design System)
- **State Management**: React Context API
- **Charts**: Recharts
- **Icons**: Custom Inline SVGs
- **Animations**: CSS Keyframes & Transitions

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (managed via `better-sqlite3`)
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt for password hashing

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vinyl-shop.git
   cd vinyl-shop
   ```

2. **Setup the Server**
   ```bash
   cd server
   npm install
   # The database (vinylshop.db) is already initialized in the root
   npm run dev
   ```

3. **Setup the Client**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

The application will be available at `http://localhost:5173` and the API at `http://localhost:5000`.

## 📸 Screenshots

| Dashboard | Catalog |
| :---: | :---: |
| ![Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400) | ![Catalog](https://images.unsplash.com/photo-1514525253361-b83f8b9627c5?auto=format&fit=crop&q=80&w=400) |

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---
Built with ❤️ for music enthusiasts.
