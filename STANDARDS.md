# 📋 **STANDARDS.md - Verbindliche Entwicklungsstandards**
*Qualität, Sicherheit, Datenschutz und Best Practices*

---

## 🔒 **DSGVO/GDPR COMPLIANCE STANDARDS**

### **⚠️ KRITISCH: Datenschutz ist NICHT OPTIONAL**
Jedes Feature MUSS DSGVO-konform sein. Bei Unsicherheit → Datenverarbeitung NICHT implementieren.

### **Bei JEDEM Feature prüfen:**
- [ ] **Rechtsgrundlage vorhanden?** (Einwilligung, Vertrag, berechtigtes Interesse)
- [ ] **Datenminimierung?** (Nur notwendige Daten verarbeiten)
- [ ] **Zweckbindung?** (Daten nur für definierten Zweck)
- [ ] **Löschbar?** (User kann Daten löschen)
- [ ] **Exportierbar?** (Datenportabilität gewährleistet)
- [ ] **Dokumentiert?** (In Datenschutzerklärung aufgeführt)

### **Privacy by Design Implementierung:**
```typescript
// ✅ GDPR-KONFORM: Opt-in, granular, widerrufbar
interface ConsentState {
  essential: true;              // Immer true (technisch notwendig)
  analytics: boolean;           // Explizite Einwilligung erforderlich
  marketing: boolean;           // Explizite Einwilligung erforderlich
  timestamp: Date;              // Nachweis wann eingewilligt
  version: string;              // Version der Datenschutzerklärung
}

// ✅ Datenminimierung: Nur notwendige Felder
interface UserProfile {
  id: string;                   // UUID statt sequenzieller ID
  email?: string;               // Optional, nur wenn erforderlich
  createdAt: Date;
  // KEINE IP-Adressen, Browser-Fingerprints etc. ohne Grund
}

// ✅ Automatische Datenlöschung
const dataRetentionPolicy = {
  userActivity: 90,             // Tage
  analyticsData: 365,           // Tage
  errorLogs: 30,                // Tage
  deletedUserData: 0            // Sofort löschen
};
```

### **Betroffenenrechte implementieren:**
- **Auskunft (Art. 15):** User kann alle seine Daten einsehen
- **Berichtigung (Art. 16):** User kann Daten korrigieren
- **Löschung (Art. 17):** Vollständige Datenlöschung möglich
- **Datenportabilität (Art. 20):** Export in JSON/CSV Format
- **Widerspruch (Art. 21):** Opt-out von Verarbeitung

---

## 🛡️ **SECURITY STANDARDS**

### **Authentication & Authorization:**
```typescript
// ✅ Sichere Passwort-Anforderungen
const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserInfo: true          // Kein Name, Email etc. im Passwort
};

// ✅ Session Management
const sessionConfig = {
  secret: process.env.SESSION_SECRET,  // Min. 32 Zeichen
  maxAge: 24 * 60 * 60 * 1000,       // 24 Stunden
  httpOnly: true,
  secure: true,                        // HTTPS only
  sameSite: 'strict'
};
```

### **API Security:**
- **Rate Limiting:** Max 100 requests/minute per User
- **CORS:** Whitelist erlaubte Origins explizit
- **Input Validation:** Zod Schema für ALLE Inputs
- **SQL Injection:** Prisma ORM nutzen, keine raw queries
- **XSS Prevention:** React escape by default, dangerouslySetInnerHTML vermeiden

### **Daten-Verschlüsselung:**
```typescript
// ✅ Sensible Daten verschlüsseln
import { encrypt, decrypt } from '@/lib/crypto';

// OAuth Tokens verschlüsselt speichern
const encryptedToken = encrypt(accessToken);
await prisma.oAuthToken.create({
  data: {
    userId,
    provider: 'google',
    encryptedToken,
    // NIEMALS Klartext-Tokens speichern!
  }
});
```

