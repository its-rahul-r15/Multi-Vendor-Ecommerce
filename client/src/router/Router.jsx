import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const RouterContext = createContext(null);

export const RouterProvider = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to, options = {}) => {
    if (typeof to !== 'string') return;
    
    let path = to;
    let query = '';
    if (to.includes('?')) {
      const parts = to.split('?');
      path = parts[0];
      query = parts[1];
    }

    if (options.replace) {
      window.history.replaceState(null, '', to);
    } else {
      window.history.pushState(null, '', to);
    }

    setCurrentPath(path);
    setSearchParams(new URLSearchParams(query));

    if (!options.preventScrollReset) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const value = useMemo(() => ({
    currentPath,
    searchParams,
    navigate,
  }), [currentPath, searchParams]);

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
};

export const useNavigate = () => {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useNavigate must be used within RouterProvider');
  return context.navigate;
};

export const useLocation = () => {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useLocation must be used within RouterProvider');
  return {
    pathname: context.currentPath,
    search: window.location.search,
    searchParams: context.searchParams,
  };
};

export const Link = ({ to, children, className = '', activeClassName = '', onClick, ...props }) => {
  const { currentPath, navigate } = useContext(RouterContext);
  const isActive = currentPath === to || (to !== '/' && currentPath.startsWith(to));

  const handleClick = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (onClick) onClick(e);
    navigate(to);
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={`${className} ${isActive ? activeClassName : ''}`.trim()}
      {...props}
    >
      {children}
    </a>
  );
};

// Route matching utility
function matchRoute(routePath, currentPath) {
  const routeSegments = routePath.split('/').filter(Boolean);
  const currentSegments = currentPath.split('/').filter(Boolean);

  if (routeSegments.length !== currentSegments.length) {
    // Check wildcard match at end
    if (routePath.endsWith('/*') || routePath.endsWith('*')) {
      const baseRoute = routePath.replace(/\/\*|\*$/, '');
      if (currentPath === baseRoute || currentPath.startsWith(baseRoute + '/')) {
        return { matched: true, params: {} };
      }
    }
    return { matched: false, params: {} };
  }

  const params = {};
  for (let i = 0; i < routeSegments.length; i++) {
    const rSeg = routeSegments[i];
    const cSeg = currentSegments[i];

    if (rSeg.startsWith(':')) {
      params[rSeg.slice(1)] = decodeURIComponent(cSeg);
    } else if (rSeg !== cSeg) {
      return { matched: false, params: {} };
    }
  }

  return { matched: true, params };
}

const RouteParamsContext = createContext({});

export const useParams = () => useContext(RouteParamsContext);

export const Route = ({ path, element }) => {
  const { currentPath } = useContext(RouterContext);
  const { matched, params } = matchRoute(path, currentPath);

  if (!matched) return null;

  return (
    <RouteParamsContext.Provider value={params}>
      {element}
    </RouteParamsContext.Provider>
  );
};

export const Routes = ({ children }) => {
  const { currentPath } = useContext(RouterContext);
  
  let match = null;
  React.Children.forEach(children, (child) => {
    if (!match && React.isValidElement(child) && child.props.path) {
      const { matched, params } = matchRoute(child.props.path, currentPath);
      if (matched) {
        match = (
          <RouteParamsContext.Provider value={params} key={child.props.path}>
            {child.props.element}
          </RouteParamsContext.Provider>
        );
      }
    }
  });

  return match;
};
