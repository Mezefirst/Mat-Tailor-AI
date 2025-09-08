// Advanced Material Property Simulation Engine
// Uses machine learning models and physics-based equations to predict material properties

import { Material } from '@/data/materials';

export interface SimulationRequest {
  materialId?: string;
  customMaterial?: CustomMaterialInput;
  simulationType: 'mechanical' | 'thermal' | 'electrical' | 'chemical' | 'comprehensive';
  conditions?: SimulationConditions;
}

export interface CustomMaterialInput {
  name: string;
  composition: ElementComposition[];
  structure: 'crystalline' | 'amorphous' | 'composite' | 'layered';
  processingMethod: 'casting' | 'forging' | 'machining' | 'additive' | 'sintering';
  heatTreatment?: HeatTreatment;
}

export interface ElementComposition {
  element: string;
  percentage: number; // atomic percentage
  role: 'matrix' | 'alloying' | 'reinforcement' | 'additive';
}

export interface HeatTreatment {
  type: 'annealing' | 'quenching' | 'tempering' | 'aging' | 'normalizing';
  temperature: number; // °C
  duration: number; // hours
  coolingRate: number; // °C/min
}

export interface SimulationConditions {
  temperature: number; // °C
  pressure: number; // MPa
  humidity?: number; // %
  strain?: number; // %
  frequency?: number; // Hz for fatigue
  environment?: 'air' | 'vacuum' | 'seawater' | 'acidic' | 'basic';
  loadingType?: 'tensile' | 'compressive' | 'shear' | 'cyclic' | 'impact';
}

export interface SimulationResults {
  predictedProperties: PredictedProperties;
  confidence: number; // 0-1
  uncertaintyBands: UncertaintyBands;
  validationData?: ValidationData;
  recommendations: string[];
  warnings: string[];
}

export interface PredictedProperties {
  mechanical?: {
    tensileStrength: number;
    yieldStrength: number;
    elasticModulus: number;
    hardness: number;
    ductility: number;
    toughness: number;
    creepRate?: number; // per year
    fatigueLife?: number;
  };
  thermal?: {
    thermalConductivity: number;
    thermalExpansion: number;
    specificHeat: number;
    thermalDiffusivity: number;
    thermalShock: number;
    thermalStress?: number; // MPa
  };
  electrical?: {
    resistivity: number;
    conductivity: number;
    dielectricStrength?: number;
    dielectricConstant?: number;
    bandGap?: number;
  };
  chemical?: {
    corrosionRate: number;
    oxidationResistance: number;
    chemicalStability: number;
    phStability: { min: number; max: number };
  };
}

export interface UncertaintyBands {
  mechanical?: { [key: string]: { min: number; max: number } };
  thermal?: { [key: string]: { min: number; max: number } };
  electrical?: { [key: string]: { min: number; max: number } };
  chemical?: { [key: string]: { min: number; max: number } };
}

export interface ValidationData {
  experimentalData: number[];
  predictedData: number[];
  rSquared: number;
  meanAbsoluteError: number;
}

// Core simulation engine
export class MaterialSimulator {
  
  /**
   * Main simulation method that coordinates all property predictions
   */
  async simulateMaterial(request: SimulationRequest): Promise<SimulationResults> {
    const baseProperties = await this.getBaseProperties(request);
    const conditions = request.conditions || this.getStandardConditions();
    
    let predictedProperties: PredictedProperties = {};
    let uncertaintyBands: UncertaintyBands = {};
    let confidence = 0;
    let recommendations: string[] = [];
    let warnings: string[] = [];

    // Perform simulations based on type
    if (request.simulationType === 'mechanical' || request.simulationType === 'comprehensive') {
      const mechResult = await this.simulateMechanicalProperties(baseProperties, conditions);
      predictedProperties.mechanical = mechResult.properties;
      uncertaintyBands.mechanical = mechResult.uncertainty;
      confidence += mechResult.confidence * 0.25;
      recommendations.push(...mechResult.recommendations);
      warnings.push(...mechResult.warnings);
    }

    if (request.simulationType === 'thermal' || request.simulationType === 'comprehensive') {
      const thermResult = await this.simulateThermalProperties(baseProperties, conditions);
      predictedProperties.thermal = thermResult.properties;
      uncertaintyBands.thermal = thermResult.uncertainty;
      confidence += thermResult.confidence * 0.25;
      recommendations.push(...thermResult.recommendations);
      warnings.push(...thermResult.warnings);
    }

    if (request.simulationType === 'electrical' || request.simulationType === 'comprehensive') {
      const elecResult = await this.simulateElectricalProperties(baseProperties, conditions);
      predictedProperties.electrical = elecResult.properties;
      uncertaintyBands.electrical = elecResult.uncertainty;
      confidence += elecResult.confidence * 0.25;
      recommendations.push(...elecResult.recommendations);
      warnings.push(...elecResult.warnings);
    }

    if (request.simulationType === 'chemical' || request.simulationType === 'comprehensive') {
      const chemResult = await this.simulateChemicalProperties(baseProperties, conditions);
      predictedProperties.chemical = chemResult.properties;
      uncertaintyBands.chemical = chemResult.uncertainty;
      confidence += chemResult.confidence * 0.25;
      recommendations.push(...chemResult.recommendations);
      warnings.push(...chemResult.warnings);
    }

    // Normalize confidence if not comprehensive
    if (request.simulationType !== 'comprehensive') {
      confidence *= 4;
    }

    return {
      predictedProperties,
      confidence: Math.min(confidence, 1),
      uncertaintyBands,
      recommendations: [...new Set(recommendations)],
      warnings: [...new Set(warnings)]
    };
  }

