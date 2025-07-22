# **CLAUDE_PATTERNS.md - Implementation Patterns**
*Bewährte Code-Patterns für autonome Entwicklung*

---

## 🎭 **REACT COMPONENT PATTERNS**

### **Functional Components mit TypeScript**
**WAS:** UI-Bausteine die Daten anzeigen und User-Interaktionen handhaben  
**WARUM:** Wiederverwendbare, testbare UI-Komponenten ohne Code-Duplizierung  
**WIE:** TypeScript definiert exakte Datentypen, React rendert HTML aus JavaScript  
**WANN:** Für jedes UI-Element (Buttons, Listen, Formulare, Karten)  
**TOOLS:** React + TypeScript + clsx für CSS-Klassen

```typescript
// ✅ STANDARD PATTERN
// Interface definiert alle Props mit strikten Types
// Optional props mit ? markiert für Flexibilität
interface ComponentProps {
  title: string;                        // Required: Titel für Component
  data: DataType[];                     // Required: Array von Datenobjekten
  onUpdate: (item: DataType) => void;   // Required: Callback für Updates
  className?: string;                   // Optional: Zusätzliche CSS-Klassen
}

// Functional Component mit destrukturiertem Props-Object
// TypeScript checkt automatisch alle Props zur Compile-Zeit
export function Component({ title, data, onUpdate, className }: ComponentProps) {
  // Local state für UI-spezifische Daten (loading indicator)
  const [loading, setLoading] = useState(false);
  
  return (
    // clsx kombiniert CSS-Klassen sicher (undefined wird ignoriert)
    <div className={clsx("base-styles", className)}>
      <h2>{title}</h2>
      {/* map() rendert Liste von Items mit eindeutigen keys */}
      {data.map(item => (
        <ItemComponent 
          key={item.id}        // Eindeutige key für React reconciliation
          item={item}          // Einzelnes Datenobjekt weitergeben
          onUpdate={onUpdate}  // Event-Handler für Child-to-Parent communication
        />
      ))}
    </div>
  );
}
```

### **Custom Hooks für Logic-Sharing**
**WAS:** Wiederverwendbare Funktionen für API-Calls und Datenmanagement  
**WARUM:** Gleiche Logik in mehreren Komponenten ohne Code-Wiederholung  
**WIE:** React Hook holt Daten, verwaltet Loading/Error States automatisch  
**WANN:** Für API-Anfragen, die in verschiedenen Komponenten gebraucht werden  
**TOOLS:** React Hooks + useState + useEffect + Zod für Datenvalidierung

```typescript
// ✅ DATA FETCHING HOOK
// Custom Hook für wiederverwendbare API-Calls
// Generic <T> macht Hook typsicher für verschiedene Datentypen
export function useApiData<T>(endpoint: string) {
  // Lokaler State für API-Response management
  const [data, setData] = useState<T | null>(null);     // Actual data or null
  const [loading, setLoading] = useState(true);         // Loading indicator
  const [error, setError] = useState<string | null>(null); // Error message

  useEffect(() => {
    // Async function inside useEffect (Best Practice)
    const fetchData = async () => {
      try {
        setLoading(true);                               // Start loading
        const response = await api.get(endpoint);       // HTTP GET request
        const validated = DataSchema.parse(response.data); // Zod validation
        setData(validated);                             // Set validated data
      } catch (err) {
        // Safe error message extraction
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Structured logging für debugging
        logger.error('API fetch failed', { endpoint, error: err });
      } finally {
        setLoading(false);                              // Always end loading
      }
    };

    fetchData();
  }, [endpoint]); // Re-run wenn endpoint ändert

  // Return object mit allen nötigen States + refetch function
  return { data, loading, error, refetch: () => fetchData() };
}
```

