from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import sqlite3

# Auth Configuration
SECRET_KEY = "super_secret_welfareguard_key_for_hackathon"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Models
class UserCreate(BaseModel):
    username: str
    password: str
    role: str = 'citizen'

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

router = APIRouter()

@router.post("/api/signup", response_model=Token)
async def signup(user: UserCreate):
    conn = sqlite3.connect("welfare_db.sqlite")
    cursor = conn.cursor()
    
    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE username = ?", (user.username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_pw = get_password_hash(user.password)
    
    # Restrict role strictly to citizen or admin (and typically don't allow public generic signup for admin, but allowing for hackathon scope if specified)
    role = 'admin' if user.role == 'admin' else 'citizen'
    
    cursor.execute("INSERT INTO users (username, hashed_password, role) VALUES (?, ?, ?)", 
                   (user.username, hashed_pw, role))
    conn.commit()
    conn.close()
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": role}

@router.post("/api/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = sqlite3.connect("welfare_db.sqlite")
    cursor = conn.cursor()
    
    cursor.execute("SELECT username, hashed_password, role FROM users WHERE username = ?", (form_data.username,))
    user_row = cursor.fetchone()
    conn.close()
    
    if not user_row or not verify_password(form_data.password, user_row[1]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    role = user_row[2]
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_row[0], "role": role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": role}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None or role is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    return {"username": username, "role": role}

async def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized. Admin role required.")
    return current_user
