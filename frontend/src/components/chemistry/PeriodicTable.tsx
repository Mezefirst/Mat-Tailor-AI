import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Info } from '@phosphor-icons/react';

interface Element {
  symbol: string;
  name: string;
  atomicNumber: number;
  atomicWeight: number;
  group: number;
  period: number;
  category: string;
  color: string;
}

interface PeriodicTableProps {
  onElementSelect: (element: { symbol: string; name: string; atomicNumber: number }) => void;
}

const elements: Element[] = [
  // Period 1
  { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, atomicWeight: 1.008, group: 1, period: 1, category: 'nonmetal', color: 'bg-red-100 hover:bg-red-200 border-red-300' },
  { symbol: 'He', name: 'Helium', atomicNumber: 2, atomicWeight: 4.003, group: 18, period: 1, category: 'noble-gas', color: 'bg-purple-100 hover:bg-purple-200 border-purple-300' },
  
  // Period 2
  { symbol: 'Li', name: 'Lithium', atomicNumber: 3, atomicWeight: 6.94, group: 1, period: 2, category: 'alkali-metal', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
  { symbol: 'Be', name: 'Beryllium', atomicNumber: 4, atomicWeight: 9.012, group: 2, period: 2, category: 'alkaline-earth', color: 'bg-orange-100 hover:bg-orange-200 border-orange-300' },
  { symbol: 'B', name: 'Boron', atomicNumber: 5, atomicWeight: 10.81, group: 13, period: 2, category: 'metalloid', color: 'bg-green-100 hover:bg-green-200 border-green-300' },
  { symbol: 'C', name: 'Carbon', atomicNumber: 6, atomicWeight: 12.01, group: 14, period: 2, category: 'nonmetal', color: 'bg-red-100 hover:bg-red-200 border-red-300' },
  { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, atomicWeight: 14.01, group: 15, period: 2, category: 'nonmetal', color: 'bg-red-100 hover:bg-red-200 border-red-300' },
  { symbol: 'O', name: 'Oxygen', atomicNumber: 8, atomicWeight: 16.00, group: 16, period: 2, category: 'nonmetal', color: 'bg-red-100 hover:bg-red-200 border-red-300' },
  { symbol: 'F', name: 'Fluorine', atomicNumber: 9, atomicWeight: 19.00, group: 17, period: 2, category: 'halogen', color: 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300' },
  { symbol: 'Ne', name: 'Neon', atomicNumber: 10, atomicWeight: 20.18, group: 18, period: 2, category: 'noble-gas', color: 'bg-purple-100 hover:bg-purple-200 border-purple-300' },
  
  // Period 3
  { symbol: 'Na', name: 'Sodium', atomicNumber: 11, atomicWeight: 22.99, group: 1, period: 3, category: 'alkali-metal', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
  { symbol: 'Mg', name: 'Magnesium', atomicNumber: 12, atomicWeight: 24.31, group: 2, period: 3, category: 'alkaline-earth', color: 'bg-orange-100 hover:bg-orange-200 border-orange-300' },
  { symbol: 'Al', name: 'Aluminum', atomicNumber: 13, atomicWeight: 26.98, group: 13, period: 3, category: 'post-transition', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
  { symbol: 'Si', name: 'Silicon', atomicNumber: 14, atomicWeight: 28.09, group: 14, period: 3, category: 'metalloid', color: 'bg-green-100 hover:bg-green-200 border-green-300' },
  { symbol: 'P', name: 'Phosphorus', atomicNumber: 15, atomicWeight: 30.97, group: 15, period: 3, category: 'nonmetal', color: 'bg-red-100 hover:bg-red-200 border-red-300' },
  { symbol: 'S', name: 'Sulfur', atomicNumber: 16, atomicWeight: 32.07, group: 16, period: 3, category: 'nonmetal', color: 'bg-red-100 hover:bg-red-200 border-red-300' },
  { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17, atomicWeight: 35.45, group: 17, period: 3, category: 'halogen', color: 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300' },
  { symbol: 'Ar', name: 'Argon', atomicNumber: 18, atomicWeight: 39.95, group: 18, period: 3, category: 'noble-gas', color: 'bg-purple-100 hover:bg-purple-200 border-purple-300' },
  
  // Period 4 - Key transition metals for alloys
  { symbol: 'K', name: 'Potassium', atomicNumber: 19, atomicWeight: 39.10, group: 1, period: 4, category: 'alkali-metal', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
  { symbol: 'Ca', name: 'Calcium', atomicNumber: 20, atomicWeight: 40.08, group: 2, period: 4, category: 'alkaline-earth', color: 'bg-orange-100 hover:bg-orange-200 border-orange-300' },
  { symbol: 'Sc', name: 'Scandium', atomicNumber: 21, atomicWeight: 44.96, group: 3, period: 4, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Ti', name: 'Titanium', atomicNumber: 22, atomicWeight: 47.87, group: 4, period: 4, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'V', name: 'Vanadium', atomicNumber: 23, atomicWeight: 50.94, group: 5, period: 4, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Cr', name: 'Chromium', atomicNumber: 24, atomicWeight: 51.99, group: 6, period: 4, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Mn', name: 'Manganese', atomicNumber: 25, atomicWeight: 54.94, group: 7, period: 4, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Fe', name: 'Iron', atomicNumber: 26, atomicWeight: 55.85, group: 8, period: 4, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Co', name: 'Cobalt', atomicNumber: 27, atomicWeight: 58.93, group: 9, period: 4, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Ni', name: 'Nickel', atomicNumber: 28, atomicWeight: 58.69, group: 10, period: 4, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Cu', name: 'Copper', atomicNumber: 29, atomicWeight: 63.55, group: 11, period: 4, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Zn', name: 'Zinc', atomicNumber: 30, atomicWeight: 65.38, group: 12, period: 4, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Ga', name: 'Gallium', atomicNumber: 31, atomicWeight: 69.72, group: 13, period: 4, category: 'post-transition', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
  { symbol: 'Ge', name: 'Germanium', atomicNumber: 32, atomicWeight: 72.63, group: 14, period: 4, category: 'metalloid', color: 'bg-green-100 hover:bg-green-200 border-green-300' },
  { symbol: 'As', name: 'Arsenic', atomicNumber: 33, atomicWeight: 74.92, group: 15, period: 4, category: 'metalloid', color: 'bg-green-100 hover:bg-green-200 border-green-300' },
  { symbol: 'Se', name: 'Selenium', atomicNumber: 34, atomicWeight: 78.97, group: 16, period: 4, category: 'nonmetal', color: 'bg-red-100 hover:bg-red-200 border-red-300' },
  { symbol: 'Br', name: 'Bromine', atomicNumber: 35, atomicWeight: 79.90, group: 17, period: 4, category: 'halogen', color: 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300' },
  { symbol: 'Kr', name: 'Krypton', atomicNumber: 36, atomicWeight: 83.80, group: 18, period: 4, category: 'noble-gas', color: 'bg-purple-100 hover:bg-purple-200 border-purple-300' },
  
  // Period 5 - More important metals
  { symbol: 'Rb', name: 'Rubidium', atomicNumber: 37, atomicWeight: 85.47, group: 1, period: 5, category: 'alkali-metal', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
  { symbol: 'Sr', name: 'Strontium', atomicNumber: 38, atomicWeight: 87.62, group: 2, period: 5, category: 'alkaline-earth', color: 'bg-orange-100 hover:bg-orange-200 border-orange-300' },
  { symbol: 'Y', name: 'Yttrium', atomicNumber: 39, atomicWeight: 88.91, group: 3, period: 5, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Zr', name: 'Zirconium', atomicNumber: 40, atomicWeight: 91.22, group: 4, period: 5, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Nb', name: 'Niobium', atomicNumber: 41, atomicWeight: 92.91, group: 5, period: 5, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Mo', name: 'Molybdenum', atomicNumber: 42, atomicWeight: 95.95, group: 6, period: 5, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Tc', name: 'Technetium', atomicNumber: 43, atomicWeight: 98.91, group: 7, period: 5, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Ru', name: 'Ruthenium', atomicNumber: 44, atomicWeight: 101.1, group: 8, period: 5, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Rh', name: 'Rhodium', atomicNumber: 45, atomicWeight: 102.9, group: 9, period: 5, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Pd', name: 'Palladium', atomicNumber: 46, atomicWeight: 106.4, group: 10, period: 5, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Ag', name: 'Silver', atomicNumber: 47, atomicWeight: 107.9, group: 11, period: 5, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Cd', name: 'Cadmium', atomicNumber: 48, atomicWeight: 112.4, group: 12, period: 5, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'In', name: 'Indium', atomicNumber: 49, atomicWeight: 114.8, group: 13, period: 5, category: 'post-transition', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
  { symbol: 'Sn', name: 'Tin', atomicNumber: 50, atomicWeight: 118.7, group: 14, period: 5, category: 'post-transition', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
  { symbol: 'Sb', name: 'Antimony', atomicNumber: 51, atomicWeight: 121.8, group: 15, period: 5, category: 'metalloid', color: 'bg-green-100 hover:bg-green-200 border-green-300' },
  { symbol: 'Te', name: 'Tellurium', atomicNumber: 52, atomicWeight: 127.6, group: 16, period: 5, category: 'metalloid', color: 'bg-green-100 hover:bg-green-200 border-green-300' },
  { symbol: 'I', name: 'Iodine', atomicNumber: 53, atomicWeight: 126.9, group: 17, period: 5, category: 'halogen', color: 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300' },
  { symbol: 'Xe', name: 'Xenon', atomicNumber: 54, atomicWeight: 131.3, group: 18, period: 5, category: 'noble-gas', color: 'bg-purple-100 hover:bg-purple-200 border-purple-300' },
  
  // Period 6 - Heavy metals and precious metals
  { symbol: 'Cs', name: 'Cesium', atomicNumber: 55, atomicWeight: 132.9, group: 1, period: 6, category: 'alkali-metal', color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
  { symbol: 'Ba', name: 'Barium', atomicNumber: 56, atomicWeight: 137.3, group: 2, period: 6, category: 'alkaline-earth', color: 'bg-orange-100 hover:bg-orange-200 border-orange-300' },
  { symbol: 'Hf', name: 'Hafnium', atomicNumber: 72, atomicWeight: 178.5, group: 4, period: 6, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Ta', name: 'Tantalum', atomicNumber: 73, atomicWeight: 180.9, group: 5, period: 6, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'W', name: 'Tungsten', atomicNumber: 74, atomicWeight: 183.8, group: 6, period: 6, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Re', name: 'Rhenium', atomicNumber: 75, atomicWeight: 186.2, group: 7, period: 6, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Os', name: 'Osmium', atomicNumber: 76, atomicWeight: 190.2, group: 8, period: 6, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Ir', name: 'Iridium', atomicNumber: 77, atomicWeight: 192.2, group: 9, period: 6, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Pt', name: 'Platinum', atomicNumber: 78, atomicWeight: 195.1, group: 10, period: 6, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Au', name: 'Gold', atomicNumber: 79, atomicWeight: 197.0, group: 11, period: 6, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Hg', name: 'Mercury', atomicNumber: 80, atomicWeight: 200.6, group: 12, period: 6, category: 'transition-metal', color: 'bg-slate-100 hover:bg-slate-200 border-slate-300' },
  { symbol: 'Tl', name: 'Thallium', atomicNumber: 81, atomicWeight: 204.4, group: 13, period: 6, category: 'post-transition', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
  { symbol: 'Pb', name: 'Lead', atomicNumber: 82, atomicWeight: 207.2, group: 14, period: 6, category: 'post-transition', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
  { symbol: 'Bi', name: 'Bismuth', atomicNumber: 83, atomicWeight: 209.0, group: 15, period: 6, category: 'post-transition', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' }
];

export function PeriodicTable({ onElementSelect }: PeriodicTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredElements = elements.filter(element => {
    const matchesSearch = element.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         element.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || element.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getGridPosition = (element: Element): { gridColumn: number; gridRow: number } => {
    // Simplified grid positioning for key elements
    if (element.period === 1) return { gridColumn: element.group, gridRow: 1 };
    if (element.period === 2) return { gridColumn: element.group, gridRow: 2 };
    if (element.period === 3) return { gridColumn: element.group, gridRow: 3 };
    if (element.period === 4) return { gridColumn: element.group, gridRow: 4 };
    if (element.period === 5) return { gridColumn: element.group, gridRow: 5 };
    if (element.period === 6) return { gridColumn: element.group, gridRow: 6 };
    return { gridColumn: element.group, gridRow: element.period };
  };

  const categories = [
    { value: 'all', label: 'All Elements', color: 'bg-gray-100' },
    { value: 'transition-metal', label: 'Transition Metals', color: 'bg-slate-100' },
    { value: 'post-transition', label: 'Post-transition', color: 'bg-blue-100' },
    { value: 'metalloid', label: 'Metalloids', color: 'bg-green-100' },
    { value: 'nonmetal', label: 'Nonmetals', color: 'bg-red-100' },
    { value: 'halogen', label: 'Halogens', color: 'bg-cyan-100' },
    { value: 'noble-gas', label: 'Noble Gases', color: 'bg-purple-100' },
    { value: 'alkali-metal', label: 'Alkali Metals', color: 'bg-yellow-100' },
    { value: 'alkaline-earth', label: 'Alkaline Earth', color: 'bg-orange-100' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search elements by name or symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category.value}
              variant={filterCategory === category.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(category.value)}
              className="text-xs"
            >
              <div className={`w-3 h-3 rounded-full mr-2 ${category.color}`} />
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {selectedElement && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Element Details: {selectedElement.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Symbol</div>
                <div className="font-medium">{selectedElement.symbol}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Atomic Number</div>
                <div className="font-medium">{selectedElement.atomicNumber}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Atomic Weight</div>
                <div className="font-medium">{selectedElement.atomicWeight}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Category</div>
                <Badge variant="outline" className="capitalize">
                  {selectedElement.category.replace('-', ' ')}
                </Badge>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button 
                onClick={() => onElementSelect({
                  symbol: selectedElement.symbol,
                  name: selectedElement.name,
                  atomicNumber: selectedElement.atomicNumber
                })}
              >
                Add to Composition
              </Button>
              <Button variant="outline" onClick={() => setSelectedElement(null)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-1 grid-cols-18 max-w-7xl mx-auto text-xs">
        {filteredElements.slice(0, 80).map((element) => {
          const position = getGridPosition(element);
          return (
            <Button
              key={element.symbol}
              variant="outline"
              className={`h-12 w-12 p-1 flex flex-col items-center justify-center transition-all duration-200 ${element.color} border-2`}
              style={{
                gridColumn: position.gridColumn,
                gridRow: position.gridRow
              }}
              onClick={() => setSelectedElement(element)}
            >
              <div className="font-bold text-xs leading-none">{element.symbol}</div>
              <div className="text-[8px] leading-none opacity-70">{element.atomicNumber}</div>
            </Button>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Click on any element to see details and add it to your material composition.
          {searchTerm && ` Showing ${filteredElements.length} elements matching "${searchTerm}".`}
        </p>
      </div>
    </div>
  );
}
