
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
  path: string,
  method: string,
  parameters: Record<string, any> = {},
  requestBody?: any,
  headers: Record<string, string> = {}
) => {
  const url = new URL(path, baseUrl);
  
  // Add query parameters for GET requests
  if (method.toLowerCase() === 'get' && parameters) {
    Object.entries(parameters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, value);
      }
    });
  }

  const requestOptions: RequestInit = {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  // Add request body for POST, PUT, PATCH requests
  if (requestBody && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
    requestOptions.body = JSON.stringify(requestBody);
  }

  try {
    const response = await fetch(url.toString(), requestOptions);
    const data = await response.json();
    
    return {
      status: response.status,
      statusText: response.statusText,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
