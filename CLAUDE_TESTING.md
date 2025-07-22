# **CLAUDE_TESTING.md - Testing Strategies**
*Bewährte Test-Patterns für autonome Entwicklung*

---

## 🏗️ **TEST-PYRAMIDE KONZEPT**

**WAS:** 3-schichtiges Testing-System mit verschiedenen Test-Typen in optimaler Verteilung  
**WARUM:** Schnelles Feedback, hohe Abdeckung, minimaler Wartungsaufwand  
**WIE:** 70% Unit Tests (schnell), 20% Integration Tests (realistisch), 10% E2E Tests (vollständig)  
**WANN:** Für jede Codebase die langfristig stabil und wartbar sein soll  
**TOOLS:** Jest (Unit/Integration), Playwright (E2E), React Testing Library (Components)

```
┌─────────────────────────────┐
│     E2E Tests (Playwright)  │ ← 10% - Kritische User-Journeys
│         "Does it work?"     │   Vollständige User-Szenarien
├─────────────────────────────┤
│  Integration Tests (Jest)   │ ← 20% - API + DB Interactions
│     "Do parts work together?"│   Component + API + Database
├─────────────────────────────┤
│    Unit Tests (Jest)        │ ← 70% - Pure Functions + Logic
│   "Does each part work?"    │   Isolierte Funktionen + Logik
└─────────────────────────────┘
```

---

## 🧪 **UNIT TESTS (Jest + React Testing Library)**

### **Pure Functions Testing**
**WAS:** Tests für isolierte Funktionen die bei gleichen Inputs immer gleiche Outputs liefern  
**WARUM:** Schnellste Tests, einfach zu schreiben, finden Bugs früh in der Entwicklung  
**WIE:** Function mit verschiedenen Inputs aufrufen, Outputs mit expect() validieren  
**WANN:** Für alle Business-Logic-Funktionen, Berechnungen, Datenvalidierung  
**TOOLS:** Jest Test Framework + describe/it/expect APIs

```typescript
// ✅ FUNCTION TO TEST
// Pure function: gleiche Inputs → gleiche Outputs, keine Side Effects
export function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// ✅ UNIT TEST STRUCTURE
// describe() gruppiert related tests, it() beschreibt einzelne Test-Cases
describe('calculateTotalPrice', () => {
  // Test Case 1: Normal path mit realistischen Daten
  it('should calculate total price correctly', () => {
    const items = [
      { price: 10, quantity: 2 },  // 10 * 2 = 20
      { price: 5, quantity: 3 },   // 5 * 3 = 15
    ];                             // Total: 20 + 15 = 35
    
    expect(calculateTotalPrice(items)).toBe(35);
  });

  // Test Case 2: Edge Case - leerer Input
  it('should return 0 for empty cart', () => {
    expect(calculateTotalPrice([])).toBe(0);
  });

  // Test Case 3: Edge Case - zero values
  it('should handle zero quantities', () => {
    const items = [{ price: 10, quantity: 0 }];  // 10 * 0 = 0
    expect(calculateTotalPrice(items)).toBe(0);
  });
  
  // Test Case 4: Error handling - negative values
  it('should handle negative prices gracefully', () => {
    const items = [{ price: -10, quantity: 2 }];  // -10 * 2 = -20
    expect(calculateTotalPrice(items)).toBe(-20);
  });
});
```

### **Component Testing**
**WAS:** Tests für React Components ohne Browser - Rendering, Props, User Interactions  
**WARUM:** Sicherstellen dass UI-Komponenten korrekt rendern und auf Events reagieren  
**WIE:** Component rendern, DOM-Elemente finden, User-Events simulieren, Changes testen  
**WANN:** Für alle wiederverwendbaren UI-Komponenten und kritische User-Interaktionen  
**TOOLS:** React Testing Library + Jest + DOM Testing Utilities

