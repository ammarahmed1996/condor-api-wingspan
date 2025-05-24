
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Calendar, 
  CreditCard, 
  Users, 
  MapPin, 
  Luggage,
  Plane,
  Bell,
  BarChart3,
  Settings
} from "lucide-react";

interface ApiGridProps {
  onSelectApi: (apiId: string) => void;
}

export const ApiGrid = ({ onSelectApi }: ApiGridProps) => {
  const apiCategories = [
    {
      id: "flight-search",
      title: "Flight Search API",
      description: "Search for available flights, schedules, and pricing",
      icon: Search,
      version: "v2.1",
      status: "stable",
      endpoints: 8
    },
    {
      id: "booking",
      title: "Booking API",
      description: "Create, modify, and manage flight reservations",
      icon: Calendar,
      version: "v3.0",
      status: "stable",
      endpoints: 12
    },
    {
      id: "payment",
      title: "Payment API",
      description: "Process payments and manage billing information",
      icon: CreditCard,
      version: "v2.5",
      status: "stable",
      endpoints: 6
    },
    {
      id: "customer",
      title: "Customer API",
      description: "Manage customer profiles and preferences",
      icon: Users,
      version: "v2.0",
      status: "stable",
      endpoints: 10
    },
    {
      id: "airports",
      title: "Airports API",
      description: "Get airport information, codes, and facilities",
      icon: MapPin,
      version: "v1.8",
      status: "stable",
      endpoints: 5
    },
    {
      id: "baggage",
      title: "Baggage API",
      description: "Track baggage and manage allowances",
      icon: Luggage,
      version: "v1.5",
      status: "stable",
      endpoints: 7
    },
    {
      id: "check-in",
      title: "Check-in API",
      description: "Online check-in and seat selection services",
      icon: Plane,
      version: "v2.2",
      status: "stable",
      endpoints: 9
    },
    {
      id: "notifications",
      title: "Notifications API",
      description: "Send flight updates and notifications",
      icon: Bell,
      version: "v1.3",
      status: "beta",
      endpoints: 4
    },
    {
      id: "analytics",
      title: "Analytics API",
      description: "Access flight statistics and trends data",
      icon: BarChart3,
      version: "v1.0",
      status: "beta",
      endpoints: 6
    },
    {
      id: "admin",
      title: "Admin API",
      description: "Administrative functions and system management",
      icon: Settings,
      version: "v2.3",
      status: "stable",
      endpoints: 15
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "bg-green-100 text-green-800";
      case "beta":
        return "bg-blue-100 text-blue-800";
      case "deprecated":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {apiCategories.map((api) => {
        const IconComponent = api.icon;
        return (
          <Card 
            key={api.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-amber-400"
            onClick={() => onSelectApi(api.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <IconComponent className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{api.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{api.version}</Badge>
                      <Badge className={getStatusColor(api.status)}>
                        {api.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                {api.description}
              </CardDescription>
              <div className="text-sm text-gray-500">
                {api.endpoints} endpoints available
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
