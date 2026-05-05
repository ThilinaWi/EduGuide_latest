import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any, Tuple
from .config import ONLINE_RESOURCES, AL_STREAM_REQUIREMENTS
from . import resource_recommender
import os

# Global DataFrame to hold data
df_performance = None
student_metrics = None
subject_performance = None
scaler = None
kmeans_model = None

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

def load_data(file_path: str):
    global df_performance, student_metrics, subject_performance
    
    print(f"Loading data from {file_path}...")
    df_performance = pd.read_csv(file_path)
    
    # Calculate student-level metrics (from notebook)
    student_metrics = df_performance.groupby('student_id').agg({
        'score': ['mean', 'std', 'min', 'max'],
        'iq_level': 'first',
        'study_hours_per_week': 'first',
        'attendance_rate': 'first',
        'student_type': 'first'
    }).reset_index()

    student_metrics.columns = ['student_id', 'avg_score', 'score_std', 'min_score',
                                'max_score', 'iq_level', 'study_hours', 'attendance_rate',
                                'student_type']
    
    # Subject-wise performance
    subject_performance = df_performance.pivot_table(
        index='student_id',
        columns='subject',
        values='score',
        aggfunc='mean'
    ).reset_index()
    
    # Perform Clustering
    perform_clustering()

def perform_clustering():
    """
    Cluster students using ALL available facts:
      - Subject scores: Sinhala, Mathematics, Science, English,
                        History, Buddhism, Geography, ICT  (8)
      - IQ level                                           (1)
      - Study hours per week                               (1)
      - Attendance rate                                    (1)
    Total: 11 features, all standardised so no single feature dominates.
    """
    global subject_performance, scaler, kmeans_model

    subjects = ['Sinhala', 'Mathematics', 'Science', 'English', 'History',
                'Buddhism', 'Geography', 'ICT']

    # 1. Subject-score features (already in subject_performance)
    X_subjects = subject_performance[subjects].fillna(
        subject_performance[subjects].mean()
    )

    # 2. Extra features from student_metrics
    extra = student_metrics[['student_id', 'iq_level',
                              'study_hours', 'attendance_rate']].copy()
    merged = subject_performance[['student_id']].merge(
        extra, on='student_id', how='left'
    )
    X_extra = merged[['iq_level', 'study_hours', 'attendance_rate']].fillna(
        merged[['iq_level', 'study_hours', 'attendance_rate']].mean()
    )

    # 3. Combine all 11 features
    X_cluster = pd.concat(
        [X_subjects.reset_index(drop=True),
         X_extra.reset_index(drop=True)],
        axis=1
    )

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_cluster)

    kmeans_model = KMeans(n_clusters=3, random_state=RANDOM_SEED, n_init=10)
    clusters = kmeans_model.fit_predict(X_scaled)

    # Label clusters 1, 2, 3 instead of 0, 1, 2
    subject_performance['cluster'] = clusters + 1

def get_all_students_summary() -> List[Dict[str, Any]]:
    if student_metrics is None:
        return []
    
    # Merge cluster info
    summary = pd.merge(student_metrics[['student_id', 'avg_score', 'student_type']], 
                       subject_performance[['student_id', 'cluster']], 
                       on='student_id')
    
    return summary.to_dict(orient='records')

def get_student_details(student_id: str) -> Dict[str, Any]:
    if df_performance is None:
        return None
        
    student_data = df_performance[df_performance['student_id'] == student_id]
    if student_data.empty:
        return None
        
    return generate_complete_learning_path(student_id)

