"""
Pydantic models for Material data structures
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from enum import Enum
from datetime import datetime

class MaterialCategory(str, Enum):
    METAL = "metal"
    POLYMER = "polymer"
    CERAMIC = "ceramic"
    COMPOSITE = "composite"
    SEMICONDUCTOR = "semiconductor"
    BIOMATERIAL = "biomaterial"

class ApplicationDomain(str, Enum):
    AEROSPACE = "aerospace"
    AUTOMOTIVE = "automotive"
    CONSTRUCTION = "construction"
    ELECTRONICS = "electronics"
    MEDICAL = "medical"
    PACKAGING = "packaging"
    ENERGY = "energy"
    MARINE = "marine"

class Material(BaseModel):
    id: str = Field(..., description="Unique material identifier")
    name: str = Field(..., description="Material name")
    category: MaterialCategory = Field(..., description="Material category")
    composition: Dict[str, float] = Field(default_factory=dict, description="Chemical composition")
    
    # Mechanical Properties
    tensile_strength: Optional[float] = Field(None, description="Tensile strength (MPa)")
    yield_strength: Optional[float] = Field(None, description="Yield strength (MPa)")
    elastic_modulus: Optional[float] = Field(None, description="Elastic modulus (GPa)")
    hardness: Optional[float] = Field(None, description="Hardness (HV)")
    density: Optional[float] = Field(None, description="Density (g/cm³)")
    fatigue_limit: Optional[float] = Field(None, description="Fatigue limit (MPa)")
    
    # Thermal Properties  
    melting_point: Optional[float] = Field(None, description="Melting point (°C)")
    thermal_conductivity: Optional[float] = Field(None, description="Thermal conductivity (W/m·K)")
    thermal_expansion: Optional[float] = Field(None, description="Thermal expansion coefficient (1/K)")
    specific_heat: Optional[float] = Field(None, description="Specific heat (J/kg·K)")
    
    # Electrical Properties
    electrical_conductivity: Optional[float] = Field(None, description="Electrical conductivity (S/m)")
    dielectric_constant: Optional[float] = Field(None, description="Dielectric constant")
    
    # Chemical Properties
    corrosion_resistance: Optional[float] = Field(None, description="Corrosion resistance rating (1-10)")
    chemical_stability: Optional[float] = Field(None, description="Chemical stability rating (1-10)")
    
    # Environmental & Economic
    cost_per_kg: Optional[float] = Field(None, description="Cost per kilogram (USD)")
    sustainability_score: Optional[float] = Field(None, description="Sustainability score (1-10)")
    recyclability: Optional[float] = Field(None, description="Recyclability rating (1-10)")
    carbon_footprint: Optional[float] = Field(None, description="Carbon footprint (kg CO2/kg)")
    
    # Availability & Manufacturing
    availability_score: Optional[float] = Field(None, description="Market availability (1-10)")
    manufacturing_complexity: Optional[float] = Field(None, description="Manufacturing complexity (1-10)")
    lead_time_days: Optional[int] = Field(None, description="Typical lead time in days")
    
    # Simulation Results
    simulated_properties: Optional[Dict[str, float]] = Field(None, description="ML-simulated properties")
    confidence_scores: Optional[Dict[str, float]] = Field(None, description="Prediction confidence")
    
    # Metadata
    data_source: Optional[str] = Field(None, description="Source of material data")
    last_updated: Optional[datetime] = Field(None, description="Last update timestamp")
    
    class Config:
        use_enum_values = True

class Requirements(BaseModel):
    # Mechanical Requirements
    min_tensile_strength: Optional[float] = None
    max_tensile_strength: Optional[float] = None
    min_yield_strength: Optional[float] = None
    max_yield_strength: Optional[float] = None
    min_elastic_modulus: Optional[float] = None
    max_elastic_modulus: Optional[float] = None
    min_hardness: Optional[float] = None
    max_hardness: Optional[float] = None
    min_density: Optional[float] = None
    max_density: Optional[float] = None
    
    # Thermal Requirements
    min_operating_temp: Optional[float] = Field(None, description="Minimum operating temperature (°C)")
    max_operating_temp: Optional[float] = Field(None, description="Maximum operating temperature (°C)")
    min_thermal_conductivity: Optional[float] = None
    max_thermal_conductivity: Optional[float] = None
    
    # Electrical Requirements
    min_electrical_conductivity: Optional[float] = None
    max_electrical_conductivity: Optional[float] = None
    min_dielectric_constant: Optional[float] = None
    max_dielectric_constant: Optional[float] = None
    
    # Environmental Requirements
    min_corrosion_resistance: Optional[float] = None
    temperature_range: Optional[tuple[float, float]] = None
    humidity_exposure: Optional[bool] = None
    uv_exposure: Optional[bool] = None
    
    # Economic Constraints
    max_cost_per_kg: Optional[float] = None
    budget_total: Optional[float] = None
    quantity_needed: Optional[float] = None
    
    # Sustainability Requirements
    min_sustainability_score: Optional[float] = None
    min_recyclability: Optional[float] = None
    max_carbon_footprint: Optional[float] = None
    
    # Availability Requirements
    max_lead_time_days: Optional[int] = None
    min_availability_score: Optional[float] = None
    preferred_suppliers: Optional[List[str]] = None
    geographic_region: Optional[str] = None

class MaterialQuery(BaseModel):
    requirements: Requirements = Field(default_factory=Requirements)
    application_domain: Optional[ApplicationDomain] = None
    preferred_categories: Optional[List[MaterialCategory]] = None
    exclude_categories: Optional[List[MaterialCategory]] = None
    
    # Natural Language Processing
    natural_language_query: Optional[str] = Field(None, description="Natural language description of needs")
    
    # Search Parameters
    max_results: int = Field(20, description="Maximum number of results to return")
    sort_by: Optional[str] = Field("performance_score", description="Sort criteria")
    include_alternatives: bool = Field(True, description="Include alternative materials")
    
    # Advanced Options
    enable_ml_prediction: bool = Field(True, description="Enable ML property prediction")
    enable_simulation: bool = Field(True, description="Enable property simulation")
    confidence_threshold: float = Field(0.7, description="Minimum confidence for ML predictions")

class MaterialScore(BaseModel):
    performance_score: float = Field(..., description="Overall performance score (0-1)")
    cost_score: float = Field(..., description="Cost effectiveness score (0-1)")
    sustainability_score: float = Field(..., description="Environmental impact score (0-1)")
    availability_score: float = Field(..., description="Market availability score (0-1)")
    overall_score: float = Field(..., description="Weighted overall score (0-1)")
    
    # Score Components
    mechanical_match: float = Field(0.0, description="Mechanical properties match")
    thermal_match: float = Field(0.0, description="Thermal properties match")
    electrical_match: float = Field(0.0, description="Electrical properties match")
    environmental_match: float = Field(0.0, description="Environmental suitability")

class RecommendationResult(BaseModel):
    materials: List[Material] = Field(..., description="Recommended materials")
    scores: List[MaterialScore] = Field(..., description="Scoring for each material")
    query_summary: Dict[str, Any] = Field(..., description="Summary of the query processed")
    total_results: int = Field(..., description="Total number of materials found")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")
    
    # Analysis Summary
    best_performance: Optional[str] = Field(None, description="ID of best performing material")
    most_cost_effective: Optional[str] = Field(None, description="ID of most cost-effective material")
    most_sustainable: Optional[str] = Field(None, description="ID of most sustainable material")
    
    # Recommendations Metadata
    confidence_level: float = Field(..., description="Overall confidence in recommendations")
    data_completeness: float = Field(..., description="Completeness of available data")
    simulation_used: bool = Field(False, description="Whether ML simulation was used")

class Supplier(BaseModel):
    id: str
    name: str
    location: str
    contact_info: Dict[str, str]
    materials: List[str]
    price_range: Dict[str, float]
    minimum_order: float
    lead_time_days: int
    quality_rating: float
    certifications: List[str]

class ManufacturingProcess(BaseModel):
    process_name: str
    description: str
    suitable_materials: List[str]
    equipment_required: List[str]
    typical_tolerances: Dict[str, float]
    cost_factors: Dict[str, float]
    environmental_impact: Dict[str, float]