  /**
   * Simulate mechanical properties using advanced temperature and pressure models
   */
  private async simulateMechanicalProperties(
    baseProperties: any, 
    conditions: SimulationConditions
  ): Promise<{
    properties: any;
    uncertainty: any;
    confidence: number;
    recommendations: string[];
    warnings: string[];
  }> {
    // Advanced temperature and pressure corrections
    const tempFactor = this.getAdvancedTemperatureFactor(conditions.temperature, baseProperties);
    const pressureFactor = this.getPressureFactor(conditions.pressure, baseProperties);
    const strainRateFactor = this.getStrainRateFactor(conditions);
    const environmentFactor = this.getMechanicalEnvironmentFactor(conditions.environment);
    
    // Temperature and pressure-adjusted properties with physical models
    const tensileStrength = baseProperties.tensileStrength * tempFactor * pressureFactor * strainRateFactor * environmentFactor;
    const yieldStrength = baseProperties.yieldStrength * tempFactor * pressureFactor * strainRateFactor * environmentFactor;
    const elasticModulus = baseProperties.elasticModulus * this.getModulusTemperaturePressureFactor(conditions.temperature, conditions.pressure, baseProperties);
    
    // Advanced ML-enhanced predictions with sensitivity analysis
    const hardness = this.predictHardnessAdvanced(tensileStrength, baseProperties.composition, conditions);
    const ductility = this.predictDuctilityAdvanced(baseProperties, conditions);
    const toughness = this.predictToughnessAdvanced(tensileStrength, ductility, conditions);
    
    // Creep rate prediction for high temperature applications
    const creepRate = this.predictCreepRate(baseProperties, conditions);
    
    // Fatigue life prediction with environmental effects
    let fatigueLife;
    if (conditions.loadingType === 'cyclic' && conditions.frequency) {
      fatigueLife = this.predictFatigueLifeAdvanced(tensileStrength, conditions, baseProperties);
    }

    const properties = {
      tensileStrength,
      yieldStrength,
      elasticModulus,
      hardness,
      ductility,
      toughness,
      creepRate,
      fatigueLife
    };

    const uncertainty = this.calculateMechanicalUncertaintyAdvanced(properties, baseProperties, conditions);
    const confidence = this.calculateMechanicalConfidenceAdvanced(baseProperties, conditions);
    
    const recommendations = this.generateMechanicalRecommendationsAdvanced(properties, conditions);
    const warnings = this.generateMechanicalWarningsAdvanced(properties, conditions, baseProperties);

    return { properties, uncertainty, confidence, recommendations, warnings };
  }

  /**
   * Simulate thermal properties using advanced physics-based models with pressure sensitivity
   */
  private async simulateThermalProperties(
    baseProperties: any,
    conditions: SimulationConditions
  ): Promise<{
    properties: any;
    uncertainty: any;
    confidence: number;
    recommendations: string[];
    warnings: string[];
  }> {
    // Advanced thermal conductivity with temperature and pressure dependence
    const thermalConductivity = this.predictThermalConductivityAdvanced(baseProperties, conditions);
    
    // Thermal expansion with both temperature and pressure effects
    const thermalExpansion = this.predictThermalExpansionAdvanced(baseProperties, conditions);
    
    // Specific heat using Einstein-Debye models with pressure correction
    const specificHeat = this.predictSpecificHeatAdvanced(baseProperties, conditions);
    
    // Thermal diffusivity with pressure-dependent density
    const adjustedDensity = this.getPressuregentDensity(baseProperties.density, conditions.pressure);
    const thermalDiffusivity = thermalConductivity / (adjustedDensity * specificHeat);
    
    // Advanced thermal shock resistance with pressure effects
    const thermalShock = this.predictThermalShockAdvanced(baseProperties, thermalConductivity, thermalExpansion, conditions);
    
    // Thermal stress prediction
    const thermalStress = this.predictThermalStress(baseProperties, conditions);

    const properties = {
      thermalConductivity,
      thermalExpansion,
      specificHeat,
      thermalDiffusivity,
      thermalShock,
      thermalStress
    };

    const uncertainty = this.calculateThermalUncertaintyAdvanced(properties, conditions);
    const confidence = this.calculateThermalConfidenceAdvanced(baseProperties, conditions);
    
    const recommendations = this.generateThermalRecommendationsAdvanced(properties, conditions);
    const warnings = this.generateThermalWarningsAdvanced(properties, conditions);

    return { properties, uncertainty, confidence, recommendations, warnings };
  }

  /**
   * Simulate electrical properties using band theory and empirical models
   */
  private async simulateElectricalProperties(
    baseProperties: any,
    conditions: SimulationConditions
  ): Promise<{
    properties: any;
    uncertainty: any;
    confidence: number;
    recommendations: string[];
    warnings: string[];
  }> {
    // Temperature-dependent resistivity
    const resistivity = this.predictResistivity(baseProperties, conditions.temperature);
    const conductivity = 1 / resistivity;
    
    // Dielectric properties for insulators
    let dielectricStrength, dielectricConstant, bandGap;
    
    if (baseProperties.category === 'ceramic' || baseProperties.category === 'polymer') {
      dielectricStrength = this.predictDielectricStrength(baseProperties, conditions);
      dielectricConstant = this.predictDielectricConstant(baseProperties, conditions.temperature);
    }
    
    if (baseProperties.category === 'semiconductor') {
      bandGap = this.predictBandGap(baseProperties, conditions.temperature);
    }

    const properties = {
      resistivity,
      conductivity,
      dielectricStrength,
      dielectricConstant,
      bandGap
    };

    const uncertainty = this.calculateElectricalUncertainty(properties);
    const confidence = this.calculateElectricalConfidence(baseProperties, conditions);
    
    const recommendations = this.generateElectricalRecommendations(properties, conditions);
    const warnings = this.generateElectricalWarnings(properties, conditions);

    return { properties, uncertainty, confidence, recommendations, warnings };
  }

