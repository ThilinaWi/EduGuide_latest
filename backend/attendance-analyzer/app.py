import os
from datetime import date, datetime, timedelta
from pathlib import Path

import numpy as np
from bson import ObjectId
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import ASCENDING, DESCENDING, MongoClient, ReturnDocument
from pymongo.errors import ConfigurationError
from pymongo.uri_parser import parse_uri

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/student_attendance")
PORT = int(os.getenv("PORT", "5004"))

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
forecasts_col = db["forecasts"]

app = Flask(__name__)
CORS(app)

CACHE_MAX_AGE_MS = 1000 * 60 * 30


def serialize(value):
    if isinstance(value, list):
        return [serialize(v) for v in value]
    if isinstance(value, dict):
        return {k: serialize(v) for k, v in value.items()}
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


def parse_sort(sort_value, default_field="_id"):
    if not sort_value:
        return [(default_field, DESCENDING)]
    field = sort_value
    direction = DESCENDING
    if sort_value.startswith("-"):
        field = sort_value[1:]
        direction = DESCENDING
    else:
        direction = ASCENDING
    return [(field, direction)]


def get_month_str(date_obj, offset_months):
    m = date_obj.month + offset_months - 1
    y = date_obj.year + m // 12
    m = m % 12 + 1
    return f"{y}-{m:02d}"


def generate_trend_data(steps, start_val=85, end_val=95, noise_level=2):
    trend = np.linspace(start_val, end_val, steps)
    noise = np.random.normal(0, noise_level, steps)
    return np.clip(trend + noise, 0, 100).tolist()


def calculate_dynamic_prediction(data, base_rate=85.0):
    rate = base_rate
    weather = data.get("weather", "sunny")
    event = data.get("school_event", "normal")
    is_holiday = data.get("is_holiday", False)
    dist = data.get("distance_km", 5)

    if weather == "rainy":
        rate -= 8
    elif weather == "stormy":
        rate -= 15
    elif weather == "sunny":
        rate += 2

    if is_holiday:
        rate -= 12

    if event == "exam":
        rate += 10
    elif event == "sports_meet":
        rate += 5
    elif event == "term_start":
        rate += 8

    if dist > 15:
        rate -= 5
    elif dist > 10:
        rate -= 2

    return min(max(rate, 40.0), 99.9)


def build_lstm_forecast(steps):
    today = date.today()
    hist_vals = generate_trend_data(60, 80, 90, 3)
    historical = [
        {"label": (today - timedelta(days=60 - i)).isoformat(), "rate": round(r, 1)}
        for i, r in enumerate(hist_vals)
    ]

    fc_vals = generate_trend_data(steps, 90, 93, 2)
    forecast = [
        {"label": (today + timedelta(days=i + 1)).isoformat(), "predicted_rate": round(r, 1)}
        for i, r in enumerate(fc_vals)
    ]

    return {
        "steps": steps,
        "look_back": 60,
        "converged": True,
        "forecast": forecast,
        "historical": historical,
        "input_shape": [60, 1],
        "model": "LSTM (Simulated)",
    }


def build_arima_forecast(steps, order):
    today = date.today()
    hist_vals = generate_trend_data(24, 88, 92, 4)
    historical = [
        {"label": get_month_str(today, i - 24), "rate": round(r, 1)}
        for i, r in enumerate(hist_vals)
    ]

    fc_vals = generate_trend_data(steps, 92, 94, 3)
    forecast = [
        {
            "label": get_month_str(today, i + 1),
            "mean": round(r, 1),
            "ci_lower": round(r - 4, 1),
            "ci_upper": round(r + 4, 1),
        }
        for i, r in enumerate(fc_vals)
    ]

    return {
        "steps": steps,
        "order": order,
        "converged": True,
        "forecast": forecast,
        "historical": historical,
        "model": "ARIMA (Simulated)",
    }


def build_student_arima_forecast(student_id, steps):
    today = date.today()
    hist_vals = generate_trend_data(30, 75, 85, 8)
    historical = [
        {"label": get_month_str(today, i - 30), "rate": round(r, 1)}
        for i, r in enumerate(hist_vals)
    ]

    fc_vals = generate_trend_data(steps, 85, 88, 5)
    forecast = [
        {
            "label": get_month_str(today, i + 1),
            "mean": round(r, 1),
            "ci_lower": round(r - 6, 1),
            "ci_upper": round(r + 6, 1),
        }
        for i, r in enumerate(fc_vals)
    ]

    return {
        "student_id": student_id,
        "steps": steps,
        "converged": True,
        "forecast": forecast,
        "historical": historical[-24:],
        "model": "ARIMA-Student (Simulated)",
    }


