import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface Element {
  symbol: string;
  name: string;
  atomicNumber: number;
  atomicWeight: number;
  category: 'alkali-metal' | 'alkaline-earth' | 'transition-metal' | 'post-transition' | 'metalloid' | 'nonmetal' | 'halogen' | 'noble-gas' | 'lanthanide' | 'actinide';
  period: number;
  group: number;
  density?: number;
  meltingPoint?: number;
  boilingPoint?: number;
  commonUses: string[];
  position: { row: number; col: number };
}

const elements: Element[] = [
  // Period 1
  { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, atomicWeight: 1.008, category: 'nonmetal', period: 1, group: 1, density: 0.00009, meltingPoint: -259, boilingPoint: -253, commonUses: ['fuel cells', 'chemical production'], position: { row: 1, col: 1 } },
  { symbol: 'He', name: 'Helium', atomicNumber: 2, atomicWeight: 4.003, category: 'noble-gas', period: 1, group: 18, density: 0.0002, meltingPoint: -272, boilingPoint: -269, commonUses: ['cooling', 'balloons'], position: { row: 1, col: 18 } },
  
  // Period 2
  { symbol: 'Li', name: 'Lithium', atomicNumber: 3, atomicWeight: 6.94, category: 'alkali-metal', period: 2, group: 1, density: 0.53, meltingPoint: 180, boilingPoint: 1342, commonUses: ['batteries', 'ceramics'], position: { row: 2, col: 1 } },
  { symbol: 'Be', name: 'Beryllium', atomicNumber: 4, atomicWeight: 9.012, category: 'alkaline-earth', period: 2, group: 2, density: 1.85, meltingPoint: 1287, boilingPoint: 2469, commonUses: ['aerospace', 'X-ray windows'], position: { row: 2, col: 2 } },
  { symbol: 'B', name: 'Boron', atomicNumber: 5, atomicWeight: 10.81, category: 'metalloid', period: 2, group: 13, density: 2.34, meltingPoint: 2075, boilingPoint: 4000, commonUses: ['glass', 'ceramics'], position: { row: 2, col: 13 } },
  { symbol: 'C', name: 'Carbon', atomicNumber: 6, atomicWeight: 12.01, category: 'nonmetal', period: 2, group: 14, density: 2.27, meltingPoint: 3825, boilingPoint: 4027, commonUses: ['steel', 'composites', 'diamonds'], position: { row: 2, col: 14 } },
  { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, atomicWeight: 14.01, category: 'nonmetal', period: 2, group: 15, density: 0.0013, meltingPoint: -210, boilingPoint: -196, commonUses: ['fertilizers', 'ammonia'], position: { row: 2, col: 15 } },
  { symbol: 'O', name: 'Oxygen', atomicNumber: 8, atomicWeight: 16.00, category: 'nonmetal', period: 2, group: 16, density: 0.0014, meltingPoint: -218, boilingPoint: -183, commonUses: ['oxidation', 'breathing'], position: { row: 2, col: 16 } },
  { symbol: 'F', name: 'Fluorine', atomicNumber: 9, atomicWeight: 19.00, category: 'halogen', period: 2, group: 17, density: 0.0017, meltingPoint: -220, boilingPoint: -188, commonUses: ['fluoropolymers', 'toothpaste'], position: { row: 2, col: 17 } },
  { symbol: 'Ne', name: 'Neon', atomicNumber: 10, atomicWeight: 20.18, category: 'noble-gas', period: 2, group: 18, density: 0.0009, meltingPoint: -249, boilingPoint: -246, commonUses: ['lighting', 'signs'], position: { row: 2, col: 18 } },
  
  // Period 3
  { symbol: 'Na', name: 'Sodium', atomicNumber: 11, atomicWeight: 22.99, category: 'alkali-metal', period: 3, group: 1, density: 0.97, meltingPoint: 98, boilingPoint: 883, commonUses: ['table salt', 'glass'], position: { row: 3, col: 1 } },
  { symbol: 'Mg', name: 'Magnesium', atomicNumber: 12, atomicWeight: 24.31, category: 'alkaline-earth', period: 3, group: 2, density: 1.74, meltingPoint: 650, boilingPoint: 1090, commonUses: ['lightweight alloys', 'automotive'], position: { row: 3, col: 2 } },
  { symbol: 'Al', name: 'Aluminum', atomicNumber: 13, atomicWeight: 26.98, category: 'post-transition', period: 3, group: 13, density: 2.70, meltingPoint: 660, boilingPoint: 2519, commonUses: ['aerospace', 'packaging', 'construction'], position: { row: 3, col: 13 } },
  { symbol: 'Si', name: 'Silicon', atomicNumber: 14, atomicWeight: 28.09, category: 'metalloid', period: 3, group: 14, density: 2.33, meltingPoint: 1414, boilingPoint: 3265, commonUses: ['semiconductors', 'glass', 'ceramics'], position: { row: 3, col: 14 } },
  { symbol: 'P', name: 'Phosphorus', atomicNumber: 15, atomicWeight: 30.97, category: 'nonmetal', period: 3, group: 15, density: 1.82, meltingPoint: 44, boilingPoint: 280, commonUses: ['fertilizers', 'matches'], position: { row: 3, col: 15 } },
  { symbol: 'S', name: 'Sulfur', atomicNumber: 16, atomicWeight: 32.07, category: 'nonmetal', period: 3, group: 16, density: 2.07, meltingPoint: 115, boilingPoint: 445, commonUses: ['rubber', 'chemicals'], position: { row: 3, col: 16 } },
  { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17, atomicWeight: 35.45, category: 'halogen', period: 3, group: 17, density: 0.003, meltingPoint: -102, boilingPoint: -34, commonUses: ['disinfectants', 'PVC'], position: { row: 3, col: 17 } },
  { symbol: 'Ar', name: 'Argon', atomicNumber: 18, atomicWeight: 39.95, category: 'noble-gas', period: 3, group: 18, density: 0.0018, meltingPoint: -189, boilingPoint: -186, commonUses: ['welding', 'lighting'], position: { row: 3, col: 18 } },
  
  // Period 4 - Transition metals and important elements
  { symbol: 'K', name: 'Potassium', atomicNumber: 19, atomicWeight: 39.10, category: 'alkali-metal', period: 4, group: 1, density: 0.89, meltingPoint: 64, boilingPoint: 759, commonUses: ['fertilizers', 'glass'], position: { row: 4, col: 1 } },
  { symbol: 'Ca', name: 'Calcium', atomicNumber: 20, atomicWeight: 40.08, category: 'alkaline-earth', period: 4, group: 2, density: 1.54, meltingPoint: 842, boilingPoint: 1484, commonUses: ['cement', 'steel'], position: { row: 4, col: 2 } },
  { symbol: 'Sc', name: 'Scandium', atomicNumber: 21, atomicWeight: 44.96, category: 'transition-metal', period: 4, group: 3, density: 2.99, meltingPoint: 1541, boilingPoint: 2836, commonUses: ['aerospace', 'lighting'], position: { row: 4, col: 3 } },
  { symbol: 'Ti', name: 'Titanium', atomicNumber: 22, atomicWeight: 47.87, category: 'transition-metal', period: 4, group: 4, density: 4.51, meltingPoint: 1668, boilingPoint: 3287, commonUses: ['aerospace', 'medical implants', 'marine'], position: { row: 4, col: 4 } },
  { symbol: 'V', name: 'Vanadium', atomicNumber: 23, atomicWeight: 50.94, category: 'transition-metal', period: 4, group: 5, density: 6.11, meltingPoint: 1910, boilingPoint: 3407, commonUses: ['steel alloys', 'catalysts'], position: { row: 4, col: 5 } },
  { symbol: 'Cr', name: 'Chromium', atomicNumber: 24, atomicWeight: 52.00, category: 'transition-metal', period: 4, group: 6, density: 7.15, meltingPoint: 1907, boilingPoint: 2671, commonUses: ['stainless steel', 'plating'], position: { row: 4, col: 6 } },
  { symbol: 'Mn', name: 'Manganese', atomicNumber: 25, atomicWeight: 54.94, category: 'transition-metal', period: 4, group: 7, density: 7.44, meltingPoint: 1246, boilingPoint: 2061, commonUses: ['steel', 'batteries'], position: { row: 4, col: 7 } },
  { symbol: 'Fe', name: 'Iron', atomicNumber: 26, atomicWeight: 55.85, category: 'transition-metal', period: 4, group: 8, density: 7.87, meltingPoint: 1538, boilingPoint: 2862, commonUses: ['steel', 'construction', 'automotive'], position: { row: 4, col: 8 } },
  { symbol: 'Co', name: 'Cobalt', atomicNumber: 27, atomicWeight: 58.93, category: 'transition-metal', period: 4, group: 9, density: 8.86, meltingPoint: 1495, boilingPoint: 2927, commonUses: ['batteries', 'superalloys'], position: { row: 4, col: 9 } },
  { symbol: 'Ni', name: 'Nickel', atomicNumber: 28, atomicWeight: 58.69, category: 'transition-metal', period: 4, group: 10, density: 8.91, meltingPoint: 1455, boilingPoint: 2913, commonUses: ['stainless steel', 'coins'], position: { row: 4, col: 10 } },
  { symbol: 'Cu', name: 'Copper', atomicNumber: 29, atomicWeight: 63.55, category: 'transition-metal', period: 4, group: 11, density: 8.96, meltingPoint: 1085, boilingPoint: 2562, commonUses: ['electrical', 'plumbing', 'alloys'], position: { row: 4, col: 11 } },
  { symbol: 'Zn', name: 'Zinc', atomicNumber: 30, atomicWeight: 65.38, category: 'transition-metal', period: 4, group: 12, density: 7.14, meltingPoint: 420, boilingPoint: 907, commonUses: ['galvanizing', 'alloys'], position: { row: 4, col: 12 } },
  { symbol: 'Ga', name: 'Gallium', atomicNumber: 31, atomicWeight: 69.72, category: 'post-transition', period: 4, group: 13, density: 5.91, meltingPoint: 30, boilingPoint: 2204, commonUses: ['semiconductors', 'LEDs'], position: { row: 4, col: 13 } },
  { symbol: 'Ge', name: 'Germanium', atomicNumber: 32, atomicWeight: 72.63, category: 'metalloid', period: 4, group: 14, density: 5.32, meltingPoint: 939, boilingPoint: 2833, commonUses: ['semiconductors', 'fiber optics'], position: { row: 4, col: 14 } },
  { symbol: 'As', name: 'Arsenic', atomicNumber: 33, atomicWeight: 74.92, category: 'metalloid', period: 4, group: 15, density: 5.78, meltingPoint: 817, boilingPoint: 614, commonUses: ['semiconductors', 'wood preservatives'], position: { row: 4, col: 15 } },
  { symbol: 'Se', name: 'Selenium', atomicNumber: 34, atomicWeight: 78.97, category: 'nonmetal', period: 4, group: 16, density: 4.81, meltingPoint: 221, boilingPoint: 685, commonUses: ['electronics', 'glass'], position: { row: 4, col: 16 } },
  { symbol: 'Br', name: 'Bromine', atomicNumber: 35, atomicWeight: 79.90, category: 'halogen', period: 4, group: 17, density: 3.12, meltingPoint: -7, boilingPoint: 59, commonUses: ['flame retardants', 'water treatment'], position: { row: 4, col: 17 } },
  { symbol: 'Kr', name: 'Krypton', atomicNumber: 36, atomicWeight: 83.80, category: 'noble-gas', period: 4, group: 18, density: 0.0037, meltingPoint: -157, boilingPoint: -153, commonUses: ['lighting', 'insulation'], position: { row: 4, col: 18 } },
  
  // Period 5 - Key elements
  { symbol: 'Rb', name: 'Rubidium', atomicNumber: 37, atomicWeight: 85.47, category: 'alkali-metal', period: 5, group: 1, density: 1.53, meltingPoint: 39, boilingPoint: 688, commonUses: ['research', 'atomic clocks'], position: { row: 5, col: 1 } },
  { symbol: 'Sr', name: 'Strontium', atomicNumber: 38, atomicWeight: 87.62, category: 'alkaline-earth', period: 5, group: 2, density: 2.64, meltingPoint: 777, boilingPoint: 1382, commonUses: ['fireworks', 'medical imaging'], position: { row: 5, col: 2 } },
  { symbol: 'Y', name: 'Yttrium', atomicNumber: 39, atomicWeight: 88.91, category: 'transition-metal', period: 5, group: 3, density: 4.47, meltingPoint: 1526, boilingPoint: 3345, commonUses: ['phosphors', 'lasers'], position: { row: 5, col: 3 } },
  { symbol: 'Zr', name: 'Zirconium', atomicNumber: 40, atomicWeight: 91.22, category: 'transition-metal', period: 5, group: 4, density: 6.51, meltingPoint: 1855, boilingPoint: 4409, commonUses: ['nuclear reactors', 'ceramics'], position: { row: 5, col: 4 } },
  { symbol: 'Nb', name: 'Niobium', atomicNumber: 41, atomicWeight: 92.91, category: 'transition-metal', period: 5, group: 5, density: 8.57, meltingPoint: 2477, boilingPoint: 4744, commonUses: ['superalloys', 'superconductors'], position: { row: 5, col: 5 } },
  { symbol: 'Mo', name: 'Molybdenum', atomicNumber: 42, atomicWeight: 95.95, category: 'transition-metal', period: 5, group: 6, density: 10.28, meltingPoint: 2623, boilingPoint: 4639, commonUses: ['steel alloys', 'catalysts'], position: { row: 5, col: 6 } },
  { symbol: 'Tc', name: 'Technetium', atomicNumber: 43, atomicWeight: 98, category: 'transition-metal', period: 5, group: 7, density: 11, meltingPoint: 2157, boilingPoint: 4265, commonUses: ['medical imaging'], position: { row: 5, col: 7 } },
  { symbol: 'Ru', name: 'Ruthenium', atomicNumber: 44, atomicWeight: 101.07, category: 'transition-metal', period: 5, group: 8, density: 12.37, meltingPoint: 2334, boilingPoint: 4150, commonUses: ['catalysts', 'electronics'], position: { row: 5, col: 8 } },
  { symbol: 'Rh', name: 'Rhodium', atomicNumber: 45, atomicWeight: 102.91, category: 'transition-metal', period: 5, group: 9, density: 12.41, meltingPoint: 1964, boilingPoint: 3695, commonUses: ['catalysts', 'jewelry'], position: { row: 5, col: 9 } },
  { symbol: 'Pd', name: 'Palladium', atomicNumber: 46, atomicWeight: 106.42, category: 'transition-metal', period: 5, group: 10, density: 12.02, meltingPoint: 1555, boilingPoint: 2963, commonUses: ['catalysts', 'electronics'], position: { row: 5, col: 10 } },
  { symbol: 'Ag', name: 'Silver', atomicNumber: 47, atomicWeight: 107.87, category: 'transition-metal', period: 5, group: 11, density: 10.49, meltingPoint: 962, boilingPoint: 2162, commonUses: ['jewelry', 'electronics', 'photography'], position: { row: 5, col: 11 } },
  { symbol: 'Cd', name: 'Cadmium', atomicNumber: 48, atomicWeight: 112.41, category: 'transition-metal', period: 5, group: 12, density: 8.69, meltingPoint: 321, boilingPoint: 767, commonUses: ['batteries', 'pigments'], position: { row: 5, col: 12 } },
  { symbol: 'In', name: 'Indium', atomicNumber: 49, atomicWeight: 114.82, category: 'post-transition', period: 5, group: 13, density: 7.31, meltingPoint: 157, boilingPoint: 2072, commonUses: ['touchscreens', 'solders'], position: { row: 5, col: 13 } },
  { symbol: 'Sn', name: 'Tin', atomicNumber: 50, atomicWeight: 118.71, category: 'post-transition', period: 5, group: 14, density: 7.29, meltingPoint: 232, boilingPoint: 2602, commonUses: ['solders', 'coatings'], position: { row: 5, col: 14 } },
  { symbol: 'Sb', name: 'Antimony', atomicNumber: 51, atomicWeight: 121.76, category: 'metalloid', period: 5, group: 15, density: 6.68, meltingPoint: 631, boilingPoint: 1587, commonUses: ['flame retardants', 'alloys'], position: { row: 5, col: 15 } },
  { symbol: 'Te', name: 'Tellurium', atomicNumber: 52, atomicWeight: 127.60, category: 'metalloid', period: 5, group: 16, density: 6.24, meltingPoint: 450, boilingPoint: 988, commonUses: ['semiconductors', 'alloys'], position: { row: 5, col: 16 } },
  { symbol: 'I', name: 'Iodine', atomicNumber: 53, atomicWeight: 126.90, category: 'halogen', period: 5, group: 17, density: 4.93, meltingPoint: 114, boilingPoint: 184, commonUses: ['disinfectants', 'photography'], position: { row: 5, col: 17 } },
  { symbol: 'Xe', name: 'Xenon', atomicNumber: 54, atomicWeight: 131.29, category: 'noble-gas', period: 5, group: 18, density: 0.0059, meltingPoint: -112, boilingPoint: -108, commonUses: ['lighting', 'anesthesia'], position: { row: 5, col: 18 } },
  
  // Period 6 - Key heavy elements
  { symbol: 'Cs', name: 'Cesium', atomicNumber: 55, atomicWeight: 132.91, category: 'alkali-metal', period: 6, group: 1, density: 1.93, meltingPoint: 28, boilingPoint: 671, commonUses: ['atomic clocks', 'photoelectric cells'], position: { row: 6, col: 1 } },
  { symbol: 'Ba', name: 'Barium', atomicNumber: 56, atomicWeight: 137.33, category: 'alkaline-earth', period: 6, group: 2, density: 3.59, meltingPoint: 727, boilingPoint: 1897, commonUses: ['medical imaging', 'drilling fluids'], position: { row: 6, col: 2 } },
  { symbol: 'Hf', name: 'Hafnium', atomicNumber: 72, atomicWeight: 178.49, category: 'transition-metal', period: 6, group: 4, density: 13.31, meltingPoint: 2233, boilingPoint: 4603, commonUses: ['nuclear reactors', 'superalloys'], position: { row: 6, col: 4 } },
  { symbol: 'Ta', name: 'Tantalum', atomicNumber: 73, atomicWeight: 180.95, category: 'transition-metal', period: 6, group: 5, density: 16.69, meltingPoint: 3017, boilingPoint: 5458, commonUses: ['capacitors', 'surgical instruments'], position: { row: 6, col: 5 } },
  { symbol: 'W', name: 'Tungsten', atomicNumber: 74, atomicWeight: 183.84, category: 'transition-metal', period: 6, group: 6, density: 19.25, meltingPoint: 3695, boilingPoint: 5828, commonUses: ['light bulbs', 'cutting tools'], position: { row: 6, col: 6 } },
  { symbol: 'Re', name: 'Rhenium', atomicNumber: 75, atomicWeight: 186.21, category: 'transition-metal', period: 6, group: 7, density: 21.02, meltingPoint: 3459, boilingPoint: 5869, commonUses: ['superalloys', 'catalysts'], position: { row: 6, col: 7 } },
  { symbol: 'Os', name: 'Osmium', atomicNumber: 76, atomicWeight: 190.23, category: 'transition-metal', period: 6, group: 8, density: 22.59, meltingPoint: 3033, boilingPoint: 5012, commonUses: ['fountain pen tips', 'electrical contacts'], position: { row: 6, col: 8 } },
  { symbol: 'Ir', name: 'Iridium', atomicNumber: 77, atomicWeight: 192.22, category: 'transition-metal', period: 6, group: 9, density: 22.56, meltingPoint: 2466, boilingPoint: 4428, commonUses: ['spark plugs', 'crucibles'], position: { row: 6, col: 9 } },
  { symbol: 'Pt', name: 'Platinum', atomicNumber: 78, atomicWeight: 195.08, category: 'transition-metal', period: 6, group: 10, density: 21.45, meltingPoint: 1768, boilingPoint: 3825, commonUses: ['catalysts', 'jewelry', 'electronics'], position: { row: 6, col: 10 } },
  { symbol: 'Au', name: 'Gold', atomicNumber: 79, atomicWeight: 196.97, category: 'transition-metal', period: 6, group: 11, density: 19.30, meltingPoint: 1064, boilingPoint: 2856, commonUses: ['jewelry', 'electronics', 'currency'], position: { row: 6, col: 11 } },
  { symbol: 'Hg', name: 'Mercury', atomicNumber: 80, atomicWeight: 200.59, category: 'transition-metal', period: 6, group: 12, density: 13.53, meltingPoint: -39, boilingPoint: 357, commonUses: ['thermometers', 'lighting'], position: { row: 6, col: 12 } },
  { symbol: 'Tl', name: 'Thallium', atomicNumber: 81, atomicWeight: 204.38, category: 'post-transition', period: 6, group: 13, density: 11.85, meltingPoint: 304, boilingPoint: 1473, commonUses: ['electronics', 'glass'], position: { row: 6, col: 13 } },
  { symbol: 'Pb', name: 'Lead', atomicNumber: 82, atomicWeight: 207.2, category: 'post-transition', period: 6, group: 14, density: 11.34, meltingPoint: 327, boilingPoint: 1749, commonUses: ['batteries', 'radiation shielding'], position: { row: 6, col: 14 } },
  { symbol: 'Bi', name: 'Bismuth', atomicNumber: 83, atomicWeight: 208.98, category: 'post-transition', period: 6, group: 15, density: 9.81, meltingPoint: 271, boilingPoint: 1564, commonUses: ['cosmetics', 'low-melting alloys'], position: { row: 6, col: 15 } },
];

