from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib
import json

METRICS = Path(__file__).resolve().parents[1] / "model_metrics.json"
DATA = Path(__file__).resolve().parents[1] / "data" / "customer_training.csv"
MODEL = Path(__file__).resolve().parents[1] / "repeat_purchase_model.joblib"
FEATURES = ["recency_days", "frequency", "monetary", "tenure_days"]

def train_and_save():
    df = pd.read_csv(DATA)
    X, y = df[FEATURES], df["repeat_purchase"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    model = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("classifier", RandomForestClassifier(n_estimators=160, max_depth=5, random_state=42, class_weight="balanced"))
    ])
    model.fit(X_train, y_train)
    pred = model.predict(X_test)
    proba = model.predict_proba(X_test)[:, 1]
    metrics = {
        "accuracy": round(float(accuracy_score(y_test, pred)), 3),
        "precision": round(float(precision_score(y_test, pred, zero_division=0)), 3),
        "recall": round(float(recall_score(y_test, pred, zero_division=0)), 3),
        "f1_score": round(float(f1_score(y_test, pred, zero_division=0)), 3),
        "roc_auc": round(float(roc_auc_score(y_test, proba)), 3) if y_test.nunique() > 1 else None,
        "test_rows": int(len(y_test))
    }
    joblib.dump(model, MODEL)

    with open(METRICS, "w") as file:
        json.dump(metrics, file)

    return metrics

def load_model():
    if not MODEL.exists():
        train_and_save()
    return joblib.load(MODEL)
