# A/L Stream Requirements (minimum O/L subject performance needed)
AL_STREAM_REQUIREMENTS = {
    'Combined Maths': {
        'required_subjects': ['Mathematics', 'Science'],
        'helpful_subjects': ['English', 'ICT'],
        'min_avg_score': 65,
        'description': 'Engineering, Physical Science, Computer Science pathway',
        'career_paths': ['Engineering', 'Computer Science', 'Architecture', 'Quantity Surveying']
    },
    'Bio Science': {
        'required_subjects': ['Science', 'Mathematics'],
        'helpful_subjects': ['English', 'Sinhala'],
        'min_avg_score': 70,
        'description': 'Medicine, Veterinary, Biological Sciences pathway',
        'career_paths': ['Medicine', 'Veterinary', 'Pharmacy', 'Nursing', 'Medical Lab Science']
    },
    'Technology': {
        'required_subjects': ['Mathematics', 'Science', 'ICT'],
        'helpful_subjects': ['English'],
        'min_avg_score': 60,
        'description': 'Engineering Technology, Applied Sciences pathway',
        'career_paths': ['Engineering Technology', 'Information Technology', 'Quantity Surveying']
    },
    'Commerce': {
        'required_subjects': ['Mathematics', 'English'],
        'helpful_subjects': ['Geography', 'History'],
        'min_avg_score': 55,
        'description': 'Business, Accounting, Management pathway',
        'career_paths': ['Business Management', 'Accounting', 'Marketing', 'Finance', 'HRM']
    },
    'Arts': {
        'required_subjects': ['Sinhala', 'English'],
        'helpful_subjects': ['History', 'Geography', 'Buddhism'],
        'min_avg_score': 50,
        'description': 'Languages, Social Sciences, Humanities pathway',
        'career_paths': ['Law', 'Social Work', 'Teaching', 'Mass Communication', 'Languages']
    }
}


