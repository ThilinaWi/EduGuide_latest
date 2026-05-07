"""
Academic Risk Predictor — Flask Backend
========================================
ML-powered API using the new comprehensive_risk_dataset_1000.csv model.
Trained on 19 features with 95.2% accuracy.

Endpoints:
  POST /api/predict     — Predict risk from student inputs (via Random Forest v2)
  POST /api/recommend   — Generate dynamic recommendations based on inputs + risk
  GET  /api/history     — Retrieve prediction history (optional ?student_id filter)
  GET  /history         — Retrieve all prediction history
  DELETE /history       — Clear prediction history
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import joblib
import os
from datetime import datetime

# ─────────────────────────────────────────────
# App Setup
# ─────────────────────────────────────────────

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────
# Load ML Model v2 (trained on new dataset)
# ─────────────────────────────────────────────

print("Loading trained model v2...")
try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))

    best_model = joblib.load(os.path.join(BASE_DIR, 'model_random_forest_v2.pkl'))
    label_encoder = joblib.load(os.path.join(BASE_DIR, 'label_encoder_v2.pkl'))

    with open(os.path.join(BASE_DIR, 'feature_names_v2.txt'), 'r') as f:
        feature_names = f.read().strip().split('\n')

    print(f"Model v2 loaded. Features: {len(feature_names)}, Classes: {list(label_encoder.classes_)}")
except Exception as e:
    print(f"Error loading model: {e}")
    raise

# Load Recommendation Model (ML-based, replaces if/else logic)
print("Loading recommendation model...")
try:
    rec_bundle = joblib.load(os.path.join(BASE_DIR, 'recommendation_model_v2.pkl'))
    rec_features = rec_bundle['features']
    rec_models = rec_bundle['models']
    rec_encoders = rec_bundle['encoders']
    rec_columns = rec_bundle['rec_columns']
    print(f"Recommendation model loaded. Features: {rec_features}")
except Exception as e:
    print(f"Error loading recommendation model: {e}")
    raise

# Load recommendation details from CSV (no hardcoded text in code)
print("Loading recommendation details...")
rec_details_df = pd.read_csv(os.path.join(BASE_DIR, 'recommendation_details.csv'))
REC_DETAILS = {}
for _, row in rec_details_df.iterrows():
    REC_DETAILS[row['recommendation']] = {
        'type': row['type'],
        'area': row['area'],
        'message': row['message'],
        'action': row['action'],
    }
print(f"Loaded {len(REC_DETAILS)} recommendation details from CSV")

# In-memory prediction history
prediction_history = []


# ─────────────────────────────────────────────
# Helper: Build Feature Vector from User Inputs
# ─────────────────────────────────────────────

CONSISTENCY_MAP = {'Regular': 2, 'Sometimes': 1, 'Rare': 0}
TREND_MAP = {'Improving': 2, 'Stable': 1, 'Declining': 0}
ATTENDANCE_CAT_MAP = {'excellent': 4, 'good': 3, 'moderate': 2, 'irregular': 1, 'at-risk': 0}


def get_attendance_category(rate):
    if rate >= 90: return 'excellent'
    if rate >= 75: return 'good'
    if rate >= 60: return 'moderate'
    if rate >= 40: return 'irregular'
    return 'at-risk'


def build_feature_vector(attendance, avg_marks, study_hours, homework_rate,
                         screen_time, study_consistency, subject_scores=None):
    """Build the 19-feature vector that the v2 model expects."""

    if subject_scores and len(subject_scores) > 0:
        scores = list(subject_scores.values())
        avg_score = np.mean(scores)
        min_score = np.min(scores)
        max_score = np.max(scores)
        score_std = np.std(scores)
        score_range = max_score - min_score
        failing_subjects = sum(1 for s in scores if s < 35)
        weak_subjects = sum(1 for s in scores if s < 50)
    else:
        avg_score = avg_marks
        score_std = max(3, 20 - (avg_marks / 6))
        min_score = max(0, avg_marks - score_std * 2)
        max_score = min(100, avg_marks + score_std * 1.5)
        score_range = max_score - min_score
        failing_subjects = 0 if avg_marks >= 50 else (1 if avg_marks >= 35 else 3)
        weak_subjects = 0 if avg_marks >= 60 else (1 if avg_marks >= 45 else 3)

    att_cat_encoded = ATTENDANCE_CAT_MAP.get(get_attendance_category(attendance), 2)

    if study_consistency >= 0.7:
        consistency_encoded = 2
    elif study_consistency >= 0.3:
        consistency_encoded = 1
    else:
        consistency_encoded = 0

    trend_encoded = 1  # Default: Stable

    homework_study_ratio = homework_rate / (study_hours + 0.1)
    screen_study_ratio = screen_time / (study_hours + 0.1)
    attendance_score_product = attendance * avg_score / 100
    academic_risk_score = max(0, (100 - avg_marks) * 0.4 + failing_subjects * 5)
    behavioral_risk_score = 10 + (screen_time - 3) * 2 + (1 - homework_rate) * 5

    return {
        'attendance_rate': attendance,
        'study_hours_per_week': study_hours,
        'study_consistency_encoded': consistency_encoded,
        'performance_trend_encoded': trend_encoded,
        'screen_time_hours': screen_time,
        'homework_completion_rate': homework_rate,
        'academic_risk_score': academic_risk_score,
        'behavioral_risk_score': behavioral_risk_score,
        'avg_score': avg_score,
        'min_score': min_score,
        'max_score': max_score,
        'score_std': score_std,
        'score_range': score_range,
        'failing_subjects': failing_subjects,
        'weak_subjects': weak_subjects,
        'attendance_category_encoded': att_cat_encoded,
        'homework_study_ratio': homework_study_ratio,
        'screen_study_ratio': screen_study_ratio,
        'attendance_score_product': attendance_score_product,
    }


FRIENDLY_NAMES = {
    'attendance_rate': 'Attendance Rate',
    'study_hours_per_week': 'Study Hours',
    'study_consistency_encoded': 'Study Consistency',
    'performance_trend_encoded': 'Performance Trend',
    'screen_time_hours': 'Screen Time',
    'homework_completion_rate': 'Homework Completion',
    'academic_risk_score': 'Academic Risk Score',
    'behavioral_risk_score': 'Behavioral Risk Score',
    'avg_score': 'Average Score',
    'min_score': 'Minimum Score',
    'max_score': 'Maximum Score',
    'score_std': 'Score Variation',
    'score_range': 'Score Range',
    'failing_subjects': 'Failing Subjects',
    'weak_subjects': 'Weak Subjects',
    'attendance_category_encoded': 'Attendance Category',
    'homework_study_ratio': 'Homework/Study Ratio',
    'screen_study_ratio': 'Screen/Study Ratio',
    'attendance_score_product': 'Attendance x Score',
}


# ─────────────────────────────────────────────
# API: Predict Risk
# ─────────────────────────────────────────────

@app.route('/predict', methods=['POST'])
@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        attendance = float(data.get('attendance'))
        avg_marks = float(data.get('avg_marks'))
        study_hours = float(data.get('study_hours'))
        homework_rate = float(data.get('homework_rate')) / 100.0
        screen_time = float(data.get('screen_time'))
        study_consistency = float(data.get('study_consistency')) / 100.0
        subject_scores = data.get('subject_scores', None)

        feature_vector = build_feature_vector(
            attendance, avg_marks, study_hours,
            homework_rate, screen_time, study_consistency,
            subject_scores
        )

        features_arr = np.array([[feature_vector.get(f, 0) for f in feature_names]])

        prediction = best_model.predict(features_arr)[0]
        probabilities = best_model.predict_proba(features_arr)[0]
        risk_category = label_encoder.inverse_transform([prediction])[0]

        prob_map = {
            label_encoder.classes_[i]: float(probabilities[i])
            for i in range(len(label_encoder.classes_))
        }

        importances = best_model.feature_importances_
        feat_importance = sorted(
            zip(feature_names, importances),
            key=lambda x: x[1], reverse=True
        )

        top_factors = []
        total_imp = sum(imp for _, imp in feat_importance[:8])
        for fname, imp in feat_importance[:6]:
            pct = round((imp / total_imp) * 100, 1) if total_imp > 0 else 0
            display_name = FRIENDLY_NAMES.get(fname, fname.replace('_', ' ').title())
            val = feature_vector.get(fname, 0)
            top_factors.append({
                'feature': display_name,
                'contribution': pct,
                'value': round(float(val), 2),
                'impact': 'negative' if (
                    (fname == 'attendance_rate' and val < 75) or
                    (fname == 'avg_score' and val < 50) or
                    (fname == 'study_hours_per_week' and val < 8) or
                    (fname == 'homework_completion_rate' and val < 0.6) or
                    (fname == 'academic_risk_score' and val > 15) or
                    (fname == 'behavioral_risk_score' and val > 15) or
                    (fname == 'failing_subjects' and val > 0) or
                    (fname == 'weak_subjects' and val > 0) or
                    (fname == 'screen_time_hours' and val > 5) or
                    (fname == 'attendance_score_product' and val < 50)
                ) else 'positive'
            })

        recommendations = _generate_recommendations(
            attendance, avg_marks, study_hours,
            homework_rate * 100, screen_time, study_consistency * 100,
            risk_category
        )

        risk_level = ('Low' if 'Low' in risk_category
                      else 'High' if 'High' in risk_category
                      else 'Medium')

        result = {
            'risk_level': risk_level,
            'risk_category': risk_category,
            'confidence': float(probabilities.max()),
            'probabilities': {
                'low': prob_map.get('Low Risk', 0.0),
                'medium': prob_map.get('Medium Risk', 0.0),
                'high': prob_map.get('High Risk', 0.0),
            },
            'contributing_factors': top_factors,
            'recommendations': recommendations,
            'input_summary': {
                'attendance': attendance,
                'avg_marks': avg_marks,
                'grade8_marks': data.get('grade8_marks', avg_marks),
                'grade9_marks': data.get('grade9_marks', avg_marks),
                'grade10_marks': data.get('grade10_marks', avg_marks),
                'study_hours': study_hours,
                'homework_rate': round(homework_rate * 100, 1),
                'screen_time': screen_time,
                'study_consistency': round(study_consistency * 100, 1),
            }
        }

        prediction_history.insert(0, {
            'timestamp': datetime.now().isoformat(),
            'inputs': result['input_summary'],
            'risk_level': risk_level,
            'confidence': result['confidence'],
        })
        if len(prediction_history) > 50:
            prediction_history.pop()

        return jsonify(result)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


# ─────────────────────────────────────────────
# API: Recommendations
# ─────────────────────────────────────────────


def _generate_recommendations(attendance, avg_marks, study_hours,
                              homework_rate, screen_time,
                              study_consistency, risk_category='Medium'):
    
    # 1. Prepare feature vector exactly as expected by the new ML model
    X_test = pd.DataFrame([{
        'attendance': attendance,
        'avg_marks': avg_marks,
        'study_hours': study_hours,
        'homework_rate': homework_rate,
        'screen_time': screen_time,
        'study_consistency': study_consistency
    }])[rec_features].values
    
    # 2. Predict the 3 recommendation strings
    recs = []
    seen_keys = set()
    
    for col in rec_columns:
        model = rec_models[col]
        encoder = rec_encoders[col]
        
        pred_encoded = model.predict(X_test)[0]
        rec_str = encoder.inverse_transform([pred_encoded])[0]
        
        if rec_str not in seen_keys:
            seen_keys.add(rec_str)
            
            # Lookup in REC_DETAILS dictionary
            if rec_str in REC_DETAILS:
                recs.append(REC_DETAILS[rec_str])
            else:
                recs.append({
                    'type': 'info',
                    'area': 'General',
                    'message': rec_str,
                    'action': 'Please follow this advice.'
                })
                
    # 3. Sort by priority
    priority = {'critical': 1, 'warning': 2, 'info': 3, 'success': 4}
    recs.sort(key=lambda x: priority.get(x['type'], 5))
    
    return recs


@app.route('/api/recommend', methods=['POST'])
def api_recommend():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        recs = _generate_recommendations(
            attendance=float(data.get('attendance')),
            avg_marks=float(data.get('avg_marks')),
            study_hours=float(data.get('study_hours')),
            homework_rate=float(data.get('homework_rate')),
            screen_time=float(data.get('screen_time')),
            study_consistency=float(data.get('study_consistency')),
            risk_category=data.get('risk_level', 'Medium'),
        )
        return jsonify({'recommendations': recs})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ─────────────────────────────────────────────
# API: History
# ─────────────────────────────────────────────

@app.route('/history', methods=['GET'])
@app.route('/api/history', methods=['GET'])
def get_history():
    student_id = request.args.get('student_id')
    if student_id:
        return jsonify([h for h in prediction_history if h.get('student_id') == student_id])
    return jsonify(prediction_history)


@app.route('/history', methods=['DELETE'])
def clear_history():
    prediction_history.clear()
    return jsonify({'message': 'History cleared'})


# ─────────────────────────────────────────────
# Run
# ─────────────────────────────────────────────

if __name__ == '__main__':
    app.run(debug=True, port=5002, use_reloader=False)
