import type { Route } from './+types/beer-styles';

export function meta({}: Route.MetaArgs) {
   return [{ title: 'Beer Styles | The Biergarten App' }];
}

export default function BeerStyles() {
   return (
      <div className="min-h-screen bg-base-200">
         <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-4">Beer Styles</h1>
            <p className="text-base-content/70">Learn about different beer styles.</p>
         </div>
      </div>
   );
}
