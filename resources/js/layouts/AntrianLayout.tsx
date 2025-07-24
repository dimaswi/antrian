import React from 'react';
import { Head } from '@inertiajs/react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AntrianLayout({ children, title = 'Sistem Antrian', description }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="h-8 w-8"
                    src="/logo.svg"
                    alt="Hospital Logo"
                  />
                </div>
                <div className="ml-4">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Sistem Antrian RS
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-lg font-mono text-blue-600">
                  {new Date().toLocaleTimeString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </>
  );
}