### **Error Boundaries für Resilience**
**WAS:** Sicherheitsnetz das App-Abstürze verhindert bei Component-Fehlern  
**WARUM:** User sieht freundliche Fehlermeldung statt weißer Seite  
**WIE:** Fängt JavaScript-Fehler ab und zeigt Fallback-UI an  
**WANN:** Um kritische App-Bereiche wie Dashboard oder User-Profile  
**TOOLS:** React Error Boundaries + useState + Event Listeners

```typescript
// ✅ COMPONENT ERROR BOUNDARY
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: Error) => {
      logger.error('Component error caught', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return fallback || (
      <div className="error-fallback">
        <h3>Etwas ist schiefgelaufen</h3>
        <button onClick={() => setHasError(false)}>
          Erneut versuchen
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## 🗄️ **STATE MANAGEMENT PATTERNS**

### **Zustand für Client-State**
**WAS:** Zentrale Datenverwaltung für User-Daten, Dashboards und App-Status  
**WARUM:** Alle Komponenten können auf gleiche Daten zugreifen ohne Props  
**WIE:** Zustand Store hält Daten im Speicher, Components holen sich was sie brauchen  
**WANN:** Für App-weite Daten wie eingeloggte User, Dashboard-Liste, UI-Status  
**TOOLS:** Zustand Library für State Management

```typescript
// ✅ STORE PATTERN
interface AppState {
  user: User | null;
  dashboards: Dashboard[];
  currentDashboard: string | null;
  loading: boolean;
}

interface AppActions {
  setUser: (user: User | null) => void;
  addDashboard: (dashboard: Dashboard) => void;
  setCurrentDashboard: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // State
  user: null,
  dashboards: [],
  currentDashboard: null,
  loading: false,

  // Actions
  setUser: (user) => set({ user }),
  addDashboard: (dashboard) => 
    set(state => ({ 
      dashboards: [...state.dashboards, dashboard] 
    })),
  setCurrentDashboard: (id) => set({ currentDashboard: id }),
  setLoading: (loading) => set({ loading }),
}));
```

### **React Query für Server-State**
**WAS:** Smart Caching für API-Daten mit automatischen Updates und Retries  
**WARUM:** Reduziert Server-Anfragen, hält Daten aktuell, verbessert Performance  
**WIE:** Cached API-Responses, refresht im Hintergrund, invalidiert bei Updates  
**WANN:** Für alle Server-Daten wie Dashboard-Inhalte, User-Profile, Analytics  
**TOOLS:** React Query (TanStack Query) für Server State Management

```typescript
// ✅ SERVER STATE PATTERN
export function useDashboardData(dashboardId: string) {
  return useQuery({
    queryKey: ['dashboard', dashboardId],
    queryFn: async () => {
      const response = await api.get(`/dashboards/${dashboardId}`);
      return DashboardSchema.parse(response.data);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error.status === 404) return false;
      return failureCount < 3;
    },
  });
}

export function useUpdateDashboard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Dashboard> }) => {
      const response = await api.patch(`/dashboards/${id}`, updates);
      return DashboardSchema.parse(response.data);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['dashboard', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
    },
  });
}
```

### **localStorage für Persistence**
**WAS:** Speichert User-Einstellungen dauerhaft im Browser (Theme, Layout, etc.)  
**WARUM:** User-Preferences bleiben erhalten auch nach Browser-Neustart  
**WIE:** Schreibt/liest JSON-Daten in Browser's localStorage API  
**WANN:** Für User-Settings wie Dark Mode, Dashboard-Layout, Favoriten  
**TOOLS:** Browser localStorage API + React useState + useCallback

```typescript
// ✅ PERSISTENCE PATTERN
export function usePersistedState<T>(
  key: string, 
  defaultValue: T
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback((value: T) => {
    setState(value);
    localStorage.setItem(key, JSON.stringify(value));
  }, [key]);

  return [state, setValue];
}
```

---

## 🔌 **API INTEGRATION PATTERNS**

### **Axios für HTTP Requests**
**WAS:** HTTP-Client für API-Calls mit automatischer Authentifizierung und Error-Handling  
**WARUM:** Vereinfacht API-Kommunikation, handled Auth-Token und Errors zentral  
**WIE:** Interceptors fügen Auth-Header hinzu, behandeln 401-Errors automatisch  
**WANN:** Für alle Server-Kommunikation (Login, Dashboards, Analytics)  
**TOOLS:** Axios HTTP Client + Request/Response Interceptors

```typescript
// ✅ API CLIENT SETUP
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### **Zod für Runtime Validation**
**WAS:** Validiert API-Response Daten zur Laufzeit und definiert TypeScript-Typen  
**WARUM:** Schützt vor fehlerhaften Server-Daten und Type-Errors  
**WIE:** Schema definiert erwartete Datenstruktur, parse() validiert eingehende Daten  
**WANN:** Für alle API-Responses und User-Input Formulare  
**TOOLS:** Zod Library für Schema Validation + TypeScript Type Inference

