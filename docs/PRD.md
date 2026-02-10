# Product Requirements Document (PRD)

## FPL Insight Scout

**Version**: 1.0.0
**Last Updated**: February 2026
**Product URL**: https://bettingproduct.ai
**Status**: Production

---

## 1. Executive Summary

### 1.1 Product Vision
FPL Insight Scout is an AI-powered scouting and analytics platform designed to help Fantasy Premier League (FPL) managers make data-driven decisions for transfers, captaincy, and squad optimization. The product leverages real-time FPL data combined with advanced AI to deliver personalized, actionable insights in an intuitive chat interface.

### 1.2 Target Audience
- **Primary**: Active FPL managers seeking competitive advantages through data analysis
- **Secondary**: Sports betting enthusiasts interested in football analytics
- **User Persona**: Tech-savvy football fans who manage FPL teams and want quick, intelligent scouting reports without manual data analysis

### 1.3 Business Objectives
1. Provide instant, AI-generated scouting reports for FPL decision-making
2. Reduce time spent on manual player research from hours to minutes
3. Deliver actionable insights based on current FPL season data
4. Build a scalable platform for 50+ concurrent users
5. Establish bettingproduct.ai as a trusted FPL analytics destination

### 1.4 Success Metrics
- **User Engagement**: Average session duration > 5 minutes
- **Performance**: First token response time < 2 seconds
- **Reliability**: 99.5% uptime on Vercel infrastructure
- **AI Quality**: User satisfaction with scouting report accuracy
- **Retention**: Repeat usage within 7-day window

---

## 2. Product Overview

### 2.1 Core Value Proposition
"Get instant, AI-powered FPL scouting reports with real-time player statistics, fixture analysis, and personalized transfer recommendations—all in a conversational interface."

### 2.2 Key Differentiators
- **Real-time FPL Data**: Direct integration with official Fantasy Premier League API
- **Streaming AI Responses**: Progressive output for fast perceived performance
- **Tool-Augmented AI**: Context-aware AI agent that can fetch player stats, fixtures, and top performers
- **Professional Markdown Reports**: Well-structured, exportable scouting reports
- **Multi-Channel Export**: Generate content variants for push notifications, social media, and email
- **Zero Setup**: No registration or authentication required (MVP phase)

---

## 3. Feature Requirements

### 3.1 Core Features (MVP - Current)

#### 3.1.1 Scout Chat (Primary Feature)
**Description**: Conversational AI interface for FPL scouting and analysis.

**User Stories**:
- As an FPL manager, I want to ask questions about specific players so I can evaluate transfer targets
- As an FPL manager, I want to get captaincy recommendations based on upcoming fixtures
- As an FPL manager, I want to see top performers by position to identify budget options

**Functional Requirements**:
- **FR-1.1**: Chat interface accepts natural language queries about FPL players, teams, and fixtures
- **FR-1.2**: AI agent has access to three tools:
  - `get_player_stats(name)`: Fetch detailed statistics for specific players
  - `get_top_players(position, limit)`: Get top performers filtered by GKP/DEF/MID/FWD
  - `get_fixtures(team)`: Retrieve upcoming fixtures with difficulty ratings
- **FR-1.3**: Responses streamed in real-time using Gemini 2.5-Flash model
- **FR-1.4**: Chat history persisted in UI during session
- **FR-1.5**: Reports rendered in Markdown format with proper formatting
- **FR-1.6**: "Add to Report" button appears on AI messages for saving insights
- **FR-1.7**: Complete reports saved to Supabase database with metadata

**Technical Requirements**:
- **TR-1.1**: Use Vercel Edge Functions for low-latency responses
- **TR-1.2**: Implement streaming using AI SDK's `streamText` function
- **TR-1.3**: Handle tool calls synchronously within AI workflow
- **TR-1.4**: Rate limit: 10 requests/minute per IP (future enhancement)

**Acceptance Criteria**:
- User can send message and receive streaming response within 2 seconds
- AI correctly identifies when to use tools based on query context
- Tool results integrated into final response naturally
- Reports display with proper Markdown formatting (headers, lists, bold)

