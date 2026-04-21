import formatDistanceStrict from 'date-fns/formatDistanceStrict';
import { useState, useEffect } from 'react';

/**
 * A custom hook to calculate the time distance between the provided date and the current
 * time.
 *
 * This hook uses the date-fns library to calculate the time distance.
 *
 * This hook ensures that the same result is calculated on both the server and client,
 * preventing hydration errors.
 *
 * @param createdAt The date to calculate the time distance from.
 * @returns The time distance between the provided date and the current time.
 * @see https://date-fns.org/v2.30.0/docs/formatDistanceStrict
 */
const useTimeDistance = (createdAt: Date) => {
  const [timeDistance, setTimeDistance] = useState('');
  useEffect(() => {
    setTimeDistance(formatDistanceStrict(createdAt, new Date()));
  }, [createdAt]);
  return timeDistance;
};

export default useTimeDistance;