```typescript
// ✅ COMPONENT TEST SETUP
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  // Test Case 1: Render Testing - Component zeigt korrekte Inhalte
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    // screen.getByText() findet Element mit Text, toBeInTheDocument() checkt Existenz
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  // Test Case 2: Event Handling - Component reagiert auf User-Interaktionen
  it('should handle click events', () => {
    const handleClick = jest.fn();  // Mock function als Event Handler
    render(<Button onClick={handleClick}>Click me</Button>);
    
    // fireEvent.click() simuliert User-Click auf Button
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Test Case 3: State Testing - Component disabled state funktioniert
  it('should be disabled when loading', () => {
    render(<Button disabled>Loading...</Button>);
    // getByRole() findet Element nach semantischer Rolle (besser als CSS-Selektoren)
    expect(screen.getByRole('button')).toBeDisabled();
  });

  // Test Case 4: Props Testing - Component verhält sich je nach Props unterschiedlich
  it('should apply variant classes correctly', () => {
    render(<Button variant="outline" size="sm">Test</Button>);
    const button = screen.getByRole('button');
    // toHaveClass() checkt CSS-Klassen (für styling validation)
    expect(button).toHaveClass('border', 'border-input');
  });
});
```

### **Custom Hooks Testing**
**WAS:** Tests für wiederverwendbare Hook-Logic ohne Component-Context  
**WARUM:** Hooks enthalten oft komplexe State-Logic die isoliert getestet werden muss  
**WIE:** renderHook() für Hook-Isolation, act() für State-Updates, Result-Validation  
**WANN:** Für Custom Hooks mit State-Management, API-Calls oder komplexer Logic  
**TOOLS:** React Testing Library Hooks + renderHook + act für State Updates

```typescript
// ✅ HOOK TEST SETUP
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '@/hooks/useCounter';

describe('useCounter Hook', () => {
  // Test Case 1: Initialization - Hook startet mit korrektem initial state
  it('should initialize with 0', () => {
    // renderHook() erstellt isolierte Hook-Instanz ohne Component
    const { result } = renderHook(() => useCounter());
    // result.current enthält return value des Hooks
    expect(result.current.count).toBe(0);
  });

  // Test Case 2: State Updates - Hook functions ändern state korrekt
  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());
    
    // act() batched state updates (wie in echten React Components)
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  // Test Case 3: Custom Initial Value - Hook akzeptiert parameters korrekt
  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  // Test Case 4: Reset Functionality - Reset function arbeitet korrekt
  it('should reset to 0', () => {
    const { result } = renderHook(() => useCounter(5));
    
    // Erst increment, dann reset um state change zu testen
    act(() => {
      result.current.increment();
      result.current.increment();
    });
    expect(result.current.count).toBe(7);
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.count).toBe(0);
  });
});
```

---

## 🔗 **INTEGRATION TESTS - SYSTEM INTERACTIONS**

**WAS:** Tests für das Zusammenspiel mehrerer System-Komponenten (API + Database + Components)  
**WARUM:** Unit Tests testen isoliert, aber echte Bugs entstehen oft an Schnittstellen  
**WIE:** Realistische Test-Umgebung mit echten/gemockten Services, vollständige Workflows  
**WANN:** Für kritische Datenwege, API-Endpoints, Database-Operations, Component-Interactions  
**TOOLS:** Jest + Supertest (API) + Prisma Mocks + MSW (HTTP Mocking)

### **API Endpoint Testing**
**WAS:** Tests für Next.js API Routes mit realistischen HTTP-Requests und Responses  
**WARUM:** API-Bugs sind critical - fehlerhafte Endpoints brechen Frontend-Funktionalität  
**WIE:** Mock-HTTP-Requests an echte API-Handler, Response-Status und Data validieren  
**WANN:** Für alle API-Endpoints die Frontend verwendet, besonders CRUD-Operations  
**TOOLS:** next-test-api-route-handler + Jest + HTTP Mocking Libraries

```typescript
// ✅ API INTEGRATION TEST
import { testApiHandler } from 'next-test-api-route-handler';
import handler from '@/pages/api/dashboards/[id]';

describe('/api/dashboards/[id]', () => {
  // Test Case 1: Success Path - API liefert korrekte Daten
  it('should return dashboard by ID', async () => {
    await testApiHandler({
      handler,                                    // Next.js API Route Handler
      params: { id: 'dashboard-123' },           // URL Parameters für [id]
      test: async ({ fetch }) => {               // fetch = Mock HTTP Client
        const res = await fetch({ method: 'GET' });  // HTTP GET Request
        const data = await res.json();               // Parse JSON Response
        
        expect(res.status).toBe(200);                 // Success Status
        expect(data).toMatchObject({                  // Validate Response Shape
          id: 'dashboard-123',
          title: expect.any(String),                  // Any string is valid
          widgets: expect.any(Array),                 // Array (empty or filled)
        });
      },
    });
  });

  // Test Case 2: Error Path - API handled nonexistent resources
  it('should return 404 for non-existent dashboard', async () => {
    await testApiHandler({
      handler,
      params: { id: 'non-existent' },
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'GET' });
        expect(res.status).toBe(404);                // Not Found Status
        
        const data = await res.json();
        expect(data).toHaveProperty('error');        // Error message present
      },
    });
  });

  // Test Case 3: Authorization - API checkt User Permissions
  it('should require authentication', async () => {
    await testApiHandler({
      handler,
      params: { id: 'dashboard-123' },
      test: async ({ fetch }) => {
        // Request ohne Auth Header
        const res = await fetch({ 
          method: 'GET',
          headers: {}                              // No Authorization header
        });
        expect(res.status).toBe(401);              // Unauthorized
      },
    });
  });
});
```

