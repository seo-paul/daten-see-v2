# **DESIGN-SYSTEM.md - Daten-See Visual Identity**
*Konsistente Gestaltung für autonome Entwicklung*

---

## 🎨 **FARBPALETTE - DATEN-SEE BLUE HIERARCHY**

### **Primary Colors (Hauptfarben) - Dunkel → Hell:**
```css
--primary-blue:    #2F4F73;  /* Primary Blue - Hauptfarbe für Branding */
--blue-shade-1:    #365C83;  /* Blue Shade 1 - Sekundäre Aktionen */
--blue-shade-2:    #3D6992;  /* Blue Shade 2 - Tertiäre Elemente */
--blue-shade-3:    #4375A2;  /* Blue Shade 3 - Akzente */
--blue-shade-4:    #4A82B1;  /* Blue Shade 4 - Hellste Variante */
```

### **Secondary Colors (Sekundärfarben):**
```css
--success-green:   #457345;  /* Grün - Erfolg, positive Aktionen */
--neutral-beige:   #F2E8CF;  /* Beige - Hintergründe, neutral */
--text-dark:       #3d3d3d;  /* Dunkelgrau - Haupttext, Kontrast */
```

### **Usage Guidelines:**
- **#2F4F73** - Primary Blue für Buttons, Navigation, Logo
- **Absteigende Reihenfolge** - Bei Charts: dunkel → hell verwenden
- **Grün (#457345)** - Erfolgs-States, positive Feedback
- **Beige (#F2E8CF)** - Neutrale Backgrounds, Cards
- **Dark Gray (#3d3d3d)** - Body Text, Headlines

---

## 📊 **CHART.JS INTEGRATION**

### **Standard Chart Color Palette:**
```javascript
// Für alle Dashboard-Charts verwenden
const chartColors = ['#2F4F73', '#365C83', '#3D6992', '#4375A2', '#4A82B1'];

// Chart.js Konfiguration
const chartConfig = {
  data: {
    datasets: [{
      backgroundColor: chartColors,
      borderColor: chartColors.map(color => color + '80'), // 50% opacity
      borderWidth: 2
    }]
  },
  options: {
    plugins: {
      legend: {
        labels: {
          color: '#3d3d3d'  // Dark gray für Text
        }
      }
    }
  }
};
```

---

## 🖼️ **LOGO & BRANDING**

### **Logo Files:**
- **SVG:** `assets/logo.svg` (Vektor, skalierbar)
- **Farben:** Verwendet Primary Blue Palette (#365C83, #4375A2, #4A82B1, #3D6992)
- **Mindestgröße:** 120px Breite für Lesbarkeit
- **Verwendung:** Header, Login, Favicon, Marketing

### **Logo Usage:**
```html
<!-- Standard Logo -->
<img src="./assets/logo.svg" alt="Daten-See" width="200" height="auto" />

<!-- Als React Component -->
<Logo className="h-8 w-auto" />
```

---

## 📝 **TYPOGRAPHY SYSTEM**

### **Font Stack:**
```css
/* Primary Font Family - Poppins für UI und Body Text */
--font-primary: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
--font-primary-weight-normal: 400;  /* Poppins Regular */
--font-primary-weight-semibold: 600; /* Poppins SemiBold für Emphasis */

/* Display Font - Fjalla One für Headlines und Titles */
--font-display: 'Fjalla One', Georgia, serif;

/* Secondary Font - Barlow für spezielle Akzente */
--font-secondary: 'Barlow', -apple-system, BlinkMacSystemFont, sans-serif;
--font-secondary-weight-light: 300; /* Barlow Light */

/* Monospace - Code & Data */
--font-mono: 'Fira Code', 'SF Mono', Consolas, monospace;
```

### **Font Loading (Next.js):**
```css
/* Font-Face Declarations */
@font-face {
  font-family: 'Poppins';
  src: url('./assets/fonts/poppins-regular.woff2') format('woff2'),
       url('./assets/fonts/poppins-regular.woff') format('woff'),
       url('./assets/fonts/poppins-regular-webfont.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Poppins';
  src: url('./assets/fonts/poppins-semibold.woff2') format('woff2'),
       url('./assets/fonts/poppins-semibold.woff') format('woff'),
       url('./assets/fonts/poppins-semibold-webfont.ttf') format('truetype');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Fjalla One';
  src: url('./assets/fonts/fjalla-one.woff2') format('woff2'),
       url('./assets/fonts/fjalla-one.woff') format('woff'),
       url('./assets/fonts/fjalla-one.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Barlow';
  src: url('./assets/fonts/barlow-light.woff2') format('woff2'),
       url('./assets/fonts/barlow-light.woff') format('woff'),
       url('./assets/fonts/barlow-light.ttf') format('truetype');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
```

### **Typography Hierarchy:**
```css
/* Hero/Dashboard Titles - Fjalla One */
.title-hero {
  font-family: var(--font-display);
  font-size: 48px;
  line-height: 1.2;
  letter-spacing: 0.02em;
  color: #2F4F73;
}

/* Page Titles - Fjalla One */
.title-page {
  font-family: var(--font-display);
  font-size: 36px;
  line-height: 1.3;
  color: #2F4F73;
}

/* Section Headers - Poppins SemiBold */
.title-section {
  font-family: var(--font-primary);
  font-weight: 600;
  font-size: 24px;
  line-height: 1.4;
  color: #3d3d3d;
}

/* Body Text - Poppins Regular */
.text-body {
  font-family: var(--font-primary);
  font-weight: 400;
  font-size: 16px;
  line-height: 1.6;
  color: #3d3d3d;
}

/* Emphasized Text - Poppins SemiBold */
.text-emphasis {
  font-family: var(--font-primary);
  font-weight: 600;
}

/* Caption/Labels - Barlow Light */
.text-caption {
  font-family: var(--font-secondary);
  font-weight: 300;
  font-size: 14px;
  line-height: 1.5;
  color: #6b7280;
}
```

### **Font Sizes (Tailwind Classes):**
```css
text-xs:   12px  /* Small labels, captions */
text-sm:   14px  /* Form labels, secondary text */
text-base: 16px  /* Body text, standard size */
text-lg:   18px  /* Subheadings, emphasis */
text-xl:   20px  /* Section headers */
text-2xl:  24px  /* Page titles, main headers */
text-3xl:  30px  /* Dashboard titles */
text-4xl:  36px  /* Hero sections (Fjalla One) */
text-5xl:  48px  /* Main hero text (Fjalla One) */
```

---

## 🎛️ **COMPONENT SYSTEM**

### **Buttons:**
```css
/* Primary Button */
.btn-primary {
  font-family: var(--font-primary);
  font-weight: 600; /* Poppins SemiBold */
  background: #2F4F73;
  color: white;
  border-radius: 8px;
  padding: 12px 24px;
  transition: all 150ms ease-out;
}

.btn-primary:hover {
  background: #365C83;
  transform: translateY(-1px);
}

/* Outline Button */
.btn-outline {
  font-family: var(--font-primary);
  font-weight: 400;
  background: transparent;
  color: #2F4F73;
  border: 2px solid #2F4F73;
  border-radius: 8px;
  padding: 10px 22px;
}

/* Success Button */
.btn-success {
  font-family: var(--font-primary);
  font-weight: 600;
  background: #457345;
  color: white;
}
```

### **Cards:**
```css
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
}

.card-title {
  font-family: var(--font-primary);
  font-weight: 600;
  font-size: 20px;
  color: #2F4F73;
  margin-bottom: 12px;
}

.card-compact {
  padding: 16px;
  border-radius: 8px;
}
```

### **Form Elements:**
```css
.input {
  font-family: var(--font-primary);
  font-weight: 400;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  transition: border-color 150ms ease-out;
}

.input-label {
  font-family: var(--font-primary);
  font-weight: 600;
  font-size: 14px;
  color: #3d3d3d;
  margin-bottom: 4px;
}

.input:focus {
  border-color: #2F4F73;
  outline: none;
  box-shadow: 0 0 0 3px rgba(47, 79, 115, 0.1);
}

.input.error {
  border-color: #ef4444;
}

.input.success {
  border-color: #457345;
}
```

---

## 📐 **SPACING SYSTEM**

### **Standard Spacing Scale:**
```css
--space-xs:  4px;   /* 1 unit  - Small gaps, icon spacing */
--space-sm:  8px;   /* 2 units - Form field spacing */
--space-md:  16px;  /* 4 units - Component padding */
--space-lg:  24px;  /* 6 units - Section spacing */
--space-xl:  32px;  /* 8 units - Large sections */
--space-2xl: 48px;  /* 12 units - Page sections */
```

### **Responsive Containers:**
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Responsive Breakpoints */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

---

## 🎬 **ANIMATION SYSTEM**

### **Standard Transitions:**
```css
/* Micro-interactions (buttons, hover states) */
.transition-micro {
  transition: all 150ms ease-out;
}

/* Layout changes (modals, panels) */
.transition-layout {
  transition: all 300ms ease-out;
}

/* Page transitions */
.transition-page {
  transition: all 500ms ease-in-out;
}
```

### **Hover Effects:**
```css
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(47, 79, 115, 0.3);
}

.hover-scale:hover {
  transform: scale(1.05);
}

.hover-opacity:hover {
  opacity: 0.8;
}
```

---

## 🎯 **TAILWIND CSS CONFIGURATION**

### **Custom Tailwind Config:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#4A82B1', // Blue Shade 4
          600: '#4375A2', // Blue Shade 3  
          700: '#3D6992', // Blue Shade 2
          800: '#365C83', // Blue Shade 1
          900: '#2F4F73', // Primary Blue
        },
        success: {
          500: '#457345',
        },
        neutral: {
          100: '#F2E8CF',
        }
      },
      fontFamily: {
        'sans': ['Poppins', 'system-ui', 'sans-serif'],
        'display': ['Fjalla One', 'Georgia', 'serif'],
        'secondary': ['Barlow', 'system-ui', 'sans-serif'],
        'mono': ['Fira Code', 'SF Mono', 'monospace'],
      },
      fontWeight: {
        'light': 300,    // Barlow Light
        'normal': 400,   // Poppins Regular
        'semibold': 600, // Poppins SemiBold
      },
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
      }
    }
  }
}
```

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **For Typography:**
- [ ] Verwende Fjalla One für große Headlines und Titles
- [ ] Nutze Poppins Regular für Body Text
- [ ] Setze Poppins SemiBold für Emphasis und Buttons
- [ ] Verwende Barlow Light für subtile Captions
- [ ] Lade alle Font-Dateien mit font-display: swap

### **For New Components:**
- [ ] Verwende Primary Blue (#2F4F73) für Hauptaktionen
- [ ] Nutze Chart Color Array für Visualisierungen
- [ ] Implementiere Hover-States mit 150ms Transitions
- [ ] Verwende 8px-Grid für Spacing
- [ ] Teste Responsive Behavior auf Mobile
- [ ] Validiere Contrast Ratios (WCAG AA)

### **For Charts & Data Viz:**
- [ ] Verwende chartColors Array in korrekter Reihenfolge
- [ ] Setze borderWidth: 2 für Linien-Charts
- [ ] Nutze 50% Opacity für Hintergrundfarben
- [ ] Implementiere Hover-Effekte für Interaktivität

---

---

## 🔗 **INTEGRATION MIT ANDEREN CLAUDE FILES**

**Beim Verwenden dieses Design Systems:**
- [ ] Komponenten → Teste mit CLAUDE_TESTING.md Visual Regression (Zeilen 406-432)
- [ ] Farben & Fonts → Folge CLAUDE_PATTERNS.md UI Component Patterns (Zeilen 150-200)
- [ ] Responsive Design → Erfülle STANDARDS.md Performance Standards (Core Web Vitals)
- [ ] Accessibility → Validiere STANDARDS.md WCAG 2.1 AA Compliance
- [ ] Code Changes → CLAUDE.md Docker Workflow befolgen (./scripts/quick-restart.sh)

**Cross-Reference Design:**
- **CLAUDE.md**: Quality Gates für UI Components
- **CLAUDE_TESTING.md**: Visual Testing und Accessibility Tests
- **CLAUDE_PATTERNS.md**: Component Implementation Patterns
- **STANDARDS.md**: Performance und Accessibility Requirements

---

**Diese Design-System Dokumentation gewährleistet konsistente visuelle Identität und ermöglicht Claude autonome UI-Entwicklung mit professionellem Look.**