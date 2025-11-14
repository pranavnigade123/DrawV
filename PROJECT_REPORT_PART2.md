## 7. ANALYSIS REPORT

### 7.1 System Analysis

#### 7.1.1 Requirement Analysis

**Functional Requirements:**

1. **User Management**
   - FR1.1: System shall support user registration with email/password
   - FR1.2: System shall support OAuth authentication (Google, GitHub)
   - FR1.3: System shall implement role-based access control (Admin, Player, Guest)
   - FR1.4: System shall allow users to update their profiles
   - FR1.5: System shall maintain user session securely

2. **Tournament Management**
   - FR2.1: Admins shall create tournaments with configurable parameters
   - FR2.2: System shall support multiple tournament formats
   - FR2.3: System shall manage tournament lifecycle (Draft → Open → Ongoing → Completed)
   - FR2.4: System shall allow tournament editing before registration opens
   - FR2.5: System shall support tournament archiving

3. **Registration System**
   - FR3.1: Users shall register for tournaments (team or solo)
   - FR3.2: System shall validate registration data in real-time
   - FR3.3: System shall prevent duplicate registrations
   - FR3.4: Admins shall approve/reject registrations
   - FR3.5: System shall send email notifications for registration updates

4. **Bracket Management**
   - FR4.1: System shall generate brackets automatically from approved registrations
   - FR4.2: System shall support multiple seeding methods
   - FR4.3: System shall handle non-power-of-2 participant counts with byes
   - FR4.4: System shall propagate match results through bracket
   - FR4.5: Admins shall schedule matches with venue and time

5. **Results & Analytics**
   - FR5.1: System shall calculate standings from match results
   - FR5.2: System shall generate match history
   - FR5.3: System shall identify tournament champion
   - FR5.4: System shall publish results publicly
   - FR5.5: System shall provide admin analytics dashboard

**Non-Functional Requirements:**

1. **Performance**
   - NFR1.1: Page load time shall be <2 seconds
   - NFR1.2: API response time shall be <500ms
   - NFR1.3: Database queries shall be optimized with indexes
   - NFR1.4: System shall support 500+ concurrent users

2. **Security**
   - NFR2.1: Passwords shall be hashed using bcrypt
   - NFR2.2: API routes shall be protected with authentication
   - NFR2.3: Input validation shall prevent injection attacks
   - NFR2.4: Sessions shall expire after 30 days
   - NFR2.5: HTTPS shall be enforced in production

3. **Reliability**
   - NFR3.1: System uptime shall be >99%
   - NFR3.2: Database shall have automated backups
   - NFR3.3: Error handling shall prevent data loss
   - NFR3.4: System shall gracefully handle failures

4. **Usability**
   - NFR4.1: UI shall be responsive (mobile, tablet, desktop)
   - NFR4.2: Interface shall be intuitive with minimal training
   - NFR4.3: Error messages shall be clear and actionable
   - NFR4.4: System shall provide loading indicators

5. **Maintainability**
   - NFR5.1: Code shall follow TypeScript best practices
   - NFR5.2: Functions shall be modular and reusable
   - NFR5.3: API routes shall have consistent structure
   - NFR5.4: Database schema shall be well-documented

#### 7.1.2 Feasibility Analysis

**Technical Feasibility:**
- ✅ **Proven Technologies**: Next.js, React, MongoDB are mature and well-documented
- ✅ **Developer Expertise**: Team has experience with JavaScript/TypeScript
- ✅ **Infrastructure**: Vercel and MongoDB Atlas provide reliable hosting
- ✅ **Integration**: NextAuth.js simplifies multi-provider authentication
- ✅ **Scalability**: Serverless architecture scales automatically

**Economic Feasibility:**
- ✅ **Low Cost**: Free tiers available for development
- ✅ **Production Costs**: ~$25/month (MongoDB Atlas + Vercel Pro)
- ✅ **No Licensing**: All technologies are open-source or free
- ✅ **ROI**: Saves 9 hours per tournament × $20/hour = $180 per event

**Operational Feasibility:**
- ✅ **User Acceptance**: Positive feedback from Aarohan event
- ✅ **Training**: Minimal training required (intuitive UI)
- ✅ **Support**: Documentation and help resources available
- ✅ **Maintenance**: Automated deployment and monitoring

**Schedule Feasibility:**
- ✅ **Timeline**: 17 weeks is realistic for MVP
- ✅ **Milestones**: Clear phases with deliverables
- ✅ **Resources**: Team availability confirmed
- ✅ **Buffer**: 2-week buffer for unexpected issues

### 7.2 Data Flow Analysis

