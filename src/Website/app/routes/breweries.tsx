import type { Route } from './+types/breweries';

export function meta({}: Route.MetaArgs) {
   return [{ title: 'Breweries | The Biergarten App' }];
}

export default function Breweries() {
   return (
      <div className="min-h-screen bg-base-200">
         <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-4">Breweries</h1>
            <p className="text-base-content/70">Discover our partner breweries.</p>
         </div>
      </div>
   );
}
