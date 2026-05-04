from pymongo import MongoClient
from datetime import datetime
from typing import Dict, List, Any
import os

class MongoDBHandler:
    def __init__(self):
        # MongoDB Atlas connection
        self.client = None
        self.db = None
        self.students_collection = None
        self.connected = False
        
        try:
            password = "1234"
            connection_string = f"mongodb+srv://admin:{password}@paf.spi8fnl.mongodb.net/"
            
            # Try to connect with timeout
            self.client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
            # Test connection
            self.client.admin.command('ping')
            self.db = self.client['student_monitoring_db']
            self.students_collection = self.db['students']
            self.connected = True
            print("✅ SUCCESS: Successfully connected to MongoDB Atlas!")
        except Exception as e:
            print(f"⚠️ WARNING: MongoDB connection failed: {e}")
            print("📌 Running in OFFLINE mode - data will not be saved to database")
            self.connected = False

    def generate_weekly_schedule(self, stream: str) -> List[Dict[str, Any]]:
        """Generate weekly subject schedule based on stream"""
        schedules = {
            "Science": [
                {"day": "සදුදා (Monday)", "subjects": ["Mathematics", "Physics"], "duration": "2 hours each"},
                {"day": "අඟහරුවාදා (Tuesday)", "subjects": ["Chemistry", "Biology"], "duration": "2 hours each"},
                {"day": "බදාදා (Wednesday)", "subjects": ["Mathematics", "Combined Maths"], "duration": "2 hours each"},
                {"day": "බ්‍රහස්පතින්දා (Thursday)", "subjects": ["Physics", "Chemistry"], "duration": "2 hours each"},
                {"day": "සිකුරාදා (Friday)", "subjects": ["Biology", "General English"], "duration": "2 hours each"},
                {"day": "සෙනසුරාදා (Saturday)", "subjects": ["Revision & Practice Tests"], "duration": "4 hours"},
                {"day": "ඉරිදා (Sunday)", "subjects": ["Weak subjects focus"], "duration": "3 hours"}
            ],
            "Commerce": [
                {"day": "සදුදා (Monday)", "subjects": ["Accounting", "Economics"], "duration": "2 hours each"},
                {"day": "අඟහරුවාදා (Tuesday)", "subjects": ["Business Studies", "Accounting"], "duration": "2 hours each"},
                {"day": "බදාදා (Wednesday)", "subjects": ["Economics", "Statistics"], "duration": "2 hours each"},
                {"day": "බ්‍රහස්පතින්දා (Thursday)", "subjects": ["Business Studies", "General English"], "duration": "2 hours each"},
                {"day": "සිකුරාදා (Friday)", "subjects": ["Accounting", "Economics"], "duration": "2 hours each"},
                {"day": "සෙනසුරාදා (Saturday)", "subjects": ["Revision & Practice Tests"], "duration": "4 hours"},
                {"day": "ඉරිදා (Sunday)", "subjects": ["Weak subjects focus"], "duration": "3 hours"}
            ],
            "Arts": [
                {"day": "සදුදා (Monday)", "subjects": ["Sinhala", "History"], "duration": "2 hours each"},
                {"day": "අඟහරුවාදා (Tuesday)", "subjects": ["Geography", "Political Science"], "duration": "2 hours each"},
                {"day": "බදාදා (Wednesday)", "subjects": ["Economics", "Logic"], "duration": "2 hours each"},
                {"day": "බ්‍රහස්පතින්දා (Thursday)", "subjects": ["Sinhala", "General English"], "duration": "2 hours each"},
                {"day": "සිකුරාදා (Friday)", "subjects": ["History", "Geography"], "duration": "2 hours each"},
                {"day": "සෙනසුරාදා (Saturday)", "subjects": ["Revision & Practice Tests"], "duration": "4 hours"},
                {"day": "ඉරිදා (Sunday)", "subjects": ["Weak subjects focus"], "duration": "3 hours"}
            ]
        }
        
        return schedules.get(stream, schedules["Science"])
    
    def recommend_study_materials(self, stream: str) -> List[Dict[str, Any]]:
        """Recommend study materials based on stream"""
        materials = {
            "Science": [
                {
                    "subject": "Mathematics",
                    "materials": [
                        "Siyawara A/L Mathematics Book",
                        "Perera & Karunaratne Mathematics",
                        "Past Papers (2015-2024)",
                        "Vinodh Academy MCQ Book"
                    ]
                },
                {
                    "subject": "Physics",
                    "materials": [
                        "Ranjith Jayawardena Physics",
                        "Past Papers with Answers",
                        "Practicals Guide Book",
                        "MCQ Practice Book"
                    ]
                },
                {
                    "subject": "Chemistry",
                    "materials": [
                        "Ranjith Jayawardena Chemistry",
                        "Past Papers Collection",
                        "Lab Manual & Practicals",
                        "Organic Chemistry Guide"
                    ]
                },
                {
                    "subject": "Biology",
                    "materials": [
                        "Chandima Mapatuna Biology",
                        "Past Papers (Last 10 years)",
                        "Practical Guide Book",
                        "Diagrams & Charts Collection"
                    ]
                },
                {
                    "subject": "Combined Maths",
                    "materials": [
                        "Siyawara Combined Maths",
                        "Past Papers with Solutions",
                        "Model Papers Book",
                        "Formula Sheet & Practice"
                    ]
                }
            ],
            "Commerce": [
                {
                    "subject": "Accounting",
                    "materials": [
                        "Wijesinghe Accounting Book",
                        "Past Papers (2015-2024)",
                        "Practice MCQ Book",
                        "Double Entry Practice Book"
                    ]
                },
                {
                    "subject": "Economics",
                    "materials": [
                        "Ariyaratne Economics",
                        "Past Papers with Essays",
                        "Essay Writing Practice",
                        "MCQ Practice Book"
                    ]
                },
                {
                    "subject": "Business Studies",
                    "materials": [
                        "Business Studies Textbook",
                        "Past Papers Collection",
                        "Case Studies Book",
                        "Model Answers Guide"
                    ]
                },
                {
                    "subject": "Statistics",
                    "materials": [
                        "Statistics Handbook",
                        "Past Papers",
                        "Formula Sheet",
                        "Practice Questions Book"
                    ]
                }
            ],
            "Arts": [
                {
                    "subject": "Sinhala",
                    "materials": [
                        "සාහිත්‍ය කලාව (Sahithya Kalawa)",
                        "Past Papers Collection",
                        "Essay Writing Guide",
                        "Grammar Book"
                    ]
                },
                {
                    "subject": "History",
                    "materials": [
                        "History Textbooks (All 3)",
                        "Past Papers (2015-2024)",
                        "Timeline Charts",
                        "Map Practice Book"
                    ]
                },
                {
                    "subject": "Geography",
                    "materials": [
                        "Geography Atlas",
                        "Past Papers",
                        "Map Practice Guide",
                        "Diagrams Collection"
                    ]
                },
                {
                    "subject": "Political Science",
                    "materials": [
                        "Political Science Guide",
                        "Past Papers",
                        "Constitution Book",
                        "Current Affairs Notes"
                    ]
                }
            ]
        }
        
        return materials.get(stream, materials["Science"])
    
    def suggest_al_path(self, stream: str) -> Dict[str, Any]:
        """Suggest A/L path with career guidance"""
        paths = {
            "Science": {
                "stream": "Physical Science / Biological Science",
                "subjects": {
                    "Physical Science": ["Combined Maths", "Physics", "Chemistry"],
                    "Biological Science": ["Biology", "Chemistry", "Physics"]
                },
                "career_paths": [
                    "MBBS (Medicine)",
                    "Engineering (Moratuwa/Peradeniya/Ruhuna)",
                    "Pharmacy",
                    "Dental Surgery",
                    "Veterinary Science",
                    "Agricultural Science",
                    "Physical Science Degrees",
                    "Architecture"
                ],
                "universities": [
                    "University of Colombo",
                    "University of Peradeniya",
                    "University of Moratuwa",
                    "University of Kelaniya",
                    "University of Ruhuna",
                    "University of Sri Jayewardenepura"
                ],
                "target_z_score": "1.8 - 2.0+ (for Medicine & Engineering)",
                "study_tips": [
                    "පසුගිය අවුරුදු 10-15 ක past papers හොඳින් කරන්න",
                    "MCQ questions දිනපතා practice කරන්න",
                    "Concepts හොඳින් තේරුම් ගන්න, recite කරන්න එපා",
                    "Practicals හොඳින් complete කරන්න",
                    "Revision classes වලට regular යන්න",
                    "Study group එකක් හදාගන්න",
                    "Model papers ඉවර කරලා time management practice කරන්න"
                ]
            },
            "Commerce": {
                "stream": "Commerce",
                "subjects": {
                    "Main Subjects": ["Accounting", "Economics", "Business Studies"]
                },
                "career_paths": [
                    "CA Sri Lanka (Chartered Accountant)",
                    "Business Management Degree",
                    "Banking & Finance",
                    "Marketing & Management",
                    "Human Resource Management",
                    "Accounting & Finance Degrees",
                    "Economics Degrees"
                ],
                "universities": [
                    "University of Colombo",
                    "University of Sri Jayewardenepura",
                    "University of Kelaniya",
                    "University of Ruhuna",
                    "Sabaragamuwa University"
                ],
                "target_z_score": "1.5 - 1.8+ (for top courses)",
                "study_tips": [
                    "Accounting විෂයට වැඩි අවධානයක් දෙන්න",
                    "Economics වලට daily newspaper කියවන්න",
                    "Essay writing practice කරන්න",
                    "Real business cases study කරන්න",
                    "Past papers complete කරන්න",
                    "MCQ practice regular කරන්න",
                    "Current economic issues follow කරන්න"
                ]
            },
            "Arts": {
                "stream": "Arts",
                "subjects": {
                    "Common Subjects": ["Based on student interest - Sinhala, History, Geography, etc."]
                },
                "career_paths": [
                    "Law (University of Colombo)",
                    "Teaching",
                    "Mass Communication & Journalism",
                    "Social Sciences",
                    "Languages & Translation",
                    "Public Administration",
                    "Psychology",
                    "Sociology"
                ],
                "universities": [
                    "University of Colombo",
                    "University of Peradeniya",
                    "University of Kelaniya",
                    "University of Ruhuna",
                    "University of Jaffna"
                ],
                "target_z_score": "1.2 - 1.6+ (varies by subject combination)",
                "study_tips": [
                    "Essay writing skills develop කරන්න",
                    "පුළුල් කියවීමක් කරන්න",
                    "Current affairs හොඳින් follow කරන්න",
                    "Structured answers practice කරන්න",
                    "Analytical thinking develop කරන්න",
                    "Past papers හොඳින් practice කරන්න",
                    "විෂයයන්ට අදාළ extra reading කරන්න"
                ]
            }
        }
        
        return paths.get(stream, paths["Science"])
    
    def identify_weak_subjects_and_recommend(self, subject_scores: Dict[str, float], threshold: float = 60) -> Dict[str, Any]:
        """Identify weak subjects and recommend specific materials"""
        weak_subjects = {}
        recommendations = []
        
        # Find weak subjects (below threshold)
        for subject, score in subject_scores.items():
            if score < threshold:
                weak_subjects[subject] = score
        
        # Sort by score (weakest first)
        sorted_weak = sorted(weak_subjects.items(), key=lambda x: x[1])
        
        # Material recommendations for weak subjects
        material_database = {
            "Sinhala": [
                {"title": "සිංහල භාෂාව හා සාහිත්‍යය - මූලික පොත", "type": "Textbook", "priority": "High"},
                {"title": "YouTube - Sinhala Lessons by Maithree", "type": "Video", "priority": "High"},
                {"title": "Grammar Practice Book", "type": "Workbook", "priority": "Medium"}
            ],
            "Mathematics": [
                {"title": "Siyawara Mathematics - Complete Guide", "type": "Textbook", "priority": "High"},
                {"title": "Mathematics MCQ Practice Book", "type": "Workbook", "priority": "High"},
                {"title": "Khan Academy Mathematics (Sinhala)", "type": "Online", "priority": "Medium"},
                {"title": "Past Papers (Last 5 years)", "type": "Practice", "priority": "High"}
            ],
            "Science": [
                {"title": "Science Textbook - Grade Level", "type": "Textbook", "priority": "High"},
                {"title": "Practical Science Guide", "type": "Workbook", "priority": "Medium"},
                {"title": "YouTube - Science Lessons Sri Lanka", "type": "Video", "priority": "High"}
            ],
            "English": [
                {"title": "English Grammar in Use", "type": "Textbook", "priority": "High"},
                {"title": "Vocabulary Builder", "type": "Workbook", "priority": "Medium"},
                {"title": "BBC Learning English", "type": "Online", "priority": "High"},
                {"title": "English Conversation Practice", "type": "Audio", "priority": "Medium"}
            ],
            "History": [
                {"title": "ඉතිහාසය - සම්පූර්ණ මාර්ගෝපදේශය", "type": "Textbook", "priority": "High"},
                {"title": "Timeline Charts & Maps", "type": "Visual Aid", "priority": "High"},
                {"title": "History MCQ Practice", "type": "Workbook", "priority": "Medium"}
            ],
            "Buddhism": [
                {"title": "බුද්ධ ධර්මය - පාඨමාලාව", "type": "Textbook", "priority": "High"},
                {"title": "Buddhism Study Guide", "type": "Guide", "priority": "Medium"},
                {"title": "පිරිත් පොත් හා අර්ථ විවරණ", "type": "Reference", "priority": "Low"}
            ],
            "Geography": [
                {"title": "භූගෝල විද්‍යාව - සම්පූර්ණ පොත", "type": "Textbook", "priority": "High"},
                {"title": "Atlas & Map Practice Book", "type": "Workbook", "priority": "High"},
                {"title": "Geography Model Papers", "type": "Practice", "priority": "Medium"}
            ],
            "ICT": [
                {"title": "ICT Textbook - Theory & Practical", "type": "Textbook", "priority": "High"},
                {"title": "Programming Basics Guide", "type": "Guide", "priority": "Medium"},
                {"title": "ICT Past Papers with Answers", "type": "Practice", "priority": "High"},
                {"title": "Online Coding Practice", "type": "Online", "priority": "Medium"}
            ]
        }
        
        # Generate recommendations for each weak subject
        for subject, score in sorted_weak:
            if subject in material_database:
                subject_recommendation = {
                    "subject": subject,
                    "current_score": score,
                    "status": "Critical" if score < 40 else "Needs Improvement" if score < 60 else "Fair",
                    "recommended_materials": material_database[subject],
                    "study_plan": {
                        "daily_hours": 2 if score < 40 else 1.5 if score < 50 else 1,
                        "focus_areas": self._get_focus_areas(subject, score),
                        "target_score": 75,
                        "estimated_weeks": 8 if score < 40 else 6 if score < 50 else 4
                    }
                }
                recommendations.append(subject_recommendation)
        
        return {
            "weak_subjects_count": len(weak_subjects),
            "weak_subjects": weak_subjects,
            "recommendations": recommendations,
            "overall_advice": self._get_overall_advice(len(weak_subjects))
        }
    
    def _get_focus_areas(self, subject: str, score: float) -> List[str]:
        """Get specific focus areas based on subject and score"""
        focus_areas = {
            "Mathematics": ["මූලික ගණිත කර්ම", "සමීකරණ", "ජ්‍යාමිතිය", "සංඛ්‍යාන"],
            "Science": ["භෞතික විද්‍යාව මූලධර්ම", "රසායන විද්‍යා පදනම", "ජීව විද්‍යා මූලික කරුණු"],
            "English": ["Grammar", "Vocabulary", "Reading Comprehension", "Writing Skills"],
            "Sinhala": ["ව්‍යාකරණ", "රචනා ලිවීම", "කියවීම තේරුම් ගැනීම"],
            "History": ["ප්‍රධාන සිදුවීම්", "කාලරේඛා", "ඓතිහාසික පුද්ගලයින්"],
            "Buddhism": ["බුදු ඉගැන්වීම්", "ධර්ම ප්‍රතිපදා", "බෞද්ධ ඉතිහාසය"],
            "Geography": ["භූ විද්‍යාව", "සිතියම් කියවීම", "ආර්ථික භූගෝල විද්‍යාව"],
            "ICT": ["Computer Basics", "Programming Fundamentals", "Software Applications"]
        }
        return focus_areas.get(subject, ["මූලික සංකල්ප", "Past Papers Practice"])
    
    def _get_overall_advice(self, weak_count: int) -> str:
        """Generate overall advice based on number of weak subjects"""
        if weak_count == 0:
            return "විශිෂ්ටයි! සියලු විෂයයන්ම හොඳින් කරනවා. දැන් තිබෙන මට්ටම පවත්වා ගෙන යන්න."
        elif weak_count <= 2:
            return "දුර්වල විෂයයන් කිහිපයක් තිබෙනවා. මේවාට වැඩි අවධානයක් දෙන්න. දිනකට පැය 2-3ක් මේ විෂයයන්ට වෙන් කරන්න."
        elif weak_count <= 4:
            return "හොඳ අධ්‍යනයක් අවශ්‍යයි. ගුරුවරයකු ළඟ tuition යන්න හෝ study group එකක් සාදාගන්න. සතියකට දින 5-6ක් මෙහෙය වෙන්න."
        else:
            return "සියලු විෂයයන්ට ප්‍රමාද වී ඇත. දිනපතා පාසල් ගුරුවරුන් ළඟ අමතර උදව් ලබාගන්න. සතිය පුරා අධ්‍යනයට වැඩි කාලයක් වෙන් කරන්න."
    
    def add_student_with_recommendations(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add new student to MongoDB with all recommendations"""
        
        # Generate recommendations
        weekly_schedule = self.generate_weekly_schedule(student_data['interested_stream'])
        study_materials = self.recommend_study_materials(student_data['interested_stream'])
        al_path = self.suggest_al_path(student_data['interested_stream'])
        
        # Prepare student document
        student_doc = {
            "student_id": student_data['student_id'],
            "name": student_data['name'],
            "age": student_data['age'],
            "current_grade": student_data['current_grade'],
            "interested_stream": student_data['interested_stream'],
            "strengths": student_data.get('strengths', []),
            "weaknesses": student_data.get('weaknesses', []),
            "iq_level": student_data.get('iq_level', 0),
            "study_hours_per_week": student_data.get('study_hours_per_week', 0),
            "attendance_rate": student_data.get('attendance_rate', 0),
            "student_type": student_data.get('student_type', ''),
            "subject_scores": student_data.get('subject_scores', {}),
            "weekly_schedule": weekly_schedule,
            "recommended_materials": study_materials,
            "al_path": al_path,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Insert to MongoDB only if connected
        mongodb_id = None
        if self.connected and self.students_collection is not None:
            try:
                result = self.students_collection.insert_one(student_doc)
                mongodb_id = str(result.inserted_id)
            except Exception as e:
                print(f"⚠️ Failed to save to MongoDB: {e}")
        
        return {
            "success": True,
            "message": "Student successfully processed!" + (" (Saved to MongoDB)" if mongodb_id else " (Offline mode)"),
            "student_id": student_data['student_id'],
            "mongodb_id": mongodb_id,
            "weekly_schedule": weekly_schedule,
            "recommended_materials": study_materials,
            "al_path": al_path
        }
    
    def get_student_by_id(self, student_id: str) -> Dict[str, Any]:
        """Get student details from MongoDB"""
        if not self.connected or self.students_collection is None:
            return None
        try:
            student = self.students_collection.find_one({"student_id": student_id})
            if student:
                student['_id'] = str(student['_id'])
                return student
        except Exception as e:
            print(f"⚠️ Failed to get student: {e}")
        return None
    
    def get_all_students(self) -> List[Dict[str, Any]]:
        """Get all students from MongoDB"""
        if not self.connected or self.students_collection is None:
            return []
        try:
            students = list(self.students_collection.find({}))
            for student in students:
                student['_id'] = str(student['_id'])
            return students
        except Exception as e:
            print(f"⚠️ Failed to get students: {e}")
            return []
    
    def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()

# Global instance
mongodb_handler = MongoDBHandler()
