
import { useState } from "react";
import { Header } from "@/components/Header";
import { ApiGrid } from "@/components/ApiGrid";
import { ApiDocumentation } from "@/components/ApiDocumentation";
import { Footer } from "@/components/Footer";

const Index = () => {
  const [selectedApi, setSelectedApi] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {selectedApi ? (
          <ApiDocumentation 
            apiId={selectedApi} 
            onBack={() => setSelectedApi(null)} 
          />
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Condor Airlines Developer Portal
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Integrate with Condor's comprehensive suite of APIs to build amazing travel experiences. 
                Access flight data, booking systems, customer services, and more.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-amber-600">15+</div>
                  <div className="text-sm text-gray-600">APIs Available</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-amber-600">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime SLA</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-amber-600">24/7</div>
                  <div className="text-sm text-gray-600">Support</div>
                </div>
              </div>
            </div>

            {/* API Categories */}
            <ApiGrid onSelectApi={setSelectedApi} />

            {/* Getting Started Section */}
            <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Getting Started</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-amber-600">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Register for API Key</h3>
                  <p className="text-gray-600">Sign up for a developer account to get your API credentials</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-amber-600">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Explore APIs</h3>
                  <p className="text-gray-600">Browse our comprehensive API documentation and test endpoints</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-amber-600">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Start Building</h3>
                  <p className="text-gray-600">Integrate our APIs into your applications and go live</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