```typescript
// ✅ SCHEMA VALIDATION
export const DashboardSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  widgets: z.array(WidgetSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const WidgetSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['chart', 'table', 'metric']),
  title: z.string().min(1).max(50),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    w: z.number().min(1),
    h: z.number().min(1),
  }),
  config: z.record(z.any()),
});

export type Dashboard = z.infer<typeof DashboardSchema>;
export type Widget = z.infer<typeof WidgetSchema>;
```

### **Exponential Backoff für Retries**
**WAS:** Wiederholt fehlgeschlagene API-Calls mit steigenden Wartezeiten  
**WARUM:** Verhindert Server-Überlastung, verbessert Success-Rate bei temporären Fehlern  
**WIE:** Wartet 1s, 2s, 4s zwischen Versuchen, bricht nach Maximum ab  
**WANN:** Bei wichtigen API-Calls die temporär fehlschlagen können (Analytics, Speichern)  
**TOOLS:** Native Promises + setTimeout + exponential Delay Calculation

```typescript
// ✅ RETRY LOGIC
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelay?: number } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000 } = options;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      logger.warn(`Retry attempt ${attempt + 1}/${maxRetries}`, { error });
    }
  }
  
  throw new Error('Max retries exceeded');
}
```

---

## 🎨 **STYLING PATTERNS**

### **Tailwind Component Variants**
**WAS:** Button-System mit verschiedenen Styles (Primary, Outline, Ghost) und Größen  
**WARUM:** Konsistente UI-Komponenten ohne CSS-Duplikation  
**WIE:** CVA kombiniert Basis-Styles mit konfigurierbaren Varianten  
**WANN:** Für alle wiederverwendbaren UI-Elemente (Buttons, Cards, Inputs)  
**TOOLS:** Class Variance Authority (CVA) + Tailwind CSS

```typescript
// ✅ COMPONENT VARIANTS
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}
```

---

## 📝 **LOGGING & ERROR PATTERNS**

### **Comprehensive Error-Handling Pattern**
**WAS:** 3-schichtiges Error-System: Developer-Logs, Monitoring, User-freundliche Meldungen  
**WARUM:** Entwickler bekommen Debug-Info, User sehen verständliche Nachrichten  
**WIE:** Detailliertes Logging für Entwicklung, Sentry für Production, UI zeigt User-Message  
**WANN:** Bei allen API-Calls und kritischen App-Funktionen  
**TOOLS:** Console Logging + Sentry Error Tracking + Custom Error Classes

