# **CLAUDE.md - Dashboard Projekt** 
*Optimiert für autonome Entwicklung*

## 🧠 **KRITISCHES DENKEN & RÜCKFRAGEN**
**Du sollst KRITISCH HINTERFRAGEN und RÜCKFRAGEN stellen, um die bestmöglichen Ergebnisse zu erzielen:**

- ⚡ **Hinterfrage Anforderungen:** Ist das wirklich die beste Lösung?
- 🎯 **Bewerte Alternativen:** Gibt es bessere/einfachere Wege?
- 🔍 **Analysiere Trade-offs:** Performance vs. Komplexität vs. Wartbarkeit
- 💡 **Stelle Rückfragen:** Bei Unklarheiten → nachfragen statt raten
- 🏗️ **Prüfe Architektur:** Passt das zur bestehenden Codebase?
- 📊 **Validiere Business-Value:** Löst das echte Probleme?

**REGEL:** Bevor du implementierst → erkläre deine Überlegungen und hole Feedback ein!

## 📐 **BEST PRACTICES**
**Arbeite nach Industry Best Practices, wenn sinnvoll:**
- 🏗️ **Strategic Testing:** Focus on business-critical areas, not comprehensive coverage
- 📦 **SOLID Principles:** Single Responsibility, DRY, KISS
- 🔒 **Security First:** OWASP Top 10, Zero Trust
- 🎯 **Performance:** Core Web Vitals, Bundle Size
- ♿ **Accessibility:** WCAG 2.1 AA Standards
- 📚 **Clean Code:** Lesbar > Clever

**ABER:** Best Practice nur wenn es zum Projekt passt - Pragmatismus > Dogma!

## 🎯 **PROJEKTMISSION**
Erstelle ein **SaaS Analytics Dashboard** mit externen API-Integrationen. Du arbeitest **autonom** mit regelmäßigen Checkpoints.

---

## 🤝 **ARBEITSWEISE**

### **1. Standard-Workflow**
```bash
VERSTEHEN → PLANEN → IMPLEMENTIEREN → VALIDIEREN
```

### **🛑 KEINE QUICK FIXES**
- **Vollständige Lösungen** statt Symptom-Behandlung
- **Root Cause Analysis** vor jeder Implementation
- Bei Problemen → **Verstehen, dann lösen**

### **🔄 TEST & ROLLBACK PRINZIP**
- **Lösung testen** → Funktioniert nicht → **VOLLSTÄNDIGER ROLLBACK**
- **Ausgangspunkt wiederherstellen** vor nächstem Versuch
- **Keine akkumulierten Workarounds**

### **✅ COMPLETE FEATURES ONLY**
- **Keine Platzhalter** oder "TODO" Kommentare
- **Aufbauende Implementation** - jeder Schritt funktioniert vollständig
- **Ein Feature = Ein funktionierender Baustein**

### **🧪 COMPLEXITY-BASED TASK STRATEGY**
**Basiert auf erfolgreicher DI-Migration: 4 failing → 107 passing tests (100% Erfolg)**

#### **📊 COMPLEXITY INDICATORS & DECISION FRAMEWORK**
```bash
🟢 SIMPLE (1-3 files, <2h)     → Direct Implementation
🟡 MEDIUM (4-10 files, 2-8h)   → 2-3 Phase Approach  
🔴 COMPLEX (10+ files, >8h)    → 4-6 Phase Test-Driven
⚫ MEGA (system-wide, days)    → 6+ Phases + User Checkpoints
```

**Risk Indicators (upgrade complexity level):**
- Touching core authentication/authorization
- Database schema changes
- Breaking API changes
- Cross-component integrations
- Production-critical features

#### **📋 PHASE TEMPLATES**