def get_or_refresh_forecast(model_type, scope, student_id, ml_builder, force=False):
    query = {"model_type": model_type, "scope": scope, "student_id": student_id}
    cached = forecasts_col.find_one(query, sort=[("generated_at", DESCENDING)])

    if cached and not force:
        age_ms = (datetime.utcnow() - cached["generated_at"]).total_seconds() * 1000
        if age_ms < CACHE_MAX_AGE_MS:
            cached["fromCache"] = True
            return cached

    ml_data = ml_builder()
    update = {
        "model_type": model_type,
        "scope": scope,
        "student_id": student_id,
        "generated_at": datetime.utcnow(),
        "steps": ml_data.get("steps"),
        "order": ml_data.get("order", []),
        "look_back": ml_data.get("look_back"),
        "converged": ml_data.get("converged", True),
        "forecast": ml_data.get("forecast"),
        "historical": ml_data.get("historical"),
        "meta": {"input_shape": ml_data.get("input_shape"), "model": ml_data.get("model")},
    }

    doc = forecasts_col.find_one_and_update(
        query,
        {"$set": update},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )

    if doc is None:
        doc = forecasts_col.find_one(query, sort=[("generated_at", DESCENDING)])
    doc["fromCache"] = False
    return doc


@app.get("/")
def root():
    return jsonify({"message": "Student Attendance API is running"})


@app.get("/api/analytics/summary")
def analytics_summary():
    total_students = students_col.count_documents({})
    anomalous_students = students_col.count_documents({"is_anomalous": True})
    critical_students = students_col.count_documents({"risk_level": "critical"})
    high_risk_students = students_col.count_documents({"risk_level": "high"})

    avg_rate_result = list(
        students_col.aggregate(
            [
                {
                    "$group": {
                        "_id": None,
                        "avg_rate": {"$avg": "$attendance_rate"},
                        "avg_absences": {"$avg": "$absent_days"},
                    }
                }
            ]
        )
    )

    total_records = attendance_col.count_documents({})
    present_records = attendance_col.count_documents({"status": "Present"})
    overall_rate = round((present_records / total_records) * 100, 2) if total_records else 0

    return jsonify(
        {
            "totalStudents": total_students,
            "anomalousStudents": anomalous_students,
            "criticalStudents": critical_students,
            "highRiskStudents": high_risk_students,
            "avgAttendanceRate": round(avg_rate_result[0]["avg_rate"], 2) if avg_rate_result else 0,
            "overallAttendanceRate": overall_rate,
            "totalRecords": total_records,
        }
    )


@app.get("/api/analytics/grade-breakdown")
def analytics_grade_breakdown():
    breakdown = list(
        students_col.aggregate(
            [
                {
                    "$group": {
                        "_id": "$grade",
                        "count": {"$sum": 1},
                        "avg_attendance": {"$avg": "$attendance_rate"},
                        "anomalous": {"$sum": {"$cond": ["$is_anomalous", 1, 0]}},
                        "critical": {
                            "$sum": {"$cond": [{"$eq": ["$risk_level", "critical"]}, 1, 0]}
                        },
                    }
                },
                {"$sort": {"_id": 1}},
            ]
        )
    )
    return jsonify(serialize(breakdown))


@app.get("/api/analytics/rate-distribution")
def analytics_rate_distribution():
    distribution = list(
        students_col.aggregate(
            [
                {
                    "$bucket": {
                        "groupBy": "$attendance_rate",
                        "boundaries": [0, 50, 60, 70, 75, 80, 85, 90, 95, 100],
                        "default": "100+",
                        "output": {"count": {"$sum": 1}},
                    }
                }
            ]
        )
    )
    return jsonify(serialize(distribution))


@app.get("/api/students")
def students_list():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    search = request.args.get("search", "")
    risk_level = request.args.get("riskLevel", "")
    sort_value = request.args.get("sort", "-attendance_rate")

    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if risk_level:
        query["risk_level"] = risk_level

    total = students_col.count_documents(query)
    cursor = (
        students_col.find(query)
        .sort(parse_sort(sort_value))
        .skip((page - 1) * limit)
        .limit(limit)
    )
    students = list(cursor)

    return jsonify(
        {
            "students": serialize(students),
            "total": total,
            "page": page,
            "pages": int((total + limit - 1) / limit),
        }
    )


@app.get("/api/students/<student_id>")
def students_get(student_id):
    student = students_col.find_one({"student_id": student_id})
    if not student:
        return jsonify({"message": "Student not found"}), 404
    return jsonify(serialize(student))