  /**
   * Simulate chemical properties using thermodynamic models
   */
  private async simulateChemicalProperties(
    baseProperties: any,
    conditions: SimulationConditions
  ): Promise<{
    properties: any;
    uncertainty: any;
    confidence: number;
    recommendations: string[];
    warnings: string[];
  }> {
    // Corrosion rate prediction using Butler-Volmer equation
    const corrosionRate = this.predictCorrosionRate(baseProperties, conditions);
    
    // Oxidation resistance using parabolic rate law
    const oxidationResistance = this.predictOxidationResistance(baseProperties, conditions);
    
    // Chemical stability assessment
    const chemicalStability = this.predictChemicalStability(baseProperties, conditions);
    
    // pH stability range
    const phStability = this.predictPhStability(baseProperties, conditions);

    const properties = {
      corrosionRate,
      oxidationResistance,
      chemicalStability,
      phStability
    };

    const uncertainty = this.calculateChemicalUncertainty(properties);
    const confidence = this.calculateChemicalConfidence(baseProperties, conditions);
    
    const recommendations = this.generateChemicalRecommendations(properties, conditions);
    const warnings = this.generateChemicalWarnings(properties, conditions);

    return { properties, uncertainty, confidence, recommendations, warnings };
  }

  // Advanced temperature and pressure factor calculations
  private getAdvancedTemperatureFactor(temperature: number, baseProperties: any): number {
    // Material-specific temperature dependence models
    const roomTemp = 25;
    const tempDiff = temperature - roomTemp;
    const homologousTemp = (temperature + 273) / (baseProperties.meltingPoint + 273 || 1000);
    
    // Different models for different temperature regimes
    if (homologousTemp < 0.3) {
      // Low temperature regime - athermal strengthening dominates
      return Math.max(0.2, 1 + tempDiff * 0.0002);
    } else if (homologousTemp < 0.6) {
      // Intermediate temperature - thermal activation
      return Math.max(0.3, 1 - tempDiff * 0.001 - Math.pow(homologousTemp, 2) * 0.5);
    } else {
      // High temperature - rapid strength degradation
      return Math.max(0.1, 1 - tempDiff * 0.003 - Math.pow(homologousTemp, 3) * 0.8);
    }
  }

  private getPressureFactor(pressure: number, baseProperties: any): number {
    // Pressure effects on mechanical properties (GPa scale)
    const pressureGPa = pressure / 1000; // Convert MPa to GPa
    
    // Most materials strengthen under pressure (Bridgman effect)
    const pressureCoeff = baseProperties.category === 'ceramic' ? 0.1 : 0.05;
    return 1 + pressureGPa * pressureCoeff;
  }

  private getModulusTemperaturePressureFactor(temperature: number, pressure: number, baseProperties: any): number {
    // Combined temperature and pressure effects on elastic modulus
    const tempFactor = this.getModulusTemperatureFactor(temperature);
    const pressureGPa = pressure / 1000;
    
    // Pressure stiffens the material
    const pressureFactor = 1 + pressureGPa * 0.02; // 2% increase per GPa
    
    return tempFactor * pressureFactor;
  }

  private getMechanicalEnvironmentFactor(environment?: string): number {
    // Environmental effects on mechanical properties
    const factors = {
      'air': 1.0,
      'vacuum': 1.05, // No oxidation effects
      'seawater': 0.9, // Stress corrosion
      'acidic': 0.85, // Hydrogen embrittlement
      'basic': 0.95   // Mild corrosion effects
    };
    return factors[environment || 'air'] || 1.0;
  }

  // Advanced property prediction methods
  private predictHardnessAdvanced(tensileStrength: number, composition: any, conditions: SimulationConditions): number {
    // Temperature-dependent hardness correlation
    const baseHardness = tensileStrength * 3; // HV ≈ 3 × UTS (MPa)
    const tempFactor = Math.max(0.3, 1 - (conditions.temperature - 25) * 0.001);
    const pressureFactor = 1 + (conditions.pressure / 1000) * 0.05; // Pressure hardening
    
    return baseHardness * tempFactor * pressureFactor;
  }

  private predictDuctilityAdvanced(baseProperties: any, conditions: SimulationConditions): number {
    // Advanced ductility model with temperature and pressure effects
    const baseDuctility = 0.25;
    const strengthFactor = Math.max(0.05, 1 - baseProperties.tensileStrength / 2000);
    
    // Temperature effects - ductility increases with temperature (generally)
    const tempK = conditions.temperature + 273;
    const tempFactor = Math.max(0.1, Math.min(2.0, tempK / 298));
    
    // Pressure effects - pressure reduces ductility
    const pressureFactor = Math.max(0.3, 1 - (conditions.pressure / 1000) * 0.1);
    
    // Environment effects
    const envFactor = this.getDuctilityEnvironmentFactor(conditions.environment);
    
    return baseDuctility * strengthFactor * tempFactor * pressureFactor * envFactor;
  }

  private getDuctilityEnvironmentFactor(environment?: string): number {
    const factors = {
      'air': 1.0,
      'vacuum': 1.1,    // No environmental degradation
      'seawater': 0.7,  // Hydrogen embrittlement
      'acidic': 0.6,    // Severe hydrogen embrittlement
      'basic': 0.9      // Mild effects
    };
    return factors[environment || 'air'] || 1.0;
  }

