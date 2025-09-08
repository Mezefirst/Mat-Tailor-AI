# MatTailor AI - Product Requirements Document

MatTailor AI empowers engineers, designers, and manufacturers to discover, simulate, tailor, and source optimal materials for specific applications without compromising performance, cost, or sustainability.

**Experience Qualities**:
1. **Intelligent** - AI-driven recommendations feel sophisticated yet approachable for technical users
2. **Comprehensive** - Every material property, constraint, and trade-off is considered and visualized
3. **Efficient** - Complex material selection processes are streamlined into intuitive workflows

**Complexity Level**: Complex Application (advanced functionality, accounts)
- Requires sophisticated simulation engines, AI recommendations, multi-language support, and extensive material databases with real-time supplier integration

## Essential Features

### Material Requirements Input
- **Functionality**: Multi-step form capturing mechanical, environmental, budget, and application constraints
- **Purpose**: Gather comprehensive requirements to enable precise AI recommendations
- **Trigger**: User clicks "Find Materials" or "New Search" from dashboard
- **Progression**: Requirements form → constraint validation → AI processing → results dashboard
- **Success criteria**: All input types captured with smart defaults and validation

### AI Material Recommendation Engine
- **Functionality**: ML-powered analysis of requirements to suggest optimal materials with scoring
- **Purpose**: Eliminate manual material research and leverage AI for optimal selections
- **Trigger**: User submits complete requirements or uses natural language query
- **Progression**: Input processing → ML analysis → scoring calculation → ranked recommendations
- **Success criteria**: Relevant materials suggested with clear performance/cost/sustainability scores

### Custom Material Designer
- **Functionality**: Interactive tool to create novel alloys and composites with property prediction
- **Purpose**: Enable innovation beyond existing materials for specific applications
- **Trigger**: User selects "Design New Material" tab or "Tailor Custom" option
- **Progression**: Element selection → composition tuning → property simulation → performance validation
- **Success criteria**: Predicted properties display with confidence intervals and manufacturing feasibility

### Material Properties Simulation
- **Functionality**: Real-time calculation of mechanical, electrical, chemical, and thermal properties
- **Purpose**: Validate material performance before physical testing or procurement
- **Trigger**: Material selection or custom composition changes
- **Progression**: Composition input → physics-based calculation → property visualization → trade-off analysis
- **Success criteria**: Accurate property predictions with visual trade-off charts

### Supplier Integration & Sourcing
- **Functionality**: Regional supplier database with availability, pricing, and lead times
- **Purpose**: Connect material selection to actual procurement possibilities
- **Trigger**: User requests supplier info or sets geographic constraints
- **Progression**: Location input → supplier matching → availability check → pricing comparison
- **Success criteria**: Current supplier data with actionable procurement information

### Natural Language AI Query
- **Functionality**: Conversational interface for complex material requirements
- **Purpose**: Lower barrier to entry for non-expert users and complex multi-constraint queries
- **Trigger**: User types natural language query in AI chat interface
- **Progression**: Query input → NLP processing → requirement extraction → standard recommendation flow
- **Success criteria**: Accurate requirement interpretation with clarifying questions when needed

## Edge Case Handling
- **Impossible Requirements**: Show "no exact matches" with closest alternatives and trade-off explanations
- **Limited Regional Data**: Expand search radius automatically with transparent notifications
- **Novel Material Uncertainties**: Display confidence intervals and recommend experimental validation
- **Supplier Outages**: Cache last-known data with staleness indicators and backup supplier suggestions
- **Translation Gaps**: Fall back to English with inline translations for technical terms

## Design Direction
The design should feel sophisticated and scientific yet approachable—like a high-end laboratory instrument that anyone can operate, with clean data visualization reminiscent of Tesla's interface philosophy combined with the precision of engineering software.

## Color Selection
**Triadic** color scheme to represent the three core pillars: Performance (blue), Cost (green), and Sustainability (orange), creating visual harmony while maintaining clear functional differentiation.

- **Primary Color**: Deep Scientific Blue `oklch(0.45 0.15 240)` - conveys trust, precision, and technical expertise
- **Secondary Colors**: 
  - Performance Accent: `oklch(0.55 0.12 220)` for mechanical/technical data
  - Cost Green: `oklch(0.60 0.15 140)` for economic indicators
  - Sustainability Orange: `oklch(0.65 0.12 60)` for environmental metrics
