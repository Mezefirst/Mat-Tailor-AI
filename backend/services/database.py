"""
Database service for material data management
Simulated database with sample materials for demonstration
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional
import json
import numpy as np
from models.material import Material, MaterialCategory, Supplier

logger = logging.getLogger(__name__)

class MaterialDatabase:
    def __init__(self):
        self.materials = {}
        self.suppliers = {}
        self._initialize_sample_data()
    
    def _initialize_sample_data(self):
        """Initialize with sample material data for demonstration"""
        
        # Sample materials covering different categories
        sample_materials = [
            # Metals
            {
                'id': 'steel_316l',
                'name': 'Stainless Steel 316L',
                'category': MaterialCategory.METAL,
                'composition': {'Fe': 68.0, 'Cr': 17.0, 'Ni': 10.0, 'Mo': 2.0, 'C': 0.03},
                'tensile_strength': 580.0,
                'yield_strength': 290.0,
                'elastic_modulus': 200.0,
                'density': 7.98,
                'melting_point': 1400.0,
                'thermal_conductivity': 16.2,
                'electrical_conductivity': 1.45e6,
                'corrosion_resistance': 9.0,
                'cost_per_kg': 8.50,
                'sustainability_score': 6.5,
                'recyclability': 9.0,
                'carbon_footprint': 3.2,
                'availability_score': 9.0,
                'manufacturing_complexity': 4.0,
                'lead_time_days': 14
            },
            {
                'id': 'aluminum_6061',
                'name': 'Aluminum 6061-T6',
                'category': MaterialCategory.METAL,
                'composition': {'Al': 97.9, 'Mg': 1.0, 'Si': 0.6, 'Cu': 0.3, 'Cr': 0.2},
                'tensile_strength': 310.0,
                'yield_strength': 276.0,
                'elastic_modulus': 69.0,
                'density': 2.70,
                'melting_point': 652.0,
                'thermal_conductivity': 167.0,
                'electrical_conductivity': 2.46e7,
                'corrosion_resistance': 7.0,
                'cost_per_kg': 4.20,
                'sustainability_score': 8.0,
                'recyclability': 9.5,
                'carbon_footprint': 1.8,
                'availability_score': 9.5,
                'manufacturing_complexity': 3.0,
                'lead_time_days': 7
            },
            {
                'id': 'titanium_grade2',
                'name': 'Titanium Grade 2',
                'category': MaterialCategory.METAL,
                'composition': {'Ti': 99.2, 'Fe': 0.3, 'O': 0.25, 'N': 0.03},
                'tensile_strength': 345.0,
                'yield_strength': 275.0,
                'elastic_modulus': 103.4,
                'density': 4.51,
                'melting_point': 1668.0,
                'thermal_conductivity': 17.0,
                'electrical_conductivity': 2.38e6,
                'corrosion_resistance': 9.5,
                'cost_per_kg': 35.00,
                'sustainability_score': 5.5,
                'recyclability': 8.0,
                'carbon_footprint': 12.5,
                'availability_score': 7.0,
                'manufacturing_complexity': 7.0,
                'lead_time_days': 21
            },
            
            # Polymers
            {
                'id': 'peek',
                'name': 'PEEK (Polyetheretherketone)',
                'category': MaterialCategory.POLYMER,
                'composition': {'C': 76.0, 'H': 5.0, 'O': 19.0},
                'tensile_strength': 100.0,
                'yield_strength': 90.0,
                'elastic_modulus': 3.6,
                'density': 1.32,
                'melting_point': 343.0,
                'thermal_conductivity': 0.25,
                'electrical_conductivity': 1e-15,
                'chemical_stability': 9.0,
                'cost_per_kg': 85.00,
                'sustainability_score': 4.0,
                'recyclability': 6.0,
                'carbon_footprint': 8.2,
                'availability_score': 8.0,
                'manufacturing_complexity': 6.0,
                'lead_time_days': 28
            },
            {
                'id': 'nylon_66',
                'name': 'Nylon 66',
                'category': MaterialCategory.POLYMER,
                'composition': {'C': 63.7, 'H': 9.8, 'N': 12.4, 'O': 14.1},
                'tensile_strength': 83.0,
                'yield_strength': 79.0,
                'elastic_modulus': 2.8,
                'density': 1.14,
                'melting_point': 264.0,
                'thermal_conductivity': 0.23,
                'electrical_conductivity': 1e-14,
                'chemical_stability': 7.0,
                'cost_per_kg': 3.50,
                'sustainability_score': 5.5,
                'recyclability': 7.0,
                'carbon_footprint': 5.8,
                'availability_score': 9.0,
                'manufacturing_complexity': 3.0,
                'lead_time_days': 10
            },
            
            # Ceramics
            {
                'id': 'alumina_99',
                'name': 'Alumina 99%',
                'category': MaterialCategory.CERAMIC,
                'composition': {'Al2O3': 99.0, 'SiO2': 0.5, 'Other': 0.5},
                'tensile_strength': 300.0,
                'elastic_modulus': 380.0,
                'hardness': 1800.0,
                'density': 3.95,
                'melting_point': 2054.0,
                'thermal_conductivity': 25.0,
                'electrical_conductivity': 1e-12,
                'dielectric_constant': 9.8,
                'chemical_stability': 9.5,
                'cost_per_kg': 12.00,
                'sustainability_score': 7.0,
                'recyclability': 3.0,
                'carbon_footprint': 4.5,
                'availability_score': 8.5,
                'manufacturing_complexity': 8.0,
                'lead_time_days': 35
            },
            
            # Composites
            {
                'id': 'carbon_fiber_epoxy',
                'name': 'Carbon Fiber/Epoxy Composite',
                'category': MaterialCategory.COMPOSITE,
                'composition': {'Carbon_Fiber': 60.0, 'Epoxy_Resin': 40.0},
                'tensile_strength': 1500.0,
                'elastic_modulus': 150.0,
                'density': 1.55,
                'thermal_conductivity': 1.0,
                'cost_per_kg': 75.00,
                'sustainability_score': 3.5,
                'recyclability': 2.0,
                'carbon_footprint': 18.5,
                'availability_score': 7.5,
                'manufacturing_complexity': 9.0,
                'lead_time_days': 42
            },
            {
                'id': 'fiberglass_composite',
                'name': 'Fiberglass/Polyester Composite',
                'category': MaterialCategory.COMPOSITE,
                'composition': {'Glass_Fiber': 65.0, 'Polyester_Resin': 35.0},
                'tensile_strength': 240.0,
                'elastic_modulus': 23.0,
                'density': 1.80,
                'thermal_conductivity': 0.4,
                'cost_per_kg': 8.50,
                'sustainability_score': 4.5,
                'recyclability': 3.0,
                'carbon_footprint': 7.2,
                'availability_score': 9.0,
                'manufacturing_complexity': 5.0,
                'lead_time_days': 21
            }
        ]
        
        # Convert to Material objects and store
        for material_data in sample_materials:
            material = Material(**material_data)
            self.materials[material.id] = material
        
        # Sample suppliers
        sample_suppliers = [
            {
                'id': 'supplier_1',
                'name': 'Advanced Materials Inc.',
                'location': 'Detroit, MI, USA',
                'contact_info': {'email': 'sales@advmat.com', 'phone': '+1-555-0101'},
                'materials': ['steel_316l', 'aluminum_6061', 'titanium_grade2'],
                'price_range': {'min': 5.0, 'max': 40.0},
                'minimum_order': 100.0,
                'lead_time_days': 14,
                'quality_rating': 9.2,
                'certifications': ['ISO 9001', 'AS9100', 'NADCAP']
            },
            {
                'id': 'supplier_2',
                'name': 'Polymer Solutions Ltd.',
                'location': 'Shanghai, China',
                'contact_info': {'email': 'info@polysol.com', 'phone': '+86-21-555-0202'},
                'materials': ['peek', 'nylon_66'],
                'price_range': {'min': 3.0, 'max': 90.0},
                'minimum_order': 25.0,
                'lead_time_days': 28,
                'quality_rating': 8.7,
                'certifications': ['ISO 9001', 'FDA Approved']
            },
            {
                'id': 'supplier_3',
                'name': 'Ceramic Technologies GmbH',
                'location': 'Munich, Germany',
                'contact_info': {'email': 'sales@ceramtech.de', 'phone': '+49-89-555-0303'},
                'materials': ['alumina_99'],
                'price_range': {'min': 10.0, 'max': 25.0},
                'minimum_order': 10.0,
                'lead_time_days': 35,
                'quality_rating': 9.5,
                'certifications': ['ISO 9001', 'CE Mark']
            }
        ]
        
        for supplier_data in sample_suppliers:
            supplier = Supplier(**supplier_data)
            self.suppliers[supplier.id] = supplier
        
        logger.info(f"Initialized database with {len(self.materials)} materials and {len(self.suppliers)} suppliers")
    
    async def query_materials(self, filters: Dict[str, Any]) -> List[Material]:
        """Query materials based on filters"""
        
        filtered_materials = []
        
        for material in self.materials.values():
            if self._material_matches_filters(material, filters):
                filtered_materials.append(material)
        
        return filtered_materials
    
    async def get_material_by_id(self, material_id: str) -> Optional[Material]:
        """Get material by ID"""
        return self.materials.get(material_id)
    
    async def search_materials_by_text(self, query: str, filters: Dict[str, Any] = None, limit: int = 20) -> List[Material]:
        """Search materials by text query"""
        
        query_lower = query.lower()
        matching_materials = []
        
        for material in self.materials.values():
            # Search in name and composition
            if (query_lower in material.name.lower() or 
                any(query_lower in element.lower() for element in material.composition.keys())):
                
                if filters is None or self._material_matches_filters(material, filters):
                    matching_materials.append(material)
                    
                if len(matching_materials) >= limit:
                    break
        
        return matching_materials
    
    async def find_similar_materials(self, reference_material: Material, similarity_threshold: float = 0.7, max_results: int = 10) -> List[Material]:
        """Find materials similar to the reference material"""
        
        similar_materials = []
        
        for material in self.materials.values():
            if material.id == reference_material.id:
                continue
            
            similarity = self._calculate_similarity(reference_material, material)
            
            if similarity >= similarity_threshold:
                similar_materials.append((material, similarity))
        
        # Sort by similarity
        similar_materials.sort(key=lambda x: x[1], reverse=True)
        
        return [material for material, _ in similar_materials[:max_results]]
    
    async def query_suppliers(self, filters: Dict[str, Any]) -> List[Supplier]:
        """Query suppliers based on filters"""
        
        filtered_suppliers = []
        
        for supplier in self.suppliers.values():
            if self._supplier_matches_filters(supplier, filters):
                filtered_suppliers.append(supplier)
        
        return filtered_suppliers
    
    def _material_matches_filters(self, material: Material, filters: Dict[str, Any]) -> bool:
        """Check if material matches the given filters"""
        
        for filter_key, filter_value in filters.items():
            if '__' in filter_key:
                field, operator = filter_key.split('__', 1)
            else:
                field, operator = filter_key, 'eq'
            
            material_value = getattr(material, field, None)
            
            if material_value is None:
                continue
            
            # Apply operator
            if operator == 'eq':
                if material_value != filter_value:
                    return False
            elif operator == 'gte':
                if material_value < filter_value:
                    return False
            elif operator == 'lte':
                if material_value > filter_value:
                    return False
            elif operator == 'gt':
                if material_value <= filter_value:
                    return False
            elif operator == 'lt':
                if material_value >= filter_value:
                    return False
            elif operator == 'in':
                if material_value not in filter_value:
                    return False
            elif operator == 'not_in':
                if material_value in filter_value:
                    return False
            elif operator == 'icontains':
                if filter_value.lower() not in str(material_value).lower():
                    return False
            elif operator == 'contains':
                if filter_value not in material_value:
                    return False
        
        return True
    
    def _supplier_matches_filters(self, supplier: Supplier, filters: Dict[str, Any]) -> bool:
        """Check if supplier matches the given filters"""
        
        for filter_key, filter_value in filters.items():
            if '__' in filter_key:
                field, operator = filter_key.split('__', 1)
            else:
                field, operator = filter_key, 'eq'
            
            supplier_value = getattr(supplier, field, None)
            
            if supplier_value is None:
                continue
            
            # Apply operator
            if operator == 'eq':
                if supplier_value != filter_value:
                    return False
            elif operator == 'gte':
                if supplier_value < filter_value:
                    return False
            elif operator == 'lte':
                if supplier_value > filter_value:
                    return False
            elif operator == 'icontains':
                if filter_value.lower() not in str(supplier_value).lower():
                    return False
            elif operator == 'contains':
                if filter_value not in supplier_value:
                    return False
        
        return True
    
    def _calculate_similarity(self, material1: Material, material2: Material) -> float:
        """Calculate similarity between two materials"""
        
        # Compare key properties
        properties_to_compare = [
            'tensile_strength', 'yield_strength', 'elastic_modulus', 'density',
            'thermal_conductivity', 'electrical_conductivity', 'cost_per_kg'
        ]
        
        similarities = []
        
        for prop in properties_to_compare:
            value1 = getattr(material1, prop, None)
            value2 = getattr(material2, prop, None)
            
            if value1 is not None and value2 is not None:
                # Calculate normalized similarity (0-1)
                max_val = max(value1, value2)
                min_val = min(value1, value2)
                
                if max_val > 0:
                    similarity = min_val / max_val
                    similarities.append(similarity)
        
        # Category similarity
        if material1.category == material2.category:
            similarities.append(1.0)
        else:
            similarities.append(0.3)  # Some similarity for different categories
        
        return np.mean(similarities) if similarities else 0.0