#### 7.2.1 User Authentication Flow
```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Login Request
       ▼
┌─────────────────────┐
│   Next.js Server    │
│  (API Route)        │
└──────┬──────────────┘
       │ 2. Validate Credentials
       ▼
┌─────────────────────┐
│   NextAuth.js       │
│  (Auth Provider)    │
└──────┬──────────────┘
       │ 3. Query User
       ▼
┌─────────────────────┐
│   MongoDB           │
│  (User Collection)  │
└──────┬──────────────┘
       │ 4. Return User Data
       ▼
┌─────────────────────┐
│   NextAuth.js       │
│  (Generate JWT)     │
└──────┬──────────────┘
       │ 5. Set Session Cookie
       ▼
┌─────────────┐
│   Browser   │
│  (Redirect) │
└─────────────┘
```

#### 7.2.2 Tournament Registration Flow
```
┌─────────────┐
│   Player    │
└──────┬──────┘
       │ 1. Fill Registration Form
       ▼
┌─────────────────────┐
│   React Component   │
│  (Client-side)      │
└──────┬──────────────┘
       │ 2. Validate with Zod
       ▼
┌─────────────────────┐
│   API Route         │
│  /api/tournaments/  │
│  [slug]/register    │
└──────┬──────────────┘
       │ 3. Check Duplicates
       ▼
┌─────────────────────┐
│   MongoDB           │
│  (Registration)     │
└──────┬──────────────┘
       │ 4. Create Registration
       ▼
┌─────────────────────┐
│   Email Service     │
│  (Nodemailer)       │
└──────┬──────────────┘
       │ 5. Send Confirmation
       ▼
┌─────────────┐
│   Player    │
│  (Email)    │
└─────────────┘
```

#### 7.2.3 Bracket Generation Flow
```
┌─────────────┐
│   Admin     │
└──────┬──────┘
       │ 1. Click "Generate Bracket"
       ▼
┌─────────────────────┐
│   API Route         │
│  /api/admin/        │
│  tournaments/[id]/  │
│  generate-bracket   │
└──────┬──────────────┘
       │ 2. Fetch Approved Registrations
       ▼
┌─────────────────────┐
│   MongoDB           │
│  (Registration)     │
└──────┬──────────────┘
       │ 3. Return Participants
       ▼
┌─────────────────────┐
│   Bracket Service   │
│  (Business Logic)   │
└──────┬──────────────┘
       │ 4. Seed Participants
       │ 5. Generate Skeleton
       ▼
┌─────────────────────┐
│   MongoDB           │
│  (Bracket)          │
└──────┬──────────────┘
       │ 6. Save Bracket
       ▼
┌─────────────────────┐
│   Tournament Model  │
│  (Update bracketId) │
└──────┬──────────────┘
       │ 7. Return Success
       ▼
┌─────────────┐
│   Admin     │
│  (View)     │
└─────────────┘
```

### 7.3 Use Case Analysis

#### 7.3.1 Use Case Diagram
```
                    ┌─────────────────────────────────────┐
                    │      DrawV System                   │
                    │                                     │
    ┌───────┐       │  ┌──────────────────────────┐      │
    │       │       │  │  User Management         │      │
    │ Guest ├───────┼─▶│  - Register              │      │
    │       │       │  │  - Login                 │      │
    └───────┘       │  │  - View Tournaments      │      │
                    │  └──────────────────────────┘      │
    ┌───────┐       │                                     │
    │       │       │  ┌──────────────────────────┐      │
    │Player ├───────┼─▶│  Tournament              │      │
    │       │       │  │  - Browse Tournaments    │      │
    └───┬───┘       │  │  - Register for Event    │      │
        │           │  │  - View Bracket          │      │
        │           │  │  - View Results          │      │
        │           │  │  - Use Public Tools      │      │
        │           │  └──────────────────────────┘      │
        │           │                                     │
        │           │  ┌──────────────────────────┐      │
        │           │  │  Dashboard               │      │
        └───────────┼─▶│  - View Registrations    │      │
                    │  │  - Update Profile        │      │
                    │  └──────────────────────────┘      │
                    │                                     │
    ┌───────┐       │  ┌──────────────────────────┐      │
    │       │       │  │  Admin Panel             │      │
    │ Admin ├───────┼─▶│  - Create Tournament     │      │
    │       │       │  │  - Manage Registrations  │      │
    └───────┘       │  │  - Generate Bracket      │      │
                    │  │  - Enter Results         │      │
                    │  │  - Send Announcements    │      │
                    │  │  - View Analytics        │      │
                    │  │  - Manage Users          │      │
                    │  └──────────────────────────┘      │
                    │                                     │
                    └─────────────────────────────────────┘
```

#### 7.3.2 Detailed Use Cases

**Use Case 1: Player Registration**
- **Actor**: Player (Authenticated User)
- **Precondition**: User is logged in, Tournament is open for registration
- **Main Flow**:
  1. Player navigates to tournament page
  2. Player clicks "Register" button
  3. System displays registration form
  4. Player fills in team/solo details
  5. System validates input in real-time
  6. Player submits form
  7. System checks for duplicate registrations
  8. System creates registration with "approved" status
  9. System sends confirmation email
  10. System displays success message
