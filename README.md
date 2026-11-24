# CommerceIQ – AI-Powered E-Commerce Intelligence & Customer Analytics

CommerceIQ is a full-stack e-commerce analytics platform that helps businesses understand customer behavior, monitor sales performance, segment customers, and generate actionable business recommendations using data analytics and machine learning.

## Key Features

- **Sales Dashboard:** Monitor total revenue, orders, customers, average order value, and monthly sales.
- **Customer Segmentation:** Group customers into Champions, Loyal, At Risk, and Potential segments using RFM analysis.
- **Product Analytics:** Analyze product performance and identify top-selling products.
- **Repeat Purchase Prediction:** Use a Random Forest classification model to estimate the likelihood of repeat purchases.
- **Customer Recommendations:** Generate business actions based on customer purchasing patterns.
- **REST API:** Access analytics and prediction features through FastAPI endpoints.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Backend | Python, FastAPI |
| Database | SQLite, SQLAlchemy |
| Data Analysis | Pandas, NumPy |
| Machine Learning | Scikit-learn, Random Forest |
| Visualization | Recharts |
| Model Storage | Joblib |
| API Testing | FastAPI Swagger UI |

## System Architecture

React Frontend → FastAPI Backend → SQLAlchemy → SQLite Database

The backend also uses Pandas and Scikit-learn for customer analytics and machine learning predictions.

## Machine Learning

The project uses a Random Forest Classifier to predict repeat-purchase likelihood.

**Input features:**
- Recency: Days since the customer's last purchase.
- Frequency: Number of purchases.
- Monetary: Total purchase amount.
- Tenure: Number of days since the customer became a customer.

The model is evaluated using:
- Accuracy
- Precision
- Recall
- F1-score
- ROC-AUC

**Note:** The included dataset is synthetic and intended for demonstration and learning. Model metrics should not be treated as evidence of real-world business performance.

## Project Structure

```text
ecommerce-intelligence/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── seed.py
│   │   └── ml.py
│   │
│   ├── data/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   └── package.json
│
├── README.md
└── .gitignore
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd ecommerce-intelligence
```

### 2. Start the backend

```bash
cd backend

python -m venv .venv
```

Activate the environment on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Run the backend:

```bash
python -m uvicorn app.main:app --reload
```

Backend API:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 3. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

`http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend status |
| GET | `/api/dashboard` | Retrieve dashboard analytics |
| GET | `/api/segments` | Retrieve customer segments |
| GET | `/api/products` | Retrieve product analytics |
| POST | `/api/predict/repeat-purchase` | Predict repeat purchase |
| POST | `/api/model/train` | Train the ML model |
| GET | `/api/model/metrics` | Retrieve model metrics |
| GET | `/api/recommendations` | Retrieve customer recommendations |

## Application Screenshots

1. Overview Dashboard

The main dashboard displays revenue, total orders, customer count, average order value, monthly sales trends, customer segments, and top-performing products.

2. Customer Intelligence

Displays customer segmentation using RFM analysis, including At Risk, Loyal, Champions, and Potential customers. It also shows customer purchase frequency, recency, and spending.

3. Product Performance Analytics

Visualizes product revenue performance and provides detailed insights into product categories, revenue generated, units sold, and total orders. Helps identify the top-performing products.

4. Customer Business Recommendations

Generates actionable business recommendations based on customer purchasing behaviour and RFM segments.
Examples:
Champions: Offer loyalty rewards and exclusive benefits.
Loyal: Encourage repeat purchases.
At Risk: Send personalized win-back offers.
Potential: Recommend related products.

5. Machine Learning – Repeat Purchase Prediction

Uses a Random Forest classification model to estimate the likelihood of a customer making another purchase.

**Customer input features:**
- Days since last order
- Number of previous orders
- Total customer spending
- Customer age in days

**Model evaluation metrics:**
- Accuracy
- Precision
- Recall
- F1-score
- ROC-AUC

## Future Enhancements

- Integration with real e-commerce datasets.
- Advanced customer churn prediction.
- Product recommendation engine.
- Interactive business reports.
- Cloud deployment and authentication.

## Disclaimer

This is an educational portfolio project. It uses synthetic sample data and demonstration machine learning models. Predictions and recommendations require validation with real business data before practical use.

## Author

Developed as a full-stack data analytics and machine learning portfolio project.