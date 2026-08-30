import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseModel as BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Hotel Guest Experience & Management Platform"
    HOTEL_NAME: str = "The Grand Heritage Boutique Hotel"
    TOTAL_ROOMS: int = 40
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./hotel.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "hotel-concierge-super-secret-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # LLM Settings (Groq Llama 3.3 70B)
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    # Twilio Settings (optional for live WhatsApp webhook)
    TWILIO_ACCOUNT_SID: Optional[str] = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: Optional[str] = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_WHATSAPP_NUMBER: Optional[str] = os.getenv("TWILIO_WHATSAPP_NUMBER", "+14155238886")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