### **Database Operation Testing**
**WAS:** Tests für Database-Service-Layer mit Prisma ORM ohne echte Database  
**WARUM:** Database-Logic ist fehleranfällig und schwer zu debuggen in Production  
**WIE:** Mock Prisma Client, definiere Return Values, validiere function calls  
**WANN:** Für alle Database-Operations (CRUD), komplexe Queries, Data Transformations  
**TOOLS:** Prisma Mock Client + Jest Mocks + Database Schema Validation

```typescript
// ✅ DATABASE INTEGRATION TEST
import { prismaMock } from '@/lib/__mocks__/prisma';
import { createDashboard, getDashboard } from '@/lib/dashboard-service';

describe('Dashboard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create dashboard successfully', async () => {
    const mockDashboard = {
      id: '123',
      title: 'Test Dashboard',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.dashboard.create.mockResolvedValue(mockDashboard);

    const result = await createDashboard({
      title: 'Test Dashboard',
      userId: 'user-123',
    });

    expect(result).toEqual(mockDashboard);
    expect(prismaMock.dashboard.create).toHaveBeenCalledWith({
      data: {
        title: 'Test Dashboard',
        userId: 'user-123',
      },
    });
  });
});
```

### **State Management Testing**
```typescript
// ✅ ZUSTAND STORE TEST
import { act, renderHook } from '@testing-library/react';
import { useDashboardStore } from '@/store/dashboard-store';

describe('Dashboard Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useDashboardStore.getState().reset();
  });

  it('should add dashboard to store', () => {
    const { result } = renderHook(() => useDashboardStore());
    
    const newDashboard = {
      id: '123',
      title: 'Test Dashboard',
      widgets: [],
    };

    act(() => {
      result.current.addDashboard(newDashboard);
    });

    expect(result.current.dashboards).toContain(newDashboard);
  });
});
```

---

## 🎭 **E2E TESTS (Playwright) - VOLLSTÄNDIGE USER-JOURNEYS**

**WAS:** Tests die echte Browser automatisieren um komplette User-Workflows zu validieren  
**WARUM:** Integration Tests finden System-Bugs, aber nur E2E Tests finden UX-Probleme  
**WIE:** Echter Browser (Chrome/Firefox) wird automatisiert, alle System-Layer involved  
**WANN:** Für kritische User-Flows (Login, Dashboard, Payment), vor Production-Releases  
**TOOLS:** Playwright Browser Automation + Headless/UI Mode + Screenshots + Videos

### **Critical User Journey Testing**
**WAS:** Vollständige User-Szenarien vom Login bis zur fertigen Aktion  
**WARUM:** Echte Users verwenden mehrere Features zusammen - das muss getestet werden  
**WIE:** Browser-Navigation simulieren, Forms ausfüllen, Interactions durchführen  
**WANN:** Für Haupt-Features die Business-critical sind (Dashboard-Erstellung, Data-Export)  
**TOOLS:** Playwright Page Objects + Test Selectors + Assertions + Visual Testing

