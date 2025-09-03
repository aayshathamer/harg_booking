// Deal interface based on database schema
export interface Deal {
  id: string;
  title: string;
  location: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  image: string;
  category: string;
  discountPercentage: number;
  discountLabel: string;
  timeLeft: string;
  description: string;
  validUntil: string;
  isHot: boolean;
  isAiRecommended: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  features?: string[];
  terms?: string[];
  includedServices?: string[];
  excludedServices?: string[];
}

// API configuration
const API_BASE_URL = '/api';

// API service for deals management
export class DealsApiService {
  
  // Get all active deals
  static async getAllDeals(): Promise<Deal[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/deals`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return this.transformDatabaseResult(result);
    } catch (error) {
      console.error('Error fetching all deals:', error);
      throw new Error('Failed to fetch deals');
    }
  }

  // Get deals by category
  static async getDealsByCategory(category: string): Promise<Deal[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/deals?category=${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return this.transformDatabaseResult(result);
    } catch (error) {
      console.error('Error fetching deals by category:', error);
      throw new Error('Failed to fetch deals by category');
    }
  }

  // Get hot deals only
  static async getHotDeals(): Promise<Deal[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/deals?hot=true`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return this.transformDatabaseResult(result);
    } catch (error) {
      console.error('Error fetching hot deals:', error);
      throw new Error('Failed to fetch hot deals');
    }
  }

  // Get AI recommended deals
  static async getAIRecommendedDeals(): Promise<Deal[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/deals?aiRecommended=true`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return this.transformDatabaseResult(result);
    } catch (error) {
      console.error('Error fetching AI recommended deals:', error);
      throw new Error('Failed to fetch AI recommended deals');
    }
  }

  // Get expiring deals
  static async getExpiringDeals(days: number = 7): Promise<Deal[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/deals?expiring=${days}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return this.transformDatabaseResult(result);
    } catch (error) {
      console.error('Error fetching expiring deals:', error);
      throw new Error('Failed to fetch expiring deals');
    }
  }

  // Get deal by ID
  static async getDealById(id: string): Promise<Deal | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return this.transformDatabaseResult([result])[0];
    } catch (error) {
      console.error('Error fetching deal by ID:', error);
      throw new Error('Failed to fetch deal');
    }
  }

  // Create a new deal
  static async createDeal(dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ message: string; dealId: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating deal:', error);
      throw new Error('Failed to create deal');
    }
  }

  // Update an existing deal
  static async updateDeal(id: string, dealData: Partial<Deal>): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating deal:', error);
      throw new Error('Failed to update deal');
    }
  }

  // Delete a deal
  static async deleteDeal(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting deal:', error);
      throw new Error('Failed to delete deal');
    }
  }

  // Get deals statistics
  static async getDealsStatistics(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/deals/stats`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching deals statistics:', error);
      throw new Error('Failed to fetch deals statistics');
    }
  }

  // Transform database result to Deal interface
  private static transformDatabaseResult(result: any[]): Deal[] {
    return result.map(item => ({
      id: item.id,
      title: item.title,
      location: item.location,
      price: parseFloat(item.price),
      originalPrice: parseFloat(item.original_price),
      rating: parseFloat(item.rating) || 0,
      reviewsCount: parseInt(item.reviews_count) || 0,
      image: item.image,
      category: item.category,
      discountPercentage: parseInt(item.discount_percentage) || 0,
      discountLabel: item.discount_label || '0% OFF',
      timeLeft: item.time_left || '1 week left',
      description: item.description || '',
      validUntil: item.valid_until,
      isHot: Boolean(item.is_hot),
      isAiRecommended: Boolean(item.is_ai_recommended),
      isActive: Boolean(item.is_active),
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      createdBy: item.created_by,
      features: item.features ? item.features.split(',').map((f: string) => f.trim()) : [],
      terms: item.terms ? item.terms.split(',').map((t: string) => t.trim()) : [],
      includedServices: item.included_services ? item.included_services.split(',').map((s: string) => s.trim()) : [],
      excludedServices: item.excluded_services ? item.excluded_services.split(',').map((s: string) => s.trim()) : []
    }));
  }
}
