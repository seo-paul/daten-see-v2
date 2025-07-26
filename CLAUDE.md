# **CLAUDE.md - Dashboard Projekt** 
*Optimiert für autonome Entwicklung*

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

### **📊 DEBUGGING DASHBOARD UPDATE (MANDATORY)**
- **Nach JEDER größeren Code-Änderung**: Automatisch `./scripts/collect-real-metrics.sh` ausführen
- **Nach Task-Completion**: Dashboard mit aktuellen Metriken updaten
- **Nach Feature-Implementation**: Achievement-Liste in real-metrics.json erweitern
- **REGEL**: Code-Änderung → Test → Dashboard Update → Commit

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

### **2. Autonomie-Level**
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
- **Quality Standards** - 80%+ Test Coverage, TypeScript strict
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
- 80%+ Test Coverage
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