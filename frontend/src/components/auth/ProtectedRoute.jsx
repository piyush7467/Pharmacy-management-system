import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShieldAlert } from 'lucide-react';
import { apiClient } from '../../services/api/apiClient.js';
import { setCredentials, clearCredentials } from '../../features/auth/authSlice.js';
import { Button } from '../ui/button.jsx';
import { GlobalLoadingScreen } from '../common/GlobalLoadingScreen.jsx';

export function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  const [checking, setChecking] = useState(!isInitialized);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthStatus() {
      if (!isInitialized) {
        try {
          const res = await apiClient.post('/auth/refresh');
          if (isMounted && res.data) {
            dispatch(setCredentials({
              user: res.data.user,
              accessToken: res.data.accessToken
            }));
            setAuthError(null);
          }
        } catch (err) {
          if (isMounted) {
            dispatch(clearCredentials());
            // If offline or network error, let user know rather than infinite loop
            if (!err.response && err.message) {
              setAuthError('Unable to connect to authentication server. Please verify your connection.');
            }
          }
        } finally {
          if (isMounted) {
            setChecking(false);
          }
        }
      } else {
        setChecking(false);
      }
    }

    checkAuthStatus();
    return () => { isMounted = false; };
  }, [isInitialized, dispatch]);

  if (checking) {
    return (
      <GlobalLoadingScreen
        title="Verifying your session"
        subtitle="Please wait while we prepare your workspace."
        error={authError}
        onRetry={() => {
          setChecking(true);
          setAuthError(null);
          dispatch(clearCredentials());
        }}
        onGoToLogin={() => navigate('/login', { replace: true })}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-xl border border-surface bg-surface-card text-center space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-text-primary">Access Restricted</h2>
          <p className="text-xs text-text-muted mt-1">
            Your current role (<code className="font-semibold">{user?.role}</code>) does not have authorization to view this resource.
          </p>
        </div>
        <Button onClick={() => window.history.back()} variant="outline" size="sm">
          Return to Previous Page
        </Button>
      </div>
    );
  }

  return children;
}

