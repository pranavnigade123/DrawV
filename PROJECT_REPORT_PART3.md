## 8. DESIGN REPORT

### 8.1 System Architecture

#### 8.1.1 High-Level Architecture
```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │  Browser   │  │   Mobile   │  │   Tablet   │                 │
│  │  (Desktop) │  │            │  │            │                 │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                 │
│        │               │               │                         │
│        └───────────────┴───────────────┘                         │
│                        │                                         │
│                        │ HTTPS                                   │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                      CDN / EDGE LAYER                            │
│                   (Vercel Edge Network)                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Static Assets Cache │ Image Optimization │ Geo-Routing    │  │
│  └────────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                              │
│                   (Next.js 15 - Vercel)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  FRONTEND (React 19)                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │   Pages    │  │ Components │  │   Hooks    │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              BACKEND (API Routes)                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │  Auth API  │  │Tournament  │  │ Bracket    │         │   │
│  │  │            │  │    API     │  │   API      │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              MIDDLEWARE LAYER                            │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │    Auth    │  │ Validation │  │   CORS     │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │  Bracket   │  │   Email    │  │  Results   │         │   │
│  │  │  Service   │  │  Service   │  │  Service   │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              MongoDB Atlas (AWS)                         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │   Users    │  │Tournaments │  │ Brackets   │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  │  ┌────────────┐                                          │   │
│  │  │Registration│                                          │   │
│  │  └────────────┘                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

#### 8.1.2 Component Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT HIERARCHY                      │
└─────────────────────────────────────────────────────────────┘

app/
├── layout.tsx (Root Layout)
│   ├── Providers (Session, Theme)
│   ├── Navbar
│   └── Footer
│
├── page.tsx (Landing Page)
│   ├── TypewriterEffect
│   ├── ContainerScroll
│   └── FeaturesSectionDemo
│
├── tournaments/
│   ├── page.tsx (Tournament List)
│   │   └── TournamentCard[]
│   │
│   └── [slug]/
│       ├── page.tsx (Tournament Detail)
│       │   ├── TournamentHeader
│       │   ├── TournamentInfo
│       │   ├── BracketViewer
│       │   └── ResultsViewer
│       │
│       ├── register/
│       │   └── page.tsx (Registration Form)
│       │       ├── TeamRegistrationForm
│       │       └── SoloRegistrationForm
│       │
│       └── results/
│           └── page.tsx (Results Page)
│               ├── StandingsTable
│               └── MatchHistory
│
├── admin/
│   ├── layout.tsx (Admin Layout)
│   │   └── AdminToolbar
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │       ├── AnalyticsSnapshot
│   │       ├── EventsCalendar
│   │       └── EmailBlast
│   │
│   └── tournaments/
│       ├── page.tsx (Tournament Management)
│       │   └── TournamentTable
│       │
│       ├── create/
│       │   └── page.tsx (Create Tournament)
│       │       └── TournamentForm
│       │
│       └── [id]/manage/
│           └── page.tsx (Manage Tournament)
│               ├── OverviewTab
│               ├── RegistrationsTab
│               ├── BracketTab
│               ├── ScheduleTab
│               ├── ResultsTab
│               └── SettingsTab
│
└── public-tools/
    ├── page.tsx (Tools List)
    ├── cointoss/
    │   └── page.tsx (Coin Toss)
    │       └── CoinToss Component
    └── veto/
        └── page.tsx (Map Veto)
            └── MapVeto Component
```

### 8.2 Database Design

#### 8.2.1 Collection Schemas

**1. Users Collection**
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed),
  name: String,
  provider: String ("credentials" | "google" | "github"),
  role: String ("admin" | "player" | "guest"),
  phone: String,
  ign: String (In-Game Name),
  createdAt: Date
}

