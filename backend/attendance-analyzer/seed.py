import os
from datetime import datetime
from pathlib import Path
import csv

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConfigurationError
from pymongo.uri_parser import parse_uri

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/student_attendance")
CSV_PATH = BASE_DIR / "data" / "attendance.csv"

client = MongoClient(MONGO_URI)
try:
    db = client.get_default_database()
except ConfigurationError:
    db = None

if db is None:
    db_name = os.getenv("DB_NAME")
    if not db_name:
        parsed = parse_uri(MONGO_URI)
        db_name = parsed.get("database") or "student_attendance"
    db = client[db_name]

students_col = db["students"]
attendance_col = db["attendances"]
anomalies_col = db["anomalies"]


def get_risk_level(rate):
    if rate < 60:
        return "critical"
    if rate < 75:
        return "high"
    if rate < 85:
        return "medium"
    return "low"


def parse_month(month_str):
    months = {
        "january": 1,
        "february": 2,
        "march": 3,
        "april": 4,
        "may": 5,
        "june": 6,
        "july": 7,
        "august": 8,
        "september": 9,
        "october": 10,
        "november": 11,
        "december": 12,
    }
    if not month_str:
        return None
    return months.get(month_str.strip().lower())


def parse_bool(value):
    return str(value).strip().lower() == "true"


def parse_date(value):
    if not value:
        return None
    value = value.strip()
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


def seed():
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"CSV not found: {CSV_PATH}")

    print("✅ Connected to MongoDB")
    print("🗑️  Clearing existing data...")
    students_col.delete_many({})
    attendance_col.delete_many({})
    anomalies_col.delete_many({})
    print("✅ Data cleared")

    print(f"📖 Reading attendance CSV: {CSV_PATH}")
    with CSV_PATH.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)

    print(f"📊 Processing {len(rows)} attendance records...")

    student_map = {}
    attendance_docs = []

    for row in rows:
        sid = (row.get("StudentID") or "").strip()
        date_str = (row.get("Date") or "").strip()
        grade = (row.get("Grade") or "").strip()
        is_present = row.get("Attendance") in ("1", 1, "True", "true")
        event = (row.get("Event") or "normal").strip()
        weather = (row.get("Weather") or "").strip()
        temp = row.get("Temperature")
        dow = (row.get("DayOfWeek") or "").strip()
        month_str = (row.get("Month") or "").strip()
        month = parse_month(month_str)
        is_before_holiday = parse_bool(row.get("IsBeforeHoliday") or "False")
        is_after_holiday = parse_bool(row.get("IsAfterHoliday") or "False")
        distance_km = row.get("DistanceKm")
        distance_band = (row.get("DistanceBand") or "").strip() or None

        if not sid or not date_str:
            continue

        parsed_date = parse_date(date_str)
        if not parsed_date:
            continue

        year = parsed_date.year
        status = "Present" if is_present else "Absent"

        if sid not in student_map:
            student_map[sid] = {
                "student_id": sid,
                "name": sid,
                "grade": grade,
                "section": "",
                "total_days": 0,
                "present_days": 0,
                "absent_days": 0,
                "distance_km": float(distance_km) if distance_km else None,
                "distance_band": distance_band,
            }

        student_map[sid]["total_days"] += 1
        if is_present:
            student_map[sid]["present_days"] += 1
        else:
            student_map[sid]["absent_days"] += 1

        attendance_docs.append(
            {
                "student_id": sid,
                "date": parsed_date,
                "year": year,
                "month": month,
                "status": status,
                "day_of_week": dow,
                "weather_condition": weather,
                "temperature": float(temp) if temp not in (None, "") else None,
                "school_event": event,
                "is_before_holiday": is_before_holiday,
                "is_after_holiday": is_after_holiday,
                "is_holiday": False,
                "distance_km": float(distance_km) if distance_km else None,
                "distance_band": distance_band,
            }
        )

    print(f"💾 Inserting {len(attendance_docs)} attendance records...")
    chunk = 5000
    for i in range(0, len(attendance_docs), chunk):
        batch = attendance_docs[i : i + chunk]
        try:
            attendance_col.insert_many(batch, ordered=False)
        except Exception:
            pass
        print(f"   {min(i + chunk, len(attendance_docs))}/{len(attendance_docs)}")

    student_docs = []
    for student in student_map.values():
        total_days = student["total_days"] or 0
        rate = round((student["present_days"] / total_days) * 100, 2) if total_days else 0
        student_docs.append(
            {
                **student,
                "attendance_rate": rate,
                "risk_level": get_risk_level(rate),
                "is_anomalous": False,
            }
        )

    print(f"💾 Inserting {len(student_docs)} student records...")
    if student_docs:
        students_col.insert_many(student_docs, ordered=False)

    anomalous_docs = []
    for student in student_docs:
        if student["attendance_rate"] < 75:
            anomalous_docs.append(
                {
                    "student_id": student["student_id"],
                    "name": student["name"],
                    "grade": student["grade"],
                    "anomaly_type": "Chronic Absenteeism"
                    if student["attendance_rate"] < 60
                    else "High Absence Rate",
                    "anomaly_score": round((75 - student["attendance_rate"]) / 75, 3),
                    "attendance_rate": student["attendance_rate"],
                    "consecutive_absences": student["absent_days"],
                    "risk_level": student["risk_level"],
                    "description": (
                        f"Student has {student['attendance_rate']}% attendance rate "
                        f"over {student['total_days']} school days."
                    ),
                    "year": 2025,
                }
            )

    if anomalous_docs:
        anomalies_col.insert_many(anomalous_docs, ordered=False)
        students_col.update_many(
            {"student_id": {"$in": [a["student_id"] for a in anomalous_docs]}},
            {"$set": {"is_anomalous": True}},
        )
        print(f"✅ {len(anomalous_docs)} anomaly records auto-generated")

    print("\n🎉 Database seeded successfully!")
    print(f"   📊 {len(student_docs)} students | {len(attendance_docs)} records")


if __name__ == "__main__":
    seed()