**🟡 MEDIUM TASK (2-3 Phases):**
```
Phase 1: Core Implementation (60% effort)
├─ npm test + npx tsc --noEmit
├─ Basic functionality working
└─ Main happy path covered

Phase 2: Integration & Refinement (30% effort)  
├─ npm run lint + docker restart
├─ Error handling + edge cases
└─ Browser validation

Phase 3: Finalization (10% effort)
├─ Documentation + cleanup
└─ Final validation
```

**🔴 COMPLEX TASK (4-6 Phases):**
```
Phase 1: Foundation/Interface (20% effort)
├─ Test-driven interface design
├─ npm test (new tests pass)
└─ Clear contracts established

Phase 2: Core Logic Implementation (40% effort)
├─ Main functionality 
├─ npm test + TypeScript validation
└─ Integration points working

Phase 3: Dependencies & Integration (25% effort)
├─ Connect to existing systems
├─ npm test + lint + docker restart
└─ End-to-end flow working

Phase 4: Edge Cases & Error Handling (10% effort)
├─ Error scenarios + production safety
├─ Comprehensive test validation
└─ Browser/manual testing

Phase 5: Finalization & Documentation (5% effort)
├─ Code cleanup + documentation
└─ Final production readiness check
```

#### **⚖️ SMART TESTING BALANCE**

**✅ ALWAYS TEST & VALIDATE:**
- **Integration boundaries** (APIs, contexts, external services)
- **Complex business logic** (calculations, transformations, algorithms)
- **Error handling** (try/catch, edge cases, fallbacks)
- **Critical user flows** (auth, payments, data integrity)
- **Cross-component communication** (props, events, state)

**❌ SKIP TESTING (Efficiency):**
- Trivial constants & configuration objects
- Basic CRUD without business logic
- Simple prop passing & presentation components
- Auto-generated code & type definitions
- Single-line utilities & formatters

#### **🚀 VALIDATION EFFICIENCY MATRIX**

**Per Phase Validation Level:**
```
Simple Task    → npm test + TypeScript
Medium Phase 1 → npm test + TypeScript  
Medium Phase 2 → + npm run lint + docker restart
Medium Phase 3 → + browser validation

Complex Phase 1 → npm test + TypeScript (interface focus)
Complex Phase 2 → + integration tests
Complex Phase 3 → + lint + docker + browser testing  
Complex Phase 4 → + error scenario testing
Complex Phase 5 → + production readiness validation
```

**🎯 Parallel Validation (Efficiency):**
```bash
# Single command for speed
npm test & npx tsc --noEmit & npm run lint & wait
./scripts/quick-restart.sh & browser-check & wait
```

#### **✅ SUCCESS CRITERIA PER PHASE**
- **Code Quality:** All validations pass (test/lint/TypeScript)
- **Functionality:** Phase objectives 100% met
- **Integration:** Connecting systems work flawlessly  
- **No Regression:** Existing functionality unchanged
- **Documentation:** Complex decisions explained

**🛑 PHASE FAILURE = FULL ROLLBACK**
- Restore previous working state completely
- Analyze root cause before retry
- Adjust approach if needed

### **📊 DEBUGGING DASHBOARD UPDATE (MANDATORY - AUTOMATISIERT)**
- **Nach JEDER Task-Completion**: Automatisch `./scripts/collect-real-metrics.sh` ausführen
- **Nach Code-Änderungen**: Dashboard mit aktuellen Metriken updaten
- **Nach Feature-Implementation**: Achievement-Liste in real-metrics.json erweitern
- **AKTUELLER STATUS**: 
  - ❌ **85 TypeScript Errors** (kritisch)
  - ❌ **19 ESLint Errors** (hoch)  
  - ⚠️ **17 ESLint Warnings** (medium)
  - **Overall Score: 66/100** (needs improvement)
- **WORKFLOW**: Task Start → Code → Test → `./scripts/collect-real-metrics.sh` → Commit
- **ZIEL**: Alle Errors auf 0 reduzieren für solid foundation vor Chart.js Integration

### **🔧 HYBRID DEVELOPMENT WORKFLOW**