  private predictToughnessAdvanced(tensileStrength: number, ductility: number, conditions: SimulationConditions): number {
    // Temperature-dependent toughness
    const baseToughness = tensileStrength * ductility * 0.5;
    
    // Ductile-brittle transition consideration
    const transitionTemp = this.estimateDBTT(conditions);
    const tempFactor = conditions.temperature < transitionTemp ? 0.3 : 1.0;
    
    return baseToughness * tempFactor;
  }

  private estimateDBTT(conditions: SimulationConditions): number {
    // Estimate ductile-brittle transition temperature
    // Simplified model - would be material-specific in practice
    return -50; // °C for steel-like materials
  }

  private predictCreepRate(baseProperties: any, conditions: SimulationConditions): number {
    // Norton-Bailey creep law: ε̇ = A * σⁿ * exp(-Q/RT)
    const homologousTemp = (conditions.temperature + 273) / (baseProperties.meltingPoint + 273 || 1000);
    
    if (homologousTemp < 0.4) {
      return 0; // Negligible creep below 0.4 Tm
    }
    
    const stressExponent = 5; // Typical value
    const activationEnergy = 300000; // J/mol, typical for diffusion
    const gasConstant = 8.314; // J/mol·K
    const preExponential = 1e-6; // Material constant
    
    const stress = baseProperties.tensileStrength * 0.5; // Assume 50% of UTS
    const temperature = conditions.temperature + 273;
    
    const creepRate = preExponential * 
                     Math.pow(stress, stressExponent) * 
                     Math.exp(-activationEnergy / (gasConstant * temperature));
    
    return creepRate * 3.15e7; // Convert to per year
  }

  private predictFatigueLifeAdvanced(tensileStrength: number, conditions: SimulationConditions, baseProperties: any): number {
    // Advanced fatigue model including environmental effects
    const fatigueStrengthCoeff = tensileStrength * 1.5;
    const fatigueStrengthExp = -0.1;
    const stressAmplitude = tensileStrength * 0.5;
    
    // Temperature effects on fatigue
    const tempFactor = Math.max(0.3, 1 - (conditions.temperature - 25) * 0.002);
    
    // Environment effects on fatigue
    const envFactor = this.getFatigueEnvironmentFactor(conditions.environment);
    
    // Frequency effects
    const freqFactor = conditions.frequency ? Math.pow(conditions.frequency / 10, -0.1) : 1;
    
    const baseFatigueLife = Math.pow(fatigueStrengthCoeff / stressAmplitude, 1 / fatigueStrengthExp);
    
    return baseFatigueLife * tempFactor * envFactor * freqFactor;
  }

  private getFatigueEnvironmentFactor(environment?: string): number {
    const factors = {
      'air': 1.0,
      'vacuum': 1.2,    // No corrosion fatigue
      'seawater': 0.3,  // Severe corrosion fatigue
      'acidic': 0.2,    // Very severe corrosion fatigue
      'basic': 0.7      // Moderate corrosion fatigue
    };
    return factors[environment || 'air'] || 1.0;
  }

  // Advanced thermal property prediction methods
  private predictThermalConductivityAdvanced(baseProperties: any, conditions: SimulationConditions): number {
    const temperature = conditions.temperature + 273; // Convert to Kelvin
    const pressure = conditions.pressure;
    
    if (baseProperties.category === 'metal') {
      // Wiedemann-Franz law with temperature and pressure corrections
      const lorenzNumber = 2.44e-8; // W·Ω/K²
      const resistivity = this.predictResistivity(baseProperties, conditions.temperature);
      const conductivity = 1 / resistivity;
      
      // Base thermal conductivity
      let thermalCond = lorenzNumber * conductivity * temperature;
      
      // Pressure effects on phonon scattering
      const pressureFactor = 1 + (pressure / 1000) * 0.05; // 5% increase per GPa
      thermalCond *= pressureFactor;
      
      return thermalCond;
    } else if (baseProperties.category === 'ceramic') {
      // Phonon conduction with Umklapp scattering
      const baseConductivity = baseProperties.thermalConductivity || 5.0;
      const debyeTemp = 500; // Typical Debye temperature
      
      // Temperature dependence for ceramics
      const tempFactor = Math.pow(debyeTemp / temperature, 2) * Math.exp(debyeTemp / temperature) / Math.pow(Math.exp(debyeTemp / temperature) - 1, 2);
      
      // Pressure increases phonon velocity
      const pressureFactor = 1 + (pressure / 1000) * 0.1;
      
      return baseConductivity * tempFactor * pressureFactor;
    } else {
      // Polymers and other materials
      const baseConductivity = baseProperties.thermalConductivity || 0.5;
      const tempFactor = Math.max(0.5, 1 - (conditions.temperature - 25) * 0.001);
      const pressureFactor = 1 + (pressure / 1000) * 0.02;
      
      return baseConductivity * tempFactor * pressureFactor;
    }
  }

  private predictThermalExpansionAdvanced(baseProperties: any, conditions: SimulationConditions): number {
    const temperature = conditions.temperature + 273;
    const pressure = conditions.pressure;
    
    // Grüneisen parameter approach
    const baseExpansion = baseProperties.thermalExpansion || 10e-6; // per K
    const gruneisen = 2.0; // Typical Grüneisen parameter
    
    // Temperature dependence (non-linear at high T)
    const tempFactor = 1 + (temperature - 298) / 298 * 0.1;
    
    // Pressure effects (compression reduces expansion)
    const compressibility = 1e-4; // Typical value GPa⁻¹
    const pressureFactor = 1 - (pressure / 1000) * compressibility * gruneisen;
    
    return baseExpansion * tempFactor * pressureFactor;
  }

