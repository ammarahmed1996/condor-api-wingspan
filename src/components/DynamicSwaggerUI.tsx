
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight, Play, Upload, FileText } from "lucide-react";
import { parseYamlSpec, makeApiCall, OpenAPISpec } from "@/utils/yamlParser";
import { useToast } from "@/hooks/use-toast";

interface DynamicSwaggerUIProps {
  apiId: string;
}

export const DynamicSwaggerUI = ({ apiId }: DynamicSwaggerUIProps) => {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [yamlInput, setYamlInput] = useState<string>("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
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
      const baseUrl = spec?.servers?.[0]?.url || 'https://api.example.com';
      const params = parameterValues[endpointId] || {};
      const requestBody = requestBodies[endpointId];

      const response = await makeApiCall(baseUrl, path, method, params, requestBody);
      
      setResponses(prev => ({
        ...prev,
        [endpointId]: response
      }));

      toast({
        title: "Request successful",
        description: `${method.toUpperCase()} ${path} - Status: ${response.status}`,
      });
    } catch (error) {
      toast({
        title: "Request failed",
        description: `Error making API call: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [endpointId]: false }));
    }
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

      {Object.entries(spec.paths).map(([path, pathItem]) =>
        Object.entries(pathItem).map(([method, operation]) => {
          const endpointId = `${method}-${path}`;
          const isExpanded = expandedSections.has(endpointId);
          const currentResponse = responses[endpointId];
          const isLoading = loading[endpointId];

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
                        <TabsTrigger value="parameters">Parameters</TabsTrigger>
                        <TabsTrigger value="responses">Responses</TabsTrigger>
                        <TabsTrigger value="try">Try it out</TabsTrigger>
                      </TabsList>

                      <TabsContent value="parameters" className="space-y-4">
                        {operation.parameters && operation.parameters.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-2">Name</th>
                                  <th className="text-left p-2">Type</th>
                                  <th className="text-left p-2">In</th>
                                  <th className="text-left p-2">Required</th>
                                  <th className="text-left p-2">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {operation.parameters.map((param, index) => (
                                  <tr key={index} className="border-b">
                                    <td className="p-2 font-mono">{param.name}</td>
                                    <td className="p-2">{param.schema?.type || 'string'}</td>
                                    <td className="p-2">{param.in}</td>
                                    <td className="p-2">
                                      {param.required ? (
                                        <Badge variant="destructive">Required</Badge>
                                      ) : (
                                        <Badge variant="secondary">Optional</Badge>
                                      )}
                                    </td>
                                    <td className="p-2">{param.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-gray-500">No parameters</p>
                        )}
                      </TabsContent>

                      <TabsContent value="responses" className="space-y-4">
                        <div className="space-y-3">
                          {Object.entries(operation.responses).map(([code, response]) => (
                            <div key={code} className="flex items-center space-x-3">
                              <Badge 
                                className={
                                  code.startsWith('2') ? 'bg-green-100 text-green-800' :
                                  code.startsWith('4') ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }
                              >
                                {code}
                              </Badge>
                              <span className="text-sm">{response.description}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="try" className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-3">Try this endpoint</h4>
                          <div className="space-y-3">
                            {operation.parameters?.map((param, index) => (
                              <div key={index}>
                                <label className="block text-sm font-medium mb-1">
                                  {param.name} {param.required && <span className="text-red-500">*</span>}
                                </label>
                                <input 
                                  type="text" 
                                  placeholder={param.description}
                                  className="w-full p-2 border rounded text-sm"
                                  onChange={(e) => updateParameterValue(endpointId, param.name, e.target.value)}
                                />
                              </div>
                            ))}
                            
                            {operation.requestBody && (
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Request Body {operation.requestBody.required && <span className="text-red-500">*</span>}
                                </label>
                                <Textarea
                                  placeholder="Enter JSON request body"
                                  rows={4}
                                  onChange={(e) => {
                                    try {
                                      const body = JSON.parse(e.target.value);
                                      updateRequestBody(endpointId, body);
                                    } catch {
                                      // Invalid JSON, ignore
                                    }
                                  }}
                                />
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
                                <h5 className="font-semibold">Response:</h5>
                                <div className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
                                  <pre>{JSON.stringify(currentResponse, null, 2)}</pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
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
