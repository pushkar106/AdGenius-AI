# AdGenius AI — Enterprise AI Product Advertisement SaaS Platform

<div align="center">

![AdGenius AI](frontend/public/vite.svg)

### Autonomous AI Creative Studio for E-commerce, Marketers & Direct-to-Consumer Brands

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg?style=for-the-badge)](LICENSE)

</div>

---

## 🌟 Executive Overview

**AdGenius AI** is a full-featured, enterprise-grade AI SaaS application designed to empower brands, agencies, and e-commerce entrepreneurs to generate studio-quality commercial product advertisements, cinematic promotional video reels, and high-converting marketing scripts in seconds.

Built from the ground up with **Spring Boot 3 (Java 21)**, **MySQL 8 with Flyway**, **Spring Security + JWT with Refresh Token Rotation**, and a **React 18 + TypeScript + Vite + Tailwind CSS** frontend inspired by Linear and Stripe design systems.

---

## ⚡ Key Platform Capabilities

### 1. 🎨 AI Product Image Studio
- **Photorealistic Product Synthesis**: Drag-and-drop raw phone photos or e-commerce transparent PNGs.
- **10+ Artistic Aesthetic Styles**: Luxury & Elegant, Minimalist Clean, Studio Commercial, Cinematic Drama, Modern Lifestyle, Pure E-commerce White, Futuristic Cyber, and 3D Hyper-Render.
- **Multi-Ratio Formats**: Square (1:1), Vertical Reel/Story (9:16), Banner (16:9), Portrait (4:5).
- **Multi-Step Live Pipeline**: Alpha masking, 3D background synthesis, shadow/specular raymatching, and 4K upscaling.
- **Fail-Safe Credit Accounting**: Deducts 2 credits only on successful generation; automatically refunds on provider timeouts.