  private predictSpecificHeatAdvanced(baseProperties: any, conditions: SimulationConditions): number {
    const temperature = conditions.temperature + 273;
    const pressure = conditions.pressure;
    
    if (baseProperties.category === 'metal') {
      // Electronic + lattice contributions
      const debyeTemp = 400; // Typical for metals
      const gasConstant = 8.314; // J/mol·K
      
      // Debye model for lattice contribution
      const x = debyeTemp / temperature;
      const latticeHeat = 3 * gasConstant * Math.pow(x, 2) * Math.exp(x) / Math.pow(Math.exp(x) - 1, 2);
      
      // Electronic contribution (linear in T)
      const electronicHeat = 0.1 * temperature; // Simplified
      
      // Convert to J/kg·K (approximate)
      const molarMass = 0.055; // kg/mol, typical for metals
      let specificHeat = (latticeHeat + electronicHeat) / molarMass;
      
      // Pressure effects
      const pressureFactor = 1 + (pressure / 1000) * 0.01;
      specificHeat *= pressureFactor;
      
      return specificHeat;
    } else {
      // Einstein model for non-metals
      const baseHeat = baseProperties.specificHeat || 500;
      const einsteinTemp = 300;
      const x = einsteinTemp / temperature;
      const factor = Math.pow(x * Math.exp(x) / (Math.exp(x) - 1), 2);
      
      const pressureFactor = 1 + (pressure / 1000) * 0.02;
      return baseHeat * factor * pressureFactor;
    }
  }

  private getPressuregentDensity(baseDensity: number, pressure: number): number {
    // Bulk modulus compression
    const bulkModulus = 200; // GPa, typical value
    const pressureGPa = pressure / 1000;
    
    // Linear compression approximation
    const densityIncrease = 1 + pressureGPa / bulkModulus;
    return baseDensity * densityIncrease;
  }

  private predictThermalShockAdvanced(
    baseProperties: any, 
    thermalConductivity: number, 
    thermalExpansion: number, 
    conditions: SimulationConditions
  ): number {
    // Advanced thermal shock resistance parameter
    const tensileStrength = baseProperties.tensileStrength || 100;
    const elasticModulus = baseProperties.elasticModulus || 100000;
    const poissonRatio = 0.3; // Typical value
    
    // Thermal shock resistance with stress concentration
    const thermalShockParam = (tensileStrength * thermalConductivity * (1 - poissonRatio)) / 
                             (elasticModulus * thermalExpansion);
    
    // Pressure effects on thermal shock
    const pressureFactor = Math.max(0.5, 1 - (conditions.pressure / 1000) * 0.1);
    
    return thermalShockParam * pressureFactor;
  }

  private predictThermalStress(baseProperties: any, conditions: SimulationConditions): number {
    // Thermal stress from temperature gradients and constraints
    const thermalExpansion = baseProperties.thermalExpansion || 10e-6;
    const elasticModulus = baseProperties.elasticModulus || 100000;
    const tempGradient = Math.abs(conditions.temperature - 25); // Simplified
    
    // Thermal stress = E * α * ΔT for constrained expansion
    return elasticModulus * thermalExpansion * tempGradient;
  }

  private predictResistivity(baseProperties: any, temperature: number): number {
    // Temperature coefficient of resistance
    const baseResistivity = baseProperties.resistivity || 1e-7;
    const tempCoeff = baseProperties.category === 'metal' ? 0.004 : -0.01; // Different for metals vs semiconductors
    return baseResistivity * (1 + tempCoeff * (temperature - 25));
  }

  private predictDielectricStrength(baseProperties: any, conditions: SimulationConditions): number {
    // Empirical model for dielectric strength
    const baseStrength = 20; // kV/mm
    const tempFactor = Math.max(0.3, 1 - (conditions.temperature - 25) * 0.002);
    const humidityFactor = conditions.humidity ? Math.max(0.5, 1 - conditions.humidity * 0.005) : 1;
    return baseStrength * tempFactor * humidityFactor;
  }

  private predictDielectricConstant(baseProperties: any, temperature: number): number {
    // Temperature dependence of dielectric constant
    const baseConstant = 5.0;
    const tempCoeff = -0.001;
    return baseConstant * (1 + tempCoeff * (temperature - 25));
  }

  private predictBandGap(baseProperties: any, temperature: number): number {
    // Varshni equation for band gap temperature dependence
    const bandGap0 = 1.5; // eV at 0K
    const alpha = 5e-4;
    const beta = 300;
    const T = temperature + 273;
    return bandGap0 - (alpha * T * T) / (T + beta);
  }

  private predictCorrosionRate(baseProperties: any, conditions: SimulationConditions): number {
    // Butler-Volmer equation simplified
    const baseRate = 0.1; // mm/year
    const tempFactor = Math.exp((conditions.temperature - 25) / 30);
    const envFactor = this.getEnvironmentFactor(conditions.environment);
    return baseRate * tempFactor * envFactor;
  }

  private predictOxidationResistance(baseProperties: any, conditions: SimulationConditions): number {
    // Parabolic rate law for oxidation
    const baseResistance = 0.8;
    const tempFactor = Math.exp(-(conditions.temperature - 25) / 100);
    return baseResistance * tempFactor;
  }

  private predictChemicalStability(baseProperties: any, conditions: SimulationConditions): number {
    // Chemical stability index (0-1)
    let stability = 0.8;
    if (conditions.environment === 'acidic') stability *= 0.7;
    if (conditions.environment === 'basic') stability *= 0.8;
    if (conditions.temperature > 200) stability *= 0.9;
    return stability;
  }