const categoryColors = {
  'alkali-metal': 'bg-red-100 border-red-300 text-red-800',
  'alkaline-earth': 'bg-orange-100 border-orange-300 text-orange-800',
  'transition-metal': 'bg-blue-100 border-blue-300 text-blue-800',
  'post-transition': 'bg-green-100 border-green-300 text-green-800',
  'metalloid': 'bg-purple-100 border-purple-300 text-purple-800',
  'nonmetal': 'bg-yellow-100 border-yellow-300 text-yellow-800',
  'halogen': 'bg-cyan-100 border-cyan-300 text-cyan-800',
  'noble-gas': 'bg-gray-100 border-gray-300 text-gray-800',
  'lanthanide': 'bg-pink-100 border-pink-300 text-pink-800',
  'actinide': 'bg-indigo-100 border-indigo-300 text-indigo-800',
};

interface PeriodicTableProps {
  selectedElements: string[];
  onElementSelect: (element: Element) => void;
  onElementDeselect: (symbol: string) => void;
}

export function PeriodicTable({ selectedElements, onElementSelect, onElementDeselect }: PeriodicTableProps) {
  const isSelected = (symbol: string) => selectedElements.includes(symbol);
  
  const handleElementClick = (element: Element) => {
    if (isSelected(element.symbol)) {
      onElementDeselect(element.symbol);
    } else {
      onElementSelect(element);
    }
  };

  // Create a grid layout
  const createGrid = () => {
    const grid = Array(7).fill(null).map(() => Array(18).fill(null));
    
    elements.forEach(element => {
      if (element.position.row <= 6 && element.position.col <= 18) {
        grid[element.position.row][element.position.col - 1] = element;
      }
    });
    
    return grid;
  };

  const grid = createGrid();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span>Alkali Metals</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
          <span>Alkaline Earth</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
          <span>Transition Metals</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span>Post-transition</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
          <span>Metalloids</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span>Nonmetals</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-cyan-100 border border-cyan-300 rounded"></div>
          <span>Halogens</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
          <span>Noble Gases</span>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <TooltipProvider>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-18 gap-1 text-xs min-w-max">
                {grid.map((row, rowIndex) => 
                  row.map((element, colIndex) => (
                    <div key={`${rowIndex}-${colIndex}`} className="w-10 h-10 sm:w-12 sm:h-12">
                      {element ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={isSelected(element.symbol) ? "default" : "outline"}
                              size="sm"
                              className={`w-full h-full p-1 flex flex-col items-center justify-center text-xs font-mono border transition-all duration-200 hover:scale-105 ${
                                !isSelected(element.symbol) ? categoryColors[element.category] : ''
                              }`}
                              onClick={() => handleElementClick(element)}
                            >
                              <div className="text-[8px] sm:text-[10px] leading-none">{element.atomicNumber}</div>
                              <div className="font-bold leading-none text-[10px] sm:text-xs">{element.symbol}</div>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1 text-sm">
                              <div className="font-semibold">{element.name} ({element.symbol})</div>
                              <div className="text-xs text-muted-foreground">
                                Atomic number: {element.atomicNumber}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Atomic weight: {element.atomicWeight}
                              </div>
                              {element.density && (
                                <div className="text-xs text-muted-foreground">
                                  Density: {element.density} g/cm³
                                </div>
                              )}
                              {element.meltingPoint && (
                                <div className="text-xs text-muted-foreground">
                                  Melting point: {element.meltingPoint}°C
                                </div>
                              )}
                              <div className="text-xs">
                                <Badge variant="outline" className="text-xs">
                                  {element.category.replace('-', ' ')}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Common uses: {element.commonUses.slice(0, 2).join(', ')}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <div className="w-full h-full"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}