### 2. 🎬 AI Promotional Video Studio
- **Image-to-Video Animation**: Converts product photography into high-engagement promotional reels.
- **Replicate / SVD Architecture**: Asynchronous job queue (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`).
- **Camera Movement Presets**: Orbital Zoom, Dolly Push In, Cinematic Pan, Pedestal Rise with adjustable motion intensity (1–10).
- **Commercial Audio Moods**: Luxury Ambient synth, Upbeat Electronic, and D2C Acoustic.

### 3. 🎙️ AI Avatar & Marketing Copy Studio
- **Presenter Avatars**: Tech Founder, Viral UGC Creator, and Luxury Brand Specialist.
- **Campaign Scripts**: Hook, Problem, Solution, Benefits, and Call-To-Action (CTA).
- **High-CTR Headlines**: Persuasive advertising hooks ready for Meta & Google Ads.
- **Multi-Platform Captions**: Instagram, TikTok, and LinkedIn with 1-click clipboard copying.

### 4. 📦 Product & Media Vault
- **Catalog CRUD**: Save products with category, description, brand voice, and audience targeting.
- **Short-Lived Signed URLs**: Private AWS S3 storage with local filesystem provider fallback.
- **Creative Inspector**: Fullscreen modal previews, favorite toggles, and metadata tracking.

### 5. 💳 Concurrency-Safe Credit Ledger
- **Initial Welcome Quota**: 50 complimentary credits upon registration.
- **Pessimistic Locking & Idempotency**: Prevents double-deductions, race conditions, and duplicate refunds.
- **Audit Ledger**: Comprehensive audit trail of every credit debit, grant, and admin adjustment.

### 6. 💰 Subscription & Indian Payment Gateway
- **Tiers**: Free (50 credits), Starter (300 credits/mo), Pro (1,200 credits/mo), Enterprise (10,000+ credits).
- **Razorpay Integration**: INR checkout with HMAC-SHA256 signature verification and sandbox demo mode.

### 7. 🛡️ Role-Based Access Control (RBAC) & Super Admin Panel
- **Roles**: `USER`, `ADMIN`, `SUPER_ADMIN`.
- **Admin Capabilities**: Platform KPI metrics, search & block users, assign staff roles, adjust user credit balances, inspect background jobs, and view immutable audit logs.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Backend Framework** | Spring Boot 3.3.5 | Java 21 LTS, Spring Web, Spring Security |
| **Persistence** | Spring Data JPA / Hibernate | MySQL 8, Flyway Migrations |
| **Security** | Spring Security + JJWT 0.12.6 | BCrypt, Access Tokens + HttpOnly Refresh Tokens, CSRF, Rate Limiting |
| **Cloud Storage** | AWS SDK v2 S3 | Private buckets with presigned URLs & local directory fallback |
| **AI Integrations** | OpenAI + Replicate | DALL-E, GPT-4o-mini, Stable Video Diffusion + Demo Engine |
| **Payments** | Razorpay SDK | HMAC-SHA256 signature verification + Sandbox fallback |
| **API Docs** | Springdoc OpenAPI 2.6.0 | Swagger UI interactive documentation at `/swagger-ui.html` |
| **Frontend Framework**| React 18.3 + TypeScript 5.7 | Vite 6.0 fast bundler |
| **Styling & Motion** | Tailwind CSS 3.4 + Framer Motion | Linear/Stripe dark glassmorphic UI system |
| **State & Data** | Zustand + TanStack Query v5 | Real-time polling & cache invalidation |
| **Icons & Charts** | Lucide React + Recharts | Responsive animated usage and credit charts |
| **DevOps** | Docker & Docker Compose | Multi-stage production containers with health checks |

---

## 📁 Monorepo Folder Structure

```
adgenius-ai/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/adgenius/
│   │   │   │   ├── config/          # Security, OpenAPI, Storage, Async, Properties
│   │   │   │   ├── controller/      # Auth, AI, Products, Ads, Credits, Subscriptions, Admin
│   │   │   │   ├── dto/             # Request & Response DTO records
│   │   │   │   ├── entity/          # JPA entities (User, Product, Job, CreditAccount, etc.)
│   │   │   │   ├── enums/           # Roles, JobStatus, MediaType, VisualStyle, etc.
│   │   │   │   ├── exception/       # GlobalExceptionHandler, ApiException
│   │   │   │   ├── integration/     # OpenAI, Replicate, AWS S3, Razorpay clients
│   │   │   │   ├── repository/      # Spring Data JPA repositories with custom queries
│   │   │   │   ├── scheduler/       # Generation job polling scheduler
│   │   │   │   ├── security/        # JWT filter, UserPrincipal, Rate limiting filter
│   │   │   │   ├── service/         # Business logic layer (Auth, Credit, Product, AI)
│   │   │   │   └── util/            # DemoAssetFactory, FileValidator, HashUtil
│   │   │   └── resources/
│   │   │       ├── db/migration/    # Flyway schema V1 & initial seed data V2
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       ├── application-prod.yml
│   │   │       └── application-test.yml
│   │   └── test/                    # Unit, Service, Controller, and Security tests
│   ├── pom.xml
│   └── Dockerfile
│
├── frontend/
│   ├── public/                      # Static assets, SVG logos
│   ├── src/
│   │   ├── api/                     # Axios client with JWT refresh interceptors & CSRF
│   │   ├── components/              # UI library (Button, Input, Card, Modal, Badge)
│   │   ├── layouts/                 # AppLayout, AuthLayout, PublicLayout
│   │   ├── pages/
│   │   │   ├── admin/               # AdminDashboardPage
│   │   │   ├── auth/                # Login, Register, ForgotPassword, Reset, VerifyEmail
│   │   │   ├── dashboard/           # Dashboard, ImageStudio, VideoStudio, AvatarStudio, etc.
│   │   │   └── marketing/           # High-converting LandingPage
│   │   ├── routes/                  # ProtectedRoute, AdminRoute, AppRoutes
│   │   ├── services/                # Modular API services
│   │   ├── store/                   # Zustand useAuthStore
│   │   ├── types/                   # TypeScript interfaces & enums
│   │   └── utils/                   # Helper functions (cn, clsx)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- **Java**: JDK 21+ (`java --version`)
- **Node.js**: v18+ or v20+ (`node -v`, `npm -v`)
- **Maven**: 3.8+ (`mvn -v`)
- **MySQL**: 8.0+ running on port 3306 (or via Docker)

### Option 1: Running with Docker Compose (Recommended)

To run the complete platform (MySQL 8 + Backend API + Frontend Nginx) in a single command:

```bash
# 1. Copy sample environment file
cp .env.example .env

# 2. Launch all services
docker-compose up --build -d

# 3. View status & logs
docker-compose ps
docker-compose logs -f
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:8080`
- **Swagger Documentation**: `http://localhost:8080/swagger-ui.html`

---

### Option 2: Running Locally for Development

#### Step 1: Database Setup
Create the MySQL database:
```sql
CREATE DATABASE adgenius CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Step 2: Backend Setup
```bash
cd backend

# Compile and package
mvn clean package -DskipTests

# Run Spring Boot application (Flyway automatically executes migrations V1 and V2)
mvn spring-boot:run
```
The backend initializes the bootstrap admin account automatically:
- **Email**: `admin@adgenius.local`
- **Password**: `ChangeMeAdmin!234`
- **Role**: `SUPER_ADMIN`

#### Step 3: Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing

### Backend Tests
Execute unit, security, and service tests using in-memory H2 database:
```bash
cd backend
mvn test
```

### Frontend Production Build
Validate TypeScript types and bundling:
```bash
cd frontend
npm run build
```

---

## 🔑 Environment Configuration

Key configuration variables in `.env`:

| Variable | Description | Default / Example |
|---|---|---|
| `MYSQL_HOST` | Database host | `localhost` |
| `MYSQL_PORT` | Database port | `3306` |
| `MYSQL_DATABASE` | Database name | `adgenius` |
| `MYSQL_USER` | Database user | `adgenius` |
| `MYSQL_PASSWORD` | Database password | `change-me-strong-password` |
| `JWT_ACCESS_SECRET` | Secret key for JWT access tokens (min 32 chars) | `your-32-character-access-secret-here!` |
| `JWT_REFRESH_SECRET`| Secret key for refresh tokens (min 32 chars) | `your-32-character-refresh-secret-here!` |
| `OPENAI_API_KEY` | OpenAI API key for live DALL-E image generation | *(optional: demo mode active if blank)* |
| `REPLICATE_API_TOKEN`| Replicate token for live SVD video generation | *(optional: demo mode active if blank)* |
| `AWS_S3_BUCKET` | AWS S3 bucket name for creative assets | *(optional: local storage active if blank)* |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | *(optional: sandbox active if blank)* |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | *(optional: sandbox active if blank)* |

---

## 🔒 Security Architecture

1. **Short-Lived Access Tokens**: JWT access tokens expire after 15 minutes.
2. **HttpOnly Refresh Token Rotation**: Refresh tokens are stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies and hashed in MySQL with cryptographic family revocation.
3. **Pessimistic Concurrency**: Credit accounts are locked during transaction capture to prevent duplicate deductions or negative balances.
4. **Ownership Verification**: All product, advertisement, and media access checks verify the authenticated `userId`.
5. **Rate Limiting**: `AuthRateLimitFilter` throttles repeated failed authentication requests.
6. **CSRF Protection**: Double-submit cookie with `X-XSRF-TOKEN` header validation.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
