import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Incident, LatLng, RouteOption, SeverityLevel } from '../types';

// Google Maps Style Markers
const createGoogleIncidentIcon = (severity: SeverityLevel) => {
  let bg = '#ea4335'; // Red
  let iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

  if (severity === 'critical') {
    bg = '#d93025';
  } else if (severity === 'high') {
    bg = '#f29900';
  } else if (severity === 'medium') {
    bg = '#fbbc04';
  } else if (severity === 'low') {
    bg = '#1e8e3e';
  }

  return L.divIcon({
    className: 'google-incident-marker',
    html: `
      <div style="
        background-color: ${bg};
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        ${iconSvg}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

const createStartPin = () =>
  L.divIcon({
    className: 'start-pin',
    html: `
      <div style="
        background: #1a73e8;
        border: 2.5px solid #ffffff;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(26,115,232,0.5);
      ">
        <div style="width: 7px; height: 7px; border-radius: 50%; background: #ffffff;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const createDestPin = () =>
  L.divIcon({
    className: 'dest-pin',
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 38px;
        display: flex;
        justify-content: center;
      ">
        <svg width="32" height="38" viewBox="0 0 24 30" fill="none">
          <path d="M12 0C5.37 0 0 5.37 0 12C0 20.25 12 30 12 30C12 30 24 20.25 24 12C24 5.37 18.63 0 12 0Z" fill="#ea4335"/>
          <circle cx="12" cy="11" r="5" fill="#ffffff"/>
        </svg>
      </div>
    `,
    iconSize: [32, 38],
    iconAnchor: [16, 36],
  });

const createGoogleUserNavIcon = () =>
  L.divIcon({
    className: 'google-nav-dot',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div class="nav-beacon-pulse" style="
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(26, 115, 232, 0.35);
        "></div>
        <div style="
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #1a73e8;
          border: 3px solid #ffffff;
          box-shadow: 0 1px 6px rgba(0,0,0,0.3);
          z-index: 2;
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

const createPoiSymbolIcon = (type: 'petrol_pump' | 'toll_plaza' | 'hospital' | 'police_post') => {
  let bg = '#0284c7';
  let symbol = '⛽';
  let shadow = 'rgba(2, 132, 199, 0.4)';

  if (type === 'toll_plaza') {
    bg = '#7c3aed';
    symbol = '🛑';
    shadow = 'rgba(124, 58, 237, 0.4)';
  } else if (type === 'hospital') {
    bg = '#dc2626';
    symbol = '🏥';
    shadow = 'rgba(220, 38, 38, 0.4)';
  } else if (type === 'police_post') {
    bg = '#1e3a8a';
    symbol = '🚓';
    shadow = 'rgba(30, 58, 138, 0.4)';
  }

  return L.divIcon({
    className: `poi-symbol-${type}`,
    html: `
      <div style="
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: ${bg};
        border: 2px solid #ffffff;
        box-shadow: 0 2px 8px ${shadow};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        line-height: 1;
        cursor: pointer;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
};

interface MapControllerProps {
  origin: LatLng | null;
  destination: LatLng | null;
  userNavPos: LatLng | null;
  onMapClick?: (latlng: LatLng) => void;
}

const MapController: React.FC<MapControllerProps> = ({ origin, destination, userNavPos, onMapClick }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  useEffect(() => {
    if (userNavPos) {
      map.setView([userNavPos.lat, userNavPos.lng], 16, { animate: true });
    } else if (origin && destination) {
      const bounds = L.latLngBounds(
        [origin.lat, origin.lng],
        [destination.lat, destination.lng]
      );
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 15 });
    }
  }, [origin, destination, userNavPos, map]);

  return null;
};

interface MapViewProps {
  incidents: Incident[];
  origin: LatLng | null;
  destination: LatLng | null;
  routeOptions?: RouteOption[];
  selectedRouteIndex: number;
  onSelectRoute?: (index: number) => void;
  userNavPos?: LatLng | null;
  onMapClick?: (latlng: LatLng) => void;
  showIncidentFilter?: SeverityLevel | 'all';
  alertRadiusMeters?: number;
}

export const MapView: React.FC<MapViewProps> = ({
  incidents,
  origin,
  destination,
  routeOptions = [],
  selectedRouteIndex,
  onSelectRoute,
  userNavPos,
  onMapClick,
  showIncidentFilter = 'all',
  alertRadiusMeters = 600,
}) => {
  const defaultCenter: [number, number] = [28.6139, 77.2090]; // Delhi NCR center

  const filteredIncidents = incidents.filter(
    (inc) => showIncidentFilter === 'all' || inc.severity === showIncidentFilter
  );

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-100">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        className="w-full h-full"
        zoomControl={false}
      >
        {/* Crisp, clean Google-like Light Tiles (CartoDB Positron) */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <MapController
          origin={origin}
          destination={destination}
          userNavPos={userNavPos || null}
          onMapClick={onMapClick}
        />

        {/* Start / Origin Pin */}
        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={createStartPin()}>
            <Popup>
              <div className="text-xs">
                <div className="font-bold text-slate-800">Starting Location</div>
                <div className="text-slate-500 text-[11px]">
                  {origin.lat.toFixed(4)}, {origin.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Pin */}
        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={createDestPin()}>
            <Popup>
              <div className="text-xs">
                <div className="font-bold text-slate-800">Destination</div>
                <div className="text-slate-500 text-[11px]">
                  {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Live User GPS Dot */}
        {userNavPos && (
          <>
            <Marker position={[userNavPos.lat, userNavPos.lng]} icon={createGoogleUserNavIcon()}>
              <Popup>
                <div className="text-xs">
                  <div className="font-bold text-blue-600">Your Live Position</div>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[userNavPos.lat, userNavPos.lng]}
              radius={alertRadiusMeters}
              pathOptions={{
                color: '#1a73e8',
                fillColor: '#1a73e8',
                fillOpacity: 0.08,
                weight: 1.5,
              }}
            />
          </>
        )}

        {/* Render Route Polylines (Google Maps Style) */}
        {routeOptions.map((opt, idx) => {
          const isSelected = selectedRouteIndex === opt.routeIndex;
          const isRecommended = opt.safety.score >= 70;
          const positions: [number, number][] = opt.geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );

          // Google Maps colors: Selected route is primary blue (#1a73e8) or safe emerald (#1e8e3e), unselected is grey (#9aa0a6)
          let lineColor = isSelected ? (isRecommended ? '#1e8e3e' : '#1a73e8') : '#9aa0a6';
          let lineWeight = isSelected ? 6 : 4;
          let lineOpacity = isSelected ? 0.95 : 0.6;

          return (
            <React.Fragment key={`route-${idx}`}>
              {/* Outer stroke for clean contrast on maps */}
              {isSelected && (
                <Polyline
                  positions={positions}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 10,
                    opacity: 0.9,
                  }}
                />
              )}
              {/* Main polyline */}
              <Polyline
                positions={positions}
                pathOptions={{
                  color: lineColor,
                  weight: lineWeight,
                  opacity: lineOpacity,
                }}
                eventHandlers={{
                  click: () => onSelectRoute && onSelectRoute(opt.routeIndex),
                }}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <div className="font-bold text-slate-900 text-sm">
                      {Math.round(opt.durationSeconds / 60)} min ({(opt.distanceMeters / 1000).toFixed(1)} km)
                    </div>
                    <div className="text-emerald-700 font-semibold mt-0.5">
                      Safety Score: {opt.safety.score}/100 ({opt.safety.level})
                    </div>
                  </div>
                </Popup>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* Emergency & Highway Service POI Symbols along Selected Route */}
        {routeOptions.find((r) => r.routeIndex === selectedRouteIndex)?.pois?.map((poi) => (
          <Marker
            key={poi.id}
            position={[poi.latitude, poi.longitude]}
            icon={createPoiSymbolIcon(poi.type)}
          >
            <Popup>
              <div className="p-1 max-w-[200px] text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>
                    {poi.type === 'petrol_pump'
                      ? '⛽ 24x7 Petrol Pump'
                      : poi.type === 'toll_plaza'
                      ? '🛑 Fastag Toll Plaza'
                      : poi.type === 'hospital'
                      ? '🏥 Emergency Hospital'
                      : '🚓 Police PCR Assistance'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{poi.name}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Incident Markers */}
        {filteredIncidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.latitude, inc.longitude]}
            icon={createGoogleIncidentIcon(inc.severity)}
          >
            <Popup>
              <div className="p-1 max-w-[220px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {inc.severity}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 capitalize">
                    {inc.type.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-600 leading-snug mb-1">
                  {inc.title}
                </div>
                <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-1 mt-1">
                  {inc.address || 'Delhi NCR'}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
