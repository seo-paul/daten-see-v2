/**
 * Dashboard Error Message Component
 * Displays API errors with retry option
 */

interface DashboardErrorMessageProps {
  error: Error | null;
}

export function DashboardErrorMessage({ 
  error 
}: DashboardErrorMessageProps): React.ReactElement | null {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-red-600 text-sm">
            <strong>Fehler:</strong> {error.message || 'Unbekannter Fehler'}
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-red-600 hover:text-red-800 text-sm underline"
        >
          Neu laden
        </button>
      </div>
    </div>
  );
}