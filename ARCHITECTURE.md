# 🏗️ **DATEN SEE v2 - ARCHITEKTUR GUIDE**

## 📋 **ARCHITEKTUR-PRINZIPIEN**

### **1. FEATURE-FIRST ORGANIZATION**
- Jedes Feature ist **selbst-contained** in `src/features/`
- Features haben eigene Components, Hooks, Services, Types
- **Regel:** Neue Features = Neuer Feature-Ordner

### **2. SHARED RESOURCES PATTERN**
- Wiederverwendbare Elemente in `src/shared/`
- **Regel:** > 2 Features verwenden = Zu Shared verschieben

### **3. CLEAN ARCHITECTURE LAYERS**
```
Features (UI Layer)     →    Shared Services    →    Lib (Core)
     ↓                           ↓                    ↓
 Components                  API Clients         Database
 Hooks                       Utilities            Auth
 Types                       Constants            Monitoring
```

### **4. DEPENDENCY FLOW RULES**
- ✅ `features/` → `shared/` → `lib/`
- ❌ `shared/` NIEMALS → `features/`
- ❌ `lib/` NIEMALS → `features/` or `shared/`

---

## 📁 **DETAILLIERTE STRUKTUR**

### **`src/features/` - GESCHÄFTSLOGIK**
```
features/
├── dashboard/
│   ├── components/        # Dashboard-spezifische Components
│   ├── hooks/            # Dashboard State Management
│   ├── services/         # Dashboard API Calls
│   ├── types/           # Dashboard TypeScript Types
│   └── index.ts         # Feature Export
├── widgets/
├── auth/
└── integrations/
```

### **`src/shared/` - WIEDERVERWENDBAR**
```
shared/
├── components/
│   ├── ui/              # Button, Input, Modal, Card
│   ├── forms/           # Form Components
│   ├── layout/          # Header, Sidebar, Footer
│   └── data-display/    # Tables, Charts, Lists
├── hooks/               # useLocalStorage, useApi, etc.
├── services/            # HTTP Client, Cache, Utils
├── utils/               # Formatters, Validators, Helpers
├── types/               # Global TypeScript Types
└── constants/           # App Constants, Config
```

### **`src/lib/` - CORE INFRASTRUKTUR**
```
lib/
├── monitoring/          # Sentry, Pino, Performance
├── database/            # Prisma, Schemas, Migrations
├── auth/               # NextAuth Configuration
├── integrations/       # Google APIs, External Services
├── validation/         # Zod Schemas
└── testing/           # Test Utilities, Mocks
```

---

## 🔒 **DEPENDENCY MANAGEMENT RULES**

### **STABILITY-FIRST PRINZIP:**
```bash
# Immer LTS/STABLE Versions verwenden:
✅ Next.js: Latest STABLE (nicht RC)
✅ React: LTS Version (18.x, nicht 19.x)
✅ Dependencies: Bewährte, stabile Versionen
❌ NIEMALS: RC, Beta, Alpha Versionen
```

### **VERSION-VALIDATION vor Installation:**
1. **npm audit** nach jeder Installation
2. **Nur Production-Ready** Dependencies
3. **Security Vulnerabilities** sofort beheben
4. **Dependency Updates** nur wenn notwendig

## 🔧 **CLAUDE WORKFLOW RULES**

### **🚨 KRITISCH: OFFICIAL DOCUMENTATION FIRST**
**BEVOR eigene Implementierungen:**
```bash
1. ✅ OFFIZIELLE DOKUMENTATION prüfen
2. ✅ STANDARD-PATTERNS verwenden  
3. ✅ COMMUNITY BEST PRACTICES befolgen
4. ❌ NIEMALS eigene APIs erfinden wenn Standard existiert
```

**BEISPIELE:**
- ✅ Pino: `pino.stdSerializers.req` (offizielle API)
- ❌ Eigene Serializer Types erfinden
- ✅ Next.js: App Router Patterns (offizielle Struktur)  
- ❌ Eigene Router-Lösungen bauen
- ✅ Sentry: Offizielle Integration Patterns
- ❌ Custom Error Tracking erfinden

**REGEL:** **"Official First, Custom Last"**

### **🚨 KRITISCH: ERROR & WARNING ZERO TOLERANCE**
**ALLE Errors und Warnings MÜSSEN behoben werden:**
```bash
✅ TypeScript Errors: IMMER beheben - keine Ausnahmen
✅ ESLint Errors: IMMER beheben - blockieren Build  
✅ Build Warnings: IMMER ernst nehmen und beheben
✅ Console Warnings: Analysieren und beheben
❌ NIEMALS "später beheben" - akkumuliert Technical Debt
```

**BEISPIELE:**
- ✅ Sentry Warning → Global Error Handler implementieren
- ✅ ESLint Import Order → Sofort korrigieren
- ✅ Missing Return Types → TypeScript strict befolgen
- ❌ "Das ist nur eine Warning" → FALSCH, alle behandeln

**WORKFLOW:**
1. **Error/Warning erscheint** → Sofort stoppen
2. **Root Cause analysieren** → Verstehen warum
3. **Official Documentation** → Korrekte Lösung finden
4. **Implementieren** → Problem vollständig lösen
5. **Validieren** → Bestätigen dass gelöst

**REGEL:** **"Zero Warnings, Zero Debt"**

### **BEVOR jeder neuer Component/Service/Hook:**

**1. LOCATION CHECK:**
```bash
# Frage: Wo gehört dieser Code hin?
- Nur für EIN Feature? → features/{feature-name}/
- Für MEHRERE Features? → shared/
- Core Infrastruktur? → lib/
```

**2. DEPENDENCY CHECK:**
```bash
# Imports erlaubt:
✅ features/ → shared/ → lib/
❌ shared/ → features/
❌ lib/ → features/ or shared/
```

**3. NAMING CONVENTION:**
```bash
# Files: kebab-case
user-dashboard.component.tsx
api-client.service.ts

# Folders: kebab-case
google-analytics/
user-management/

# Types: PascalCase
UserDashboard
ApiClient
```

### **WEEKLY FEATURE DEVELOPMENT PATTERN:**
```bash
Week X: Neues Feature
1. mkdir src/features/{feature-name}
2. Feature-spezifische Struktur aufbauen
3. Shared Components identifizieren
4. Exports zu Feature Index hinzufügen
5. Tests in feature/{feature-name}/__tests__/
```

---

## ✅ **QUALITÄTS-GATES**

### **Vor jedem Commit:**
- [ ] **Structure Check:** Alle Files in korrekten Ordnern?
- [ ] **Dependency Check:** Keine verbotenen Imports?
- [ ] **Export Check:** Barrel Exports aktualisiert?
- [ ] **Test Check:** Tests am richtigen Ort?

### **Feature-Completion Criteria:**
- [ ] Feature-Ordner vollständig strukturiert
- [ ] Shared Components extrahiert
- [ ] Types definiert und exportiert
- [ ] Tests implementiert
- [ ] Barrel Exports aktualisiert

---

## 🎯 **16-WOCHEN FEATURE MAP**

| Week | Feature | Location |
|------|---------|----------|
| 1-2  | Dashboard Layout | `features/dashboard/` |
| 3-4  | Widget System | `features/widgets/` |
| 5-6  | Authentication | `features/auth/` |
| 7-8  | Google OAuth | `features/integrations/google-auth/` |
| 9-10 | GA4 Integration | `features/integrations/google-analytics/` |
| 11-12| Google Ads | `features/integrations/google-ads/` |
| 13-16| Production Features | `features/{various}/` |

**Version 1.0** - Definitive Architektur für autonome Entwicklung