# Online Resource Database — Real Sri Lanka O/L Resources (Sinhala Medium)
# Sources: DP Education, e-thaksalawa (Ministry of Education), verified YouTube channels
ONLINE_RESOURCES = {
    'Mathematics': [
        {
            'title': 'DP Education — O/L Mathematics Grade 11 (Sinhala)',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-11/mathematics',
            'level': 'All Levels',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala',
            'topics': 'Algebra, Geometry, Statistics, Mensuration, Trigonometry'
        },
        {
            'title': 'DP Education — O/L Mathematics Grade 10 (Sinhala)',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-10/mathematics',
            'level': 'Beginner',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala',
            'topics': 'Number, Algebra, Sets, Geometry basics'
        },
        {
            'title': 'e-thaksalawa — O/L Mathematics (Ministry of Education)',
            'platform': 'e-thaksalawa',
            'url': 'https://e-thaksalawa.moe.gov.lk/OL/Mathematics',
            'level': 'All Levels',
            'type': 'Interactive + Past Papers',
            'duration': 'Self-paced',
            'rating': 4.8,
            'language': 'Sinhala',
            'topics': 'Full syllabus, past papers, model papers'
        },
        {
            'title': 'SL Maths — O/L Mathematics YouTube (Sinhala)',
            'platform': 'YouTube',
            'url': 'https://www.youtube.com/@SLMaths',
            'level': 'Intermediate',
            'type': 'Video Lessons + Past Papers',
            'duration': 'Self-paced',
            'rating': 4.8,
            'language': 'Sinhala',
            'topics': 'Past paper discussions, constructions, arithmetic progressions'
        },
        {
            'title': 'Past Papers Wiki — O/L Mathematics (Sinhala)',
            'platform': 'Past Papers Wiki',
            'url': 'https://pastpapers.wiki/ol-mathematics/',
            'level': 'Intermediate',
            'type': 'Past Papers',
            'duration': 'Self-paced',
            'rating': 4.7,
            'language': 'Sinhala',
            'topics': 'Past papers, model papers, short notes'
        }
    ],
    'Science': [
        {
            'title': 'DP Education — O/L Science Grade 11 (Sinhala)',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-11/science',
            'level': 'All Levels',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala',
            'topics': 'Biology, Chemistry, Physics — Grade 11'
        },
        {
            'title': 'DP Education — O/L Science Grade 10 (Sinhala)',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-10/science',
            'level': 'Beginner',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala',
            'topics': 'Biology, Chemistry, Physics — Grade 10'
        },
        {
            'title': 'e-thaksalawa — O/L Science (Ministry of Education)',
            'platform': 'e-thaksalawa',
            'url': 'https://e-thaksalawa.moe.gov.lk/OL/Science',
            'level': 'All Levels',
            'type': 'Interactive + Past Papers',
            'duration': 'Self-paced',
            'rating': 4.8,
            'language': 'Sinhala',
            'topics': 'Biology, Chemistry, Physics + past papers'
        },
        {
            'title': 'OL Science YouTube Channel (Sinhala)',
            'platform': 'YouTube',
            'url': 'https://www.youtube.com/@olscience',
            'level': 'All Levels',
            'type': 'Video Lessons + Short Notes',
            'duration': 'Self-paced',
            'rating': 4.8,
            'language': 'Sinhala',
            'topics': 'Grade 10 & 11 lessons, past paper MCQ discussions'
        },
        {
            'title': 'Past Papers Wiki — O/L Science (Sinhala)',
            'platform': 'Past Papers Wiki',
            'url': 'https://pastpapers.wiki/ol-science/',
            'level': 'Intermediate',
            'type': 'Past Papers',
            'duration': 'Self-paced',
            'rating': 4.7,
            'language': 'Sinhala',
            'topics': 'Past papers, model papers'
        }
    ],
    'English': [
        {
            'title': 'DP Education — O/L English Grade 11 (Sinhala Explanations)',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-11/english',
            'level': 'All Levels',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala explanations',
            'topics': 'Grammar, Reading, Writing, Comprehension'
        },
        {
            'title': 'DP Education — O/L English Grade 10',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-10/english',
            'level': 'Beginner',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala explanations',
            'topics': 'Basic grammar, vocabulary, reading'
        },
        {
            'title': 'e-thaksalawa — O/L English (Ministry of Education)',
            'platform': 'e-thaksalawa',
            'url': 'https://e-thaksalawa.moe.gov.lk/OL/English',
            'level': 'All Levels',
            'type': 'Interactive + Past Papers',
            'duration': 'Self-paced',
            'rating': 4.8,
            'language': 'English/Sinhala',
            'topics': 'Reading, writing, grammar, past papers'
        },
        {
            'title': 'The OL English — YouTube Channel (Sinhala)',
            'platform': 'YouTube',
            'url': 'https://www.youtube.com/@TheOLEnglish',
            'level': 'All Levels',
            'type': 'Video Lessons + Past Papers',
            'duration': 'Self-paced',
            'rating': 4.8,
            'language': 'Sinhala explanations',
            'topics': 'Past paper discussions, answering techniques, grammar'
        },
        {
            'title': 'Past Papers Wiki — O/L English (Sinhala)',
            'platform': 'Past Papers Wiki',
            'url': 'https://pastpapers.wiki/ol-english/',
            'level': 'Intermediate',
            'type': 'Past Papers',
            'duration': 'Self-paced',
            'rating': 4.6,
            'language': 'English',
            'topics': 'Past papers, model answers'
        }
    ],
    'Sinhala': [
        {
            'title': 'DP Education — O/L Sinhala Grade 11',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-11/sinhala',
            'level': 'All Levels',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala',
            'topics': 'Grammar, Literature, Essay writing, Comprehension'
        },
        {
            'title': 'DP Education — O/L Sinhala Grade 10',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-10/sinhala',
            'level': 'Beginner',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala',
            'topics': 'Basic grammar, reading, writing'
        },
        {
            'title': 'e-thaksalawa — O/L Sinhala (Ministry of Education)',
            'platform': 'e-thaksalawa',
            'url': 'https://e-thaksalawa.moe.gov.lk/OL/Sinhala',
            'level': 'All Levels',
            'type': 'Interactive + Past Papers',
            'duration': 'Self-paced',
            'rating': 4.8,
            'language': 'Sinhala',
            'topics': 'Language, literature, model papers'
        },
        {
            'title': 'Past Papers Wiki — O/L Sinhala',
            'platform': 'Past Papers Wiki',
            'url': 'https://pastpapers.wiki/ol-sinhala/',
            'level': 'Intermediate',
            'type': 'Past Papers',
            'duration': 'Self-paced',
            'rating': 4.7,
            'language': 'Sinhala',
            'topics': 'Past papers, model papers'
        }
    ],
    'History': [
        {
            'title': 'DP Education — O/L History Grade 11 (Sinhala)',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-11/history',
            'level': 'All Levels',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala',
            'topics': 'Sri Lanka history, world history, civics'
        },
        {
            'title': 'DP Education — O/L History Grade 10 (Sinhala)',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-10/history',
            'level': 'Beginner',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala',
            'topics': 'Ancient Sri Lanka history'
        },
        {
            'title': 'e-thaksalawa — O/L History (Ministry of Education)',
            'platform': 'e-thaksalawa',
            'url': 'https://e-thaksalawa.moe.gov.lk/OL/History',
            'level': 'All Levels',
            'type': 'Interactive + Past Papers',
            'duration': 'Self-paced',
            'rating': 4.8,
            'language': 'Sinhala',
            'topics': 'Sri Lanka & world history + past papers'
        },
        {
            'title': 'Guru Sevana Education — O/L History YouTube (Sinhala)',
            'platform': 'YouTube',
            'url': 'https://www.youtube.com/@GuruSevanaEducation',
            'level': 'All Levels',
            'type': 'Video Lessons + Short Notes',
            'duration': 'Self-paced',
            'rating': 4.7,
            'language': 'Sinhala',
            'topics': 'History anumana lessons, short notes, past papers'
        },
        {
            'title': 'Past Papers Wiki — O/L History (Sinhala)',
            'platform': 'Past Papers Wiki',
            'url': 'https://pastpapers.wiki/ol-history/',
            'level': 'Intermediate',
            'type': 'Past Papers',
            'duration': 'Self-paced',
            'rating': 4.6,
            'language': 'Sinhala',
            'topics': 'Past papers, short notes'
        }
    ],
    'Geography': [
        {
            'title': 'DP Education — O/L Geography Grade 11 (Sinhala)',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-11/geography',
            'level': 'All Levels',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala',
            'topics': 'Physical geography, human geography, maps'
        },
        {
            'title': 'DP Education — O/L Geography Grade 10 (Sinhala)',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-10/geography',
            'level': 'Beginner',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala',
            'topics': 'Sri Lanka geography, world geography'
        },
        {
            'title': 'e-thaksalawa — O/L Geography (Ministry of Education)',
            'platform': 'e-thaksalawa',
            'url': 'https://e-thaksalawa.moe.gov.lk/OL/Geography',
            'level': 'All Levels',
            'type': 'Interactive + Past Papers',
            'duration': 'Self-paced',
            'rating': 4.8,
            'language': 'Sinhala',
            'topics': 'Physical & human geography + past papers'
        },
        {
            'title': 'Past Papers Wiki — O/L Geography (Sinhala)',
            'platform': 'Past Papers Wiki',
            'url': 'https://pastpapers.wiki/ol-geography/',
            'level': 'Intermediate',
            'type': 'Past Papers',
            'duration': 'Self-paced',
            'rating': 4.6,
            'language': 'Sinhala',
            'topics': 'Past papers, MCQ, essay answers'
        }
    ],
    'Buddhism': [
        {
            'title': 'DP Education — O/L Buddhism Grade 11 (Sinhala)',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-11/buddhism',
            'level': 'All Levels',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala',
            'topics': 'Buddhist philosophy, history, ethics, doctrines'
        },
        {
            'title': 'DP Education — O/L Buddhism Grade 10 (Sinhala)',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-10/buddhism',
            'level': 'Beginner',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala',
            'topics': 'Basic Buddhist teachings, Dhamma'
        },
        {
            'title': 'e-thaksalawa — O/L Buddhism (Ministry of Education)',
            'platform': 'e-thaksalawa',
            'url': 'https://e-thaksalawa.moe.gov.lk/OL/Buddhism',
            'level': 'All Levels',
            'type': 'Interactive + Past Papers',
            'duration': 'Self-paced',
            'rating': 4.8,
            'language': 'Sinhala',
            'topics': 'Buddhist philosophy, history + past papers'
        },
        {
            'title': 'Guru Sevana Education — O/L Buddhism YouTube (Sinhala)',
            'platform': 'YouTube',
            'url': 'https://www.youtube.com/@GuruSevanaEducation',
            'level': 'All Levels',
            'type': 'Video Lessons + Short Notes',
            'duration': 'Self-paced',
            'rating': 4.7,
            'language': 'Sinhala',
            'topics': 'Buddhism short notes, anumana questions, past papers'
        },
        {
            'title': 'Past Papers Wiki — O/L Buddhism (Sinhala)',
            'platform': 'Past Papers Wiki',
            'url': 'https://pastpapers.wiki/ol-buddhism/',
            'level': 'Intermediate',
            'type': 'Past Papers',
            'duration': 'Self-paced',
            'rating': 4.7,
            'language': 'Sinhala',
            'topics': 'Past papers, model papers'
        }
    ],
    'ICT': [
        {
            'title': 'DP Education — O/L ICT Grade 11 (Sinhala)',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-11/ict',
            'level': 'All Levels',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala',
            'topics': 'Theory, practical, hardware, software, internet'
        },
        {
            'title': 'DP Education — O/L ICT Grade 10 (Sinhala)',
            'platform': 'DP Education',
            'url': 'https://www.dpeducation.lk/grade-10/ict',
            'level': 'Beginner',
            'type': 'Video + Interactive',
            'duration': 'Self-paced',
            'rating': 4.9,
            'language': 'Sinhala',
            'topics': 'Basic computer skills, MS Office'
        },
        {
            'title': 'e-thaksalawa — O/L ICT (Ministry of Education)',
            'platform': 'e-thaksalawa',
            'url': 'https://e-thaksalawa.moe.gov.lk/OL/ICT',
            'level': 'All Levels',
            'type': 'Interactive + Past Papers',
            'duration': 'Self-paced',
            'rating': 4.8,
            'language': 'Sinhala',
            'topics': 'ICT theory, practical + past papers'
        },
        {
            'title': 'Past Papers Wiki — O/L ICT (Sinhala)',
            'platform': 'Past Papers Wiki',
            'url': 'https://pastpapers.wiki/ol-ict/',
            'level': 'Intermediate',
            'type': 'Past Papers',
            'duration': 'Self-paced',
            'rating': 4.6,
            'language': 'Sinhala',
            'topics': 'Past papers, theory and practical'
        }
    ]
}