#### **⚡ QUICK DEV CHECKS (npm-basiert, für Speed):**
- ✅ **npm run lint** - ESLint Validierung
- ✅ **npx tsc --noEmit** - TypeScript Compilation Check
- ✅ **Quick syntax/type checks** für Development Feedback

#### **🐳 INTEGRATION & DEPLOYMENT (Docker-basiert, für Konsistenz):**
- ✅ **./scripts/quick-restart.sh** - Container rebuild & restart
- ✅ **docker logs** - Runtime error checking
- ✅ **Full application testing** in production-like environment

#### **📋 COMPLETE VALIDATION WORKFLOW:**
```bash
# Nach Code-Änderungen:
# 1. SCHNELLE CHECKS (Host):
npm run lint                    # ESLint errors
npx tsc --noEmit               # TypeScript compilation

# 2. INTEGRATION TEST (Docker):
./scripts/quick-restart.sh     # Container rebuild
docker logs daten-see-app      # Runtime validation

# 3. COMMIT nur wenn beide Stufen erfolgreich
git add . && git commit -m "fix: description"
```

#### **🔄 RESTART-TRIGGERING EVENTS:**
- **IMMER restart**: `package.json` changes, new dependencies, Docker config
- **NIEMALS restart**: Source code changes (TS/TSX/CSS) → Hot reload genügt
- **CONDITIONAL restart**: Environment variables, config files

#### **🛠️ DOCKER COMMAND REFERENCE:**
```bash
# ✅ VALIDATION (inside container)
docker exec $CONTAINER_ID npm run lint -- --fix
docker exec $CONTAINER_ID npm run build         # Production build test
docker exec $CONTAINER_ID npm run test:coverage # Coverage report

# ✅ DEBUGGING
./scripts/docker-dev.sh logs    # Application logs
./scripts/docker-dev.sh shell   # Container shell access
./scripts/docker-dev.sh stats   # Performance monitoring

# ✅ MANAGEMENT  
./scripts/quick-restart.sh       # Standard restart
./scripts/docker-dev.sh rebuild  # Force rebuild (issues)
```

#### **🚨 ABSOLUTE VERBOTE (Host Commands):**
```bash
# ❌ NEVER ON HOST:
npm run dev
npm run build  
npm run lint
npm test
npx tsc --noEmit
# → Use: docker exec $CONTAINER_ID [command]
```

### **📋 ROADMAP WORKFLOW (MANDATORY)**
- **IMMER der Roadmap folgen**: Niemals Tasks überspringen oder eigene Reihenfolge wählen
- **Task-Batch laden**: Bei Start einer Haupttask (z.B. 1.7) ALLE Subtasks (1.7.1, 1.7.2, etc.) in TodoWrite laden
- **TodoWrite als Arbeitsliste**: Nutze TodoWrite als primären Zwischenspeicher für alle anstehenden Subtasks
- **Sequentielle Bearbeitung**: Task X.Y.Z vollständig abschließen BEVOR X.Y.(Z+1) beginnt

#### **HYBRID TEST & COMMIT WORKFLOW:**
- **Nach JEDER Subtask (z.B. 1.7.6.1):**
  1. Lokale Tests: `npm test` (schnell)
  2. Type-Check: `npm run typecheck` (schnell)
  3. Bei Fehler → sofort fixen
  4. TodoWrite Status update
  
- **Nach AUFGABEN-BATCH (z.B. alle 1.7.6):**
  1. Lint Check: `npm run lint`
  2. Docker restart: `./scripts/quick-restart.sh`
  3. Vollständige Tests im Browser
  4. Git commit mit Summary aller Subtasks
  5. In IMPLEMENTATION-ROADMAP.md alle Subtasks abhaken: `[ ]` → `[x]` + `✅ **COMPLETED**`
  6. Git push
  
- **REGEL**: Code-Qualität durch kontinuierliche Tests, Effizienz durch Batch-Commits

