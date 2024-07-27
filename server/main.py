from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import random
import string
from twilio.rest import Client
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# Load environment variables from a .env file
load_dotenv()

# Retrieve Twilio credentials and MongoDB URI from environment variables
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')
MONGO_URI = os.getenv('MONGO_URI')
DEFAULT_TIMINGS_ID = ObjectId("64c1be88a8233dbee508a4c6")
DEFAULT_ABOUT_ID = ObjectId("64c1be88a8233dbee508a4c7")

DEFAULT_TIMINGS = {
    "_id": DEFAULT_TIMINGS_ID,
    "text": "Default timings information."
}

DEFAULT_ABOUT = {
    "_id": DEFAULT_ABOUT_ID,
    "text": "Default about information."
}

# Initialize Twilio client
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Initialize FastAPI
app = FastAPI()

# CORS Middleware
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB client and database
mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client['vanamala_clinic']

# In-memory store for OTPs
otp_store = {}

# Pydantic models
class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    phone: str
    otp: str

class ContentUpdate(BaseModel):
    content: str

class ListUpdate(BaseModel):
    items: list

class ServiceUpdate(BaseModel):
    service_name: str
    description: str

class ReferenceLink(BaseModel):
    title: str
    url: str

# Helper functions
def generate_otp(phone):
    otp = ''.join(random.choices(string.digits, k=6))
    otp_store[phone] = otp
    try:
        # Send OTP via SMS
        message = client.messages.create(
            body=f"Your OTP is {otp}",
            from_=TWILIO_PHONE_NUMBER,
            to=phone
        )
        print(f"Message sent with SID {message.sid}")
    except Exception as e:
        print(f"Failed to send OTP: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP")
    return otp

def verify_otp(phone, otp):
    return otp_store.get(phone) == otp

def serialize_item(item):
    item['_id'] = str(item['_id'])
    return item

@app.on_event("startup")
async def startup_event():
    timings_collection = db['timings']
    about_collection = db['about']

    # Insert default timings if not already present
    await timings_collection.update_one(
        {"_id": DEFAULT_TIMINGS_ID},
        {"$setOnInsert": DEFAULT_TIMINGS},
        upsert=True
    )

    # Insert default about content if not already present
    await about_collection.update_one(
        {"_id": DEFAULT_ABOUT_ID},
        {"$setOnInsert": DEFAULT_ABOUT},
        upsert=True
    )

@app.post("/request-otp")
def request_otp(data: OTPRequest):
    phone_number = data.phone
    generate_otp(phone_number)
    return {"success": True, "message": "OTP sent to your phone number"}

@app.post("/verify-otp")
def verify_otp_route(data: OTPVerify):
    phone_number = data.phone
    entered_otp = data.otp
    if phone_number in otp_store and verify_otp(phone_number, entered_otp):
        del otp_store[phone_number]  # Remove the OTP after successful verification
        return {"success": True, "message": "OTP verified successfully"}
    else:
        raise HTTPException(status_code=400, detail="Incorrect OTP")

def serialize_item(item):
    item['_id'] = str(item['_id'])
    return item

@app.post("/announcements")
async def create_announcement(announcement: dict):
    collection = db['announcements']
    result = await collection.insert_one(announcement)
    return {"id": str(result.inserted_id)}

@app.get("/announcements")
async def get_announcements():
    collection = db['announcements']
    announcements = await collection.find().to_list(length=100)
    return [serialize_item(announcement) for announcement in announcements]

@app.put("/announcements/{id}")
async def update_announcement(id: str, announcement: dict):
    collection = db['announcements']
    result = await collection.update_one({"_id": ObjectId(id)}, {"$set": announcement})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"success": True, "message": "Announcement updated"}

@app.delete("/announcements/{id}")
async def delete_announcement(id: str):
    collection = db['announcements']
    result = await collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"success": True, "message": "Announcement deleted"}

# Similarly update services endpoints
@app.post("/services")
async def create_service(service: dict):
    collection = db['services']
    result = await collection.insert_one(service)
    return {"id": str(result.inserted_id)}

@app.get("/services")
async def get_services():
    collection = db['services']
    services = await collection.find().to_list(length=100)
    return [serialize_item(service) for service in services]

@app.put("/services/{id}")
async def update_service(id: str, service: dict):
    collection = db['services']
    result = await collection.update_one({"_id": ObjectId(id)}, {"$set": service})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"success": True, "message": "Service updated"}

@app.delete("/services/{id}")
async def delete_service(id: str):
    collection = db['services']
    result = await collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"success": True, "message": "Service deleted"}

# Similarly update reference-links endpoints
@app.post("/links")
async def create_reference_link(reference_link: dict):
    collection = db['reference-links']
    result = await collection.insert_one(reference_link)
    return {"id": str(result.inserted_id)}

@app.get("/links")
async def get_reference_links():
    collection = db['reference-links']
    reference_links = await collection.find().to_list(length=100)
    return [serialize_item(reference_link) for reference_link in reference_links]

@app.put("/links/{id}")
async def update_reference_link(id: str, reference_link: dict):
    collection = db['reference-links']
    result = await collection.update_one({"_id": ObjectId(id)}, {"$set": reference_link})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reference link not found")
    return {"success": True, "message": "Reference link updated"}

@app.delete("/links/{id}")
async def delete_reference_link(id: str):
    collection = db['reference-links']
    result = await collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reference link not found")
    return {"success": True, "message": "Reference link deleted"}

# Similarly update timings endpoints
@app.post("/timings")
async def create_timings(timings: dict):
    collection = db['timings']
    result = await collection.replace_one({"_id": DEFAULT_TIMINGS_ID}, timings, upsert=True)
    return {"success": True, "message": "Timings updated"}

@app.get("/timings")
async def get_timings():
    collection = db['timings']
    timings = await collection.find_one({"_id": DEFAULT_TIMINGS_ID})
    if timings is None:
        raise HTTPException(status_code=404, detail="Timings not found")
    return serialize_item(timings)

@app.put("/timings/{id}")
async def update_timings(id: str, timings: dict):
    collection = db['timings']
    result = await collection.update_one({"_id": ObjectId(id)}, {"$set": timings})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Timings not found")
    return {"success": True, "message": "Timings updated"}


# Similarly update about endpoints
@app.post("/about")
async def create_or_update_about(about: dict):
    collection = db['about']
    result = await collection.replace_one({"_id": DEFAULT_ABOUT_ID}, about, upsert=True)
    return {"success": True, "message": "About content updated"}

@app.get("/about")
async def get_about():
    collection = db['about']
    about = await collection.find_one({"_id": DEFAULT_ABOUT_ID})
    if about is None:
        raise HTTPException(status_code=404, detail="About content not found")
    return serialize_item(about)

@app.put("/about/{id}")
async def update_about(id: str, about: dict):
    collection = db['about']
    result = await collection.update_one({"_id": ObjectId(id)}, {"$set": about})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="About content not found")
    return {"success": True, "message": "About content updated"}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)