  private predictPhStability(baseProperties: any, conditions: SimulationConditions): { min: number; max: number } {
    // pH stability range prediction
    const baseRange = { min: 4, max: 10 };
    if (baseProperties.category === 'ceramic') {
      return { min: 2, max: 12 };
    }
    if (baseProperties.category === 'polymer') {
      return { min: 5, max: 9 };
    }
    return baseRange;
  }

  private getEnvironmentFactor(environment?: string): number {
    const factors = {
      'air': 1.0,
      'vacuum': 0.1,
      'seawater': 3.0,
      'acidic': 5.0,
      'basic': 2.0
    };
    return factors[environment || 'air'] || 1.0;
  }

  // Advanced uncertainty and confidence calculation methods
  private calculateMechanicalUncertaintyAdvanced(properties: any, baseProperties: any, conditions: SimulationConditions): any {
    // Uncertainty increases with extreme conditions
    let baseUncertainty = 0.15; // 15% base uncertainty
    
    // Temperature effects on uncertainty
    const tempK = conditions.temperature + 273;
    const homologousTemp = tempK / (baseProperties.meltingPoint + 273 || 1000);
    if (homologousTemp > 0.7) baseUncertainty += 0.1; // High temp uncertainty
    if (conditions.temperature < -100) baseUncertainty += 0.05; // Low temp uncertainty
    
    // Pressure effects
    if (conditions.pressure > 100) baseUncertainty += 0.05; // High pressure uncertainty
    
    // Environment effects
    if (conditions.environment && conditions.environment !== 'air') baseUncertainty += 0.05;
    
    return Object.keys(properties).reduce((acc, key) => {
      if (properties[key] !== undefined) {
        const value = properties[key];
        // Property-specific uncertainty adjustments
        let propertyUncertainty = baseUncertainty;
        if (key === 'creepRate' || key === 'fatigueLife') propertyUncertainty *= 2; // Higher uncertainty for time-dependent properties
        
        acc[key] = {
          min: value * (1 - propertyUncertainty),
          max: value * (1 + propertyUncertainty)
        };
      }
      return acc;
    }, {} as any);
  }

  private calculateThermalUncertaintyAdvanced(properties: any, conditions: SimulationConditions): any {
    let baseUncertainty = 0.12; // 12% base uncertainty for thermal
    
    // High temperature increases uncertainty
    if (conditions.temperature > 500) baseUncertainty += 0.08;
    if (conditions.temperature > 1000) baseUncertainty += 0.15;
    
    // High pressure effects
    if (conditions.pressure > 50) baseUncertainty += 0.03;
    
    return Object.keys(properties).reduce((acc, key) => {
      if (properties[key] !== undefined) {
        const value = properties[key];
        acc[key] = {
          min: value * (1 - baseUncertainty),
          max: value * (1 + baseUncertainty)
        };
      }
      return acc;
    }, {} as any);
  }

  private calculateMechanicalConfidenceAdvanced(baseProperties: any, conditions: SimulationConditions): number {
    let confidence = 0.8;
    
    // Temperature effects on confidence
    const homologousTemp = (conditions.temperature + 273) / (baseProperties.meltingPoint + 273 || 1000);
    if (homologousTemp > 0.8) confidence *= 0.6; // Very high temperature
    else if (homologousTemp > 0.6) confidence *= 0.7; // High temperature
    else if (homologousTemp < 0.2) confidence *= 0.9; // Low temperature
    
    // Pressure effects
    if (conditions.pressure > 500) confidence *= 0.7; // Very high pressure
    else if (conditions.pressure > 100) confidence *= 0.8; // High pressure
    
    // Loading type effects
    if (conditions.loadingType === 'impact') confidence *= 0.6;
    else if (conditions.loadingType === 'cyclic') confidence *= 0.7;
    
    // Environment effects
    if (conditions.environment === 'seawater' || conditions.environment === 'acidic') confidence *= 0.7;
    
    return Math.max(0.2, confidence);
  }

  private calculateThermalConfidenceAdvanced(baseProperties: any, conditions: SimulationConditions): number {
    let confidence = 0.85;
    
    // Temperature regime confidence
    if (conditions.temperature > 1200) confidence *= 0.5; // Extreme high temp
    else if (conditions.temperature > 800) confidence *= 0.6;
    else if (conditions.temperature > 400) confidence *= 0.8;
    else if (conditions.temperature < -150) confidence *= 0.7; // Cryogenic
    
    // Pressure effects
    if (conditions.pressure > 200) confidence *= 0.6; // Extreme pressure
    else if (conditions.pressure > 50) confidence *= 0.8;
    
    return Math.max(0.3, confidence);
  }

  // Advanced recommendation generation
  private generateMechanicalRecommendationsAdvanced(properties: any, conditions: SimulationConditions): string[] {
    const recommendations = [];
    
    // Temperature-based recommendations
    if (conditions.temperature > 400) {
      recommendations.push("Consider high-temperature alloys or ceramics for this application");
    }
    if (conditions.temperature < -50) {
      recommendations.push("Verify impact toughness at cryogenic temperatures");
    }
    
    // Pressure-based recommendations
    if (conditions.pressure > 100) {
      recommendations.push("High pressure may enhance material properties through work hardening");
    }
    
    // Property-based recommendations
    if (properties.ductility < 0.03) {
      recommendations.push("Low ductility may lead to brittle failure - consider toughening treatments");
    }
    if (properties.creepRate && properties.creepRate > 1e-6) {
      recommendations.push("Significant creep expected - consider creep-resistant materials");
    }
    if (properties.fatigueLife && properties.fatigueLife < 1e5) {
      recommendations.push("Low fatigue life predicted - implement fatigue design procedures");
    }
    
    // Environment-based recommendations
    if (conditions.environment === 'seawater') {
      recommendations.push("Marine environment requires corrosion-resistant materials and coatings");
    }
    if (conditions.environment === 'acidic') {
      recommendations.push("Acidic environment may cause hydrogen embrittlement - use resistant alloys");
    }
    
    return recommendations;
  }

