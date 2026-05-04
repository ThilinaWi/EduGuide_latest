"""
Test MongoDB Integration
1. New Student MongoDB add 
2. Automatically weekly schedule generate 
3. Study materials recommend 
4. A/L path suggestions generate 
"""

from core.mongodb_handler import mongodb_handler
import json

def test_add_student():
    print("=" * 80)
    print("🎓 STUDENT MONITORING SYSTEM - MongoDB Integration Test")
    print("=" * 80)
    
    # Example 1: Science stream student
    science_student = {
        "student_id": "STU001",
        "name": "Kasun Perera",
        "age": 16,
        "current_grade": 11,
        "interested_stream": "Science",
        "strengths": ["Mathematics", "Physics"],
        "weaknesses": ["Chemistry"],
        "iq_level": 115.5,
        "study_hours_per_week": 25,
        "attendance_rate": 92.5,
        "student_type": "High Performer",
        "subject_scores": {
            "Mathematics": 85,
            "Physics": 88,
            "Chemistry": 72,
            "Biology": 80,
            "English": 78
        }
    }
    
    print("\n📝 Adding Science Stream Student...")
    print(f"   Name: {science_student['name']}")
    print(f"   Stream: {science_student['interested_stream']}")
    print(f"   Grade: {science_student['current_grade']}")
    
    result = mongodb_handler.add_student_with_recommendations(science_student)
    
    print(f"\n✅ {result['message']}")
    print(f"   Student ID: {result['student_id']}")
    print(f"   MongoDB ID: {result['mongodb_id']}")
    
    # Display Weekly Schedule
    print("\n" + "=" * 80)
    print("📅 WEEKLY SCHEDULE (සතියේ කාලසටහන)")
    print("=" * 80)
    for day in result['weekly_schedule']:
        print(f"\n{day['day']}:")
        print(f"   Subjects: {', '.join(day['subjects'])}")
        print(f"   Duration: {day['duration']}")
    
    # Display Study Materials
    print("\n" + "=" * 80)
    print("📚 RECOMMENDED STUDY MATERIALS (නිර්දේශිත පොත්)")
    print("=" * 80)
    for material in result['recommended_materials'][:3]:  # Show first 3
        print(f"\n{material['subject']}:")
        for book in material['materials']:
            print(f"   • {book}")
    
    # Display A/L Path
    print("\n" + "=" * 80)
    print("🎯 A/L PATH SUGGESTION (උසස් පෙළ මාර්ගය)")
    print("=" * 80)
    al_path = result['al_path']
    print(f"\nStream: {al_path['stream']}")
    print(f"\nSubjects:")
    for key, subjects in al_path['subjects'].items():
        print(f"   {key}: {', '.join(subjects)}")
    
    print(f"\n🎓 Career Paths (වෘත්තීය මාර්ග):")
    for i, career in enumerate(al_path['career_paths'][:5], 1):
        print(f"   {i}. {career}")
    
    print(f"\n🏛️ Universities:")
    for uni in al_path['universities'][:3]:
        print(f"   • {uni}")
    
    print(f"\n📊 Target Z-Score: {al_path['target_z_score']}")
    
    print(f"\n💡 Study Tips:")
    for i, tip in enumerate(al_path['study_tips'][:4], 1):
        print(f"   {i}. {tip}")
    
    print("\n" + "=" * 80)
    
    # Example 2: Commerce stream student
    print("\n\n📝 Adding Commerce Stream Student...")
    commerce_student = {
        "student_id": "STU002",
        "name": "Nethmi Silva",
        "age": 17,
        "current_grade": 12,
        "interested_stream": "Commerce",
        "strengths": ["Accounting", "Business Studies"],
        "weaknesses": ["Economics"],
        "iq_level": 110.0,
        "study_hours_per_week": 22,
        "attendance_rate": 95.0,
        "student_type": "Medium Performer",
        "subject_scores": {
            "Accounting": 82,
            "Business Studies": 85,
            "Economics": 68,
            "Statistics": 75,
            "English": 80
        }
    }
    
    print(f"   Name: {commerce_student['name']}")
    print(f"   Stream: {commerce_student['interested_stream']}")
    
    result2 = mongodb_handler.add_student_with_recommendations(commerce_student)
    print(f"\n✅ {result2['message']}")
    
    # Example 3: Arts stream student
    print("\n\n📝 Adding Arts Stream Student...")
    arts_student = {
        "student_id": "STU003",
        "name": "Ravindu Fernando",
        "age": 16,
        "current_grade": 11,
        "interested_stream": "Arts",
        "strengths": ["History", "Sinhala"],
        "weaknesses": ["Geography"],
        "iq_level": 108.5,
        "study_hours_per_week": 20,
        "attendance_rate": 88.0,
        "student_type": "Medium Performer",
        "subject_scores": {
            "Sinhala": 78,
            "History": 82,
            "Geography": 65,
            "Political Science": 75,
            "English": 72
        }
    }
    
    print(f"   Name: {arts_student['name']}")
    print(f"   Stream: {arts_student['interested_stream']}")
    
    result3 = mongodb_handler.add_student_with_recommendations(arts_student)
    print(f"\n✅ {result3['message']}")
    
    # Get all students from MongoDB
    print("\n" + "=" * 80)
    print("👥 ALL STUDENTS IN DATABASE")
    print("=" * 80)
    
    all_students = mongodb_handler.get_all_students()
    print(f"\nTotal Students: {len(all_students)}")
    
    for student in all_students:
        print(f"\n   • {student['name']} ({student['student_id']})")
        print(f"     Stream: {student['interested_stream']}")
        print(f"     Grade: {student['current_grade']}")
        print(f"     Created: {student['created_at'][:10]}")
    
    print("\n" + "=" * 80)
    print("✅ TEST COMPLETED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    try:
        test_add_student()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
