import os
import cv2
import pytesseract
import sqlite3
import re
import requests
from celery import Celery

import graph_analysis
import neural_engine

# Apply Tesseract explicit path for Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

celery_app = Celery(
    "vision_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

# Optional CUDA Support for OpenCV
try:
    if cv2.cuda.getCudaEnabledDeviceCount() > 0:
        cv2.cuda.setDevice(0)
        print("NVIDIA CUDA Enabled for OpenCV computations")
except Exception:
    pass

@celery_app.task(name="vision_worker.validate_income")
def validate_income(aadhaar_id: str, image_path: str):
    conn = None
    try:
        # --- 1. OCR PROCESSING (OpenCV + Tesseract CUDA-Aware) ---
        extracted_income = 0.0
        
        if os.path.exists(image_path):
            img = cv2.imread(image_path)
            if img is not None:
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                try:
                    text = pytesseract.image_to_string(gray)
                    numbers = re.findall(r'\d+', text.replace(',', ''))
                    if numbers:
                        extracted_income = float(max(map(int, numbers)))
                except Exception as e:
                    print(f"OCR Warning: {e}")

        # --- 2. DB CONNECT & FETCH ---
        conn = sqlite3.connect("welfare_db.sqlite", timeout=10)
        cursor = conn.cursor()
        
        cursor.execute("SELECT stated_income FROM applications WHERE aadhaar_id = ?", (aadhaar_id,))
        row = cursor.fetchone()
        if not row:
            return {"status": "error", "message": "Applicant not found"}
            
        stated_income = row[0]
        
        score_add = 0
        reasons = []

        # --- 3. INCOME MISMATCH VERIFICATION ---
        if extracted_income > 0 and (extracted_income - stated_income) > 10000:
            score_add += 40
            reasons.append(f"OCR Income Mismatch (Stated: {stated_income}, OCR: {extracted_income})")

        # --- 4. RTO LUXURY VEHICLE CHECK (Mock API) ---
        try:
            # Bug Fix: Ensure using requests.get and pointing strictly to main app at 8000
            response = requests.get(
                f"http://127.0.0.1:8000/mock-api/rto-check?aadhaar_id={aadhaar_id}", 
                timeout=5
            )
            if response.status_code == 200:
                rto_data = response.json()
                if rto_data.get("has_luxury_vehicle"):
                    score_add += 60
                    reasons.append(rto_data.get("vehicle_details"))
        except requests.RequestException as e:
            print(f"Warning: RTO Mock API unreachable: {e}")

        # --- 5. ASYNC GRAPH ANALYSIS SUB-ROUTINE ---
        # We run this before scoring so its flag counts can be fed into the NN
        rings_flagged = graph_analysis.analyze_fraud_rings("welfare_db.sqlite")

        # --- 6. NEURAL NETWORK INFERENCE ---
        nn_prob = neural_engine.calculate_fraud_probability(stated_income, extracted_income, rings_flagged)
        nn_score_bump = int(nn_prob * 100)

        # Update reasons if Neural Network indicates high anomaly
        if nn_score_bump > 40:
            reasons.append(f"Deep Learning Anomaly Detected (NN Confidence: {nn_prob:.2f})")

        # --- 7. UPDATE FINAL SCORE ---
        flag_reason_str = " | ".join(reasons)
        
        cursor.execute("SELECT fraud_probability_score, flag_reason FROM applications WHERE aadhaar_id = ?", (aadhaar_id,))
        current_score, current_reason = cursor.fetchone()
        
        final_score = min(100, (current_score or 0) + score_add + nn_score_bump)
        
        if current_reason:
            if flag_reason_str and flag_reason_str not in current_reason:
                new_reason = f"{current_reason} | {flag_reason_str}"
            else:
                new_reason = current_reason
        else:
            new_reason = flag_reason_str
            
        cursor.execute('''
            UPDATE applications
            SET fraud_probability_score = ?, flag_reason = ?
            WHERE aadhaar_id = ?
        ''', (final_score, new_reason, aadhaar_id))
        conn.commit()

        return {
            "status": "success", 
            "aadhaar_id": aadhaar_id, 
            "extracted_income": extracted_income,
            "nn_confidence": nn_prob,
            "rings_flagged_count": rings_flagged
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}
    finally:
        if conn:
            conn.close()