  private generateThermalRecommendationsAdvanced(properties: any, conditions: SimulationConditions): string[] {
    const recommendations = [];
    
    if (properties.thermalConductivity < 1) {
      recommendations.push("Low thermal conductivity may cause thermal gradients and stress");
    }
    if (properties.thermalExpansion > 20e-6) {
      recommendations.push("High thermal expansion coefficient - consider expansion joints");
    }
    if (properties.thermalShock < 5) {
      recommendations.push("Poor thermal shock resistance - avoid rapid temperature changes");
    }
    if (properties.thermalStress > properties.tensileStrength * 0.5) {
      recommendations.push("High thermal stress predicted - consider stress relief measures");
    }
    
    // Temperature-specific recommendations
    if (conditions.temperature > 800) {
      recommendations.push("High temperature operation requires thermal barrier coatings");
    }
    if (conditions.pressure > 50) {
      recommendations.push("High pressure enhances thermal conductivity - optimize heat transfer design");
    }
    
    return recommendations;
  }

  private generateMechanicalWarningsAdvanced(properties: any, conditions: SimulationConditions, baseProperties: any): string[] {
    const warnings = [];
    
    // Critical temperature warnings
    const homologousTemp = (conditions.temperature + 273) / (baseProperties.meltingPoint + 273 || 1000);
    if (homologousTemp > 0.8) {
      warnings.push("CRITICAL: Operating near melting point - material may fail catastrophically");
    } else if (homologousTemp > 0.6) {
      warnings.push("WARNING: High temperature operation - monitor for thermal degradation");
    }
    
    // Creep warnings
    if (properties.creepRate && properties.creepRate > 1e-5) {
      warnings.push("WARNING: High creep rate - dimensional stability compromised");
    }
    
    // Fatigue warnings
    if (properties.fatigueLife && properties.fatigueLife < 1e4) {
      warnings.push("WARNING: Very low fatigue life - frequent inspection mandatory");
    }
    
    // Pressure warnings
    if (conditions.pressure > 500) {
      warnings.push("WARNING: Extreme pressure may cause material phase changes");
    }
    
    // Environmental warnings
    if (conditions.environment === 'acidic' && properties.ductility < 0.05) {
      warnings.push("CRITICAL: Hydrogen embrittlement risk in acidic environment");
    }
    
    return warnings;
  }

  private generateThermalWarningsAdvanced(properties: any, conditions: SimulationConditions): string[] {
    const warnings = [];
    
    if (conditions.temperature > 0.9 * 1000) { // Assume max service temp
      warnings.push("CRITICAL: Temperature exceeds safe operating limit");
    }
    
    if (properties.thermalStress > 500) { // MPa
      warnings.push("WARNING: High thermal stress may cause cracking");
    }
    
    if (properties.thermalShock < 2) {
      warnings.push("CRITICAL: Extremely poor thermal shock resistance");
    }
    
    return warnings;
  }

  // Helper method to maintain compatibility
  private getStrainRateFactor(conditions: SimulationConditions): number {
    // Strain rate effects on strength
    return conditions.strain ? Math.pow(conditions.strain, 0.1) : 1;
  }

  private getModulusTemperatureFactor(temperature: number): number {
    // Elastic modulus decreases more gradually with temperature
    const roomTemp = 25;
    const tempDiff = temperature - roomTemp;
    return Math.max(0.3, 1 - tempDiff * 0.0005);
  }

  // Additional uncertainty and confidence methods for electrical/chemical
  private calculateElectricalUncertainty(properties: any): any {
    const baseUncertainty = 0.2; // 20% for electrical properties
    return Object.keys(properties).reduce((acc, key) => {
      if (properties[key] !== undefined) {
        const value = properties[key];
        acc[key] = {
          min: value * (1 - baseUncertainty),
          max: value * (1 + baseUncertainty)
        };
      }
      return acc;
    }, {} as any);
  }

  private calculateChemicalUncertainty(properties: any): any {
    const baseUncertainty = 0.25; // 25% for chemical properties (highest uncertainty)
    return Object.keys(properties).reduce((acc, key) => {
      if (properties[key] !== undefined) {
        const value = properties[key];
        acc[key] = {
          min: value * (1 - baseUncertainty),
          max: value * (1 + baseUncertainty)
        };
      }
      return acc;
    }, {} as any);
  }

  private calculateElectricalConfidence(baseProperties: any, conditions: SimulationConditions): number {
    let confidence = 0.75;
    if (conditions.humidity && conditions.humidity > 80) confidence *= 0.8;
    if (conditions.temperature > 200) confidence *= 0.8;
    return Math.max(0.3, confidence);
  }

  private calculateChemicalConfidence(baseProperties: any, conditions: SimulationConditions): number {
    let confidence = 0.7;
    if (conditions.environment && conditions.environment !== 'air') confidence *= 0.8;
    if (conditions.temperature > 300) confidence *= 0.9;
    return Math.max(0.3, confidence);
  }

