### 8.5 Security Design

#### 8.5.1 Authentication Flow
```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. Login Request (email, password)
     ▼
┌─────────────────┐
│  NextAuth.js    │
│  Credentials    │
│  Provider       │
└────┬────────────┘
     │ 2. Hash password with bcrypt
     ▼
┌─────────────────┐
│  MongoDB        │
│  User Query     │
└────┬────────────┘
     │ 3. Compare hashed passwords
     ▼
┌─────────────────┐
│  NextAuth.js    │
│  JWT Generation │
└────┬────────────┘
     │ 4. Sign JWT with secret
     │ 5. Set httpOnly cookie
     ▼
┌──────────┐
│  Client  │
│  (Cookie)│
└──────────┘
```

#### 8.5.2 Authorization Middleware
```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Protected paths
  const token = await getUserToken(req);
  
  // Check authentication
  if (!isAuthenticated(token)) {
    return redirect('/login');
  }
  
  // Check admin access
  if (pathname.startsWith('/admin') && !isAdmin(token)) {
    return redirect('/unauthorized');
  }
  
  return NextResponse.next();
}
```

#### 8.5.3 Security Measures

1. **Password Security**
   - bcrypt hashing with 10 salt rounds
   - Minimum 8 characters required
   - No password stored in plain text

2. **Session Security**
   - JWT tokens with 30-day expiry
   - httpOnly cookies (not accessible via JavaScript)
   - Secure flag in production (HTTPS only)
   - CSRF protection built-in

3. **API Security**
   - Authentication required for protected routes
   - Role-based authorization
   - Input validation with Zod
   - Rate limiting (Vercel built-in)

4. **Database Security**
   - MongoDB Atlas with encryption at rest
   - TLS/SSL for data in transit
   - IP whitelist for database access
   - Automated backups

5. **Input Validation**
   - Client-side validation with Zod
   - Server-side validation on all inputs
   - Sanitization to prevent XSS
   - Parameterized queries to prevent injection

### 8.6 Bracket Generation Algorithm

#### 8.6.1 Single Elimination Algorithm
```
Algorithm: Generate Single Elimination Bracket

Input: participants[] (array of participant names)
Output: matches[] (array of match objects)

1. Calculate bracket size:
   - n = participants.length
   - nextPowerOf2 = 2^(ceil(log2(n)))
   - byesNeeded = nextPowerOf2 - n

2. Seed participants:
   - If seedingMethod == "random":
       shuffle(participants)
   - Else:
       keep registration order

3. Handle byes:
   - topSeeds = participants[0...byesNeeded]
   - bottomSeeds = participants[byesNeeded...n]
   
4. Generate Round 1:
   - numRound1Matches = bottomSeeds.length / 2
   - For i = 0 to numRound1Matches:
       match = {
         id: "W-R1-M" + (i+1),
         bracket: "W",
         round: 1,
         opponentA: bottomSeeds[i*2],
         opponentB: bottomSeeds[i*2+1],
         winnerto: "W-R2-M" + (i+1)
       }
       matches.push(match)

5. Generate Round 2 with byes:
   - For i = 0 to numRound1Matches:
       match = {
         id: "W-R2-M" + (i+1),
         bracket: "W",
         round: 2,
         opponentA: topSeeds[i],  // Bye team
         opponentB: { propagatedFrom: "W-R1-M" + (i+1) }
       }
       matches.push(match)
   
   - For remaining topSeeds:
       Create matches with both opponents as bye teams

6. Generate subsequent rounds:
   - currentRound = 3
   - matchesInRound = nextPowerOf2 / 4
   - While matchesInRound >= 1:
       For i = 0 to matchesInRound:
         match = {
           id: "W-R" + currentRound + "-M" + (i+1),
           bracket: "W",
           round: currentRound,
           opponentA: { propagatedFrom: prevMatch1 },
           opponentB: { propagatedFrom: prevMatch2 }
         }
         matches.push(match)
       currentRound++
       matchesInRound = matchesInRound / 2

7. Return matches
```

