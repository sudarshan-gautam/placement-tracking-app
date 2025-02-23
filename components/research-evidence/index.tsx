'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  Calendar, 
  Link as LinkIcon, 
  Download, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  FileText,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { ResearchEvidence } from '@/types/competency';

interface ResearchEvidenceViewerProps {
  competencyName: string;
  researchEvidence: ResearchEvidence[];
  onClose: () => void;
}

export const ResearchEvidenceViewer: React.FC<ResearchEvidenceViewerProps> = ({
  competencyName,
  researchEvidence,
  onClose
}) => {
  const [expandedEvidence, setExpandedEvidence] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'evidence' | 'implementation' | 'impact'>('evidence');

  const getAlignmentColor = (alignment: number) => {
    if (alignment >= 80) return 'text-green-600';
    if (alignment >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getImplementationStatus = (evidence: ResearchEvidence) => {
    const status = {
      implemented: evidence.alignment >= 80,
      inProgress: evidence.alignment >= 60 && evidence.alignment < 80,
      planned: evidence.alignment < 60
    };
    return status;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'implementation':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="text-sm font-medium text-green-900">Implemented</h4>
                <p className="text-2xl font-bold text-green-600">
                  {researchEvidence.filter(e => getImplementationStatus(e).implemented).length}
                </p>
                <p className="text-sm text-green-700">research findings</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-900">In Progress</h4>
                <p className="text-2xl font-bold text-yellow-600">
                  {researchEvidence.filter(e => getImplementationStatus(e).inProgress).length}
                </p>
                <p className="text-sm text-yellow-700">being integrated</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="text-sm font-medium text-orange-900">Planned</h4>
                <p className="text-2xl font-bold text-orange-600">
                  {researchEvidence.filter(e => getImplementationStatus(e).planned).length}
                </p>
                <p className="text-sm text-orange-700">to be implemented</p>
              </div>
            </div>
            <div className="space-y-4">
              {researchEvidence.map(evidence => (
                <Card key={evidence.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{evidence.source}</h4>
                        <p className="text-sm text-gray-500">Implementation Status</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        getImplementationStatus(evidence).implemented
                          ? 'bg-green-100 text-green-800'
                          : getImplementationStatus(evidence).inProgress
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {getImplementationStatus(evidence).implemented
                          ? 'Implemented'
                          : getImplementationStatus(evidence).inProgress
                          ? 'In Progress'
                          : 'Planned'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Implementation Date: {evidence.datePublished}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{evidence.impact}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 'impact':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-2">Impact Overview</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Average Alignment</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(
                      researchEvidence.reduce((acc, curr) => acc + curr.alignment, 0) /
                      researchEvidence.length
                    )}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Evidence Quality</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {researchEvidence.filter(e => e.alignment >= 80).length} high-quality
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {researchEvidence.map(evidence => (
                <Card key={evidence.id}>
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h4 className="font-medium">{evidence.source}</h4>
                      <p className="text-sm text-gray-500">Impact Analysis</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Key Findings</p>
                        <p className="text-sm text-gray-600">{evidence.findings}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Practice Impact</p>
                        <p className="text-sm text-gray-600">{evidence.impact}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${evidence.alignment}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{evidence.alignment}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            {researchEvidence.map((evidence) => (
              <Card key={evidence.id} className="overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedEvidence(expandedEvidence === evidence.id ? null : evidence.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{evidence.source}</h3>
                      <p className="text-sm text-gray-500">Published: {evidence.datePublished}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${getAlignmentColor(evidence.alignment)}`}>
                        {evidence.alignment}% Aligned
                      </span>
                      {expandedEvidence === evidence.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedEvidence === evidence.id && (
                  <div className="px-4 pb-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Key Findings</h4>
                        <p className="text-sm text-gray-600 mt-1">{evidence.findings}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Impact on Practice</h4>
                        <p className="text-sm text-gray-600 mt-1">{evidence.impact}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-full">
                          <FileText className="h-4 w-4" />
                          View Full Paper
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-700 border border-green-200 rounded-full">
                          <Download className="h-4 w-4" />
                          Download PDF
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:text-purple-700 border border-purple-200 rounded-full">
                          <LinkIcon className="h-4 w-4" />
                          Cite Source
                        </button>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Implementation Checklist</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                            <span className="text-sm text-gray-600">Review current practice against research findings</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500 mt-1" />
                            <span className="text-sm text-gray-600">Identify areas for adaptation based on evidence</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-blue-500 mt-1" />
                            <span className="text-sm text-gray-600">Plan implementation timeline</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Research Evidence
              </h2>
              <p className="text-gray-600">Evidence for {competencyName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'evidence'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Evidence
            </button>
            <button
              onClick={() => setActiveTab('implementation')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'implementation'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Implementation
            </button>
            <button
              onClick={() => setActiveTab('impact')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'impact'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Impact
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {renderTabContent()}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-700"
            >
              Close
            </button>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700">
                <ExternalLink className="h-4 w-4" />
                Export All
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="h-4 w-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 