// MatTailor AI - Intelligent Material Discovery Platform
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/layout/Header';
import { Overview } from '@/components/tabs/Overview';
import { NewMaterial } from '@/components/tabs/NewMaterial';
import { AIRecommendation } from '@/components/tabs/AIRecommendation';
import { MLEnhanced } from '@/components/tabs/MLEnhanced';
import { Properties } from '@/components/tabs/Properties';
import { Sustainability } from '@/components/tabs/Sustainability';
import { ExternalSearch } from '@/components/tabs/ExternalSearch';
import { Settings } from '@/components/tabs/Settings';
import { useKV } from '@github/spark/hooks';
import { useTranslation } from '@/lib/i18n';

function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useKV('active-tab', 'overview');
  const [materials, setMaterials] = useKV('materials', []);
  const [selectedMaterial, setSelectedMaterial] = useKV('selected-material', null);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <Overview 
            materials={materials}
            selectedMaterial={selectedMaterial}
            onSelectMaterial={setSelectedMaterial}
          />
        );
      case 'new-material':
        return (
          <NewMaterial 
            onMaterialCreated={(material) => setMaterials(prev => [...prev, material])}
          />
        );
      case 'ai-recommendation':
        return (
          <AIRecommendation 
            onMaterialsFound={(newMaterials) => setMaterials(newMaterials)}
          />
        );
      case 'ml-enhanced':
        return (
          <MLEnhanced 
            materials={materials}
            onMaterialsUpdated={setMaterials}
          />
        );
      case 'properties':
        return (
          <Properties 
            selectedMaterial={selectedMaterial}
            materials={materials}
            onMaterialUpdated={(material) => setMaterials(prev => [...prev, material])}
          />
        );
      case 'sustainability':
        return (
          <Sustainability 
            selectedMaterial={selectedMaterial}
            materials={materials}
          />
        );
      case 'external-search':
        return (
          <ExternalSearch 
            onMaterialsFound={(newMaterials) => setMaterials(newMaterials)}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return (
          <Overview 
            materials={materials}
            selectedMaterial={selectedMaterial}
            onSelectMaterial={setSelectedMaterial}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select a section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">{t.tabs.overview}</SelectItem>
              <SelectItem value="new-material">{t.tabs.newMaterial}</SelectItem>
              <SelectItem value="ai-recommendation">{t.tabs.aiRecommendation}</SelectItem>
              <SelectItem value="ml-enhanced">{t.tabs.mlEnhanced}</SelectItem>
              <SelectItem value="properties">{t.tabs.properties}</SelectItem>
              <SelectItem value="sustainability">{t.tabs.sustainability}</SelectItem>
              <SelectItem value="external-search">{t.tabs.externalSearch}</SelectItem>
              <SelectItem value="settings">{t.tabs.settings}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
