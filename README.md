# 🏠 FindYourHome – AI-Powered Real Estate Platform

FindYourHome is a full-stack real estate platform designed to allow users to search, list, and explore properties intelligently. By combining a robust MERN stack application with advanced AI-powered features, it dramatically improves property discovery and the overall user experience.

Whether you are a buyer or renter looking for smart search capabilities, or a seller managing property listings, FindYourHome provides a seamless, end-to-end solution.

---

## 🚀 Features

### 🔍 Smart Property Search
* **Targeted Search:** Find properties by city, type, price, bedrooms, and more.
* **Intelligent Filtering:** Apply dynamic filters and sorting to narrow down choices.
* **Optimized Queries:** Fast and reliable search performance.

### 🏡 Property Listings
* **Listing Management:** Users can easily create, update, and delete their own listings.
* **Media Support:** Upload multiple property images.
* **Comprehensive Details:** Specify price, location, bedrooms, furnishing status, parking availability, and property type.

### 🤖 AI-Powered Features
* **Multimodal Understanding:** AI-based image and text analysis.
* **Smart Descriptions:** Automated property description analysis to highlight key features.
* **Intelligent Insights:** AI-assisted market and property insights.

### 🔐 Security & Authentication
* **Secure Logins:** Powered by Firebase Authentication.
* **Social Sign-In:** One-click Google OAuth login.
* **Backend Authorization:** Secure JWT-based route protection.

### 📂 Storage & Monitoring
* **Cloud Image Storage:** Fast and reliable image hosting via Cloudinary.
* **Robust Monitoring Stack:** Backend health tracking using Prometheus, Grafana, and Loki.

---

## 🧱 Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Redux Toolkit, Tailwind CSS, Axios |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose |
| **AI / ML** | Google Gemini API |
| **Authentication** | Firebase Authentication, Google OAuth |
| **Storage** | Cloudinary |
| **DevOps & Monitoring** | Docker, Prometheus, Grafana, Loki |
| **Deployment** | Vercel (Frontend), Cloud Server (Backend API) |

---

## 🏗️ System Architecture

```text
User
 │
 ▼
React Frontend (Vercel)
 │
 ▼
Express API (Node.js)
 │
 ├── MongoDB (Listings & Users)
 ├── Cloudinary (Images)
 ├── Firebase Auth (Authentication)
 └── Gemini AI (AI Features)