### **⚠️ ABWEICHUNG VOM PLAN (MANDATORY)**
- **NIEMALS eigenmächtig vom geplanten Vorgehen abweichen**
- **VOR jeder Abweichung**: User mit bewerteten Alternativen informieren
- **Format**: Problem → Alternative 1 (Pro/Contra/Aufwand) → Alternative 2 → Alternative 3 → Empfehlung
- **Gemeinsame Entscheidung**: User entscheidet welche Alternative umgesetzt wird
- **REGEL**: Lieber nachfragen als eigenständig "optimieren"

### **2. COMPLEXITY-BASED TASK STRATEGY**

#### **📊 TASK COMPLEXITY DECISION FRAMEWORK**

**🎯 SUCCESS BASELINE:** Dependency injection migration (4 failing → 107 passing tests, zero regressions)

##### **COMPLEXITY INDICATORS (Choose Approach Based On):**

**🟢 SIMPLE TASKS → Direct Implementation**
- **Criteria:** 1-3 files affected, isolated changes, no critical dependencies
- **Examples:** UI tweaks, single component updates, documentation changes
- **Validation:** Standard quality gates only
- **Time:** < 30 minutes

**🟡 MEDIUM TASKS → 2-3 Phase Approach**
- **Criteria:** 4-10 files affected, some cross-dependencies, business logic changes
- **Examples:** New feature with tests, API endpoint + UI integration, refactoring
- **Validation:** Tests after each phase + final integration check
- **Time:** 30-90 minutes

**🔴 COMPLEX TASKS → 4-6 Phase Incremental (TEST-DRIVEN)**
- **Criteria:** 10+ files affected, system-wide impact, critical path modifications
- **Examples:** Architecture changes, large refactors, dependency migrations
- **Risk Factors:** Production impact, data integrity, security implications
- **Validation:** Full test suite after each phase
- **Time:** 2+ hours

**⚫ MEGA TASKS → 6+ Phases with Checkpoints**
- **Criteria:** Cross-system changes, major version upgrades, complete rewrites
- **Examples:** Framework migrations, database schema changes, deployment pipeline
- **Validation:** User checkpoints between major phases
- **Time:** Multiple sessions

### **🚀 SUSTAINABLE CODE QUALITY & ULTRA THINK INTEGRATION**
**Basiert auf User-Feedback: "Keine quickfixes, nachhaltige Lösungen"**

#### **❌ ANTI-PATTERNS (ABSOLUT VERBOTEN):**
```typescript
// ❌ NIEMALS: ESLint Suppressions
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line react-hooks/exhaustive-deps

// ❌ NIEMALS: Quick Type Workarounds  
const data = response as any;

// ❌ NIEMALS: Error Hiding
try { riskyOperation(); } catch { /* ignore */ }
```

#### **✅ SUSTAINABLE SOLUTIONS:**
```typescript
// ✅ PROPER: Refactor unused vars
function processData({ userId, email }: { userId: string; email: string; unusedField?: string }) {
  return { userId, email }; // Only use what you need
}

// ✅ PROPER: Fix hook dependencies  
const login = useCallback(async (credentials) => {
  await authManager.login(credentials);
}, [authManager]); // Include dependencies

// ✅ PROPER: Type properly
interface ApiResponse {
  data: UserData[];
  meta: PaginationMeta;
}
const response: ApiResponse = await api.get('/users');
```

#### **🧠 ULTRA THINK & SUBAGENTS INTEGRATION**

##### **WHEN TO USE ULTRA THINK:**
**🎯 TRIGGER CONDITIONS:**
- ESLint/TypeScript errors > 10 (complex dependencies)
- Architecture decisions affecting >5 files
- User explicitly requests deep analysis ("ultra think")
- Production-critical changes (auth, payments, data)
- Complex refactoring with risk factors
- When multiple viable approaches exist