---

#### 3.1.2 Message Builder (Content Generation)
**Description**: Collect and transform scouting insights into multi-channel marketing content.

**User Stories**:
- As a content creator, I want to save multiple scouting insights to build a comprehensive report
- As a marketer, I want to generate social media posts from FPL insights
- As an email marketer, I want to create email campaigns with FPL recommendations

**Functional Requirements**:
- **FR-2.1**: "Add to Report" button on chat messages adds content to builder
- **FR-2.2**: Builder displays all saved snippets with preview and remove option
- **FR-2.3**: Generate marketing variants for three channels:
  - **Push**: Concise notifications (≤150 characters)
  - **Social**: Engaging posts with emojis and #FPL hashtags
  - **Email**: Subject lines + structured body copy
- **FR-2.4**: "Copy All" button copies all reports to clipboard
- **FR-2.5**: Reports persist in browser localStorage across sessions
- **FR-2.6**: Generate creative image suggestions using Unsplash API
- **FR-2.7**: Clear all reports functionality

**Technical Requirements**:
- **TR-2.1**: Use localStorage for client-side persistence
- **TR-2.2**: Generate variants using Gemini API with specific prompt templates
- **TR-2.3**: Implement copy-to-clipboard using Navigator Clipboard API

**Acceptance Criteria**:
- Builder shows up to 100 saved snippets without performance degradation
- Generated variants maintain factual accuracy from source reports
- Social posts include 2-3 relevant emojis and #FPL hashtag
- Email subjects under 60 characters for mobile optimization

---

#### 3.1.3 Brand LLM (Content Customization)
**Description**: Upload and manage brand assets for future AI customization.

**User Stories**:
- As a brand manager, I want to upload logos and brand guidelines for consistent content
- As a marketer, I want to customize AI outputs to match brand voice

**Functional Requirements**:
- **FR-3.1**: Drag-and-drop file upload interface
- **FR-3.2**: Support for image files (PNG, JPG, SVG)
- **FR-3.3**: File preview thumbnails
- **FR-3.4**: Remove uploaded files functionality
- **FR-3.5**: Upload sections for different asset types (logos, images)

**Technical Requirements**:
- **TR-3.1**: Store files in browser (no backend storage in MVP)
- **TR-3.2**: Validate file types and sizes (max 5MB per file)
- **TR-3.3**: Display upload progress indicators

**Acceptance Criteria**:
- Users can upload up to 10 files per session
- Upload completes within 3 seconds for files under 2MB
- Clear error messages for unsupported file types

---

### 3.2 Infrastructure & Performance

#### 3.2.1 Database & Caching
**Requirements**:
- **FR-4.1**: Store scouting reports in PostgreSQL via Supabase
- **FR-4.2**: Cache player data to reduce API calls to FPL
- **FR-4.3**: Profiles table for multi-tenancy (future use)

**Database Schema**:
```sql
-- Profiles (linked to Supabase Auth)
- id: UUID (primary key)
- tenant_id: UUID (multi-tenancy support)
- full_name: String
- avatar_url: String (optional)
- updated_at: DateTime

-- Scouting Reports
- id: UUID (primary key)
- tenant_id: UUID
- created_by: UUID (foreign key to profiles)
- prompt: Text (original user query)
- report_text: Text (AI-generated report)
- metadata: JSON (tool calls, model info)
- created_at: DateTime

-- Player Cache
- fpl_id: Integer (primary key, FPL player ID)
- name: String
- team: String
- position: String (GKP/DEF/MID/FWD)
- data: JSON (full FPL stats)
- last_updated: DateTime
```

**Technical Requirements**:
- **TR-4.1**: Invalidate player cache after 6 hours
- **TR-4.2**: Use default tenant_id: `00000000-0000-0000-0000-000000000000` in MVP
- **TR-4.3**: Implement upsert logic for player cache updates

---