def identify_weak_subjects(student_id, base_threshold=60):
    """
    Identify weak subjects using ALL student facts, not just marks.

    Dynamic threshold logic:
    ─────────────────────────────────────────────────────────
    • Base threshold = 60 (default)
    • IQ adjustment   : high IQ  → raise threshold (more expected)
    • Study adjustment: many hrs → raise threshold (more expected)
    • Attend adjust.  : high att → raise threshold (more expected)

    Range: threshold stays between 50 (floor) and 75 (ceiling)

    Examples:
    • IQ=130, study=30h, attend=95% → threshold ~72  (very capable → high bar)
    • IQ= 80, study= 5h, attend=60% → threshold ~50  (struggling → low bar)
    • IQ=100, study=15h, attend=80% → threshold ~60  (average → base)
    ─────────────────────────────────────────────────────────
    """
    student_data = df_performance[df_performance['student_id'] == student_id]
    row = student_data.iloc[0]

    iq_level        = float(row['iq_level'])
    study_hours     = float(row['study_hours_per_week'])
    attendance_rate = float(row['attendance_rate'])

    # Normalise each fact to 0-1 scale
    iq_norm      = max(0.0, min(1.0, (iq_level - 70) / (150 - 70)))   # 70–150
    hours_norm   = max(0.0, min(1.0, study_hours / 40))               # 0–40
    attend_norm  = max(0.0, min(1.0, attendance_rate / 100))          # 0–100%

    # Each fact adjusts the threshold by ±10 points around base
    iq_adj      = (iq_norm - 0.5)      * 10   # -5 to +5
    hours_adj   = (hours_norm - 0.5)   * 8    # -4 to +4
    attend_adj  = (attend_norm - 0.5)  * 6    # -3 to +3

    dynamic_threshold = base_threshold + iq_adj + hours_adj + attend_adj
    dynamic_threshold = max(50.0, min(75.0, dynamic_threshold))  # clamp 50–75

    # ── Identify weak subjects with dynamic threshold ──
    subject_scores = student_data.groupby('subject')['score'].mean().sort_values()
    weak_subjects  = subject_scores[subject_scores < dynamic_threshold]

    lesson_scores = student_data.groupby(['subject', 'lesson'])['score'].mean()

    weak_areas = {
        'student_id':        student_id,
        'weak_subjects':     weak_subjects.to_dict(),
        'priority_lessons':  [],
        'dynamic_threshold': round(dynamic_threshold, 1),   # expose for frontend
        'threshold_basis': {
            'base':           base_threshold,
            'iq_adjustment':  round(iq_adj, 1),
            'hours_adjustment': round(hours_adj, 1),
            'attend_adjustment': round(attend_adj, 1),
        }
    }

    for subject in weak_subjects.index:
        if subject in lesson_scores.index.get_level_values(0):
            subject_lessons = lesson_scores[subject].sort_values()
            weak_lessons    = subject_lessons[subject_lessons < dynamic_threshold].head(5)

            for lesson, score in weak_lessons.items():
                weak_areas['priority_lessons'].append({
                    'subject':       subject,
                    'lesson':        lesson,
                    'current_score': round(score, 1),
                    'target_score':  min(100, round(dynamic_threshold + 10, 1))
                })

    return weak_areas