##### **ULTRA THINK PROCESS:**
**🔍 ANALYSIS FRAMEWORK:**
```
1. PROBLEM DECOMPOSITION
   ├─ Root cause analysis
   ├─ Dependencies mapping  
   ├─ Risk assessment
   └─ Impact evaluation

2. SOLUTION EXPLORATION
   ├─ Option A: [Approach + Pros/Cons]
   ├─ Option B: [Approach + Pros/Cons]
   ├─ Option C: [Approach + Pros/Cons]
   └─ RECOMMENDATION with reasoning

3. IMPLEMENTATION STRATEGY
   ├─ Phase breakdown
   ├─ Testing approach
   ├─ Rollback plan
   └─ Success metrics
```

##### **SUBAGENTS UTILIZATION:**
**🤖 WHEN TO DEPLOY SUBAGENTS:**
- **Research Tasks:** "Search for all X patterns in codebase"
- **Analysis Tasks:** "Identify all dependencies of component Y"
- **Validation Tasks:** "Check test coverage for module Z"
- **Documentation Tasks:** "Generate comprehensive API docs"

**⚡ SUBAGENT WORKFLOW:**
```bash
1. COMPLEX TASK DETECTED
   ↓
2. EVALUATE: Would subagents help?
   ├─ Multiple search/analysis tasks?
   ├─ Parallel information gathering needed?
   └─ Large codebase exploration required?
   ↓
3. PROPOSAL: "I suggest using subagents for..."
   ↓
4. USER APPROVAL
   ↓
5. DEPLOY AGENTS + SYNTHESIZE RESULTS
```

#### **🎯 QUALITY DECISION MATRIX**

**WHEN TO PROPOSE ULTRA THINK:**
| Complexity | Files Affected | Risk Level | Action |
|------------|---------------|------------|--------|
| 🟢 Simple  | 1-3          | Low        | Direct fix |
| 🟡 Medium  | 4-10         | Medium     | Consider ultra think |
| 🔴 Complex | 10+          | High       | **PROPOSE ultra think** |
| ⚫ Mega    | System-wide  | Critical   | **MANDATORY ultra think** |

**TRIGGER PHRASES:**
- User: "bewerte die Optionen" → **Ultra think required**
- User: "tiefe Analyse" → **Ultra think required**  
- User: "verschiedene Alternativen" → **Ultra think required**
- Multiple ESLint errors → **Consider ultra think**
- Architecture changes → **Consider ultra think**

#### **🔄 PHASE STRUCTURE TEMPLATES**

##### **Medium Task Template (2-3 Phases):**
```bash
Phase 1: Core Implementation (60% effort)
  ├── npm test (unit tests)
  └── npx tsc --noEmit (type check)

Phase 2: Integration & Edge Cases (30% effort)  
  ├── npm run lint
  ├── ./scripts/quick-restart.sh
  └── Browser testing

Phase 3: Finalization & Polish (10% effort)
  ├── Documentation updates
  ├── Final validation
  └── Git commit
```

##### **Complex Task Template (4-6 Phases):**
```bash
Phase 1: Foundation Setup (20% effort)
  ├── Types & interfaces
  ├── npm test (affected tests pass)
  └── TypeScript compilation

Phase 2: Core Logic Implementation (40% effort)
  ├── Main business logic
  ├── npm test (full test suite)
  └── Integration point validation

Phase 3: Dependencies & Integrations (25% effort)
  ├── Cross-component connections  
  ├── npm test + npm run lint
  └── ./scripts/quick-restart.sh

Phase 4: Edge Cases & Error Handling (10% effort)
  ├── Error boundaries & fallbacks
  ├── Full validation workflow
  └── Browser testing

Phase 5: Finalization & Cleanup (5% effort)
  ├── Code cleanup & optimization
  ├── Documentation updates
  └── Final commit with summary
```

#### **⚖️ VALIDATION BALANCE STRATEGY**

##### **🎯 LEAN TESTING STRATEGY (Quality over Quantity):**

