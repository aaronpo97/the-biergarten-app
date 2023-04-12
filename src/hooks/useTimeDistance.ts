import formatDistanceStrict from 'date-fns/formatDistanceStrict';
import { useState, useEffect } from 'react';

/**
 * Returns the time distance between the provided date and the current time, using the
 * `date-fns` `formatDistanceStrict` function. This hook ensures that the same result is
 * calculated on both the server and client, preventing hydration errors.
 *
 * @param createdAt The date to calculate the time distance from.
 * @returns The time distance between the provided date and the current time.
 */
const useTimeDistance = (createdAt: Date) => {
  const [timeDistance, setTimeDistance] = useState('');
  useEffect(() => {
    setTimeDistance(formatDistanceStrict(createdAt, new Date()));
  }, [createdAt]);
  return timeDistance;
};

export default useTimeDistance;