def recommend_online_resources(student_id, top_n=5):
    """
    Recommend online resources using ALL available student facts:

    Composite score = weighted average of 4 normalized facts:
      - avg_score      (marks)      : weight 40%
      - iq_level       (IQ)         : weight 25%
      - study_hours    (study time) : weight 20%
      - attendance_rate(attendance) : weight 15%

    Composite Score → Difficulty Level:
      < 40  → Beginner
      < 65  → Intermediate
      >= 65  → All Levels

    Subject score → Priority:
      < 40  → Critical
      < 55  → High
      >= 55  → Medium
    """
    weak_areas = identify_weak_subjects(student_id)
    weak_subjects = list(weak_areas['weak_subjects'].keys())

    if not weak_subjects:
        al_recommendations, _, _ = recommend_al_stream(student_id)
        top_stream = al_recommendations[0]['stream'] if al_recommendations else 'Science'
        stream_fallback_subjects = {
            'Combined Maths': ['Mathematics', 'Science', 'English'],
            'Bio Science': ['Science', 'Mathematics', 'English'],
            'Technology': ['Mathematics', 'Science', 'ICT'],
            'Commerce': ['Mathematics', 'English', 'History'],
            'Arts': ['Sinhala', 'English', 'History']
        }
        weak_subjects = stream_fallback_subjects.get(top_stream, ['Mathematics', 'English', 'Science'])

    student_data = df_performance[df_performance['student_id'] == student_id]
    row = student_data.iloc[0]

    # --- Collect all 4 facts ---
    avg_score       = student_data['score'].mean()          # 0-100
    iq_level        = float(row['iq_level'])                # ~70-150
    study_hours     = float(row['study_hours_per_week'])    # 0-40
    attendance_rate = float(row['attendance_rate'])         # 0-100

    # --- Normalise each fact to 0-100 scale ---
    score_norm      = avg_score                             # already 0-100
    iq_norm         = max(0, min(100, (iq_level - 70) / (150 - 70) * 100))
    hours_norm      = max(0, min(100, study_hours / 40 * 100))
    attend_norm     = max(0, min(100, attendance_rate))

    # --- Weighted composite score ---
    composite = (
        score_norm  * 0.40 +
        iq_norm     * 0.25 +
        hours_norm  * 0.20 +
        attend_norm * 0.15
    )

    # --- Difficulty level based on composite ---
    if composite < 40:
        preferred_level = 'Beginner'
    elif composite < 65:
        preferred_level = 'Intermediate'
    else:
        preferred_level = 'All Levels'

    recommendations = []

    # ── Extract specific weak topics per subject from priority_lessons ──
    subject_weak_topics = {}
    for lesson_entry in weak_areas.get('priority_lessons', []):
        subj = lesson_entry['subject']
        lesson_name = lesson_entry['lesson']
        if subj not in subject_weak_topics:
            subject_weak_topics[subj] = []
        # Extract topic name from lesson (e.g. 'Mathematics_sets' → 'sets')
        topic = lesson_name.split('_', 1)[-1] if '_' in lesson_name else lesson_name
        topic = topic.replace('_', ' ')
        subject_weak_topics[subj].append(topic)

    for subject in weak_subjects[:3]:
        subject_score = weak_areas['weak_subjects'].get(subject, 60)

        # --- Priority based on subject score ---
        if subject_score < 40:
            priority = 'Critical'
        elif subject_score < 55:
            priority = 'High'
        else:
            priority = 'Medium'

        # Get specific weak topics for this subject (if any)
        weak_topics_for_subject = subject_weak_topics.get(subject, None)

        # ── ML Model: recommend from trained TF-IDF model ──
        ml_resources = resource_recommender.recommend_with_model(
            subject=subject,
            level=preferred_level,
            top_n=3
        )

        if ml_resources:
            # Use ML recommendations
            for resource in ml_resources:
                recommendations.append({
                    'subject':          subject,
                    'title':            resource['title'],
                    'platform':         resource['platform'],
                    'url':              resource['url'],
                    'level':            resource['level'],
                    'type':             resource['type'],
                    'duration':         resource['duration'],
                    'rating':           resource['rating'],
                    'language':         resource['language'],
                    'topics':           resource['topics'],
                    'priority':         priority,
                    'relevance_score':  resource.get('relevance_score', 0),
                    'composite_score':  round(composite, 1),
                    'difficulty_basis': {
                        'avg_score':        round(score_norm, 1),
                        'iq_norm':          round(iq_norm, 1),
                        'study_hours_norm': round(hours_norm, 1),
                        'attendance_norm':  round(attend_norm, 1),
                    }
                })
        else:
            # Fallback: rule-based from config ONLINE_RESOURCES
            if subject in ONLINE_RESOURCES:
                subject_resources = ONLINE_RESOURCES[subject]
                level_matched = [r for r in subject_resources
                                 if r['level'] == preferred_level or r['level'] == 'All Levels']
                if not level_matched:
                    level_matched = subject_resources
                level_matched = sorted(level_matched, key=lambda x: x['rating'], reverse=True)
                for resource in level_matched[:2]:
                    recommendations.append({
                        'subject':          subject,
                        'title':            resource['title'],
                        'platform':         resource['platform'],
                        'url':              resource['url'],
                        'level':            resource['level'],
                        'type':             resource['type'],
                        'duration':         resource['duration'],
                        'rating':           resource['rating'],
                        'language':         resource['language'],
                        'topics':           resource['topics'],
                        'priority':         priority,
                        'relevance_score':  0,
                        'composite_score':  round(composite, 1),
                        'difficulty_basis': {
                            'avg_score':        round(score_norm, 1),
                            'iq_norm':          round(iq_norm, 1),
                            'study_hours_norm': round(hours_norm, 1),
                            'attendance_norm':  round(attend_norm, 1),
                        }
                    })

    return recommendations[:top_n]

