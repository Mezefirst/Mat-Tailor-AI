"""
Natural Language Processing Service for parsing material queries
Integrates with OpenAI and Hugging Face for NLP capabilities
"""

import asyncio
import logging
import re
from typing import Dict, Any, Optional, List
import json

from models.material import MaterialQuery, Requirements, MaterialCategory, ApplicationDomain
# If spark is a module or object you need to import
from services import spark



logger = logging.getLogger(__name__)

class NLPProcessor:
    def __init__(self):
        self.property_keywords = {
            'strength': ['strong', 'strength', 'tensile', 'yield', 'durable', 'tough'],
            'weight': ['light', 'lightweight', 'heavy', 'dense', 'density'],
            'temperature': ['hot', 'cold', 'temp', 'temperature', 'thermal', 'heat'],
            'cost': ['cheap', 'expensive', 'cost', 'budget', 'price', 'affordable'],
            'corrosion': ['rust', 'corrosion', 'resistant', 'weatherproof'],
            'electrical': ['conductive', 'insulator', 'electrical', 'conductor'],
            'sustainable': ['green', 'eco', 'sustainable', 'recyclable', 'environment']
        }
        
        self.unit_patterns = {
            'mpa': r'(\d+(?:\.\d+)?)\s*mpa',
            'gpa': r'(\d+(?:\.\d+)?)\s*gpa',
            'celsius': r'(\d+(?:\.\d+)?)\s*[°c]',
            'fahrenheit': r'(\d+(?:\.\d+)?)\s*[°f]',
            'kg': r'(\d+(?:\.\d+)?)\s*kg',
            'g_cm3': r'(\d+(?:\.\d+)?)\s*g/cm³',
            'dollars': r'\$(\d+(?:\.\d+)?)',
            'euros': r'€(\d+(?:\.\d+)?)',
        }
        
        self.application_keywords = {
            ApplicationDomain.AEROSPACE: ['aerospace', 'aircraft', 'aviation', 'space', 'rocket'],
            ApplicationDomain.AUTOMOTIVE: ['automotive', 'car', 'vehicle', 'auto'],
            ApplicationDomain.CONSTRUCTION: ['construction', 'building', 'structural', 'concrete'],
            ApplicationDomain.ELECTRONICS: ['electronics', 'circuit', 'component', 'pcb'],
            ApplicationDomain.MEDICAL: ['medical', 'biomedical', 'implant', 'prosthetic'],
            ApplicationDomain.PACKAGING: ['packaging', 'container', 'food', 'beverage'],
            ApplicationDomain.ENERGY: ['energy', 'battery', 'solar', 'wind'],
            ApplicationDomain.MARINE: ['marine', 'ship', 'boat', 'underwater', 'ocean']
        }
    
    async def process_query(self, natural_query: str, base_query: MaterialQuery) -> MaterialQuery:
        """
        Process natural language query and enhance the base MaterialQuery
        """
        try:
            logger.info(f"Processing NL query: {natural_query}")
            
            # Clean and normalize the query
            cleaned_query = self._clean_query(natural_query)
            
            # Extract key information
            extracted_requirements = await self._extract_requirements(cleaned_query)
            extracted_application = self._extract_application_domain(cleaned_query)
            extracted_categories = self._extract_material_categories(cleaned_query)
            
            # Merge with base query
            enhanced_query = self._merge_requirements(
                base_query, 
                extracted_requirements, 
                extracted_application,
                extracted_categories
            )
            
            # Try advanced NLP if available
            if await self._is_llm_available():
                enhanced_query = await self._enhance_with_llm(natural_query, enhanced_query)
            
            logger.info("Successfully processed NL query")
            return enhanced_query
            
        except Exception as e:
            logger.error(f"NLP processing failed: {e}")
            # Return base query if NLP fails
            return base_query
    
    def _clean_query(self, query: str) -> str:
        """Clean and normalize the natural language query"""
        # Convert to lowercase
        query = query.lower().strip()
        
        # Remove common stop words but keep technical terms
        stop_words = ['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being']
        words = query.split()
        words = [w for w in words if w not in stop_words or len(w) > 3]
        
        return ' '.join(words)
    
    async def _extract_requirements(self, query: str) -> Requirements:
        """Extract technical requirements from query text"""
        requirements = Requirements()
        
        # Extract numerical values with units
        for unit_type, pattern in self.unit_patterns.items():
            matches = re.finditer(pattern, query, re.IGNORECASE)
            for match in matches:
                value = float(match.group(1))
                
                # Map to appropriate requirement field
                if unit_type == 'mpa' and any(kw in query for kw in self.property_keywords['strength']):
                    if 'minimum' in query or 'at least' in query or 'above' in query:
                        requirements.min_tensile_strength = value
                    elif 'maximum' in query or 'below' in query or 'under' in query:
                        requirements.max_tensile_strength = value
                    else:
                        requirements.min_tensile_strength = value * 0.8  # Default to slightly below
                
                elif unit_type == 'celsius':
                    if 'operating' in query or 'working' in query:
                        requirements.max_operating_temp = value
                    elif 'minimum' in query:
                        requirements.min_operating_temp = value
                
                elif unit_type in ['dollars', 'euros']:
                    if 'per kg' in query or '/kg' in query:
                        requirements.max_cost_per_kg = value
                    else:
                        requirements.budget_total = value
                
                elif unit_type == 'g_cm3':
                    if 'maximum' in query or 'under' in query:
                        requirements.max_density = value
                    else:
                        requirements.min_density = value
        
        # Extract qualitative requirements
        if any(kw in query for kw in self.property_keywords['corrosion']):
            requirements.min_corrosion_resistance = 7.0
        
        if any(kw in query for kw in self.property_keywords['sustainable']):
            requirements.min_sustainability_score = 6.0
            requirements.min_recyclability = 7.0
        
        if 'lightweight' in query or 'light weight' in query:
            requirements.max_density = 3.0  # Generally considered lightweight
        
        if 'high strength' in query or 'strong' in query:
            requirements.min_tensile_strength = 500.0  # Reasonable default
        
        return requirements
    
    def _extract_application_domain(self, query: str) -> Optional[ApplicationDomain]:
        """Extract application domain from query"""
        for domain, keywords in self.application_keywords.items():
            if any(keyword in query for keyword in keywords):
                return domain
        return None
    
    def _extract_material_categories(self, query: str) -> Dict[str, List[MaterialCategory]]:
        """Extract preferred and excluded material categories"""
        preferred = []
        excluded = []
        
        category_keywords = {
            MaterialCategory.METAL: ['metal', 'steel', 'aluminum', 'titanium', 'copper'],
            MaterialCategory.POLYMER: ['plastic', 'polymer', 'resin', 'nylon'],
            MaterialCategory.CERAMIC: ['ceramic', 'glass', 'clay'],
            MaterialCategory.COMPOSITE: ['composite', 'carbon fiber', 'fiberglass'],
            MaterialCategory.SEMICONDUCTOR: ['semiconductor', 'silicon'],
            MaterialCategory.BIOMATERIAL: ['bio', 'organic', 'natural']
        }
        
        # Check for explicit exclusions
        if 'no metal' in query or 'not metal' in query:
            excluded.append(MaterialCategory.METAL)
        if 'no plastic' in query or 'not plastic' in query:
            excluded.append(MaterialCategory.POLYMER)
        
        # Check for preferences
        for category, keywords in category_keywords.items():
            if any(keyword in query for keyword in keywords):
                if category not in excluded:
                    preferred.append(category)
        
        return {
            'preferred': preferred,
            'excluded': excluded
        }
    
    def _merge_requirements(
        self, 
        base_query: MaterialQuery, 
        extracted_req: Requirements,
        application: Optional[ApplicationDomain],
        categories: Dict[str, List[MaterialCategory]]
    ) -> MaterialQuery:
        """Merge extracted information with base query"""
        
        # Create new query based on base
        enhanced_query = base_query.copy(deep=True)
        
        # Merge requirements (NLP takes precedence for non-None values)
        for field_name, value in extracted_req.dict().items():
            if value is not None:
                setattr(enhanced_query.requirements, field_name, value)
        
        # Set application domain if extracted
        if application:
            enhanced_query.application_domain = application
        
        # Set material categories
        if categories['preferred']:
            enhanced_query.preferred_categories = categories['preferred']
        if categories['excluded']:
            enhanced_query.exclude_categories = categories['excluded']
        
        return enhanced_query
    
    async def _is_llm_available(self) -> bool:
        """Check if LLM service is available"""
        try:
            # Try to access the global spark LLM
            if hasattr(globals(), 'spark') and hasattr(spark, 'llm'):
                return True
            return False
        except:
            return False
    
    async def _enhance_with_llm(self, query: str, base_query: MaterialQuery) -> MaterialQuery:
        """Use LLM for advanced query understanding"""
        try:
            # Create a structured prompt for the LLM
            prompt = f"""
            Analyze this material requirements query and extract structured information:
            
            Query: "{query}"
            
            Extract the following information in JSON format:
            {{
                "requirements": {{
                    "min_tensile_strength": null,
                    "max_tensile_strength": null,
                    "min_operating_temp": null,
                    "max_operating_temp": null,
                    "max_cost_per_kg": null,
                    "min_sustainability_score": null,
                    "min_corrosion_resistance": null
                }},
                "application_domain": null,
                "preferred_categories": [],
                "key_priorities": []
            }}
            
            Only include non-null values where explicitly mentioned or strongly implied.
            """
            
            # Use the spark LLM if available
            if hasattr(globals(), 'spark'):
                llm_prompt = spark.llmPrompt(f"{prompt}")
                response = await spark.llm(llm_prompt, "gpt-4o-mini", True)
                
                # Parse LLM response
                llm_data = json.loads(response)
                
                # Apply LLM insights to query
                for field, value in llm_data.get('requirements', {}).items():
                    if value is not None:
                        setattr(base_query.requirements, field, value)
                
                if llm_data.get('application_domain'):
                    try:
                        base_query.application_domain = ApplicationDomain(llm_data['application_domain'])
                    except ValueError:
                        pass  # Invalid domain, skip
                
                logger.info("Successfully enhanced query with LLM")
                
        except Exception as e:
            logger.warning(f"LLM enhancement failed: {e}")
        
        return base_query
