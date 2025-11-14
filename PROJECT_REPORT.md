# DRAW V - ESPORTS TOURNAMENT MANAGEMENT PLATFORM
## MCA Level Project Report

---

## TABLE OF CONTENTS

| SR. NO | TOPIC |
|--------|-------|
| 1 | Introduction |
| 2 | Project Scope |
| 3 | Objectives |
| 4 | Project Profile |
| 5 | Project Category |
| 6 | Environment Description |
| 7 | Analysis Report |
| 8 | Design Report |
| 9 | Limitations & Drawbacks |
| 10 | Future Enhancement |
| 11 | Conclusion |
| 12 | References |

---

## 1. INTRODUCTION

### 1.1 Overview
**DrawV** (Draw Five) is a comprehensive, production-grade esports tournament management platform designed specifically for colleges and amateur gaming communities. The platform addresses the critical need for streamlined tournament organization by providing end-to-end management capabilities—from tournament creation and player registration to bracket generation, match scheduling, and results publication.

### 1.2 Problem Statement
Traditional tournament management in educational institutions and amateur esports communities faces several challenges:
- **Manual Processes**: Tournament organizers rely on spreadsheets, manual bracket drawings, and paper-based registrations
- **Time-Consuming Setup**: Setting up a tournament manually takes 10-12 hours on average
- **Error-Prone Operations**: Manual data entry leads to registration errors, duplicate entries, and bracket mistakes
- **Lack of Transparency**: Participants have limited visibility into tournament progress and results
- **Communication Gaps**: No centralized system for announcements and updates
- **Scalability Issues**: Managing large tournaments (30+ teams) becomes extremely difficult

### 1.3 Solution Approach
DrawV provides a modern, web-based solution that:
- Automates tournament lifecycle management
- Provides real-time registration with validation
- Generates brackets automatically with multiple seeding options
- Offers public tools for fair match setup (Map Veto, Coin Toss)
- Implements role-based access control for security
- Delivers responsive UI for all devices
- Achieves 99.5% uptime with production-grade deployment

### 1.4 Real-World Validation
The platform has been successfully deployed and tested in production:
- **Event**: Aarohan Valorant Cup 2025 (MIT Manipal)
- **Scale**: 32 teams / 160 players
- **Performance**: 100% uptime, zero critical bugs
- **Efficiency**: Reduced setup time by 75% (12 hours → 3 hours)
- **Recognition**: Featured on Liquipedia (official esports wiki)

---

## 2. PROJECT SCOPE

### 2.1 Functional Scope

#### 2.1.1 Tournament Management
- Create, edit, publish, and archive tournaments
- Configure tournament parameters (game, format, team size, dates)
- Support multiple tournament formats (Single Elimination, Double Elimination, Round Robin, Groups + Playoffs)
- Manage tournament lifecycle states (Draft, Open, Ongoing, Completed)

#### 2.1.2 Registration System
- Dynamic team and solo registration
- Real-time validation and duplicate prevention
- Admin approval workflows
- Registration status tracking (Pending, Approved, Rejected, Cancelled)
- Email notifications for registration updates

#### 2.1.3 Bracket Management
- Automated bracket generation from approved registrations
- Multiple seeding methods (Random, Registration Order)
- Support for byes in non-power-of-2 participant counts
- Real-time bracket updates and result propagation
- Match scheduling with venue and stream URL support

#### 2.1.4 Public Tools
- **Map Veto System**: BO1, BO3, BO5 formats with ban/pick mechanics
- **Coin Toss Simulator**: Fair team selection for match start
- Accessible without authentication

#### 2.1.5 User Management
- Role-based access (Admin, Player, Guest)
- Multiple authentication methods (Email/Password, Google OAuth, GitHub OAuth)
- User profiles with IGN (In-Game Name) and contact information
- Dashboard for players to view their registrations

#### 2.1.6 Admin Panel
- Comprehensive tournament management interface
- Registration approval/rejection
- Bracket generation and publishing
- Match result entry and validation
- Email announcements to participants
- Analytics and reporting
- User management

### 2.2 Technical Scope

#### 2.2.1 Frontend
- Server-Side Rendering (SSR) for optimal performance
- Responsive design for mobile, tablet, and desktop
- Interactive UI components with animations
- Real-time form validation
- Optimistic UI updates