```typescript
// ✅ E2E USER JOURNEY TEST
import { test, expect } from '@playwright/test';

test.describe('Dashboard Management', () => {
  test('user can create and edit dashboard', async ({ page }) => {
    // Step 1: Login Flow - User Authentication
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');      // Fill email field
    await page.fill('[data-testid="password"]', 'password123');        // Fill password field
    await page.click('[data-testid="login-button"]');                  // Submit login form

    // Step 2: Navigation - Verify successful login and navigate
    await page.goto('/dashboards');
    await expect(page).toHaveURL('/dashboards');                       // URL changed correctly

    // Step 3: Dashboard Creation - Core Business Logic
    await page.click('[data-testid="create-dashboard"]');              // Open create dialog
    await page.fill('[data-testid="dashboard-title"]', 'My Test Dashboard'); // Name dashboard
    await page.click('[data-testid="save-dashboard"]');                // Submit creation

    // Verification 1: Dashboard Creation Success
    await expect(page.locator('text=My Test Dashboard')).toBeVisible(); // Dashboard appears in list

    // Step 4: Widget Addition - Advanced Functionality
    await page.click('[data-testid="add-widget"]');                    // Open widget menu
    await page.click('[data-testid="widget-type-chart"]');             // Select chart type
    await page.fill('[data-testid="widget-title"]', 'Sales Chart');    // Name widget
    await page.click('[data-testid="create-widget"]');                 // Create widget

    // Verification 2: Widget Creation Success
    await expect(page.locator('text=Sales Chart')).toBeVisible();      // Widget appears on dashboard
    
    // Step 5: Data Persistence Check
    await page.reload();                                                // Refresh page
    await expect(page.locator('text=Sales Chart')).toBeVisible();      // Widget still visible
  });

  test('dashboard persists after page reload', async ({ page }) => {
    await page.goto('/dashboards/test-dashboard-123');
    
    // Interact with widget
    await page.dragAndDrop(
      '[data-testid="widget-sales-chart"]',
      '[data-grid-position="2,3"]'
    );

    // Reload page
    await page.reload();

    // Verify widget position persisted
    const widget = page.locator('[data-testid="widget-sales-chart"]');
    await expect(widget).toHaveAttribute('data-grid-x', '2');
    await expect(widget).toHaveAttribute('data-grid-y', '3');
  });
});
```

### **Performance Testing**
```typescript
// ✅ PERFORMANCE E2E TEST
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('dashboard loads within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/dashboards/complex-dashboard');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  test('widget interactions are responsive', async ({ page }) => {
    await page.goto('/dashboards/test');
    
    // Measure drag performance
    const startTime = Date.now();
    await page.dragAndDrop('[data-testid="widget-1"]', '[data-grid="2,2"]');
    const dragTime = Date.now() - startTime;
    
    expect(dragTime).toBeLessThan(500); // Should complete within 500ms
  });
});
```

---

## 🎯 **TEST-FIRST DEVELOPMENT PATTERNS - RED-GREEN-REFACTOR**

**WAS:** Entwicklungsmethode wo Tests ZUERST geschrieben werden, dann Code um Tests zu erfüllen  
**WARUM:** Verhindert Over-Engineering, zwingt zu klarem Design, bessere Code-Qualität  
**WIE:** Test schreiben (Red) → Code schreiben (Green) → Code verbessern (Refactor)  
**WANN:** Bei neuen Features, Complex Business Logic, Critical System Components  
**TOOLS:** Jest Test Framework + Test Coverage Tools + Continuous Testing

### **Red-Green-Refactor für Features**
**WAS:** 3-Phasen-Zyklus für Feature-Entwicklung mit Tests als Design-Instrument  
**WARUM:** Garantiert dass Code testbar ist und nur notwendige Features implementiert werden  
**WIE:** Failing Test → Minimal Code → Clean Code, iterativ für jede Function  
**WANN:** Für jede neue Function, Component, Feature die kritisch für Business ist  
**TOOLS:** Jest Watch Mode für schnelles Feedback + Code Coverage Reports

