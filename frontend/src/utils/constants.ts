// Wing configurations
export const WINGS = [
  {
    name: 'CodeZero',
    slug: 'codezero',
    description: 'Technical Wing',
  },
  {
    name: 'Kalavaibhava',
    slug: 'kalavaibhava',
    description: 'Cultural Wing',
  },
  {
    name: 'SheSpark',
    slug: 'shespark',
    description: 'Women Empowerment Wing',
  },
  {
    name: 'UGRS',
    slug: 'ugrs',
    description: 'Research Wing',
  },
  {
    name: 'Udbhava',
    slug: 'udbhava',
    description: 'Innovation Wing',
  },
];

// Routes
export const ROUTES = {
  HOME: '/',
  WING: '/wings/:slug',
  WING_GALLERY: '/wings/:slug/gallery',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
};

// Helper to generate wing route
export const getWingRoute = (slug: string) => `/wings/${slug}`;
export const getWingGalleryRoute = (slug: string) => `/wings/${slug}/gallery`;