- **Accent Color**: Electric Cyan `oklch(0.70 0.15 200)` for interactive elements and CTAs
- **Foreground/Background Pairings**:
  - Background (Light Gray `oklch(0.98 0.005 240)`): Dark Blue text `oklch(0.15 0.02 240)` - Ratio 13.2:1 ✓
  - Card (Pure White `oklch(1 0 0)`): Dark Blue text `oklch(0.15 0.02 240)` - Ratio 15.1:1 ✓
  - Primary (Deep Blue `oklch(0.45 0.15 240)`): White text `oklch(1 0 0)` - Ratio 8.9:1 ✓
  - Secondary (Light Blue `oklch(0.55 0.12 220)`): White text `oklch(1 0 0)` - Ratio 6.2:1 ✓
  - Accent (Electric Cyan `oklch(0.70 0.15 200)`): Dark Blue text `oklch(0.15 0.02 240)` - Ratio 4.8:1 ✓

## Font Selection
Typography should convey precision and scientific authority while remaining highly legible for technical data and international users.

- **Typographic Hierarchy**:
  - **H1 (App Title)**: Inter Bold/32px/tight letter spacing for strong brand presence
  - **H2 (Section Headers)**: Inter SemiBold/24px/normal spacing for clear information hierarchy
  - **H3 (Card Titles)**: Inter Medium/18px/normal spacing for organized content grouping
  - **Body Text**: Inter Regular/16px/relaxed spacing for comfortable reading of technical content
  - **Data Labels**: Inter Medium/14px/tight spacing for compact property displays
  - **Captions**: Inter Regular/12px/normal spacing for supplementary information

## Animations
Subtle, physics-based animations that reinforce the scientific nature of the application while providing clear feedback for complex interactions like simulation progress and data updates.

- **Purposeful Meaning**: Smooth property transitions mirror real material behavior changes, loading states suggest computational complexity
- **Hierarchy of Movement**: 
  - **Primary**: Simulation progress and real-time property updates (most important)
  - **Secondary**: Tab transitions and card reveals (navigation clarity)
  - **Tertiary**: Hover states and micro-interactions (polish and delight)

## Component Selection
- **Components**: 
  - **Cards** for material recommendations and property displays with subtle shadows
  - **Tabs** for main navigation (Overview, New Material, AI Recommendation, etc.)
  - **Forms** with advanced field types for technical requirements input
  - **Data Tables** for supplier comparisons and detailed property listings
  - **Charts** (using Recharts) for trade-off visualizations and property profiles
  - **Dialogs** for detailed material information and configuration modals
  - **Progress** bars for simulation states and scoring visualizations
  - **Badges** for material categories, sustainability ratings, and availability status

- **Customizations**: 
  - **Property Slider Components** for tuning material compositions with real-time feedback
  - **3D Material Visualizer** using Three.js for molecular structure and material appearance
  - **AI Chat Interface** with specialized input handling for technical queries
  - **Multi-language Selector** with flag icons and smooth transitions

- **States**: 
  - **Interactive Elements**: Subtle elevation changes on hover, pressed states with gentle scaling
  - **Loading States**: Shimmer effects for data tables, progress indicators for simulations
  - **Error States**: Clear messaging with suggested alternatives, never dead-ends

- **Icon Selection**: 
  - **Phosphor Icons** for technical accuracy: Test Tube (simulation), Atom (materials), Globe (regions), Lightning (properties)
  - **Custom Icons** for specific material types and property categories

- **Spacing**: 
  - **Consistent 8px grid** system with generous whitespace around complex technical data
  - **Card padding**: 24px for comfortable content breathing room
  - **Form spacing**: 16px between related fields, 32px between sections

- **Mobile**: 
  - **Tab Navigation**: Horizontal scroll with snap points on mobile devices
  - **Property Charts**: Simplified mobile views with expandable detail modals
  - **Forms**: Single-column layout with progressive disclosure for complex inputs
  - **Simulation Results**: Stackable cards with swipe gestures for comparison
