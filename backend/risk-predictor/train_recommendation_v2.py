import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

print("Loading recommendation dataset...")
df = pd.read_csv(os.path.join(BASE_DIR, 'recommendation_dataset_v2.csv'))

features = ['attendance', 'avg_marks', 'study_hours', 'homework_rate', 'screen_time', 'study_consistency']
X = df[features].values

rec_columns = ['recommendation_1', 'recommendation_2', 'recommendation_3']
models = {}
encoders = {}

for col in rec_columns:
    print(f"\nTraining model for: {col}")
    le = LabelEncoder()
    y = le.fit_transform(df[col])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=150, max_depth=15, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    
    acc = accuracy_score(y_test, model.predict(X_test))
    print(f"  Accuracy: {acc:.4f}")
    
    models[col] = model
    encoders[col] = le

bundle = {
    'features': features,
    'models': models,
    'encoders': encoders,
    'rec_columns': rec_columns,
}

bundle_path = os.path.join(BASE_DIR, 'recommendation_model_v2.pkl')
joblib.dump(bundle, bundle_path)
print(f"\nSaved recommendation model bundle to: {bundle_path}")
