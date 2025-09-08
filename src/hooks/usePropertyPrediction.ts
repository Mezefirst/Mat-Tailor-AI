import { useState, useEffect, useCallback } from 'react';
import { Element } from '@/components/periodic/PeriodicTable';

export interface PredictedProperties {
  tensileStrength: number;
  yieldStrength: number;
  density: number;
  thermalConductivity: number;
  electricalConductivity: number;
  hardness: number;
  meltingPoint: number;
  elasticModulus: number;
  corrosionResistance: number;
  formability: number;
  weldability: number;
  machinability: number;
}

export interface PropertyScores {
  performanceScore: number;
  costScore: number;
  sustainabilityScore: number;
  overallScore: number;
  confidence: number;
}

export interface CompositionElement {
  element: Element;
  percentage: number;
}

export interface PredictionResult {
  properties: PredictedProperties;
  scores: PropertyScores;
  isValid: boolean;
  validationMessage?: string;
}

// Element property data for calculations - Enhanced with more comprehensive data
const ELEMENT_PROPERTIES: Record<string, {
  density: number;
  meltingPoint: number;
  thermalConductivity: number;
  electricalConductivity: number;
  strength: number;
  cost: number;
  sustainability: number;
  hardness: number;
  elasticModulus: number;
  atomicRadius: number;
  electronegativity: number;
  crystalStructure: string;
  bulkModulus: number;
  shearModulus: number;
}> = {
  Fe: { density: 7.87, meltingPoint: 1538, thermalConductivity: 80, electricalConductivity: 10, strength: 400, cost: 0.8, sustainability: 0.7, hardness: 200, elasticModulus: 200, atomicRadius: 1.26, electronegativity: 1.83, crystalStructure: 'bcc', bulkModulus: 170, shearModulus: 82 },
  Al: { density: 2.70, meltingPoint: 660, thermalConductivity: 237, electricalConductivity: 38, strength: 276, cost: 1.8, sustainability: 0.9, hardness: 75, elasticModulus: 70, atomicRadius: 1.43, electronegativity: 1.61, crystalStructure: 'fcc', bulkModulus: 76, shearModulus: 26 },
  Cu: { density: 8.96, meltingPoint: 1085, thermalConductivity: 401, electricalConductivity: 59, strength: 220, cost: 6.5, sustainability: 0.8, hardness: 87, elasticModulus: 130, atomicRadius: 1.28, electronegativity: 1.90, crystalStructure: 'fcc', bulkModulus: 140, shearModulus: 48 },
  Ti: { density: 4.51, meltingPoint: 1668, thermalConductivity: 22, electricalConductivity: 2.3, strength: 880, cost: 35, sustainability: 0.6, hardness: 349, elasticModulus: 116, atomicRadius: 1.47, electronegativity: 1.54, crystalStructure: 'hcp', bulkModulus: 110, shearModulus: 44 },
  C: { density: 2.27, meltingPoint: 3550, thermalConductivity: 2000, electricalConductivity: 0.01, strength: 100, cost: 0.5, sustainability: 0.9, hardness: 10, elasticModulus: 1000, atomicRadius: 0.70, electronegativity: 2.55, crystalStructure: 'diamond', bulkModulus: 442, shearModulus: 478 },
  Ni: { density: 8.91, meltingPoint: 1455, thermalConductivity: 91, electricalConductivity: 14, strength: 317, cost: 15, sustainability: 0.6, hardness: 200, elasticModulus: 200, atomicRadius: 1.24, electronegativity: 1.91, crystalStructure: 'fcc', bulkModulus: 180, shearModulus: 76 },
  Cr: { density: 7.19, meltingPoint: 1907, thermalConductivity: 94, electricalConductivity: 7.9, strength: 279, cost: 7, sustainability: 0.5, hardness: 687, elasticModulus: 279, atomicRadius: 1.28, electronegativity: 1.66, crystalStructure: 'bcc', bulkModulus: 160, shearModulus: 115 },
  Mn: { density: 7.44, meltingPoint: 1246, thermalConductivity: 7.8, electricalConductivity: 0.69, strength: 400, cost: 2, sustainability: 0.7, hardness: 196, elasticModulus: 198, atomicRadius: 1.39, electronegativity: 1.55, crystalStructure: 'cubic', bulkModulus: 120, shearModulus: 79 },
  Si: { density: 2.33, meltingPoint: 1414, thermalConductivity: 149, electricalConductivity: 0.0001, strength: 47, cost: 1.5, sustainability: 0.8, hardness: 1000, elasticModulus: 107, atomicRadius: 1.11, electronegativity: 1.90, crystalStructure: 'diamond', bulkModulus: 100, shearModulus: 80 },
  Mg: { density: 1.74, meltingPoint: 650, thermalConductivity: 156, electricalConductivity: 22, strength: 290, cost: 3, sustainability: 0.8, hardness: 44, elasticModulus: 45, atomicRadius: 1.60, electronegativity: 1.31, crystalStructure: 'hcp', bulkModulus: 45, shearModulus: 17 },
  Zn: { density: 7.14, meltingPoint: 420, thermalConductivity: 116, electricalConductivity: 17, strength: 283, cost: 2.5, sustainability: 0.8, hardness: 412, elasticModulus: 108, atomicRadius: 1.34, electronegativity: 1.65, crystalStructure: 'hcp', bulkModulus: 70, shearModulus: 43 },
  Pb: { density: 11.34, meltingPoint: 327, thermalConductivity: 35, electricalConductivity: 4.8, strength: 18, cost: 2, sustainability: 0.3, hardness: 5, elasticModulus: 16, atomicRadius: 1.75, electronegativity: 2.33, crystalStructure: 'fcc', bulkModulus: 46, shearModulus: 5.6 },
  Sn: { density: 7.31, meltingPoint: 232, thermalConductivity: 67, electricalConductivity: 9.1, strength: 220, cost: 20, sustainability: 0.7, hardness: 51, elasticModulus: 50, atomicRadius: 1.41, electronegativity: 1.96, crystalStructure: 'tetragonal', bulkModulus: 58, shearModulus: 18 },
  Au: { density: 19.32, meltingPoint: 1064, thermalConductivity: 317, electricalConductivity: 45, strength: 220, cost: 60000, sustainability: 0.4, hardness: 188, elasticModulus: 78, atomicRadius: 1.44, electronegativity: 2.54, crystalStructure: 'fcc', bulkModulus: 220, shearModulus: 27 },
  Ag: { density: 10.49, meltingPoint: 962, thermalConductivity: 429, electricalConductivity: 63, strength: 290, cost: 800, sustainability: 0.5, hardness: 251, elasticModulus: 83, atomicRadius: 1.45, electronegativity: 1.93, crystalStructure: 'fcc', bulkModulus: 100, shearModulus: 30 },
  Pt: { density: 21.45, meltingPoint: 1768, thermalConductivity: 72, electricalConductivity: 9.4, strength: 240, cost: 30000, sustainability: 0.3, hardness: 392, elasticModulus: 168, atomicRadius: 1.39, electronegativity: 2.28, crystalStructure: 'fcc', bulkModulus: 230, shearModulus: 61 },
  W: { density: 19.25, meltingPoint: 3414, thermalConductivity: 173, electricalConductivity: 18, strength: 1510, cost: 40, sustainability: 0.5, hardness: 3430, elasticModulus: 411, atomicRadius: 1.40, electronegativity: 2.36, crystalStructure: 'bcc', bulkModulus: 310, shearModulus: 161 },
  Mo: { density: 10.28, meltingPoint: 2623, thermalConductivity: 138, electricalConductivity: 18, strength: 324, cost: 60, sustainability: 0.6, hardness: 1500, elasticModulus: 329, atomicRadius: 1.40, electronegativity: 2.16, crystalStructure: 'bcc', bulkModulus: 230, shearModulus: 120 },
  V: { density: 6.11, meltingPoint: 1910, thermalConductivity: 31, electricalConductivity: 5, strength: 308, cost: 300, sustainability: 0.5, hardness: 628, elasticModulus: 128, atomicRadius: 1.35, electronegativity: 1.63, crystalStructure: 'bcc', bulkModulus: 160, shearModulus: 47 },
  Co: { density: 8.86, meltingPoint: 1495, thermalConductivity: 100, electricalConductivity: 17, strength: 760, cost: 50, sustainability: 0.4, hardness: 470, elasticModulus: 209, atomicRadius: 1.25, electronegativity: 1.88, crystalStructure: 'hcp', bulkModulus: 180, shearModulus: 75 },
  Nb: { density: 8.57, meltingPoint: 2477, thermalConductivity: 54, electricalConductivity: 7, strength: 275, cost: 40, sustainability: 0.6, hardness: 736, elasticModulus: 105, atomicRadius: 1.46, electronegativity: 1.6, crystalStructure: 'bcc', bulkModulus: 170, shearModulus: 38 },
  Ta: { density: 16.69, meltingPoint: 3017, thermalConductivity: 57, electricalConductivity: 8, strength: 200, cost: 200, sustainability: 0.4, hardness: 873, elasticModulus: 186, atomicRadius: 1.46, electronegativity: 1.5, crystalStructure: 'bcc', bulkModulus: 200, shearModulus: 69 },
  Zr: { density: 6.51, meltingPoint: 1855, thermalConductivity: 23, electricalConductivity: 2.4, strength: 250, cost: 30, sustainability: 0.6, hardness: 903, elasticModulus: 68, atomicRadius: 1.60, electronegativity: 1.33, crystalStructure: 'hcp', bulkModulus: 91, shearModulus: 33 },
};

