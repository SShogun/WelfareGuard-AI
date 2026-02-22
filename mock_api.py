from fastapi import FastAPI
from pydantic import BaseModel
import sqlite3

app = FastAPI(title="Government RTO Mock API")

class RTOCheckRequest(BaseModel):
    aadhaar_id: str

class RTOCheckResponse(BaseModel):
    has_luxury_vehicle: bool
    vehicle_details: str

LUXURY_CODES = ["MH-01-BMW-0001", "DL-1C-MERC-9999", "KA-01-AUDI-5555", "GJ-01-POR-7777"]

@app.post("/mock-api/rto-check", response_model=RTOCheckResponse)
async def check_rto(request: RTOCheckRequest):
    try:
        conn = sqlite3.connect("welfare_db.sqlite")
        cursor = conn.cursor()
        cursor.execute("SELECT rto_vehicle_reg_number FROM applications WHERE aadhaar_id = ?", (request.aadhaar_id,))
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