```typescript
// PHASE 1: RED - Schreibe fehlschlagenden Test ZUERST
// Test definiert das gewünschte Verhalten BEVOR Code existiert
describe('Dashboard Widget', () => {
  it('should delete widget when delete button clicked', () => {
    // Definiere Expected Behavior: Widget soll onDelete callback aufrufen
    const mockOnDelete = jest.fn();                           // Mock function für callback
    render(<Widget id="123" onDelete={mockOnDelete} />);     // Widget noch nicht implementiert = FAIL
    
    fireEvent.click(screen.getByTestId('delete-widget-123')); // Erwartete UI-Struktur
    expect(mockOnDelete).toHaveBeenCalledWith('123');        // Erwartetes Verhalten
    // ❌ TEST FAILS: Widget component existiert noch nicht
  });
});

// PHASE 2: GREEN - Schreibe MINIMALEN Code um Test zu erfüllen
// Implementiere nur was nötig ist um Test zu bestehen, nichts mehr
function Widget({ id, onDelete }) {
  return (
    <div>
      <button 
        data-testid={`delete-widget-${id}`}          // Test-ID wie im Test erwartet
        onClick={() => onDelete(id)}                 // Callback wie im Test erwartet
      >
        Delete
      </button>
    </div>
  );
}
// ✅ TEST PASSES: Minimal implementation erfüllt alle Test-Requirements

// PHASE 3: REFACTOR - Verbessere Code OHNE Tests zu ändern
// Erweitere Funktionalität, verbessere Design, behalte Tests grün
function Widget({ id, onDelete, title, type }) {
  // Bessere UX: Confirmation Dialog vor Delete
  const handleDelete = useCallback(() => {
    if (confirm('Are you sure you want to delete this widget?')) {
      onDelete(id);
    }
  }, [id, onDelete]);

  return (
    <div className="widget-container border rounded-lg p-4">
      <div className="widget-header flex justify-between items-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button 
          data-testid={`delete-widget-${id}`}        // Test-ID bleibt gleich
          onClick={handleDelete}                      // Erweiterte Logic, aber gleiches Interface
          className="delete-button text-red-600 hover:bg-red-50"
          aria-label={`Delete ${title} widget`}
        >
          Delete
        </button>
      </div>
      <div className="widget-content mt-2">
        {/* Widget content based on type */}
        {type === 'chart' && <ChartComponent />}
        {type === 'text' && <TextComponent />}
      </div>
    </div>
  );
}
// ✅ TEST STILL PASSES: Erweiterte Funktionalität bricht vorhandene Tests nicht
```

---

## 📊 **TESTING COMMANDS & SCRIPTS - AUTOMATED QUALITY**

**WAS:** NPM Scripts und CI/CD Commands für automatisierte Test-Ausführung  
**WARUM:** Manuelle Tests werden vergessen, automatisierte Tests laufen immer  
**WIE:** Package.json Scripts + GitHub Actions + Coverage Reports + Quality Gates  
**WANN:** Bei jedem Commit, vor jeden Merge, vor Production-Deployments  
**TOOLS:** NPM Scripts + Jest CLI + Playwright CLI + Coverage Tools

### **Jest Configuration**
**WAS:** NPM Scripts für verschiedene Jest Test-Modi (Watch, CI, Coverage)  
**WARUM:** Verschiedene Entwicklungsphasen brauchen verschiedene Test-Modi  
**WIE:** package.json Scripts rufen Jest mit verschiedenen Flags auf  
**WANN:** Development (watch), CI Pipeline (coverage), Debugging (specific paths)  
**TOOLS:** Jest CLI + Coverage Reports + File Pattern Matching

```json
// package.json - Jest Test Scripts für verschiedene Szenarien
{
  "scripts": {
    // Development: Tests laufen automatisch bei Code-Änderungen
    "test": "jest --watch",
    // CI/CD: Coverage-Report generieren, kein Watch-Mode
    "test:ci": "jest --coverage --watchAll=false",
    // Unit Tests: Nur isolierte Function/Component Tests
    "test:unit": "jest --testPathPattern='/__tests__/unit'",
    // Integration Tests: API + Database + Component Integration
    "test:integration": "jest --testPathPattern='/__tests__/integration'",
    // Debug Mode: Single Test-File für Debugging
    "test:debug": "jest --no-coverage --watch --testNamePattern"
  }
}
```

### **Playwright Configuration**
**WAS:** E2E Test Scripts für verschiedene Browser-Modi (Headless, UI, Debug)  
**WARUM:** E2E Tests brauchen verschiedene Modi je nach Entwicklungsphase  
**WIE:** Playwright CLI mit verschiedenen Browser-Options und UI-Modi  
**WANN:** CI Pipeline (headless), Development (UI), Debugging (headed)  
**TOOLS:** Playwright CLI + Browser Automation + Visual Testing

```json
// package.json - Playwright E2E Scripts für verschiedene Modi
{
  "scripts": {
    // CI/CD: Headless browser, parallel execution, fast
    "test:e2e": "playwright test",
    // Development: Visual UI für Test-Entwicklung und Debugging
    "test:e2e:ui": "playwright test --ui",
    // Debugging: Browser visible, slow execution, step-by-step
    "test:e2e:headed": "playwright test --headed",
    // Single Browser: Nur Chrome für schnelle Entwicklung
    "test:e2e:chrome": "playwright test --project=chromium",
    // Recording: Generate new tests durch Browser-Recording
    "test:e2e:record": "playwright codegen localhost:3000"
  }
}
```

