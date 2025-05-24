
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronRight, Play } from "lucide-react";

interface SwaggerUIProps {
  apiId: string;
}

export const SwaggerUI = ({ apiId }: SwaggerUIProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Mock API endpoints based on apiId
  const getApiEndpoints = (apiId: string) => {
    const endpoints = {
      "flight-search": [
        {
          method: "GET",
          path: "/search",
          summary: "Search for flights",
          description: "Search for available flights with various filters",
          parameters: [
            { name: "origin", type: "string", required: true, description: "Origin airport code" },
            { name: "destination", type: "string", required: true, description: "Destination airport code" },
            { name: "departure_date", type: "string", required: true, description: "Departure date (YYYY-MM-DD)" },
            { name: "return_date", type: "string", required: false, description: "Return date (YYYY-MM-DD)" },
            { name: "passengers", type: "integer", required: false, description: "Number of passengers" }
          ],
          responses: {
            "200": "List of available flights",
            "400": "Invalid request parameters",
            "404": "No flights found"
          }
        },
        {
          method: "GET", 
          path: "/schedules",
          summary: "Get flight schedules",
          description: "Retrieve flight schedules for a specific route",
          parameters: [
            { name: "route", type: "string", required: true, description: "Flight route (e.g., FRA-JFK)" },
            { name: "date_from", type: "string", required: true, description: "Start date" },
            { name: "date_to", type: "string", required: true, description: "End date" }
          ],
          responses: {
            "200": "Flight schedule data",
            "400": "Invalid parameters"
          }
        }
      ],
      "booking": [
        {
          method: "POST",
          path: "/create",
          summary: "Create booking",
          description: "Create a new flight booking",
          parameters: [
            { name: "flight_id", type: "string", required: true, description: "Flight identifier" },
            { name: "passenger_details", type: "object", required: true, description: "Passenger information" },
            { name: "contact_info", type: "object", required: true, description: "Contact details" }
          ],
          responses: {
            "201": "Booking created successfully",
            "400": "Invalid booking data",
            "409": "Flight not available"
          }
        },
        {
          method: "GET",
          path: "/{booking_id}",
          summary: "Get booking details",
          description: "Retrieve details of a specific booking",
          parameters: [
            { name: "booking_id", type: "string", required: true, description: "Booking reference" }
          ],
          responses: {
            "200": "Booking details",
            "404": "Booking not found"
          }
        }
      ]
    };

    return endpoints[apiId as keyof typeof endpoints] || endpoints["flight-search"];
  };

  const endpoints = getApiEndpoints(apiId);

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET": return "bg-blue-100 text-blue-800";
      case "POST": return "bg-green-100 text-green-800";
      case "PUT": return "bg-yellow-100 text-yellow-800";
      case "DELETE": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {endpoints.map((endpoint, index) => {
        const sectionId = `${endpoint.method}-${endpoint.path}`;
        const isExpanded = expandedSections.has(sectionId);

        return (
          <Card key={index} className="border">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection(sectionId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={getMethodColor(endpoint.method)}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono">{endpoint.path}</code>
                  <span className="text-sm text-gray-600">{endpoint.summary}</span>
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
                  <p className="text-gray-600">{endpoint.description}</p>

                  <Tabs defaultValue="parameters" className="w-full">
                    <TabsList>
                      <TabsTrigger value="parameters">Parameters</TabsTrigger>
                      <TabsTrigger value="responses">Responses</TabsTrigger>
                      <TabsTrigger value="try">Try it out</TabsTrigger>
                    </TabsList>

                    <TabsContent value="parameters" className="space-y-4">
                      <h4 className="font-semibold">Parameters</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Name</th>
                              <th className="text-left p-2">Type</th>
                              <th className="text-left p-2">Required</th>
                              <th className="text-left p-2">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {endpoint.parameters.map((param, paramIndex) => (
                              <tr key={paramIndex} className="border-b">
                                <td className="p-2 font-mono">{param.name}</td>
                                <td className="p-2">{param.type}</td>
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
                    </TabsContent>

                    <TabsContent value="responses" className="space-y-4">
                      <h4 className="font-semibold">Responses</h4>
                      <div className="space-y-3">
                        {Object.entries(endpoint.responses).map(([code, description]) => (
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
                            <span className="text-sm">{description}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="try" className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Try this endpoint</h4>
                        <div className="space-y-3">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <div key={paramIndex}>
                              <label className="block text-sm font-medium mb-1">
                                {param.name} {param.required && <span className="text-red-500">*</span>}
                              </label>
                              <input 
                                type="text" 
                                placeholder={param.description}
                                className="w-full p-2 border rounded text-sm"
                              />
                            </div>
                          ))}
                          <Button className="w-full mt-4">
                            <Play className="h-4 w-4 mr-2" />
                            Execute Request
                          </Button>
                        </div>
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
  );
};