#### 3.2.2 External API Integration
**FPL API Integration**:
- **FR-5.1**: Fetch player statistics from `https://fantasy.premierleague.com/api/bootstrap-static/`
- **FR-5.2**: Retrieve fixtures from `https://fantasy.premierleague.com/api/fixtures/`
- **FR-5.3**: Handle API rate limits gracefully (FPL: ~10 req/min)
- **FR-5.4**: Implement retry logic with exponential backoff (3 retries max)

**Data Points Used**:
- Player stats: Name, team, position, total points, form, ICT index, expected goals/assists, price, ownership %
- Fixtures: Team, opponent, difficulty rating, kickoff time, game week

---

### 3.3 User Experience

#### 3.3.1 UI/UX Requirements
**Design System**:
- **FR-6.1**: Modern glassmorphism design with gradient backgrounds
- **FR-6.2**: Responsive layout (mobile-first approach)
- **FR-6.3**: Sticky "Add to Report" buttons on desktop (bottom-right)
- **FR-6.4**: Tab navigation between Scout Chat, Builder, Brand LLM
- **FR-6.5**: Dark mode color scheme optimized for readability

**Accessibility**:
- **FR-6.6**: WCAG 2.1 Level AA compliance (contrast ratios)
- **FR-6.7**: Keyboard navigation support
- **FR-6.8**: Screen reader compatible (ARIA labels)

**Performance**:
- **FR-6.9**: First Contentful Paint (FCP) < 1.5s
- **FR-6.10**: Time to Interactive (TTI) < 3s on 3G networks
- **FR-6.11**: Lazy load components (Message Builder, Brand LLM)

---

## 4. Technical Architecture

### 4.1 Technology Stack
**Frontend**:
- React 19.2.4 with TypeScript
- Vite 6.2.0 (build tool)
- Tailwind CSS 4.1.18
- react-markdown for Markdown rendering

**Backend/API**:
- Vercel Edge Functions (serverless)
- Google Gemini 2.5-Flash AI model
- AI SDK (@ai-sdk/google)
- Zod for validation

**Database**:
- PostgreSQL (Supabase-hosted)
- Prisma ORM 7.3.0
- Supabase client (@supabase/supabase-js)

**Deployment**:
- Vercel (production hosting)
- Domain: bettingproduct.ai
- Edge network for global CDN

### 4.2 Security Requirements
- **SR-1**: Store API keys in environment variables only
- **SR-2**: Pre-commit hook to scan for exposed secrets
- **SR-3**: Use HTTPS for all API communications
- **SR-4**: Implement CORS restrictions on API endpoints
- **SR-5**: Rate limiting on API routes (future)

---

## 5. User Flows

### 5.1 Primary User Flow: Get Player Recommendation
1. User lands on bettingproduct.ai (Scout Chat tab)
2. User types query: "Who should I captain this week?"
3. AI agent calls `get_top_players` tool to fetch form players
4. AI agent calls `get_fixtures` tool for upcoming matches
5. AI generates streaming response with analysis
6. User reads formatted Markdown report
7. User clicks "Add to Report" to save insight
8. [Optional] User switches to Message Builder tab
9. [Optional] User generates social media post
10. [Optional] User copies content to clipboard

### 5.2 Secondary User Flow: Research Specific Player
1. User asks: "Tell me about Haaland's stats"
2. AI calls `get_player_stats(name="Haaland")`
3. FPL API returns player data from cache or live API
4. AI formats stats into structured report
5. Report includes: form, price, ownership, expected stats
6. User saves report to Message Builder
7. User generates email variant for league mates

---

## 6. Future Enhancements (Post-MVP)

### 6.1 Phase 2 Features
**User Accounts & Authentication**:
- Supabase Auth integration
- Save chat history per user account
- Personalized recommendations based on user's FPL team

**Advanced Analytics**:
- Historical performance charts (last 5 gameweeks)
- Differential picks (low ownership, high potential)
- Fixture ticker analysis (next 3-5 gameweeks)

**Team Integration**:
- Import user's FPL team ID
- Auto-analyze current squad
- Transfer recommendations based on budget