@app.get("/api/students/stats/risk-summary")
def students_risk_summary():
    summary = list(
        students_col.aggregate(
            [
                {
                    "$group": {
                        "_id": "$risk_level",
                        "count": {"$sum": 1},
                        "avg_rate": {"$avg": "$attendance_rate"},
                    }
                },
                {"$sort": {"_id": 1}},
            ]
        )
    )
    return jsonify(serialize(summary))


@app.get("/api/anomalies")
def anomalies_list():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    risk_level = request.args.get("riskLevel", "")
    sort_value = request.args.get("sort", "-anomaly_score")

    query = {}
    if risk_level:
        query["risk_level"] = risk_level

    total = anomalies_col.count_documents(query)
    anomalies = list(
        anomalies_col.find(query)
        .sort(parse_sort(sort_value))
        .skip((page - 1) * limit)
        .limit(limit)
    )

    return jsonify(
        {
            "anomalies": serialize(anomalies),
            "total": total,
            "page": page,
            "pages": int((total + limit - 1) / limit),
        }
    )


@app.get("/api/anomalies/type-summary")
def anomalies_type_summary():
    summary = list(
        anomalies_col.aggregate(
            [
                {
                    "$group": {
                        "_id": "$anomaly_type",
                        "count": {"$sum": 1},
                        "avg_score": {"$avg": "$anomaly_score"},
                        "avg_rate": {"$avg": "$attendance_rate"},
                    }
                },
                {"$sort": {"count": -1}},
            ]
        )
    )
    return jsonify(serialize(summary))


@app.get("/api/anomalies/<student_id>")
def anomalies_get(student_id):
    anomaly = anomalies_col.find_one({"student_id": student_id})
    if not anomaly:
        return jsonify({"message": "Anomaly record not found"}), 404
    return jsonify(serialize(anomaly))


@app.get("/api/attendance/student/<student_id>")
def attendance_student(student_id):
    year = request.args.get("year")
    month = request.args.get("month")
    query = {"student_id": student_id}
    if year:
        query["year"] = int(year)
    if month:
        query["month"] = int(month)

    records = list(attendance_col.find(query).sort("date", ASCENDING).limit(500))
    return jsonify(serialize(records))


@app.get("/api/attendance/monthly-summary")
def attendance_monthly_summary():
    summary = list(
        attendance_col.aggregate(
            [
                {
                    "$group": {
                        "_id": {"year": "$year", "month": "$month"},
                        "total": {"$sum": 1},
                        "present": {"$sum": {"$cond": [{"$eq": ["$status", "Present"]}, 1, 0]}},
                        "absent": {"$sum": {"$cond": [{"$eq": ["$status", "Absent"]}, 1, 0]}},
                    }
                },
                {
                    "$addFields": {
                        "attendance_rate": {
                            "$multiply": [{"$divide": ["$present", "$total"]}, 100]
                        }
                    }
                },
                {"$sort": {"_id.year": 1, "_id.month": 1}},
            ]
        )
    )
    return jsonify(serialize(summary))


@app.get("/api/attendance/day-of-week")
def attendance_day_of_week():
    dow_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    breakdown = list(
        attendance_col.aggregate(
            [
                {"$match": {"day_of_week": {"$in": dow_order}}},
                {
                    "$group": {
                        "_id": "$day_of_week",
                        "total": {"$sum": 1},
                        "present": {
                            "$sum": {"$cond": [{"$eq": ["$status", "Present"]}, 1, 0]}
                        },
                    }
                },
                {
                    "$addFields": {
                        "attendance_rate": {
                            "$multiply": [{"$divide": ["$present", "$total"]}, 100]
                        }
                    }
                },
                {"$sort": {"attendance_rate": -1}},
            ]
        )
    )
    return jsonify(serialize(breakdown))


@app.get("/api/attendance/weather-correlation")
def attendance_weather_correlation():
    correlation = list(
        attendance_col.aggregate(
            [
                {
                    "$match": {
                        "weather_condition": {"$exists": True, "$ne": None, "$ne": ""}
                    }
                },
                {
                    "$group": {
                        "_id": "$weather_condition",
                        "total": {"$sum": 1},
                        "present": {
                            "$sum": {"$cond": [{"$eq": ["$status", "Present"]}, 1, 0]}
                        },
                        "avg_temp": {"$avg": "$temperature"},
                    }
                },
                {
                    "$addFields": {
                        "attendance_rate": {
                            "$multiply": [{"$divide": ["$present", "$total"]}, 100]
                        }
                    }
                },
                {"$sort": {"attendance_rate": -1}},
            ]
        )
    )
    return jsonify(serialize(correlation))


