# ARIVAI - Menstrual Wellness Companion

An AI-powered menstrual wellness application featuring cycle tracking, personalized nutrition, meditation resources, and an AI chat companion.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js Express (proxy) + Python Flask (API)
- **Database**: PostgreSQL (Railway or local)
- **ORM**: Drizzle ORM (TypeScript) + SQLAlchemy (Python)

---

## Local Development Setup

### Prerequisites

- Node.js v20+
- Python 3.11+
- PostgreSQL database (Railway, local, or any PostgreSQL provider)

### 1. Clone and Navigate

```bash
git clone <your-repo-url>
cd version2
```

### 2. Install Dependencies

**Node.js dependencies:**
```bash
npm install
```

**Python dependencies:**
```bash
pip install flask flask-cors flask-jwt-extended flask-sqlalchemy bcrypt google-generativeai psycopg2-binary python-dotenv
```

### 3. Configure Environment Variables

Create a `.env` file in the `version2` directory:

```env
# PostgreSQL Database Connection
# Use the PUBLIC URL for external connections (Railway, Neon, etc.)
DATABASE_URL=postgresql://username:password@host:port/database

# For Railway specifically, use the public proxy URL:
# DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_HOST.proxy.rlwy.net:PORT/railway

# Session secret for JWT tokens
SESSION_SECRET=your-secure-secret-key-here

# Google Gemini API Key (optional - app works without it)
GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. Create Database Schema

**For a new database connection string:**

```bash
# Push the schema to your database
npm run db:push
```

This will create all the necessary tables:
- `users` - User accounts
- `sessions` - User sessions
- `cycles` - Menstrual cycle data
- `symptoms` - Symptom tracking
- `chat_history` - AI chat history
- `recipes` - Healthy recipes
- `meditation_videos` - Meditation content
- `educational_content` - Educational articles
- `favorites` - User favorites
- `user_onboarding` - Onboarding questionnaire data

### 5. Run the Application

**Development mode:**
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

**Production build:**
```bash
npm run build
npm run start
```

---

## Database Commands

### Push Schema to New Database
When you have a new database connection string:

```bash
# Update .env with your new DATABASE_URL
# Then run:
npm run db:push
```

### View Schema
The database schema is defined in `shared/schema.ts` using Drizzle ORM.

### Generate Migration (advanced)
```bash
npx drizzle-kit generate
```

---

## Project Structure

```
version2/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # React hooks
│   │   └── lib/         # Utilities
│   └── index.html
├── server/           # Express proxy server
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API routes (proxies to Flask)
│   └── db.ts         # Database connection
├── backend/          # Python Flask API
│   └── app.py        # Flask application
├── shared/           # Shared TypeScript types
│   └── schema.ts     # Drizzle ORM schema
├── .env              # Environment variables (create this)
├── .env.example      # Example environment file
├── package.json      # Node.js dependencies
├── pyproject.toml    # Python dependencies
└── drizzle.config.ts # Drizzle configuration
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret key for JWT tokens |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI features |

---

## Troubleshooting

### Database Connection Issues

1. **Railway Internal URL doesn't work**: Use the public proxy URL instead
2. **SSL required**: Add `?sslmode=require` to your DATABASE_URL
3. **Connection refused**: Check if your IP is whitelisted

### Flask Backend Errors

1. **Module not found**: Install Python dependencies with pip
2. **Port 5001 in use**: Check for other processes using the port

### Frontend Not Loading

1. **Ensure workflow is running**: Check if the dev server started
2. **Clear browser cache**: Hard refresh with Ctrl+Shift+R

---

## Features

- **Cycle Tracking**: Visual calendar with phase indicators
- **AI Chat Companion**: Personalized wellness advice
- **Phase-Based Nutrition**: Healthy recipes for each cycle phase
- **Meditation Resources**: Curated videos for relaxation
- **Educational Content**: Learn about reproductive health
- **Symptom Tracking**: Log and track symptoms over time

---

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