**✅ ALWAYS TEST:**
- Integration boundaries & API connections
- Complex business logic & calculations  
- Error handling & edge cases
- Critical user flows & data integrity
- Cross-component dependencies

**⚠️ SELECTIVE TESTING:**
- Simple getters/setters (test only if complex logic)
- UI components (snapshot tests for complex ones)
- Configuration files (test critical paths only)
- Pure utility functions (test complex algorithms only)

**❌ SKIP TESTING:**
- Trivial constants & enums
- Basic CRUD operations without business logic
- Simple prop passing in React components
- Auto-generated code & type definitions

##### **📈 VALIDATION EFFICIENCY MATRIX:**

| Phase Type | Unit Tests | Integration | E2E | Browser Check |
|------------|------------|-------------|-----|---------------|
| Foundation | ✅ Critical only | ❌ | ❌ | ❌ |
| Core Logic | ✅ All affected | ✅ Key flows | ❌ | ❌ |
| Integration | ✅ Full suite | ✅ All paths | ⚠️ Smoke test | ✅ Manual |
| Finalization | ✅ Full suite | ✅ All paths | ✅ Critical flows | ✅ Complete |

#### **🚀 EFFICIENCY MAXIMIZERS**

##### **PARALLEL VALIDATION COMMANDS:**
```bash
# Run simultaneously for speed:
npm test & npx tsc --noEmit & npm run lint &
wait  # Wait for all to complete
```

##### **QUICK DECISION CRITERIA:**
- **Files affected < 5** → Direct implementation
- **Tests currently failing** → Always use incremental approach  
- **Production deadline pressure** → Medium approach with focused testing
- **New architecture/patterns** → Complex approach with full validation
- **User explicitly requests "quick fix"** → Document risks, proceed direct

##### **SUCCESS CRITERIA PER PHASE:**
- **Green Tests:** All existing tests pass
- **Clean Compilation:** No TypeScript errors
- **Lint Compliance:** No new warnings
- **Browser Functionality:** Feature works as expected
- **Performance Baseline:** No regression in load times

#### **📋 DECISION WORKFLOW:**

```bash
1. ANALYZE TASK COMPLEXITY
   ├── Count affected files
   ├── Identify critical dependencies  
   ├── Assess risk factors
   └── Estimate effort

2. SELECT APPROACH
   ├── Simple → Direct implementation
   ├── Medium → 2-3 phases
   ├── Complex → 4-6 phases  
   └── Mega → Checkpoint with user

3. EXECUTE WITH VALIDATION
   ├── Run appropriate tests per phase
   ├── Validate integration points
   ├── Check for regressions
   └── Document any deviations

4. FINALIZE & COMMIT
   ├── Complete validation workflow
   ├── Update documentation
   ├── Commit with clear summary
   └── Update TodoWrite status
```

### **3. Autonomie-Level**
**Erkläre erst, code dann:**
**Du schlägst vor, bewertest und begründest die Optionen:** das gilt für alle Schritte insbesondere Implementation-Details, Tool-Auswahl, Code-Struktur, Feature-Requirements, UI/UX-Änderungen, Business-Logik, Architektur-Entscheidungen, Performance-Trade-offs
- Stichpunkte **vor** jeder Implementation
- Bei Unklarheiten deinerseits → Nachfragen statt Raten
- **User entscheidet** ob Änderungen notwendig sind und gibt es dann frei
- Ein Feature = Ein Commit

---

## ✅ **QUALITÄTS-GATES**

### **Automatische Validierung:**
- [ ] TypeScript kompiliert ohne Errors
- [ ] Tests laufen durch (`npm test`)
- [ ] ESLint/Prettier ohne Warnings
- [ ] Docker Container startet erfolgreich

### **Manuelle Validierung:**
- [ ] Feature funktioniert im Browser
- [ ] Responsive Design auf Mobile
- [ ] Error States zeigen sinnvolle Messages
- [ ] Performance ist akzeptabel (< 3s Load)

