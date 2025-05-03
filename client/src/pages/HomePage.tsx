import React from 'react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/hooks/use-translation';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export default function HomePage() {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Logo size="md" variant="primary" />
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Features
              </a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Benefits
              </a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                About EUDR
              </a>
            </nav>
            
            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Button 
                variant="default" 
                size="sm" 
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                Book a Demo
              </Button>
              <a 
                href="/dashboard" 
                className="hidden md:inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Login 
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-8 sm:pt-12 md:pt-16 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
            {/* Left Column: Text Content */}
            <div className={cn("text-left", isRTL && "text-right")}>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-5xl lg:text-6xl mb-6">
                <span className="block text-primary-600 xl:inline">EUDR Compliance</span>{' '}
                <span className="block xl:inline">Made Simple</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg md:mt-5 md:text-xl lg:mx-0 mb-8">
                Streamline your compliance with European Union Deforestation Regulation. Our platform provides end-to-end management of due diligence statements and supply chain traceability.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-start">
                <div className="rounded-md shadow">
                  <Button
                    className="w-full md:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
                    asChild
                  >
                    <a href="/dashboard">Get Started</a>
                  </Button>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Button
                    variant="outline"
                    className="w-full md:w-auto flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Right Column: Image */}
            <div className="relative hidden md:block">
              <div className="w-full h-full rounded-lg shadow-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1267&q=80" 
                  alt="EUDR Compliance Dashboard" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for EUDR compliance
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform offers a comprehensive suite of tools designed specifically for EUDR compliance management.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="flex flex-col items-start p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Due Diligence Statements</h3>
                <p className="text-base text-gray-500">
                  Efficiently create, manage, and submit due diligence statements required by EUDR.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-start p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Supply Chain Mapping</h3>
                <p className="text-base text-gray-500">
                  Visualize and trace your entire supply chain with our intuitive mapping tools.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-start p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Risk Assessment</h3>
                <p className="text-base text-gray-500">
                  Automatically identify and manage deforestation risks in your supply chain.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col items-start p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Supplier Management</h3>
                <p className="text-base text-gray-500">
                  Efficiently onboard, assess, and manage suppliers to ensure compliance.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="flex flex-col items-start p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Document Management</h3>
                <p className="text-base text-gray-500">
                  Securely store and manage all documentation required for EUDR compliance.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="flex flex-col items-start p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Reporting</h3>
                <p className="text-base text-gray-500">
                  Generate comprehensive reports for internal and regulatory reporting needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <Logo size="md" variant="white" />
              <p className="mt-4 text-base text-gray-400">
                Simplifying EUDR compliance for businesses worldwide.
              </p>
            </div>
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Solutions</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Due Diligence</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Supply Chain Mapping</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Risk Assessment</a></li>
              </ul>
            </div>
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div className="col-span-1 md:col-span-1">
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Terms</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2023 EUDR Comply. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}