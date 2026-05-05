"""
O/L Resource Recommendation Model (Sri Lanka)
===============================================
Content-Based Filtering using TF-IDF + Cosine Similarity.

How it works:
  1. Load ol_resources.csv (resources with subject, level, language, topics)
  2. Build a TF-IDF matrix over combined text features
  3. For a given student weak subject + level, compute cosine similarity
  4. Return top-N matching resources

Usage:
  from core.resource_recommender import train_resource_model, recommend_with_model
  train_resource_model()
  results = recommend_with_model('Mathematics', 'Beginner', top_n=3)
"""

import os
import pickle
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Paths — go up: core/ → adaptive-learning/ → backend/ → project root
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
RESOURCES_CSV = os.path.join(BASE_DIR, 'data', 'ol_resources.csv')
MODEL_PKL = os.path.join(BASE_DIR, 'data', 'resource_model.pkl')



def _build_feature_text(row):
    """Combine resource fields into a single feature string for TF-IDF."""
    parts = [
        str(row.get('subject', '')),
        str(row.get('level', '')),
        str(row.get('type', '')),
        str(row.get('language', '')),
        str(row.get('topics', '')),
        str(row.get('platform', '')),
    ]
    return ' '.join(parts).lower()


def train_resource_model():
    """
    Train and save the TF-IDF recommendation model.

    Reads ol_resources.csv, builds a TF-IDF matrix, and saves:
      - The TF-IDF vectorizer
      - The TF-IDF matrix
      - The resource dataframe

    Saved to: data/resource_model.pkl
    """
    if not os.path.exists(RESOURCES_CSV):
        print(f"[ResourceRecommender] CSV not found: {RESOURCES_CSV}")
        return False

    df = pd.read_csv(RESOURCES_CSV, encoding='utf-8')
    df = df.fillna('')

    # Build combined feature text for each resource
    df['feature_text'] = df.apply(_build_feature_text, axis=1)

    # Train TF-IDF vectorizer
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=500,
        stop_words='english'
    )
    tfidf_matrix = vectorizer.fit_transform(df['feature_text'])

    # Save model and data
    model_data = {
        'vectorizer': vectorizer,
        'tfidf_matrix': tfidf_matrix,
        'resources_df': df,
    }
    with open(MODEL_PKL, 'wb') as f:
        pickle.dump(model_data, f)

    print(f"[ResourceRecommender] Model trained with {len(df)} resources. Saved to {MODEL_PKL}")
    return True


def _load_model():
    """Load the saved model from disk."""
    if not os.path.exists(MODEL_PKL):
        print("[ResourceRecommender] Model not found. Training now...")
        success = train_resource_model()
        if not success:
            return None

    with open(MODEL_PKL, 'rb') as f:
        return pickle.load(f)


def recommend_with_model(subject: str, level: str = 'All Levels', top_n: int = 3):
    """
    Recommend resources for a weak subject using the trained TF-IDF model.

    Args:
        subject  : O/L subject name ('Mathematics', 'Science', etc.)
        level    : Student level ('Beginner', 'Intermediate', 'All Levels')
        top_n    : Number of recommendations to return

    Returns:
        List of dicts with resource info, sorted by relevance score then rating.
    """
    model_data = _load_model()
    if model_data is None:
        return []

    vectorizer = model_data['vectorizer']
    tfidf_matrix = model_data['tfidf_matrix']
    df = model_data['resources_df']

    # Build a query from the student's weak subject + level
    query_parts = [subject.lower(), level.lower()]
    # Add Sinhala preference to query
    query_parts.append('sinhala')
    query_text = ' '.join(query_parts)

    # Transform query to TF-IDF space
    query_vec = vectorizer.transform([query_text])

    # Compute cosine similarity against all resources
    cos_scores = cosine_similarity(query_vec, tfidf_matrix).flatten()

    # Filter to only resources matching the subject (exact match first)
    subject_mask = df['subject'].str.lower() == subject.lower()
    subject_indices = df.index[subject_mask].tolist()

    if not subject_indices:
        # Fallback: use all resources
        subject_indices = list(df.index)

    # Get scores for filtered resources
    filtered_scores = [(idx, cos_scores[idx]) for idx in subject_indices]

    # Sort by cosine similarity (desc), then by rating (desc)
    filtered_scores.sort(key=lambda x: (x[1], float(df.loc[x[0], 'rating'])), reverse=True)

    # Take top_n
    top_resources = []
    seen_platforms = set()
    for idx, score in filtered_scores:
        if len(top_resources) >= top_n:
            break
        row = df.loc[idx]
        platform = str(row.get('platform', ''))

        # Avoid returning 2 resources from same platform (diversity)
        if platform in seen_platforms and len(top_resources) < top_n:
            continue
        seen_platforms.add(platform)

        top_resources.append({
            'resource_id': str(row.get('resource_id', '')),
            'title': str(row.get('title', '')),
            'platform': platform,
            'url': str(row.get('url', '')),
            'level': str(row.get('level', '')),
            'type': str(row.get('type', '')),
            'language': str(row.get('language', '')),
            'rating': float(row.get('rating', 4.5)),
            'duration': str(row.get('duration', 'Self-paced')),
            'topics': str(row.get('topics', '')),
            'relevance_score': round(float(score), 3),
            'subject': subject,
        })

    return top_resources


def retrain_if_needed():
    """Call on startup — retrain model if CSV is newer than pkl, or pkl missing."""
    if not os.path.exists(MODEL_PKL):
        train_resource_model()
        return

    pkl_mtime = os.path.getmtime(MODEL_PKL)
    csv_mtime = os.path.getmtime(RESOURCES_CSV) if os.path.exists(RESOURCES_CSV) else 0

    if csv_mtime > pkl_mtime:
        print("[ResourceRecommender] CSV updated — retraining model...")
        train_resource_model()


# Auto-train on import if model doesn't exist
if __name__ == '__main__':
    train_resource_model()
    print("\nTest recommendation for Mathematics (Beginner):")
    recs = recommend_with_model('Mathematics', 'Beginner', top_n=3)
    for r in recs:
        print(f"  [{r['relevance_score']}] {r['title']} — {r['platform']}")

    print("\nTest recommendation for Science (All Levels):")
    recs = recommend_with_model('Science', 'All Levels', top_n=3)
    for r in recs:
        print(f"  [{r['relevance_score']}] {r['title']} — {r['platform']}")
