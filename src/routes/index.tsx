// routes/index.js
import { Routes, Route } from 'react-router-dom';
import PublicRoute from '../HOC/PublicRoute.tsx';
import ProtectedRoute from '../HOC/ProtectedRoute.tsx';
import { publicRoutes, protectedRoutes, specialRoutes } from './routeConfig.js';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.requiresPublicRoute ? <PublicRoute>{route.element}</PublicRoute> : route.element}
        />
      ))}

      {/* Protected routes */}
      {protectedRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={<ProtectedRoute>{route.element}</ProtectedRoute>} />
      ))}

      {/* Special routes (404, etc.) */}
      {specialRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};

export default AppRoutes;
