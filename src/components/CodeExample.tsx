
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface CodeExampleProps {
  apiId: string;
}

export const CodeExample = ({ apiId }: CodeExampleProps) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getCodeExamples = (apiId: string) => {
    const examples = {
      "flight-search": {
        javascript: `// Flight Search API - JavaScript Example
const searchFlights = async () => {
  const response = await fetch('https://api.condor.com/v2/flights/search', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    params: new URLSearchParams({
      origin: 'FRA',
      destination: 'JFK', 
      departure_date: '2024-06-15',
      passengers: '2'
    })
  });
  
  const flights = await response.json();
  console.log(flights);
};

searchFlights();`,
        python: `# Flight Search API - Python Example
import requests

def search_flights():
    url = "https://api.condor.com/v2/flights/search"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    params = {
        "origin": "FRA",
        "destination": "JFK",
        "departure_date": "2024-06-15", 
        "passengers": 2
    }
    
    response = requests.get(url, headers=headers, params=params)
    flights = response.json()
    print(flights)

search_flights()`,
        curl: `# Flight Search API - cURL Example
curl -X GET "https://api.condor.com/v2/flights/search" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -G \\
  -d "origin=FRA" \\
  -d "destination=JFK" \\
  -d "departure_date=2024-06-15" \\
  -d "passengers=2"`
      },
      "booking": {
        javascript: `// Booking API - JavaScript Example  
const createBooking = async () => {
  const bookingData = {
    flight_id: "DE1234",
    passenger_details: [{
      first_name: "John",
      last_name: "Doe",
      date_of_birth: "1990-01-01",
      passport_number: "ABC123456"
    }],
    contact_info: {
      email: "john.doe@example.com",
      phone: "+49123456789"
    }
  };

  const response = await fetch('https://api.condor.com/v3/bookings/create', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData)
  });
  
  const booking = await response.json();
  console.log('Booking created:', booking);
};

createBooking();`,
        python: `# Booking API - Python Example
import requests
import json

def create_booking():
    url = "https://api.condor.com/v3/bookings/create"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    
    booking_data = {
        "flight_id": "DE1234",
        "passenger_details": [{
            "first_name": "John",
            "last_name": "Doe", 
            "date_of_birth": "1990-01-01",
            "passport_number": "ABC123456"
        }],
        "contact_info": {
            "email": "john.doe@example.com",
            "phone": "+49123456789"
        }
    }
    
    response = requests.post(url, headers=headers, json=booking_data)
    booking = response.json()
    print("Booking created:", booking)

create_booking()`,
        curl: `# Booking API - cURL Example
curl -X POST "https://api.condor.com/v3/bookings/create" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "flight_id": "DE1234",
    "passenger_details": [{
      "first_name": "John",
      "last_name": "Doe",
      "date_of_birth": "1990-01-01", 
      "passport_number": "ABC123456"
    }],
    "contact_info": {
      "email": "john.doe@example.com",
      "phone": "+49123456789"
    }
  }'`
      }
    };

    return examples[apiId as keyof typeof examples] || examples["flight-search"];
  };

  const examples = getCodeExamples(apiId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>

            {Object.entries(examples).map(([language, code]) => (
              <TabsContent key={language} value={language}>
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <code>{code}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-white"
                    onClick={() => copyToClipboard(code, language)}
                  >
                    {copiedCode === language ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SDK Libraries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">JavaScript/Node.js</h4>
              <code className="block bg-gray-100 p-2 rounded text-sm">
                npm install @condor/api-client
              </code>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Python</h4>
              <code className="block bg-gray-100 p-2 rounded text-sm">
                pip install condor-api-python
              </code>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">PHP</h4>
              <code className="block bg-gray-100 p-2 rounded text-sm">
                composer require condor/api-client
              </code>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Java</h4>
              <code className="block bg-gray-100 p-2 rounded text-sm">
                implementation 'com.condor:api-client:1.0.0'
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
