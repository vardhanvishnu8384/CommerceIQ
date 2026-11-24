from pathlib import Path
import pandas as pd
from .database import Base, engine, SessionLocal
from .models import Customer, Product, Order

DATA_DIR = Path(__file__).resolve().parents[1] / "data"

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Customer).first():
            return
        customers = pd.read_csv(DATA_DIR / "customers.csv")
        products = pd.read_csv(DATA_DIR / "products.csv")
        orders = pd.read_csv(DATA_DIR / "orders.csv")
        for row in customers.to_dict("records"):
            db.add(Customer(customer_id=row["customer_id"], name=row["name"], city=row["city"], joined_date=pd.to_datetime(row["joined_date"]).date()))
        for row in products.to_dict("records"):
            db.add(Product(product_id=row["product_id"], product_name=row["product_name"], category=row["category"], price=float(row["price"])))
        for row in orders.to_dict("records"):
            db.add(Order(order_id=row["order_id"], customer_id=row["customer_id"], product_id=row["product_id"], order_date=pd.to_datetime(row["order_date"]).date(), quantity=int(row["quantity"]), amount=float(row["amount"])))
        db.commit()
    finally:
        db.close()