#### 8.6.2 Double Elimination Algorithm
```
Algorithm: Generate Double Elimination Bracket

Input: participants[] (array of participant names)
Output: matches[] (array of match objects)

1. Generate Winner Bracket:
   - Use Single Elimination algorithm
   - Set bracket = "W" for all matches
   - Set loserto for each match

2. Generate Loser Bracket:
   - Calculate loser bracket rounds
   - numLBRounds = (numWBRounds - 1) * 2
   
   - For each WB round:
       - Losers drop to LB
       - LB matches alternate between:
         a) Matches between WB losers
         b) Matches between LB winners and new WB losers
   
   - Example for 8 participants:
     WB R1 losers → LB R1
     LB R1 winners vs WB R2 losers → LB R2
     LB R2 winners vs WB R3 losers → LB R3
     LB R3 winner → Finals

3. Generate Finals:
   - match = {
       id: "F-R1-M1",
       bracket: "F",
       round: 1,
       opponentA: { propagatedFrom: "W-Final" },
       opponentB: { propagatedFrom: "L-Final" }
     }
   
   - If LB winner wins Finals:
       Create Grand Finals Reset match

4. Return matches
```

#### 8.6.3 Result Propagation Algorithm
```
Algorithm: Propagate Match Result

Input: matchId, scoreA, scoreB
Output: Updated bracket with propagated winner

1. Find match by matchId
2. Validate scores (non-negative integers)
3. Determine winner:
   - If scoreA > scoreB: winner = "A"
   - Else: winner = "B"

4. Update match:
   - match.scoreA = scoreA
   - match.scoreB = scoreB
   - match.winner = winner
   - match.finished = true

5. Propagate winner:
   - winnerLabel = winner == "A" ? match.opponentA.label : match.opponentB.label
   - nextMatchId = match.winnerto
   
   - If nextMatchId exists:
       nextMatch = findMatch(nextMatchId)
       
       - Determine slot in next match:
         If matchId ends with odd number:
           nextMatch.opponentA = { type: "team", label: winnerLabel }
         Else:
           nextMatch.opponentB = { type: "team", label: winnerLabel }

6. For Double Elimination:
   - loserLabel = winner == "A" ? match.opponentB.label : match.opponentA.label
   - loserMatchId = match.loserto
   
   - If loserMatchId exists:
       loserMatch = findMatch(loserMatchId)
       // Place loser in appropriate slot

7. Save updated bracket
8. Return success
```

### 8.7 Email Service Design

#### 8.7.1 Email Templates

**Registration Confirmation**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h2 style="color: #4F46E5;">Registration Received!</h2>
  <p>Hi {{userName}},</p>
  <p>Thank you for registering for <strong>{{tournamentName}}</strong>.</p>
  <p>Your registration is currently <strong>pending approval</strong>.</p>
  <a href="{{tournamentUrl}}" style="...">View Tournament</a>
</div>
```

**Registration Approval**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h2 style="color: #10B981;">Registration Approved! 🎉</h2>
  <p>Hi {{userName}},</p>
  <p>Your registration for <strong>{{tournamentName}}</strong> has been approved.</p>
  <ul>
    <li><strong>Tournament:</strong> {{tournamentName}}</li>
    <li><strong>Start Date:</strong> {{startDate}}</li>
    <li><strong>Status:</strong> ✅ Approved</li>
  </ul>
  <a href="{{tournamentUrl}}" style="...">View Tournament Details</a>
</div>
```

**Bracket Published**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px;">
  <h2 style="color: #4F46E5;">Tournament Bracket is Live! 🏆</h2>
  <p>Hi {{userName}},</p>
  <p>The bracket for <strong>{{tournamentName}}</strong> has been published!</p>
  <a href="{{bracketUrl}}" style="...">View Bracket</a>
