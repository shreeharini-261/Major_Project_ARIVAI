import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, date
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from flask_sqlalchemy import SQLAlchemy
import bcrypt
from google import genai
from functools import wraps
import subprocess
import threading

# Load environment variables from .env file (look in parent directory)
import pathlib
env_path = pathlib.Path(__file__).parent.parent / '.env'
load_dotenv(env_path)
print(f"[Flask] Loading .env from: {env_path}")
print(f"[Flask] GEMINI_API_KEY loaded: {'Yes' if os.environ.get('GEMINI_API_KEY') else 'No'}")

app = Flask(__name__, static_folder='../dist/public', static_url_path='')

CORS(app, supports_credentials=True, origins=["*"])

database_url = os.environ.get('DATABASE_URL')
# Explicitly check for internal railway hostname and override it
if not database_url or "postgres.railway.internal" in database_url:
    database_url = os.environ.get('DATABASE_PUBLIC_URL')

if not database_url:
    raise ValueError("No DATABASE_URL found in environment variables. Please check your .env file or secrets.")

# Ensure we use the correct driver for SQLAlchemy if it's a postgres:// URL
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('SESSION_SECRET', 'arivai-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

db = SQLAlchemy(app)
jwt = JWTManager(app)

gemini_api_key = os.environ.get('GEMINI_API_KEY')
gemini_client = None
if gemini_api_key:
    gemini_client = genai.Client(api_key=gemini_api_key)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    date_of_birth = db.Column(db.Date)
    avg_cycle_length = db.Column(db.Integer, default=28)
    avg_period_length = db.Column(db.Integer, default=5)
    profile_image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Cycle(db.Model):
    __tablename__ = 'cycles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)
    cycle_length = db.Column(db.Integer)
    period_length = db.Column(db.Integer)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Symptom(db.Model):
    __tablename__ = 'symptoms'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    cycle_id = db.Column(db.Integer, db.ForeignKey('cycles.id'))
    date = db.Column(db.Date, nullable=False)
    symptom_type = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.Integer, default=1)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ChatHistory(db.Model):
    __tablename__ = 'chat_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    content = db.Column(db.Text, nullable=False)
    cycle_phase = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Recipe(db.Model):
    __tablename__ = 'recipes'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    ingredients = db.Column(db.JSON)
    instructions = db.Column(db.Text)
    phase = db.Column(db.String(50))
    category = db.Column(db.String(100))
    prep_time = db.Column(db.Integer)
    calories = db.Column(db.Integer)

class MeditationVideo(db.Model):
    __tablename__ = 'meditation_videos'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    url = db.Column(db.String(500), nullable=False)
    thumbnail_url = db.Column(db.String(500))
    category = db.Column(db.String(100))
    duration_seconds = db.Column(db.Integer)
    phase = db.Column(db.String(50))

class EducationalContent(db.Model):
    __tablename__ = 'educational_content'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    summary = db.Column(db.Text)
    body = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100))
    phase = db.Column(db.String(50))
    image_url = db.Column(db.String(500))

class Favorite(db.Model):
    __tablename__ = 'favorites'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    item_type = db.Column(db.String(50), nullable=False)
    item_id = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserOnboarding(db.Model):
    __tablename__ = 'user_onboarding'
    id = db.Column(db.String(255), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    last_period_date = db.Column(db.Date)
    typical_cycle_length = db.Column(db.String(50))
    period_duration = db.Column(db.String(50))
    cycle_variability = db.Column(db.String(50))
    health_conditions = db.Column(db.JSON)
    fertility_tracking = db.Column(db.JSON)
    track_symptoms = db.Column(db.String(50))
    dynamic_predictions = db.Column(db.String(50))
    stress_level = db.Column(db.String(50))
    sleep_pattern = db.Column(db.String(50))
    health_notes = db.Column(db.Text)
    profile_mode = db.Column(db.String(50), default='regular')
    is_irregular = db.Column(db.Boolean, default=False)
    show_buffer_days = db.Column(db.Boolean, default=True)
    is_completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)


def calculate_cycle_day(last_period_start: date) -> int:
    today = date.today()
    return (today - last_period_start).days + 1

def get_phase(cycle_day: int, cycle_length: int = 28) -> str:
    if cycle_day <= 5:
        return "Menstrual"
    elif cycle_day <= 12:
        return "Follicular"
    ovulation_day = cycle_length - 14
    if ovulation_day - 1 <= cycle_day <= ovulation_day + 1:
        return "Ovulation"
    return "Luteal"

def calculate_ovulation_day(cycle_length: int = 28) -> int:
    return cycle_length - 14

def calculate_pms_window(cycle_length: int = 28) -> dict:
    return {
        "startDay": cycle_length - 7,
        "endDay": cycle_length - 1
    }

def calculate_next_period(last_period_start: date, cycle_length: int = 28) -> date:
    return last_period_start + timedelta(days=cycle_length)