def recommend_al_stream(student_id):
    student_data = df_performance[df_performance['student_id'] == student_id]

    subject_avg = student_data.groupby('subject')['score'].mean()
    overall_avg = student_data['score'].mean()

    iq = student_data['iq_level'].iloc[0]
    study_hours = student_data['study_hours_per_week'].iloc[0]
    student_type = student_data['student_type'].iloc[0]

    stream_scores = {}

    for stream, requirements in AL_STREAM_REQUIREMENTS.items():
        score = 0
        details = {
            'required_subjects_score': 0,
            'helpful_subjects_score': 0,
            'meets_minimum': False,
            'strength_alignment': 0
        }

        required_scores = []
        for subject in requirements['required_subjects']:
            if subject in subject_avg:
                required_scores.append(subject_avg[subject])

        if required_scores:
            required_avg = np.mean(required_scores)
            details['required_subjects_score'] = required_avg
            score += required_avg * 0.50

        helpful_scores = []
        for subject in requirements['helpful_subjects']:
            if subject in subject_avg:
                helpful_scores.append(subject_avg[subject])

        if helpful_scores:
            helpful_avg = np.mean(helpful_scores)
            details['helpful_subjects_score'] = helpful_avg
            score += helpful_avg * 0.20

        details['meets_minimum'] = overall_avg >= requirements['min_avg_score']
        if details['meets_minimum']:
            score += 10

        type_alignment = {
            'Combined Maths': {'science_oriented': 15, 'balanced': 5, 'practical': 10},
            'Bio Science': {'science_oriented': 15, 'balanced': 8, 'language_oriented': 3},
            'Technology': {'science_oriented': 12, 'practical': 15, 'balanced': 8},
            'Commerce': {'balanced': 15, 'language_oriented': 8, 'practical': 5},
            'Arts': {'language_oriented': 15, 'balanced': 10}
        }

        if stream in type_alignment and student_type in type_alignment[stream]:
            alignment_bonus = type_alignment[stream][student_type]
            details['strength_alignment'] = alignment_bonus
            score += alignment_bonus * 0.30

        stream_scores[stream] = {
            'total_score': score,
            'details': details,
            'required_avg': details['required_subjects_score'],
            'helpful_avg': details['helpful_subjects_score']
        }

    ranked_streams = sorted(stream_scores.items(),
                           key=lambda x: x[1]['total_score'],
                           reverse=True)

    recommendations = []
    for rank, (stream, data) in enumerate(ranked_streams, 1):
        stream_info = AL_STREAM_REQUIREMENTS[stream]

        if rank == 1 and data['details']['meets_minimum']:
            recommendation_strength = 'Highly Recommended'
        elif rank <= 2 and data['details']['meets_minimum']:
            recommendation_strength = 'Recommended'
        elif data['details']['meets_minimum']:
            recommendation_strength = 'Consider'
        else:
            recommendation_strength = 'Not Recommended (Below Minimum)'

        recommendations.append({
            'rank': rank,
            'stream': stream,
            'total_score': round(data['total_score'], 2),
            'required_subjects_avg': round(data['required_avg'], 2),
            'helpful_subjects_avg': round(data['helpful_avg'], 2),
            'meets_minimum': bool(data['details']['meets_minimum']), # Convert to native bool
            'min_required': stream_info['min_avg_score'],
            'recommendation_strength': recommendation_strength,
            'description': stream_info['description'],
            'career_paths': stream_info['career_paths']
        })

    return recommendations, subject_avg, overall_avg

