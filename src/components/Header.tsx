
import { Plane, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b-2 border-amber-400">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 rounded-full p-2">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Condor Airlines</h1>
              <p className="text-xs text-gray-600">Developer Portal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#apis" className="text-gray-600 hover:text-amber-600 transition-colors">APIs</a>
            <a href="#docs" className="text-gray-600 hover:text-amber-600 transition-colors">Documentation</a>
            <a href="#support" className="text-gray-600 hover:text-amber-600 transition-colors">Support</a>
            <a href="#community" className="text-gray-600 hover:text-amber-600 transition-colors">Community</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50">
              Sign In
            </Button>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              Get API Key
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <a href="#apis" className="text-gray-600 hover:text-amber-600 transition-colors">APIs</a>
              <a href="#docs" className="text-gray-600 hover:text-amber-600 transition-colors">Documentation</a>
              <a href="#support" className="text-gray-600 hover:text-amber-600 transition-colors">Support</a>
              <a href="#community" className="text-gray-600 hover:text-amber-600 transition-colors">Community</a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50">
                  Sign In
                </Button>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                  Get API Key
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
