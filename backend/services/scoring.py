"""
Material scoring service for evaluating and ranking materials
"""

import logging
import numpy as np
from typing import Dict, Any, Optional
from models.material import Material, Requirements, MaterialScore

logger = logging.getLogger(__name__)

class MaterialScorer:
    def __init__(self):
        self.weights = {
            'performance': 0.4,
            'cost': 0.25,
            'sustainability': 0.2,
            'availability': 0.15
        }
    
    async def score_material(self, material: Material, requirements: Requirements) -> MaterialScore:
        """
        Score a material against requirements across multiple dimensions
        """
        try:
            # Calculate individual scores
            performance_score = self._calculate_performance_score(material, requirements)
            cost_score = self._calculate_cost_score(material, requirements)
            sustainability_score = self._calculate_sustainability_score(material, requirements)
            availability_score = self._calculate_availability_score(material, requirements)
            
            # Calculate component match scores
            mechanical_match = self._score_mechanical_properties(material, requirements)
            thermal_match = self._score_thermal_properties(material, requirements)
            electrical_match = self._score_electrical_properties(material, requirements)
            environmental_match = self._score_environmental_properties(material, requirements)
            
            # Calculate overall weighted score
            overall_score = (
                performance_score * self.weights['performance'] +
                cost_score * self.weights['cost'] +
                sustainability_score * self.weights['sustainability'] +
                availability_score * self.weights['availability']
            )
            
            return MaterialScore(
                performance_score=performance_score,
                cost_score=cost_score,
                sustainability_score=sustainability_score,
                availability_score=availability_score,
                overall_score=overall_score,
                mechanical_match=mechanical_match,
                thermal_match=thermal_match,
                electrical_match=electrical_match,
                environmental_match=environmental_match
            )
            
        except Exception as e:
            logger.error(f"Scoring failed for material {material.id}: {e}")
            # Return default low scores
            return MaterialScore(
                performance_score=0.1,
                cost_score=0.1,
                sustainability_score=0.1,
                availability_score=0.1,
                overall_score=0.1,
                mechanical_match=0.0,
                thermal_match=0.0,
                electrical_match=0.0,
                environmental_match=0.0
            )
    
    def _calculate_performance_score(self, material: Material, requirements: Requirements) -> float:
        """Calculate performance score based on mechanical, thermal, and electrical properties"""
        scores = []
        
        # Mechanical performance
        mech_score = self._score_mechanical_properties(material, requirements)
        scores.append(mech_score)
        
        # Thermal performance
        thermal_score = self._score_thermal_properties(material, requirements)
        scores.append(thermal_score)
        
        # Electrical performance
        electrical_score = self._score_electrical_properties(material, requirements)
        scores.append(electrical_score)
        
        # Average of available scores
        valid_scores = [s for s in scores if s > 0]
        return np.mean(valid_scores) if valid_scores else 0.5
    
    def _calculate_cost_score(self, material: Material, requirements: Requirements) -> float:
        """Calculate cost effectiveness score"""
        if not material.cost_per_kg:
            return 0.5  # Default if no cost data
        
        cost = material.cost_per_kg
        
        # Score based on budget constraints
        if requirements.max_cost_per_kg:
            if cost <= requirements.max_cost_per_kg:
                # Linear scoring: lower cost = higher score
                score = 1.0 - (cost / requirements.max_cost_per_kg) * 0.8
                return max(0.2, score)  # Minimum score of 0.2
            else:
                # Penalty for exceeding budget
                excess_ratio = cost / requirements.max_cost_per_kg
                return max(0.1, 1.0 / excess_ratio)
        else:
            # No budget constraint: score based on relative cost
            # Assume $100/kg as reference point
            reference_cost = 100.0
            score = 1.0 - min(1.0, cost / reference_cost) * 0.7
            return max(0.3, score)
    
    def _calculate_sustainability_score(self, material: Material, requirements: Requirements) -> float:
        """Calculate sustainability score"""
        scores = []
        
        # Sustainability rating
        if material.sustainability_score:
            score = material.sustainability_score / 10.0  # Normalize to 0-1
            scores.append(score)
        
        # Recyclability
        if material.recyclability:
            score = material.recyclability / 10.0
            scores.append(score)
        
        # Carbon footprint (lower is better)
        if material.carbon_footprint:
            # Assume 10 kg CO2/kg as poor, 1 kg CO2/kg as good
            footprint_score = max(0.1, 1.0 - (material.carbon_footprint - 1.0) / 9.0)
            scores.append(footprint_score)
        
        # Check against requirements
        if requirements.min_sustainability_score and material.sustainability_score:
            if material.sustainability_score >= requirements.min_sustainability_score:
                scores.append(1.0)
            else:
                scores.append(0.3)
        
        return np.mean(scores) if scores else 0.5
    
    def _calculate_availability_score(self, material: Material, requirements: Requirements) -> float:
        """Calculate availability and supply chain score"""
        scores = []
        
        # Market availability
        if material.availability_score:
            scores.append(material.availability_score / 10.0)
        
        # Lead time
        if material.lead_time_days:
            lead_time = material.lead_time_days
            if requirements.max_lead_time_days:
                if lead_time <= requirements.max_lead_time_days:
                    # Better score for shorter lead times
                    score = 1.0 - (lead_time / requirements.max_lead_time_days) * 0.5
                    scores.append(score)
                else:
                    # Penalty for exceeding required lead time
                    scores.append(0.2)
            else:
                # No specific requirement: score based on typical lead times
                # Assume 60 days as reference
                score = max(0.3, 1.0 - (lead_time / 60.0) * 0.6)
                scores.append(score)
        
        # Manufacturing complexity (lower is better for availability)
        if material.manufacturing_complexity:
            complexity_score = 1.0 - (material.manufacturing_complexity / 10.0) * 0.4
            scores.append(complexity_score)
        
        return np.mean(scores) if scores else 0.5
    
    def _score_mechanical_properties(self, material: Material, requirements: Requirements) -> float:
        """Score mechanical property match"""
        scores = []
        
        # Tensile strength
        if material.tensile_strength and (requirements.min_tensile_strength or requirements.max_tensile_strength):
            score = self._score_property_range(
                material.tensile_strength,
                requirements.min_tensile_strength,
                requirements.max_tensile_strength
            )
            scores.append(score)
        
        # Yield strength
        if material.yield_strength and (requirements.min_yield_strength or requirements.max_yield_strength):
            score = self._score_property_range(
                material.yield_strength,
                requirements.min_yield_strength,
                requirements.max_yield_strength
            )
            scores.append(score)
        
        # Density
        if material.density and (requirements.min_density or requirements.max_density):
            score = self._score_property_range(
                material.density,
                requirements.min_density,
                requirements.max_density
            )
            scores.append(score)
        
        # Elastic modulus
        if material.elastic_modulus and (requirements.min_elastic_modulus or requirements.max_elastic_modulus):
            score = self._score_property_range(
                material.elastic_modulus,
                requirements.min_elastic_modulus,
                requirements.max_elastic_modulus
            )
            scores.append(score)
        
        return np.mean(scores) if scores else 0.0
    
    def _score_thermal_properties(self, material: Material, requirements: Requirements) -> float:
        """Score thermal property match"""
        scores = []
        
        # Operating temperature range
        if material.melting_point and (requirements.min_operating_temp or requirements.max_operating_temp):
            melting_point = material.melting_point
            
            if requirements.max_operating_temp:
                # Material should have melting point well above operating temp
                safety_margin = 100  # °C
                if melting_point >= requirements.max_operating_temp + safety_margin:
                    scores.append(1.0)
                elif melting_point >= requirements.max_operating_temp:
                    scores.append(0.7)  # Marginal safety
                else:
                    scores.append(0.1)  # Insufficient
            
            if requirements.min_operating_temp:
                # For now, assume most materials work at low temps if they work at room temp
                scores.append(0.8)
        
        # Thermal conductivity
        if material.thermal_conductivity and (requirements.min_thermal_conductivity or requirements.max_thermal_conductivity):
            score = self._score_property_range(
                material.thermal_conductivity,
                requirements.min_thermal_conductivity,
                requirements.max_thermal_conductivity
            )
            scores.append(score)
        
        return np.mean(scores) if scores else 0.0
    
    def _score_electrical_properties(self, material: Material, requirements: Requirements) -> float:
        """Score electrical property match"""
        scores = []
        
        # Electrical conductivity
        if material.electrical_conductivity and (requirements.min_electrical_conductivity or requirements.max_electrical_conductivity):
            score = self._score_property_range(
                material.electrical_conductivity,
                requirements.min_electrical_conductivity,
                requirements.max_electrical_conductivity
            )
            scores.append(score)
        
        # Dielectric constant
        if material.dielectric_constant and (requirements.min_dielectric_constant or requirements.max_dielectric_constant):
            score = self._score_property_range(
                material.dielectric_constant,
                requirements.min_dielectric_constant,
                requirements.max_dielectric_constant
            )
            scores.append(score)
        
        return np.mean(scores) if scores else 0.0
    
    def _score_environmental_properties(self, material: Material, requirements: Requirements) -> float:
        """Score environmental resistance and suitability"""
        scores = []
        
        # Corrosion resistance
        if material.corrosion_resistance and requirements.min_corrosion_resistance:
            if material.corrosion_resistance >= requirements.min_corrosion_resistance:
                scores.append(1.0)
            else:
                # Linear scoring
                score = material.corrosion_resistance / requirements.min_corrosion_resistance
                scores.append(max(0.1, score))
        
        # Chemical stability
        if material.chemical_stability:
            # Higher chemical stability is generally better
            scores.append(material.chemical_stability / 10.0)
        
        return np.mean(scores) if scores else 0.0
    
    def _score_property_range(self, value: float, min_val: Optional[float], max_val: Optional[float]) -> float:
        """Score a property value against min/max requirements"""
        if min_val is not None and max_val is not None:
            # Both bounds specified
            if min_val <= value <= max_val:
                return 1.0
            elif value < min_val:
                # Below minimum
                return max(0.1, value / min_val)
            else:
                # Above maximum
                return max(0.1, max_val / value)
        
        elif min_val is not None:
            # Only minimum specified
            if value >= min_val:
                return 1.0
            else:
                return max(0.1, value / min_val)
        
        elif max_val is not None:
            # Only maximum specified
            if value <= max_val:
                return 1.0
            else:
                return max(0.1, max_val / value)
        
        return 0.5  # No constraints