#### 2.2.2 Backend
- RESTful API architecture
- Serverless function deployment
- Database indexing for performance
- Session management with JWT
- Email service integration

#### 2.2.3 Security
- Authentication and authorization
- Protected API routes
- Input validation and sanitization
- CSRF protection
- Secure password hashing (bcrypt)

#### 2.2.4 Deployment
- Continuous Integration/Continuous Deployment (CI/CD)
- Global CDN delivery
- Automated backups
- Performance monitoring
- Analytics integration

### 2.3 Out of Scope (Future Enhancements)
- Real-time Socket.IO updates
- Native mobile applications
- Payment gateway integration
- AI-powered seeding
- Public API for third-party integrations
- Live streaming integration
- Player statistics and rankings

---

## 3. OBJECTIVES

### 3.1 Primary Objectives

1. **Automation**: Reduce manual effort in tournament management by 70%+
2. **Efficiency**: Enable tournament setup in under 3 hours (vs 12 hours manually)
3. **Reliability**: Achieve 99%+ uptime with zero data loss
4. **Scalability**: Support 500+ concurrent users and 50+ simultaneous tournaments
5. **User Experience**: Provide intuitive interface with <2 second page loads
6. **Transparency**: Give participants real-time access to tournament information

### 3.2 Secondary Objectives

1. **Accessibility**: Ensure WCAG 2.1 Level AA compliance
2. **Performance**: Achieve Lighthouse score of 90+ across all metrics
3. **Security**: Implement industry-standard authentication and authorization
4. **Maintainability**: Write clean, documented, and testable code
5. **Extensibility**: Design modular architecture for future enhancements

### 3.3 Learning Objectives (Academic)

1. **Full-Stack Development**: Master modern web development stack
2. **Database Design**: Implement efficient NoSQL schema design
3. **API Development**: Build RESTful APIs with proper error handling
4. **Authentication**: Implement secure multi-provider authentication
5. **Deployment**: Learn production deployment and DevOps practices
6. **Project Management**: Apply Agile methodologies in real project
7. **Problem Solving**: Address real-world challenges in tournament management

---

## 4. PROJECT PROFILE

### 4.1 Project Information

| Attribute | Details |
|-----------|---------|
| **Project Name** | DrawV (Draw Five) |
| **Version** | 0.1.0 |
| **Project Type** | Full-Stack Web Application |
| **Domain** | Esports / Tournament Management |
| **Development Model** | Agile (Iterative) |
| **License** | MIT License |
| **Repository** | GitHub (Private) |

### 4.2 Team Structure

| Role | Responsibilities |
|------|------------------|
| **Full-Stack Developer** | Frontend & Backend Development, API Design, Database Schema |
| **UI/UX Designer** | Interface Design, User Experience, Responsive Layouts |
| **DevOps Engineer** | Deployment, CI/CD, Monitoring, Performance Optimization |
| **Project Manager** | Requirements Gathering, Timeline Management, Stakeholder Communication |

### 4.3 Development Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1: Planning** | 2 weeks | Requirements Document, System Design, Database Schema |
| **Phase 2: Core Development** | 6 weeks | Authentication, Tournament CRUD, Registration System |
| **Phase 3: Advanced Features** | 4 weeks | Bracket Generation, Admin Panel, Email Service |
| **Phase 4: Testing** | 2 weeks | Unit Tests, Integration Tests, User Acceptance Testing |
| **Phase 5: Deployment** | 1 week | Production Deployment, Monitoring Setup |
| **Phase 6: Real-World Testing** | 2 weeks | Aarohan Valorant Cup 2025 (Live Event) |
| **Total** | **17 weeks** | Production-Ready Platform |

### 4.4 Key Metrics

| Metric | Target | Achieved |
|--------|--------|----------|
| **Page Load Time** | <2s | 1.2s |
| **Lighthouse Performance** | >85 | 92 |
| **Uptime** | >99% | 99.5% |
| **Concurrent Users** | 500+ | 500+ |
| **Setup Time Reduction** | 60% | 75% |
| **Critical Bugs** | 0 | 0 |

---

## 5. PROJECT CATEGORY

### 5.1 Primary Category
**Web Application Development** - Full-Stack

### 5.2 Sub-Categories