// Indexes
- email: unique
- role: 1
```

**2. Tournaments Collection**
```javascript
{
  _id: ObjectId,
  name: String (required),
  slug: String (unique, required),
  game: String,
  format: String ("single_elim" | "double_elim" | "round_robin" | "groups_playoffs"),
  entryType: String ("solo" | "team"),
  teamSize: Number,
  registrationOpenAt: Date,
  registrationCloseAt: Date,
  startDate: Date,
  endDate: Date,
  maxParticipants: Number,
  coverImage: String (URL),
  rules: String (Markdown),
  description: String,
  status: String ("draft" | "open" | "ongoing" | "completed"),
  bracketId: String,
  bracketGenerated: Boolean,
  bracketPublished: Boolean,
  resultsPublished: Boolean,
  archivedAt: Date,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}

// Indexes
- slug: unique
- status: 1
- archivedAt: 1
- createdAt: -1
- compound: { archivedAt: 1, status: 1, createdAt: -1 }
```

**3. Registrations Collection**
```javascript
{
  _id: ObjectId,
  tournamentId: ObjectId (ref: Tournament, required),
  tournamentSlug: String (required),
  entryType: String ("team" | "solo"),
  
  // For team registrations
  team: {
    name: String,
    leader: {
      userId: ObjectId (ref: User),
      name: String,
      email: String,
      ign: String,
      phone: String
    },
    members: [{
      name: String,
      email: String,
      ign: String
    }],
    size: Number
  },
  
  // For solo registrations
  solo: {
    userId: ObjectId (ref: User),
    name: String,
    email: String,
    ign: String,
    phone: String
  },
  
  status: String ("pending" | "approved" | "rejected" | "cancelled"),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
- tournamentId: 1
- status: 1
- compound: { tournamentId: 1, status: 1, createdAt: -1 }
- unique partial: { tournamentId: 1, "team.leader.userId": 1, status: 1 }
  where status in ["pending", "approved"]
- unique partial: { tournamentId: 1, "solo.userId": 1, status: 1 }
  where status in ["pending", "approved"]
```

**4. Brackets Collection**
```javascript
{
  bracketId: String (unique, required),
  tournamentId: String,
  ownerId: ObjectId (ref: User),
  format: String ("single_elim" | "double_elim"),
  participantsCount: Number,
  params: {
    seedingMethod: String,
    bracketFormat: String,
    generatedAt: Date,
    byesGiven: Number
  },
  matches: [{
    id: String,
    bracket: String ("W" | "L" | "F"),
    round: Number,
    matchNumber: Number,
    opponentA: {
      type: String ("team" | "player" | "placeholder"),
      refId: String,
      label: String,
      propagatedFrom: String
    },
    opponentB: {
      type: String ("team" | "player" | "placeholder"),
      refId: String,
      label: String,
      propagatedFrom: String
    },
    scoreA: Number,
    scoreB: Number,
    winner: String ("A" | "B" | null),
    finished: Boolean,
    winnerto: String,
    loserto: String,
    scheduledAt: Date,
    scheduledEndAt: Date,
    venue: String,
    streamUrl: String,
    status: String ("pending" | "scheduled" | "live" | "completed"),
    metadata: Object
  }],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
- bracketId: unique
- tournamentId: 1
```

#### 8.2.2 Database Relationships
```
User (1) ──────────────> (N) Tournament
         createdBy

Tournament (1) ─────────> (N) Registration
               tournamentId

User (1) ───────────────> (N) Registration
         team.leader.userId
         or solo.userId

Tournament (1) ─────────> (1) Bracket
               bracketId      tournamentId
```

### 8.3 API Design

#### 8.3.1 API Structure
```
/api/
├── auth/
│   ├── [...nextauth]/route.ts    # NextAuth.js handler
│   └── register/route.ts         # User registration
│
├── tournaments/
│   ├── route.ts                  # GET: List, POST: Create
│   └── [slug]/
│       ├── route.ts              # GET: Details
│       ├── register/route.ts     # POST: Register
│       ├── results/route.ts      # GET: Results
│       └── schedules/route.ts    # GET: Schedules
│
├── brackets/
│   ├── route.ts                  # POST: Create bracket
│   ├── [bracketId]/
│   │   ├── route.ts              # GET: Bracket details
│   │   ├── resolve-result/       # POST: Update match result
│   │   └── schedule-match/       # POST: Schedule match
│   └── my/route.ts               # GET: User's brackets
│
├── admin/
│   ├── tournaments/
│   │   ├── route.ts              # GET: List all
│   │   └── [id]/
│   │       ├── route.ts          # GET, PATCH, DELETE
│   │       ├── registrations/    # GET, POST
│   │       ├── generate-bracket/ # POST
│   │       ├── bracket/          # GET, PATCH
│   │       ├── publish-schedule/ # POST
│   │       ├── results/          # GET, POST
│   │       ├── send-announcement/# POST
│   │       └── archive/          # POST
│   │
│   ├── users/route.ts            # GET: List users
│   └── test-email/route.ts       # POST: Test email
│
└── me/
    ├── profile/route.ts          # GET: User profile
    ├── registrations/route.ts    # GET: User registrations
    └── update-profile/route.ts   # PATCH: Update profile
```

#### 8.3.2 Key API Endpoints

**Authentication APIs**
```
POST /api/auth/register
Body: { email, password, name, ign, phone }
Response: { success: true, user: {...} }

POST /api/auth/signin
Body: { email, password }
Response: { success: true, token: "..." }
```

**Tournament APIs**
```
GET /api/tournaments
Query: { status?, game?, limit?, page? }
Response: { tournaments: [...], total, page, pages }

GET /api/tournaments/[slug]
Response: { tournament: {...} }

POST /api/tournaments/[slug]/register
Body: { entryType, team: {...} | solo: {...} }
Response: { success: true, registration: {...} }
```

**Bracket APIs**
```
GET /api/brackets/[bracketId]
Response: { bracket: {...}, matches: [...] }

POST /api/brackets/[bracketId]/resolve-result
Body: { matchId, scoreA, scoreB }
Response: { success: true, match: {...} }
```

**Admin APIs**
```
POST /api/admin/tournaments
Body: { name, game, format, entryType, ... }
Response: { success: true, tournament: {...} }

POST /api/admin/tournaments/[id]/generate-bracket
Body: { seedingMethod, bracketFormat }
Response: { success: true, bracket: {...} }

POST /api/admin/tournaments/[id]/send-announcement
Body: { title, message }
Response: { success: true, sent: 32 }
```

### 8.4 UI/UX Design

#### 8.4.1 Design Principles

1. **Simplicity**: Clean, uncluttered interface
2. **Consistency**: Uniform design language across pages
3. **Responsiveness**: Mobile-first approach
4. **Accessibility**: WCAG 2.1 Level AA compliance
5. **Performance**: Fast loading, smooth animations
6. **Feedback**: Clear loading states and error messages

#### 8.4.2 Color Scheme
```
Primary Colors:
- Primary Blue: #4F46E5 (Indigo-600)
- Primary Hover: #4338CA (Indigo-700)
- Success Green: #10B981 (Emerald-500)
- Error Red: #EF4444 (Red-500)
- Warning Orange: #F59E0B (Amber-500)

Neutral Colors:
- Background: #09090B (Zinc-950)
- Surface: #18181B (Zinc-900)
- Border: #27272A (Zinc-800)
- Text Primary: #FAFAFA (Zinc-50)
- Text Secondary: #A1A1AA (Zinc-400)
```

#### 8.4.3 Typography
```
Font Family:
- Sans: Geist Sans (Primary)
- Mono: Geist Mono (Code, IDs)

Font Sizes:
- Heading 1: 3rem (48px)
- Heading 2: 2.25rem (36px)
- Heading 3: 1.875rem (30px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)
- Tiny: 0.75rem (12px)
```

#### 8.4.4 Component Library

**Button Variants:**
- Primary: Indigo background, white text
- Secondary: Transparent with border
- Danger: Red background
- Ghost: No background, hover effect

**Form Components:**
- Text Input: Dark background, border on focus
- Select: Dropdown with search
- Checkbox: Custom styled
- Radio: Custom styled
- File Upload: Drag & drop support

**Feedback Components:**
- Toast: Top-right notifications
- Modal: Centered overlay
- Loading: Spinner with text
- Progress Bar: Linear indicator

---