@app.get("/api/attendance/event-breakdown")
def attendance_event_breakdown():
    breakdown = list(
        attendance_col.aggregate(
            [
                {"$match": {"school_event": {"$exists": True, "$ne": None}}},
                {
                    "$group": {
                        "_id": "$school_event",
                        "total": {"$sum": 1},
                        "present": {
                            "$sum": {"$cond": [{"$eq": ["$status", "Present"]}, 1, 0]}
                        },
                    }
                },
                {
                    "$addFields": {
                        "attendance_rate": {
                            "$round": [
                                {"$multiply": [{"$divide": ["$present", "$total"]}, 100]},
                                1,
                            ]
                        }
                    }
                },
                {"$sort": {"attendance_rate": -1}},
            ]
        )
    )
    return jsonify(serialize(breakdown))


@app.get("/api/attendance/distance-impact")
def attendance_distance_impact():
    band_order = ["Nearby", "Moderate", "Far", "Very Far"]
    raw = list(
        attendance_col.aggregate(
            [
                {
                    "$match": {
                        "distance_band": {"$exists": True, "$ne": None, "$ne": ""}
                    }
                },
                {
                    "$group": {
                        "_id": "$distance_band",
                        "total": {"$sum": 1},
                        "present": {
                            "$sum": {"$cond": [{"$eq": ["$status", "Present"]}, 1, 0]}
                        },
                        "avg_distance": {"$avg": "$distance_km"},
                    }
                },
                {
                    "$addFields": {
                        "attendance_rate": {
                            "$round": [
                                {"$multiply": [{"$divide": ["$present", "$total"]}, 100]},
                                1,
                            ]
                        }
                    }
                },
            ]
        )
    )

    sorted_items = []
    for band in band_order:
        match = next((r for r in raw if r.get("_id") == band), None)
        if match:
            sorted_items.append(
                {
                    "band": match["_id"],
                    "total": match["total"],
                    "present": match["present"],
                    "attendance_rate": match["attendance_rate"],
                    "avg_distance": round(match.get("avg_distance", 0) * 10) / 10,
                }
            )
    return jsonify(serialize(sorted_items))