#### 5.2.1 Software Engineering
- Requirements Analysis
- System Design and Architecture
- Implementation and Coding
- Testing and Quality Assurance
- Deployment and Maintenance

#### 5.2.2 Database Management
- NoSQL Database Design (MongoDB)
- Schema Modeling
- Indexing and Query Optimization
- Data Validation and Integrity
- Backup and Recovery

#### 5.2.3 Web Technologies
- Frontend Development (React, Next.js)
- Backend Development (Node.js, API Routes)
- Responsive Web Design
- Progressive Web App (PWA) Principles
- Performance Optimization

#### 5.2.4 Cloud Computing
- Serverless Architecture
- Edge Computing
- CDN Integration
- Scalability and Load Balancing
- Monitoring and Analytics

#### 5.2.5 Security
- Authentication and Authorization
- Session Management
- Data Encryption
- Input Validation
- OWASP Best Practices

#### 5.2.6 User Experience
- UI/UX Design
- Accessibility (WCAG)
- Responsive Design
- Animation and Interactions
- User Research and Testing

### 5.3 Industry Alignment
- **Esports Industry**: Tournament management solutions
- **Education Technology**: Campus event management
- **SaaS Products**: Multi-tenant web applications
- **Event Management**: Registration and scheduling systems

---

## 6. ENVIRONMENT DESCRIPTION

### 6.1 Development Environment

#### 6.1.1 Hardware Requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **Processor** | Intel i5 / AMD Ryzen 5 | Intel i7 / AMD Ryzen 7 |
| **RAM** | 8 GB | 16 GB |
| **Storage** | 256 GB SSD | 512 GB SSD |
| **Network** | 10 Mbps | 50 Mbps |

#### 6.1.2 Software Requirements
| Software | Version | Purpose |
|----------|---------|---------|
| **Operating System** | Windows 10/11, macOS 12+, Ubuntu 20.04+ | Development Platform |
| **Node.js** | 20.x LTS | JavaScript Runtime |
| **npm** | 10.x | Package Manager |
| **Git** | 2.40+ | Version Control |
| **VS Code** | Latest | Code Editor |
| **MongoDB Compass** | Latest | Database GUI |
| **Postman** | Latest | API Testing |
| **Browser** | Chrome/Firefox Latest | Testing |

### 6.2 Technology Stack

#### 6.2.1 Frontend Technologies
```
┌─────────────────────────────────────────┐
│         FRONTEND STACK                  │
├─────────────────────────────────────────┤
│ Framework:     Next.js 15.4.4           │
│ Library:       React 19.1.0             │
│ Language:      TypeScript 5.x           │
│ Styling:       Tailwind CSS 4.x         │
│ Animations:    Framer Motion 12.x       │
│ Icons:         Lucide React, Heroicons  │
│ Forms:         React Hook Form          │
│ Validation:    Zod 4.x                  │
│ Notifications: React Hot Toast          │
│ Charts:        Recharts 3.x             │
└─────────────────────────────────────────┘
```

**Key Dependencies:**
- **next**: 15.4.4 - React framework with SSR, routing, and API routes
- **react**: 19.1.0 - UI library for building components
- **typescript**: 5.x - Type-safe JavaScript
- **tailwindcss**: 4.x - Utility-first CSS framework
- **framer-motion**: 12.23.9 - Animation library
- **lucide-react**: 0.534.0 - Icon library
- **zod**: 4.0.17 - Schema validation
- **react-hot-toast**: 2.6.0 - Toast notifications

#### 6.2.2 Backend Technologies
```
┌─────────────────────────────────────────┐
│         BACKEND STACK                   │
├─────────────────────────────────────────┤
│ Runtime:       Node.js 20.x LTS         │
│ Framework:     Next.js API Routes       │
│ Database:      MongoDB 6.x              │
│ ODM:           Mongoose 8.16.5          │
│ Auth:          NextAuth.js 4.24.11      │
│ Password:      bcryptjs 3.0.2           │
│ Email:         Nodemailer 6.10.1        │
│ Validation:    Zod 4.x                  │
└─────────────────────────────────────────┘
```

