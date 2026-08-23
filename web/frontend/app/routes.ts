import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
   index('routes/home.tsx'),
   route('theme', 'features/theme/routes/theme.tsx'),
   route('login', 'features/auth/routes/login.tsx'),
   route('register', 'features/auth/routes/register.tsx'),
   route('logout', 'features/auth/routes/logout.tsx'),
   route('dashboard', 'features/account/routes/dashboard.tsx'),
   route('account', 'features/account/routes/account.tsx'),
   route('confirm', 'features/auth/routes/confirm.tsx'),
   route('beers', 'features/catalog/routes/beers.tsx'),
   route('breweries', 'features/breweries/routes/breweries.tsx'),
   route('breweries/:id', 'features/breweries/routes/brewery-detail.tsx'),
   route('beer-styles', 'features/catalog/routes/beer-styles.tsx'),
] satisfies RouteConfig;
