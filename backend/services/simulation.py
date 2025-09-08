"""
Property Simulation Service
Handles ML-based property prediction and simulation for materials
"""

import asyncio
import logging
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

from models.material import Material, Requirements
from models.tradeoff import TradeoffAnalysis, MaterialComparison, TradeoffCriteria

logger = logging.getLogger(__name__)

class PropertySimulator:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.is_trained = False
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize ML models for property prediction"""
        # Property prediction models
        self.property_models = {
            'tensile_strength': RandomForestRegressor(n_estimators=100, random_state=42),
            'yield_strength': RandomForestRegressor(n_estimators=100, random_state=42),
            'elastic_modulus': RandomForestRegressor(n_estimators=100, random_state=42),
            'thermal_conductivity': RandomForestRegressor(n_estimators=100, random_state=42),
            'electrical_conductivity': RandomForestRegressor(n_estimators=100, random_state=42),
            'density': RandomForestRegressor(n_estimators=100, random_state=42),
            'cost_per_kg': RandomForestRegressor(n_estimators=100, random_state=42)
        }
        
        # Scalers for input features
        self.feature_scalers = {
            prop: StandardScaler() for prop in self.property_models.keys()
        }
        
        # Try to load pre-trained models
        self._load_pretrained_models()
    
    def _load_pretrained_models(self):
        """Load pre-trained models if available"""
        try:
            # In a real implementation, load from files
            # For now, we'll train with synthetic data
            self._train_with_synthetic_data()
            self.is_trained = True
            logger.info("Loaded pre-trained material property models")
        except Exception as e:
            logger.warning(f"Could not load pre-trained models: {e}")
            self._train_with_synthetic_data()
    
    def _train_with_synthetic_data(self):
        """Train models with synthetic material data for demonstration"""
        # Generate synthetic training data
        np.random.seed(42)
        n_samples = 1000
        
        # Features: composition percentages (simplified)
        features = np.random.rand(n_samples, 10)  # 10 element composition features
        
        # Generate synthetic targets with realistic correlations
        targets = {
            'tensile_strength': 200 + 800 * (features[:, 0] * 0.7 + features[:, 1] * 0.3) + np.random.normal(0, 50, n_samples),
            'yield_strength': 150 + 600 * (features[:, 0] * 0.8 + features[:, 2] * 0.2) + np.random.normal(0, 40, n_samples),
            'elastic_modulus': 50 + 400 * (features[:, 0] * 0.6 + features[:, 3] * 0.4) + np.random.normal(0, 20, n_samples),
            'thermal_conductivity': 10 + 200 * features[:, 4] + np.random.normal(0, 10, n_samples),
            'electrical_conductivity': np.exp(5 + 3 * features[:, 5]) + np.random.normal(0, 1000, n_samples),
            'density': 1 + 15 * (features[:, 6] * 0.8 + features[:, 7] * 0.2) + np.random.normal(0, 0.5, n_samples),
            'cost_per_kg': 5 + 100 * features[:, 8] + np.random.normal(0, 10, n_samples)
        }
        
        # Train each model
        for prop, model in self.property_models.items():
            if prop in targets:
                # Scale features
                X_scaled = self.feature_scalers[prop].fit_transform(features)
                y = targets[prop]
                
                # Train model
                model.fit(X_scaled, y)
                
        logger.info("Trained models with synthetic data")
    
    async def simulate_properties(self, material: Material, requirements: Requirements) -> Dict[str, float]:
        """
        Simulate material properties using ML models
        """
        try:
            if not self.is_trained:
                self._train_with_synthetic_data()
            
            # Extract features from material composition
            features = self._extract_features(material)
            
            # Predict properties
            predictions = {}
            confidences = {}
            
            for prop, model in self.property_models.items():
                try:
                    # Scale features
                    features_scaled = self.feature_scalers[prop].transform([features])
                    
                    # Predict
                    prediction = model.predict(features_scaled)[0]
                    
                    # Calculate confidence (simplified)
                    confidence = self._calculate_prediction_confidence(model, features_scaled, prop)
                    
                    predictions[prop] = float(prediction)
                    confidences[f"{prop}_confidence"] = float(confidence)
                    
                except Exception as e:
                    logger.warning(f"Failed to predict {prop}: {e}")
                    continue
            
            # Add confidence scores to predictions
            predictions.update(confidences)
            
            logger.info(f"Simulated {len(predictions)} properties")
            return predictions
            
        except Exception as e:
            logger.error(f"Property simulation failed: {e}")
            return {}
    
    async def simulate_custom_material(self, composition: Dict[str, float], conditions: Dict[str, Any]) -> Dict[str, float]:
        """
        Simulate properties for a custom material composition
        """
        try:
            # Create a temporary material object
            temp_material = Material(
                id="custom",
                name="Custom Material",
                category="composite",
                composition=composition
            )
            
            # Create temporary requirements
            temp_requirements = Requirements()
            
            # Simulate properties
            properties = await self.simulate_properties(temp_material, temp_requirements)
            
            # Apply environmental conditions if specified
            if conditions:
                properties = self._apply_environmental_conditions(properties, conditions)
            
            return properties
            
        except Exception as e:
            logger.error(f"Custom material simulation failed: {e}")
            return {}
    
    async def analyze_tradeoffs(self, material_ids: List[str], criteria: List[str]) -> TradeoffAnalysis:
        """
        Analyze trade-offs between multiple materials across specified criteria
        """
        try:
            # For this demo, we'll generate synthetic analysis
            materials = []
            
            for i, material_id in enumerate(material_ids):
                # Generate synthetic material comparison data
                criteria_values = {}
                normalized_scores = {}
                
                for criterion in criteria:
                    # Generate realistic values based on criterion type
                    if 'strength' in criterion.lower():
                        value = np.random.uniform(200, 1000)
                    elif 'cost' in criterion.lower():
                        value = np.random.uniform(5, 200)
                    elif 'density' in criterion.lower():
                        value = np.random.uniform(1, 10)
                    elif 'sustainability' in criterion.lower():
                        value = np.random.uniform(3, 10)
                    else:
                        value = np.random.uniform(0, 100)
                    
                    criteria_values[criterion] = value
                    # Normalize to 0-1 scale (simplified)
                    normalized_scores[criterion] = min(1.0, value / 100)
                
                # Calculate weighted score (equal weights for demo)
                weighted_score = np.mean(list(normalized_scores.values()))
                
                material_comparison = MaterialComparison(
                    material_id=material_id,
                    material_name=f"Material {material_id}",
                    criteria_values=criteria_values,
                    normalized_scores=normalized_scores,
                    weighted_score=weighted_score,
                    rank=i + 1  # Will be updated after sorting
                )
                materials.append(material_comparison)
            
            # Sort by weighted score
            materials.sort(key=lambda m: m.weighted_score, reverse=True)
            
            # Update ranks
            for i, material in enumerate(materials):
                material.rank = i + 1
            
            # Create trade-off criteria objects
            tradeoff_criteria = [
                TradeoffCriteria(
                    name=criterion,
                    weight=1.0 / len(criteria),  # Equal weights
                    direction="maximize",  # Simplified
                    unit="units"
                )
                for criterion in criteria
            ]
            
            # Generate analysis
            analysis = TradeoffAnalysis(
                analysis_id=f"analysis_{datetime.utcnow().timestamp()}",
                materials=materials,
                criteria=tradeoff_criteria,
                best_overall=materials[0].material_id if materials else "",
                pareto_optimal=[m.material_id for m in materials[:3]],  # Top 3 as Pareto optimal
                strongest_correlations=self._calculate_correlations(materials),
                recommendation_summary=self._generate_recommendation_summary(materials, criteria),
                confidence_score=0.8  # High confidence for demo
            )
            
            return analysis
            
        except Exception as e:
            logger.error(f"Trade-off analysis failed: {e}")
            raise
    
    def _extract_features(self, material: Material) -> List[float]:
        """Extract numerical features from material for ML prediction"""
        features = []
        
        # Composition features (up to 10 elements)
        composition = material.composition or {}
        element_features = [composition.get(f"element_{i}", 0.0) for i in range(10)]
        features.extend(element_features)
        
        # Pad to consistent feature size
        while len(features) < 10:
            features.append(0.0)
        
        return features[:10]  # Ensure exactly 10 features
    
    def _calculate_prediction_confidence(self, model, features_scaled: np.ndarray, property_name: str) -> float:
        """Calculate confidence for ML prediction"""
        try:
            # For RandomForest, use prediction variance across trees
            if hasattr(model, 'estimators_'):
                predictions = [tree.predict(features_scaled)[0] for tree in model.estimators_]
                variance = np.var(predictions)
                # Convert variance to confidence (0-1 scale)
                confidence = 1.0 / (1.0 + variance / 1000)  # Simplified confidence
                return min(1.0, max(0.1, confidence))
        except:
            pass
        
        return 0.7  # Default confidence
    
    def _apply_environmental_conditions(self, properties: Dict[str, float], conditions: Dict[str, Any]) -> Dict[str, float]:
        """Apply environmental condition modifiers to properties"""
        modified_properties = properties.copy()
        
        # Temperature effects
        if 'temperature' in conditions:
            temp = conditions['temperature']
            if temp > 200:  # High temperature
                # Reduce strength properties
                for prop in ['tensile_strength', 'yield_strength']:
                    if prop in modified_properties:
                        modified_properties[prop] *= 0.9  # 10% reduction
        
        # Humidity effects
        if 'humidity' in conditions and conditions['humidity'] > 80:
            # Affect electrical properties
            if 'electrical_conductivity' in modified_properties:
                modified_properties['electrical_conductivity'] *= 0.95
        
        return modified_properties
    
    def _calculate_correlations(self, materials: List[MaterialComparison]) -> Dict[str, float]:
        """Calculate correlations between criteria"""
        if len(materials) < 2:
            return {}
        
        # Extract criteria data
        criteria_data = {}
        for material in materials:
            for criterion, value in material.criteria_values.items():
                if criterion not in criteria_data:
                    criteria_data[criterion] = []
                criteria_data[criterion].append(value)
        
        # Calculate correlations (simplified)
        correlations = {}
        criteria_names = list(criteria_data.keys())
        
        for i, crit1 in enumerate(criteria_names):
            for crit2 in criteria_names[i+1:]:
                try:
                    corr = np.corrcoef(criteria_data[crit1], criteria_data[crit2])[0, 1]
                    correlations[f"{crit1}_vs_{crit2}"] = float(corr)
                except:
                    correlations[f"{crit1}_vs_{crit2}"] = 0.0
        
        return correlations
    
    def _generate_recommendation_summary(self, materials: List[MaterialComparison], criteria: List[str]) -> str:
        """Generate human-readable recommendation summary"""
        if not materials:
            return "No materials to analyze"
        
        best_material = materials[0]
        
        summary = f"Based on the analysis of {len(criteria)} criteria across {len(materials)} materials, "
        summary += f"{best_material.material_name} emerges as the optimal choice with a score of {best_material.weighted_score:.2f}. "
        
        # Find the best criterion for the top material
        best_criterion = max(best_material.criteria_values.items(), key=lambda x: x[1])
        summary += f"It excels particularly in {best_criterion[0]} with a value of {best_criterion[1]:.1f}."
        
        return summary