@app.get("/api/attendance/student-filter")
def attendance_student_filter():
    student_id = request.args.get("student_id")
    day_of_week = request.args.get("day_of_week")
    weather_condition = request.args.get("weather_condition")
    school_event = request.args.get("school_event")
    is_before_holiday = request.args.get("is_before_holiday")

    if not student_id:
        return jsonify({"message": "student_id is required"}), 400

    match = {"student_id": student_id}
    if day_of_week and day_of_week != "All":
        match["day_of_week"] = day_of_week
    if weather_condition and weather_condition != "All":
        match["weather_condition"] = weather_condition
    if school_event and school_event != "All":
        match["school_event"] = school_event
    if is_before_holiday is not None and is_before_holiday != "All":
        match["is_before_holiday"] = is_before_holiday == "true"

    overall = list(
        attendance_col.aggregate(
            [
                {"$match": match},
                {
                    "$group": {
                        "_id": None,
                        "total": {"$sum": 1},
                        "present": {
                            "$sum": {"$cond": [{"$eq": ["$status", "Present"]}, 1, 0]}
                        },
                        "absent": {
                            "$sum": {"$cond": [{"$eq": ["$status", "Absent"]}, 1, 0]}
                        },
                    }
                },
                {
                    "$addFields": {
                        "attendance_rate": {
                            "$round": [
                                {"$multiply": [{"$divide": ["$present", "$total"]}, 100]},
                                1,
                            ]
                        }
                    }
                },
            ]
        )
    )

    base_match = {"student_id": student_id}
    if weather_condition and weather_condition != "All":
        base_match["weather_condition"] = weather_condition
    if school_event and school_event != "All":
        base_match["school_event"] = school_event
    if is_before_holiday is not None and is_before_holiday != "All":
        base_match["is_before_holiday"] = is_before_holiday == "true"

    dow_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    dow_raw = list(
        attendance_col.aggregate(
            [
                {"$match": base_match},
                {
                    "$group": {
                        "_id": "$day_of_week",
                        "total": {"$sum": 1},
                        "present": {
                            "$sum": {"$cond": [{"$eq": ["$status", "Present"]}, 1, 0]}
                        },
                    }
                },
                {
                    "$addFields": {
                        "rate": {
                            "$round": [
                                {"$multiply": [{"$divide": ["$present", "$total"]}, 100]},
                                1,
                            ]
                        }
                    }
                },
            ]
        )
    )
    dow_breakdown = [r for r in (next((x for x in dow_raw if x.get("_id") == d), None) for d in dow_order) if r]

    weather_breakdown = list(
        attendance_col.aggregate(
            [
                {
                    "$match": {
                        "student_id": student_id,
                        "weather_condition": {"$exists": True, "$ne": None, "$ne": ""},
                    }
                },
                {
                    "$group": {
                        "_id": "$weather_condition",
                        "total": {"$sum": 1},
                        "present": {
                            "$sum": {"$cond": [{"$eq": ["$status", "Present"]}, 1, 0]}
                        },
                    }
                },
                {
                    "$addFields": {
                        "rate": {
                            "$round": [
                                {"$multiply": [{"$divide": ["$present", "$total"]}, 100]},
                                1,
                            ]
                        }
                    }
                },
                {"$sort": {"rate": -1}},
            ]
        )
    )

    event_breakdown = list(
        attendance_col.aggregate(
            [
                {
                    "$match": {
                        "student_id": student_id,
                        "school_event": {"$exists": True, "$ne": None},
                    }
                },
                {
                    "$group": {
                        "_id": "$school_event",
                        "total": {"$sum": 1},
                        "present": {
                            "$sum": {"$cond": [{"$eq": ["$status", "Present"]}, 1, 0]}
                        },
                    }
                },
                {
                    "$addFields": {
                        "rate": {
                            "$round": [
                                {"$multiply": [{"$divide": ["$present", "$total"]}, 100]},
                                1,
                            ]
                        }
                    }
                },
                {"$sort": {"rate": -1}},
            ]
        )
    )

    monthly = list(
        attendance_col.aggregate(
            [
                {"$match": match},
                {
                    "$group": {
                        "_id": {"year": "$year", "month": "$month"},
                        "total": {"$sum": 1},
                        "present": {
                            "$sum": {"$cond": [{"$eq": ["$status", "Present"]}, 1, 0]}
                        },
                    }
                },
                {
                    "$addFields": {
                        "rate": {
                            "$round": [
                                {"$multiply": [{"$divide": ["$present", "$total"]}, 100]},
                                1,
                            ]
                        }
                    }
                },
                {"$sort": {"_id.year": 1, "_id.month": 1}},
            ]
        )
    )

    distance_info = attendance_col.find_one(
        {"student_id": student_id, "distance_km": {"$exists": True}},
        {"distance_km": 1, "distance_band": 1},
    )

    empty = {
        "student_id": student_id,
        "attendance_rate": None,
        "total": 0,
        "present": 0,
        "absent": 0,
        "dow_breakdown": serialize(dow_breakdown),
        "weather_breakdown": serialize(weather_breakdown),
        "event_breakdown": serialize(event_breakdown),
        "monthly": serialize(monthly),
        "distance_km": serialize(distance_info.get("distance_km")) if distance_info else None,
        "distance_band": serialize(distance_info.get("distance_band")) if distance_info else None,
    }

    if not overall:
        return jsonify(empty)

    overall = overall[0]
    return jsonify(
        {
            "student_id": student_id,
            "attendance_rate": overall["attendance_rate"],
            "total": overall["total"],
            "present": overall["present"],
            "absent": overall["absent"],
            "distance_km": serialize(distance_info.get("distance_km")) if distance_info else None,
            "distance_band": serialize(distance_info.get("distance_band")) if distance_info else None,
            "dow_breakdown": serialize(dow_breakdown),
            "weather_breakdown": serialize(weather_breakdown),
            "event_breakdown": serialize(event_breakdown),
            "monthly": serialize(monthly),
        }
    )


@app.get("/api/forecast/global/lstm")
def forecast_global_lstm():
    steps = int(request.args.get("steps", 30))
    force = request.args.get("force") == "true"

    if force:
        forecasts_col.delete_one({"model_type": "LSTM", "scope": "global", "student_id": None})

    doc = get_or_refresh_forecast(
        "LSTM",
        "global",
        None,
        lambda: build_lstm_forecast(steps),
        force=force,
    )
    return jsonify(serialize(doc))


@app.get("/api/forecast/global/arima")
def forecast_global_arima():
    steps = int(request.args.get("steps", 12))
    force = request.args.get("force") == "true"

    if force:
        forecasts_col.delete_one({"model_type": "ARIMA", "scope": "global", "student_id": None})

    doc = get_or_refresh_forecast(
        "ARIMA",
        "global",
        None,
        lambda: build_arima_forecast(steps, [2, 1, 2]),
        force=force,
    )
    return jsonify(serialize(doc))


