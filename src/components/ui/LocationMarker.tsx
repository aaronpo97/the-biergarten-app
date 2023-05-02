import React, { FC } from 'react';
import { HiLocationMarker } from 'react-icons/hi';

interface LocationMarkerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'red' | 'green' | 'yellow';
}

const sizeClasses: Record<NonNullable<LocationMarkerProps['size']>, `text-${string}`> = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
};

const LocationMarker: FC<LocationMarkerProps> = ({ size = 'md', color = 'blue' }) => {
  return <HiLocationMarker className={`${sizeClasses[size]} text-${color}-400`} />;
};

export default React.memo(LocationMarker);
