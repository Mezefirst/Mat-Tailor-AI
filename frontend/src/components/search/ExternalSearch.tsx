// External Material Search Component
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { materialDataSources, ExternalMaterial } from '@/services/materialDataSources';
import { MagnifyingGlass, Database, Atom, FlaskConical, Info, ExternalLink } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ExternalSearchProps {
  onMaterialsFound: (materials: ExternalMaterial[]) => void;
}

export function ExternalSearch({ onMaterialsFound }: ExternalSearchProps) {
  const [searchQuery, setSearchQuery] = useState({
    material: '',
    elements: [] as string[],
    category: '',
    property: '',
    minValue: '',
    maxValue: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ExternalMaterial[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set());
  const [credentialStatus, setCredentialStatus] = useState({ matweb: false, materialsProject: false });

  useEffect(() => {
    const updateStatus = async () => {
      try {
        const status = await materialDataSources.getCredentialStatus();
        setCredentialStatus(status);
      } catch (error) {
        console.warn('Could not get credential status:', error);
        setCredentialStatus({ matweb: false, materialsProject: false });
      }
    };
    updateStatus();
  }, []);

  const elementOptions = [
    'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
    'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
    'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
    'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr',
    'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn'
  ];

  const categoryOptions = [
    'Metal',
    'Polymer',
    'Ceramic',
    'Composite',
    'Semiconductor',
    'Glass',
    'Elastomer',
    'Foam'
  ];

  const propertyOptions = [
    'Tensile Strength',
    'Yield Strength',
    'Density',
    'Thermal Conductivity',
    'Electrical Conductivity',
    'Band Gap',
    'Elastic Modulus',
    'Melting Point',
    'Specific Heat'
  ];

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const query = {
        material: searchQuery.material || undefined,
        elements: searchQuery.elements.length > 0 ? searchQuery.elements : undefined,
        category: searchQuery.category || undefined,
        properties: searchQuery.property ? [searchQuery.property] : undefined,
        propertyRange: searchQuery.property && (searchQuery.minValue || searchQuery.maxValue) ? {
          property: searchQuery.property,
          min: searchQuery.minValue ? parseFloat(searchQuery.minValue) : undefined,
          max: searchQuery.maxValue ? parseFloat(searchQuery.maxValue) : undefined
        } : undefined
      };

      const results = await materialDataSources.searchAllSources(query);
      setSearchResults(results);
      setSelectedMaterials(new Set());

      if (results.length === 0) {
        toast.info('No materials found matching your criteria');
      } else {
        toast.success(`Found ${results.length} materials`);
      }
    } catch (error) {
      toast.error('Search failed: ' + (error as Error).message);
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleElementToggle = (element: string) => {
    setSearchQuery(prev => ({
      ...prev,
      elements: prev.elements.includes(element)
        ? prev.elements.filter(e => e !== element)
        : [...prev.elements, element]
    }));
  };

  const handleMaterialSelect = (materialId: string) => {
    setSelectedMaterials(prev => {
      const newSet = new Set(prev);
      if (newSet.has(materialId)) {
        newSet.delete(materialId);
      } else {
        newSet.add(materialId);
      }
      return newSet;
    });
  };

  const handleImportSelected = () => {
    const selected = searchResults.filter(m => selectedMaterials.has(m.id));
    if (selected.length > 0) {
      onMaterialsFound(selected);
      toast.success(`Imported ${selected.length} materials`);
      setSelectedMaterials(new Set());
    }
  };

  const hasAnyCredentials = credentialStatus.matweb || credentialStatus.materialsProject;

  if (!hasAnyCredentials) {
    return (
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          Configure API credentials in Settings to search external material databases.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            External Material Search
          </CardTitle>
          <CardDescription>
            Search materials from MatWeb and Materials Project databases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connected Sources */}
          <div className="flex gap-2">
            {credentialStatus.matweb && (
              <Badge variant="default" className="flex items-center gap-1">
                <FlaskConical className="w-3 h-3" />
                MatWeb
              </Badge>
            )}
            {credentialStatus.materialsProject && (
              <Badge variant="default" className="flex items-center gap-1">
                <Atom className="w-3 h-3" />
                Materials Project
              </Badge>
            )}
          </div>

          {/* Search Form */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="material-name">Material Name</Label>
              <Input
                id="material-name"
                placeholder="e.g., stainless steel, aluminum"
                value={searchQuery.material}
                onChange={(e) => setSearchQuery(prev => ({ ...prev, material: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={searchQuery.category} 
                onValueChange={(value) => setSearchQuery(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Elements Selection */}
          <div className="space-y-3">
            <Label>Elements (select multiple)</Label>
            <div className="grid grid-cols-10 gap-1 max-w-4xl">
              {elementOptions.map(element => (
                <Button
                  key={element}
                  variant={searchQuery.elements.includes(element) ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => handleElementToggle(element)}
                >
                  {element}
                </Button>
              ))}
            </div>
          </div>

          {/* Property Range */}
          <div className="space-y-3">
            <Label>Property Range (optional)</Label>
            <div className="grid gap-3 md:grid-cols-3">
              <Select 
                value={searchQuery.property} 
                onValueChange={(value) => setSearchQuery(prev => ({ ...prev, property: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {propertyOptions.map(property => (
                    <SelectItem key={property} value={property}>{property}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Min value"
                type="number"
                value={searchQuery.minValue}
                onChange={(e) => setSearchQuery(prev => ({ ...prev, minValue: e.target.value }))}
                disabled={!searchQuery.property}
              />

              <Input
                placeholder="Max value"
                type="number"
                value={searchQuery.maxValue}
                onChange={(e) => setSearchQuery(prev => ({ ...prev, maxValue: e.target.value }))}
                disabled={!searchQuery.property}
              />
            </div>
          </div>

          <Button onClick={handleSearch} disabled={isSearching} className="w-full">
            <MagnifyingGlass className="w-4 h-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search Materials'}
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({searchResults.length})</CardTitle>
            <CardDescription>
              Select materials to import into your workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedMaterials.size > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {selectedMaterials.size} materials selected
                </span>
                <Button onClick={handleImportSelected}>
                  Import Selected
                </Button>
              </div>
            )}

            <div className="grid gap-4">
              {searchResults.map(material => (
                <Card 
                  key={material.id}
                  className={`cursor-pointer transition-colors ${
                    selectedMaterials.has(material.id) ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleMaterialSelect(material.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{material.name}</h4>
                        <p className="text-sm text-muted-foreground">{material.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{material.category}</Badge>
                        <Badge variant={material.source === 'matweb' ? 'default' : 'secondary'}>
                          {material.source === 'matweb' ? 'MatWeb' : 'Materials Project'}
                        </Badge>
                      </div>
                    </div>

                    {/* Composition */}
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Composition</h5>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(material.composition).map(([element, percentage]) => (
                          <Badge key={element} variant="outline" className="text-xs">
                            {element}: {percentage}%
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Key Properties */}
                    <div className="mt-3 space-y-2">
                      <h5 className="text-sm font-medium">Key Properties</h5>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {material.properties.slice(0, 4).map(property => (
                          <div key={property.name} className="text-xs">
                            <span className="font-medium">{property.name}:</span>{' '}
                            {property.value} {property.unit}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suppliers */}
                    {material.suppliers && material.suppliers.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <h5 className="text-sm font-medium">Suppliers</h5>
                        <div className="flex flex-wrap gap-1">
                          {material.suppliers.slice(0, 3).map(supplier => (
                            <Badge key={supplier} variant="outline" className="text-xs">
                              {supplier}
                            </Badge>
                          ))}
                          {material.suppliers.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{material.suppliers.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Data Sheet Link */}
                    {material.dataSheet && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(material.dataSheet, '_blank');
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Data Sheet
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