@app.get("/api/forecast/student/<student_id>")
def forecast_student(student_id):
    steps = int(request.args.get("steps", 6))
    force = request.args.get("force") == "true"

    if force:
        forecasts_col.delete_one({"model_type": "ARIMA", "scope": "student", "student_id": student_id})

    doc = get_or_refresh_forecast(
        "ARIMA",
        "student",
        student_id,
        lambda: build_student_arima_forecast(student_id, steps),
        force=force,
    )
    return jsonify(serialize(doc))


@app.get("/api/forecast/model/info")
def forecast_model_info():
    return jsonify({"model": "Simulated ML Models", "lstm_architecture": "Mocked LSTM layers", "arima_status": "Fitted on dummy data"})


@app.post("/api/forecast/refresh")
def forecast_refresh():
    forecasts_col.delete_many({"scope": "global"})
    lstm = get_or_refresh_forecast("LSTM", "global", None, lambda: build_lstm_forecast(30), force=True)
    arima = get_or_refresh_forecast("ARIMA", "global", None, lambda: build_arima_forecast(12, [2, 1, 2]), force=True)
    return jsonify({"lstm": "ok" if lstm else "error", "arima": "ok" if arima else "error"})


@app.get("/api/forecast/health")
def forecast_health():
    return jsonify({"ml_service": "online", "status": "ok"})


@app.get("/api/contextual/impact")
def api_contextual_impact():
    return contextual_impact()


@app.post("/api/contextual/student-impact")
def api_contextual_student_impact():
    return contextual_student_impact()


@app.post("/api/contextual/predict")
def api_contextual_predict():
    return contextual_predict()


@app.post("/api/contextual/predict-student")
def api_contextual_predict_student():
    return contextual_predict_student()


@app.post("/api/contextual/guest-trend")
def api_guest_trend():
    return predict_guest_trend()


@app.post("/predict/lstm")
def predict_lstm():
    data = request.json or {}
    steps = int(data.get("steps", 30))
    return jsonify(build_lstm_forecast(steps))


@app.post("/predict/arima")
def predict_arima():
    data = request.json or {}
    steps = int(data.get("steps", 12))
    order = data.get("order", [2, 1, 2])
    return jsonify(build_arima_forecast(steps, order))


@app.post("/predict/student")
def predict_student_arima():
    data = request.json or {}
    steps = int(data.get("steps", 6))
    student_id = data.get("student_id", "unknown")
    return jsonify(build_student_arima_forecast(student_id, steps))


@app.get("/model/info")
def model_info():
    return jsonify({"model": "Simulated ML Models", "lstm_architecture": "Mocked LSTM layers", "arima_status": "Fitted on dummy data"})


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "api_and_ml_combined"})


@app.get("/contextual/impact")
def contextual_impact():
    return jsonify(
        {
            "monthly_impact": [{"month": i, "rate": 85 + (i % 5), "total": 20} for i in range(1, 13)],
            "holiday_impact": [{"is_holiday": False, "rate": 88}, {"is_holiday": True, "rate": 72}],
            "weather_impact": [
                {"condition": "sunny", "rate": 90},
                {"condition": "rainy", "rate": 80},
                {"condition": "cloudy", "rate": 87},
                {"condition": "windy", "rate": 85},
            ],
            "event_impact": [
                {"event": "normal", "rate": 88},
                {"event": "sports_meet", "rate": 95},
                {"event": "exam", "rate": 98},
            ],
            "dow_impact": [
                {"day": d, "rate": 85 + len(d)} for d in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
            ],
            "distance_impact": [
                {"band": "Nearby", "rate": 92},
                {"band": "Moderate", "rate": 88},
                {"band": "Far", "rate": 82},
                {"band": "Very Far", "rate": 75},
            ],
        }
    )


@app.post("/contextual/student-impact")
def contextual_student_impact():
    return jsonify({"status": "mocked"})