```typescript
// ✅ GOOD: Konkrete Error-Handling Patterns
export async function fetchUserData(userId: string): Promise<UserData> {
  try {
    const response = await api.get(`/users/${userId}`);
    return UserDataSchema.parse(response.data);
  } catch (error) {
    // Development: Detailed logging für debugging
    logger.error('User fetch failed', { 
      userId, 
      error: error.message, 
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Production: Sentry tracking mit context
    Sentry.captureException(error, { 
      tags: { operation: 'user-fetch' },
      extra: { userId }
    });
    
    // User-facing: Verständliche Fehlermeldung
    throw new UserFetchError('Benutzerdaten konnten nicht geladen werden. Bitte versuchen Sie es erneut.');
  }
}

// ✅ GOOD: UI Error Display Pattern
function UserProfile({ userId }: { userId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const loadUser = async () => {
    try {
      const userData = await fetchUserData(userId);
      setUser(userData);
      setError(null); // Clear previous errors
    } catch (err) {
      // User sieht: "Benutzerdaten konnten nicht geladen werden"
      // Developer sieht: Sentry alert mit full context
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    }
  };
  
  if (error) {
    return (
      <div className="error-state">
        <p className="text-red-600">{error}</p>
        <button onClick={loadUser} className="retry-button">
          Erneut versuchen
        </button>
      </div>
    );
  }
  
  return user ? <UserDisplay user={user} /> : <LoadingSpinner />;
}
```

### **Custom Error Classes**
**WAS:** Spezielle Error-Typen für verschiedene Fehlerkategorien (User, Validation, Network)  
**WARUM:** Ermöglicht gezieltes Error-Handling je nach Fehlertyp  
**WIE:** Extends Error Class mit zusätzlichen Properties für Context  
**WANN:** Für App-spezifische Fehler die spezielle Behandlung brauchen  
**TOOLS:** Native JavaScript Error Classes + TypeScript

```typescript
// ✅ SPECIFIC ERROR TYPES
export class UserFetchError extends Error {
  constructor(message: string, public readonly userId?: string) {
    super(message);
    this.name = 'UserFetchError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}
```

### **Structured Logging**
**WAS:** Logging-System mit verschiedenen Leveln (Debug, Info, Warn, Error)  
**WARUM:** Entwickler können Probleme schnell finden und debuggen  
**WIE:** Console-Output in Development, Sentry-Integration für Production  
**WANN:** Überall wo wichtige Events oder Errors auftreten  
**TOOLS:** Native Console API + Sentry für Production Monitoring

```typescript
// ✅ LOGGER SETUP
export const logger = {
  debug: (message: string, meta?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, meta);
    }
  },
  
  info: (message: string, meta?: Record<string, any>) => {
    console.info(`[INFO] ${message}`, meta);
  },
  
  warn: (message: string, meta?: Record<string, any>) => {
    console.warn(`[WARN] ${message}`, meta);
  },
  
  error: (message: string, error?: Error | Record<string, any>) => {
    console.error(`[ERROR] ${message}`, error);
    
    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production' && error) {
      Sentry.captureException(error instanceof Error ? error : new Error(message));
    }
  },
};
```

---

## 🔗 **INTEGRATION MIT ANDEREN CLAUDE FILES**

**Beim Implementieren dieser Patterns:**
- [ ] Error Handling (Zeilen 420-476) → Folge CLAUDE.md Docker Workflow nach jedem Fix
- [ ] Zod Schemas (Zeilen 300-324) → Erfülle STANDARDS.md GDPR Requirements
- [ ] Chart.js Colors → Verwende DESIGN-SYSTEM.md Farbpalette (Zeilen 36-38)
- [ ] Component Testing → Nutze CLAUDE_TESTING.md Strategien (Zeilen 77-121)
- [ ] Performance → Halte STANDARDS.md Core Web Vitals ein

**Cross-Reference Guidelines:**
- **CLAUDE.md**: Workflow und Quality Gates befolgen
- **CLAUDE_TESTING.md**: Test-Patterns für alle Components
- **DESIGN-SYSTEM.md**: UI-Consistency für alle Komponenten  
- **STANDARDS.md**: Security, GDPR, Performance einhalten

---

**Diese Patterns sind bewährt und Claude-optimiert für konsistente, wartbare Code-Entwicklung.**