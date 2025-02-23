'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  File, 
  Link as LinkIcon, 
  X, 
  CheckCircle, 
  AlertCircle,
  Search,
  BookOpen,
  ExternalLink,
  FileText,
  Target,
  Plus
} from 'lucide-react';

interface ResearchUploadProps {
  onUpload: (files: File[], metadata: ResearchMetadata) => void;
  onClose: () => void;
  competencyName?: string;
}

interface ResearchMetadata {
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi?: string;
  keywords: string[];
  relevance: string;
  methodology: string;
  findings: string;
  implications: string;
}

interface ResearchPaper {
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  abstract: string;
}

export const ResearchUpload: React.FC<ResearchUploadProps> = ({
  onUpload,
  onClose,
  competencyName
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStep, setCurrentStep] = useState<'upload' | 'metadata'>('upload');
  const [showSearch, setShowSearch] = useState(false);
  const [metadata, setMetadata] = useState<ResearchMetadata>({
    title: '',
    authors: '',
    journal: '',
    year: new Date().getFullYear().toString(),
    keywords: [],
    relevance: '',
    methodology: '',
    findings: '',
    implications: ''
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleLinkPaper = (paper: ResearchPaper) => {
    setSelectedPaper(paper);
    setMetadata({
      title: paper.title,
      authors: paper.authors,
      journal: paper.journal,
      year: paper.year.toString(),
      doi: paper.doi,
      keywords: [],
      relevance: '',
      methodology: '',
      findings: '',
      implications: ''
    });
    setCurrentStep('metadata');
  };

  const handleSubmit = useCallback(() => {
    if (currentStep === 'upload' && (files.length > 0 || selectedPaper)) {
      setCurrentStep('metadata');
    } else if (currentStep === 'metadata') {
      onUpload(files, {
        ...metadata,
        linkedPaper: selectedPaper ? {
          doi: selectedPaper.doi,
          abstract: selectedPaper.abstract
        } : undefined
      });
      setFiles([]);
      setMetadata({
        title: '',
        authors: '',
        journal: '',
        year: new Date().getFullYear().toString(),
        keywords: [],
        relevance: '',
        methodology: '',
        findings: '',
        implications: ''
      });
      setSelectedPaper(null);
    }
  }, [currentStep, files, metadata, onUpload, selectedPaper]);

  const addKeyword = useCallback(() => {
    if (keywordInput.trim() && !metadata.keywords.includes(keywordInput.trim())) {
      setMetadata(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  }, [keywordInput, metadata.keywords]);

  const removeKeyword = useCallback((keyword: string) => {
    setMetadata(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  }, []);

  const handleAddManually = () => {
    setSelectedPaper(null);
    setMetadata({
      title: '',
      authors: '',
      journal: '',
      year: new Date().getFullYear().toString(),
      keywords: [],
      relevance: '',
      methodology: '',
      findings: '',
      implications: ''
    });
    setCurrentStep('metadata');
  };

  // Sample research database with more detailed entries
  const researchDatabase: ResearchPaper[] = [
    {
      title: 'Educational Psychology Review: Classroom Management',
      authors: 'Smith, J., Johnson, M.',
      journal: 'Educational Psychology Review',
      year: 2024,
      doi: '10.1234/edupsy.2024.001',
      abstract: 'A comprehensive review of modern classroom management techniques...'
    },
    {
      title: 'Teaching and Learning Research: Assessment Methods',
      authors: 'Brown, A., Davis, R.',
      journal: 'Teaching and Learning Research',
      year: 2023,
      doi: '10.1234/tlr.2023.002',
      abstract: 'Analysis of effective assessment methods in contemporary education...'
    }
  ];

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Upload Option */}
        <Card className="hover:border-blue-500 cursor-pointer transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Research Paper
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <p className="text-sm text-gray-600">
                Drag and drop your files here, or{' '}
                <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileInput}
                    multiple
                  />
                </label>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: PDF, DOC, DOCX (up to 20MB)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Add Manually Option */}
        <Card 
          className="hover:border-blue-500 cursor-pointer transition-colors"
          onClick={handleAddManually}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Add Research Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6">
              <p className="text-sm text-gray-600 mb-2">
                Manually enter research paper details and metadata
              </p>
              <button
                className="mt-2 flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg mx-auto"
              >
                <Plus className="h-4 w-4" />
                Add Research Paper
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Selected Files</h3>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="text-sm">{file.name}</span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Database Option */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Research Database
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                placeholder="Search for research papers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              {researchDatabase.map((paper, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium">{paper.title}</p>
                      <p className="text-sm text-gray-500">{paper.authors}</p>
                      <p className="text-sm text-gray-500">{paper.journal} ({paper.year})</p>
                      <p className="text-sm text-gray-600 mt-2">{paper.abstract}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleLinkPaper(paper)}
                        className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-full"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Use This Paper
                      </button>
                      <a
                        href={`https://doi.org/${paper.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1 text-purple-600 hover:text-purple-700 border border-purple-200 rounded-full"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View on DOI
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Research Quality</p>
                <p className="text-sm text-gray-600">Ensure papers are from peer-reviewed journals or reputable sources</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Target className="h-5 w-5" />
              <div>
                <p className="font-medium">Relevance</p>
                <p className="text-sm text-gray-600">Papers should directly relate to your competency area</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Copyright</p>
                <p className="text-sm text-gray-600">Ensure you have permission to use and share the research papers</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMetadataStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Research Metadata</CardTitle>
          {selectedPaper && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Linked to paper: {selectedPaper.title}
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Authors</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={metadata.authors}
                onChange={(e) => setMetadata(prev => ({ ...prev, authors: e.target.value }))}
                placeholder="e.g., Smith, J., Johnson, M."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Journal/Source</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={metadata.journal}
                  onChange={(e) => setMetadata(prev => ({ ...prev, journal: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={metadata.year}
                  onChange={(e) => setMetadata(prev => ({ ...prev, year: e.target.value }))}
                  min="1900"
                  max={new Date().getFullYear()}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">DOI (optional)</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={metadata.doi}
                onChange={(e) => setMetadata(prev => ({ ...prev, doi: e.target.value }))}
                placeholder="e.g., 10.1234/journal.2024.001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  placeholder="Add keyword and press Enter"
                />
                <button
                  type="button"
                  onClick={addKeyword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {metadata.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Relevance to {competencyName}</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                value={metadata.relevance}
                onChange={(e) => setMetadata(prev => ({ ...prev, relevance: e.target.value }))}
                placeholder="Explain how this research relates to the competency..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Research Methodology</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                value={metadata.methodology}
                onChange={(e) => setMetadata(prev => ({ ...prev, methodology: e.target.value }))}
                placeholder="Describe the research methodology..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Key Findings</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                value={metadata.findings}
                onChange={(e) => setMetadata(prev => ({ ...prev, findings: e.target.value }))}
                placeholder="Summarize the main findings..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Implications for Practice</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                value={metadata.implications}
                onChange={(e) => setMetadata(prev => ({ ...prev, implications: e.target.value }))}
                placeholder="Describe how these findings can be applied..."
                required
              />
            </div>
          </div>

          {/* Additional fields for linked papers */}
          {selectedPaper && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Paper Details</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>DOI:</strong> {selectedPaper.doi}</p>
                <p><strong>Abstract:</strong> {selectedPaper.abstract}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                {currentStep === 'upload' ? 'Add Research Evidence' : 'Research Details'}
              </h2>
              <p className="text-gray-600">
                {currentStep === 'upload'
                  ? 'Upload research papers or link to research database'
                  : 'Add metadata for the research evidence'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {currentStep === 'metadata' && (
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">1</div>
                <span>Upload</span>
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">2</div>
                <span>Details</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {currentStep === 'upload' ? renderUploadStep() : renderMetadataStep()}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            {currentStep === 'metadata' ? (
              <button
                onClick={() => setCurrentStep('upload')}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Back
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={currentStep === 'upload' ? files.length === 0 : !metadata.title || !metadata.authors}
              className={`px-4 py-2 rounded-lg text-white ${
                (currentStep === 'upload' && files.length === 0) || 
                (currentStep === 'metadata' && (!metadata.title || !metadata.authors))
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {currentStep === 'upload' ? 'Continue' : 'Upload Evidence'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 