---

## 🎯 **TESTING SUCCESS METRICS - QUALITY ASSURANCE**

**WAS:** Messbare Qualitätsziele für Test-Coverage und Code-Qualität  
**WARUM:** Ohne klare Ziele ist Qualität nicht messbar oder verbesserbar  
**WIE:** Coverage-Tools, Quality-Gates in CI/CD, Performance-Monitoring  
**WANN:** Bei jedem Build, vor jeden Release, bei Code-Reviews kontinuierlich  
**TOOLS:** Jest Coverage + SonarQube + Performance Monitoring + Quality Gates

### **Coverage Targets**
```typescript
// jest.config.js - Coverage Thresholds für Quality Gates
{
  coverageThreshold: {
    global: {
      branches: 80,        // 80%+ Branch Coverage für komplexe Logic
      functions: 80,       // 80%+ Function Coverage für alle Business Logic
      lines: 80,          // 80%+ Line Coverage für Code-Ausführung
      statements: 80      // 80%+ Statement Coverage für alle Code-Pfade
    },
    // Kritische Module brauchen höhere Coverage
    './src/lib/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
}
```

**Coverage-Strategie:**
- **Unit Tests:** 80%+ Coverage (schnelle Feedback-Loop)
- **Integration Tests:** Kritische Datenwege komplett abgedeckt  
- **E2E Tests:** Haupt-User-Journeys (Login → Dashboard → Export)
- **Performance Tests:** <3s Load Time, <100ms API Response

### **Quality Gates**
**WAS:** Automatische Checks die verhindern dass schlechte Code in Production geht  
**WARUM:** Menschen vergessen Quality-Checks, Maschinen vergessen nie  
**WIE:** CI/CD Pipeline blockt Merges wenn Quality-Standards nicht erfüllt  
**WANN:** Bei jedem Pull Request, vor jedem Deployment  
**TOOLS:** GitHub Actions + Jest + ESLint + TypeScript + Performance Tests

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate
on: [pull_request]
jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - name: Run Tests
        run: npm run test:ci
      - name: Check Coverage
        run: |
          if [ $(cat coverage/coverage-summary.json | jq '.total.lines.pct') -lt 80 ]; then
            echo "Coverage below 80%"
            exit 1
          fi
      - name: TypeScript Check
        run: npm run type-check
      - name: Lint Check
        run: npm run lint
      - name: E2E Tests
        run: npm run test:e2e
      - name: Performance Check
        run: npm run test:performance
```

**Success Criteria:**
- ✅ Alle Tests bestehen ohne Errors
- ✅ Coverage bleibt über Mindest-Schwellen
- ✅ TypeScript kompiliert ohne Errors  
- ✅ ESLint zeigt keine kritischen Issues
- ✅ E2E Tests bestehen in CI-Umgebung
- ✅ Performance-Budgets werden eingehalten

---

---

## 🔗 **INTEGRATION MIT ANDEREN CLAUDE FILES**

**Beim Anwenden dieser Test-Strategien:**
- [ ] Red-Green-Refactor → Folge CLAUDE.md Docker Workflow (./scripts/quick-restart.sh nach Tests)
- [ ] Error Boundary Tests → Verwende CLAUDE_PATTERNS.md Error Handling (Zeilen 420-476)
- [ ] Visual Testing → Nutze DESIGN-SYSTEM.md Farben für Screenshot-Vergleiche
- [ ] Performance Tests → Halte STANDARDS.md Core Web Vitals (LCP < 2.5s, FID < 100ms)
- [ ] GDPR Tests → Validiere STANDARDS.md Compliance (User Data Export/Delete)

**Cross-Reference Testing:**
- **CLAUDE.md**: Quality Gates und Docker Integration
- **CLAUDE_PATTERNS.md**: Error Handling und Component Patterns
- **DESIGN-SYSTEM.md**: Visual Consistency Testing
- **STANDARDS.md**: Security, Performance, GDPR Validation

---

**Diese Test-Strategien gewährleisten hohe Code-Qualität und ermöglichen Claude autonome Entwicklung mit messbarer Qualität und schnellem Feedback.**