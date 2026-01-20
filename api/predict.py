from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Input(BaseModel):
    study_hours: float
    attendance: float
    participation: float

@app.post("/api/predict")
def predict(data: Input):
    return {"prediction": 75}
