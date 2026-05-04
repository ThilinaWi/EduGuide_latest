"""
Train Recommendation Models from recommendation_dataset.csv
============================================================
Trains 3 separate classifiers — one for each recommendation slot.
Input:  risk_level (encoded)
Output: recommendation_1, recommendation_2, recommendation_3
"""

import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ─── 1. Load Dataset ───
print("Loading recommendation dataset...")
df = pd.read_csv(os.path.join(BASE_DIR, 'recommendation_dataset.csv'))
print(f"  Loaded {len(df)} rows")
print(f"  Risk levels: {df['risk_level'].value_counts().to_dict()}")

# ─── 2. Encode risk_level as input feature ───
risk_encoder = LabelEncoder()
df['risk_encoded'] = risk_encoder.fit_transform(df['risk_level'])
print(f"  Risk classes: {dict(zip(risk_encoder.classes_, risk_encoder.transform(risk_encoder.classes_)))}")

# ─── 3. Train a model for each recommendation column ───
rec_columns = ['recommendation_1', 'recommendation_2', 'recommendation_3']
models = {}
encoders = {}

X = df[['risk_encoded']].values

for col in rec_columns:
    print(f"\nTraining model for: {col}")
    
    le = LabelEncoder()
    y = le.fit_transform(df[col])
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    model = RandomForestClassifier(
        n_estimators=100, max_depth=10, random_state=42, n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    acc = accuracy_score(y_test, model.predict(X_test))
    print(f"  Accuracy: {acc:.4f} ({acc*100:.1f}%)")
    print(f"  Classes: {list(le.classes_)}")
    
    models[col] = model
    encoders[col] = le

# ─── 4. Save everything as a single bundle ───
bundle = {
    'risk_encoder': risk_encoder,
    'models': models,
    'encoders': encoders,
    'rec_columns': rec_columns,
}

bundle_path = os.path.join(BASE_DIR, 'recommendation_model.pkl')
joblib.dump(bundle, bundle_path)
print(f"\nSaved recommendation model bundle to: {bundle_path}")

# ─── 5. Quick test ───
print("\n── Quick Test ──")
for level in ['Low', 'Medium', 'High']:
    risk_encoded = risk_encoder.transform([level])[0]
    X_test = [[risk_encoded]]
    recs = []
    for col in rec_columns:
        pred = models[col].predict(X_test)[0]
        recs.append(encoders[col].inverse_transform([pred])[0])
    print(f"  {level:8s} Risk → {recs}")

print("\nDone!")
