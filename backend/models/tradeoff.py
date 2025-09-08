"""
Trade-off analysis models for comparing materials across multiple criteria
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class TradeoffCriteria(BaseModel):
    name: str = Field(..., description="Criteria name")
    weight: float = Field(..., description="Importance weight (0-1)")
    direction: str = Field(..., description="'maximize' or 'minimize'")
    unit: Optional[str] = Field(None, description="Unit of measurement")

class MaterialComparison(BaseModel):
    material_id: str
    material_name: str
    criteria_values: Dict[str, float] = Field(..., description="Values for each criteria")
    normalized_scores: Dict[str, float] = Field(..., description="Normalized scores (0-1)")
    weighted_score: float = Field(..., description="Overall weighted score")
    rank: int = Field(..., description="Ranking position")

class TradeoffAnalysis(BaseModel):
    analysis_id: str = Field(..., description="Unique analysis identifier")
    materials: List[MaterialComparison] = Field(..., description="Materials being compared")
    criteria: List[TradeoffCriteria] = Field(..., description="Comparison criteria")
    
    # Analysis Results
    best_overall: str = Field(..., description="Material ID with best overall score")
    pareto_optimal: List[str] = Field(..., description="Pareto optimal material IDs")
    
    # Trade-off Insights
    strongest_correlations: Dict[str, float] = Field(default_factory=dict)
    recommendation_summary: str = Field(..., description="Human-readable summary")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    analysis_method: str = Field("weighted_sum", description="Analysis methodology used")
    confidence_score: float = Field(..., description="Confidence in the analysis")

class SensitivityAnalysis(BaseModel):
    """Sensitivity analysis for understanding how weight changes affect rankings"""
    base_ranking: List[str] = Field(..., description="Base ranking of materials")
    weight_variations: Dict[str, List[str]] = Field(..., description="Rankings under different weights")
    stability_score: float = Field(..., description="How stable the ranking is")
    critical_criteria: List[str] = Field(..., description="Criteria that most affect ranking")
