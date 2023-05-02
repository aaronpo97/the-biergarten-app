import { useEffect, useState } from 'react';

/**
 * A custom React Hook that retrieves and monitors the user's geolocation using the
 * browser's built-in `navigator.geolocation` API.
 *
 * @returns An object containing the user's geolocation information and any errors that
 *   might occur. The object has the following properties:
 *
 *   - `coords` - The user's current geolocation coordinates, or null if the geolocation could
 *       not be retrieved.
 *   - `timestamp` - The timestamp when the user's geolocation was last updated, or null if
 *       the geolocation could not be retrieved.
 *   - `error` - Any error that might occur while retrieving or monitoring the user's
 *       geolocation, or null if there are no errors.
 */
const useGeolocation = () => {
  const [state, setState] = useState<{
    coords: GeolocationCoordinates | null;
    timestamp: number | null;
  }>({
    coords: null,
    timestamp: null,
  });

  const [error, setError] = useState<GeolocationPositionError | null>(null);

  // Set up the event listeners for the geolocation updates
  useEffect(() => {
    /**
     * Callback function for successful geolocation update.
     *
     * @param position - The geolocation position object.
     */
    const onEvent = (position: GeolocationPosition) => {
      const { coords, timestamp } = position;
      setError(null);
      setState({ coords, timestamp });
    };

    /**
     * Callback function for geolocation error.
     *
     * @param geoError - The geolocation error object.
     */
    const onError = (geoError: GeolocationPositionError) => {
      setError(geoError);
    };

    // Get the current geolocation
    navigator.geolocation.getCurrentPosition(onEvent, onError);

    // Monitor any changes in the geolocation
    const watchId = navigator.geolocation.watchPosition(onEvent, onError);

    // Clean up the event listeners when the component unmounts
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Return the geolocation information and any errors as an object
  return { coords: state.coords, timestamp: state.timestamp, error };
};

export default useGeolocation;
