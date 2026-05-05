from datetime import datetime, timedelta, timezone
import json
import os

import jwt
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from google.auth.transport import requests
from google.oauth2 import id_token
from pymongo import MongoClient

load_dotenv()

app = FastAPI(title="Auth Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
JWT_SECRET = os.getenv("JWT_SECRET", "change-me")
JWT_EXP_MINUTES = int(os.getenv("JWT_EXP_MINUTES", "120"))
TEACHER_EMAILS = {
    email.strip().lower()
    for email in os.getenv("TEACHER_EMAILS", "").split(",")
    if email.strip()
}
USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")
MONGODB_URI = os.getenv("MONGODB_URI", "").strip()
MONGODB_DB = os.getenv("MONGODB_DB", "eduguide").strip()
MONGODB_USERS_COLLECTION = os.getenv("MONGODB_USERS_COLLECTION", "users").strip()
_mongo_client = None


def load_users_file():
    if not os.path.exists(USERS_FILE):
        return {}
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except Exception:
        return {}


def save_users_file(users):
    tmp_path = f"{USERS_FILE}.tmp"
    with open(tmp_path, "w", encoding="utf-8") as handle:
        json.dump(users, handle, indent=2)
    os.replace(tmp_path, USERS_FILE)


def get_users_collection():
    global _mongo_client
    if not MONGODB_URI:
        return None
    if _mongo_client is None:
        _mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    return _mongo_client[MONGODB_DB][MONGODB_USERS_COLLECTION]


def get_user_map():
    collection = get_users_collection()
    if collection is None:
        return load_users_file()
    users = {}
    for doc in collection.find({}, {"_id": 0}):
        email = (doc.get("email") or "").strip().lower()
        if email:
            users[email] = doc
    return users


def upsert_user(user):
    collection = get_users_collection()
    if collection is None:
        users = load_users_file()
        users[user["email"]] = user
        save_users_file(users)
        return
    collection.update_one({"email": user["email"]}, {"$set": user}, upsert=True)


def fetch_users_list():
    collection = get_users_collection()
    if collection is None:
        users = load_users_file()
        return sorted(users.values(), key=lambda u: u.get("email", ""))
    return list(collection.find({}, {"_id": 0}).sort("email", 1))


def delete_user_by_email(email: str):
    collection = get_users_collection()
    if collection is None:
        users = load_users_file()
        users.pop(email, None)
        save_users_file(users)
        return
    collection.delete_one({"email": email})


def hash_password(password: str, salt: str) -> str:
    import hashlib

    return hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()


def verify_password(password: str, salt: str, digest: str) -> bool:
    return hash_password(password, salt) == digest


def issue_token(user):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXP_MINUTES)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def get_current_user(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload


def require_teacher(payload):
    if payload.get("role") != "teacher":
        raise HTTPException(status_code=403, detail="Teacher role required")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/auth/google")
async def google_login(payload: dict):
    credential = payload.get("credential")
    if not credential:
        raise HTTPException(status_code=400, detail="Missing credential")

    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Missing GOOGLE_CLIENT_ID")

    try:
        idinfo = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google credential")

    email = (idinfo.get("email") or "").strip().lower()
    users = get_user_map()
    existing = users.get(email, {})
    role = existing.get("role") or ("teacher" if email in TEACHER_EMAILS else "student")
    user = {
        "id": idinfo.get("sub"),
        "name": idinfo.get("name") or idinfo.get("given_name") or "User",
        "email": email,
        "role": role,
        "last_login": datetime.now(timezone.utc).isoformat(),
    }

    upsert_user(user)

    token = issue_token(user)
    return {"token": token, "user": user}


@app.post("/api/auth/login")
async def login(payload: dict):
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    users = get_user_map()
    user = users.get(email)
    if not user or "password_hash" not in user or "password_salt" not in user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(password, user["password_salt"], user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user["last_login"] = datetime.now(timezone.utc).isoformat()
    upsert_user(user)
    token = issue_token(user)
    return {"token": token, "user": user}


@app.post("/api/auth/register")
async def register(payload: dict):
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    role = (payload.get("role") or "student").strip().lower()

    if not name or len(name) < 2:
        raise HTTPException(status_code=400, detail="Name is required")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if role not in {"student", "teacher"}:
        raise HTTPException(status_code=400, detail="Invalid role")
    if role == "teacher" and email not in TEACHER_EMAILS:
        raise HTTPException(status_code=403, detail="Teacher role requires approval")

    users = get_user_map()
    if email in users:
        raise HTTPException(status_code=409, detail="User already exists")

    salt = os.urandom(16).hex()
    user = {
        "id": f"local:{email}",
        "name": name,
        "email": email,
        "role": role,
        "password_salt": salt,
        "password_hash": hash_password(password, salt),
        "last_login": datetime.now(timezone.utc).isoformat(),
    }

    upsert_user(user)
    token = issue_token(user)
    return {"token": token, "user": user}


@app.get("/api/teacher/users")
async def list_users(authorization: str | None = Header(default=None)):
    payload = get_current_user(authorization)
    require_teacher(payload)
    return {"users": fetch_users_list()}


@app.get("/api/teacher/stats")
async def stats(authorization: str | None = Header(default=None)):
    payload = get_current_user(authorization)
    require_teacher(payload)
    users = fetch_users_list()
    total = len(users)
    teachers = sum(1 for u in users if u.get("role") == "teacher")
    students = total - teachers
    return {"total": total, "teachers": teachers, "students": students}


@app.patch("/api/teacher/users/{email}/role")
async def update_role(email: str, payload: dict, authorization: str | None = Header(default=None)):
    user_payload = get_current_user(authorization)
    require_teacher(user_payload)
    role = (payload.get("role") or "").strip().lower()
    if role not in {"student", "teacher"}:
        raise HTTPException(status_code=400, detail="Invalid role")

    users = get_user_map()
    key = email.strip().lower()
    if key not in users:
        raise HTTPException(status_code=404, detail="User not found")
    users[key]["role"] = role
    upsert_user(users[key])
    return {"success": True}


@app.delete("/api/teacher/users/{email}")
async def delete_user(email: str, authorization: str | None = Header(default=None)):
    user_payload = get_current_user(authorization)
    require_teacher(user_payload)
    users = get_user_map()
    key = email.strip().lower()
    if key not in users:
        raise HTTPException(status_code=404, detail="User not found")
    delete_user_by_email(key)
    return {"success": True}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5050)
