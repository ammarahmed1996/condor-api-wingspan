import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight, Play, Upload, FileText } from "lucide-react";
import { parseYamlSpec, makeApiCall, OpenAPISpec } from "@/utils/yamlParser";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DynamicSwaggerUIProps {
  apiId: string;
}

export const DynamicSwaggerUI = ({ apiId }: DynamicSwaggerUIProps) => {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [yamlInput, setYamlInput] = useState<string>("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set());
  const [parameterValues, setParameterValues] = useState<Record<string, Record<string, any>>>({});
  const [requestBodies, setRequestBodies] = useState<Record<string, any>>({});
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleYamlUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setYamlInput(content);
        parseYaml(content);
      };
      reader.readAsText(file);
    }
  };

  const parseYaml = (yamlContent: string) => {
    try {
      const parsedSpec = parseYamlSpec(yamlContent);
      setSpec(parsedSpec);
      toast({
        title: "YAML loaded successfully",
        description: `API: ${parsedSpec.info.title} v${parsedSpec.info.version}`,
      });
    } catch (error) {
      toast({
        title: "Error parsing YAML",
        description: "Please check your YAML syntax and try again.",
        variant: "destructive",
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleSchema = (schemaName: string) => {
    const newExpanded = new Set(expandedSchemas);
    if (newExpanded.has(schemaName)) {
      newExpanded.delete(schemaName);
    } else {
      newExpanded.add(schemaName);
    }
    setExpandedSchemas(newExpanded);
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET": return "bg-blue-100 text-blue-800";
      case "POST": return "bg-green-100 text-green-800";
      case "PUT": return "bg-yellow-100 text-yellow-800";
      case "DELETE": return "bg-red-100 text-red-800";
      case "PATCH": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const updateParameterValue = (endpointId: string, paramName: string, value: any) => {
    setParameterValues(prev => ({
      ...prev,
      [endpointId]: {
        ...prev[endpointId],
        [paramName]: value
      }
    }));
  };

  const updateRequestBody = (endpointId: string, body: any) => {
    setRequestBodies(prev => ({
      ...prev,
      [endpointId]: body
    }));
  };

  const executeRequest = async (path: string, method: string, operation: any) => {
    const endpointId = `${method}-${path}`;
    setLoading(prev => ({ ...prev, [endpointId]: true }));

    try {
      const baseUrl = spec?.servers?.[0]?.url || '';
      const params = parameterValues[endpointId] || {};
      const requestBody = requestBodies[endpointId];
      
      let finalPath = path; // Changed const to let
      const queryParams = new URLSearchParams();
      if (operation.parameters) {
        operation.parameters.forEach((param: any) => {
          if (param.in === 'query' && params[param.name] !== undefined) {
            queryParams.append(param.name, params[param.name]);
          }
          if (param.in === 'path' && params[param.name] !== undefined) {
            finalPath = finalPath.replace(`{${param.name}}`, encodeURIComponent(params[param.name]));
          }
        });
      }
      const queryString = queryParams.toString();
      if (queryString) {
        finalPath += `?${queryString}`;
      }

      const response = await makeApiCall(baseUrl, finalPath, method, {}, requestBody);
      
      setResponses(prev => ({
        ...prev,
        [endpointId]: response
      }));

      toast({
        title: "Request successful",
        description: `${method.toUpperCase()} ${path} - Status: ${response.status}`,
      });
    } catch (error: any) {
      toast({
        title: "Request failed",
        description: `Error making API call: ${error.message || error.toString()}`,
        variant: "destructive",
      });
       setResponses(prev => ({
        ...prev,
        [endpointId]: { error: error.message || error.toString(), status: 'Error' }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [endpointId]: false }));
    }
  };

  const renderSchemaProperty = (property: any, propertyName: string, level: number = 0, isRequired?: boolean) => {
    const indent = level * 20;
    
    return (
      <div key={propertyName} style={{ marginLeft: `${indent}px` }} className="py-2 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center space-x-2">
          <code className="text-sm font-mono text-blue-600">
            {propertyName}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </code>
          <Badge variant="outline" className="text-xs">
            {property.type || (property.$ref ? 'object (ref)' : 'object')}
          </Badge>
          {isRequired && (
            <Badge variant="outline" className="text-xs text-red-600 border-red-600">Required</Badge>
          )}
        </div>
        {property.description && (
          <p className="text-xs text-gray-600 mt-1">{property.description}</p>
        )}
        {property.example && (
          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded mt-1 block">
            Example: {typeof property.example === 'object' ? JSON.stringify(property.example) : property.example}
          </code>
        )}
        {property.$ref && (
            <p className="text-xs text-gray-500 mt-1">Refers to: <code className="text-purple-600">{property.$ref}</code></p>
        )}
        {property.items && property.items.$ref && (
             <p className="text-xs text-gray-500 mt-1">Items refer to: <code className="text-purple-600">{property.items.$ref}</code></p>
        )}
        {property.properties && (
          <div className="mt-2">
            {Object.entries(property.properties).map(([propName, propData]) =>
              renderSchemaProperty(propData as any, propName, level + 1, (property.required || []).includes(propName))
            )}
          </div>
        )}
         {property.items && property.items.properties && ( // Handle array of objects
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Item Properties:</p>
            {Object.entries(property.items.properties).map(([propName, propData]) =>
              renderSchemaProperty(propData as any, propName, level + 1, (property.items.required || []).includes(propName))
            )}
          </div>
        )}
      </div>
    );
  };

  const getReferencedSchemaNames = (operation: any, currentSpec: OpenAPISpec | null): string[] => {
    if (!currentSpec || !currentSpec.components?.schemas) return [];
    const schemaNames = new Set<string>();
    const extractSchemaName = (ref?: string): string | null => {
      if (ref && ref.startsWith('#/components/schemas/')) {
        return ref.split('/').pop()!;
      }
      return null;
    };
  
    // Check requestBody
    if (operation.requestBody?.content) {
      Object.values(operation.requestBody.content).forEach((mediaType: any) => {
        let schemaName = extractSchemaName(mediaType.schema?.$ref);
        if (schemaName) schemaNames.add(schemaName);
        // Check for array items ref
        schemaName = extractSchemaName(mediaType.schema?.items?.$ref);
        if (schemaName) schemaNames.add(schemaName);
      });
    }
  
    // Check responses
    if (operation.responses) {
      Object.values(operation.responses).forEach((response: any) => {
        if (response.content) {
          Object.values(response.content).forEach((mediaType: any) => {
            let schemaName = extractSchemaName(mediaType.schema?.$ref);
            if (schemaName) schemaNames.add(schemaName);
            // Check for array items ref
            schemaName = extractSchemaName(mediaType.schema?.items?.$ref);
            if (schemaName) schemaNames.add(schemaName);
          });
        }
      });
    }
    return Array.from(schemaNames);
  };

  if (!spec) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Import OpenAPI/Swagger Specification</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload YAML File</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".yaml,.yml"
                onChange={handleYamlUpload}
                className="hidden"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Or paste YAML content:</label>
              <Textarea
                placeholder="Paste your OpenAPI/Swagger YAML specification here..."
                value={yamlInput}
                onChange={(e) => setYamlInput(e.target.value)}
                rows={10}
              />
              <Button 
                onClick={() => parseYaml(yamlInput)}
                disabled={!yamlInput.trim()}
              >
                Parse YAML
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{spec.info.title}</CardTitle>
          <p className="text-gray-600">{spec.info.description}</p>
          <Badge variant="outline">Version {spec.info.version}</Badge>
        </CardHeader>
      </Card>

      {/* Schemas Section (Global) */}
      {spec.components?.schemas && Object.keys(spec.components.schemas).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Global Schemas</CardTitle>
            <p className="text-gray-600">Data models and schema definitions used across the API</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(spec.components.schemas).map(([schemaName, schemaDataUntyped]) => {
                const schemaData = schemaDataUntyped as any;
                const isExpanded = expandedSchemas.has(schemaName);
                
                return (
                  <Card key={schemaName} className="border">
                    <CardHeader 
                      className="cursor-pointer hover:bg-gray-50 py-3"
                      onClick={() => toggleSchema(schemaName)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <code className="text-lg font-mono">{schemaName}</code>
                          <Badge variant="secondary">Schema</Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent>
                        <div className="space-y-4">
                          {schemaData.description && (
                            <p className="text-gray-600">{schemaData.description}</p>
                          )}
                          
                          <Tabs defaultValue="properties" className="w-full">
                            <TabsList>
                              <TabsTrigger value="properties">Properties</TabsTrigger>
                              <TabsTrigger value="example">Example</TabsTrigger>
                              <TabsTrigger value="raw">Raw Schema</TabsTrigger>
                            </TabsList>

                            <TabsContent value="properties" className="space-y-2">
                              {schemaData.properties ? (
                                <div className="border rounded-lg p-4">
                                  {Object.entries(schemaData.properties).map(([propName, propDataUntyped]) => {
                                    const propData = propDataUntyped as any;
                                    return renderSchemaProperty(propData, propName, 0, (schemaData.required || []).includes(propName));
                                  })}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm">No properties defined</p>
                              )}
                            </TabsContent>

                            <TabsContent value="example" className="space-y-2">
                              {schemaData.example ? (
                                <div className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
                                  <pre>{JSON.stringify(schemaData.example, null, 2)}</pre>
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm">No example provided</p>
                              )}
                            </TabsContent>

                            <TabsContent value="raw" className="space-y-2">
                              <div className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
                                <pre>{JSON.stringify(schemaData, null, 2)}</pre>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Endpoints section */}
      {Object.entries(spec.paths).map(([path, pathItem]) =>
        Object.entries(pathItem).map(([method, operationUntyped]) => {
          const operation = operationUntyped as any; // Type assertion
          const endpointId = `${method}-${path}`;
          const isExpanded = expandedSections.has(endpointId);
          const currentResponse = responses[endpointId];
          const isLoading = loading[endpointId];
          const referencedSchemaNames = getReferencedSchemaNames(operation, spec);

          return (
            <Card key={endpointId} className="border">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSection(endpointId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={getMethodColor(method)}>
                      {method.toUpperCase()}
                    </Badge>
                    <code className="text-sm font-mono">{path}</code>
                    <span className="text-sm text-gray-600">{operation.summary}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  <div className="space-y-6">
                    {operation.description && (
                      <p className="text-gray-600">{operation.description}</p>
                    )}

                    <Tabs defaultValue="parameters" className="w-full">
                      <TabsList>
                        <TabsTrigger value="parameters & try it out">Parameters & Try it out</TabsTrigger>
                        <TabsTrigger value="responses">Responses</TabsTrigger>
                        {referencedSchemaNames.length > 0 && (
                          <TabsTrigger value="endpoint_schemas">Models</TabsTrigger>
                        )}
                      </TabsList>

                      <TabsContent value="parameters" className="space-y-6 pt-4">
                        {/* Parameters Definition Table */}
                        {operation.parameters && operation.parameters.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-md">Parameter Definitions</h4>
                            <div className="overflow-x-auto border rounded-lg">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr className="border-b">
                                    <th className="text-left p-2 font-medium">Name</th>
                                    <th className="text-left p-2 font-medium">Type</th>
                                    <th className="text-left p-2 font-medium">In</th>
                                    <th className="text-left p-2 font-medium">Required</th>
                                    <th className="text-left p-2 font-medium">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {operation.parameters.map((param: any, index: number) => (
                                    <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50/50">
                                      <td className="p-2 font-mono">
                                        {param.name}
                                        {param.required && <span className="text-red-500 ml-1">*</span>}
                                      </td>
                                      <td className="p-2">{param.schema?.type || 'string'}</td>
                                      <td className="p-2">{param.in}</td>
                                      <td className="p-2">
                                        {param.required ? (
                                          <Badge variant="destructive" className="text-xs">Required</Badge>
                                        ) : (
                                          <Badge variant="secondary" className="text-xs">Optional</Badge>
                                        )}
                                      </td>
                                      <td className="p-2">{param.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        
                        {/* "Try it out" section integrated here */}
                        <div className="bg-gray-50 p-4 rounded-lg ring-1 ring-inset ring-gray-200">
                          <h4 className="font-semibold mb-3 text-md">Execute Request</h4>
                          <div className="space-y-4">
                            {operation.parameters?.filter((p:any) => ['query', 'path'].includes(p.in)).map((param: any, index: number) => (
                              <div key={index}>
                                <Label htmlFor={`${endpointId}-${param.name}`} className="block text-sm font-medium mb-1">
                                  {param.name} ({param.in})
                                  {param.required && <span className="text-red-500 ml-0.5">*</span>}
                                </Label>
                                <Input 
                                  id={`${endpointId}-${param.name}`}
                                  type={param.schema?.type === 'integer' || param.schema?.type === 'number' ? 'number' : 'text'}
                                  placeholder={param.description || `Enter ${param.name}`}
                                  className="w-full p-2 border rounded text-sm"
                                  value={parameterValues[endpointId]?.[param.name] || ''}
                                  onChange={(e) => updateParameterValue(endpointId, param.name, e.target.value)}
                                />
                              </div>
                            ))}
                            
                            {operation.requestBody && (
                              <div>
                                <Label htmlFor={`${endpointId}-requestBody`} className="block text-sm font-medium mb-1">
                                  Request Body
                                  {operation.requestBody.required && <span className="text-red-500 ml-0.5">*</span>}
                                  {operation.requestBody.content && Object.keys(operation.requestBody.content).map(ct => <Badge key={ct} variant="outline" className="ml-2 text-xs">{ct}</Badge>)}
                                </Label>
                                <Textarea
                                  id={`${endpointId}-requestBody`}
                                  placeholder="Enter JSON request body"
                                  rows={5}
                                  className="text-sm font-mono"
                                  value={requestBodies[endpointId] ? JSON.stringify(requestBodies[endpointId], null, 2) : ''}
                                  onChange={(e) => {
                                    try {
                                      const body = e.target.value ? JSON.parse(e.target.value) : undefined;
                                      updateRequestBody(endpointId, body);
                                    } catch {
                                      // Allow invalid JSON temporarily for user input
                                      // updateRequestBody(endpointId, e.target.value); // Or handle parsing error state
                                    }
                                  }}
                                />
                                 {(operation.requestBody?.content?.['application/json']?.schema?.$ref || operation.requestBody?.content?.['application/json']?.schema?.items?.$ref) && (
                                   <p className="text-xs text-gray-500 mt-1">
                                     Schema: <code className="text-purple-600">{operation.requestBody.content['application/json'].schema.$ref || operation.requestBody.content['application/json'].schema.items.$ref}</code>
                                   </p>
                                 )}
                              </div>
                            )}
                            
                            <Button 
                              className="w-full mt-4"
                              onClick={() => executeRequest(path, method, operation)}
                              disabled={isLoading}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              {isLoading ? 'Executing...' : 'Execute Request'}
                            </Button>

                            {currentResponse && (
                              <div className="mt-4 space-y-2">
                                <h5 className="font-semibold">
                                  Response 
                                  <Badge 
                                      variant={currentResponse.status === 'Error' ? 'destructive' : (currentResponse.status >= 200 && currentResponse.status < 300 ? 'default' : 'outline')} 
                                      className="ml-2"
                                  >
                                    Status: {currentResponse.status}
                                  </Badge>
                                </h5>
                                <div className={`p-3 rounded text-sm overflow-x-auto ${currentResponse.status === 'Error' ? 'bg-red-50 text-red-700' : 'bg-gray-900 text-green-400'}`}>
                                  <pre>{JSON.stringify(currentResponse, null, 2)}</pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="responses" className="space-y-4 pt-4">
                        <div className="space-y-3">
                          {Object.entries(operation.responses).map(([code, response]: [string, any]) => (
                            <Card key={code} className="p-3">
                              <div className="flex items-center space-x-3 mb-1">
                                <Badge 
                                  className={
                                    code.startsWith('2') ? 'bg-green-100 text-green-800' :
                                    code.startsWith('4') ? 'bg-yellow-100 text-yellow-800' :
                                    code.startsWith('5') ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }
                                >
                                  {code}
                                </Badge>
                                <span className="text-sm font-medium">{response.description}</span>
                              </div>
                              {response.content && Object.entries(response.content).map(([contentType, contentData]: [string, any]) => (
                                <div key={contentType} className="ml-4 mt-1">
                                  <Badge variant="outline" className="text-xs">{contentType}</Badge>
                                  {contentData.schema?.$ref && (
                                    <p className="text-xs text-gray-500 mt-0.5">Schema: <code className="text-purple-600">{contentData.schema.$ref}</code></p>
                                  )}
                                   {contentData.schema?.items?.$ref && ( // For array of schemas
                                    <p className="text-xs text-gray-500 mt-0.5">Items Schema: <code className="text-purple-600">{contentData.schema.items.$ref}</code></p>
                                  )}
                                </div>
                              ))}
                            </Card>
                          ))}
                        </div>
                      </TabsContent>

                      {referencedSchemaNames.length > 0 && (
                        <TabsContent value="endpoint_schemas" className="space-y-4 pt-4">
                          <h4 className="font-semibold mb-2 text-md">Referenced Models for this Endpoint</h4>
                          {referencedSchemaNames.map(schemaName => {
                            const schemaData = spec.components?.schemas?.[schemaName] as any;
                            if (!schemaData) return <p key={schemaName} className="text-sm text-red-500">Schema <code className="font-mono">{schemaName}</code> not found in components.</p>;
                            
                            return (
                              <Card key={schemaName} className="border">
                                <CardHeader className="py-3 bg-gray-50/50">
                                  <div className="flex items-center space-x-3">
                                    <code className="text-md font-mono">{schemaName}</code>
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-3">
                                  {schemaData.description && (
                                    <p className="text-gray-600 text-sm mb-2">{schemaData.description}</p>
                                  )}
                                  {schemaData.properties ? (
                                    <div className="border rounded-lg p-3">
                                      {Object.entries(schemaData.properties).map(([propName, propDataUntyped]) => {
                                        const propData = propDataUntyped as any;
                                        return renderSchemaProperty(propData, propName, 0, (schemaData.required || []).includes(propName));
                                      })}
                                    </div>
                                  ) : schemaData.type === 'array' && schemaData.items ? ( // Handle array schemas
                                      <div className="border rounded-lg p-3">
                                        <p className="text-sm font-medium mb-1">Array of: {schemaData.items.type || schemaData.items.$ref}</p>
                                        {schemaData.items.$ref && <p className="text-xs text-gray-500 mb-2">Refers to: <code className="text-purple-600">{schemaData.items.$ref}</code></p>}
                                        {schemaData.items.properties && Object.entries(schemaData.items.properties).map(([propName, propDataUntyped]) => {
                                           const propData = propDataUntyped as any;
                                           return renderSchemaProperty(propData, propName, 0, (schemaData.items.required || []).includes(propName));
                                        })}
                                      </div>
                                  ) : (
                                    <p className="text-gray-500 text-sm">No properties defined for this schema, or it's a primitive type.</p>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </TabsContent>
                      )}
                    </Tabs>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
};
