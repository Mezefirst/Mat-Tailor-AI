// Material Data Sources API Integration
// Connects to MatWeb and Materials Project databases

export interface MaterialProperty {
  name: string;
  value: number | string;
  unit?: string;
  condition?: string;
}

export interface ExternalMaterial {
  id: string;
  name: string;
  composition: Record<string, number>;
  properties: MaterialProperty[];
  source: 'matweb' | 'materials_project';
  category: string;
  description?: string;
  dataSheet?: string;
  suppliers?: string[];
}

export interface APICredentials {
  matwebApiKey?: string;
  materialsProjectApiKey?: string;
}

export class MaterialDataSourceManager {
  private credentials: APICredentials = {};
  private isInitialized = false;

  constructor() {
    // Load API keys from secure storage
    this.loadCredentials();
  }

  private async loadCredentials() {
    try {
      const stored = await spark.kv.get<APICredentials>('api-credentials');
      if (stored) {
        this.credentials = stored;
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('Could not load API credentials:', error);
      // Initialize with empty credentials to prevent errors
      this.credentials = {};
      this.isInitialized = true;
    }
  }

  async waitForInitialization() {
    while (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  async saveCredentials(credentials: Partial<APICredentials>) {
    try {
      this.credentials = { ...this.credentials, ...credentials };
      await spark.kv.set('api-credentials', this.credentials);
    } catch (error) {
      console.error('Failed to save API credentials:', error);
      throw new Error('Could not save API credentials securely');
    }
  }

  async clearCredentials() {
    try {
      this.credentials = {};
      await spark.kv.delete('api-credentials');
    } catch (error) {
      console.error('Failed to clear API credentials:', error);
      throw new Error('Could not clear API credentials');
    }
  }

  async getCredentialStatus() {
    await this.waitForInitialization();
    return {
      matweb: !!this.credentials.matwebApiKey,
      materialsProject: !!this.credentials.materialsProjectApiKey
    };
  }

  // MatWeb API Integration
  async searchMatWeb(query: {
    material?: string;
    property?: string;
    minValue?: number;
    maxValue?: number;
    category?: string;
  }): Promise<ExternalMaterial[]> {
    if (!this.credentials.matwebApiKey) {
      throw new Error('MatWeb API key not configured');
    }

    try {
      // Note: This is a simulated API call since MatWeb's actual API structure may vary
      // In a real implementation, you would use their actual endpoints
      const searchParams = new URLSearchParams();
      if (query.material) searchParams.append('material', query.material);
      if (query.property) searchParams.append('property', query.property);
      if (query.category) searchParams.append('category', query.category);

      // Simulated response - replace with actual MatWeb API call
      const mockData = this.generateMockMatWebData(query);
      
      // Actual API call would look like:
      // const response = await fetch(`https://api.matweb.com/search?${searchParams}`, {
      //   headers: {
      //     'Authorization': `Bearer ${this.credentials.matwebApiKey}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // const data = await response.json();

      return mockData;
    } catch (error) {
      console.error('MatWeb API error:', error);
      throw new Error('Failed to fetch data from MatWeb');
    }
  }

  // Materials Project API Integration
  async searchMaterialsProject(query: {
    elements?: string[];
    properties?: string[];
    formula?: string;
    spaceGroup?: number;
    bandGap?: { min?: number; max?: number };
    density?: { min?: number; max?: number };
  }): Promise<ExternalMaterial[]> {
    if (!this.credentials.materialsProjectApiKey) {
      throw new Error('Materials Project API key not configured');
    }

    try {
      // Materials Project uses a different API structure
      const requestBody = {
        criteria: {},
        properties: query.properties || ['material_id', 'formula', 'density', 'band_gap']
      };

      if (query.elements) {
        requestBody.criteria['elements'] = { '$in': query.elements };
      }
      if (query.formula) {
        requestBody.criteria['pretty_formula'] = query.formula;
      }
      if (query.bandGap) {
        requestBody.criteria['band_gap'] = {};
        if (query.bandGap.min) requestBody.criteria['band_gap']['$gte'] = query.bandGap.min;
        if (query.bandGap.max) requestBody.criteria['band_gap']['$lte'] = query.bandGap.max;
      }

      // Simulated response - replace with actual Materials Project API call
      const mockData = this.generateMockMaterialsProjectData(query);

      // Actual API call would look like:
      // const response = await fetch('https://api.materialsproject.org/query', {
      //   method: 'POST',
      //   headers: {
      //     'X-API-KEY': this.credentials.materialsProjectApiKey,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(requestBody)
      // });
      // const data = await response.json();

      return mockData;
    } catch (error) {
      console.error('Materials Project API error:', error);
      throw new Error('Failed to fetch data from Materials Project');
    }
  }

  // Combined search across all available sources
  async searchAllSources(query: {
    material?: string;
    elements?: string[];
    properties?: string[];
    category?: string;
    propertyRange?: { property: string; min?: number; max?: number };
  }): Promise<ExternalMaterial[]> {
    const results: ExternalMaterial[] = [];
    const promises: Promise<ExternalMaterial[]>[] = [];

    // Search MatWeb if API key is available
    if (this.credentials.matwebApiKey) {
      const matwebQuery = {
        material: query.material,
        category: query.category,
        property: query.propertyRange?.property,
        minValue: query.propertyRange?.min,
        maxValue: query.propertyRange?.max
      };
      promises.push(this.searchMatWeb(matwebQuery));
    }

    // Search Materials Project if API key is available
    if (this.credentials.materialsProjectApiKey) {
      const mpQuery = {
        elements: query.elements,
        properties: query.properties
      };
      promises.push(this.searchMaterialsProject(mpQuery));
    }

    try {
      const responses = await Promise.allSettled(promises);
      responses.forEach(response => {
        if (response.status === 'fulfilled') {
          results.push(...response.value);
        } else {
          console.warn('API search failed:', response.reason);
        }
      });

      return this.deduplicateResults(results);
    } catch (error) {
      console.error('Error searching material databases:', error);
      return results;
    }
  }

  // Remove duplicate materials based on composition similarity
  private deduplicateResults(materials: ExternalMaterial[]): ExternalMaterial[] {
    const unique = new Map<string, ExternalMaterial>();
    
    materials.forEach(material => {
      const compositionKey = Object.keys(material.composition)
        .sort()
        .map(element => `${element}:${material.composition[element]}`)
        .join('|');
      
      if (!unique.has(compositionKey) || material.source === 'materials_project') {
        // Prefer Materials Project data for scientific accuracy
        unique.set(compositionKey, material);
      }
    });

    return Array.from(unique.values());
  }

  // Mock data generators for development/testing
  private generateMockMatWebData(query: any): ExternalMaterial[] {
    const materials: ExternalMaterial[] = [
      {
        id: 'mw_steel_304',
        name: 'Stainless Steel 304',
        composition: { Fe: 70.0, Cr: 18.0, Ni: 8.0, C: 0.08 },
        properties: [
          { name: 'Tensile Strength', value: 515, unit: 'MPa' },
          { name: 'Yield Strength', value: 205, unit: 'MPa' },
          { name: 'Density', value: 8.0, unit: 'g/cm³' },
          { name: 'Thermal Conductivity', value: 16.2, unit: 'W/m·K' }
        ],
        source: 'matweb',
        category: 'Metal',
        description: 'Austenitic stainless steel with excellent corrosion resistance',
        suppliers: ['McMaster-Carr', 'Grainger', 'Metal Supermarkets']
      },
      {
        id: 'mw_aluminum_6061',
        name: 'Aluminum 6061-T6',
        composition: { Al: 97.9, Mg: 1.0, Si: 0.6, Cu: 0.3 },
        properties: [
          { name: 'Tensile Strength', value: 310, unit: 'MPa' },
          { name: 'Yield Strength', value: 276, unit: 'MPa' },
          { name: 'Density', value: 2.7, unit: 'g/cm³' },
          { name: 'Thermal Conductivity', value: 167, unit: 'W/m·K' }
        ],
        source: 'matweb',
        category: 'Metal',
        description: 'Versatile aluminum alloy with good mechanical properties',
        suppliers: ['Alcoa', 'Kaiser Aluminum', 'Norsk Hydro']
      }
    ];

    return materials.filter(m => 
      !query.material || m.name.toLowerCase().includes(query.material.toLowerCase())
    );
  }

  private generateMockMaterialsProjectData(query: any): ExternalMaterial[] {
    const materials: ExternalMaterial[] = [
      {
        id: 'mp-149',
        name: 'Silicon (Si)',
        composition: { Si: 100.0 },
        properties: [
          { name: 'Band Gap', value: 1.17, unit: 'eV' },
          { name: 'Density', value: 2.33, unit: 'g/cm³' },
          { name: 'Formation Energy', value: 0, unit: 'eV/atom' },
          { name: 'Space Group', value: 227, unit: '' }
        ],
        source: 'materials_project',
        category: 'Semiconductor',
        description: 'Crystalline silicon - fundamental semiconductor material'
      },
      {
        id: 'mp-2534',
        name: 'Gallium Arsenide (GaAs)',
        composition: { Ga: 50.0, As: 50.0 },
        properties: [
          { name: 'Band Gap', value: 1.52, unit: 'eV' },
          { name: 'Density', value: 5.32, unit: 'g/cm³' },
          { name: 'Formation Energy', value: -0.74, unit: 'eV/atom' },
          { name: 'Space Group', value: 216, unit: '' }
        ],
        source: 'materials_project',
        category: 'Semiconductor',
        description: 'III-V semiconductor with direct band gap'
      }
    ];

    return materials.filter(m => {
      if (query.elements) {
        const materialElements = Object.keys(m.composition);
        return query.elements.some((el: string) => materialElements.includes(el));
      }
      return true;
    });
  }
}

// Singleton instance for global use
export const materialDataSources = new MaterialDataSourceManager();
