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
  },
  registration: {
    allowNewStudents: true,
    allowNewMentors: true,
    requireApproval: true,
    allowedDomains: ['university.edu', 'college.org'],
    welcomeMessage: 'Welcome to the Placement Tracking System!',
  },
};

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(initialSettings);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Configure application settings and preferences
        </p>
      </div>

      {/* Settings Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <nav className="space-y-1">
              <button
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'general' 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('general')}
              >
                <FileText className="mr-3 h-5 w-5" />
                General
              </button>
              <button
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'security' 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <Lock className="mr-3 h-5 w-5" />
                Security
              </button>
              <button
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'notifications' 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className="mr-3 h-5 w-5" />
                Notifications
              </button>
              <button
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'registration' 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' 
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('registration')}
              >
                <Users className="mr-3 h-5 w-5" />
                Registration
              </button>
              <button
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700`}
                onClick={() => alert('This would open system backup options')}
              >
                <Database className="mr-3 h-5 w-5" />
                Backup
              </button>
              <button
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700`}
                onClick={() => alert('This would show system logs')}
              >
                <Server className="mr-3 h-5 w-5" />
                Logs
              </button>
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
              {/* Success Message */}
              {saveSuccess && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-200">
                  Settings saved successfully!
                </div>
              )}

              {/* General Settings */}
              {activeTab === 'general' && (
                <div>
                  <h2 className="text-lg font-medium mb-4">General Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Site Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        value={settings.general.siteName}
                        onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Site Description</label>
                      <textarea
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        rows={3}
                        value={settings.general.siteDescription}
                        onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Support Email</label>
                      <input
                        type="email"
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        value={settings.general.supportEmail}
                        onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="maintenanceMode"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={settings.general.maintenanceMode}
                        onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                      />
                      <label htmlFor="maintenanceMode" className="ml-2 block text-sm">
                        Maintenance Mode
                      </label>
                    </div>
                    {settings.general.maintenanceMode && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-md flex items-start">
                        <AlertTriangle className="h-5 w-5 mr-2 shrink-0 mt-0.5" />
                        <p className="text-sm">
                          Enabling maintenance mode will make the site inaccessible to all non-admin users.
                          Only enable this during scheduled maintenance.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-lg font-medium mb-4">Security Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Minimum Password Length</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        min={6}
                        max={30}
                        value={settings.security.passwordMinLength}
                        onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value, 10))}
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="passwordRequireUppercase"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={settings.security.passwordRequireUppercase}
                        onChange={(e) => handleSettingChange('security', 'passwordRequireUppercase', e.target.checked)}
                      />
                      <label htmlFor="passwordRequireUppercase" className="ml-2 block text-sm">
                        Require uppercase letters
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="passwordRequireNumber"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={settings.security.passwordRequireNumber}
                        onChange={(e) => handleSettingChange('security', 'passwordRequireNumber', e.target.checked)}
                      />
                      <label htmlFor="passwordRequireNumber" className="ml-2 block text-sm">
                        Require numbers
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="passwordRequireSymbol"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={settings.security.passwordRequireSymbol}
                        onChange={(e) => handleSettingChange('security', 'passwordRequireSymbol', e.target.checked)}
                      />
                      <label htmlFor="passwordRequireSymbol" className="ml-2 block text-sm">
                        Require special characters
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Account Lock After Failed Attempts</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        min={3}
                        max={10}
                        value={settings.security.accountLockAfterAttempts}
                        onChange={(e) => handleSettingChange('security', 'accountLockAfterAttempts', parseInt(e.target.value, 10))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Two-Factor Authentication</label>
                      <select
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        value={settings.security.twoFactorAuth}
                        onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.value)}
                      >
                        <option value="disabled">Disabled</option>
                        <option value="optional">Optional</option>
                        <option value="required">Required</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        min={15}
                        max={240}
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value, 10))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-lg font-medium mb-4">Notification Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                      />
                      <label htmlFor="emailNotifications" className="ml-2 block text-sm">
                        Enable email notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="activityUpdates"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={settings.notifications.activityUpdates}
                        onChange={(e) => handleSettingChange('notifications', 'activityUpdates', e.target.checked)}
                      />
                      <label htmlFor="activityUpdates" className="ml-2 block text-sm">
                        Activity updates
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="verificationAlerts"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={settings.notifications.verificationAlerts}
                        onChange={(e) => handleSettingChange('notifications', 'verificationAlerts', e.target.checked)}
                      />
                      <label htmlFor="verificationAlerts" className="ml-2 block text-sm">
                        Verification alerts
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="weeklyDigest"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={settings.notifications.weeklyDigest}
                        onChange={(e) => handleSettingChange('notifications', 'weeklyDigest', e.target.checked)}
                      />
                      <label htmlFor="weeklyDigest" className="ml-2 block text-sm">
                        Weekly digest emails
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="systemAlerts"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={settings.notifications.systemAlerts}
                        onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
                      />
                      <label htmlFor="systemAlerts" className="ml-2 block text-sm">
                        System alerts
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Registration Settings */}
              {activeTab === 'registration' && (
                <div>
                  <h2 className="text-lg font-medium mb-4">Registration Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowNewStudents"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={settings.registration.allowNewStudents}
                        onChange={(e) => handleSettingChange('registration', 'allowNewStudents', e.target.checked)}
                      />
                      <label htmlFor="allowNewStudents" className="ml-2 block text-sm">
                        Allow new student registrations
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowNewMentors"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={settings.registration.allowNewMentors}
                        onChange={(e) => handleSettingChange('registration', 'allowNewMentors', e.target.checked)}
                      />
                      <label htmlFor="allowNewMentors" className="ml-2 block text-sm">
                        Allow new mentor registrations
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requireApproval"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={settings.registration.requireApproval}
                        onChange={(e) => handleSettingChange('registration', 'requireApproval', e.target.checked)}
                      />
                      <label htmlFor="requireApproval" className="ml-2 block text-sm">
                        Require admin approval for new accounts
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Allowed Email Domains</label>
                      <div className="flex gap-2 flex-wrap mb-2">
                        {settings.registration.allowedDomains.map((domain, index) => (
                          <div key={index} className="flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 px-2 py-1 rounded-md">
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
                          className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        />
                        <button
                          type="button"
                          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
                          Add
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Welcome Message</label>
                      <textarea
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                        rows={3}
                        value={settings.registration.welcomeMessage}
                        onChange={(e) => handleSettingChange('registration', 'welcomeMessage', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  onClick={() => setSettings(initialSettings)}
                >
                  <RefreshCw className="h-4 w-4 mr-2 inline" />
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 