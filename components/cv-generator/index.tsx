'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Download, Edit, Upload } from 'lucide-react';
import { CVData, Statement } from '@/types/overview';

interface CVGeneratorProps {
  cvData: CVData;
  onGenerateCV: () => void;
  onGenerateStatement: (type: Statement['type']) => void;
}

export const CVGenerator: React.FC<CVGeneratorProps> = ({
  cvData,
  onGenerateCV,
  onGenerateStatement,
}) => {
  const [activeTab, setActiveTab] = useState<'cv' | 'statement'>('cv');

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Generator
          </CardTitle>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'cv'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('cv')}
            >
              CV
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'statement'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('statement')}
            >
              Statements
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'cv' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Qualifications</h3>
                <p className="text-sm text-gray-500">{cvData.qualifications.length} included</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Experience</h3>
                <p className="text-sm text-gray-500">{cvData.experience.length} sessions</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Competencies</h3>
                <p className="text-sm text-gray-500">{cvData.competencies.length} areas</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Statements</h3>
                <p className="text-sm text-gray-500">{cvData.statements.length} included</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <button
                onClick={onGenerateCV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Generate CV
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                <Edit className="h-4 w-4" />
                Edit Template
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between mb-4">
              <button
                onClick={() => onGenerateStatement('personal')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="h-4 w-4" />
                Personal Statement
              </button>
              <button
                onClick={() => onGenerateStatement('professional')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Edit className="h-4 w-4" />
                Professional Statement
              </button>
            </div>

            <div className="space-y-2">
              {cvData.statements.map((statement) => (
                <div
                  key={statement.id}
                  className="p-4 border rounded-lg hover:border-blue-500 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">
                      {statement.type === 'personal' ? 'Personal' : 'Professional'} Statement
                    </h3>
                    <p className="text-sm text-gray-500">
                      Last updated: {new Date(statement.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{statement.content}</p>
                  <div className="flex gap-2 mt-2">
                    {statement.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4 border-t">
              <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                <Upload className="h-4 w-4" />
                Import Statement
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 