@app.post("/contextual/predict")
def contextual_predict():
    data = request.json or {}
    pred = calculate_dynamic_prediction(data, 85.0)
    return jsonify(
        {
            "predicted_attendance_rate": round(pred, 1),
            "historical_rate": 85.0,
            "fallback": False,
            "weather_comparison": [
                {
                    "condition": c,
                    "predicted_rate": round(
                        calculate_dynamic_prediction({**data, "weather": c}, 85.0), 1
                    ),
                }
                for c in ["sunny", "cloudy", "rainy", "windy"]
            ],
            "event_comparison": [
                {
                    "event": e,
                    "predicted_rate": round(
                        calculate_dynamic_prediction({**data, "school_event": e}, 85.0), 1
                    ),
                }
                for e in ["normal", "exam", "sports_meet"]
            ],
            "distance_comparison": [
                {
                    "band": "Nearby",
                    "predicted_rate": round(
                        calculate_dynamic_prediction({**data, "distance_km": 2}, 85.0), 1
                    ),
                },
                {
                    "band": "Moderate",
                    "predicted_rate": round(
                        calculate_dynamic_prediction({**data, "distance_km": 10}, 85.0), 1
                    ),
                },
                {
                    "band": "Far",
                    "predicted_rate": round(
                        calculate_dynamic_prediction({**data, "distance_km": 16}, 85.0), 1
                    ),
                },
                {
                    "band": "Very Far",
                    "predicted_rate": round(
                        calculate_dynamic_prediction({**data, "distance_km": 22}, 85.0), 1
                    ),
                },
            ],
            "feature_importance": [
                {"feature": f"weather_{data.get('weather', 'sunny')}", "importance": 0.35},
                {"feature": "distance_km", "importance": 0.25},
                {
                    "feature": "is_holiday",
                    "importance": 0.25 if data.get("is_holiday") else 0.05,
                },
                {"feature": "school_event", "importance": 0.15},
            ],
        }
    )


@app.post("/contextual/predict-student")
def contextual_predict_student():
    data = request.json or {}
    student_id = data.get("student_id", "STU0000")
    pred = calculate_dynamic_prediction(data, 80.0)

    dist_km = data.get("distance_km", 5)
    dist_band = (
        "Nearby"
        if dist_km < 6.75
        else "Moderate"
        if dist_km < 13
        else "Far"
        if dist_km < 19.25
        else "Very Far"
    )

    return jsonify(
        {
            "student_id": student_id,
            "predicted_attendance_rate": round(pred, 1),
            "historical_rate": 80.0,
            "fallback": False,
            "weather_scan": [
                {
                    "condition": c,
                    "predicted_rate": round(
                        calculate_dynamic_prediction({**data, "weather": c}, 80.0), 1
                    ),
                }
                for c in ["sunny", "cloudy", "rainy", "windy"]
            ],
            "event_scan": [
                {
                    "event": e,
                    "predicted_rate": round(
                        calculate_dynamic_prediction({**data, "school_event": e}, 80.0), 1
                    ),
                }
                for e in ["normal", "exam", "sports_meet"]
            ],
            "distance_scan": [
                {
                    "band": "Nearby",
                    "predicted_rate": round(
                        calculate_dynamic_prediction({**data, "distance_km": 2}, 80.0), 1
                    ),
                },
                {
                    "band": "Moderate",
                    "predicted_rate": round(
                        calculate_dynamic_prediction({**data, "distance_km": 10}, 80.0), 1
                    ),
                },
                {
                    "band": "Far",
                    "predicted_rate": round(
                        calculate_dynamic_prediction({**data, "distance_km": 16}, 80.0), 1
                    ),
                },
                {
                    "band": "Very Far",
                    "predicted_rate": round(
                        calculate_dynamic_prediction({**data, "distance_km": 22}, 80.0), 1
                    ),
                },
            ],
            "holiday_comparison": {
                "without_holiday": round(
                    calculate_dynamic_prediction({**data, "is_holiday": False}, 80.0), 1
                ),
                "with_holiday": round(
                    calculate_dynamic_prediction({**data, "is_holiday": True}, 80.0), 1
                ),
                "holiday_impact": round(
                    calculate_dynamic_prediction({**data, "is_holiday": True}, 80.0)
                    - calculate_dynamic_prediction({**data, "is_holiday": False}, 80.0),
                    1,
                ),
            },
            "distance_band": dist_band,
            "distance_km": dist_km,
        }
    )