**Key Dependencies:**
- **mongodb**: 6.18.0 - MongoDB driver
- **mongoose**: 8.16.5 - MongoDB ODM
- **next-auth**: 4.24.11 - Authentication solution
- **bcryptjs**: 3.0.2 - Password hashing
- **nodemailer**: 6.10.1 - Email sending
- **zod**: 4.0.17 - Runtime validation

#### 6.2.3 Database
```
┌─────────────────────────────────────────┐
│         DATABASE                        │
├─────────────────────────────────────────┤
│ Type:          NoSQL (Document-based)   │
│ System:        MongoDB Atlas            │
│ Version:       6.x                      │
│ Hosting:       Cloud (AWS)              │
│ Replication:   3-node replica set       │
│ Backup:        Automated daily          │
│ Encryption:    At rest & in transit     │
└─────────────────────────────────────────┘
```

#### 6.2.4 Authentication
```
┌─────────────────────────────────────────┐
│         AUTHENTICATION                  │
├─────────────────────────────────────────┤
│ Library:       NextAuth.js              │
│ Session:       JWT (JSON Web Tokens)    │
│ Providers:     - Email/Password         │
│                - Google OAuth 2.0       │
│                - GitHub OAuth           │
│ Password:      bcrypt (10 rounds)       │
│ CSRF:          Built-in protection      │
└─────────────────────────────────────────┘
```

#### 6.2.5 Deployment & DevOps
```
┌─────────────────────────────────────────┐
│         DEPLOYMENT                      │
├─────────────────────────────────────────┤
│ Platform:      Vercel                   │
│ Architecture:  Serverless Functions     │
│ CDN:           Vercel Edge Network      │
│ CI/CD:         GitHub Actions           │
│ Monitoring:    Vercel Analytics         │
│ Performance:   Vercel Speed Insights    │
│ Logs:          Vercel Logs              │
│ Domain:        Custom domain support    │
└─────────────────────────────────────────┘
```

### 6.3 Development Tools

#### 6.3.1 Code Editor & Extensions
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - GitLens
  - MongoDB for VS Code

#### 6.3.2 Version Control
- **Git** for source control
- **GitHub** for repository hosting
- **Git Flow** branching strategy

#### 6.3.3 API Development & Testing
- **Postman** for API testing
- **Thunder Client** (VS Code extension)
- **MongoDB Compass** for database inspection

#### 6.3.4 Design Tools
- **Figma** for UI/UX design
- **Excalidraw** for diagrams
- **Canva** for graphics

### 6.4 Production Environment

#### 6.4.1 Hosting Infrastructure
```
┌─────────────────────────────────────────┐
│         PRODUCTION INFRASTRUCTURE       │
├─────────────────────────────────────────┤
│ Frontend:      Vercel Edge Network      │
│ Backend:       Vercel Serverless        │
│ Database:      MongoDB Atlas (AWS)      │
│ CDN:           Vercel Global CDN        │
│ SSL:           Automatic (Let's Encrypt)│
│ DDoS:          Vercel Protection        │
└─────────────────────────────────────────┘
```

#### 6.4.2 Performance Characteristics
- **Global Latency**: <100ms (Edge Network)
- **Cold Start**: <500ms (Serverless Functions)
- **Database Latency**: <50ms (MongoDB Atlas)
- **Asset Delivery**: <200ms (CDN)
- **Uptime SLA**: 99.9% (Vercel)

#### 6.4.3 Scalability
- **Horizontal Scaling**: Automatic (Serverless)
- **Database Scaling**: Vertical + Sharding (MongoDB Atlas)
- **CDN**: Global distribution
- **Rate Limiting**: API route protection

### 6.5 Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://[credentials]@cluster.mongodb.net/

# Authentication
NEXTAUTH_URL=https://drawv.com
NEXTAUTH_SECRET=[secret-key]

# OAuth Providers
GOOGLE_CLIENT_ID=[google-client-id]
GOOGLE_CLIENT_SECRET=[google-client-secret]
GITHUB_CLIENT_ID=[github-client-id]
GITHUB_CLIENT_SECRET=[github-client-secret]

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[email]
SMTP_PASS=[app-password]
SMTP_FROM_NAME=Tournament System
SMTP_FROM_EMAIL=[email]

# Application
NEXT_PUBLIC_APP_URL=https://drawv.com
NEXT_PUBLIC_GA_ID=[google-analytics-id]
```

---
