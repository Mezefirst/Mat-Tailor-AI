// API Configuration Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { materialDataSources, APICredentials } from '@/services/materialDataSources';
import { Key, CheckCircle, XCircle, ExternalLink, Info } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface APIConfigProps {
  onCredentialsUpdated?: () => void;
}

export function APIConfig({ onCredentialsUpdated }: APIConfigProps) {
  const [credentials, setCredentials] = useState<Partial<APICredentials>>({});
  const [credentialStatus, setCredentialStatus] = useState({ matweb: false, materialsProject: false });
  const [isLoading, setIsLoading] = useState(false);
  const [showKeys, setShowKeys] = useState({ matweb: false, materialsProject: false });

  useEffect(() => {
    const initializeStatus = async () => {
      // Wait a moment for the materialDataSources to initialize
      setTimeout(updateStatus, 100);
    };
    initializeStatus();
  }, []);

  const updateStatus = async () => {
    try {
      const status = await materialDataSources.getCredentialStatus();
      setCredentialStatus(status);
    } catch (error) {
      console.warn('Could not get credential status:', error);
      setCredentialStatus({ matweb: false, materialsProject: false });
    }
  };

  const handleTestConnection = async (source: 'matweb' | 'materialsProject') => {
    setIsLoading(true);
    try {
      let testQuery;
      if (source === 'matweb') {
        testQuery = { material: 'steel' };
        await materialDataSources.searchMatWeb(testQuery);
      } else {
        testQuery = { elements: ['Fe'] };
        await materialDataSources.searchMaterialsProject(testQuery);
      }
      toast.success(`${source === 'matweb' ? 'MatWeb' : 'Materials Project'} connection successful`);
    } catch (error) {
      toast.error(`Connection failed: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCredentials = async () => {
    setIsLoading(true);
    try {
      // Filter out empty credentials
      const filteredCredentials: Partial<APICredentials> = {};
      if (credentials.matwebApiKey?.trim()) {
        filteredCredentials.matwebApiKey = credentials.matwebApiKey.trim();
      }
      if (credentials.materialsProjectApiKey?.trim()) {
        filteredCredentials.materialsProjectApiKey = credentials.materialsProjectApiKey.trim();
      }

      await materialDataSources.saveCredentials(filteredCredentials);
      updateStatus();
      setCredentials({});
      
      toast.success('API credentials saved securely');
      onCredentialsUpdated?.();
    } catch (error) {
      toast.error('Failed to save credentials');
      console.error('Error saving credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCredentials = async () => {
    setIsLoading(true);
    try {
      await materialDataSources.clearCredentials();
      updateStatus();
      setCredentials({});
      
      toast.success('API credentials cleared');
      onCredentialsUpdated?.();
    } catch (error) {
      toast.error('Failed to clear credentials');
      console.error('Error clearing credentials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleKeyVisibility = (source: 'matweb' | 'materialsProject') => {
    setShowKeys(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const maskKey = (key: string | undefined, show: boolean) => {
    if (!key) return '';
    if (show) return key;
    return '•'.repeat(Math.min(key.length, 20));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Configuration
          </CardTitle>
          <CardDescription>
            Connect to external material databases for comprehensive material data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Connection Status</h4>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {credentialStatus.matweb ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm">MatWeb</span>
                <Badge variant={credentialStatus.matweb ? "default" : "secondary"}>
                  {credentialStatus.matweb ? "Connected" : "Not Connected"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                {credentialStatus.materialsProject ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm">Materials Project</span>
                <Badge variant={credentialStatus.materialsProject ? "default" : "secondary"}>
                  {credentialStatus.materialsProject ? "Connected" : "Not Connected"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* MatWeb Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">MatWeb API</h4>
                <p className="text-xs text-muted-foreground">
                  Access comprehensive material property database
                </p>
              </div>
              <div className="flex gap-2">
                {credentialStatus.matweb && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection('matweb')}
                    disabled={isLoading}
                  >
                    Test Connection
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://www.matweb.com/reference/api.aspx', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Get API Key
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="matweb-key">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="matweb-key"
                  type={showKeys.matweb ? "text" : "password"}
                  placeholder="Enter MatWeb API key"
                  value={credentials.matwebApiKey || ''}
                  onChange={(e) => setCredentials(prev => ({ 
                    ...prev, 
                    matwebApiKey: e.target.value 
                  }))}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleKeyVisibility('matweb')}
                >
                  {showKeys.matweb ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Materials Project Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Materials Project API</h4>
                <p className="text-xs text-muted-foreground">
                  Access computational materials science database
                </p>
              </div>
              <div className="flex gap-2">
                {credentialStatus.materialsProject && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection('materialsProject')}
                    disabled={isLoading}
                  >
                    Test Connection
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://next-gen.materialsproject.org/api', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Get API Key
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mp-key">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="mp-key"
                  type={showKeys.materialsProject ? "text" : "password"}
                  placeholder="Enter Materials Project API key"
                  value={credentials.materialsProjectApiKey || ''}
                  onChange={(e) => setCredentials(prev => ({ 
                    ...prev, 
                    materialsProjectApiKey: e.target.value 
                  }))}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleKeyVisibility('materialsProject')}
                >
                  {showKeys.materialsProject ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSaveCredentials}
              disabled={isLoading || (!credentials.matwebApiKey && !credentials.materialsProjectApiKey)}
            >
              Save Credentials
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleClearCredentials}
              disabled={isLoading || (!credentialStatus.matweb && !credentialStatus.materialsProject)}
            >
              Clear All
            </Button>
          </div>

          {/* Security Notice */}
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              API keys are stored securely and encrypted. They are only used to fetch material data 
              and are never transmitted to third parties beyond the respective API providers.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* API Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">MatWeb Database</CardTitle>
            <CardDescription>
              Comprehensive material property database with over 150,000 material records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <strong>Data Types:</strong> Mechanical, thermal, electrical properties
            </div>
            <div className="text-sm">
              <strong>Materials:</strong> Metals, polymers, ceramics, composites
            </div>
            <div className="text-sm">
              <strong>Coverage:</strong> Commercial materials with datasheets
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Materials Project</CardTitle>
            <CardDescription>
              Open database of computed material properties using density functional theory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <strong>Data Types:</strong> Electronic, structural, thermodynamic properties
            </div>
            <div className="text-sm">
              <strong>Materials:</strong> Crystalline inorganic compounds
            </div>
            <div className="text-sm">
              <strong>Coverage:</strong> 150,000+ computed materials
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