- **Postcondition**: Registration is created and player receives confirmation
- **Alternative Flow**: If duplicate found, show error and prevent submission

**Use Case 2: Generate Tournament Bracket**
- **Actor**: Admin
- **Precondition**: Tournament has approved registrations, Bracket not yet generated
- **Main Flow**:
  1. Admin navigates to tournament management page
  2. Admin clicks "Generate Bracket" button
  3. System displays seeding options
  4. Admin selects seeding method
  5. System fetches approved registrations
  6. System seeds participants
  7. System generates bracket skeleton
  8. System saves bracket to database
  9. System updates tournament with bracketId
  10. System displays generated bracket
- **Postcondition**: Bracket is generated and linked to tournament
- **Alternative Flow**: If <2 participants, show error

**Use Case 3: Update Match Result**
- **Actor**: Admin
- **Precondition**: Bracket is generated, Match exists
- **Main Flow**:
  1. Admin views bracket
  2. Admin enters scores for a match
  3. Admin clicks "Save Result"
  4. System validates scores
  5. System determines winner
  6. System marks match as finished
  7. System propagates winner to next match
  8. System updates bracket
  9. System displays updated bracket
- **Postcondition**: Match result is saved and bracket is updated
- **Alternative Flow**: If invalid scores, show error

### 7.4 Entity Relationship Analysis

#### 7.4.1 ER Diagram
```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ _id: ObjectId (PK)  │
│ email: String       │
│ password: String    │
│ name: String        │
│ role: Enum          │
│ ign: String         │
│ phone: String       │
│ createdAt: Date     │
└──────────┬──────────┘
           │
           │ 1:N (createdBy)
           │
           ▼
┌─────────────────────┐
│    Tournament       │
├─────────────────────┤
│ _id: ObjectId (PK)  │
│ name: String        │
│ slug: String (UK)   │
│ game: String        │
│ format: Enum        │
│ entryType: Enum     │
│ teamSize: Number    │
│ status: Enum        │
│ bracketId: String   │
│ bracketGenerated: B │
│ bracketPublished: B │
│ createdBy: ObjectId │
│ createdAt: Date     │
└──────────┬──────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────┐
│   Registration      │
├─────────────────────┤
│ _id: ObjectId (PK)  │
│ tournamentId: ObjId │
│ tournamentSlug: Str │
│ entryType: Enum     │
│ team: Object        │
│   - name: String    │
│   - leader: Object  │
│   - members: Array  │
│ solo: Object        │
│   - userId: ObjId   │
│   - ign: String     │
│ status: Enum        │
│ createdAt: Date     │
└─────────────────────┘

┌─────────────────────┐
│      Bracket        │
├─────────────────────┤
│ bracketId: Str (PK) │
│ tournamentId: Str   │
│ ownerId: ObjectId   │
│ format: Enum        │
│ participantsCount:N │
│ matches: Array      │
│   - id: String      │
│   - bracket: Enum   │
│   - round: Number   │
│   - opponentA: Obj  │
│   - opponentB: Obj  │
│   - scoreA: Number  │
│   - scoreB: Number  │
│   - winner: Enum    │
│   - finished: Bool  │
│ createdAt: Date     │
└─────────────────────┘
```

#### 7.4.2 Relationships

1. **User → Tournament** (1:N)
   - One user (admin) can create multiple tournaments
   - Relationship: `createdBy` field in Tournament

2. **Tournament → Registration** (1:N)
   - One tournament can have multiple registrations
   - Relationship: `tournamentId` field in Registration

3. **User → Registration** (1:N)
   - One user can register for multiple tournaments
   - Relationship: `team.leader.userId` or `solo.userId` in Registration

4. **Tournament → Bracket** (1:1)
   - One tournament has one bracket
   - Relationship: `bracketId` field in Tournament, `tournamentId` in Bracket

### 7.5 Process Analysis

#### 7.5.1 Tournament Lifecycle Process
```
┌─────────┐
│  START  │
└────┬────┘
     │
     ▼
┌─────────────────┐
│  Create Draft   │ ◄─── Admin creates tournament
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Configure      │ ◄─── Set game, format, dates, rules
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Publish        │ ◄─── Status: Draft → Open
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Registration   │ ◄─── Players register
│  Period         │      Admin approves/rejects
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Close Reg      │ ◄─── Registration deadline reached
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Generate       │ ◄─── Admin generates bracket
│  Bracket        │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Publish        │ ◄─── Admin publishes bracket
│  Bracket        │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Tournament     │ ◄─── Status: Open → Ongoing
│  Starts         │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Matches        │ ◄─── Admin enters results
│  Played         │      System propagates winners
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Calculate      │ ◄─── System calculates standings
│  Results        │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Publish        │ ◄─── Admin publishes results
│  Results        │      Status: Ongoing → Completed
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Archive        │ ◄─── Optional: Archive tournament
└────┬────────────┘
     │
     ▼
┌─────────┐
│   END   │
└─────────┘
```

---
