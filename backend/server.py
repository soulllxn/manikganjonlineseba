from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import jwt as pyjwt
import bcrypt
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime, timedelta, timezone
from contextlib import asynccontextmanager

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# -------- Config --------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ.get("JWT_SECRET", "manikganj-online-seba-secret-2026-shoriful-alam")
JWT_ALGO = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

DEFAULT_ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@manikganj.com")
DEFAULT_ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Admin@123")

# -------- DB --------
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# -------- Auth utils --------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_jwt(email: str) -> str:
    payload = {
        "sub": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES),
        "iat": datetime.now(timezone.utc),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

security = HTTPBearer(auto_error=False)

async def require_admin(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if creds is None:
        raise HTTPException(status_code=401, detail="অনুমোদন প্রয়োজন")
    token = creds.credentials
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        email = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="অবৈধ টোকেন")
    admin = await db.admins.find_one({"email": email}, {"_id": 0})
    if not admin or not admin.get("is_active", True):
        raise HTTPException(status_code=401, detail="অ্যাডমিন পাওয়া যায়নি")
    return admin

async def seed_admin():
    existing = await db.admins.find_one({"email": DEFAULT_ADMIN_EMAIL})
    if not existing:
        await db.admins.insert_one({
            "id": str(uuid.uuid4()),
            "email": DEFAULT_ADMIN_EMAIL,
            "hashed_password": hash_password(DEFAULT_ADMIN_PASSWORD),
            "full_name": "Manikganj Admin",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

# -------- Sample data seeding --------
async def seed_sample_data():
    """Seed initial demo content if collections are empty."""
    UPZ_ORDER = ["মানিকগঞ্জ সদর", "শিবালয়", "দৌলতপুর", "ঘিওর", "হরিরামপুর", "সাটুরিয়া", "সিংগাইর"]

    # Notices
    if await db.notices.count_documents({}) == 0:
        await db.notices.insert_many([
            _doc({"text": "মানিকগঞ্জ অনলাইন সেবায় আপনাকে স্বাগতম!", "order": 1, "is_active": True}),
            _doc({"text": "জরুরি প্রয়োজনে ৯৯৯ নম্বরে কল করুন।", "order": 2, "is_active": True}),
            _doc({"text": "নতুন রেস্টুরেন্ট মেনু এখন অ্যাপে দেখুন।", "order": 3, "is_active": True}),
        ])

    if await db.sliders.count_documents({}) == 0:
        await db.sliders.insert_many([
            _doc({"title": "মানিকগঞ্জের সৌন্দর্য", "image": "https://images.unsplash.com/photo-1767154966937-68e31b7825f1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200", "order": 1, "is_active": True}),
            _doc({"title": "ঐতিহাসিক স্থাপত্য", "image": "https://images.unsplash.com/photo-1674885674907-22e9e566cc3d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200", "order": 2, "is_active": True}),
            _doc({"title": "জাতীয় স্মৃতিসৌধ", "image": "https://images.unsplash.com/photo-1754501485320-56fed8806e4e?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200", "order": 3, "is_active": True}),
        ])

    if await db.services.count_documents({}) == 0:
        await db.services.insert_many([
            _doc({"name": "হাসপাতাল", "icon": "medkit", "color": "#E11D48", "route": "hospitals", "order": 1, "is_active": True}),
            _doc({"name": "থানা", "icon": "shield-checkmark", "color": "#1E40AF", "route": "police", "order": 2, "is_active": True}),
            _doc({"name": "ফায়ার সার্ভিস", "icon": "flame", "color": "#EA580C", "route": "fire_service", "order": 3, "is_active": True}),
            _doc({"name": "বিশেষজ্ঞ ডাক্তার", "icon": "person", "color": "#0E7490", "route": "doctors", "order": 4, "is_active": True}),
            _doc({"name": "ব্লাড ব্যাংক", "icon": "water", "color": "#BE123C", "route": "blood_banks", "order": 5, "is_active": True}),
            _doc({"name": "অ্যাম্বুলেন্স সেবা", "icon": "car-sport", "color": "#15803D", "route": "ambulances", "order": 6, "is_active": True}),
            _doc({"name": "রেন্ট এ কার", "icon": "car", "color": "#7C3AED", "route": "rent_a_car", "order": 7, "is_active": True}),
            _doc({"name": "রেস্টুরেন্ট", "icon": "restaurant", "color": "#D97706", "route": "restaurants", "order": 8, "is_active": True}),
            _doc({"name": "শীঘ্রই আসছে", "icon": "time", "color": "#64748B", "route": "coming_soon", "order": 9, "is_active": True}),
        ])

    if await db.ads.count_documents({}) == 0:
        await db.ads.insert_many([
            _doc({"title": "Ad Space Available", "image": "https://images.unsplash.com/photo-1542435503-956c469947f6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000", "url": "https://example.com", "order": 1, "is_active": True}),
        ])

    if await db.district_commissioner.count_documents({}) == 0:
        await db.district_commissioner.insert_one(_doc({
            "name": "জনাব আবদুল্লাহ আল মামুন",
            "designation": "জেলা প্রশাসক, মানিকগঞ্জ",
            "phone": "+8801700000000",
            "image": "https://images.pexels.com/photos/10919461/pexels-photo-10919461.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
            "is_active": True,
        }))

    if await db.upazilas.count_documents({}) == 0:
        upazila_seed = [
            {"name": "মানিকগঞ্জ সদর", "uno_name": "জনাব আবু রায়হান", "area": "২১৬.৬৩ বর্গ কিমি", "stats": "জনসংখ্যা: ৩,২৬,৭০০ | ইউনিয়ন: ১০ | পৌরসভা: ১"},
            {"name": "শিবালয়", "uno_name": "জনাব মোঃ রফিকুল ইসলাম", "area": "১৯৬.১৫ বর্গ কিমি", "stats": "জনসংখ্যা: ১,৬৫,৫০০ | ইউনিয়ন: ৭"},
            {"name": "দৌলতপুর", "uno_name": "জনাব মোঃ আব্দুল্লাহ আল মামুন", "area": "১৪৫.৬৭ বর্গ কিমি", "stats": "জনসংখ্যা: ১,৪০,৫০০ | ইউনিয়ন: ৮"},
            {"name": "ঘিওর", "uno_name": "জনাব মোছাঃ সালেহা আক্তার", "area": "১৪২.০৫ বর্গ কিমি", "stats": "জনসংখ্যা: ১,৫৩,৭০০ | ইউনিয়ন: ৭"},
            {"name": "হরিরামপুর", "uno_name": "জনাব মোঃ কামরুজ্জামান", "area": "২৪৫.০৩ বর্গ কিমি", "stats": "জনসংখ্যা: ১,৭৬,৯০০ | ইউনিয়ন: ১৩"},
            {"name": "সাটুরিয়া", "uno_name": "জনাব মোঃ ইয়াসিন", "area": "১৩৭.৪১ বর্গ কিমি", "stats": "জনসংখ্যা: ১,৪৬,৬০০ | ইউনিয়ন: ৯"},
            {"name": "সিংগাইর", "uno_name": "জনাব মোঃ আনিসুর রহমান", "area": "২১৭.৩৬ বর্গ কিমি", "stats": "জনসংখ্যা: ২,৬০,০০০ | ইউনিয়ন: ১১"},
        ]
        await db.upazilas.insert_many([
            _doc({
                "name": u["name"], "order": i + 1, "is_active": True,
                "banner": "https://images.unsplash.com/photo-1767154966937-68e31b7825f1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
                "uno_name": u["uno_name"],
                "uno_phone": "+8801700" + f"{i:06d}",
                "uno_image": "https://images.pexels.com/photos/10919461/pexels-photo-10919461.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=300&w=300",
                "area": u["area"],
                "stats": u["stats"],
                "buttons": [
                    {"label": "স্কুল", "type": "schools", "is_active": True},
                    {"label": "কলেজ", "type": "colleges", "is_active": True},
                    {"label": "মাদ্রাসা", "type": "madrasas", "is_active": True},
                    {"label": "ব্লাড ডোনার", "type": "blood_donors", "is_active": True},
                    {"label": "দর্শনীয় স্থান", "type": "tourist_places", "is_active": True},
                    {"label": "শীঘ্রই আসছে", "type": "coming_soon", "is_active": True},
                ],
            }) for i, u in enumerate(upazila_seed)
        ])

    # Migration: backfill UNO fields and area/stats for existing upazilas (idempotent)
    UNO_DEFAULTS = {
        "মানিকগঞ্জ সদর": {"uno_name": "জনাব আবু রায়হান", "area": "২১৬.৬৩ বর্গ কিমি", "stats": "জনসংখ্যা: ৩,২৬,৭০০ | ইউনিয়ন: ১০ | পৌরসভা: ১"},
        "শিবালয়": {"uno_name": "জনাব মোঃ রফিকুল ইসলাম", "area": "১৯৬.১৫ বর্গ কিমি", "stats": "জনসংখ্যা: ১,৬৫,৫০০ | ইউনিয়ন: ৭"},
        "দৌলতপুর": {"uno_name": "জনাব মোঃ আব্দুল্লাহ আল মামুন", "area": "১৪৫.৬৭ বর্গ কিমি", "stats": "জনসংখ্যা: ১,৪০,৫০০ | ইউনিয়ন: ৮"},
        "ঘিওর": {"uno_name": "জনাব মোছাঃ সালেহা আক্তার", "area": "১৪২.০৫ বর্গ কিমি", "stats": "জনসংখ্যা: ১,৫৩,৭০০ | ইউনিয়ন: ৭"},
        "হরিরামপুর": {"uno_name": "জনাব মোঃ কামরুজ্জামান", "area": "২৪৫.০৩ বর্গ কিমি", "stats": "জনসংখ্যা: ১,৭৬,৯০০ | ইউনিয়ন: ১৩"},
        "সাটুরিয়া": {"uno_name": "জনাব মোঃ ইয়াসিন", "area": "১৩৭.৪১ বর্গ কিমি", "stats": "জনসংখ্যা: ১,৪৬,৬০০ | ইউনিয়ন: ৯"},
        "সিংগাইর": {"uno_name": "জনাব মোঃ আনিসুর রহমান", "area": "২১৭.৩৬ বর্গ কিমি", "stats": "জনসংখ্যা: ২,৬০,০০০ | ইউনিয়ন: ১১"},
    }
    for i, n in enumerate(UPZ_ORDER):
        d = UNO_DEFAULTS.get(n)
        if not d:
            continue
        existing = await db.upazilas.find_one({"name": n})
        if not existing:
            continue
        update_fields = {}
        if not existing.get("uno_name"):
            update_fields["uno_name"] = d["uno_name"]
        if not existing.get("uno_phone"):
            update_fields["uno_phone"] = "+8801700" + f"{i:06d}"
        if not existing.get("uno_image"):
            update_fields["uno_image"] = "https://images.pexels.com/photos/10919461/pexels-photo-10919461.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=300&w=300"
        if not existing.get("area"):
            update_fields["area"] = d["area"]
        if not existing.get("stats"):
            update_fields["stats"] = d["stats"]
        if update_fields:
            await db.upazilas.update_one({"id": existing["id"]}, {"$set": update_fields})

    if await db.hospitals.count_documents({}) == 0:
        await db.hospitals.insert_many([
            _doc({"name": "মানিকগঞ্জ ২৫০ শয্যা জেনারেল হাসপাতাল", "address": "মানিকগঞ্জ সদর, মানিকগঞ্জ", "phone": "+8801712345678", "is_active": True}),
            _doc({"name": "শিবালয় উপজেলা স্বাস্থ্য কমপ্লেক্স", "address": "শিবালয়, মানিকগঞ্জ", "phone": "+8801812345678", "is_active": True}),
            _doc({"name": "ঘিওর উপজেলা স্বাস্থ্য কমপ্লেক্স", "address": "ঘিওর, মানিকগঞ্জ", "phone": "+8801912345678", "is_active": True}),
        ])

    UPZ_ORDER_LOCAL = UPZ_ORDER  # alias to keep migration block stable
    if await db.police.count_documents({}) == 0:
        await db.police.insert_many([
            _doc({"name": f"{n} থানা", "oc_name": "ভারপ্রাপ্ত কর্মকর্তা", "phone": "+8801711000000", "upazila": n, "order": i + 1, "is_active": True})
            for i, n in enumerate(UPZ_ORDER_LOCAL)
        ])

    if await db.fire_service.count_documents({}) == 0:
        await db.fire_service.insert_many([
            _doc({"name": f"{n} ফায়ার সার্ভিস", "phone": "+880199", "address": n, "upazila": n, "order": i + 1, "is_active": True})
            for i, n in enumerate(UPZ_ORDER_LOCAL)
        ])

    # Migration: ensure police/fire_service have entries for ALL 7 upazilas with proper order
    for col, label in (("police", "থানা"), ("fire_service", "ফায়ার সার্ভিস")):
        for i, n in enumerate(UPZ_ORDER):
            existing = await db[col].find_one({"upazila": n})
            if existing:
                await db[col].update_one({"id": existing["id"]}, {"$set": {"order": i + 1}})
            else:
                await db[col].insert_one(_doc({
                    "name": f"{n} {label}",
                    "phone": "+88019900000" + str(i),
                    "address": n,
                    "upazila": n,
                    "order": i + 1,
                    "is_active": True,
                    **({"oc_name": "ভারপ্রাপ্ত কর্মকর্তা"} if col == "police" else {}),
                }))
        # Remove any legacy entries that have no upazila field
        await db[col].delete_many({"upazila": {"$exists": False}})

    if await db.doctors.count_documents({}) == 0:
        await db.doctors.insert_many([
            _doc({"name": "ডা. আব্দুল করিম", "specialty": "মেডিসিন বিশেষজ্ঞ", "chamber": "মানিকগঞ্জ ক্লিনিক", "phone": "+8801711111111", "image": "https://images.pexels.com/photos/10919461/pexels-photo-10919461.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "is_active": True}),
            _doc({"name": "ডা. সালমা খাতুন", "specialty": "গাইনি বিশেষজ্ঞ", "chamber": "নিউ লাইফ হাসপাতাল", "phone": "+8801822222222", "image": "https://images.pexels.com/photos/14230741/pexels-photo-14230741.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940", "is_active": True}),
        ])

    if await db.blood_banks.count_documents({}) == 0:
        await db.blood_banks.insert_many([
            _doc({"name": "মানিকগঞ্জ ব্লাড ব্যাংক", "address": "সদর হাসপাতাল রোড", "phone": "+8801733333333", "details": "২৪ ঘণ্টা সেবা", "is_active": True}),
        ])

    if await db.ambulances.count_documents({}) == 0:
        await db.ambulances.insert_many([
            _doc({"name": "জরুরি অ্যাম্বুলেন্স সেবা", "phone": "+8801711222333", "vehicle_no": "মানিক-ম-১১-১১১১", "is_active": True}),
            _doc({"name": "শিবালয় অ্যাম্বুলেন্স", "phone": "+8801711222334", "vehicle_no": "মানিক-ম-১১-২২২২", "is_active": True}),
        ])

    if await db.rent_a_car.count_documents({}) == 0:
        await db.rent_a_car.insert_many([
            _doc({"name": "মানিকগঞ্জ রেন্ট-এ-কার", "phone": "+8801799000111", "vehicle_no": "ঢাকা-মেট্রো-গ-১১-৫৫৫৫", "upazila": "মানিকগঞ্জ সদর", "is_active": True}),
            _doc({"name": "ঘিওর রেন্ট সার্ভিস", "phone": "+8801799000112", "vehicle_no": "মানিক-গ-২২-৬৬৬৬", "upazila": "ঘিওর", "is_active": True}),
        ])

    if await db.restaurants.count_documents({}) == 0:
        await db.restaurants.insert_many([
            _doc({
                "name": "নবাবী ভোজ", "address": "মানিকগঞ্জ সদর, প্রধান সড়ক",
                "phone": "+8801711555000",
                "image": "https://images.unsplash.com/photo-1565556250026-9ba22083e3e0?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
                "menuImage": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
                "menuImageEnabled": True,
                "mapUrl": "https://maps.google.com/?q=23.8617,90.0058",
                "latitude": 23.8617, "longitude": 90.0058,
                "upazila": "মানিকগঞ্জ সদর", "is_active": True,
            }),
            _doc({
                "name": "শিবালয় ফুড কর্নার", "address": "শিবালয় বাজার",
                "phone": "+8801711555001",
                "image": "https://images.unsplash.com/photo-1559339352-11d035aa65de?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
                "menuImage": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?crop=entropy&cs=srgb&fm=jpg&q=85&w=900",
                "menuImageEnabled": True,
                "mapUrl": "https://maps.google.com/?q=23.92,89.92",
                "latitude": 23.92, "longitude": 89.92,
                "upazila": "শিবালয়", "is_active": True,
            }),
        ])

    if await db.schools.count_documents({}) == 0:
        await db.schools.insert_many([
            _doc({"name": "মানিকগঞ্জ সরকারি উচ্চ বিদ্যালয়", "address": "সদর", "phone": "+8801711100100", "upazila": "মানিকগঞ্জ সদর", "is_active": True}),
            _doc({"name": "শিবালয় বালিকা উচ্চ বিদ্যালয়", "address": "শিবালয়", "phone": "+8801711100101", "upazila": "শিবালয়", "is_active": True}),
        ])

    if await db.colleges.count_documents({}) == 0:
        await db.colleges.insert_many([
            _doc({"name": "সরকারি দেবেন্দ্র কলেজ", "address": "সদর", "phone": "+8801711200200", "upazila": "মানিকগঞ্জ সদর", "is_active": True}),
        ])

    if await db.madrasas.count_documents({}) == 0:
        await db.madrasas.insert_many([
            _doc({"name": "মানিকগঞ্জ আলিয়া মাদ্রাসা", "address": "সদর", "phone": "+8801711300300", "upazila": "মানিকগঞ্জ সদর", "is_active": True}),
        ])

    if await db.blood_donors.count_documents({}) == 0:
        await db.blood_donors.insert_many([
            _doc({"name": "মোঃ রহিম", "blood_group": "O+", "address": "সদর", "phone": "+8801711400400", "upazila": "মানিকগঞ্জ সদর", "is_active": True}),
            _doc({"name": "ফাতেমা বেগম", "blood_group": "B+", "address": "ঘিওর", "phone": "+8801711400401", "upazila": "ঘিওর", "is_active": True}),
        ])

    if await db.tourist_places.count_documents({}) == 0:
        await db.tourist_places.insert_many([
            _doc({"name": "বালিয়াটি জমিদার বাড়ি", "description": "১৯ শতকের ঐতিহাসিক জমিদার বাড়ি।", "location": "সাটুরিয়া", "image": "https://images.unsplash.com/photo-1674885674907-22e9e566cc3d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200", "upazila": "সাটুরিয়া", "is_active": True}),
            _doc({"name": "তেওতা জমিদার বাড়ি", "description": "ঐতিহাসিক স্থাপনা।", "location": "শিবালয়", "image": "https://images.unsplash.com/photo-1767154966937-68e31b7825f1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200", "upazila": "শিবালয়", "is_active": True}),
        ])

    if await db.notifications.count_documents({}) == 0:
        await db.notifications.insert_many([
            _doc({"title": "মানিকগঞ্জ অনলাইন সেবায় স্বাগতম!", "body": "আপনার জেলার সকল প্রয়োজনীয় সেবা এখন এক অ্যাপে।", "is_active": True}),
            _doc({"title": "নতুন রেস্টুরেন্ট মেনু এসেছে", "body": "এখন রেস্টুরেন্টের নামে ট্যাপ করে মেনু দেখতে পারবেন।", "is_active": True}),
        ])

    if await db.e_services.count_documents({}) == 0:
        await db.e_services.insert_many([
            _doc({"name": "NID সেবা", "icon": "card", "url": "https://services.nidw.gov.bd/", "order": 1, "is_active": True}),
            _doc({"name": "পাসপোর্ট সেবা", "icon": "globe", "url": "https://www.epassport.gov.bd/", "order": 2, "is_active": True}),
            _doc({"name": "SSC ও HSC রেজাল্ট", "icon": "school", "url": "https://eboardresults.com/", "order": 3, "is_active": True}),
            _doc({"name": "জাতীয় বিশ্ববিদ্যালয়", "icon": "library", "url": "https://www.nu.ac.bd/", "order": 4, "is_active": True}),
            _doc({"name": "জন্ম নিবন্ধন যাচাই", "icon": "document-text", "url": "https://everify.bdris.gov.bd/", "order": 5, "is_active": True}),
            _doc({"name": "শীঘ্রই আসছে", "icon": "time", "url": "", "order": 6, "is_active": True}),
        ])


def _doc(data: dict) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        **data,
    }


# -------- Lifespan --------
@asynccontextmanager
async def lifespan(app: FastAPI):
    await seed_admin()
    await seed_sample_data()
    yield
    client.close()


app = FastAPI(title="মানিকগঞ্জ অনলাইন সেবা API", lifespan=lifespan)
api = APIRouter(prefix="/api")


# -------- Auth Routes --------
class LoginPayload(BaseModel):
    email: str
    password: str


@api.post("/auth/login")
async def login(payload: LoginPayload):
    admin = await db.admins.find_one({"email": payload.email})
    if not admin or not verify_password(payload.password, admin.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="ভুল ইমেইল বা পাসওয়ার্ড")
    if not admin.get("is_active", True):
        raise HTTPException(status_code=403, detail="অ্যাকাউন্ট নিষ্ক্রিয়")
    token = create_jwt(payload.email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "admin": {"email": admin["email"], "full_name": admin.get("full_name", "Admin")},
    }


@api.get("/auth/me")
async def me(admin: dict = Depends(require_admin)):
    return {"email": admin["email"], "full_name": admin.get("full_name", "Admin")}


# -------- Generic CRUD factory --------
PUBLIC_COLLECTIONS = {
    "notices", "sliders", "services", "ads", "hospitals", "police",
    "fire_service", "doctors", "blood_banks", "ambulances", "rent_a_car",
    "restaurants", "upazilas", "schools", "colleges", "madrasas",
    "blood_donors", "tourist_places", "e_services", "notifications",
}

ALL_COLLECTIONS = PUBLIC_COLLECTIONS | {"district_commissioner", "complaints", "join_requests"}


def _strip(doc: dict) -> dict:
    if not doc:
        return doc
    doc.pop("_id", None)
    return doc


@api.get("/public/{collection}")
async def public_list(collection: str, upazila: Optional[str] = None):
    if collection not in PUBLIC_COLLECTIONS and collection != "district_commissioner":
        raise HTTPException(status_code=404, detail="Collection not found")
    query: Dict[str, Any] = {"is_active": True}
    if upazila:
        query["upazila"] = upazila
    cursor = db[collection].find(query, {"_id": 0}).sort([("order", 1), ("created_at", -1)])
    items = await cursor.to_list(1000)
    return items


@api.get("/public/district_commissioner/single")
async def public_dc():
    doc = await db.district_commissioner.find_one({"is_active": True}, {"_id": 0})
    return doc or {}


# Forms (public submit)
class ComplaintIn(BaseModel):
    name: str
    phone: str
    message: str
    type: str = "complaint"  # complaint | suggestion


@api.post("/public/complaints")
async def submit_complaint(payload: ComplaintIn):
    doc = _doc({**payload.dict(), "is_active": True})
    await db.complaints.insert_one(doc.copy())
    return {"success": True, "id": doc["id"]}


class JoinRequestIn(BaseModel):
    name: str
    phone: str
    category: str
    address: Optional[str] = ""
    note: Optional[str] = ""


@api.post("/public/join_requests")
async def submit_join_request(payload: JoinRequestIn):
    doc = _doc({**payload.dict(), "is_active": True})
    await db.join_requests.insert_one(doc.copy())
    return {"success": True, "id": doc["id"]}


# -------- Admin CRUD (generic) --------
@api.get("/admin/{collection}")
async def admin_list(collection: str, admin: dict = Depends(require_admin)):
    if collection not in ALL_COLLECTIONS:
        raise HTTPException(status_code=404, detail="Collection not found")
    items = await db[collection].find({}, {"_id": 0}).sort([("order", 1), ("created_at", -1)]).to_list(2000)
    return items


@api.post("/admin/{collection}")
async def admin_create(collection: str, payload: Dict[str, Any], admin: dict = Depends(require_admin)):
    if collection not in ALL_COLLECTIONS:
        raise HTTPException(status_code=404, detail="Collection not found")
    payload.setdefault("is_active", True)
    doc = _doc(payload)
    await db[collection].insert_one(doc.copy())
    return _strip(doc)


@api.put("/admin/{collection}/{item_id}")
async def admin_update(collection: str, item_id: str, payload: Dict[str, Any], admin: dict = Depends(require_admin)):
    if collection not in ALL_COLLECTIONS:
        raise HTTPException(status_code=404, detail="Collection not found")
    payload.pop("id", None)
    payload.pop("_id", None)
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db[collection].update_one({"id": item_id}, {"$set": payload})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    item = await db[collection].find_one({"id": item_id}, {"_id": 0})
    return item


@api.delete("/admin/{collection}/{item_id}")
async def admin_delete(collection: str, item_id: str, admin: dict = Depends(require_admin)):
    if collection not in ALL_COLLECTIONS:
        raise HTTPException(status_code=404, detail="Collection not found")
    res = await db[collection].delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True}


# DC singleton update endpoint (overwrites the single document)
@api.post("/admin/district_commissioner/upsert")
async def admin_upsert_dc(payload: Dict[str, Any], admin: dict = Depends(require_admin)):
    payload.setdefault("is_active", True)
    existing = await db.district_commissioner.find_one({}, {"_id": 0})
    if existing:
        payload["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.district_commissioner.update_one({"id": existing["id"]}, {"$set": payload})
        return await db.district_commissioner.find_one({"id": existing["id"]}, {"_id": 0})
    doc = _doc(payload)
    await db.district_commissioner.insert_one(doc.copy())
    return _strip(doc)


# Healthcheck
@api.get("/")
async def root():
    return {"app": "মানিকগঞ্জ অনলাইন সেবা", "status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)
