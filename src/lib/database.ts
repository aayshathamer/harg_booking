// API configuration for backend server
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

// API configuration
export const apiConfig: ApiConfig = {
  baseUrl: '/api',
  timeout: 30000
};

// Initialize database connection (now just checks API health)
export const initDatabase = async () => {
  try {
    const response = await fetch(`${apiConfig.baseUrl}/health`);
    if (response.ok) {
      console.log('✅ API connection initialized successfully');
      return true;
    } else {
      throw new Error('API health check failed');
    }
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
};

// Close database connection (no-op for API)
export const closeDatabase = async () => {
  console.log('API connection closed');
};

// Execute database query (now makes HTTP requests to backend)
export const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
  try {
    console.log('Executing query via API:', query, 'with params:', params);
    
    // Determine the endpoint based on the query
    let endpoint = '';
    let method = 'GET';
    let body = null;
    
    if (query.includes('SELECT') && query.includes('services')) {
      endpoint = '/services';
    } else if (query.includes('SELECT') && query.includes('deals')) {
      endpoint = '/deals';
    } else if (query.includes('SELECT') && query.includes('users')) {
      // Check if this is a query for a specific user by ID
      if (query.includes('WHERE id = ?') && params.length > 0) {
        endpoint = `/users/${params[0]}`;
      } else if (query.includes('WHERE username = ?') && params.length > 0) {
        endpoint = `/users/username/${params[0]}`;
      } else {
        endpoint = '/users';
      }
    } else if (query.includes('SELECT') && query.includes('bookings')) {
      endpoint = '/bookings';
    } else if (query.includes('INSERT INTO services')) {
      endpoint = '/services';
      method = 'POST';
      // Extract data from params for service creation
      body = {
        title: params[1],
        description: params[2],
        category: params[3],
        price: params[4],
        rating: params[5],
        image: params[6],
        location: params[7],
        isPopular: params[8],
        isNew: params[9],
        features: [] // Will be populated from service_features table
      };
    } else if (query.includes('INSERT INTO bookings')) {
      endpoint = '/bookings';
      method = 'POST';
      // Extract data from params for booking creation
      body = {
        serviceId: params[1],
        customerName: params[2],
        customerEmail: params[3],
        customerPhone: params[4],
        bookingDate: params[5],
        travelDate: params[6],
        numberOfPeople: params[7],
        totalAmount: params[8],
        status: params[9],
        paymentStatus: params[10],
        paymentMethod: params[11],
        notes: params[12]
      };
    } else if (query.includes('INSERT INTO users')) {
      endpoint = '/users';
      method = 'POST';
      // Extract data from params for user creation
      body = {
        id: params[0],
        username: params[1],
        email: params[2],
        password: params[3], // Password is at position 3
        firstName: params[4],
        lastName: params[5],
        phone: params[6],
        avatar: params[7],
        role: params[8],
        isActive: params[9]
      };
    } else if (query.includes('UPDATE users')) {
      endpoint = '/users';
      method = 'PUT';
      // For updates, we'll need to handle this differently
      // This is a simplified approach - in production you'd want more sophisticated handling
      body = {
        query: query,
        params: params
      };
    } else if (query.includes('DELETE FROM users')) {
      endpoint = '/users';
      method = 'DELETE';
      // For deletes, we'll need to handle this differently
      body = {
        query: query,
        params: params
      };
    }
    
    if (!endpoint) {
      throw new Error('Unsupported query type');
    }
    
    const response = await fetch(`${apiConfig.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      // For username lookups, 404 is a valid response (user not found)
      if (response.status === 404 && endpoint.includes('/users/username/')) {
        return null;
      }
      
      let errorMessage = `API request failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (parseError) {
        // If we can't parse the error response, use the default message
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw new Error('Database operation failed');
  }
};