### 6.2 Phase 3 Features
**Mobile App**:
- React Native app for iOS/Android
- Push notifications for price changes
- Offline mode for cached reports

**Premium Features**:
- Advanced AI models (Gemini Pro, Claude Opus)
- Custom scouting report templates
- Export to PDF
- API access for developers

**Gamification**:
- Track prediction accuracy
- Leaderboards for top scouts
- Badges for correct captaincy picks

---

## 7. Non-Functional Requirements

### 7.1 Performance
- **NFR-1**: Support 50+ concurrent users without degradation
- **NFR-2**: API response time (P95) < 3 seconds
- **NFR-3**: Streaming latency < 500ms for first token
- **NFR-4**: Database query time (P95) < 200ms

### 7.2 Scalability
- **NFR-5**: Horizontal scaling via Vercel Edge Functions
- **NFR-6**: Database connection pooling for high traffic
- **NFR-7**: CDN caching for static assets (12-hour TTL)

### 7.3 Reliability
- **NFR-8**: 99.5% uptime SLA
- **NFR-9**: Graceful degradation if FPL API unavailable
- **NFR-10**: Error boundaries for React component failures
- **NFR-11**: Automated health checks every 5 minutes

### 7.4 Maintainability
- **NFR-12**: TypeScript strict mode enabled
- **NFR-13**: ESLint + Prettier for code consistency
- **NFR-14**: Unit test coverage > 60% (future)
- **NFR-15**: Comprehensive error logging (Sentry integration planned)

---

## 8. Assumptions & Dependencies

### 8.1 Assumptions
- FPL API remains publicly accessible without authentication
- Google Gemini API maintains current pricing and availability
- Vercel free tier supports current traffic volume
- Users have modern browsers (Chrome 90+, Firefox 88+, Safari 14+)

### 8.2 External Dependencies
- **Fantasy Premier League API**: Official data source (no SLA)
- **Google Gemini API**: AI model provider (99.9% uptime)
- **Supabase**: Database hosting (99.9% uptime)
- **Vercel**: Deployment platform (99.99% uptime)
- **Unsplash API**: Image suggestions (optional feature)

### 8.3 Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| FPL API downtime | High | Implement 6-hour cache, fallback messages |
| Gemini API rate limits | Medium | Queue system, user feedback on wait times |
| Database connection exhaustion | High | Connection pooling, auto-scaling |
| Vercel cost overruns | Low | Monitor usage, implement rate limiting |

---

## 9. Launch Criteria

### 9.1 MVP Launch Checklist
- [ ] All three core features functional (Chat, Builder, Brand LLM)
- [ ] Database schema deployed to production
- [ ] Environment variables configured in Vercel
- [ ] DNS configured for bettingproduct.ai
- [ ] SSL certificate active
- [ ] Error tracking implemented
- [ ] Performance metrics monitored
- [ ] Security scan passed (no exposed secrets)
- [ ] Mobile responsive design verified
- [ ] Cross-browser testing completed

### 9.2 Success Criteria (First 30 Days)
- 100+ unique visitors
- 500+ chat messages sent
- 50+ scouting reports saved
- 10+ repeat users (7-day window)
- Zero critical security incidents
- 99% uptime

---

## 10. Glossary

- **FPL**: Fantasy Premier League, official fantasy football game
- **GKP/DEF/MID/FWD**: Goalkeeper, Defender, Midfielder, Forward
- **ICT Index**: FPL metric combining Influence, Creativity, Threat
- **xG/xA**: Expected Goals, Expected Assists (predictive metrics)
- **FDR**: Fixture Difficulty Rating (1-5 scale)
- **Gameweek**: One round of FPL fixtures (38 per season)
- **Differential**: Low-ownership player with high potential
- **Captaincy**: FPL mechanic where chosen player scores 2x points

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Feb 2026 | Product Team | Initial PRD based on codebase analysis |

---

**Document Owner**: Product Team
**Stakeholders**: Engineering, Design, Marketing
**Review Cycle**: Quarterly