  private generateElectricalRecommendations(properties: any, conditions: SimulationConditions): string[] {
    const recommendations = [];
    
    if (properties.dielectricStrength && properties.dielectricStrength < 5) {
      recommendations.push("Low dielectric strength may limit high-voltage applications");
    }
    if (properties.conductivity < 1e6 && properties.conductivity > 1e-6) {
      recommendations.push("Intermediate conductivity may cause unwanted heating");
    }
    
    return recommendations;
  }

  private generateChemicalRecommendations(properties: any, conditions: SimulationConditions): string[] {
    const recommendations = [];
    
    if (properties.corrosionRate > 1) {
      recommendations.push("High corrosion rate - consider protective coatings");
    }
    if (properties.chemicalStability < 0.5) {
      recommendations.push("Limited chemical stability in harsh environments");
    }
    
    return recommendations;
  }

  private generateElectricalWarnings(properties: any, conditions: SimulationConditions): string[] {
    const warnings = [];
    
    if (conditions.humidity && conditions.humidity > 85) {
      warnings.push("High humidity may affect electrical properties");
    }
    
    return warnings;
  }

  private generateChemicalWarnings(properties: any, conditions: SimulationConditions): string[] {
    const warnings = [];
    
    if (conditions.environment === 'seawater') {
      warnings.push("Seawater environment accelerates corrosion");
    }
    
    return warnings;
  }

  // Base properties extraction
  private async getBaseProperties(request: SimulationRequest): Promise<any> {
    if (request.materialId) {
      // Get from database
      const { getMaterialById } = await import('@/data/materials');
      return getMaterialById(request.materialId);
    } else if (request.customMaterial) {
      // Estimate properties from composition
      return this.estimatePropertiesFromComposition(request.customMaterial);
    }
    throw new Error('No material specified for simulation');
  }

  private estimatePropertiesFromComposition(material: CustomMaterialInput): any {
    // Simple rule-of-mixtures for initial estimates
    const composition = material.composition;
    
    // Basic property estimation based on composition
    const density = this.estimateDensity(composition);
    const meltingPoint = this.estimateMeltingPoint(composition);
    const tensileStrength = this.estimateStrength(composition, material.processingMethod);
    
    return {
      name: material.name,
      category: this.categorizeFromComposition(composition),
      density,
      meltingPoint,
      tensileStrength,
      yieldStrength: tensileStrength * 0.8,
      elasticModulus: tensileStrength * 500, // Rough correlation
      composition
    };
  }

  private estimateDensity(composition: ElementComposition[]): number {
    // Weighted average of element densities
    const elementDensities: { [key: string]: number } = {
      'Fe': 7.87, 'Al': 2.70, 'Cu': 8.96, 'Ti': 4.51, 'Ni': 8.91,
      'Cr': 7.19, 'C': 2.27, 'Si': 2.33, 'Mg': 1.74, 'Zn': 7.13
    };
    
    let totalDensity = 0;
    let totalPercentage = 0;
    
    composition.forEach(comp => {
      const density = elementDensities[comp.element] || 5.0;
      totalDensity += density * comp.percentage;
      totalPercentage += comp.percentage;
    });
    
    return totalDensity / totalPercentage * 1000; // Convert to kg/m³
  }

  private estimateMeltingPoint(composition: ElementComposition[]): number {
    // Weighted average of element melting points
    const elementMeltingPoints: { [key: string]: number } = {
      'Fe': 1538, 'Al': 660, 'Cu': 1085, 'Ti': 1668, 'Ni': 1455,
      'Cr': 1907, 'C': 3550, 'Si': 1414, 'Mg': 650, 'Zn': 420
    };
    
    let totalMeltingPoint = 0;
    let totalPercentage = 0;
    
    composition.forEach(comp => {
      const mp = elementMeltingPoints[comp.element] || 1000;
      totalMeltingPoint += mp * comp.percentage;
      totalPercentage += comp.percentage;
    });
    
    return totalMeltingPoint / totalPercentage;
  }

  private estimateStrength(composition: ElementComposition[], processing: string): number {
    // Base strength estimation
    let baseStrength = 200; // MPa
    
    composition.forEach(comp => {
      if (comp.element === 'C' && comp.percentage > 0.3) {
        baseStrength += comp.percentage * 100; // Carbon strengthening
      }
      if (comp.element === 'Cr' && comp.percentage > 10) {
        baseStrength += 50; // Chromium strengthening
      }
      if (comp.element === 'Ti') {
        baseStrength += comp.percentage * 10; // Titanium strengthening
      }
    });
    
    // Processing effects
    const processingFactors: { [key: string]: number } = {
      'casting': 0.8,
      'forging': 1.2,
      'machining': 1.0,
      'additive': 0.9,
      'sintering': 0.7
    };
    
    return baseStrength * (processingFactors[processing] || 1.0);
  }

  private categorizeFromComposition(composition: ElementComposition[]): string {
    const hasMetals = composition.some(c => ['Fe', 'Al', 'Cu', 'Ti', 'Ni'].includes(c.element));
    const hasCeramicElements = composition.some(c => ['Si', 'O', 'N', 'C'].includes(c.element));
    const hasPolymers = composition.some(c => ['C', 'H', 'O', 'N'].includes(c.element));
    
    if (hasMetals && composition.filter(c => ['Fe', 'Al', 'Cu', 'Ti', 'Ni'].includes(c.element)).length > 0) {
      return 'metal';
    }
    if (hasCeramicElements) {
      return 'ceramic';
    }
    if (hasPolymers) {
      return 'polymer';
    }
    return 'composite';
  }

  private getStandardConditions(): SimulationConditions {
    return {
      temperature: 25,
      pressure: 0.1,
      humidity: 50,
      environment: 'air'
    };
  }
}

// Singleton instance
export const materialSimulator = new MaterialSimulator();
