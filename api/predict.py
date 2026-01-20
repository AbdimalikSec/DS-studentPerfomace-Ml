from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Input(BaseModel):
    weekly_self_study_hours: float
    attendance_percentage: float
    class_participation: float

@app.post("/api/predict")
def predict(data: Input):
    # dummy logic for now (model will replace this)
    predicted_score = (
        data.weekly_self_study_hours * 2
        + data.attendance_percentage * 0.5
        + data.class_participation * 5
    )

    return {"predicted_total_score": predicted_score}
