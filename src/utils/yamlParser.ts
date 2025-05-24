
import { load } from 'js-yaml';

export interface OpenAPISpec {
  openapi?: string;
  swagger?: string;
  info: {
    title: string;
    description: string;
    version: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: {
    [path: string]: {
      [method: string]: {
        summary?: string;
        description?: string;
        operationId?: string;
        parameters?: Array<{
          name: string;
          in: string;
          required?: boolean;
          schema?: any;
          description?: string;
        }>;
        requestBody?: {
          required?: boolean;
          content: {
            [mediaType: string]: {
              schema: any;
            };
          };
        };
        responses: {
          [statusCode: string]: {
            description: string;
            content?: any;
          };
        };
        security?: any[];
      };
    };
  };
  components?: {
    schemas?: any;
    securitySchemes?: any;
  };
}

export const parseYamlSpec = (yamlContent: string): OpenAPISpec => {
  try {
    const spec = load(yamlContent) as OpenAPISpec;
    return spec;
  } catch (error) {
    console.error('Error parsing YAML:', error);
    throw new Error('Invalid YAML specification');
  }
};

export const makeApiCall = async (
  baseUrl: string,
  path: string, // This path should now include query parameters if any
  method: string,
  _parameters: Record<string, any> = {}, // This parameter is no longer used for query params here
  requestBody?: any,
  customHeaders: Record<string, string> = {} // Added customHeaders
) => {
  // The `path` received here is expected to be the full path including any query strings.
  // baseUrl might be like "https://api.example.com/v1" and path might be "/users?id=123"
  // Or baseUrl might be "https://api.example.com" and path might be "/v1/users?id=123"
  const url = new URL(path, baseUrl);

  const requestOptions: RequestInit = {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json', // Default, can be overridden by customHeaders
      ...customHeaders, // Merge custom headers
    },
  };

  if (requestBody && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    requestOptions.body = JSON.stringify(requestBody);
  }

  try {
    const response = await fetch(url.toString(), requestOptions);
    
    // Try to parse as JSON, but handle cases where it might not be JSON
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text(); // Fallback to text if not JSON
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    console.error('API call failed:', error);
    // Construct a more informative error object for the UI
    if (error instanceof Error) {
        return {
            status: 'NetworkError',
            statusText: 'Failed to fetch',
            data: { message: error.message, name: error.name, stack: error.stack },
            headers: {},
        };
    }
    throw error; // Re-throw if it's not a standard Error object
  }
};