### **Security Headers:**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

---

## ✅ **QUALITY STANDARDS**

### **Code Quality Metrics:**
- **TypeScript Coverage:** 100% (strict mode)
- **Test Coverage:** Min. 80% (branches, functions, lines)
- **Complexity:** Max 10 cyclomatic complexity per function
- **Bundle Size:** < 200KB initial load (gzipped)
- **Performance:** LCP < 2.5s, FID < 100ms, CLS < 0.1

### **Testing Requirements:**
```typescript
// ✅ Für jedes Feature: Unit + Integration + E2E Tests
describe('WidgetDeletion', () => {
  // Unit Test: Isolierte Funktionen
  it('should remove widget from state', () => {
    const result = deleteWidget(state, widgetId);
    expect(result.widgets).not.toContain(widgetId);
  });

  // Integration Test: API + Database
  it('should delete widget from database', async () => {
    await api.delete(`/widgets/${widgetId}`);
    const widget = await prisma.widget.findUnique({ where: { id: widgetId }});
    expect(widget).toBeNull();
  });

  // E2E Test: User Journey
  it('user can delete widget', async ({ page }) => {
    await page.click(`[data-testid="delete-widget-${widgetId}"]`);
    await page.click('[data-testid="confirm-delete"]');
    await expect(page.locator(`#widget-${widgetId}`)).not.toBeVisible();
  });
});
```

### **Code Review Checklist:**
- [ ] TypeScript types vollständig (kein `any`)
- [ ] Error handling implementiert
- [ ] Tests geschrieben und grün
- [ ] Performance Impact geprüft
- [ ] Security Implications bedacht
- [ ] GDPR Compliance gecheckt
- [ ] Documentation aktualisiert

---

## 🚀 **PERFORMANCE STANDARDS**

### **Core Web Vitals Targets:**
```typescript
const performanceBudget = {
  LCP: 2500,                    // Largest Contentful Paint (ms)
  FID: 100,                     // First Input Delay (ms)
  CLS: 0.1,                     // Cumulative Layout Shift
  TTFB: 800,                    // Time to First Byte (ms)
  FCP: 1800                     // First Contentful Paint (ms)
};
```

### **Optimization Requirements:**
- **Code Splitting:** Lazy load routes und heavy components
- **Image Optimization:** Next.js Image component verwenden
- **Bundle Analysis:** Regelmäßig mit `@next/bundle-analyzer`
- **Caching Strategy:** SWR für API calls, localStorage für UI state
- **Database Queries:** Indexes für häufige Queries, Query optimization

### **Performance Monitoring:**
```typescript
// ✅ Real User Monitoring
import { getCLS, getFID, getLCP } from 'web-vitals';

function sendToAnalytics(metric) {
  // Nur mit User Consent!
  if (hasAnalyticsConsent()) {
    analytics.track('web-vitals', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating
    });
  }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
```

---

## 📦 **DEPENDENCY STANDARDS**

### **Package Selection Criteria:**
- [ ] **Aktiv maintained?** (Letzter Release < 6 Monate)
- [ ] **Security Audits?** (Keine bekannten Vulnerabilities)
- [ ] **Bundle Size?** (Verhältnismäßig zur Funktionalität)
- [ ] **TypeScript Support?** (Native oder @types verfügbar)
- [ ] **License kompatibel?** (MIT, Apache 2.0 bevorzugt)
- [ ] **Wirklich notwendig?** (Keine 5-Zeilen-Packages)

### **Dependency Updates:**
```bash
# Wöchentlich prüfen
npm audit                       # Security vulnerabilities
npm outdated                    # Verfügbare Updates
npm run bundle-analyze          # Bundle size impact

