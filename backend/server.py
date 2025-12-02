from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 72

# Security
security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ORPHANAGE_ADMIN = "ORPHANAGE_ADMIN"
    DONOR = "DONOR"

class OrphanageType(str, Enum):
    BOYS_ONLY = "BOYS_ONLY"
    GIRLS_ONLY = "GIRLS_ONLY"
    MIXED = "MIXED"

class VerificationStatus(str, Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class DonationCategory(str, Enum):
    MEALS = "MEALS"
    EDUCATION = "EDUCATION"
    HEALTHCARE = "HEALTHCARE"
    CLOTHES = "CLOTHES"
    INFRASTRUCTURE = "INFRASTRUCTURE"
    OTHER = "OTHER"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

# Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    country: Optional[str] = "India"
    city: Optional[str] = None
    role: UserRole = UserRole.DONOR
    profile_picture: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    country: str = "India"
    city: Optional[str] = None
    role: UserRole
    profile_picture: Optional[str] = None
    orphanage_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str
    country: str
    city: Optional[str]
    role: UserRole
    profile_picture: Optional[str]
    orphanage_id: Optional[str]

class OrphanageCreate(BaseModel):
    name: str
    description: str
    registration_number: str
    ngo_id: Optional[str] = None
    contact_person: str
    email: EmailStr
    phone: str
    address: str
    city: str
    state: str
    type: OrphanageType
    logo: Optional[str] = None
    cover_image: Optional[str] = None
    mission: Optional[str] = None

class Orphanage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    description: str
    registration_number: str
    ngo_id: Optional[str] = None
    contact_person: str
    email: EmailStr
    phone: str
    address: str
    city: str
    state: str
    type: OrphanageType
    verification_status: VerificationStatus = VerificationStatus.PENDING
    logo: Optional[str] = None
    cover_image: Optional[str] = None
    gallery: List[str] = []
    mission: Optional[str] = None
    bank_account: Optional[str] = None
    per_day_meal_cost: float = 50.0
    per_month_education_cost: float = 1500.0
    per_month_healthcare_cost: float = 1000.0
    total_children: int = 0
    total_donations: float = 0.0
    monthly_targets: Dict[str, float] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChildCreate(BaseModel):
    name: str
    age: int
    gender: str
    class_grade: Optional[str] = None
    bio: Optional[str] = None
    special_needs: Optional[str] = None
    photo: Optional[str] = None

class Child(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    orphanage_id: str
    name: str
    age: int
    gender: str
    class_grade: Optional[str] = None
    bio: Optional[str] = None
    special_needs: Optional[str] = None
    photo: Optional[str] = None
    admission_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StaffCreate(BaseModel):
    name: str
    role: str
    contact: str
    bio: Optional[str] = None
    is_donation_contact: bool = False

class Staff(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    orphanage_id: str
    name: str
    role: str
    contact: str
    bio: Optional[str] = None
    is_donation_contact: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DonationCreate(BaseModel):
    orphanage_id: str
    amount: float
    breakdown: Dict[str, float]
    message: Optional[str] = None
    is_anonymous: bool = False
    donor_name: Optional[str] = None

class Donation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    donor_id: str
    orphanage_id: str
    amount: float
    breakdown: Dict[str, float]
    message: Optional[str] = None
    is_anonymous: bool = False
    donor_name: Optional[str] = None
    payment_status: PaymentStatus = PaymentStatus.COMPLETED
    gateway_reference: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    token = credentials.credentials
    payload = verify_token(token)
    user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def create_slug(name: str) -> str:
    return name.lower().replace(" ", "-").replace("'", "").replace('"', "")

# Auth Routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(user_data.password)
    user_dict = user_data.model_dump()
    user_dict.pop('password')
    
    user = User(**user_dict)
    doc = user.model_dump()
    doc['password_hash'] = hashed_pw
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    
    token = create_token(user.id, user.role)
    return {"token": token, "user": UserResponse(**user.model_dump())}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['role'])
    user.pop('password_hash', None)
    return {"token": token, "user": user}

@api_router.get("/auth/me")
async def get_me(current_user: Dict = Depends(get_current_user)):
    current_user.pop('password_hash', None)
    return current_user

# Public Orphanage Routes
@api_router.get("/orphanages")
async def get_orphanages(city: Optional[str] = None, state: Optional[str] = None, 
                         type: Optional[OrphanageType] = None, 
                         verified: Optional[bool] = None, search: Optional[str] = None):
    query = {}
    if city:
        query['city'] = city
    if state:
        query['state'] = state
    if type:
        query['type'] = type
    if verified is not None:
        query['verification_status'] = VerificationStatus.VERIFIED if verified else VerificationStatus.PENDING
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'city': {'$regex': search, '$options': 'i'}},
            {'state': {'$regex': search, '$options': 'i'}}
        ]
    
    orphanages = await db.orphanages.find(query, {"_id": 0}).to_list(100)
    return orphanages

