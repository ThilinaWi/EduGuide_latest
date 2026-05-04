import pandas as pd
import numpy as np
import random
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def determine_recs(att, marks, study, hw, screen, consistency):
    recs = []
    
    # Cross Factors
    if study < 10 and consistency < 40:
        recs.append("Combo_LowStudy_LowConsistency")
    if study >= 12 and marks < 50:
        recs.append("Combo_HighStudy_LowMarks")
    if screen > 4 and hw < 70:
        recs.append("Combo_HighScreen_LowHomework")
        
    # Individual Weak Factors
    if att < 75: recs.append("Attendance_Critical")
    elif att < 85: recs.append("Attendance_Warning")
    
    if study < 8: recs.append("StudyHours_Critical")
    
    if marks < 40: recs.append("Marks_Critical")
    
    if screen > 5: recs.append("ScreenTime_Critical")
    elif screen > 3: recs.append("ScreenTime_Warning")
    
    if consistency < 40: recs.append("Consistency_Warning")
        
    # Individual Strong Factors
    if att >= 95: recs.append("Attendance_Success")
    if study >= 15: recs.append("StudyHours_Success")
    if marks >= 80: recs.append("Marks_Success")
    if consistency >= 80: recs.append("Consistency_Success")
    
    # Deduplicate and sort implicitly by order of appendage (Critical combos first, then weak, then strong)
    unique_recs = []
    for r in recs:
        if r not in unique_recs:
            unique_recs.append(r)
            
    # Need exactly 3. Pad if necessary.
    if not unique_recs:
        unique_recs.append("General_Balanced")
        
    while len(unique_recs) < 3:
        # Just pad with general or duplicates if needed, but in real life we want 3 slots.
        # Actually, let's pad with General_Balanced
        unique_recs.append("General_Balanced")
        
    return unique_recs[:3]

data = []
for _ in range(5000):
    att = random.uniform(50, 100)
    marks = random.uniform(20, 95)
    study = random.uniform(2, 20)
    hw = random.uniform(30, 100)
    screen = random.uniform(1, 8)
    consistency = random.uniform(10, 100)
    
    r1, r2, r3 = determine_recs(att, marks, study, hw, screen, consistency)
    
    data.append({
        'attendance': round(att, 1),
        'avg_marks': round(marks, 1),
        'study_hours': round(study, 1),
        'homework_rate': round(hw, 1),
        'screen_time': round(screen, 1),
        'study_consistency': round(consistency, 1),
        'recommendation_1': r1,
        'recommendation_2': r2,
        'recommendation_3': r3
    })

df = pd.DataFrame(data)
out_path = os.path.join(BASE_DIR, 'recommendation_dataset_v2.csv')
df.to_csv(out_path, index=False)
print(f"Generated {len(df)} rows in {out_path}")
