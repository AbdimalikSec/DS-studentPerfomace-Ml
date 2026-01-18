from fastapi import FastAPI
from pydantic import BaseModel, Field
import joblib
import os
import numpy as np

app = FastAPI(title="Student Score Predictor API")

# IMPORTANT: Vercel Python functions run with CWD = repo root
# so we build the path from the repo root.
MODEL_PATH = os.path.join(os.getcwd(), "model", "student_model.joblib")

model = joblib.load(MODEL_PATH)

class PredictRequest(BaseModel):
    weekly_self_study_hours: float = Field(..., ge=0, le=40)
    attendance_percentage: float = Field(..., ge=0, le=100)
    class_participation: float = Field(..., ge=0, le=10)

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/predict")
def predict(req: PredictRequest):
    X = np.array([[req.weekly_self_study_hours,
                   req.attendance_percentage,
                   req.class_participation]])
    pred = float(model.predict(X)[0])
    return {"predicted_total_score": pred}