def generate_complete_learning_path(student_id):
    weak_areas = identify_weak_subjects(student_id)
    resources = recommend_online_resources(student_id, top_n=10)
    al_recommendations, subject_scores, overall_avg = recommend_al_stream(student_id)
    
    student_info = df_performance[df_performance['student_id'] == student_id].iloc[0]

    learning_path = {
        'student_id': student_id,
        'current_performance': {
            'overall_avg': round(overall_avg, 2),
            'iq_level': float(student_info['iq_level']),
            'study_hours': float(student_info['study_hours_per_week']),
            'attendance_rate': float(student_info['attendance_rate']),
            'student_type': student_info['student_type']
        },
        'weak_subjects': weak_areas['weak_subjects'], # ensure this is dict
        'priority_lessons': weak_areas['priority_lessons'][:10],
        'online_resources': resources,
        'al_stream_recommendations': al_recommendations,
        'recommended_stream': al_recommendations[0]['stream'],
        'action_plan': []
    }

    if weak_areas['weak_subjects']:
        learning_path['action_plan'].append({
            'priority': 'Immediate',
            'action': f"Focus on weak subjects: {', '.join(list(weak_areas['weak_subjects'].keys())[:3])}",
            'timeline': '2-3 months'
        })
        learning_path['action_plan'].append({
            'priority': 'High',
            'action': f"Use recommended online resources ({len(resources)} resources identified)",
            'timeline': 'Ongoing'
        })

    if student_info['study_hours_per_week'] < 10:
        learning_path['action_plan'].append({
            'priority': 'High',
            'action': f"Increase study hours from {student_info['study_hours_per_week']:.1f} to at least 12 hours/week",
            'timeline': '1 month'
        })

    if student_info['attendance_rate'] < 85:
        learning_path['action_plan'].append({
            'priority': 'Critical',
            'action': f"Improve attendance from {student_info['attendance_rate']:.1f}% to above 90%",
            'timeline': 'Immediate'
        })

    learning_path['action_plan'].append({
        'priority': 'Planning',
        'action': f"Prepare for {learning_path['recommended_stream']} stream in A/L",
        'timeline': '6-12 months'
    })

    return learning_path

def get_cluster_distribution() -> List[Dict[str, Any]]:
    """Get cluster distribution with statistics"""
    if subject_performance is None or student_metrics is None:
        return []
    
    # Merge cluster and metrics
    merged = pd.merge(
        subject_performance[['student_id', 'cluster']], 
        student_metrics[['student_id', 'avg_score', 'student_type']], 
        on='student_id'
    )
    
    cluster_stats = []
    for cluster_num in sorted(merged['cluster'].unique()):
        cluster_data = merged[merged['cluster'] == cluster_num]
        
        # Get student type distribution
        type_counts = cluster_data['student_type'].value_counts().to_dict()
        
        cluster_stats.append({
            'cluster': int(cluster_num),
            'count': int(len(cluster_data)),
            'avg_score': round(float(cluster_data['avg_score'].mean()), 2),
            'student_types': type_counts
        })
    
    return cluster_stats

