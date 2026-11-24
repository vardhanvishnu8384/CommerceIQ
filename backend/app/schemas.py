from pydantic import BaseModel, Field

class PredictionInput(BaseModel):
    recency_days: int = Field(ge=0, le=3650)
    frequency: int = Field(ge=0, le=10000)
    monetary: float = Field(ge=0, le=100000000)
    tenure_days: int = Field(ge=1, le=10000)
