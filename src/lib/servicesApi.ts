import { executeQuery, apiConfig } from './database';

// Service interface based on database schema
export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  image: string;
  location: string;
  isPopular: boolean;
  isNew: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  features?: string[];
}

// API service for services management
export class ServicesApiService {
  
  // Get all active services
  static async getAllServices(): Promise<Service[]> {
    try {
      const query = `
        SELECT 
          s.*,
          GROUP_CONCAT(DISTINCT sf.feature_name) as features
        FROM services s
        LEFT JOIN service_features sf ON s.id = sf.service_id
        WHERE s.is_active = TRUE
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `;
      
      const result = await executeQuery(query);
      return this.transformDatabaseResult(result);
    } catch (error) {
      console.error('Error fetching all services:', error);
      throw new Error('Failed to fetch services');
    }
  }

  // Get services by category
  static async getServicesByCategory(category: string): Promise<Service[]> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/services/category/${encodeURIComponent(category)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return this.transformDatabaseResult(result);
    } catch (error) {
      console.error('Error fetching services by category:', error);
      throw new Error('Failed to fetch services by category');
    }
  }

  // Get popular services
  static async getPopularServices(): Promise<Service[]> {
    try {
      const query = `
        SELECT 
          s.*,
          GROUP_CONCAT(DISTINCT sf.feature_name) as features
        FROM services s
        LEFT JOIN service_features sf ON s.id = sf.service_id
        WHERE s.is_popular = TRUE AND s.is_active = TRUE
        GROUP BY s.id
        ORDER BY s.rating DESC
      `;
      
      const result = await executeQuery(query);
      return this.transformDatabaseResult(result);
    } catch (error) {
      console.error('Error fetching popular services:', error);
      throw new Error('Failed to fetch services');
    }
  }

  // Get new services
  static async getNewServices(): Promise<Service[]> {
    try {
      const query = `
        SELECT 
          s.*,
          GROUP_CONCAT(DISTINCT sf.feature_name) as features
        FROM services s
        LEFT JOIN service_features sf ON s.id = sf.service_id
        WHERE s.is_new = TRUE AND s.is_active = TRUE
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `;
      
      const result = await executeQuery(query);
      return this.transformDatabaseResult(result);
    } catch (error) {
      console.error('Error fetching new services:', error);
      throw new Error('Failed to fetch services');
    }
  }

  // Search services by text
  static async searchServices(searchTerm: string): Promise<Service[]> {
    try {
      const query = `
        SELECT 
          s.*,
          GROUP_CONCAT(DISTINCT sf.feature_name) as features
        FROM services s
        LEFT JOIN service_features sf ON s.id = sf.service_id
        WHERE (s.title LIKE ? OR s.description LIKE ? OR s.location LIKE ?)
        AND s.is_active = TRUE
        GROUP BY s.id
        ORDER BY s.rating DESC
      `;
      
      const searchPattern = `%${searchTerm}%`;
      const result = await executeQuery(query, [searchPattern, searchPattern, searchPattern]);
      return this.transformDatabaseResult(result);
    } catch (error) {
      console.error('Error searching services:', error);
      throw new Error('Failed to search services');
    }
  }

  // Get service by ID
  static async getServiceById(id: string): Promise<Service | null> {
    try {
      const query = `
        SELECT 
          s.*,
          GROUP_CONCAT(DISTINCT sf.feature_name) as features
        FROM services s
        LEFT JOIN service_features sf ON s.id = sf.service_id
        WHERE s.id = ? AND s.is_active = TRUE
        GROUP BY s.id
      `;
      
      const result = await executeQuery(query, [id]);
      if (result.length === 0) {
        return null;
      }
      
      return this.transformDatabaseResult([result[0]])[0];
    } catch (error) {
      console.error('Error fetching service by ID:', error);
      throw new Error('Failed to fetch service');
    }
  }

  // Create a new service
  static async createService(serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ message: string; serviceId: string }> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating service:', error);
      throw new Error('Failed to create service');
    }
  }

  // Update an existing service
  static async updateService(id: string, serviceData: Partial<Service>): Promise<{ message: string }> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating service:', error);
      throw new Error('Failed to update service');
    }
  }

  // Delete a service
  static async deleteService(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${apiConfig.baseUrl}/services/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting service:', error);
      throw new Error('Failed to delete service');
    }
  }

  // Get services statistics
  static async getServicesStatistics(): Promise<any> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_services,
          COUNT(CASE WHEN is_popular = TRUE THEN 1 END) as popular_services,
          COUNT(CASE WHEN is_new = TRUE THEN 1 END) as new_services,
          COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_services,
          AVG(rating) as avg_rating,
          COUNT(DISTINCT category) as total_categories
        FROM services
      `;
      
      const result = await executeQuery(query);
      return result[0];
    } catch (error) {
      console.error('Error fetching services statistics:', error);
      throw new Error('Failed to fetch services statistics');
    }
  }

  // Get service counts by category
  static async getServiceCountsByCategory(): Promise<{ [key: string]: number }> {
    try {
      // First get all services and count them by category
      const response = await fetch(`${apiConfig.baseUrl}/services`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const services = await response.json();
      
      // Count services by category
      const counts: { [key: string]: number } = {};
      services.forEach((service: any) => {
        if (service.category && service.is_active) {
          counts[service.category] = (counts[service.category] || 0) + 1;
        }
      });
      
      return counts;
    } catch (error) {
      console.error('Error fetching service counts by category:', error);
      throw new Error('Failed to fetch service counts by category');
    }
  }

  // Transform database result to Service interface
  private static transformDatabaseResult(result: any[]): Service[] {
    return result.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      category: item.category,
      price: parseFloat(item.price) || 0,
      rating: parseFloat(item.rating) || 0,
      image: item.image || '🏨',
      location: item.location || '',
      isPopular: Boolean(item.is_popular),
      isNew: Boolean(item.is_new),
      isActive: Boolean(item.is_active),
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      createdBy: item.created_by,
      features: item.features ? item.features.split(',').map((f: string) => f.trim()) : []
    }));
  }
}