# Vorsichtige Updates
npm update --save-exact         # Keine wilden Ranges
```

---

## 🌐 **ACCESSIBILITY STANDARDS**

### **WCAG 2.1 Level AA Compliance:**
- **Color Contrast:** Min. 4.5:1 für normalen Text, 3:1 für großen Text
- **Keyboard Navigation:** Alle interaktiven Elemente per Tab erreichbar
- **Screen Reader Support:** Semantic HTML, ARIA labels wo nötig
- **Focus Indicators:** Sichtbare Focus-States für alle Controls
- **Alt Texts:** Für alle informativen Bilder

### **Accessibility Testing:**
```typescript
// ✅ Automated Testing
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<Dashboard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## 🔄 **GIT & VERSION CONTROL STANDARDS**

### **Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: Neues Feature
- `fix`: Bug Fix
- `docs`: Dokumentation
- `style`: Formatting (kein Code Change)
- `refactor`: Code Refactoring
- `perf`: Performance Verbesserung
- `test`: Tests hinzufügen/ändern
- `chore`: Build/Tool Changes

**Beispiele:**
```bash
feat(widgets): add widget deletion with confirmation dialog
fix(auth): resolve Google OAuth token refresh issue
docs(gdpr): update data retention policy documentation
```

### **Branch Naming:**
- `feature/widget-deletion`
- `fix/oauth-refresh-token`
- `chore/update-dependencies`
- `docs/gdpr-compliance`

---

## 🏗️ **ARCHITECTURE STANDARDS**

### **Folder Structure:**
```
src/
├── app/                    # Next.js App Router
├── components/            
│   ├── ui/                # Generische UI Components
│   └── features/          # Feature-spezifische Components
├── hooks/                 # Custom React Hooks
├── lib/                   # Utilities und Services
├── store/                 # Zustand State Management
├── types/                 # TypeScript Type Definitions
└── styles/               # Global Styles
```

### **Component Guidelines:**
- **Single Responsibility:** Eine Component = Eine Aufgabe
- **Composition over Inheritance:** Kleine, kombinierbare Components
- **Props Interface:** Explizite TypeScript Interfaces
- **No Business Logic in UI:** Logic in Hooks/Services

---

## 📊 **MONITORING & LOGGING STANDARDS**

### **Logging Levels:**
```typescript
logger.debug('Detailed debugging information');
logger.info('General informational messages');
logger.warn('Warning messages for potential issues');
logger.error('Error messages for failures');
```

### **What to Log:**
- **API Requests:** Method, Path, Status, Duration
- **Errors:** Full stack traces, User context
- **Security Events:** Login attempts, Permission denials
- **Performance:** Slow queries, API timeouts

### **What NOT to Log:**
- **Passwords** oder andere Credentials
- **Persönliche Daten** (außer pseudonymisiert)
- **OAuth Tokens** oder API Keys
- **Kreditkarten** oder Zahlungsdaten

---

## 🚨 **INCIDENT RESPONSE STANDARDS**

### **Severity Levels:**
- **P0 (Critical):** System down, Datenverlust möglich
- **P1 (High):** Major Feature broken, viele User betroffen
- **P2 (Medium):** Feature degraded, Workaround vorhanden
- **P3 (Low):** Minor issues, cosmetic bugs

### **Response Times:**
- **P0:** Sofort, All-Hands
- **P1:** < 2 Stunden
- **P2:** < 24 Stunden
- **P3:** Next Sprint

---

## ✅ **STANDARD COMPLIANCE CHECKLIST**

Vor jedem Merge in main branch:

- [ ] **GDPR:** Datenschutz-Check durchgeführt
- [ ] **Security:** Keine Vulnerabilities eingeführt
- [ ] **Quality:** Tests grün, Coverage ausreichend
- [ ] **Performance:** Keine Regression in Core Web Vitals
- [ ] **Accessibility:** WCAG 2.1 AA compliant
- [ ] **Dependencies:** Audit durchgeführt
- [ ] **Documentation:** README/Docs aktualisiert

---

**Diese Standards sind VERBINDLICH und müssen bei JEDER Entwicklung befolgt werden.**