# ARIVAI Project Setup

This project uses a Node.js Express server that proxies API requests to a Python Flask backend.

## Local Development (VS Code)

### Prerequisites
- Node.js (v20+)
- Python (3.11+)
- PostgreSQL Database (Railway)

### Setup Steps

1. **Clone the repository**
2. **Navigate to the project directory**:
   ```bash
   cd version2
   ```
3. **Install Node.js dependencies**:
   ```bash
   npm install
   ```
4. **Install Python dependencies**:
   ```bash
   pip install flask flask-cors flask-jwt-extended flask-sqlalchemy bcrypt google-generativeai psycopg2-binary python-dotenv
   ```
5. **Configure Environment Variables**:
   Create a `.env` file in the `version2` folder:
   ```env
   DATABASE_URL=postgresql://postgres:tWWicSbXdpeBpCsRDFkOUxEIMBXgjvOM@yamabiko.proxy.rlwy.net:13981/railway
   SESSION_SECRET=your_secret_key
   GEMINI_API_KEY=your_gemini_api_key (optional)
   ```
6. **Push Database Schema**:
   ```bash
   npm run db:push
   ```
7. **Run the Application**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5000`.

## Database Schema
The database schema is defined in `version2/shared/schema.ts` using Drizzle ORM. You can use this file to understand the table structure or generate SQL migrations.

## Project Structure
- `client/`: React frontend
- `backend/`: Flask API backend
- `server/`: Express proxy server
- `shared/`: Shared schema and types
