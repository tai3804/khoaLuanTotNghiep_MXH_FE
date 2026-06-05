import { Navigate, type RouteObject } from 'react-router';

import { lazy } from 'react';

import { CONFIG } from 'src/global-config';




import { authRoutes } from './auth';
import { mainRoutes } from './main';
import { dashboardRoutes } from './dashboard';

// ----------------------------------------------------------------------


const Page404 = lazy(() => import('src/pages/error/404'));

export const routesSection: RouteObject[] = [
  {
    path: '/',
    /**
     * @skip homepage
     * import { Navigate } from "react-router";
     * import { CONFIG } from 'src/global-config';
     *
     * element: <Navigate to={CONFIG.auth.redirectPath} replace />,
     * and remove the element below:
     */
    element: <Navigate to={CONFIG.auth.redirectPath} replace />,
  },

  // Auth
  ...authRoutes,
  // Dashboard
  ...dashboardRoutes,

  // Main
  ...mainRoutes,

  // No match
  { path: '*', element: <Page404 /> },
];
