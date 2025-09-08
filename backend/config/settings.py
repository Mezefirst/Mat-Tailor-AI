"""
Configuration settings for MatTailor AI Backend
"""

import os
from functools import lru_cache
from pydantic import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # Application settings
    app_name: str = "MatTailor AI"
    app_version: str = "1.0.0"
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Server settings
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", 8000))
    reload: bool = environment == "development"
    
    # CORS settings
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://mattailor-ai.netlify.app",
        "https://mattailor-ai.vercel.app"
    ]
    
    # Database settings (for future implementation)
    database_url: Optional[str] = os.getenv("DATABASE_URL")
    redis_url: Optional[str] = os.getenv("REDIS_URL")
    
    # ML/AI settings
    huggingface_api_key: Optional[str] = os.getenv("HUGGINGFACE_API_KEY")
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
    model_cache_dir: str = os.getenv("MODEL_CACHE_DIR", "./models")
    
    # Recommendation engine settings
    default_max_results: int = 20
    similarity_threshold: float = 0.7
    cache_ttl_hours: int = 1
    
    # Rate limiting
    rate_limit_per_minute: int = 60
    rate_limit_burst: int = 100
    
    # Logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Security
    secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # External APIs
    material_database_api_url: Optional[str] = os.getenv("MATERIAL_DB_API_URL")
    supplier_api_url: Optional[str] = os.getenv("SUPPLIER_API_URL")
    
    # Performance settings
    worker_threads: int = int(os.getenv("WORKER_THREADS", 4))
    max_request_size: int = 10 * 1024 * 1024  # 10MB
    request_timeout: int = 60  # seconds
    
    # Feature flags
    enable_ml_prediction: bool = os.getenv("ENABLE_ML_PREDICTION", "True").lower() == "true"
    enable_rl_planning: bool = os.getenv("ENABLE_RL_PLANNING", "True").lower() == "true"
    enable_nlp_processing: bool = os.getenv("ENABLE_NLP_PROCESSING", "True").lower() == "true"
    enable_caching: bool = os.getenv("ENABLE_CACHING", "True").lower() == "true"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