@app.post("/predict/guest-trend")
def predict_guest_trend():
    data = request.json or {}
    horizon = data.get("forecast_days", 14)
    weather = data.get("weather", "sunny")
    dist_km = float(data.get("distance_km", 5))
    temperature = float(data.get("temperature", 28))
    attendance_series = data.get("attendance_series", [])
    upcoming_events = data.get("upcoming_events", [])

    if attendance_series:
        hist_rate = round((sum(attendance_series) / len(attendance_series)) * 100, 1)
    else:
        hist_rate = 80.0

    dist_band = (
        "Nearby"
        if dist_km < 6.75
        else "Moderate"
        if dist_km < 13
        else "Far"
        if dist_km < 19.25
        else "Very Far"
    )

    weather_delta = {
        "sunny": 2,
        "cloudy": 0,
        "rainy": -8,
        "windy": -3,
        "stormy": -15,
        "foggy": -5,
    }.get(weather, 0)
    dist_delta = {"Nearby": 3, "Moderate": 0, "Far": -5, "Very Far": -10}.get(dist_band, 0)
    temp_delta = 2 if 22 <= temperature <= 32 else -3 if temperature > 38 else -5 if temperature < 15 else 0
    total_delta = round(weather_delta + dist_delta + temp_delta, 1)

    historical_weekly = []
    days_per_week = 7
    num_weeks = max(1, len(attendance_series) // days_per_week)
    for w in range(num_weeks):
        chunk = attendance_series[w * days_per_week : (w + 1) * days_per_week]
        if chunk:
            rate = round((sum(chunk) / len(chunk)) * 100, 1)
            historical_weekly.append({"label": f"W{w + 1}", "rate": rate})

    forecast_list = []
    base = hist_rate + weather_delta + dist_delta + temp_delta
    today = date.today()
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for i in range(horizon):
        target_date = today + timedelta(days=i + 1)
        event_delta = 0
        for ev in upcoming_events:
            if ev.get("date") == str(target_date):
                event = ev.get("event", "normal")
                if ev.get("is_holiday"):
                    event_delta -= 12
                if event == "exam":
                    event_delta += 10
                elif event == "sports_meet":
                    event_delta += 5
        noise = float(np.random.normal(0, 2))
        arima_rate = round(min(max(base + noise, 0), 100), 1)
        adjusted_rate = round(min(max(arima_rate + event_delta, 0), 100), 1)
        forecast_list.append(
            {
                "day": day_names[target_date.weekday()],
                "date": str(target_date),
                "arima_rate": arima_rate,
                "adjusted_rate": adjusted_rate,
                "ci_lower": round(max(adjusted_rate - 6, 0), 1),
                "ci_upper": round(min(adjusted_rate + 6, 100), 1),
            }
        )

    weeks = max(1, horizon // 7)
    context_explanations = []
    severity_map = [
        (90, "green", "Strong"),
        (80, "yellow", "Moderate"),
        (70, "orange", "At Risk"),
        (0, "red", "Critical"),
    ]
    for w in range(weeks):
        week_fc = forecast_list[w * 7 : (w + 1) * 7]
        if not week_fc:
            continue
        avg = round(sum(f["adjusted_rate"] for f in week_fc) / len(week_fc), 1)
        period_start = week_fc[0]["date"][5:]
        period_end = week_fc[-1]["date"][5:]
        sev_color, sev = "yellow", "Moderate"
        for threshold, color, label in severity_map:
            if avg >= threshold:
                sev_color, sev = color, label
                break
        headlines = {
            "green": f"Excellent week expected - {avg}% attendance",
            "yellow": f"Satisfactory week expected - {avg}% attendance",
            "orange": f"Below-target week expected - {avg}% attendance",
            "red": f"High-risk week - only {avg}% attendance expected",
        }
        context_explanations.append(
            {
                "week": w + 1,
                "period": f"{period_start} - {period_end}",
                "severity": sev,
                "severity_color": sev_color,
                "headline": headlines[sev_color],
                "avg_rate": avg,
                "expected_range": f"{round(avg - 6)}-{round(avg + 6)}%",
                "details": [
                    f"Weather ({weather}) applies a {'+' if weather_delta >= 0 else ''}{weather_delta}% effect",
                    f"Distance band {dist_band} contributes {'+' if dist_delta >= 0 else ''}{dist_delta}%",
                    f"Temperature {temperature}C applies {'+' if temp_delta >= 0 else ''}{temp_delta}% adjustment",
                ],
                "factors": [
                    {"icon": "cloud", "name": f"Weather: {weather}", "delta": weather_delta},
                    {"icon": "distance", "name": f"Distance: {dist_band}", "delta": dist_delta},
                    {"icon": "temp", "name": f"Temperature: {temperature}C", "delta": temp_delta},
                ],
            }
        )

    return jsonify(
        {
            "historical_rate": hist_rate,
            "distance_band": dist_band,
            "converged": True,
            "factor_summary": {
                "total_contextual_delta": total_delta,
                "weather": {
                    "name": weather,
                    "delta": weather_delta,
                    "description": f"{weather.capitalize()} weather impacts attendance by {weather_delta}%",
                },
                "temperature": {
                    "label": f"{temperature}C",
                    "delta": temp_delta,
                    "description": f"Temperature of {temperature}C gives a {temp_delta}% adjustment",
                },
                "distance": {
                    "band": dist_band,
                    "delta": dist_delta,
                    "description": f"{dist_band} distance ({dist_km} km) contributes {dist_delta}%",
                },
            },
            "historical_weekly": historical_weekly,
            "forecast": forecast_list,
            "context_explanations": context_explanations,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
