from datetime import date
from pathlib import Path
import pandas as pd
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from .database import Base, engine, get_db
from .models import Customer, Product, Order
from .schemas import PredictionInput
from .seed import seed_database
from .ml import load_model, train_and_save, FEATURES

app = FastAPI(title="E-Commerce Intelligence API", version="1.0.0",
              description="Sales analytics, RFM customer segmentation and repeat-purchase prediction.")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

@app.on_event("startup")
def startup():
    seed_database()
    load_model()

@app.get("/")
def root():
    return {"message": "E-Commerce Intelligence API is running", "docs": "/docs"}

@app.get("/api/health")
def health():
    return {"status": "ok"}

def order_frame(db: Session):
    rows = db.query(Order).all()
    if not rows:
        return pd.DataFrame(columns=["order_id","customer_id","product_id","order_date","quantity","amount"])
    return pd.DataFrame([{
        "order_id": r.order_id, "customer_id": r.customer_id, "product_id": r.product_id,
        "order_date": r.order_date, "quantity": r.quantity, "amount": r.amount
    } for r in rows])

@app.get("/api/dashboard")
def dashboard(db: Session = Depends(get_db)):
    df = order_frame(db)
    if df.empty:
        return {"revenue":0,"orders":0,"customers":0,"average_order_value":0,"monthly_sales":[],"top_products":[]}
    products = {p.product_id:p.product_name for p in db.query(Product).all()}
    df["month"] = pd.to_datetime(df["order_date"]).dt.to_period("M").astype(str)
    monthly = df.groupby("month", as_index=False)["amount"].sum().sort_values("month")
    by_product = df.groupby("product_id").agg(revenue=("amount","sum"), units=("quantity","sum")).reset_index()
    by_product["product_name"] = by_product["product_id"].map(products)
    by_product = by_product.sort_values("revenue", ascending=False).head(5)
    return {
        "revenue": round(float(df.amount.sum()),2),
        "orders": int(df.order_id.nunique()),
        "customers": int(df.customer_id.nunique()),
        "average_order_value": round(float(df.amount.sum()/df.order_id.nunique()),2),
        "monthly_sales":[{"month":r.month,"revenue":round(float(r.amount),2)} for r in monthly.itertuples()],
        "top_products":[{"product":r.product_name,"revenue":round(float(r.revenue),2),"units":int(r.units)} for r in by_product.itertuples()]
    }

@app.get("/api/segments")
def customer_segments(db: Session = Depends(get_db)):
    df = order_frame(db)
    if df.empty:
        return {"segments":[],"customers":[]}
    today = pd.Timestamp(date.today())
    df["order_date"] = pd.to_datetime(df["order_date"])
    rfm = df.groupby("customer_id").agg(
        recency_days=("order_date", lambda x: int((today-x.max()).days)),
        frequency=("order_id","nunique"), monetary=("amount","sum")
    ).reset_index()
    def segment(row):
        if row.frequency >= 5 and row.monetary >= rfm.monetary.quantile(.75): return "Champions"
        if row.recency_days <= 90 and row.frequency >= 2: return "Loyal"
        if row.recency_days > 180: return "At Risk"
        return "Potential"
    rfm["segment"] = rfm.apply(segment, axis=1)
    names = {c.customer_id:c.name for c in db.query(Customer).all()}
    rfm["customer_name"] = rfm.customer_id.map(names)
    counts = rfm.segment.value_counts().to_dict()
    return {
        "segments":[{"segment":k,"customers":int(v)} for k,v in counts.items()],
        "customers":[{"customer_id":r.customer_id,"name":r.customer_name,"recency_days":int(r.recency_days),
                      "frequency":int(r.frequency),"monetary":round(float(r.monetary),2),"segment":r.segment}
                     for r in rfm.sort_values("monetary",ascending=False).head(100).itertuples()]
    }

@app.get("/api/products")
def product_performance(db: Session = Depends(get_db)):
    df=order_frame(db)
    if df.empty: return []
    names={p.product_id:p.product_name for p in db.query(Product).all()}
    cats={p.product_id:p.category for p in db.query(Product).all()}
    result=df.groupby("product_id").agg(revenue=("amount","sum"),units=("quantity","sum"),orders=("order_id","nunique")).reset_index()
    result["product"]=result.product_id.map(names)
    result["category"]=result.product_id.map(cats)
    return [{"product":r.product,"category":r.category,"revenue":round(float(r.revenue),2),"units":int(r.units),"orders":int(r.orders)}
            for r in result.sort_values("revenue",ascending=False).itertuples()]

@app.post("/api/predict/repeat-purchase")
def predict_repeat_purchase(payload: PredictionInput):
    model=load_model()
    row=pd.DataFrame([[getattr(payload, f) for f in FEATURES]],columns=FEATURES)
    probability=float(model.predict_proba(row)[0][1])
    return {"repeat_purchase_probability":round(probability,4),
            "prediction":"Likely" if probability >= .5 else "Less likely",
            "note":"This is a demonstration model trained on synthetic sample data. Validate with real business data before making decisions."}

@app.post("/api/model/train")
def retrain_model():
    try:
        metrics=train_and_save()
        return {"message":"Model trained successfully","metrics":metrics,
                "warning":"Metrics are based on the included synthetic demonstration dataset."}
    except Exception as exc:
        raise HTTPException(status_code=500,detail=str(exc))

@app.get("/api/model/metrics")
def model_metrics():
    # Training is repeated so reported metrics match the current bundled training file.
    return train_and_save()
@app.get("/api/recommendations")
def customer_recommendations(db: Session = Depends(get_db)):

    df = order_frame(db)

    if df.empty:
        return {
            "total_customers": 0,
            "recommendations": []
        }

    today = pd.Timestamp(date.today())

    df["order_date"] = pd.to_datetime(df["order_date"])

    rfm = df.groupby("customer_id").agg(
        recency_days=("order_date", lambda x: int((today - x.max()).days)),
        frequency=("order_id", "nunique"),
        monetary=("amount", "sum")
    ).reset_index()

    recommendations = []

    top_25 = rfm["monetary"].quantile(0.75)

    for row in rfm.itertuples():

        if row.frequency >= 5 and row.monetary >= top_25:
            segment = "Champions"
            action = "Offer loyalty rewards and exclusive benefits"

        elif row.recency_days > 180:
            segment = "At Risk"
            action = "Send a personalized win-back offer"

        elif row.frequency >= 2:
            segment = "Loyal"
            action = "Encourage repeat purchases"

        else:
            segment = "Potential"
            action = "Recommend related products"

        recommendations.append({
            "customer_id": str(row.customer_id),
            "segment": segment,
            "recommendation": action
        })

    return {
        "total_customers": len(recommendations),
        "recommendations": recommendations[:100]
    }