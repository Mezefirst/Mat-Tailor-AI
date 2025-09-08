"""
Material Recommendation Service
Handles material matching, scoring, and recommendation logic
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

from models.material import Material, MaterialQuery, Requirements, RecommendationResult, MaterialScore, Supplier
from services.database import MaterialDatabase
from services.scoring import MaterialScorer

logger = logging.getLogger(__name__)

class MaterialRecommender:
    def __init__(self):
        self.database = MaterialDatabase()
        self.scorer = MaterialScorer()
        self.cache = {}
        self.cache_ttl = timedelta(hours=1)
    
    async def recommend(self, query: MaterialQuery) -> RecommendationResult:
        """
        Main recommendation engine that processes queries and returns scored materials
        """
        start_time = datetime.utcnow()
        
        # Check cache
        cache_key = self._generate_cache_key(query)
        if cache_key in self.cache:
            cached_result, timestamp = self.cache[cache_key]
            if datetime.utcnow() - timestamp < self.cache_ttl:
                logger.info("Returning cached recommendation")
                return cached_result
        
        # Get candidate materials
        candidates = await self._find_candidate_materials(query)
        
        # Score materials
        scored_materials = []
        scores = []
        
        for material in candidates:
            score = await self.scorer.score_material(material, query.requirements)
            if score.overall_score >= 0.1:  # Minimum threshold
                scored_materials.append(material)
                scores.append(score)
        
        # Sort by overall score
        sorted_pairs = sorted(
            zip(scored_materials, scores),
            key=lambda x: x[1].overall_score,
            reverse=True
        )
        
        final_materials = [pair[0] for pair in sorted_pairs[:query.max_results]]
        final_scores = [pair[1] for pair in sorted_pairs[:query.max_results]]
        
        # Generate result
        result = RecommendationResult(
            materials=final_materials,
            scores=final_scores,
            query_summary=self._summarize_query(query),
            total_results=len(scored_materials),
            processing_time_ms=(datetime.utcnow() - start_time).total_seconds() * 1000,
            best_performance=final_materials[0].id if final_materials else None,
            most_cost_effective=self._find_most_cost_effective(final_materials, final_scores),
            most_sustainable=self._find_most_sustainable(final_materials, final_scores),
            confidence_level=self._calculate_confidence(final_scores),
            data_completeness=self._calculate_completeness(final_materials),
            simulation_used=query.enable_simulation
        )
        
        # Cache result
        self.cache[cache_key] = (result, datetime.utcnow())
        
        return result
    
    async def _find_candidate_materials(self, query: MaterialQuery) -> List[Material]:
        """Find materials that meet basic filtering criteria"""
        
        # Build database query filters
        filters = {}
        req = query.requirements
        
        # Category filters
        if query.preferred_categories:
            filters['category__in'] = query.preferred_categories
        if query.exclude_categories:
            filters['category__not_in'] = query.exclude_categories
        
        # Mechanical property filters
        if req.min_tensile_strength:
            filters['tensile_strength__gte'] = req.min_tensile_strength
        if req.max_tensile_strength:
            filters['tensile_strength__lte'] = req.max_tensile_strength
        if req.min_density:
            filters['density__gte'] = req.min_density
        if req.max_density:
            filters['density__lte'] = req.max_density
            
        # Thermal property filters
        if req.min_operating_temp:
            filters['melting_point__gte'] = req.min_operating_temp + 50  # Safety margin
        if req.max_operating_temp:
            filters['melting_point__gte'] = req.max_operating_temp + 100
            
        # Economic filters
        if req.max_cost_per_kg:
            filters['cost_per_kg__lte'] = req.max_cost_per_kg
            
        # Sustainability filters
        if req.min_sustainability_score:
            filters['sustainability_score__gte'] = req.min_sustainability_score
            
        # Availability filters
        if req.max_lead_time_days:
            filters['lead_time_days__lte'] = req.max_lead_time_days
        if req.geographic_region:
            filters['geographic_region'] = req.geographic_region
        
        # Query database
        materials = await self.database.query_materials(filters)
        
        logger.info(f"Found {len(materials)} candidate materials")
        return materials
    
    async def find_alternatives(self, material_id: str, requirements: Dict[str, Any]) -> List[Material]:
        """Find alternative materials similar to the given material"""
        
        # Get the reference material
        reference_material = await self.database.get_material_by_id(material_id)
        if not reference_material:
            return []
        
        # Find materials with similar properties
        alternatives = await self.database.find_similar_materials(
            reference_material,
            similarity_threshold=0.7,
            max_results=10
        )
        
        return alternatives
    
    async def search_materials(self, query: str, category: Optional[str], limit: int) -> List[Material]:
        """Search materials by text query"""
        
        filters = {}
        if category:
            filters['category'] = category
            
        materials = await self.database.search_materials_by_text(
            query, 
            filters=filters,
            limit=limit
        )
        
        return materials
    
    async def get_material_by_id(self, material_id: str) -> Optional[Material]:
        """Get material details by ID"""
        return await self.database.get_material_by_id(material_id)
    
    async def get_suppliers(self, material_id: str, region: Optional[str], min_quantity: Optional[int]) -> List[Supplier]:
        """Get suppliers for a specific material"""
        
        filters = {'materials__contains': material_id}
        if region:
            filters['location__icontains'] = region
        if min_quantity:
            filters['minimum_order__lte'] = min_quantity
            
        suppliers = await self.database.query_suppliers(filters)
        return suppliers
    
    def _generate_cache_key(self, query: MaterialQuery) -> str:
        """Generate cache key for query"""
        # Create a deterministic hash of the query
        import hashlib
        query_str = str(query.dict())
        return hashlib.md5(query_str.encode()).hexdigest()
    
    def _summarize_query(self, query: MaterialQuery) -> Dict[str, Any]:
        """Create human-readable query summary"""
        summary = {
            "application_domain": query.application_domain,
            "key_requirements": [],
            "constraints": [],
            "preferences": []
        }
        
        req = query.requirements
        
        # Extract key requirements
        if req.min_tensile_strength:
            summary["key_requirements"].append(f"Tensile strength ≥ {req.min_tensile_strength} MPa")
        if req.max_cost_per_kg:
            summary["constraints"].append(f"Cost ≤ ${req.max_cost_per_kg}/kg")
        if req.min_sustainability_score:
            summary["preferences"].append(f"Sustainability score ≥ {req.min_sustainability_score}")
        
        return summary
    
    def _find_most_cost_effective(self, materials: List[Material], scores: List[MaterialScore]) -> Optional[str]:
        """Find the most cost-effective material"""
        if not materials:
            return None
        
        best_cost_score = max(scores, key=lambda s: s.cost_score)
        best_index = scores.index(best_cost_score)
        return materials[best_index].id
    
    def _find_most_sustainable(self, materials: List[Material], scores: List[MaterialScore]) -> Optional[str]:
        """Find the most sustainable material"""
        if not materials:
            return None
        
        best_sustainability_score = max(scores, key=lambda s: s.sustainability_score)
        best_index = scores.index(best_sustainability_score)
        return materials[best_index].id
    
    def _calculate_confidence(self, scores: List[MaterialScore]) -> float:
        """Calculate overall confidence in recommendations"""
        if not scores:
            return 0.0
        
        # Base confidence on score distribution and data completeness
        score_values = [s.overall_score for s in scores]
        score_std = np.std(score_values) if len(score_values) > 1 else 0
        
        # Higher confidence when top scores are clearly differentiated
        confidence = min(1.0, 0.5 + (score_std * 2))
        return confidence
    
    def _calculate_completeness(self, materials: List[Material]) -> float:
        """Calculate data completeness for recommended materials"""
        if not materials:
            return 0.0
        
        total_fields = 0
        filled_fields = 0
        
        for material in materials:
            material_dict = material.dict()
            for key, value in material_dict.items():
                if key not in ['id', 'name', 'category']:  # Exclude always-present fields
                    total_fields += 1
                    if value is not None:
                        filled_fields += 1
        
        return filled_fields / total_fields if total_fields > 0 else 0.0
