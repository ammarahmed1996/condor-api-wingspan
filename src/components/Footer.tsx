
import { Plane, Github, Twitter, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-amber-500 rounded-full p-2">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Condor Airlines</span>
            </div>
            <p className="text-gray-400 text-sm">
              Leading European leisure airline providing comprehensive APIs for developers worldwide.
            </p>
            <div className="flex space-x-4">
              <Github className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Mail className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* APIs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">APIs</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Flight Search</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Booking</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Payment</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Customer</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Check-in</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition-colors">SDKs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status Page</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Condor Airlines Developer Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
