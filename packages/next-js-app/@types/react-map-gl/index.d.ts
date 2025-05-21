import * as React from 'react';
import { Map as MapboxMap } from 'mapbox-gl';

declare module 'react-map-gl/mapbox' {
  export interface MapRef {
    getMap(): MapboxMap;
  }

  export interface InteractiveMapProps {
    ref?: React.RefObject<MapRef>;
  }
}