def add_new_student(student_data: Dict[str, Any]) -> Dict[str, Any]:
    """Add a new student to the dataset and assign cluster"""
    global df_performance, student_metrics, subject_performance
    
    if df_performance is None:
        raise ValueError("Data not loaded")
    
    student_id = student_data['student_id']
    
    # Check if student already exists
    if student_id in df_performance['student_id'].values:
        raise ValueError(f"Student {student_id} already exists")
    
    # Get CSV file path at project root: .../unified-project/data/...
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
    csv_path = os.path.join(project_root, "data", "academic_performance_1000_students_with_iq_study_hours.csv")
    
    # Create new rows for each subject (matching CSV structure)
    subjects = ['Sinhala', 'Mathematics', 'Science', 'English', 'History', 'Buddhism', 'Geography', 'ICT']
    new_rows = []
    
    for subject in subjects:
        score = student_data['subject_scores'].get(subject, 0)
        
        # Create a row matching the CSV format
        new_row = {
            'student_id': student_id,
            'subject': subject,
            'lesson': f"{subject}_Lesson_1",  # Default lesson
            'score': score,
            'iq_level': student_data['iq_level'],
            'study_hours_per_week': student_data['study_hours_per_week'],
            'attendance_rate': student_data['attendance_rate'],
            'student_type': student_data['student_type']
        }
        new_rows.append(new_row)
    
    # Add to DataFrame
    new_df = pd.DataFrame(new_rows)
    df_performance = pd.concat([df_performance, new_df], ignore_index=True)
    
    # Save to CSV
    df_performance.to_csv(csv_path, index=False)
    
    # Recalculate metrics and clustering
    recalculate_after_new_student()
    
    # Get cluster assignment for new student
    cluster = subject_performance[subject_performance['student_id'] == student_id]['cluster'].values[0]
    avg_score = student_data['subject_scores']
    avg_score_val = sum(avg_score.values()) / len(avg_score) if avg_score else 0
    
    return {
        'student_id': student_id,
        'cluster': int(cluster),
        'avg_score': round(avg_score_val, 2),
        'message': 'Student added successfully'
    }

def recalculate_after_new_student():
    """Recalculate student metrics and clustering after adding new student"""
    global student_metrics, subject_performance
    
    # Recalculate student-level metrics
    student_metrics = df_performance.groupby('student_id').agg({
        'score': ['mean', 'std', 'min', 'max'],
        'iq_level': 'first',
        'study_hours_per_week': 'first',
        'attendance_rate': 'first',
        'student_type': 'first'
    }).reset_index()
    
    student_metrics.columns = ['student_id', 'avg_score', 'score_std', 'min_score',
                                'max_score', 'iq_level', 'study_hours', 'attendance_rate',
                                'student_type']
    
    # Recalculate subject-wise performance
    subject_performance = df_performance.pivot_table(
        index='student_id',
        columns='subject',
        values='score',
        aggfunc='mean'
    ).reset_index()
    
    # Re-assign clusters — same 11-feature set as perform_clustering()
    subjects = ['Sinhala', 'Mathematics', 'Science', 'English', 'History',
                'Buddhism', 'Geography', 'ICT']

    X_subjects = subject_performance[subjects].fillna(
        subject_performance[subjects].mean()
    )
    extra = student_metrics[['student_id', 'iq_level',
                              'study_hours', 'attendance_rate']].copy()
    merged = subject_performance[['student_id']].merge(
        extra, on='student_id', how='left'
    )
    X_extra = merged[['iq_level', 'study_hours', 'attendance_rate']].fillna(
        merged[['iq_level', 'study_hours', 'attendance_rate']].mean()
    )
    X_cluster = pd.concat(
        [X_subjects.reset_index(drop=True),
         X_extra.reset_index(drop=True)],
        axis=1
    )

    if scaler is not None and kmeans_model is not None:
        X_scaled = scaler.transform(X_cluster)
        clusters = kmeans_model.predict(X_scaled)
        subject_performance['cluster'] = clusters + 1

# Method 1: Min-Max Normalization (0 to 1)
# Formula: (value - min) / (max - min)

def normalize_features(df):
    """
    Normalize all features to 0-1 scale for fair clustering
    """
    normalized = pd.DataFrame()
    
    # IQ Level: typically 70-150 range
    normalized['iq_normalized'] = (df['iq_level'] - 70) / (150 - 70)
    # Example: IQ 120 → (120-70)/(150-70) = 50/80 = 0.625
    
    # Study Hours: 0-40 hours per week
    normalized['hours_normalized'] = df['study_hours_per_week'] / 40
    # Example: 25 hours → 25/40 = 0.625
    
    # Attendance Rate: already 0-100%
    normalized['attendance_normalized'] = df['attendance_rate'] / 100
    # Example: 95% → 95/100 = 0.95
    
    # Average Score: 0-100%
    normalized['score_normalized'] = df['avg_score'] / 100
    # Example: 85% → 85/100 = 0.85
    
    return normalized