---

## 🛠️ **IMPLEMENTATION-STANDARDS**

### **Code-Qualität:**
```typescript
// ✅ GOOD: Klar, typisiert, testbar
// Async function mit expliziten Types für Parameter und Return-Value
export async function fetchUserData(userId: string): Promise<UserData> {
  try {
    // HTTP GET mit Template-String (sicher gegen injection)
    const response = await api.get(`/users/${userId}`);
    // Zod validation für Runtime-Type-Safety
    return UserDataSchema.parse(response.data);
  } catch (error) {
    // Structured logging mit Context für debugging
    logger.error('User fetch failed', { userId, error });
    // Custom Error mit spezifischem Type für bessere Error-Handling
    throw new UserFetchError(error);
  }
}

// ❌ BAD: Untypisiert, ohne Error-Handling
// Keine Types, String-Concatenation unsicher, kein Error-Handling
const getUserData = (id) => api.get('/users/' + id).data
```

### **Error-Handling:**
- **Jede API-Call** braucht try/catch + Sentry tracking
- **Custom Error Classes** für spezifische Fehlertypen
- **UI Error Boundaries** mit Retry-Funktionalität
- **Siehe CLAUDE_PATTERNS.md** für konkrete Implementation-Beispiele

---

## 📋 **VERBINDLICHE STANDARDS**

### **🚨 KRITISCH: Alle Standards in STANDARDS.md sind PFLICHT**
- **GDPR/DSGVO Compliance** - Datenschutz von Anfang an
- **Security Standards** - Keine Kompromisse bei Sicherheit
- **Quality Standards** - Strategic test coverage of critical paths, TypeScript strict
- **Performance Standards** - Core Web Vitals einhalten
- **Accessibility Standards** - WCAG 2.1 AA Compliance

**➡️ Siehe STANDARDS.md für vollständige Anforderungen**

### **🔍 STANDARDS-CHECK vor jedem Push:**
**VOR jedem git commit/push MUSS ich STANDARDS.md komplett durchgehen:**
- [ ] **GDPR-Check:** Alle neuen Features DSGVO-konform?
- [ ] **Security-Check:** Keine Vulnerabilities eingeführt?
- [ ] **Quality-Check:** Tests geschrieben, Coverage ausreichend?
- [ ] **Performance-Check:** Keine Regression in Core Web Vitals?
- [ ] **Accessibility-Check:** WCAG 2.1 AA eingehalten?

### **🔒 GDPR COMPLIANCE WORKFLOW (MANDATORY)**
**VOR Implementation JEDES Features mit User-Daten:**
1. **Legal Basis Check**: Hat dieses Feature proper legal basis? (STANDARDS.md Zeilen 12-17)
2. **Data Minimization**: Sammeln wir nur notwendige Daten? (STANDARDS.md Zeile 13)
3. **User Rights**: Kann User diese Daten exportieren/löschen? (STANDARDS.md Zeilen 47-52)
4. **Consent Management**: Proper Opt-in/Opt-out implementiert? (STANDARDS.md Zeilen 20-45)

**🛑 STOP REGEL**: Bei JEDER GDPR-Unsicherheit → User fragen BEVOR Implementation!

**⚠️ WICHTIG:** Bei JEDER Unstimmigkeit oder Unsicherheit bezüglich STANDARDS.md:
**STOPPE sofort und informiere den User BEVOR weitergemacht wird!**

Beispiele für Standards-Konflikte die User-Rückfrage erfordern:
- Datenschutz-Bedenken bei neuen Features
- Performance-Probleme durch neue Dependencies
- Security-Risiken durch API-Änderungen
- Accessibility-Probleme durch UI-Änderungen

---

## 🧪 **TESTING-STRATEGIE**

