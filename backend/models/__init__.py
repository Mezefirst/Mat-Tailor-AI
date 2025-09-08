"""
Initialize backend models
"""

from .material import (
    Material,
    MaterialCategory, 
    ApplicationDomain,
    Requirements,
    MaterialQuery,
    MaterialScore,
    RecommendationResult,
    Supplier,
    ManufacturingProcess
)
from .tradeoff import (
    TradeoffAnalysis,
    MaterialComparison,
    TradeoffCriteria,
    SensitivityAnalysis
)

__all__ = [
    'Material',
    'MaterialCategory',
    'ApplicationDomain', 
    'Requirements',
    'MaterialQuery',
    'MaterialScore',
    'RecommendationResult',
    'Supplier',
    'ManufacturingProcess',
    'TradeoffAnalysis',
    'MaterialComparison',
    'TradeoffCriteria',
    'SensitivityAnalysis'
]