def calculate_pregnancy(lmp: date) -> dict:
    today = date.today()
    days_pregnant = (today - lmp).days
    weeks = days_pregnant // 7
    days = days_pregnant % 7
    due_date = lmp + timedelta(days=280)
    
    if weeks < 14:
        trimester = 1
    elif weeks < 28:
        trimester = 2
    else:
        trimester = 3
    
    return {
        "isPregnant": True,
        "weeks": weeks,
        "days": days,
        "dueDate": due_date.isoformat(),
        "trimester": trimester
    }

def check_menopause(user_age: int, cycle_variations: list) -> dict:
    perimenopause_likely = False
    menopause = False
    
    if user_age >= 40 and len(cycle_variations) >= 2:
        max_variation = max(cycle_variations) - min(cycle_variations)
        if max_variation >= 7:
            perimenopause_likely = True
    
    return {
        "perimenopauseLikely": perimenopause_likely,
        "menopause": menopause
    }

def get_daily_advice(phase: str) -> dict:
    advice = {
        "Menstrual": {
            "mood": "Rest and be gentle with yourself. This is a time for reflection.",
            "nutrition": "Focus on warm foods, iron-rich meals, and stay hydrated.",
            "meditation": "Try gentle breathing exercises and restorative practices.",
            "exercise": "Low-intensity yoga, gentle walks, and stretching."
        },
        "Follicular": {
            "mood": "Energy is rising! Great time for new projects and creativity.",
            "nutrition": "High-energy foods, lean proteins, and fresh vegetables.",
            "meditation": "Light meditation to harness your growing energy.",
            "exercise": "Cardio, dance, or any high-energy activities you enjoy."
        },
        "Ovulation": {
            "mood": "Peak confidence and social energy. Perfect for important conversations.",
            "nutrition": "High-protein foods and antioxidant-rich fruits.",
            "meditation": "Confidence-boosting and grounding practices.",
            "exercise": "Strength training and high-intensity workouts."
        },
        "Luteal": {
            "mood": "Slow down and prepare for rest. Practice self-compassion.",
            "nutrition": "Magnesium-rich foods, complex carbs, and comfort foods in moderation.",
            "meditation": "Sleep meditation and stress-relief practices.",
            "exercise": "Slow yoga, swimming, and gentle movement."
        }
    }
    return advice.get(phase, advice["Follicular"])

def get_cycle_insights(user_id: int) -> dict:
    user = User.query.get(user_id)
    if not user:
        return None
    
    latest_cycle = Cycle.query.filter_by(user_id=user_id).order_by(Cycle.start_date.desc()).first()
    
    if not latest_cycle:
        return {
            "cycleDay": 1,
            "phase": "Follicular",
            "pmsWindow": calculate_pms_window(user.avg_cycle_length),
            "nextPeriodDate": None,
            "ovulationDay": calculate_ovulation_day(user.avg_cycle_length),
            "pregnancy": {"isPregnant": False},
            "menopause": {"perimenopauseLikely": False, "menopause": False},
            "dailyAdvice": get_daily_advice("Follicular")
        }
    
    cycle_day = calculate_cycle_day(latest_cycle.start_date)
    phase = get_phase(cycle_day, user.avg_cycle_length)
    
    user_age = 0
    if user.date_of_birth:
        user_age = (date.today() - user.date_of_birth).days // 365
    
    cycles = Cycle.query.filter_by(user_id=user_id).order_by(Cycle.start_date.desc()).limit(6).all()
    cycle_lengths = [c.cycle_length for c in cycles if c.cycle_length]
    
    return {
        "cycleDay": cycle_day,
        "phase": phase,
        "pmsWindow": calculate_pms_window(user.avg_cycle_length),
        "nextPeriodDate": calculate_next_period(latest_cycle.start_date, user.avg_cycle_length).isoformat(),
        "ovulationDay": calculate_ovulation_day(user.avg_cycle_length),
        "pregnancy": {"isPregnant": False},
        "menopause": check_menopause(user_age, cycle_lengths),
        "dailyAdvice": get_daily_advice(phase)
    }


@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 400
    
    password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    user = User(
        email=data['email'],
        password_hash=password_hash,
        first_name=data.get('firstName', ''),
        last_name=data.get('lastName', ''),
        avg_cycle_length=data.get('avgCycleLength', 28),
        avg_period_length=data.get('avgPeriodLength', 5)
    )
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        "message": "Registration successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name
        },
        "accessToken": access_token,
        "refreshToken": refresh_token
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({"error": "Invalid email or password"}), 401
    
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "avgCycleLength": user.avg_cycle_length,
            "avgPeriodLength": user.avg_period_length
        },
        "accessToken": access_token,
        "refreshToken": refresh_token
    })

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"accessToken": access_token})

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({"message": "Logout successful"})

