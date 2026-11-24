from sqlalchemy import Column, String, Integer, Float, Date
from .database import Base

class Customer(Base):
    __tablename__ = "customers"
    customer_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String)
    joined_date = Column(Date)

class Product(Base):
    __tablename__ = "products"
    product_id = Column(String, primary_key=True, index=True)
    product_name = Column(String, nullable=False)
    category = Column(String)
    price = Column(Float)

class Order(Base):
    __tablename__ = "orders"
    order_id = Column(String, primary_key=True, index=True)
    customer_id = Column(String, index=True)
    product_id = Column(String, index=True)
    order_date = Column(Date, index=True)
    quantity = Column(Integer)
    amount = Column(Float)