@api_router.get("/orphanages/{slug}")
async def get_orphanage_by_slug(slug: str):
    orphanage = await db.orphanages.find_one({"slug": slug}, {"_id": 0})
    if not orphanage:
        raise HTTPException(status_code=404, detail="Orphanage not found")
    return orphanage

# Donation Routes
@api_router.post("/donations/create")
async def create_donation(donation_data: DonationCreate, current_user: Dict = Depends(get_current_user)):
    orphanage = await db.orphanages.find_one({"id": donation_data.orphanage_id}, {"_id": 0})
    if not orphanage:
        raise HTTPException(status_code=404, detail="Orphanage not found")
    
    donation = Donation(
        donor_id=current_user['id'],
        **donation_data.model_dump()
    )
    
    doc = donation.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['gateway_reference'] = f"MOCK_{uuid.uuid4()}"
    
    await db.donations.insert_one(doc)
    
    # Update orphanage stats
    await db.orphanages.update_one(
        {"id": donation_data.orphanage_id},
        {"$inc": {"total_donations": donation_data.amount}}
    )
    
    return donation

@api_router.get("/donations/my")
async def get_my_donations(current_user: Dict = Depends(get_current_user)):
    donations = await db.donations.find({"donor_id": current_user['id']}, {"_id": 0}).to_list(1000)
    
    for donation in donations:
        orphanage = await db.orphanages.find_one({"id": donation['orphanage_id']}, {"_id": 0, "name": 1, "logo": 1})
        donation['orphanage_name'] = orphanage.get('name', 'Unknown') if orphanage else 'Unknown'
        donation['orphanage_logo'] = orphanage.get('logo') if orphanage else None
    
    return donations