@app.route('/api/auth/user', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    insights = get_cycle_insights(user_id)
    
    return jsonify({
        "id": user.id,
        "email": user.email,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "dateOfBirth": user.date_of_birth.isoformat() if user.date_of_birth else None,
        "avgCycleLength": user.avg_cycle_length,
        "avgPeriodLength": user.avg_period_length,
        "profileImageUrl": user.profile_image_url,
        "insights": insights
    })

@app.route('/api/user/profile', methods=['PATCH'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    
    if 'firstName' in data:
        user.first_name = data['firstName']
    if 'lastName' in data:
        user.last_name = data['lastName']
    if 'dateOfBirth' in data:
        user.date_of_birth = datetime.fromisoformat(data['dateOfBirth']).date() if data['dateOfBirth'] else None
    if 'avgCycleLength' in data:
        user.avg_cycle_length = data['avgCycleLength']
    if 'avgPeriodLength' in data:
        user.avg_period_length = data['avgPeriodLength']
    if 'profileImageUrl' in data:
        user.profile_image_url = data['profileImageUrl']
    
    db.session.commit()
    
    return jsonify({
        "id": user.id,
        "email": user.email,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "dateOfBirth": user.date_of_birth.isoformat() if user.date_of_birth else None,
        "avgCycleLength": user.avg_cycle_length,
        "avgPeriodLength": user.avg_period_length,
        "profileImageUrl": user.profile_image_url
    })


@app.route('/api/cycles', methods=['GET'])
@jwt_required()
def get_cycles():
    user_id = get_jwt_identity()
    cycles = Cycle.query.filter_by(user_id=user_id).order_by(Cycle.start_date.desc()).all()
    
    return jsonify([{
        "id": c.id,
        "startDate": c.start_date.isoformat(),
        "endDate": c.end_date.isoformat() if c.end_date else None,
        "cycleLength": c.cycle_length,
        "periodLength": c.period_length,
        "notes": c.notes
    } for c in cycles])

@app.route('/api/cycles', methods=['POST'])
@jwt_required()
def create_cycle():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    cycle = Cycle(
        user_id=user_id,
        start_date=datetime.fromisoformat(data['startDate']).date(),
        end_date=datetime.fromisoformat(data['endDate']).date() if data.get('endDate') else None,
        cycle_length=data.get('cycleLength'),
        period_length=data.get('periodLength'),
        notes=data.get('notes')
    )
    
    db.session.add(cycle)
    db.session.commit()
    
    return jsonify({
        "id": cycle.id,
        "startDate": cycle.start_date.isoformat(),
        "endDate": cycle.end_date.isoformat() if cycle.end_date else None,
        "cycleLength": cycle.cycle_length,
        "periodLength": cycle.period_length,
        "notes": cycle.notes
    }), 201

@app.route('/api/cycles/<int:cycle_id>', methods=['PUT'])
@jwt_required()
def update_cycle(cycle_id):
    user_id = get_jwt_identity()
    cycle = Cycle.query.filter_by(id=cycle_id, user_id=user_id).first()
    
    if not cycle:
        return jsonify({"error": "Cycle not found"}), 404
    
    data = request.get_json()
    
    if 'startDate' in data:
        cycle.start_date = datetime.fromisoformat(data['startDate']).date()
    if 'endDate' in data:
        cycle.end_date = datetime.fromisoformat(data['endDate']).date() if data['endDate'] else None
    if 'cycleLength' in data:
        cycle.cycle_length = data['cycleLength']
    if 'periodLength' in data:
        cycle.period_length = data['periodLength']
    if 'notes' in data:
        cycle.notes = data['notes']
    
    db.session.commit()
    
    return jsonify({
        "id": cycle.id,
        "startDate": cycle.start_date.isoformat(),
        "endDate": cycle.end_date.isoformat() if cycle.end_date else None,
        "cycleLength": cycle.cycle_length,
        "periodLength": cycle.period_length,
        "notes": cycle.notes
    })


@app.route('/api/symptoms', methods=['GET'])
@jwt_required()
def get_symptoms():
    user_id = get_jwt_identity()
    date_param = request.args.get('date')
    
    query = Symptom.query.filter_by(user_id=user_id)
    
    if date_param:
        query = query.filter_by(date=datetime.fromisoformat(date_param).date())
    
    symptoms = query.order_by(Symptom.date.desc()).all()
    
    return jsonify([{
        "id": s.id,
        "date": s.date.isoformat(),
        "symptomType": s.symptom_type,
        "severity": s.severity,
        "notes": s.notes
    } for s in symptoms])

@app.route('/api/symptoms', methods=['POST'])
@jwt_required()
def create_symptom():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    symptom = Symptom(
        user_id=user_id,
        date=datetime.fromisoformat(data['date']).date(),
        symptom_type=data['symptomType'],
        severity=data.get('severity', 1),
        notes=data.get('notes')
    )
    
    db.session.add(symptom)
    db.session.commit()
    
    return jsonify({
        "id": symptom.id,
        "date": symptom.date.isoformat(),
        "symptomType": symptom.symptom_type,
        "severity": symptom.severity,
        "notes": symptom.notes
    }), 201


@app.route('/api/chat', methods=['GET'])
@jwt_required()
def get_chat_history():
    user_id = get_jwt_identity()
    messages = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.created_at.asc()).all()
    
    return jsonify([{
        "id": m.id,
        "role": m.role,
        "content": m.content,
        "cyclePhase": m.cycle_phase,
        "createdAt": m.created_at.isoformat()
    } for m in messages])

ARIVAI_KNOWLEDGE_BASE = """
ARIVAI AI WELLNESS KNOWLEDGE BASE - CORE PRINCIPLES

WHAT ARIVAI CAN DO:
- Explain menstrual biology in clear, respectful language
- Help users understand normal vs commonly experienced symptoms
- Suggest non-medical, lifestyle-based wellness practices
- Offer nutrition, hydration, movement, and rest guidance
- Provide emotional reassurance and mental wellness support
- Encourage body awareness and self-observation
- Recommend seeing a doctor when symptoms fall outside normal ranges

WHAT ARIVAI MUST NEVER DO:
- Diagnose medical conditions
- Prescribe or suggest medicines, pills, hormones, supplements, or dosages
- Claim to cure or treat diseases
- Provide emergency or urgent medical advice
- Override or contradict a doctor's guidance

MENSTRUAL PHASE (Days 1-7):
- Common: Uterine cramping, lower back pain, fatigue, headache, emotional sensitivity
- Normal: Mild to moderate cramps, tiredness, needing more rest
- RED FLAGS (advise doctor): Pain stopping daily activities, bleeding >8 days, large clots, dizziness/fainting

FOLLICULAR PHASE (Post-period until ovulation):
- Common: Gradually increasing energy, improved mood and focus, motivation
- Supports learning, planning, and gentle physical activity

OVULATION PHASE (Mid-cycle):
- Common: Higher confidence, increased social energy, clear thinking, mild abdominal twinges

LUTEAL PHASE (Pre-menstrual):
- Common: Lower energy, food cravings, mood sensitivity, bloating, breast tenderness
- RED FLAG: Severe mood changes, intense depression, rage, or anxiety

NUTRITION GUIDANCE:
- Eat regular, balanced meals with whole foods
- Hydration is essential
- Avoid long fasting during menstruation
- Iron-rich: Spinach, beetroot, dates, lentils
- Magnesium (cramp support): Bananas, nuts, seeds, whole grains
- Anti-inflammatory: Turmeric, ginger, fruits, vegetables
- Limit during periods: Very salty foods, excess caffeine, highly processed sugary snacks
- NEVER shame food cravings - offer gentle balance, not restriction

SYMPTOM MANAGEMENT (Non-Medical Only):
- Cramps: Warm compress, gentle stretching/yoga, warm fluids, rest, slow breathing
- Fatigue: Rest, gentle movement, nutrient-dense meals, sleep consistency
- Bloating: Hydration, light movement, smaller frequent meals, avoid excess salt
- Mood: Normalize emotional shifts, journaling, breathing exercises, mindfulness, self-compassion

EXERCISE GUIDANCE:
- During menstruation: Rest is valid, light stretching or walking, avoid pushing through pain
- Other phases: Energy-based approach (more activity in follicular/ovulatory phases)
- NEVER pressure users to exercise

SPECIAL CONDITIONS:
- PCOS/Irregular Cycles: Avoid exact predictions, emphasize variability is common, focus on consistency
- Pregnancy: Do NOT provide cycle predictions or pregnancy health instructions, encourage prenatal care
- Perimenopause/Menopause: Normalize transition, offer lifestyle tips, encourage professional care

RED-FLAG SYMPTOMS (MUST ADVISE MEDICAL CONSULTATION):
- Severe pain disrupting daily life
- Sudden changes in cycle patterns
- Extremely heavy bleeding
- Missed periods not explained by pregnancy/menopause
- Persistent sadness, anxiety, or emotional distress

EMOTIONAL SAFETY:
- Never invalidate user experiences
- Never minimize pain or distress
- Use empathetic language
- Avoid absolutes ("always", "never")

MANDATORY DISCLAIMER (include when relevant):
"I can't provide medical advice or suggest medication. If this symptom feels unusual, severe, or persistent, it's important to consult a qualified healthcare professional."
"""

@app.route('/api/chat', methods=['POST'])
@jwt_required()
def send_chat_message():
    user_id = get_jwt_identity()
    data = request.get_json()
    user_message = data.get('content', '') or data.get('message', '')
    
    insights = get_cycle_insights(user_id)
    phase = insights.get('phase', 'Follicular') if insights else 'Follicular'
    
    import uuid
    user_chat = ChatHistory(
        id=str(uuid.uuid4()),
        user_id=user_id,
        role='user',
        content=user_message,
        cycle_phase=phase
    )
    db.session.add(user_chat)
    
    current_api_key = os.environ.get('GEMINI_API_KEY')
    print(f"[Chat] GEMINI_API_KEY available: {bool(current_api_key)}")
    
    try:
        if current_api_key:
            print("[Chat] Calling Gemini API...")
            client = genai.Client(api_key=current_api_key)
            
            recent_messages = ChatHistory.query.filter_by(user_id=user_id).order_by(ChatHistory.created_at.desc()).limit(10).all()
            recent_messages.reverse()
            
            conversation_history = ""
            for msg in recent_messages:
                role = "User" if msg.role == "user" else "ARIVAI"
                conversation_history += f"{role}: {msg.content}\n"
            
            system_prompt = f"""You are ARIVAI, a warm, empathetic AI wellness companion specializing in menstrual health and women's wellness.

{ARIVAI_KNOWLEDGE_BASE}

CURRENT USER CONTEXT:
- Current cycle phase: {phase}
- Cycle insights: {insights}

RESPONSE GUIDELINES:
1. Answer the user's question directly and conversationally, like a knowledgeable friend
2. Be warm, supportive, and non-judgmental
3. Provide helpful, actionable information when appropriate
4. Do NOT format responses with structured sections like "Nutrition:", "Meditation:" unless specifically asked
5. Keep responses natural and flowing, not like a checklist
6. If the question is outside menstrual wellness, you can still help with general health and lifestyle topics
7. Include the medical disclaimer ONLY when discussing symptoms that could be concerning

RECENT CONVERSATION:
{conversation_history}

User: {user_message}

Respond naturally and helpfully:"""
            
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=system_prompt
            )
            ai_response = response.text
            print(f"[Chat] Gemini response received: {len(ai_response)} chars")
        else:
            print("[Chat] No API key, using fallback")
            ai_response = get_fallback_response(phase, user_message)
    except Exception as e:
        print(f"[Chat] Gemini API error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        ai_response = get_fallback_response(phase, user_message)
    
    assistant_chat = ChatHistory(
        id=str(uuid.uuid4()),
        user_id=user_id,
        role='assistant',
        content=ai_response,
        cycle_phase=phase
    )
    db.session.add(assistant_chat)
    db.session.commit()
    
    return jsonify({
        "message": ai_response,
        "phase": phase
    })

def get_fallback_response(phase: str, message: str) -> str:
    advice = get_daily_advice(phase)
    return f"""I'm here to support you during your {phase} phase! 

{advice['mood']}

For nutrition today: {advice['nutrition']}

For exercise: {advice['exercise']}

Is there something specific about your cycle or wellness I can help you with?"""


@app.route('/api/recipes', methods=['GET'])
@jwt_required()
def get_recipes():
    phase = request.args.get('phase')
    category = request.args.get('category')
    
    query = Recipe.query
    
    if phase:
        query = query.filter_by(phase=phase)
    if category:
        query = query.filter_by(category=category)
    
    recipes = query.all()
    
    if not recipes:
        recipes = get_default_recipes(phase)
        return jsonify(recipes)
    
    return jsonify([{
        "id": r.id,
        "title": r.title,
        "description": r.description,
        "imageUrl": r.image_url,
        "ingredients": r.ingredients,
        "instructions": r.instructions,
        "phase": r.phase,
        "category": r.category,
        "prepTime": r.prep_time,
        "calories": r.calories
    } for r in recipes])

def get_default_recipes(phase: str = None):
    default_recipes = [
        {
            "id": 1,
            "title": "Iron-Rich Spinach Smoothie",
            "description": "A nutritious smoothie packed with iron and vitamins, perfect during menstruation.",
            "imageUrl": "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400",
            "ingredients": ["spinach", "banana", "almond milk", "honey", "chia seeds"],
            "instructions": "Blend all ingredients until smooth. Serve chilled.",
            "phase": "Menstrual",
            "category": "Smoothie",
            "prepTime": 5,
            "calories": 180
        },
        {
            "id": 2,
            "title": "Energy Boost Quinoa Bowl",
            "description": "High-protein bowl to fuel your rising energy during the follicular phase.",
            "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
            "ingredients": ["quinoa", "chickpeas", "avocado", "tomatoes", "lemon dressing"],
            "instructions": "Cook quinoa. Top with chickpeas, avocado, and tomatoes. Drizzle with lemon dressing.",
            "phase": "Follicular",
            "category": "Bowl",
            "prepTime": 20,
            "calories": 420
        },
        {
            "id": 3,
            "title": "High-Protein Salmon Bowl",
            "description": "Omega-3 rich salmon bowl for peak ovulation energy.",
            "imageUrl": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
            "ingredients": ["salmon", "brown rice", "edamame", "cucumber", "sesame seeds"],
            "instructions": "Grill salmon. Serve over brown rice with edamame and cucumber. Top with sesame seeds.",
            "phase": "Ovulation",
            "category": "Bowl",
            "prepTime": 25,
            "calories": 480
        },
        {
            "id": 4,
            "title": "Magnesium-Rich Dark Chocolate Bites",
            "description": "Healthy chocolate treats to ease PMS symptoms during the luteal phase.",
            "imageUrl": "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400",
            "ingredients": ["dark chocolate", "almonds", "dried cranberries", "sea salt"],
            "instructions": "Melt chocolate. Mix in almonds and cranberries. Pour into molds and refrigerate.",
            "phase": "Luteal",
            "category": "Snack",
            "prepTime": 15,
            "calories": 150
        },
        {
            "id": 5,
            "title": "Warm Ginger Turmeric Tea",
            "description": "Anti-inflammatory tea to soothe cramps and reduce bloating.",
            "imageUrl": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400",
            "ingredients": ["ginger", "turmeric", "honey", "lemon", "black pepper"],
            "instructions": "Boil ginger and turmeric in water. Strain and add honey, lemon, and a pinch of black pepper.",
            "phase": "Menstrual",
            "category": "Beverage",
            "prepTime": 10,
            "calories": 30
        }
    ]
    
    if phase:
        return [r for r in default_recipes if r['phase'] == phase]
    return default_recipes


@app.route('/api/meditation-videos', methods=['GET'])
@jwt_required()
def get_meditation_videos():
    phase = request.args.get('phase')
    category = request.args.get('category')
    
    query = MeditationVideo.query
    
    if phase:
        query = query.filter_by(phase=phase)
    if category:
        query = query.filter_by(category=category)
    
    videos = query.all()
    
    if not videos:
        videos = get_default_meditation_videos(phase)
        return jsonify(videos)
    
    return jsonify([{
        "id": v.id,
        "title": v.title,
        "description": v.description,
        "url": v.url,
        "thumbnailUrl": v.thumbnail_url,
        "category": v.category,
        "durationSeconds": v.duration_seconds,
        "phase": v.phase
    } for v in videos])

def get_default_meditation_videos(phase: str = None):
    default_videos = [
        {
            "id": 1,
            "title": "Gentle Period Relief Meditation",
            "description": "A calming meditation to ease menstrual discomfort and promote relaxation.",
            "url": "https://www.youtube.com/watch?v=inpok4MKVLM",
            "thumbnailUrl": "https://img.youtube.com/vi/inpok4MKVLM/hqdefault.jpg",
            "category": "Pain Relief",
            "durationSeconds": 600,
            "phase": "Menstrual"
        },
        {
            "id": 2,
            "title": "Morning Energy Boost Yoga",
            "description": "Energizing yoga flow to match your rising energy in the follicular phase.",
            "url": "https://www.youtube.com/watch?v=UEEsdXn8oG8",
            "thumbnailUrl": "https://img.youtube.com/vi/UEEsdXn8oG8/hqdefault.jpg",
            "category": "Yoga",
            "durationSeconds": 1200,
            "phase": "Follicular"
        },
        {
            "id": 3,
            "title": "Confidence & Power Meditation",
            "description": "Build confidence during your peak energy ovulation phase.",
            "url": "https://www.youtube.com/watch?v=86m4RC_ADEY",
            "thumbnailUrl": "https://img.youtube.com/vi/86m4RC_ADEY/hqdefault.jpg",
            "category": "Confidence",
            "durationSeconds": 900,
            "phase": "Ovulation"
        },
        {
            "id": 4,
            "title": "PMS Relief & Sleep Meditation",
            "description": "Soothing meditation to ease PMS symptoms and prepare for restful sleep.",
            "url": "https://www.youtube.com/watch?v=aEqlQvczMJQ",
            "thumbnailUrl": "https://img.youtube.com/vi/aEqlQvczMJQ/hqdefault.jpg",
            "category": "Sleep",
            "durationSeconds": 1800,
            "phase": "Luteal"
        },
        {
            "id": 5,
            "title": "5-Minute Breathing Exercise",
            "description": "Quick breathing exercise for any time you need calm and focus.",
            "url": "https://www.youtube.com/watch?v=tybOi4hjZFQ",
            "thumbnailUrl": "https://img.youtube.com/vi/tybOi4hjZFQ/hqdefault.jpg",
            "category": "Breathing",
            "durationSeconds": 300,
            "phase": None
        }
    ]
    
    if phase:
        return [v for v in default_videos if v['phase'] == phase or v['phase'] is None]
    return default_videos


@app.route('/api/educational-content', methods=['GET'])
@jwt_required()
def get_educational_content():
    category = request.args.get('category')
    phase = request.args.get('phase')
    
    query = EducationalContent.query
    
    if category:
        query = query.filter_by(category=category)
    if phase:
        query = query.filter_by(phase=phase)
    
    content = query.all()
    
    if not content:
        content = get_default_educational_content(category)
        return jsonify(content)
    
    return jsonify([{
        "id": c.id,
        "title": c.title,
        "summary": c.summary,
        "body": c.body,
        "category": c.category,
        "phase": c.phase,
        "imageUrl": c.image_url
    } for c in content])

def get_default_educational_content(category: str = None):
    default_content = [
        {
            "id": 1,
            "title": "Understanding PMS",
            "summary": "Learn about premenstrual syndrome, its causes, symptoms, and management strategies.",
            "body": """Premenstrual syndrome (PMS) affects many women in the days leading up to their period. Common symptoms include mood swings, bloating, fatigue, and food cravings.

**Causes:**
- Hormonal changes during the menstrual cycle
- Chemical changes in the brain
- Lifestyle factors

**Management Tips:**
1. Regular exercise
2. Balanced diet rich in complex carbohydrates
3. Adequate sleep
4. Stress management techniques
5. Limiting caffeine and alcohol""",
            "category": "PMS",
            "phase": "Luteal",
            "imageUrl": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400"
        },
        {
            "id": 2,
            "title": "Pregnancy Planning Guide",
            "summary": "Essential information for those planning to conceive, including fertility tracking.",
            "body": """Planning for pregnancy involves understanding your fertile window and optimizing your health.

**Fertile Window:**
- Ovulation typically occurs 14 days before your next period
- The fertile window is usually 5 days before and 1 day after ovulation

**Pre-conception Health:**
1. Start taking folic acid supplements
2. Maintain a healthy weight
3. Avoid alcohol and smoking
4. Track your cycle to identify ovulation
5. Consult with a healthcare provider""",
            "category": "Pregnancy",
            "phase": "Ovulation",
            "imageUrl": "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400"
        },
        {
            "id": 3,
            "title": "Menopause: What to Expect",
            "summary": "A comprehensive guide to understanding perimenopause and menopause transitions.",
            "body": """Menopause marks the end of menstrual cycles and typically occurs in your late 40s to early 50s.

**Perimenopause Signs:**
- Irregular periods
- Hot flashes
- Sleep problems
- Mood changes

**Managing Symptoms:**
1. Stay cool and comfortable
2. Practice relaxation techniques
3. Maintain bone health with calcium and vitamin D
4. Stay physically active
5. Discuss hormone therapy options with your doctor""",
            "category": "Menopause",
            "phase": None,
            "imageUrl": "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=400"
        },
        {
            "id": 4,
            "title": "Sexual Wellness Basics",
            "summary": "Understanding sexual health, consent, and maintaining intimate wellness.",
            "body": """Sexual wellness is an important part of overall health and well-being.

**Key Topics:**
- Understanding consent and communication
- Safe sex practices
- Recognizing and treating infections
- Maintaining intimate health

**Healthy Practices:**
1. Regular health check-ups
2. Open communication with partners
3. Understanding your body
4. Addressing concerns with healthcare providers""",
            "category": "Sexual Wellness",
            "phase": None,
            "imageUrl": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400"
        }
    ]
    
    if category:
        return [c for c in default_content if c['category'] == category]
    return default_content


@app.route('/api/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    user_id = get_jwt_identity()
    item_type = request.args.get('type')
    
    query = Favorite.query.filter_by(user_id=user_id)
    
    if item_type:
        query = query.filter_by(item_type=item_type)
    
    favorites = query.all()
    
    return jsonify([{
        "id": f.id,
        "itemType": f.item_type,
        "itemId": f.item_id
    } for f in favorites])

@app.route('/api/favorites', methods=['POST'])
@jwt_required()
def add_favorite():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    existing = Favorite.query.filter_by(
        user_id=user_id,
        item_type=data['itemType'],
        item_id=data['itemId']
    ).first()
    
    if existing:
        return jsonify({"error": "Already in favorites"}), 400
    
    favorite = Favorite(
        user_id=user_id,
        item_type=data['itemType'],
        item_id=data['itemId']
    )
    
    db.session.add(favorite)
    db.session.commit()
    
    return jsonify({
        "id": favorite.id,
        "itemType": favorite.item_type,
        "itemId": favorite.item_id
    }), 201

@app.route('/api/favorites/<int:favorite_id>', methods=['DELETE'])
@jwt_required()
def remove_favorite(favorite_id):
    user_id = get_jwt_identity()
    favorite = Favorite.query.filter_by(id=favorite_id, user_id=user_id).first()
    
    if not favorite:
        return jsonify({"error": "Favorite not found"}), 404
    
    db.session.delete(favorite)
    db.session.commit()
    
    return jsonify({"message": "Favorite removed"})


@app.route('/api/insights', methods=['GET'])
@jwt_required()
def get_insights():
    user_id = get_jwt_identity()
    insights = get_cycle_insights(user_id)
    
    if not insights:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(insights)


@app.route('/api/onboarding', methods=['GET'])
@jwt_required()
def get_onboarding():
    user_id = get_jwt_identity()
    onboarding = UserOnboarding.query.filter_by(user_id=user_id).first()
    
    if not onboarding:
        return jsonify({"isCompleted": False})
    
    return jsonify({
        "id": onboarding.id,
        "userId": onboarding.user_id,
        "lastPeriodDate": onboarding.last_period_date.isoformat() if onboarding.last_period_date else None,
        "typicalCycleLength": onboarding.typical_cycle_length,
        "periodDuration": onboarding.period_duration,
        "cycleVariability": onboarding.cycle_variability,
        "healthConditions": onboarding.health_conditions or [],
        "fertilityTracking": onboarding.fertility_tracking or [],
        "trackSymptoms": onboarding.track_symptoms,
        "dynamicPredictions": onboarding.dynamic_predictions,
        "stressLevel": onboarding.stress_level,
        "sleepPattern": onboarding.sleep_pattern,
        "healthNotes": onboarding.health_notes,
        "profileMode": onboarding.profile_mode,
        "isIrregular": onboarding.is_irregular,
        "showBufferDays": onboarding.show_buffer_days,
        "isCompleted": onboarding.is_completed,
        "completedAt": onboarding.completed_at.isoformat() if onboarding.completed_at else None
    })


@app.route('/api/onboarding', methods=['POST'])
@jwt_required()
def save_onboarding():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    onboarding = UserOnboarding.query.filter_by(user_id=user_id).first()
    
    health_conditions = data.get('healthConditions') or []
    typical_cycle = data.get('typicalCycleLength', '')
    cycle_variability = data.get('cycleVariability', '')
    
    is_irregular = (
        cycle_variability in ['often', 'always_irregular'] or
        typical_cycle in ['irregular', '>40'] or
        'pcos' in health_conditions
    )
    
    profile_mode = 'regular'
    if 'pregnant_ttc' in health_conditions:
        profile_mode = 'ttc'
    elif 'menopause' in health_conditions:
        profile_mode = 'menopause'
    elif is_irregular:
        profile_mode = 'irregular'
    
    dynamic_pref = data.get('dynamicPredictions', 'yes')
    show_buffer = dynamic_pref != 'no'
    
    import uuid
    
    if not onboarding:
        onboarding = UserOnboarding(
            id=str(uuid.uuid4()),
            user_id=user_id
        )
        db.session.add(onboarding)
    
    last_period = data.get('lastPeriodDate')
    if last_period:
        try:
            onboarding.last_period_date = datetime.fromisoformat(last_period).date()
        except (ValueError, TypeError):
            onboarding.last_period_date = None
    
    onboarding.typical_cycle_length = typical_cycle
    onboarding.period_duration = data.get('periodDuration', '')
    onboarding.cycle_variability = cycle_variability
    onboarding.health_conditions = health_conditions
    onboarding.fertility_tracking = data.get('fertilityTracking') or []
    onboarding.track_symptoms = data.get('trackSymptoms', '')
    onboarding.dynamic_predictions = dynamic_pref
    onboarding.stress_level = data.get('stressLevel', '')
    onboarding.sleep_pattern = data.get('sleepPattern', '')
    onboarding.health_notes = data.get('healthNotes', '')
    onboarding.profile_mode = profile_mode
    onboarding.is_irregular = is_irregular
    onboarding.show_buffer_days = show_buffer
    onboarding.is_completed = True
    onboarding.completed_at = datetime.utcnow()
    onboarding.updated_at = datetime.utcnow()
    
    cycle_length_map = {
        '21-25': 23,
        '26-30': 28,
        '31-35': 33,
        '36-40': 38,
        '>40': 42,
        'irregular': 28,
        'unknown': 28
    }
    
    period_length_map = {
        '2-4': 3,
        '5-7': 5,
        '8+': 8,
        'irregular': 5
    }
    
    user = User.query.get(user_id)
    if user:
        user.avg_cycle_length = cycle_length_map.get(typical_cycle, 28)
        user.avg_period_length = period_length_map.get(data.get('periodDuration', ''), 5)
        
        if last_period:
            try:
                period_date = datetime.fromisoformat(last_period).date()
                existing_cycle = Cycle.query.filter_by(user_id=user_id).order_by(Cycle.start_date.desc()).first()
                if not existing_cycle or existing_cycle.start_date != period_date:
                    new_cycle = Cycle(
                        user_id=user_id,
                        start_date=period_date,
                        cycle_length=user.avg_cycle_length,
                        period_length=user.avg_period_length
                    )
                    db.session.add(new_cycle)
            except (ValueError, TypeError):
                pass
    
    db.session.commit()
    
    return jsonify({
        "message": "Onboarding completed successfully",
        "isCompleted": True,
        "profileMode": profile_mode,
        "isIrregular": is_irregular,
        "showBufferDays": show_buffer
    }), 201

@app.route('/api/pregnancy/calculate', methods=['POST'])
@jwt_required()
def calculate_pregnancy_info():
    data = request.get_json()
    lmp = datetime.fromisoformat(data['lmp']).date()
    pregnancy_info = calculate_pregnancy(lmp)
    return jsonify(pregnancy_info)


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "ARIVAI API"})


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    static_folder = app.static_folder
    if static_folder and os.path.exists(os.path.join(static_folder, path)):
        return send_from_directory(static_folder, path)
    if static_folder and os.path.exists(os.path.join(static_folder, 'index.html')):
        return send_from_directory(static_folder, 'index.html')
    return jsonify({"error": "Frontend not built. Run 'npm run build' first."}), 404


def run_vite_dev():
    subprocess.run(["npm", "run", "dev:frontend"], cwd=os.path.dirname(os.path.dirname(__file__)))


with app.app_context():
    db.create_all()

if __name__ == '__main__':
    is_dev = os.environ.get('NODE_ENV') == 'development'
    app.run(host='0.0.0.0', port=5001, debug=is_dev)
