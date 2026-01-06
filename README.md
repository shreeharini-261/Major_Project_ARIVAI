# ARIVAI – AI-Powered Menstrual Wellness Companion

ARIVAI is an AI-powered menstrual wellness application designed to support menstrual health awareness through structured cycle tracking, symptom understanding, and phase-based wellness guidance.  
The system combines deterministic biological rules with AI-powered reasoning to deliver personalized, explainable, and non-diagnostic wellness insights.

ARIVAI is built as a privacy-respecting, full-stack web application and developed using an agile, sprint-based approach.

---

## Problem Statement

Most existing menstrual tracking applications are limited to logging dates and predicting periods. They lack personalization, context-awareness, and emotional intelligence.

Users experience diverse physical and emotional symptoms—such as cramps, fatigue, mood swings, and anxiety—that vary across menstrual phases. However, current platforms do not intelligently analyze these symptoms or provide phase-specific health, nutrition, and mindfulness guidance.

In addition, reproductive health topics such as PMS, pregnancy, and menopause remain underrepresented and are often not explained in a structured, trustworthy manner.

---

## Proposed Solution

ARIVAI acts as a personal menstrual wellness agent that goes beyond basic tracking.  
It adapts to each user’s menstrual phase and provides guidance using a combination of rule-based biological logic and AI-powered reasoning.

Key capabilities include:
- Phase-aware menstrual cycle tracking
- Symptom and mood interpretation
- Personalized wellness guidance
- Educational content on reproductive health
- AI-driven conversational support

Each user is associated with a persistent agent instance that remembers historical symptoms, moods, and cycle patterns to ensure continuity and personalization.

---

## Key Features

- Secure user registration and authentication
- Persistent menstrual profile management
- Menstrual cycle day calculation
- Phase identification:
  - Menstrual
  - Follicular
  - Ovulation
  - Luteal
- PMS window detection
- Next period prediction
- Calendar-based visualization
- Educational content access
- Foundation for AI-powered chat and daily advice

---

## Technical Architecture

ARIVAI follows a **Layered Monolithic Architecture with a Hybrid Backend**.

- The frontend handles user interaction and visualization.
- A Node.js backend manages APIs, authentication, and database access.
- A Python-based AI service handles agent logic and Gemini API integration.
- All components operate within a single logical system boundary to simplify deployment and maintenance during early development stages.

---

## Technology Stack

### Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Axios

### Backend
- Node.js
- Express.js
- Python (Flask)

### Database
- PostgreSQL
- Drizzle ORM (TypeScript)

### AI & External APIs
- Google Gemini API (AI reasoning and conversational agent)
- YouTube Data API (meditation and mindfulness content)
- Nutrition / Recipe APIs (planned)

### Authentication & Storage
- JWT-based authentication
- AWS S3 (extensible storage for future reports and exports)

---

## Menstrual Cycle Logic (Core System Rules)

### Cycle Day Calculation

### Phase Logic (Fixed Rule)
- Menstrual: Day 1–5
- Follicular: Day 6–12
- Ovulation: Day 13–15
- Luteal: Day 16–28



### Sprint-1 delivers:

-Persistent user profile management
-Core menstrual cycle logic
-Database-backed calculations
-Basic educational content

Future sprints introduce AI-powered personalization, memory-driven agents, and advanced wellness recommendations.