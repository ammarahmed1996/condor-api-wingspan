
import { ArrowLeft, ExternalLink, Code, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DynamicSwaggerUI } from "@/components/DynamicSwaggerUI";
import { CodeExample } from "@/components/CodeExample";

interface ApiDocumentationProps {
  apiId: string;
  onBack: () => void;
}

export const ApiDocumentation = ({ apiId, onBack }: ApiDocumentationProps) => {
  const apiInfo = {
    "flight-search": {
      title: "Flight Search API",
      description: "Search for available flights with flexible filters and real-time pricing",
      version: "v2.1",
      baseUrl: "https://api.condor.com/v2/flights"
    },
    "booking": {
      title: "Booking API", 
      description: "Complete booking management system for flight reservations",
      version: "v3.0",
      baseUrl: "https://api.condor.com/v3/bookings"
    },
    "payment": {
      title: "Payment API",
      description: "Secure payment processing for flight bookings",
      version: "v2.5", 
      baseUrl: "https://api.condor.com/v2/payments"
    }
  };

  const currentApi = apiInfo[apiId as keyof typeof apiInfo] || apiInfo["flight-search"];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to APIs</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{currentApi.title}</h1>
          <p className="text-gray-600">{currentApi.description}</p>
        </div>
      </div>

      {/* API Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Overview</CardTitle>
              <CardDescription>Version {currentApi.version}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Guide
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Postman
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-1">Base URL</h4>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {currentApi.baseUrl}
              </code>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Authentication</h4>
              <span className="text-sm text-gray-600">API Key (Header)</span>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Rate Limit</h4>
              <span className="text-sm text-gray-600">1000 requests/hour</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Tabs */}
      <Tabs defaultValue="swagger" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="swagger">API Reference</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
          <TabsTrigger value="guides">Integration Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="swagger" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Dynamic Swagger UI</span>
              </CardTitle>
              <CardDescription>
                Import your OpenAPI/Swagger YAML specification and test APIs directly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicSwaggerUI apiId={apiId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="mt-6">
          <CodeExample apiId={apiId} />
        </TabsContent>

        <TabsContent value="guides" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
              <CardDescription>Step-by-step guide to integrate this API</CardDescription>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h3>Quick Start</h3>
              <p>Get started with the {currentApi.title} in just a few steps:</p>
              <ol>
                <li>Obtain your API key from the developer dashboard</li>
                <li>Set up authentication headers in your requests</li>
                <li>Make your first API call using the examples provided</li>
                <li>Handle responses and error codes appropriately</li>
              </ol>
              
              <h3>Best Practices</h3>
              <ul>
                <li>Always use HTTPS for API requests</li>
                <li>Implement proper error handling and retry logic</li>
                <li>Cache responses when appropriate to reduce API calls</li>
                <li>Monitor your API usage to stay within rate limits</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
