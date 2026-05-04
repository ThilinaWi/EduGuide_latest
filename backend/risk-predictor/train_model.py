"""
Train a new Random Forest model from comprehensive_risk_dataset_1000.csv
=====================================================================
This script:
  1. Loads the new dataset (3000 rows, 1000 students × 3 grades)
  2. Engineers features from subject scores + behavioral data
  3. Creates risk labels (Low / Medium / High) from overall_risk_score
  4. Trains a Random Forest classifier
  5. Saves model, label encoder, and feature names
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ─── 1. Load Dataset ───
print("Loading dataset...")
df = pd.read_csv(os.path.join(BASE_DIR, 'comprehensive_risk_dataset_1000.csv'))
print(f"  Loaded {len(df)} rows, {len(df.columns)} columns")

# ─── 2. Feature Engineering ───
print("Engineering features...")

# Subject scores → average and stats
subject_cols = ['Buddhism_score', 'English_score', 'Geography_score',
                'History_score', 'ICT_score', 'Mathematics_score',
                'Science_score', 'Sinhala_score']

df['avg_score'] = df[subject_cols].mean(axis=1)
df['min_score'] = df[subject_cols].min(axis=1)
df['max_score'] = df[subject_cols].max(axis=1)
df['score_std'] = df[subject_cols].std(axis=1)
df['score_range'] = df['max_score'] - df['min_score']
df['failing_subjects'] = (df[subject_cols] < 35).sum(axis=1)
df['weak_subjects'] = (df[subject_cols] < 50).sum(axis=1)

# Encode categorical columns
consistency_map = {'Regular': 2, 'Sometimes': 1, 'Rare': 0}
df['study_consistency_encoded'] = df['study_consistency'].map(consistency_map).fillna(0).astype(int)

trend_map = {'Improving': 2, 'Stable': 1, 'Declining': 0}
df['performance_trend_encoded'] = df['performance_trend'].map(trend_map).fillna(1).astype(int)

attendance_map = {'excellent': 4, 'good': 3, 'moderate': 2, 'irregular': 1, 'at-risk': 0}
df['attendance_category_encoded'] = df['attendance_category'].map(attendance_map).fillna(2).astype(int)

# Derived features
df['homework_study_ratio'] = df['homework_completion_rate'] / (df['study_hours_per_week'] + 0.1)
df['screen_study_ratio'] = df['screen_time_hours'] / (df['study_hours_per_week'] + 0.1)
df['attendance_score_product'] = df['attendance_rate'] * df['avg_score'] / 100

# ─── 3. Create Risk Labels from overall_risk_score ───
print("Creating risk labels...")

def risk_label(score):
    if score <= 35:
        return 'Low Risk'
    elif score <= 60:
        return 'Medium Risk'
    else:
        return 'High Risk'

df['risk_label'] = df['overall_risk_score'].apply(risk_label)
print(f"  Risk distribution:\n{df['risk_label'].value_counts().to_string()}")

# ─── 4. Select Features & Target ───
feature_columns = [
    'attendance_rate',
    'study_hours_per_week',
    'study_consistency_encoded',
    'performance_trend_encoded',
    'screen_time_hours',
    'homework_completion_rate',
    'academic_risk_score',
    'behavioral_risk_score',
    'avg_score',
    'min_score',
    'max_score',
    'score_std',
    'score_range',
    'failing_subjects',
    'weak_subjects',
    'attendance_category_encoded',
    'homework_study_ratio',
    'screen_study_ratio',
    'attendance_score_product',
]

X = df[feature_columns].values
y = df['risk_label'].values

# Encode labels
le = LabelEncoder()
y_encoded = le.fit_transform(y)
print(f"\n  Label classes: {list(le.classes_)}")
print(f"  Feature count: {len(feature_columns)}")

# ─── 5. Train/Test Split ───
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)
print(f"\n  Train: {len(X_train)} | Test: {len(X_test)}")

# ─── 6. Train Random Forest ───
print("\nTraining Random Forest...")
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

# ─── 7. Evaluate ───
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\n  Accuracy: {accuracy:.4f} ({accuracy*100:.1f}%)")
print(f"\n  Classification Report:")
print(classification_report(y_test, y_pred, target_names=le.classes_))

# Feature importances
importances = sorted(zip(feature_columns, model.feature_importances_),
                     key=lambda x: x[1], reverse=True)
print("  Feature Importances:")
for name, imp in importances:
    print(f"    {name:35s} {imp:.4f}")

# ─── 8. Save Model Artifacts ───
print("\nSaving model artifacts...")

model_path = os.path.join(BASE_DIR, 'model_random_forest_v2.pkl')
encoder_path = os.path.join(BASE_DIR, 'label_encoder_v2.pkl')
features_path = os.path.join(BASE_DIR, 'feature_names_v2.txt')

joblib.dump(model, model_path)
joblib.dump(le, encoder_path)

with open(features_path, 'w') as f:
    f.write('\n'.join(feature_columns))

print(f"  Model saved to:    {model_path}")
print(f"  Encoder saved to:  {encoder_path}")
print(f"  Features saved to: {features_path}")
print("\nDone! Model is ready.")