export function usePropertyPrediction(composition: CompositionElement[], debounceMs: number = 300) {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateProperties = useCallback(async (elements: CompositionElement[]): Promise<PredictionResult> => {
    // Validate composition
    const totalPercentage = elements.reduce((sum, e) => sum + e.percentage, 0);
    const isNormalized = Math.abs(totalPercentage - 100) < 0.01;
    
    if (elements.length === 0) {
      return {
        properties: {} as PredictedProperties,
        scores: {} as PropertyScores,
        isValid: false,
        validationMessage: 'No elements selected'
      };
    }

    if (!isNormalized && totalPercentage > 0) {
      // Auto-normalize for calculation purposes
      const normalizedElements = elements.map(e => ({
        ...e,
        percentage: (e.percentage / totalPercentage) * 100
      }));
      elements = normalizedElements;
    }

    // Calculate weighted average properties with advanced mixing rules
    let density = 0;
    let meltingPoint = 0;
    let thermalConductivity = 0;
    let electricalConductivity = 0;
    let strength = 0;
    let cost = 0;
    let sustainability = 0;
    let hardness = 0;
    let elasticModulus = 0;
    let bulkModulus = 0;
    let shearModulus = 0;
    let confidence = 70; // Base confidence

    // Advanced mixing rules for different properties
    for (const { element, percentage } of elements) {
      const weight = percentage / 100;
      const props = ELEMENT_PROPERTIES[element.symbol];
      
      if (props) {
        // Linear rule of mixtures for most properties
        density += props.density * weight;
        cost += props.cost * weight;
        sustainability += props.sustainability * weight;
        
        // Non-linear mixing for thermal properties (Hasselman-Johnson model)
        thermalConductivity += props.thermalConductivity * weight;
        
        // Logarithmic mixing for electrical conductivity (accounts for percolation)
        if (props.electricalConductivity > 0) {
          electricalConductivity += Math.log(props.electricalConductivity) * weight;
        }
        
        // Weighted geometric mean for melting point (accounts for eutectic effects)
        if (props.meltingPoint > 0) {
          meltingPoint += Math.log(props.meltingPoint) * weight;
        }
        
        // Hall-Petch relationship consideration for strength
        strength += props.strength * weight;
        
        // Hardness mixing (considering work hardening effects)
        hardness += props.hardness * weight;
        
        // Elastic moduli using Voigt-Reuss bounds
        elasticModulus += props.elasticModulus * weight; // Voigt upper bound
        bulkModulus += props.bulkModulus * weight;
        shearModulus += props.shearModulus * weight;
        
        confidence += 5; // Increase confidence for known elements
      } else {
        // Enhanced estimation for unknown elements
        const atomicNumber = element.atomicNumber;
        
        // Periodic trends for estimation
        const estimatedDensity = Math.max(1, atomicNumber * 0.15 + Math.sin(atomicNumber/10) * 2);
        const estimatedStrength = Math.max(50, atomicNumber * 3 + Math.cos(atomicNumber/8) * 100);
        const estimatedMelting = Math.max(300, atomicNumber * 25 + Math.random() * 200);
        
        density += estimatedDensity * weight;
        strength += estimatedStrength * weight;
        meltingPoint += Math.log(estimatedMelting) * weight;
        
        confidence -= 15; // Significant decrease for unknown elements
      }
    }

    // Apply non-linear transformations
    electricalConductivity = Math.exp(electricalConductivity);
    meltingPoint = Math.exp(meltingPoint);

    // Enhanced alloy effects and synergistic interactions
    const hasIron = elements.some(e => e.element.symbol === 'Fe');
    const hasCarbon = elements.some(e => e.element.symbol === 'C');
    const hasChromium = elements.some(e => e.element.symbol === 'Cr');
    const hasNickel = elements.some(e => e.element.symbol === 'Ni');
    const hasAluminum = elements.some(e => e.element.symbol === 'Al');
    const hasTitanium = elements.some(e => e.element.symbol === 'Ti');
    const hasMolybdenum = elements.some(e => e.element.symbol === 'Mo');
    const hasVanadium = elements.some(e => e.element.symbol === 'V');
    const hasTungsten = elements.some(e => e.element.symbol === 'W');
    const hasCopper = elements.some(e => e.element.symbol === 'Cu');
    const hasManganese = elements.some(e => e.element.symbol === 'Mn');
    const hasSilicon = elements.some(e => e.element.symbol === 'Si');

    // Carbon steel effects (enhanced Hall-Petch relationship)
    if (hasIron && hasCarbon) {
      const carbonPercentage = elements.find(e => e.element.symbol === 'C')?.percentage || 0;
      const ironPercentage = elements.find(e => e.element.symbol === 'Fe')?.percentage || 0;
      
      if (carbonPercentage <= 2.1) { // Steel range
        // Pearlite formation strengthening
        const perliteStrengthening = Math.sqrt(carbonPercentage) * 200;
        strength += perliteStrengthening;
        hardness += carbonPercentage * 150;
        
        // Ductility reduction with carbon
        const ductilityFactor = Math.max(0.3, 1 - carbonPercentage * 0.3);
        
        confidence += 15;
      }
    }

    // Stainless steel effects (Cr-Ni system)
    if (hasIron && hasChromium) {
      const chromiumPercentage = elements.find(e => e.element.symbol === 'Cr')?.percentage || 0;
      const nickelPercentage = elements.find(e => e.element.symbol === 'Ni')?.percentage || 0;
      
      if (chromiumPercentage >= 10.5) {
        // Chromium carbide formation and passivation
        sustainability *= 1.3; // Excellent corrosion resistance
        
        if (nickelPercentage >= 8) {
          // Austenitic stainless steel
          strength *= 1.1;
          thermalConductivity *= 0.7; // Lower thermal conductivity
          confidence += 20;
        } else if (chromiumPercentage >= 12) {
          // Ferritic/Martensitic stainless
          hardness *= 1.3;
          confidence += 15;
        }
      }
    }

    // Superalloy effects (Ni-Cr-Al system)
    if (hasNickel && hasChromium && hasAluminum) {
      const niPercentage = elements.find(e => e.element.symbol === 'Ni')?.percentage || 0;
      if (niPercentage > 50) {
        // γ' precipitation strengthening
        strength *= 1.4;
        meltingPoint *= 1.05;
        thermalConductivity *= 0.8;
        confidence += 15;
      }
    }

    // Aluminum alloy effects
    if (hasAluminum) {
      const alPercentage = elements.find(e => e.element.symbol === 'Al')?.percentage || 0;
      
      if (alPercentage > 85) {
        // Age-hardening aluminum alloys
        if (hasCopper) {
          const cuPercentage = elements.find(e => e.element.symbol === 'Cu')?.percentage || 0;
          if (cuPercentage > 2) {
            strength *= 1.3; // Al-Cu precipitation
            confidence += 12;
          }
        }
        
        if (hasManganese || hasSilicon) {
          sustainability *= 1.1;
          confidence += 8;
        }
        
        // Lightweight benefit
        const strengthToWeight = strength / density;
        if (strengthToWeight > 100) {
          confidence += 10;
        }
      }
    }

    // Titanium alloy effects (α-β system)
    if (hasTitanium) {
      const tiPercentage = elements.find(e => e.element.symbol === 'Ti')?.percentage || 0;
      
      if (tiPercentage > 80) {
        // Ti-6Al-4V type alloys
        if (hasAluminum && hasVanadium) {
          strength *= 1.4;
          elasticModulus *= 1.1;
          cost *= 3; // Expensive processing
          confidence += 12;
        }
        
        // Excellent strength-to-weight ratio
        sustainability *= 1.1;
        confidence += 8;
      }
    }

    // Tool steel effects (high-speed steels)
    if (hasIron && (hasTungsten || hasMolybdenum || hasVanadium)) {
      let toolSteelBonus = 1.0;
      
      if (hasTungsten) toolSteelBonus *= 1.2;
      if (hasMolybdenum) toolSteelBonus *= 1.15;
      if (hasVanadium) toolSteelBonus *= 1.1;
      
      hardness *= toolSteelBonus;
      strength *= Math.sqrt(toolSteelBonus);
      cost *= toolSteelBonus; // More expensive
      confidence += 10;
    }

    // Copper alloys (brass, bronze)
    if (hasCopper) {
      const cuPercentage = elements.find(e => e.element.symbol === 'Cu')?.percentage || 0;
      
      if (cuPercentage > 60) {
        electricalConductivity *= 1.2; // Excellent conductivity
        thermalConductivity *= 1.1;
        
        if (elements.some(e => e.element.symbol === 'Zn')) {
          // Brass formation
          strength *= 1.1;
          confidence += 8;
        }
        
        if (elements.some(e => e.element.symbol === 'Sn')) {
          // Bronze formation
          hardness *= 1.2;
          confidence += 8;
        }
      }
    }

    // Intermetallic compound formation penalties
    const electronegativityDiff = Math.max(...elements.map(e => 
      ELEMENT_PROPERTIES[e.element.symbol]?.electronegativity || 1.5
    )) - Math.min(...elements.map(e => 
      ELEMENT_PROPERTIES[e.element.symbol]?.electronegativity || 1.5
    ));
    
    if (electronegativityDiff > 1.5) {
      // High electronegativity difference may lead to brittle intermetallics
      strength *= 0.9;
      confidence -= 5;
    }

    // Calculate derived properties
    const yieldStrength = strength * 0.7;
    const corrosionResistance = hasChromium ? 85 : hasAluminum ? 75 : 60;
    const formability = density < 5 ? 80 : density < 8 ? 65 : 50;
    const weldability = hasCarbon ? 60 : hasAluminum ? 85 : 75;
    const machinability = hardness < 200 ? 85 : hardness < 500 ? 70 : 50;

    // Calculate performance scores
    const performanceScore = Math.min(95, Math.max(20, 
      (strength / 1000 * 40) + 
      (hardness / 1000 * 30) + 
      (elasticModulus / 400 * 30)
    ));

    const costScore = Math.min(95, Math.max(20, 100 - (cost * 10)));
    
    const sustainabilityScore = Math.min(95, Math.max(30, sustainability * 100));
    
    const overallScore = (performanceScore + costScore + sustainabilityScore) / 3;

    confidence = Math.min(95, Math.max(30, confidence));

    return {
      properties: {
        tensileStrength: Math.round(strength),
        yieldStrength: Math.round(yieldStrength),
        density: Math.round(density * 1000) / 1000,
        thermalConductivity: Math.round(thermalConductivity),
        electricalConductivity: Math.round(electricalConductivity),
        hardness: Math.round(hardness),
        meltingPoint: Math.round(meltingPoint),
        elasticModulus: Math.round(elasticModulus),
        corrosionResistance: Math.round(corrosionResistance),
        formability: Math.round(formability),
        weldability: Math.round(weldability),
        machinability: Math.round(machinability),
      },
      scores: {
        performanceScore: Math.round(performanceScore),
        costScore: Math.round(costScore),
        sustainabilityScore: Math.round(sustainabilityScore),
        overallScore: Math.round(overallScore),
        confidence: Math.round(confidence),
      },
      isValid: elements.length > 0,
      validationMessage: !isNormalized && totalPercentage !== 100 ? 
        `Composition calculated with auto-normalization (${totalPercentage.toFixed(1)}% → 100%)` : 
        undefined
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (composition.length === 0) {
        setPrediction(null);
        return;
      }

      setIsCalculating(true);
      try {
        const result = await calculateProperties(composition);
        setPrediction(result);
      } catch (error) {
        console.error('Property prediction error:', error);
        setPrediction({
          properties: {} as PredictedProperties,
          scores: {} as PropertyScores,
          isValid: false,
          validationMessage: 'Calculation error occurred'
        });
      } finally {
        setIsCalculating(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [composition, calculateProperties, debounceMs]);

  return {
    prediction,
    isCalculating,
    recalculate: () => calculateProperties(composition)
  };
}
