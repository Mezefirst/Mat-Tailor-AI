// Translation data for all supported languages
export const translations = {
  en: {
    // Header
    'header.title': 'MatTailor AI',
    'header.subtitle': 'Intelligent Material Discovery',
    'header.signIn': 'Sign In',
    
    // Navigation
    'nav.overview': 'Overview',
    'nav.newMaterial': 'New Material',
    'nav.aiRecommendation': 'AI Recommendation',
    'nav.mlEnhanced': 'ML Enhanced',
    'nav.properties': 'Properties',
    'nav.sustainability': 'Sustainability',
    'nav.externalSearch': 'External Search',
    'nav.settings': 'Settings',
    
    // Overview
    'overview.title': 'Material Overview',
    'overview.recommendations': 'Recommendations',
    'overview.noMaterials': 'No materials found. Create a new material or use AI recommendations.',
    'overview.performance': 'Performance',
    'overview.cost': 'Cost',
    'overview.sustainability': 'Sustainability',
    'overview.overall': 'Overall Score',
    
    // New Material
    'newMaterial.title': 'Create New Material',
    'newMaterial.composition': 'Material Composition',
    'newMaterial.selectElements': 'Select Elements',
    'newMaterial.elementPercentage': 'Percentage',
    'newMaterial.totalPercentage': 'Total: {percentage}%',
    'newMaterial.properties': 'Material Properties',
    'newMaterial.density': 'Density (g/cm³)',
    'newMaterial.tensileStrength': 'Tensile Strength (MPa)',
    'newMaterial.elasticModulus': 'Elastic Modulus (GPa)',
    'newMaterial.meltingPoint': 'Melting Point (°C)',
    'newMaterial.thermalConductivity': 'Thermal Conductivity (W/m·K)',
    'newMaterial.electricalResistivity': 'Electrical Resistivity (Ω·m)',
    'newMaterial.createMaterial': 'Create Material',
    'newMaterial.materialCreated': 'Material created successfully!',
    'newMaterial.invalidComposition': 'Invalid composition. Total must equal 100%.',
    
    // AI Recommendation
    'ai.title': 'AI Material Recommendation',
    'ai.query': 'Describe your material requirements',
    'ai.queryPlaceholder': 'e.g., "I need a lightweight, corrosion-resistant material for marine applications under €30/kg"',
    'ai.getRecommendations': 'Get Recommendations',
    'ai.analyzing': 'Analyzing requirements...',
    'ai.requirements': 'Requirements',
    'ai.application': 'Application',
    'ai.budget': 'Budget',
    'ai.region': 'Region',
    'ai.temperature': 'Temperature Range',
    'ai.strength': 'Strength Requirements',
    'ai.conductivity': 'Conductivity',
    'ai.corrosionResistance': 'Corrosion Resistance',
    
    // ML Enhanced
    'ml.title': 'ML Enhanced Predictions',
    'ml.feedback': 'Material Feedback',
    'ml.improvePredictions': 'Help improve our predictions',
    'ml.materialName': 'Material Name',
    'ml.actualPerformance': 'Actual Performance',
    'ml.predictedPerformance': 'Predicted Performance',
    'ml.submitFeedback': 'Submit Feedback',
    
    // Properties
    'properties.title': 'Material Properties',
    'properties.selectMaterial': 'Select a material to view its properties',
    'properties.mechanical': 'Mechanical Properties',
    'properties.thermal': 'Thermal Properties',
    'properties.electrical': 'Electrical Properties',
    'properties.chemical': 'Chemical Properties',
    'properties.simulate': 'Simulate Properties',
    
    // Sustainability
    'sustainability.title': 'Sustainability Analysis',
    'sustainability.selectMaterial': 'Select a material to view sustainability data',
    'sustainability.carbonFootprint': 'Carbon Footprint',
    'sustainability.recyclability': 'Recyclability',
    'sustainability.energyIntensity': 'Energy Intensity',
    'sustainability.lifecycle': 'Lifecycle Assessment',
    'sustainability.supplyChain': 'Supply Chain Impact',
    
    // External Search
    'external.title': 'External Material Database Search',
    'external.matwebSearch': 'MatWeb Database',
    'external.materialsProject': 'Materials Project',
    'external.searchComposition': 'Search by Composition',
    'external.searchProperties': 'Search by Properties',
    'external.enterFormula': 'Enter chemical formula',
    'external.search': 'Search',
    'external.noApiKey': 'API key required. Configure in Settings.',
    
    // Settings
    'settings.title': 'Settings',
    'settings.apiKeys': 'API Keys',
    'settings.matwebKey': 'MatWeb API Key',
    'settings.materialsProjectKey': 'Materials Project API Key',
    'settings.language': 'Language',
    'settings.region': 'Region',
    'settings.currency': 'Currency',
    'settings.units': 'Measurement Units',
    'settings.save': 'Save Settings',
    'settings.saved': 'Settings saved successfully!',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.save': 'Save',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
  },
  
  sv: {
    // Header
    'header.title': 'MatTailor AI',
    'header.subtitle': 'Intelligent Materialupptäckt',
    'header.signIn': 'Logga In',
    
    // Navigation
    'nav.overview': 'Översikt',
    'nav.newMaterial': 'Nytt Material',
    'nav.aiRecommendation': 'AI Rekommendation',
    'nav.mlEnhanced': 'ML Förbättrad',
    'nav.properties': 'Egenskaper',
    'nav.sustainability': 'Hållbarhet',
    'nav.externalSearch': 'Extern Sökning',
    'nav.settings': 'Inställningar',
    
    // Overview
    'overview.title': 'Materialöversikt',
    'overview.recommendations': 'Rekommendationer',
    'overview.noMaterials': 'Inga material hittades. Skapa ett nytt material eller använd AI-rekommendationer.',
    'overview.performance': 'Prestanda',
    'overview.cost': 'Kostnad',
    'overview.sustainability': 'Hållbarhet',
    'overview.overall': 'Totalt Betyg',
    
    // New Material
    'newMaterial.title': 'Skapa Nytt Material',
    'newMaterial.composition': 'Materialsammansättning',
    'newMaterial.selectElements': 'Välj Element',
    'newMaterial.elementPercentage': 'Procent',
    'newMaterial.totalPercentage': 'Totalt: {percentage}%',
    'newMaterial.properties': 'Materialegenskaper',
    'newMaterial.density': 'Densitet (g/cm³)',
    'newMaterial.tensileStrength': 'Draghållfasthet (MPa)',
    'newMaterial.elasticModulus': 'Elasticitetsmodul (GPa)',
    'newMaterial.meltingPoint': 'Smältpunkt (°C)',
    'newMaterial.thermalConductivity': 'Värmeledningsförmåga (W/m·K)',
    'newMaterial.electricalResistivity': 'Elektrisk Resistivitet (Ω·m)',
    'newMaterial.createMaterial': 'Skapa Material',
    'newMaterial.materialCreated': 'Material skapat framgångsrikt!',
    'newMaterial.invalidComposition': 'Ogiltig sammansättning. Totalen måste vara 100%.',
    
    // Common
    'common.loading': 'Laddar...',
    'common.error': 'Ett fel uppstod',
    'common.retry': 'Försök igen',
    'common.cancel': 'Avbryt',
    'common.confirm': 'Bekräfta',
    'common.delete': 'Ta bort',
    'common.edit': 'Redigera',
    'common.save': 'Spara',
    'common.close': 'Stäng',
    'common.back': 'Tillbaka',
    'common.next': 'Nästa',
    'common.previous': 'Föregående',
  },
  
  de: {
    // Header
    'header.title': 'MatTailor AI',
    'header.subtitle': 'Intelligente Materialentdeckung',
    'header.signIn': 'Anmelden',
    
    // Navigation
    'nav.overview': 'Übersicht',
    'nav.newMaterial': 'Neues Material',
    'nav.aiRecommendation': 'KI Empfehlung',
    'nav.mlEnhanced': 'ML Erweitert',
    'nav.properties': 'Eigenschaften',
    'nav.sustainability': 'Nachhaltigkeit',
    'nav.externalSearch': 'Externe Suche',
    'nav.settings': 'Einstellungen',
    
    // Overview
    'overview.title': 'Materialübersicht',
    'overview.recommendations': 'Empfehlungen',
    'overview.noMaterials': 'Keine Materialien gefunden. Erstellen Sie ein neues Material oder nutzen Sie KI-Empfehlungen.',
    'overview.performance': 'Leistung',
    'overview.cost': 'Kosten',
    'overview.sustainability': 'Nachhaltigkeit',
    'overview.overall': 'Gesamtbewertung',
    
    // New Material
    'newMaterial.title': 'Neues Material Erstellen',
    'newMaterial.composition': 'Materialzusammensetzung',
    'newMaterial.selectElements': 'Elemente Auswählen',
    'newMaterial.elementPercentage': 'Prozent',
    'newMaterial.totalPercentage': 'Gesamt: {percentage}%',
    'newMaterial.properties': 'Materialeigenschaften',
    'newMaterial.density': 'Dichte (g/cm³)',
    'newMaterial.tensileStrength': 'Zugfestigkeit (MPa)',
    'newMaterial.elasticModulus': 'Elastizitätsmodul (GPa)',
    'newMaterial.meltingPoint': 'Schmelzpunkt (°C)',
    'newMaterial.thermalConductivity': 'Wärmeleitfähigkeit (W/m·K)',
    'newMaterial.electricalResistivity': 'Elektrischer Widerstand (Ω·m)',
    'newMaterial.createMaterial': 'Material Erstellen',
    'newMaterial.materialCreated': 'Material erfolgreich erstellt!',
    'newMaterial.invalidComposition': 'Ungültige Zusammensetzung. Summe muss 100% ergeben.',
    
    // Common
    'common.loading': 'Laden...',
    'common.error': 'Ein Fehler ist aufgetreten',
    'common.retry': 'Wiederholen',
    'common.cancel': 'Abbrechen',
    'common.confirm': 'Bestätigen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.save': 'Speichern',
    'common.close': 'Schließen',
    'common.back': 'Zurück',
    'common.next': 'Weiter',
    'common.previous': 'Zurück',
  },
  
  fr: {
    // Header
    'header.title': 'MatTailor AI',
    'header.subtitle': 'Découverte Intelligente de Matériaux',
    'header.signIn': 'Se Connecter',
    
    // Navigation
    'nav.overview': 'Aperçu',
    'nav.newMaterial': 'Nouveau Matériau',
    'nav.aiRecommendation': 'Recommandation IA',
    'nav.mlEnhanced': 'ML Amélioré',
    'nav.properties': 'Propriétés',
    'nav.sustainability': 'Durabilité',
    'nav.externalSearch': 'Recherche Externe',
    'nav.settings': 'Paramètres',
    
    // Overview
    'overview.title': 'Aperçu des Matériaux',
    'overview.recommendations': 'Recommandations',
    'overview.noMaterials': 'Aucun matériau trouvé. Créez un nouveau matériau ou utilisez les recommandations IA.',
    'overview.performance': 'Performance',
    'overview.cost': 'Coût',
    'overview.sustainability': 'Durabilité',
    'overview.overall': 'Score Global',
    
    // New Material
    'newMaterial.title': 'Créer un Nouveau Matériau',
    'newMaterial.composition': 'Composition du Matériau',
    'newMaterial.selectElements': 'Sélectionner les Éléments',
    'newMaterial.elementPercentage': 'Pourcentage',
    'newMaterial.totalPercentage': 'Total: {percentage}%',
    'newMaterial.properties': 'Propriétés du Matériau',
    'newMaterial.density': 'Densité (g/cm³)',
    'newMaterial.tensileStrength': 'Résistance à la Traction (MPa)',
    'newMaterial.elasticModulus': 'Module d\'Élasticité (GPa)',
    'newMaterial.meltingPoint': 'Point de Fusion (°C)',
    'newMaterial.thermalConductivity': 'Conductivité Thermique (W/m·K)',
    'newMaterial.electricalResistivity': 'Résistivité Électrique (Ω·m)',
    'newMaterial.createMaterial': 'Créer le Matériau',
    'newMaterial.materialCreated': 'Matériau créé avec succès!',
    'newMaterial.invalidComposition': 'Composition invalide. Le total doit égaler 100%.',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur s\'est produite',
    'common.retry': 'Réessayer',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.save': 'Sauvegarder',
    'common.close': 'Fermer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
  },
  
  am: {
    // Header
    'header.title': 'MatTailor AI',
    'header.subtitle': 'ብልሃተኛ ንጥረ ነገር ፍለጋ',
    'header.signIn': 'ግባ',
    
    // Navigation
    'nav.overview': 'አጠቃላይ እይታ',
    'nav.newMaterial': 'አዲስ ንጥረ ነገር',
    'nav.aiRecommendation': 'AI ምክር',
    'nav.mlEnhanced': 'ML የተሻሻለ',
    'nav.properties': 'ባህሪያት',
    'nav.sustainability': 'ዘላቂነት',
    'nav.externalSearch': 'ውጫዊ ፍለጋ',
    'nav.settings': 'ሴቲንጎች',
    
    // Overview
    'overview.title': 'የንጥረ ነገር አጠቃላይ እይታ',
    'overview.recommendations': 'ምክሮች',
    'overview.noMaterials': 'ምንም ንጥረ ነገሮች አልተገኙም። አዲስ ንጥረ ነገር ይፍጠሩ ወይም AI ምክሮችን ይጠቀሙ።',
    'overview.performance': 'አፈጻጸም',
    'overview.cost': 'ዋጋ',
    'overview.sustainability': 'ዘላቂነት',
    'overview.overall': 'አጠቃላይ ነጥብ',
    
    // New Material
    'newMaterial.title': 'አዲስ ንጥረ ነገር ይፍጠሩ',
    'newMaterial.composition': 'የንጥረ ነገር ውህደት',
    'newMaterial.selectElements': 'ንጥረ ነገሮችን ይምረጡ',
    'newMaterial.elementPercentage': 'ፐርሰንት',
    'newMaterial.totalPercentage': 'ጠቅላላ: {percentage}%',
    'newMaterial.properties': 'የንጥረ ነገር ባህሪያት',
    'newMaterial.density': 'ጥግግት (g/cm³)',
    'newMaterial.tensileStrength': 'የመጎተት ጥንካሬ (MPa)',
    'newMaterial.elasticModulus': 'የመተጣጠፍ ሞጁል (GPa)',
    'newMaterial.meltingPoint': 'የመቀለጥ ነጥብ (°C)',
    'newMaterial.thermalConductivity': 'የሙቀት መተላለፊያ (W/m·K)',
    'newMaterial.electricalResistivity': 'የኤሌክትሪክ መቋቋሚያ (Ω·m)',
    'newMaterial.createMaterial': 'ንጥረ ነገር ይፍጠሩ',
    'newMaterial.materialCreated': 'ንጥረ ነገር በተሳካ ሁኔታ ተፈጠረ!',
    'newMaterial.invalidComposition': 'ልክ ያልሆነ ውህደት። ጠቅላላው 100% መሆን አለበት።',
    
    // Common
    'common.loading': 'በመጫን ላይ...',
    'common.error': 'ስህተት ተከስቷል',
    'common.retry': 'እንደገና ሞክር',
    'common.cancel': 'ይቅር',
    'common.confirm': 'አረጋግጥ',
    'common.delete': 'ሰርዝ',
    'common.edit': 'አርትዕ',
    'common.save': 'አስቀምጥ',
    'common.close': 'ዝጋ',
    'common.back': 'ተመለስ',
    'common.next': 'ቀጣይ',
    'common.previous': 'ቀዳሚ',
  }
} as const;

export type TranslationKey = keyof typeof translations.en;
export type Language = keyof typeof translations;
