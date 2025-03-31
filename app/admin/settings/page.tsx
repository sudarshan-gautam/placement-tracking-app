'use client';

import { useState } from 'react';
import { 
  Save, RefreshCw, Shield, Bell, Users, FileText, Mail, 
  Database, Server, Lock, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

// Sample settings data
const initialSettings = {
  general: {
    siteName: 'Placement Tracking App',
    siteDescription: 'A comprehensive platform for tracking student placements and activities',
    supportEmail: 'support@placementapp.com',
    maintenanceMode: false,
  },
  security: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumber: true,
    passwordRequireSymbol: true,
    accountLockAfterAttempts: 5,
    twoFactorAuth: 'optional', // 'disabled', 'optional', 'required'
    sessionTimeout: 60, // minutes
  },
  notifications: {
    emailNotifications: true,
    activityUpdates: true,
    verificationAlerts: true,
    weeklyDigest: true,
    systemAlerts: true,
    frequency: 'immediate', // 'immediate', 'hourly', 'daily', 'weekly'
  },
  registration: {
    allowNewStudents: true,
    allowNewMentors: true,
    requireApproval: true,
    autoVerify: false,
    allowedDomains: ['university.edu', 'college.org'],
    welcomeMessage: 'Welcome to the Placement Tracking System!',
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'daily', // 'daily', 'weekly', 'monthly'
    backupTime: '02:00', // 24hr format
    retentionDays: 30,
    includeAttachments: true,
    backupLocations: ['local'],
  },
  logs: {
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    retentionDays: 90,
    logUserActivity: true,
    logAuthActivity: true,
    logSystemActivity: true,
    exportFormat: 'json', // 'json', 'csv', 'txt'
  }
};

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Added state for backup functionality
  const [isBackupInProgress, setIsBackupInProgress] = useState(false);
  const [backupComplete, setBackupComplete] = useState(false);
  const [showBackupHistory, setShowBackupHistory] = useState(false);
  const [backupHistory, setBackupHistory] = useState([
    { id: 1, date: '2023-05-15 02:00:00', status: 'completed', size: '156 MB', type: 'automatic' },
    { id: 2, date: '2023-05-08 02:00:00', status: 'completed', size: '152 MB', type: 'automatic' },
    { id: 3, date: '2023-05-01 14:23:45', status: 'completed', size: '149 MB', type: 'manual' },
    { id: 4, date: '2023-04-24 02:00:00', status: 'completed', size: '147 MB', type: 'automatic' },
  ]);

  // Added state for logs functionality
  const [showLogViewer, setShowLogViewer] = useState(false);
  const [logEntries, setLogEntries] = useState([
    { id: 1, timestamp: '2023-05-18 14:23:45', level: 'info', message: 'User john.doe@example.com logged in', category: 'auth' },
    { id: 2, timestamp: '2023-05-18 13:15:22', level: 'warn', message: 'Failed login attempt for user jane.smith@example.com', category: 'auth' },
    { id: 3, timestamp: '2023-05-18 12:05:11', level: 'info', message: 'New activity created by mentor mike.jones@example.com', category: 'user' },
    { id: 4, timestamp: '2023-05-18 11:45:32', level: 'error', message: 'Database connection timeout', category: 'system' },
    { id: 5, timestamp: '2023-05-18 10:30:15', level: 'info', message: 'Scheduled backup completed successfully', category: 'system' },
    { id: 6, timestamp: '2023-05-18 09:22:18', level: 'debug', message: 'Cache refresh completed in 235ms', category: 'system' },
    { id: 7, timestamp: '2023-05-17 16:42:10', level: 'info', message: 'User sarah.connor@example.com registered', category: 'user' },
    { id: 8, timestamp: '2023-05-17 15:18:45', level: 'warn', message: 'High CPU usage detected (85%)', category: 'system' },
  ]);
  const [logFilter, setLogFilter] = useState({
    level: 'all',
    category: 'all',
    search: '',
  });
  const [isExporting, setIsExporting] = useState(false);
  
  // Add User modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Student',
    status: 'Pending'
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [userAddSuccess, setUserAddSuccess] = useState(false);

  // Handle settings change
  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category as keyof typeof settings],
        [setting]: value
      }
    });
    
    // Reset success message when settings are changed
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call to save settings
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 800);
  };

  // Handle manual backup
  const handleStartBackup = () => {
    setIsBackupInProgress(true);
    setBackupComplete(false);
    
    // Simulate backup process
    setTimeout(() => {
      setIsBackupInProgress(false);
      setBackupComplete(true);
      
      // Add new backup to history
      const newBackup = {
        id: backupHistory.length + 1,
        date: new Date().toLocaleString(),
        status: 'completed',
        size: Math.floor(145 + Math.random() * 20) + ' MB',
        type: 'manual'
      };
      
      setBackupHistory([newBackup, ...backupHistory]);
      
      // Reset backup complete status after 3 seconds
      setTimeout(() => {
        setBackupComplete(false);
      }, 3000);
    }, 3000);
  };

  // Handle view backup history
  const handleViewBackupHistory = () => {
    setShowBackupHistory(!showBackupHistory);
  };

  // Handle viewing logs
  const handleViewLogs = () => {
    setShowLogViewer(true);
  };

  // Handle exporting logs
  const handleExportLogs = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      
      // Create a sample log content based on the current format setting
      let logContent;
      
      if (settings.logs.exportFormat === 'json') {
        logContent = JSON.stringify(logEntries, null, 2);
      } else if (settings.logs.exportFormat === 'csv') {
        logContent = 'id,timestamp,level,message,category\n' + 
          logEntries.map(log => `${log.id},"${log.timestamp}","${log.level}","${log.message}","${log.category}"`).join('\n');
      } else {
        // Plain text format
        logContent = logEntries.map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.category}] ${log.message}`).join('\n');
      }
      
      // Create a blob for downloading
      const blob = new Blob([logContent], { type: `text/${settings.logs.exportFormat === 'json' ? 'json' : settings.logs.exportFormat === 'csv' ? 'csv' : 'plain'}` });
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-logs.${settings.logs.exportFormat}`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }, 1500);
  };

  // Filter logs based on current filter settings
  const filteredLogs = logEntries.filter(log => {
    // Filter by level
    if (logFilter.level !== 'all' && log.level !== logFilter.level) {
      return false;
    }
    
    // Filter by category
    if (logFilter.category !== 'all' && log.category !== logFilter.category) {
      return false;
    }
    
    // Filter by search term
    if (logFilter.search && !log.message.toLowerCase().includes(logFilter.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Log Level Badge Component
  const LogLevelBadge = ({ level }: { level: string }) => {
    let bgColor = '';
    let textColor = '';
    
    switch (level) {
      case 'debug':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        break;
      case 'info':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'warn':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      case 'error':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  // Handle add user
  const handleAddUser = () => {
    setShowAddUserModal(true);
  };
  
  // Handle user form change
  const handleUserFormChange = (field: string, value: any) => {
    setNewUser({
      ...newUser,
      [field]: value
    });
  };
  
  // Handle submit new user
  const handleSubmitNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingUser(true);
    
    // Simulate API call to add user
    setTimeout(() => {
      // Log the new user details (would be replaced with actual API call)
      console.log('Adding new user:', newUser);
      
      // Reset form and show success message
      setIsAddingUser(false);
      setUserAddSuccess(true);
      
      // Auto-hide success message and close modal after 2 seconds
      setTimeout(() => {
        setUserAddSuccess(false);
        setShowAddUserModal(false);
        setNewUser({
          name: '',
          email: '',
          role: 'Student',
          status: 'Pending'
        });
      }, 2000);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-lg shadow-md text-white">
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="mt-2 text-blue-100">
          Configure application settings and preferences to customize your platform experience
        </p>
      </div>
      
      {/* Settings Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-800">Setting Categories</h2>
            </div>
            <nav className="p-2">
              <button
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  activeTab === 'general' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab('general')}
              >
                <FileText className="mr-3 h-5 w-5" />
                General
              </button>
              <button
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md mt-1 ${
                  activeTab === 'security' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <Lock className="mr-3 h-5 w-5" />
                Security
              </button>
              <button
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md mt-1 ${
                  activeTab === 'notifications' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className="mr-3 h-5 w-5" />
                Notifications
              </button>
              <button
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md mt-1 ${
                  activeTab === 'registration' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab('registration')}
              >
                <Users className="mr-3 h-5 w-5" />
                Registration
              </button>
              <button
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md mt-1 ${
                  activeTab === 'backup' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab('backup')}
              >
                <Database className="mr-3 h-5 w-5" />
                Backup
              </button>
              <button
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md mt-1 ${
                  activeTab === 'logs' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab('logs')}
              >
                <Server className="mr-3 h-5 w-5" />
                Logs
              </button>
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200">
            <form onSubmit={handleSubmit}>
              {/* Success Message */}
              {saveSuccess && (
                <div className="m-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md flex items-center">
                  <div className="bg-green-100 p-1 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p>Settings saved successfully! Your changes have been applied.</p>
                </div>
              )}

              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="p-6">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">General Settings</h2>
                      <p className="text-sm text-gray-500 mt-1">Configure basic application information and appearance</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">Application Information</h3>
                      <div className="space-y-5">
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">Site Name</label>
                            <span className="text-xs text-gray-500">What users will see in the browser title</span>
                          </div>
                          <input
                            type="text"
                            className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            value={settings.general.siteName}
                            onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">Site Description</label>
                            <span className="text-xs text-gray-500">Brief description of your platform</span>
                          </div>
                          <textarea
                            className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            rows={3}
                            value={settings.general.siteDescription}
                            onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">Support & Maintenance</h3>
                      <div className="space-y-5">
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">Support Email</label>
                            <span className="text-xs text-gray-500">Help desk email for user inquiries</span>
                          </div>
                          <input
                            type="email"
                            className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            value={settings.general.supportEmail}
                            onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                          />
                        </div>
                        <div className="flex items-center">
                          <div className="flex h-5 items-center">
                            <input
                              type="checkbox"
                              id="maintenanceMode"
                              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={settings.general.maintenanceMode}
                              onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="maintenanceMode" className="font-medium text-gray-700">
                              Maintenance Mode
                            </label>
                            <p className="text-gray-500">Temporarily disable access to the platform for non-admin users</p>
                          </div>
                        </div>
                        {settings.general.maintenanceMode && (
                          <div className="p-4 bg-amber-50 text-amber-800 rounded-md flex items-start">
                            <AlertTriangle className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">Warning: Site will be inaccessible</p>
                              <p className="text-sm mt-1">
                                When maintenance mode is enabled, only administrators can access the site. All other users will see a maintenance page.
                                Make sure to communicate the maintenance window to your users beforehand.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Security Settings</h2>
                      <p className="text-sm text-gray-500 mt-1">Configure system security and authentication options</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">Password Requirements</h3>
                      <div className="space-y-5">
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">Minimum Password Length</label>
                            <span className="text-xs text-gray-500">Recommended: 8 or more characters</span>
                          </div>
                          <input
                            type="number"
                            className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            min={6}
                            max={30}
                            value={settings.security.passwordMinLength}
                            onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value, 10))}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <div className="flex h-5 items-center">
                              <input
                                type="checkbox"
                                id="passwordRequireUppercase"
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={settings.security.passwordRequireUppercase}
                                onChange={(e) => handleSettingChange('security', 'passwordRequireUppercase', e.target.checked)}
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="passwordRequireUppercase" className="font-medium text-gray-700">
                                Require Uppercase
                              </label>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="flex h-5 items-center">
                              <input
                                type="checkbox"
                                id="passwordRequireNumber"
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={settings.security.passwordRequireNumber}
                                onChange={(e) => handleSettingChange('security', 'passwordRequireNumber', e.target.checked)}
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="passwordRequireNumber" className="font-medium text-gray-700">
                                Require Number
                              </label>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="flex h-5 items-center">
                              <input
                                type="checkbox"
                                id="passwordRequireSymbol"
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={settings.security.passwordRequireSymbol}
                                onChange={(e) => handleSettingChange('security', 'passwordRequireSymbol', e.target.checked)}
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="passwordRequireSymbol" className="font-medium text-gray-700">
                                Require Symbol
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">Authentication Settings</h3>
                      <div className="space-y-5">
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">Account Lock After Failed Attempts</label>
                            <span className="text-xs text-gray-500">Number of failed login attempts before locking</span>
                          </div>
                          <input
                            type="number"
                            className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            min={3}
                            max={10}
                            value={settings.security.accountLockAfterAttempts}
                            onChange={(e) => handleSettingChange('security', 'accountLockAfterAttempts', parseInt(e.target.value, 10))}
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                            <span className="text-xs text-gray-500">Add an additional layer of security</span>
                          </div>
                          <select
                            className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            value={settings.security.twoFactorAuth}
                            onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.value)}
                          >
                            <option value="disabled">Disabled</option>
                            <option value="optional">Optional (User Choice)</option>
                            <option value="required">Required for All Users</option>
                          </select>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
                            <span className="text-xs text-gray-500">Time before inactive users are logged out</span>
                          </div>
                          <input
                            type="number"
                            className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            min={5}
                            max={1440}
                            value={settings.security.sessionTimeout}
                            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value, 10))}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            {settings.security.sessionTimeout <= 30 ? 'Short timeout: High security, may inconvenience users' : 
                             settings.security.sessionTimeout >= 240 ? 'Long timeout: More convenient but less secure' : 
                             'Balanced timeout: Good security while maintaining convenience'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Notification Settings</h2>
                      <p className="text-sm text-gray-500 mt-1">Configure how users receive updates and alerts</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">Email Notifications</h3>
                      <div className="space-y-5">
                        <div className="flex items-center">
                          <div className="flex h-5 items-center">
                            <input
                              type="checkbox"
                              id="emailNotifications"
                              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={settings.notifications.emailNotifications}
                              onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                              Enable Email Notifications
                            </label>
                            <p className="text-gray-500">Allow the system to send emails to users</p>
                          </div>
                        </div>
                        
                        {settings.notifications.emailNotifications && (
                          <div className="ml-8 border-l-2 border-blue-200 pl-4 space-y-4">
                            <div className="flex items-center">
                              <div className="flex h-5 items-center">
                                <input
                                  type="checkbox"
                                  id="activityUpdates"
                                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={settings.notifications.activityUpdates}
                                  onChange={(e) => handleSettingChange('notifications', 'activityUpdates', e.target.checked)}
                                  disabled={!settings.notifications.emailNotifications}
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="activityUpdates" className="font-medium text-gray-700">
                                  Activity Updates
                                </label>
                                <p className="text-gray-500">Notify users when new activities are added</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <div className="flex h-5 items-center">
                                <input
                                  type="checkbox"
                                  id="verificationAlerts"
                                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={settings.notifications.verificationAlerts}
                                  onChange={(e) => handleSettingChange('notifications', 'verificationAlerts', e.target.checked)}
                                  disabled={!settings.notifications.emailNotifications}
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="verificationAlerts" className="font-medium text-gray-700">
                                  Verification Alerts
                                </label>
                                <p className="text-gray-500">Notify mentors when verification requests are submitted</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <div className="flex h-5 items-center">
                                <input
                                  type="checkbox"
                                  id="weeklyDigest"
                                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={settings.notifications.weeklyDigest}
                                  onChange={(e) => handleSettingChange('notifications', 'weeklyDigest', e.target.checked)}
                                  disabled={!settings.notifications.emailNotifications}
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="weeklyDigest" className="font-medium text-gray-700">
                                  Weekly Digest Emails
                                </label>
                                <p className="text-gray-500">Send weekly summary of platform activity</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">System Notifications</h3>
                      <div className="space-y-5">
                        <div className="flex items-center">
                          <div className="flex h-5 items-center">
                            <input
                              type="checkbox"
                              id="systemAlerts"
                              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={settings.notifications.systemAlerts}
                              onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="systemAlerts" className="font-medium text-gray-700">
                              System Alerts
                            </label>
                            <p className="text-gray-500">Send important system notifications to all users</p>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">Notification Frequency</label>
                            <span className="text-xs text-gray-500">How often to send batched notifications</span>
                          </div>
                          <select
                            className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            value={settings.notifications.frequency || 'immediate'}
                            onChange={(e) => handleSettingChange('notifications', 'frequency', e.target.value)}
                          >
                            <option value="immediate">Immediate</option>
                            <option value="hourly">Hourly Digest</option>
                            <option value="daily">Daily Digest</option>
                            <option value="weekly">Weekly Digest Only</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">Email Templates</h3>
                      <div className="space-y-4">
                        <p className="text-gray-600 text-sm">Configure the templates used for system emails</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => alert('This would open the welcome email template editor')}
                            className="p-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-left"
                          >
                            <span className="block text-sm font-medium text-gray-700">Welcome Email</span>
                            <span className="block text-xs text-gray-500 mt-1">Sent when a new user registers</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => alert('This would open the verification email template editor')}
                            className="p-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-left"
                          >
                            <span className="block text-sm font-medium text-gray-700">Verification Email</span>
                            <span className="block text-xs text-gray-500 mt-1">Sent for verification requests</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => alert('This would open the password reset email template editor')}
                            className="p-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-left"
                          >
                            <span className="block text-sm font-medium text-gray-700">Password Reset</span>
                            <span className="block text-xs text-gray-500 mt-1">Sent when a user resets password</span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => alert('This would open the weekly digest email template editor')}
                            className="p-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-left"
                          >
                            <span className="block text-sm font-medium text-gray-700">Weekly Digest</span>
                            <span className="block text-xs text-gray-500 mt-1">Sent as a weekly activity summary</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Registration Settings */}
              {activeTab === 'registration' && (
                <div className="p-6">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Registration Settings</h2>
                      <p className="text-sm text-gray-500 mt-1">Configure user registration options and restrictions</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">Registration Options</h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="flex h-5 items-center">
                            <input
                              type="checkbox"
                              id="allowNewStudents"
                              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={settings.registration.allowNewStudents}
                              onChange={(e) => handleSettingChange('registration', 'allowNewStudents', e.target.checked)}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="allowNewStudents" className="font-medium text-gray-700">
                              Allow Student Registrations
                            </label>
                            <p className="text-gray-500">Enable new students to create accounts</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex h-5 items-center">
                            <input
                              type="checkbox"
                              id="allowNewMentors"
                              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={settings.registration.allowNewMentors}
                              onChange={(e) => handleSettingChange('registration', 'allowNewMentors', e.target.checked)}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="allowNewMentors" className="font-medium text-gray-700">
                              Allow Mentor Registrations
                            </label>
                            <p className="text-gray-500">Enable new mentors to create accounts</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex h-5 items-center">
                            <input
                              type="checkbox"
                              id="requireApproval"
                              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={settings.registration.requireApproval}
                              onChange={(e) => handleSettingChange('registration', 'requireApproval', e.target.checked)}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="requireApproval" className="font-medium text-gray-700">
                              Require Admin Approval
                            </label>
                            <p className="text-gray-500">New accounts must be approved by an administrator</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex h-5 items-center">
                            <input
                              type="checkbox"
                              id="autoVerify"
                              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={settings.registration.autoVerify ?? false}
                              onChange={(e) => handleSettingChange('registration', 'autoVerify', e.target.checked)}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="autoVerify" className="font-medium text-gray-700">
                              Auto-Verify Email Addresses
                            </label>
                            <p className="text-gray-500">Skip email verification for allowed domains</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">Allowed Email Domains</h3>
                      <div className="space-y-4">
                        <p className="text-gray-600 text-sm">Restrict registration to users with email addresses from these domains</p>
                        
                        <div className="flex gap-2 flex-wrap mb-2">
                          {settings.registration.allowedDomains.map((domain, index) => (
                            <div key={index} className="flex items-center bg-blue-50 px-3 py-1.5 rounded-md text-blue-700">
                              {domain}
                              <button
                                type="button"
                                className="ml-2 text-blue-500 hover:text-blue-700"
                                onClick={() => {
                                  const newDomains = [...settings.registration.allowedDomains];
                                  newDomains.splice(index, 1);
                                  handleSettingChange('registration', 'allowedDomains', newDomains);
                                }}
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            id="newDomain"
                            placeholder="example.com"
                            className="flex-1 p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          />
                          <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={() => {
                              const input = document.getElementById('newDomain') as HTMLInputElement;
                              if (input.value && !settings.registration.allowedDomains.includes(input.value)) {
                                handleSettingChange(
                                  'registration', 
                                  'allowedDomains', 
                                  [...settings.registration.allowedDomains, input.value]
                                );
                                input.value = '';
                              }
                            }}
                          >
                            Add Domain
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">Welcome Message</h3>
                      <div className="space-y-4">
                        <p className="text-gray-600 text-sm">This message will be shown to new users after registration</p>
                        
                        <textarea
                          className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          rows={4}
                          value={settings.registration.welcomeMessage}
                          onChange={(e) => handleSettingChange('registration', 'welcomeMessage', e.target.value)}
                          placeholder="Enter a welcome message for new users"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Backup Settings */}
              {activeTab === 'backup' && (
                <div className="p-6">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Backup Settings</h2>
                      <p className="text-sm text-gray-500 mt-1">Configure system backup options and storage</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">Scheduled Backups</h3>
                      <div className="space-y-5">
                        <div className="flex items-center">
                          <div className="flex h-5 items-center">
                            <input
                              type="checkbox"
                              id="autoBackup"
                              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={settings.backup.autoBackup}
                              onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="autoBackup" className="font-medium text-gray-700">
                              Enable Automatic Backups
                            </label>
                            <p className="text-gray-500">Schedule regular system backups</p>
                          </div>
                        </div>
                        
                        {settings.backup.autoBackup && (
                          <div className="ml-8 border-l-2 border-blue-200 pl-4 space-y-4">
                            <div>
                              <div className="flex justify-between mb-1">
                                <label className="block text-sm font-medium text-gray-700">Backup Frequency</label>
                                <span className="text-xs text-gray-500">How often backups should run</span>
                              </div>
                              <select
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                value={settings.backup.backupFrequency}
                                onChange={(e) => handleSettingChange('backup', 'backupFrequency', e.target.value)}
                                disabled={!settings.backup.autoBackup}
                              >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                              </select>
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <label className="block text-sm font-medium text-gray-700">Backup Time</label>
                                <span className="text-xs text-gray-500">When backups should run (24h format)</span>
                              </div>
                              <input
                                type="time"
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                value={settings.backup.backupTime}
                                onChange={(e) => handleSettingChange('backup', 'backupTime', e.target.value)}
                                disabled={!settings.backup.autoBackup}
                              />
                            </div>
                            
                            <div>
                              <div className="flex justify-between mb-1">
                                <label className="block text-sm font-medium text-gray-700">Retention Period (days)</label>
                                <span className="text-xs text-gray-500">How long to keep backups before deletion</span>
                              </div>
                              <input
                                type="number"
                                className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                min={1}
                                max={365}
                                value={settings.backup.retentionDays}
                                onChange={(e) => handleSettingChange('backup', 'retentionDays', parseInt(e.target.value, 10))}
                                disabled={!settings.backup.autoBackup}
                              />
                            </div>
                            
                            <div className="flex items-center">
                              <div className="flex h-5 items-center">
                                <input
                                  type="checkbox"
                                  id="includeAttachments"
                                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={settings.backup.includeAttachments}
                                  onChange={(e) => handleSettingChange('backup', 'includeAttachments', e.target.checked)}
                                  disabled={!settings.backup.autoBackup}
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="includeAttachments" className="font-medium text-gray-700">
                                  Include File Attachments
                                </label>
                                <p className="text-gray-500">Backup uploaded files (may require more storage)</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">Backup Locations</h3>
                      <div className="space-y-4">
                        <p className="text-gray-600 text-sm">Select where to store backup files</p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <div className="flex h-5 items-center">
                              <input
                                type="checkbox"
                                id="backupLocal"
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={settings.backup.backupLocations.includes('local')}
                                onChange={(e) => {
                                  const locations = [...settings.backup.backupLocations];
                                  if (e.target.checked && !locations.includes('local')) {
                                    locations.push('local');
                                  } else if (!e.target.checked) {
                                    const index = locations.indexOf('local');
                                    if (index > -1) {
                                      locations.splice(index, 1);
                                    }
                                  }
                                  handleSettingChange('backup', 'backupLocations', locations);
                                }}
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="backupLocal" className="font-medium text-gray-700">
                                Local Storage
                              </label>
                              <p className="text-gray-500">Store backups on the local server</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="flex h-5 items-center">
                              <input
                                type="checkbox"
                                id="backupCloud"
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={settings.backup.backupLocations.includes('cloud')}
                                onChange={(e) => {
                                  const locations = [...settings.backup.backupLocations];
                                  if (e.target.checked && !locations.includes('cloud')) {
                                    locations.push('cloud');
                                  } else if (!e.target.checked) {
                                    const index = locations.indexOf('cloud');
                                    if (index > -1) {
                                      locations.splice(index, 1);
                                    }
                                  }
                                  handleSettingChange('backup', 'backupLocations', locations);
                                }}
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="backupCloud" className="font-medium text-gray-700">
                                Cloud Storage
                              </label>
                              <p className="text-gray-500">Store backups in the cloud (requires configuration)</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="flex h-5 items-center">
                              <input
                                type="checkbox"
                                id="backupExternal"
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={settings.backup.backupLocations.includes('external')}
                                onChange={(e) => {
                                  const locations = [...settings.backup.backupLocations];
                                  if (e.target.checked && !locations.includes('external')) {
                                    locations.push('external');
                                  } else if (!e.target.checked) {
                                    const index = locations.indexOf('external');
                                    if (index > -1) {
                                      locations.splice(index, 1);
                                    }
                                  }
                                  handleSettingChange('backup', 'backupLocations', locations);
                                }}
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="backupExternal" className="font-medium text-gray-700">
                                External Storage
                              </label>
                              <p className="text-gray-500">Store backups on external SFTP/FTP server</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">Manual Backup</h3>
                      <div className="space-y-4">
                        <p className="text-gray-600 text-sm">Create an immediate backup of the system</p>
                        
                        {backupComplete && (
                          <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md flex items-center">
                            <div className="bg-green-100 p-1 rounded-full mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p>Backup completed successfully! Your data is now safe.</p>
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                          <button
                            type="button"
                            className={`px-4 py-2 text-sm font-medium text-white ${
                              isBackupInProgress ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                            } border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center`}
                            onClick={handleStartBackup}
                            disabled={isBackupInProgress}
                          >
                            {isBackupInProgress ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Backup in Progress...
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Start Backup Now
                              </>
                            )}
                          </button>
                          
                          <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                            onClick={handleViewBackupHistory}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {showBackupHistory ? 'Hide Backup History' : 'View Backup History'}
                          </button>
                        </div>
                        
                        {showBackupHistory && (
                          <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                              <h4 className="text-sm font-medium text-gray-700">Backup History</h4>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {backupHistory.map((backup) => (
                                    <tr key={backup.id}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{backup.date}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{backup.type}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{backup.size}</td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                          {backup.status}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button 
                                          className="text-blue-600 hover:text-blue-900 mr-3"
                                          onClick={() => alert(`This would download backup #${backup.id}`)}
                                        >
                                          Download
                                        </button>
                                        <button 
                                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                                          onClick={() => alert(`This would restore backup #${backup.id}`)}
                                        >
                                          Restore
                                        </button>
                                        <button 
                                          className="text-red-600 hover:text-red-900"
                                          onClick={() => {
                                            if (confirm('Are you sure you want to delete this backup?')) {
                                              setBackupHistory(backupHistory.filter(b => b.id !== backup.id));
                                            }
                                          }}
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Logs Settings */}
              {activeTab === 'logs' && (
                <div className="p-6">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">System Logs</h2>
                      <p className="text-sm text-gray-500 mt-1">Configure logging settings and view system activity</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">Log Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">Log Level</label>
                            <span className="text-xs text-gray-500">Minimum severity level to record</span>
                          </div>
                          <select
                            className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            value={settings.logs.logLevel}
                            onChange={(e) => handleSettingChange('logs', 'logLevel', e.target.value)}
                          >
                            <option value="debug">Debug (Most Verbose)</option>
                            <option value="info">Info (Recommended)</option>
                            <option value="warn">Warning</option>
                            <option value="error">Error (Least Verbose)</option>
                          </select>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">Retention Period (days)</label>
                            <span className="text-xs text-gray-500">How long to keep logs before deletion</span>
                          </div>
                          <input
                            type="number"
                            className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            min={1}
                            max={365}
                            value={settings.logs.retentionDays}
                            onChange={(e) => handleSettingChange('logs', 'retentionDays', parseInt(e.target.value, 10))}
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">Export Format</label>
                            <span className="text-xs text-gray-500">Default format for log exports</span>
                          </div>
                          <select
                            className="w-full p-2.5 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            value={settings.logs.exportFormat}
                            onChange={(e) => handleSettingChange('logs', 'exportFormat', e.target.value)}
                          >
                            <option value="json">JSON</option>
                            <option value="csv">CSV</option>
                            <option value="txt">Plain Text</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">Activity Logging</h3>
                      <div className="space-y-4">
                        <p className="text-gray-600 text-sm">Select which activities to record in system logs</p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <div className="flex h-5 items-center">
                              <input
                                type="checkbox"
                                id="logUserActivity"
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={settings.logs.logUserActivity}
                                onChange={(e) => handleSettingChange('logs', 'logUserActivity', e.target.checked)}
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="logUserActivity" className="font-medium text-gray-700">
                                User Activity
                              </label>
                              <p className="text-gray-500">Track user actions and profile changes</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="flex h-5 items-center">
                              <input
                                type="checkbox"
                                id="logAuthActivity"
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={settings.logs.logAuthActivity}
                                onChange={(e) => handleSettingChange('logs', 'logAuthActivity', e.target.checked)}
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="logAuthActivity" className="font-medium text-gray-700">
                                Authentication Activity
                              </label>
                              <p className="text-gray-500">Track login attempts and security events</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="flex h-5 items-center">
                              <input
                                type="checkbox"
                                id="logSystemActivity"
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={settings.logs.logSystemActivity}
                                onChange={(e) => handleSettingChange('logs', 'logSystemActivity', e.target.checked)}
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="logSystemActivity" className="font-medium text-gray-700">
                                System Activity
                              </label>
                              <p className="text-gray-500">Track system events and scheduled jobs</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h3 className="text-md font-medium mb-4 text-gray-700">Log Viewer</h3>
                      <div className="space-y-4">
                        <p className="text-gray-600 text-sm">View and download system logs</p>
                        
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                          <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                            onClick={handleViewLogs}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                            View Logs
                          </button>
                          
                          <button
                            type="button"
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
                            onClick={handleExportLogs}
                            disabled={isExporting}
                          >
                            {isExporting ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Exporting...
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Export Logs
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to reset all settings to their default values? This action cannot be undone.")) {
                      setSettings(JSON.parse(JSON.stringify(initialSettings)));
                      setSaveSuccess(true);
                      
                      // Reset success message after 3 seconds
                      setTimeout(() => {
                        setSaveSuccess(false);
                      }, 3000);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 flex items-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowAddUserModal(false)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {userAddSuccess ? (
              <div className="p-6">
                <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md flex items-center">
                  <div className="bg-green-100 p-1 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p>User added successfully!</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitNewUser} className="p-6 pt-0 space-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 text-lg font-medium mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter full name"
                      value={newUser.name}
                      onChange={(e) => handleUserFormChange('name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-lg font-medium mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="email@example.com"
                      value={newUser.email}
                      onChange={(e) => handleUserFormChange('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-lg font-medium mb-2">Role</label>
                    <div className="relative">
                      <select
                        className="w-full p-4 text-lg border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        value={newUser.role}
                        onChange={(e) => handleUserFormChange('role', e.target.value)}
                        required
                      >
                        <option value="Student">Student</option>
                        <option value="Mentor">Mentor</option>
                        <option value="Admin">Administrator</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-lg font-medium mb-2">Status</label>
                    <div className="relative">
                      <select
                        className="w-full p-4 text-lg border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        value={newUser.status}
                        onChange={(e) => handleUserFormChange('status', e.target.value)}
                        required
                      >
                        <option value="Pending">Pending</option>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    className="px-6 py-4 text-lg font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 min-w-[120px]"
                    onClick={() => setShowAddUserModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-4 text-lg font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 min-w-[150px]"
                    disabled={isAddingUser}
                  >
                    {isAddingUser ? 'Adding...' : 'Create User'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Log Viewer Modal */}
      {showLogViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">System Logs</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowLogViewer(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-1/4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Log Level</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={logFilter.level}
                    onChange={(e) => setLogFilter({...logFilter, level: e.target.value})}
                  >
                    <option value="all">All Levels</option>
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                
                <div className="sm:w-1/4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={logFilter.category}
                    onChange={(e) => setLogFilter({...logFilter, category: e.target.value})}
                  >
                    <option value="all">All Categories</option>
                    <option value="auth">Authentication</option>
                    <option value="user">User Activity</option>
                    <option value="system">System</option>
                  </select>
                </div>
                
                <div className="sm:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Search log messages..."
                    value={logFilter.search}
                    onChange={(e) => setLogFilter({...logFilter, search: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="overflow-auto flex-grow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-44">Timestamp</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Level</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        No logs matching the current filters
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.timestamp}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <LogLevelBadge level={log.level} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{log.category}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{log.message}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredLogs.length}</span> of <span className="font-medium">{logEntries.length}</span> logs
              </span>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleExportLogs}
                >
                  Export Filtered Logs
                </button>
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setShowLogViewer(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 