const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

interface ApiResponse<T> {
   message: string;
   payload: T;
}

export interface BreweryLocation {
   breweryPostLocationId: string;
   breweryPostId: string;
   cityId: string;
   addressLine1: string;
   addressLine2: string | null;
   postalCode: string;
}

export interface Brewery {
   breweryPostId: string;
   postedById: string;
   breweryName: string;
   description: string;
   createdAt: string;
   updatedAt: string | null;
   location: BreweryLocation | null;
}

export async function getBreweries(limit?: number, offset?: number): Promise<Brewery[]> {
   const params = new URLSearchParams();
   if (limit !== undefined) params.set('limit', String(limit));
   if (offset !== undefined) params.set('offset', String(offset));

   const res = await fetch(`${API_BASE_URL}/api/brewery?${params}`);

   if (!res.ok) {
      throw new Error(`Failed to load breweries (${res.status})`);
   }

   const data: ApiResponse<Brewery[]> = await res.json();
   return data.payload;
}

export async function getBreweryById(id: string): Promise<Brewery | null> {
   const res = await fetch(`${API_BASE_URL}/api/brewery/${encodeURIComponent(id)}`);

   if (res.status === 404) {
      return null;
   }

   if (!res.ok) {
      throw new Error(`Failed to load brewery (${res.status})`);
   }

   const data: ApiResponse<Brewery> = await res.json();
   return data.payload;
}
