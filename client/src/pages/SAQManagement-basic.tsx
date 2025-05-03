import React from 'react';

export default function SAQManagement() {
  console.log("SAQManagement - Basic rendering");
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">SAQ Management</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium mb-4">Self-Assessment Questionnaires</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Title</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Deadline</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Suppliers</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium">EUDR Basic Compliance Assessment</div>
                    <div className="text-sm text-gray-500">
                      Basic assessment for suppliers to verify compliance with EU Deforestation Regulation
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Published
                  </span>
                </td>
                <td className="px-4 py-3">December 31, 2023</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Eco Timber Solutions
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Green Forest Products
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end items-center gap-2">
                    <button 
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-2 py-0 border border-gray-300 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button 
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-2 py-0 border border-gray-300 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium">Supply Chain Due Diligence Questionnaire</div>
                    <div className="text-sm text-gray-500">
                      Detailed assessment for supply chain transparency and traceability
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Draft
                  </span>
                </td>
                <td className="px-4 py-3">January 15, 2024</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Sustainable Woods Inc.
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end items-center gap-2">
                    <button 
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-2 py-0 border border-gray-300 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button 
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-2 py-0 border border-gray-300 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}