</div>
```

#### 8.7.2 Email Service Flow
```
┌──────────────┐
│   Trigger    │ (Registration, Approval, etc.)
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Email Service   │
│  (emailService.ts)│
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Build Template  │ (HTML + Variables)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Nodemailer     │
│   (SMTP)         │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Gmail SMTP      │
│  (smtp.gmail.com)│
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Recipient      │
└──────────────────┘
```

---

## 9. LIMITATIONS & DRAWBACKS

### 9.1 Current Limitations

#### 9.1.1 Functional Limitations

1. **No Real-Time Updates**
   - Bracket updates require page refresh
   - No live match score updates
   - No real-time notifications
   - **Impact**: Users must manually refresh to see changes
   - **Workaround**: Implement polling or use Socket.IO (future)

2. **Limited Tournament Formats**
   - Only Single and Double Elimination fully implemented
   - Round Robin and Groups+Playoffs not yet supported
   - **Impact**: Cannot host certain tournament types
   - **Workaround**: Use external tools for other formats

3. **No Editable Registrations**
   - Players cannot edit registration after submission
   - Must contact admin for changes
   - **Impact**: Increased admin workload
   - **Workaround**: Admin can manually update in database

4. **Basic Scheduling**
   - No calendar integration
   - No automated reminders
   - No conflict detection
   - **Impact**: Manual coordination required
   - **Workaround**: Use external calendar tools

5. **Limited Analytics**
   - Basic statistics only
   - No advanced reporting
   - No data export (except manual)
   - **Impact**: Limited insights for organizers
   - **Workaround**: Manual data analysis

#### 9.1.2 Technical Limitations

1. **Serverless Cold Starts**
   - First request after inactivity may be slow (500ms)
   - **Impact**: Occasional slow initial page load
   - **Mitigation**: Vercel keeps functions warm for active sites

2. **Database Query Performance**
   - Complex aggregations can be slow
   - No caching layer implemented
   - **Impact**: Slower response for large datasets
   - **Mitigation**: Proper indexing, pagination

3. **File Upload**
   - No image upload for tournament covers
   - Must use external URLs
   - **Impact**: Less convenient for admins
   - **Workaround**: Use image hosting services

4. **Email Rate Limiting**
   - Gmail SMTP has daily limits (500 emails/day)
   - **Impact**: Cannot send to very large tournaments
   - **Workaround**: Use dedicated email service (SendGrid, etc.)

5. **No Offline Support**
   - Requires internet connection
   - No PWA offline capabilities
   - **Impact**: Cannot use without internet
   - **Workaround**: None currently

#### 9.1.3 Scalability Limitations

1. **Bracket Visualization**
   - Large brackets (64+ participants) are hard to view
   - No zoom/pan functionality
   - **Impact**: Poor UX for large tournaments
   - **Workaround**: Use external bracket viewers

2. **Concurrent Tournaments**
   - No limit enforced, but performance may degrade
   - **Impact**: Potential slowdown with many active tournaments
   - **Mitigation**: Proper indexing and query optimization

3. **Search Functionality**
   - Basic text search only
   - No advanced filters
   - **Impact**: Hard to find specific tournaments
   - **Workaround**: Use browser search

### 9.2 Known Issues

#### 9.2.1 Minor Bugs

1. **Bracket Connector Lines**
   - May misalign on window resize
   - **Severity**: Low (visual only)
   - **Workaround**: Refresh page

2. **Mobile Navigation**
   - Dropdown menu may overlap content
   - **Severity**: Low
   - **Workaround**: Scroll up before opening menu

3. **Form Validation**
   - Some edge cases not handled
   - **Severity**: Low
   - **Workaround**: Manual validation

#### 9.2.2 Browser Compatibility

1. **Internet Explorer**
   - Not supported (uses modern JavaScript)
   - **Impact**: IE users cannot access site
   - **Workaround**: Use modern browser

2. **Safari < 14**
   - Some CSS features may not work
   - **Impact**: Degraded visual experience
   - **Workaround**: Update Safari

### 9.3 Security Considerations

#### 9.3.1 Potential Vulnerabilities

1. **Rate Limiting**
   - No custom rate limiting implemented
   - Relies on Vercel's built-in protection
   - **Risk**: Potential API abuse
   - **Mitigation**: Vercel provides DDoS protection

2. **Input Validation**
   - Client-side validation can be bypassed
   - Server-side validation is primary defense
   - **Risk**: Malicious input
   - **Mitigation**: Zod validation on server

3. **Session Management**
   - JWT tokens valid for 30 days
   - No token revocation mechanism
   - **Risk**: Compromised tokens remain valid
   - **Mitigation**: Short expiry, secure storage

### 9.4 Performance Bottlenecks

1. **Large Bracket Rendering**
   - 64+ participant brackets are slow to render
   - Canvas drawing is CPU-intensive
   - **Impact**: Laggy UI on low-end devices
   - **Mitigation**: Debounced rendering, virtualization

2. **Database Queries**
   - Aggregation queries can be slow
   - No query result caching
   - **Impact**: Slower API responses
   - **Mitigation**: Proper indexing, pagination

3. **Image Loading**
   - External images may load slowly
   - No lazy loading implemented
   - **Impact**: Slower page loads
   - **Mitigation**: Use CDN, implement lazy loading

---

## 10. FUTURE ENHANCEMENT

### 10.1 Short-Term Enhancements (0-6 months)

#### 10.1.1 Real-Time Features
- **Socket.IO Integration**
  - Live bracket updates
  - Real-time match scores
  - Live notifications
  - Online user presence

- **Live Match Updates**
  - Score updates without refresh
  - Match status indicators
  - Live commentary support

#### 10.1.2 Enhanced Registration
- **Editable Registrations**
  - Allow players to edit before approval
  - Team member changes
  - Contact info updates

- **Registration Payments**
  - Integrate payment gateway (Razorpay/Stripe)
  - Entry fee collection
  - Automated refunds

- **Waitlist System**
  - Auto-fill from waitlist when spots open
  - Waitlist notifications

#### 10.1.3 Improved Communication
- **In-App Notifications**
  - Bell icon with notification count
  - Notification center
  - Mark as read functionality

- **Email Enhancements**
  - Scheduled emails
  - Email templates editor
  - Unsubscribe management

- **SMS Notifications**
  - Match reminders
  - Important announcements
  - Twilio integration

### 10.2 Medium-Term Enhancements (6-12 months)

#### 10.2.1 Advanced Tournament Features
- **Round Robin Support**
  - Full implementation
  - Standings calculation
  - Tiebreaker rules

- **Groups + Playoffs**
  - Group stage management
  - Playoff bracket generation
  - Seeding from group standings

- **Swiss System**
  - Pairing algorithm
  - Standings calculation
  - Tiebreakers

#### 10.2.2 Team Management
- **Team System**
  - Persistent teams across tournaments
  - Team profiles
  - Team rosters
  - Team statistics

- **Player Profiles**
  - Match history
  - Win/loss records
  - Achievements/badges
  - Player statistics

#### 10.2.3 Admin Tools
- **Advanced Analytics**
  - Tournament performance metrics
  - Player engagement analytics
  - Revenue reports (if payments enabled)
  - Custom reports

- **Bulk Operations**
  - Bulk registration approval
  - Bulk email sending
  - Bulk user management

- **Tournament Templates**
  - Save tournament as template
  - Quick tournament creation
  - Template library

#### 10.2.4 Enhanced Bracket Features
- **Bracket Customization**
  - Custom bracket colors
  - Team logos
  - Sponsor logos
  - Custom backgrounds

- **Bracket Export**
  - Export as image
  - Export as PDF
  - Share on social media

- **Seeding Options**
  - Manual seeding
  - Skill-based seeding
  - Regional seeding

### 10.3 Long-Term Enhancements (12+ months)

#### 10.3.1 Mobile Applications
- **Native Mobile Apps**
  - React Native iOS app
  - React Native Android app
  - Push notifications
  - Offline support

- **Progressive Web App (PWA)**
  - Installable web app
  - Offline functionality
  - Background sync

#### 10.3.2 AI & Machine Learning
- **AI-Powered Seeding**
  - Analyze player history
  - Predict match outcomes
  - Optimal bracket generation

- **Automated Scheduling**
  - Conflict detection
  - Optimal time slot selection
  - Venue allocation

- **Chatbot Support**
  - Answer common questions
  - Guide users through processes
  - 24/7 availability

#### 10.3.3 Integration & API
- **Public API**
  - RESTful API for third-party apps
  - API documentation
  - Rate limiting
  - API keys management

- **Streaming Integration**
  - Twitch integration
  - YouTube integration
  - Auto-update stream links

- **Discord Bot**
  - Tournament announcements
  - Match reminders
  - Results posting

#### 10.3.4 Advanced Features
- **Multi-Language Support**
  - Internationalization (i18n)
  - Multiple language options
  - RTL support

- **Custom Domains**
  - White-label solution
  - Custom branding
  - Multi-tenant architecture

- **Sponsorship Management**
  - Sponsor profiles
  - Sponsor logos on brackets
  - Sponsor analytics

---
