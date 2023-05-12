import { FC, memo } from 'react';
import { FullscreenControl, NavigationControl, ScaleControl } from 'react-map-gl';

const ControlPanel: FC = () => (
  <>
    <FullscreenControl position="top-left" />
    <NavigationControl position="top-left" />
    <ScaleControl />
  </>
);

export default memo(ControlPanel);
