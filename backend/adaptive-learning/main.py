from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime
import os
import random
import string
from core import analysis
from core.mongodb_handler import mongodb_handler
from models.student import (
    StudentSummary, LearningPath, NewStudentInput, ClusterDistribution,
    NewStudentInputExtended, StudentFullProfile
)

app = FastAPI(title="Student Monitoring System API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_student_id():
    """Auto-generate a unique student ID"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = ''.join(random.choices(string.digits, k=4))
    return f"STU{timestamp}{random_suffix}"


def infer_stream(subject_scores: dict) -> str:
    """Infer the most suitable A/L stream from subject scores."""
    return mongodb_handler.infer_stream_from_subject_scores(subject_scores)

@app.on_event("startup")
async def startup_event():
    # Resolve project root robustly: .../unified-project/backend/adaptive-learning/main.py -> .../unified-project
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(current_dir))
    data_path = os.path.join(project_root, "data", "academic_performance_1000_students_with_iq_study_hours.csv")
    
    if os.path.exists(data_path):
        analysis.load_data(data_path)
    else:
        print(f"WARNING: Data file not found at {data_path}")

@app.get("/")
async def read_root():
    return {"message": "Welcome to Student Monitoring System API"}

@app.get("/students", response_model=List[StudentSummary])
async def get_students():
    """Get a list of all students with summary info."""
    students = analysis.get_all_students_summary()
    return students

@app.get("/students/{student_id}", response_model=LearningPath)
async def get_student(student_id: str):
    """Get detailed learning path for a student."""
    student_data = analysis.get_student_details(student_id)
    if not student_data:
        raise HTTPException(status_code=404, detail="Student not found")
    return student_data

@app.get("/clusters", response_model=List[ClusterDistribution])
async def get_cluster_distribution():
    """Get cluster distribution statistics"""
    try:
        clusters = analysis.get_cluster_distribution()
        return clusters
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/students/add")
async def add_student(student: NewStudentInput):
    """Add a new student - saves to MongoDB with recommendations for weak subjects"""
    try:
        # Auto-generate student ID if not provided or empty
        if not student.student_id or student.student_id.strip() == "":
            generated_id = generate_student_id()
        else:
            generated_id = student.student_id.strip().upper()

        inferred_stream = infer_stream(student.subject_scores)
        
        # Convert to extended format for MongoDB
        student_data = {
            "student_id": generated_id,
            "name": generated_id,  # Default name to student_id
            "age": 16,  # Default age
            "current_grade": 11,  # Default grade
            "interested_stream": inferred_stream,
            "strengths": [],
            "weaknesses": [],
            "iq_level": student.iq_level,
            "study_hours_per_week": student.study_hours_per_week,
            "attendance_rate": student.attendance_rate,
            "student_type": student.student_type,
            "subject_scores": student.subject_scores
        }
        
        # Identify weak subjects and get recommendations
        weak_analysis = mongodb_handler.identify_weak_subjects_and_recommend(
            student.subject_scores, 
            threshold=60
        )
        
        # Add student to MongoDB with all recommendations
        weekly_schedule = mongodb_handler.generate_weekly_schedule(inferred_stream)
        study_materials = mongodb_handler.recommend_study_materials(inferred_stream)
        al_path = mongodb_handler.suggest_al_path(inferred_stream)
        
        # Prepare student document with weak subject analysis
        student_doc = {
            "student_id": student_data['student_id'],
            "name": student_data['name'],
            "age": student_data['age'],
            "current_grade": student_data['current_grade'],
            "interested_stream": inferred_stream,
            "strengths": student_data.get('strengths', []),
            "weaknesses": list(weak_analysis['weak_subjects'].keys()),
            "iq_level": student_data.get('iq_level', 0),
            "study_hours_per_week": student_data.get('study_hours_per_week', 0),
            "attendance_rate": student_data.get('attendance_rate', 0),
            "student_type": student_data.get('student_type', ''),
            "subject_scores": student_data.get('subject_scores', {}),
            "weak_subject_analysis": weak_analysis,  # Add weak subject analysis
            "weekly_schedule": weekly_schedule,
            "recommended_materials": study_materials,
            "al_path": al_path,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Insert to MongoDB only when connected (offline mode should still work)
        mongodb_id = None
        if mongodb_handler.connected and mongodb_handler.students_collection is not None:
            try:
                result = mongodb_handler.students_collection.insert_one(student_doc)
                mongodb_id = str(result.inserted_id)
            except Exception as db_error:
                print(f"WARNING: Failed to save student to MongoDB: {db_error}")
        
        # Also add to existing CSV-based analysis system for cluster assignment
        basic_student_data = {
            "student_id": generated_id,
            "iq_level": student.iq_level,
            "study_hours_per_week": student.study_hours_per_week,
            "attendance_rate": student.attendance_rate,
            "student_type": student.student_type,
            "subject_scores": student.subject_scores
        }
        analysis_result = analysis.add_new_student(basic_student_data)
        learning_path = analysis.generate_complete_learning_path(generated_id)
        
        return {
            "success": True,
            "message": "Student added successfully with weak subject recommendations!" + (" (saved to MongoDB)" if mongodb_id else " (offline mode)"),
            "student_id": generated_id,
            "mongodb_id": mongodb_id,
            "cluster": analysis_result.get('cluster'),
            "avg_score": analysis_result.get('avg_score'),
            "weak_subjects": weak_analysis['weak_subjects'],
            "weak_subjects_count": weak_analysis['weak_subjects_count'],
            "recommendations": weak_analysis['recommendations'],
            "overall_advice": weak_analysis['overall_advice'],
            "online_resources": learning_path.get('online_resources', []),
            "learning_path": learning_path
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/students/add-extended")
async def add_student_extended(student: NewStudentInputExtended):
    """Add a new student with MongoDB integration - generates weekly schedule, study materials, and A/L path"""
    try:
        # Add to MongoDB with all recommendations
        result = mongodb_handler.add_student_with_recommendations(student.dict())
        
        # Also add to existing analysis system
        basic_student_data = {
            "student_id": student.student_id,
            "iq_level": student.iq_level,
            "study_hours_per_week": student.study_hours_per_week,
            "attendance_rate": student.attendance_rate,
            "student_type": student.student_type,
            "subject_scores": student.subject_scores
        }
        analysis_result = analysis.add_new_student(basic_student_data)
        
        # Combine results
        result['cluster'] = analysis_result.get('cluster')
        result['learning_path'] = analysis_result.get('learning_path')
        
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/students/mongodb/{student_id}", response_model=StudentFullProfile)
async def get_student_from_mongodb(student_id: str):
    """Get complete student profile from MongoDB with all recommendations"""
    try:
        student = mongodb_handler.get_student_by_id(student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student not found in MongoDB")

        try:
            learning_path = analysis.generate_complete_learning_path(student_id)
        except Exception:
            learning_path = {}
        
        # Convert to response model
        return StudentFullProfile(
            student_id=student['student_id'],
            name=student['name'],
            age=student['age'],
            current_grade=student['current_grade'],
            interested_stream=student['interested_stream'],
            strengths=student['strengths'],
            weaknesses=student['weaknesses'],
            current_performance={
                "overall_avg": sum(student['subject_scores'].values()) / len(student['subject_scores']) if student['subject_scores'] else 0,
                "iq_level": student['iq_level'],
                "study_hours": student['study_hours_per_week'],
                "attendance_rate": student['attendance_rate'],
                "student_type": student['student_type']
            },
            weekly_schedule=student['weekly_schedule'],
            recommended_materials=student['recommended_materials'],
            online_resources=learning_path.get('online_resources', student.get('online_resources', [])),
            al_path=student['al_path'],
            created_at=student['created_at']
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)

@app.get("/students/mongodb/all/list")
async def get_all_students_from_mongodb():
    """Get all students from MongoDB"""
    try:
        students = mongodb_handler.get_all_students()
        return {
            "total": len(students),
            "students": students
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
