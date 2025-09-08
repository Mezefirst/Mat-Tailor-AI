/**
 * API service for backend communication
 * Handles all HTTP requests to the MatTailor AI backend
 */

interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

interface Material {
  id: string;
  name: string;
  category: string;
  tensile_strength?: number;
  cost_per_kg?: number;
  sustainability_score?: number;
  [key: string]: any;
}

interface MaterialQuery {
  requirements: {
    min_tensile_strength?: number;
    max_cost_per_kg?: number;
    min_sustainability_score?: number;
    [key: string]: any;
  };
  natural_language_query?: string;
  max_results?: number;
  application_domain?: string;
}

interface RecommendationResult {
  materials: Material[];
  scores: Array<{
    performance_score: number;
    cost_score: number;
    sustainability_score: number;
    overall_score: number;
  }>;
  total_results: number;
  processing_time_ms: number;
  confidence_level: number;
}

class ApiService {
  private config: ApiConfig;
  private isOnline: boolean = navigator.onLine;
  
  constructor() {
    this.config = {
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
      timeout: 30000,
      retries: 3
    };
    
    // Listen for online/offline changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processPendingRequests();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }
  
  /**
   * Make HTTP request with retry logic and error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries: number = this.config.retries
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: AbortSignal.timeout(this.config.timeout)
    };
    
    const requestOptions = { ...defaultOptions, ...options };
    
    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        if (response.status >= 500 && retries > 0) {
          // Retry server errors
          await this.delay(1000 * (this.config.retries - retries + 1));
          return this.request<T>(endpoint, options, retries - 1);
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.detail || response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        
        if (!this.isOnline) {
          // Try to get from cache
          const cachedResponse = await this.getCachedResponse<T>(endpoint);
          if (cachedResponse) {
            return cachedResponse;
          }
          throw new Error('No internet connection and no cached data available');
        }
        
        if (retries > 0 && (error.message.includes('fetch') || error.message.includes('network'))) {
          await this.delay(1000 * (this.config.retries - retries + 1));
          return this.request<T>(endpoint, options, retries - 1);
        }
      }
      
      throw error;
    }
  }
  
  /**
   * Get API health status
   */
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }
  
  /**
   * Get material recommendations
   */
  async getMaterialRecommendations(query: MaterialQuery): Promise<RecommendationResult> {
    try {
      const result = await this.request<RecommendationResult>('/recommend', {
        method: 'POST',
        body: JSON.stringify(query)
      });
      
      // Cache successful results
      this.cacheResponse('/recommend', result);
      
      return result;
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      throw error;
    }
  }
  
  /**
   * Search materials by text
   */
  async searchMaterials(
    query: string,
    category?: string,
    limit: number = 20
  ): Promise<{ materials: Material[] }> {
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
      ...(category && { category })
    });
    
    return this.request(`/materials/search?${params}`);
  }
  
  /**
   * Get material details by ID
   */
  async getMaterialById(materialId: string): Promise<Material> {
    return this.request(`/materials/${materialId}`);
  }
  
  /**
   * Get alternative materials
   */
  async getAlternativeMaterials(
    materialId: string,
    requirements: any
  ): Promise<{ alternatives: Material[] }> {
    return this.request('/alternatives', {
      method: 'POST',
      body: JSON.stringify({
        material_id: materialId,
        requirements
      })
    });
  }
  
  /**
   * Analyze trade-offs between materials
   */
  async analyzeTradeoffs(
    materialIds: string[],
    criteria: string[]
  ): Promise<any> {
    return this.request('/tradeoff', {
      method: 'POST',
      body: JSON.stringify({
        material_ids: materialIds,
        criteria
      })
    });
  }
  
  /**
   * Simulate custom material properties
   */
  async simulateCustomMaterial(
    composition: Record<string, number>,
    conditions: Record<string, any>
  ): Promise<{ simulated_properties: Record<string, number> }> {
    return this.request('/simulate', {
      method: 'POST',
      body: JSON.stringify({
        composition,
        conditions
      })
    });
  }
  
  /**
   * Start RL planning process
   */
  async startRLPlanning(
    objectives: string[],
    constraints: Record<string, any>
  ): Promise<{ status: string; message: string }> {
    return this.request('/plan_rl', {
      method: 'POST',
      body: JSON.stringify({
        objectives,
        constraints
      })
    });
  }
  
  /**
   * Get suppliers for a material
   */
  async getSuppliers(
    materialId: string,
    region?: string,
    minQuantity?: number
  ): Promise<{ suppliers: any[] }> {
    const params = new URLSearchParams({
      material_id: materialId,
      ...(region && { region }),
      ...(minQuantity && { min_quantity: minQuantity.toString() })
    });
    
    return this.request(`/suppliers?${params}`);
  }
  
  /**
   * Cache response for offline access
   */
  private async cacheResponse<T>(endpoint: string, data: T): Promise<void> {
    try {
      if ('caches' in window) {
        const cache = await caches.open('api-responses');
        const response = new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        });
        await cache.put(endpoint, response);
      }
    } catch (error) {
      console.warn('Failed to cache response:', error);
    }
  }
  
  /**
   * Get cached response
   */
  private async getCachedResponse<T>(endpoint: string): Promise<T | null> {
    try {
      if ('caches' in window) {
        const cache = await caches.open('api-responses');
        const response = await cache.match(endpoint);
        if (response) {
          return await response.json();
        }
      }
    } catch (error) {
      console.warn('Failed to get cached response:', error);
    }
    return null;
  }
  
  /**
   * Process pending requests when coming back online
   */
  private async processPendingRequests(): Promise<void> {
    // Implementation for background sync would go here
    console.log('Processing pending requests...');
  }
  
  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Check if API is reachable
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.getHealth();
      return true;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Export types
export type {
  Material,
  MaterialQuery,
  RecommendationResult
};
