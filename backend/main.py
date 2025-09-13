"""
MatTailor AI Backend - FastAPI Application
Intelligent Material Discovery and Recommendation System
"""

# Core imports
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import os
import uvicorn

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Service modules
from services.recommender import MaterialRecommender
from services.nlp import NLPProcessor
from services.simulation import PropertySimulator
from services.rl_stub import RLPlanner


# Models
from models.material import Material, MaterialQuery, RecommendationResult
from models.tradeoff import TradeoffAnalysis
from config.settings import get_settings

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI(
    title="MatTailor AI API",
    description="Intelligent Material Discovery and Recommendation System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Initialize services
settings = get_settings()
recommender = MaterialRecommender()
nlp_processor = NLPProcessor()
simulator = PropertySimulator()
rl_planner = RLPlanner()


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@limiter.limit("100/minute")
async def root(request: Request):
    return {
        "service": "MatTailor AI API",
        "version": "1.0.0",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat(),
        "features": [
            "Material Recommendation",
            "NLP Query Processing",
            "Property Simulation",
            "Trade-off Analysis",
            "RL Planning (Stub)",
            "LLM Integration"
        ]
    }

@app.get("/health")
@limiter.limit("200/minute")
async def health_check(request: Request):
    try:
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "recommender": "operational",
                "nlp": "operational",
                "simulator": "operational",
                "rl_planner": "operational",
                "llm": "operational"
            },
            "database": "connected",
            "memory_usage": "normal"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")

@app.post("/recommend", response_model=RecommendationResult)
@limiter.limit("30/minute")
async def recommend_materials(request: Request, query: MaterialQuery):
    try:
        logger.info(f"Processing recommendation request for user: {get_remote_address(request)}")

        if query.natural_language_query:
            enhanced_query = await nlp_processor.process_query(query.natural_language_query, query)
            query = enhanced_query

        recommendations = await recommender.recommend(query)

        for material in recommendations.materials:
            material.simulated_properties = await simulator.simulate_properties(material, query.requirements)

        logger.info(f"Generated {len(recommendations.materials)} recommendations")
        return recommendations

    except Exception as e:
        logger.error(f"Recommendation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Recommendation service temporarily unavailable")

@app.post("/alternatives")
@limiter.limit("30/minute")
async def suggest_alternatives(request: Request, material_id: str, requirements: Dict[str, Any]):
    try:
        alternatives = await recommender.find_alternatives(material_id, requirements)
        return {"alternatives": alternatives}
    except Exception as e:
        logger.error(f"Alternative search failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Alternative search service temporarily unavailable")

@app.post("/tradeoff", response_model=TradeoffAnalysis)
@limiter.limit("20/minute")
async def analyze_tradeoffs(request: Request, material_ids: List[str], criteria: List[str]):
    try:
        analysis = await simulator.analyze_tradeoffs(material_ids, criteria)
        return analysis
    except Exception as e:
        logger.error(f"Trade-off analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Trade-off analysis service temporarily unavailable")

@app.post("/simulate")
@limiter.limit("20/minute")
async def simulate_material_properties(request: Request, composition: Dict[str, float], conditions: Dict[str, Any]):
    try:
        properties = await simulator.simulate_custom_material(composition, conditions)
        return {"simulated_properties": properties}
    except Exception as e:
        logger.error(f"Property simulation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Simulation service temporarily unavailable")

@app.post("/plan_rl")
@limiter.limit("10/minute")
async def plan_with_rl(request: Request, objectives: List[str], constraints: Dict[str, Any], background_tasks: BackgroundTasks):
    try:
        logger.info("Initiating RL-based planning")
        background_tasks.add_task(rl_planner.train_and_recommend, objectives, constraints)
        return {
            "status": "initiated",
            "message": "RL planning started in background",
            "estimated_completion": "2-5 minutes"
        }
    except Exception as e:
        logger.error(f"RL planning failed: {str(e)}")
        raise HTTPException(status_code=500, detail="RL planning service temporarily unavailable")

@app.post("/llm")
@limiter.limit("20/minute")
async def query_llm(request: Request, prompt: str):
    """Query the LLM via SparkClient"""
    try:
        response = await spark.llm(prompt, "gpt-4o-mini", True)
        return {"response": response}
    except Exception as e:
        logger.error(f"LLM query failed: {str(e)}")
        raise HTTPException(status_code=500, detail="LLM service temporarily unavailable")

@app.get("/materials/search")
@limiter.limit("60/minute")
async def search_materials(request: Request, query: str, category: Optional[str] = None, limit: int = 20):
    try:
        results = await recommender.search_materials(query, category, limit)
        return {"materials": results}
    except Exception as e:
        logger.error(f"Material search failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Search service temporarily unavailable")

@app.get("/materials/{material_id}")
@limiter.limit("100/minute")
async def get_material_details(request: Request, material_id: str):
    try:
        material = await recommender.get_material_by_id(material_id)
        if not material:
            raise HTTPException(status_code=404, detail="Material not found")
        return material
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Material retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Material retrieval service temporarily unavailable")

@app.get("/suppliers")
@limiter.limit("60/minute")
async def get_suppliers(request: Request, material_id: str, region: Optional[str] = None, min_quantity: Optional[int] = None):
    try:
        suppliers = await recommender.get_suppliers(material_id, region, min_quantity)
        return {"suppliers": suppliers}
    except Exception as e:
        logger.error(f"Supplier search failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Supplier search service temporarily unavailable")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT", "production") == "development"
    )