### **Test-Pyramide & Monitoring:**
```
E2E Tests (Playwright)     ← Kritische User-Flows
Integration Tests (Jest)   ← API + DB Interactions  
Unit Tests (Jest)          ← Pure Functions
Error Monitoring (Sentry)  ← Production Error Tracking
```

### **Siehe CLAUDE_TESTING.md für:**
- Detaillierte Test-Implementation-Patterns
- Jest + React Testing Library Beispiele
- Playwright E2E Test-Strategien
- Coverage-Targets und Quality-Gates

---

## 📁 **MODULARE DOKUMENTATION**

### **Smart Loading System:**
```bash
CLAUDE.md              ← Basis (immer laden)
CLAUDE_PATTERNS.md     ← Implementation-Patterns
CLAUDE_API.md         ← API-Integration Guidelines  
CLAUDE_TESTING.md     ← Testing-Strategies
CLAUDE_DEPLOYMENT.md  ← Production-Guidelines
```

**Loading-Regel:** Lade nur relevante Module für aktuellen Task.

---

## 🎭 **SLASH-COMMANDS**

```bash
/plan <feature>     → Strukturierter Implementierungsplan mit Dependencies
/review            → Code-Quality Check + Security-Review + Performance-Analyse  
/test <component>  → Schreibe/aktualisiere Unit + Integration + E2E Tests
/debug <issue>     → Systematische Problem-Analyse mit Root-Cause-Identification
/deploy           → Production-Ready Checklist + Security + Performance Validation
```

---

## 📊 **SUCCESS-METRIKEN**

### **Development Quality:**
- Zero `any` types in final code
- Strategic Coverage of Business-Critical Areas (45-50%)
- < 5 ESLint warnings
- All features have Error Boundaries

---

## 🔄 **ITERATION-CYCLE**

### **Feature-Development:**
1. **Plan** (5min) → Implementation-Strategie
2. **Code** (45min) → Feature + Tests
3. **Validate** (10min) → Quality-Gates prüfen
4. **Ship** → Commit + Docker restart

### **Bug-Fixing:**
1. **Reproduce** → Minimal failing case
2. **Root-Cause** → Warum ist es passiert?
3. **Fix** → Lösung + Prevention
4. **Test** → Regression-Test hinzufügen

---

## 📋 **ROADMAP INTEGRATION WORKFLOW**

### **⚠️ CRITICAL: Automatische Roadmap-Updates**
**BEI JEDER Implementation-Entscheidung die "Future Tasks" erzeugt:**

1. **SOFORT zur IMPLEMENTATION-ROADMAP.md hinzufügen:**
   ```bash
   - Task X.Y: [Beschreibung der fehlenden Funktion]
     - X.Y.1: [Spezifische Implementation]
     - X.Y.2: [Tests schreiben]
     - X.Y.3: [Integration testen]
   ```

2. **TodoWrite tool verwenden:**
   - Task zu aktueller Session hinzufügen
   - Priority setzen (high/medium/low)
   - Klare Success-Criteria definieren

3. **Beispiele für "Roadmap-pflichtige" Entscheidungen:**
   - Tests für noch nicht existierende Methoden entfernen
   - Placeholder-Implementierungen erstellen
   - "TODO" Kommentare hinzufügen
   - Features temporary disablen
   - Mock-Implementierungen verwenden

### **📝 Standard-Format für Roadmap-Tasks:**
```markdown
- [ ] **Task X.Y: [Feature Name]**
  - [ ] X.Y.1: [Implementation Step 1]
  - [ ] X.Y.2: [Testing]
  - [ ] X.Y.3: [Documentation/Integration]
  - **Tools:** [Verwendete Tools/Libraries]
  - **Success Criteria:** [Messbare Ziele]
  - **Why Now/Later:** [Begründung für Timing]
```

**✅ REGEL:** Niemals "later" oder "TODO" ohne Roadmap-Entry!

---

**Version 2.0** - Optimiert für autonome Claude-Entwicklung  
*"Weniger Regeln, mehr Resultate"*