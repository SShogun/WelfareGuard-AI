import os
import json
import sqlite3
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
from celery import Celery

import auth
import stats

app = FastAPI(title="WelfareGuard AI Main API")

def init_db():
    conn = sqlite3.connect("welfare_db.sqlite")
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        hashed_password TEXT,
        role TEXT
    )
    ''')
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    if not cursor.fetchone():
        from auth import get_password_hash
        pw = get_password_hash("admin_password")
        cursor.execute("INSERT INTO users (username, hashed_password, role) VALUES ('admin', ?, 'admin')", (pw,))
    conn.commit()
    conn.close()

init_db()

app.include_router(auth.router)
app.include_router(stats.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

celery_app = Celery(
    "vision_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

class ApplicationData(BaseModel):
    aadhaar_id: str
    name: str
    stated_income: float
    bank_account: str
    rto_vehicle_reg_number: str

# Ensure upload directory exists
os.makedirs("uploads", exist_ok=True)

@app.post("/api/apply", status_code=status.HTTP_202_ACCEPTED)
async def apply(
    payload: str = Form(..., description="JSON string of user application data"),
    income_certificate: UploadFile = File(...),
    current_user: dict = Depends(auth.get_current_user)
):
    try:
        data_dict = json.loads(payload)
        user_data = ApplicationData(**data_dict)
    except (json.JSONDecodeError, ValidationError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid payload data: {str(e)}")

    file_path = f"uploads/{user_data.aadhaar_id}_{income_certificate.filename}"
    
    # Save the file
    file_bytes = await income_certificate.read()
    with open(file_path, "wb") as buffer:
        buffer.write(file_bytes)

    # Save to SQLite immediately
    conn = None
    try:
        conn = sqlite3.connect("welfare_db.sqlite")
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM applications WHERE aadhaar_id = ?", (user_data.aadhaar_id,))
        if cursor.fetchone():
             cursor.execute('''
             UPDATE applications 
             SET name = ?, stated_income = ?, bank_account = ?, rto_vehicle_reg_number = ?
             WHERE aadhaar_id = ?
             ''', (user_data.name, user_data.stated_income, user_data.bank_account, user_data.rto_vehicle_reg_number, user_data.aadhaar_id))
        else:
             cursor.execute('''
             INSERT INTO applications (aadhaar_id, name, stated_income, bank_account, rto_vehicle_reg_number)
             VALUES (?, ?, ?, ?, ?)
             ''', (user_data.aadhaar_id, user_data.name, user_data.stated_income, user_data.bank_account, user_data.rto_vehicle_reg_number))
             
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if conn:
            conn.close()

    # Dispatch to Celery queue (Non-blocking)
    celery_app.send_task("vision_worker.validate_income", args=[user_data.aadhaar_id, file_path])

    return {"message": "Application accepted. Income verification is processing.", "status": "processing"}

class RTOCheckResponse(BaseModel):
    has_luxury_vehicle: bool
    vehicle_details: str

LUXURY_CODES = ["MH-01-BMW-0001", "DL-1C-MERC-9999", "KA-01-AUDI-5555", "GJ-01-POR-7777"]

@app.get("/mock-api/rto-check", response_model=RTOCheckResponse)
async def check_rto(aadhaar_id: str):
    try:
        conn = sqlite3.connect("welfare_db.sqlite")
        cursor = conn.cursor()
        cursor.execute("SELECT rto_vehicle_reg_number FROM applications WHERE aadhaar_id = ?", (aadhaar_id,))
        result = cursor.fetchone()
        conn.close()
        
        if result and result[0]:
            rto_code = result[0]
            if any(luxury_code in rto_code for luxury_code in LUXURY_CODES):
                return RTOCheckResponse(
                    has_luxury_vehicle=True,
                    vehicle_details=f"High-Value Asset Detected (Luxury Vehicle): {rto_code}"
                )
            return RTOCheckResponse(
                has_luxury_vehicle=False,
                vehicle_details=f"Standard Vehicle: {rto_code}"
            )
    except Exception as e:
        pass
    
    return RTOCheckResponse(
        has_luxury_vehicle=False,
        vehicle_details="Standard/No Vehicle"
    )

@app.get("/api/applications")
async def get_applications(current_admin: dict = Depends(auth.get_current_admin)):
    try:
        conn = sqlite3.connect("welfare_db.sqlite")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM applications ORDER BY fraud_probability_score DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
