import React, { FC } from 'react';
import { HiLocationMarker } from 'react-icons/hi';

interface LocationMarkerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'red' | 'green' | 'yellow';
}

const sizeClasses: Record<NonNullable<LocationMarkerProps['size']>, `text-${string}`> = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl',
};

const LocationMarker: FC<LocationMarkerProps> = ({ size = 'md', color = 'blue' }) => {
  return <HiLocationMarker className={`${sizeClasses[size]} text-${color}-600`} />;
};

export default React.memo(LocationMarker);