@api_router.get("/donations/{donation_id}/receipt")
async def get_donation_receipt(donation_id: str, current_user: Dict = Depends(get_current_user)):
    donation = await db.donations.find_one({"id": donation_id}, {"_id": 0})
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    if donation['donor_id'] != current_user['id'] and current_user['role'] not in [UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    orphanage = await db.orphanages.find_one({"id": donation['orphanage_id']}, {"_id": 0})
    
    return {
        "donation": donation,
        "donor": {"name": current_user['name'], "email": current_user['email']},
        "orphanage": orphanage
    }

# Orphanage Admin Routes
@api_router.post("/orphanages")
async def create_orphanage(orphanage_data: OrphanageCreate, current_user: Dict = Depends(get_current_user)):
    if current_user['role'] not in [UserRole.SUPER_ADMIN, UserRole.ORPHANAGE_ADMIN]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    slug = create_slug(orphanage_data.name)
    existing = await db.orphanages.find_one({"slug": slug}, {"_id": 0})
    if existing:
        slug = f"{slug}-{str(uuid.uuid4())[:8]}"
    
    orphanage = Orphanage(slug=slug, **orphanage_data.model_dump())
    doc = orphanage.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.orphanages.insert_one(doc)
    
    # Update user with orphanage_id if they're an orphanage admin
    if current_user['role'] == UserRole.ORPHANAGE_ADMIN:
        await db.users.update_one({"id": current_user['id']}, {"$set": {"orphanage_id": orphanage.id}})
    
    return orphanage

@api_router.put("/orphanages/{orphanage_id}")
async def update_orphanage(orphanage_id: str, updates: Dict[str, Any], current_user: Dict = Depends(get_current_user)):
    if current_user['role'] == UserRole.ORPHANAGE_ADMIN and current_user.get('orphanage_id') != orphanage_id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user['role'] == UserRole.DONOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.orphanages.update_one({"id": orphanage_id}, {"$set": updates})
    orphanage = await db.orphanages.find_one({"id": orphanage_id}, {"_id": 0})
    return orphanage

@api_router.get("/orphanages/{orphanage_id}/children")
async def get_children(orphanage_id: str):
    children = await db.children.find({"orphanage_id": orphanage_id}, {"_id": 0}).to_list(1000)
    return children

@api_router.post("/orphanages/{orphanage_id}/children")
async def add_child(orphanage_id: str, child_data: ChildCreate, current_user: Dict = Depends(get_current_user)):
    if current_user['role'] == UserRole.ORPHANAGE_ADMIN and current_user.get('orphanage_id') != orphanage_id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user['role'] == UserRole.DONOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    child = Child(orphanage_id=orphanage_id, **child_data.model_dump())
    doc = child.model_dump()
    doc['admission_date'] = doc['admission_date'].isoformat()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.children.insert_one(doc)
    await db.orphanages.update_one({"id": orphanage_id}, {"$inc": {"total_children": 1}})
    
    return child

@api_router.delete("/orphanages/{orphanage_id}/children/{child_id}")
async def delete_child(orphanage_id: str, child_id: str, current_user: Dict = Depends(get_current_user)):
    if current_user['role'] == UserRole.ORPHANAGE_ADMIN and current_user.get('orphanage_id') != orphanage_id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user['role'] == UserRole.DONOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.children.delete_one({"id": child_id, "orphanage_id": orphanage_id})
    if result.deleted_count:
        await db.orphanages.update_one({"id": orphanage_id}, {"$inc": {"total_children": -1}})
    return {"success": result.deleted_count > 0}

@api_router.get("/orphanages/{orphanage_id}/staff")
async def get_staff(orphanage_id: str):
    staff = await db.staff.find({"orphanage_id": orphanage_id}, {"_id": 0}).to_list(1000)
    return staff

@api_router.post("/orphanages/{orphanage_id}/staff")
async def add_staff(orphanage_id: str, staff_data: StaffCreate, current_user: Dict = Depends(get_current_user)):
    if current_user['role'] == UserRole.ORPHANAGE_ADMIN and current_user.get('orphanage_id') != orphanage_id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user['role'] == UserRole.DONOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    staff = Staff(orphanage_id=orphanage_id, **staff_data.model_dump())
    doc = staff.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.staff.insert_one(doc)
    return staff

@api_router.get("/orphanages/{orphanage_id}/donations")
async def get_orphanage_donations(orphanage_id: str, current_user: Dict = Depends(get_current_user)):
    if current_user['role'] == UserRole.ORPHANAGE_ADMIN and current_user.get('orphanage_id') != orphanage_id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user['role'] == UserRole.DONOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    donations = await db.donations.find({"orphanage_id": orphanage_id}, {"_id": 0}).to_list(1000)
    
    for donation in donations:
        if not donation.get('is_anonymous'):
            donor = await db.users.find_one({"id": donation['donor_id']}, {"_id": 0, "name": 1, "email": 1})
            donation['donor_name'] = donor.get('name', 'Anonymous') if donor else 'Anonymous'
        else:
            donation['donor_name'] = 'Anonymous'
    
    return donations

# Analytics Routes
@api_router.get("/analytics/orphanage/{orphanage_id}")
async def get_orphanage_analytics(orphanage_id: str, current_user: Dict = Depends(get_current_user)):
    if current_user['role'] == UserRole.ORPHANAGE_ADMIN and current_user.get('orphanage_id') != orphanage_id:
        raise HTTPException(status_code=403, detail="Access denied")
    if current_user['role'] == UserRole.DONOR:
        raise HTTPException(status_code=403, detail="Access denied")
    
    orphanage = await db.orphanages.find_one({"id": orphanage_id}, {"_id": 0})
    if not orphanage:
        raise HTTPException(status_code=404, detail="Orphanage not found")
    
    donations = await db.donations.find({"orphanage_id": orphanage_id}, {"_id": 0}).to_list(10000)
    
    # Calculate category-wise totals
    category_totals = {}
    for donation in donations:
        for category, amount in donation.get('breakdown', {}).items():
            category_totals[category] = category_totals.get(category, 0) + amount
    
    # Monthly donations
    now = datetime.now(timezone.utc)
    this_month = [d for d in donations if datetime.fromisoformat(d['created_at']).month == now.month]
    this_year = [d for d in donations if datetime.fromisoformat(d['created_at']).year == now.year]
    
    return {
        "total_donations": orphanage.get('total_donations', 0),
        "this_month": sum(d['amount'] for d in this_month),
        "this_year": sum(d['amount'] for d in this_year),
        "category_totals": category_totals,
        "total_donors": len(set(d['donor_id'] for d in donations)),
        "recent_donations": donations[-10:] if donations else []
    }

# Super Admin Routes
@api_router.get("/admin/orphanages")
async def admin_get_all_orphanages(current_user: Dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    orphanages = await db.orphanages.find({}, {"_id": 0}).to_list(1000)
    return orphanages

@api_router.put("/admin/orphanages/{orphanage_id}/verify")
async def verify_orphanage(orphanage_id: str, status: VerificationStatus, current_user: Dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.orphanages.update_one({"id": orphanage_id}, {"$set": {"verification_status": status}})
    return {"success": True}

@api_router.get("/admin/donations")
async def admin_get_all_donations(current_user: Dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    donations = await db.donations.find({}, {"_id": 0}).to_list(10000)
    return donations

@api_router.get("/analytics/platform")
async def get_platform_analytics(current_user: Dict = Depends(get_current_user)):
    if current_user['role'] != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    total_orphanages = await db.orphanages.count_documents({})
    verified = await db.orphanages.count_documents({"verification_status": VerificationStatus.VERIFIED})
    pending = await db.orphanages.count_documents({"verification_status": VerificationStatus.PENDING})
    
    donations = await db.donations.find({}, {"_id": 0}).to_list(100000)
    total_donations = sum(d['amount'] for d in donations)
    
    return {
        "total_orphanages": total_orphanages,
        "verified_orphanages": verified,
        "pending_orphanages": pending,
        "total_donations": total_donations,
        "total_donors": len(set(d['donor_id'] for d in donations)),
        "total_transactions": len(donations)
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()