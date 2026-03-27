import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {StyleSheet} from 'react-native';
import {Region} from 'react-native-maps';
import {WebView, WebViewMessageEvent} from 'react-native-webview';

export type OpenStreetMapCoordinate = {
  latitude: number;
  longitude: number;
};

export type OpenStreetMapMarker = {
  description?: string;
  highlighted?: boolean;
  indexLabel?: string;
  latitude: number;
  longitude: number;
  showTooltip?: boolean;
  title?: string;
};

export type OpenStreetMapViewHandle = {
  fitToMarkers: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
};

type OpenStreetMapViewProps = {
  initialSelectedCoordinate?: OpenStreetMapCoordinate | null;
  interactive?: boolean;
  markers: OpenStreetMapMarker[];
  onMapPress?: (coordinate: OpenStreetMapCoordinate) => void;
  region: Region;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const toJsonScriptValue = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

const getZoomLevel = (region: Region) => {
  const dominantDelta = Math.max(region.latitudeDelta, region.longitudeDelta);
  const zoomEstimate = Math.round(Math.log2(360 / dominantDelta));
  return clamp(zoomEstimate, 3, 18);
};

const buildHtml = (
  markers: OpenStreetMapMarker[],
  region: Region,
  interactive: boolean,
  initialSelectedCoordinate: OpenStreetMapCoordinate | null,
  selectionEnabled: boolean,
) => {
  const payload = toJsonScriptValue({
    initialSelectedCoordinate,
    interactive,
    markers,
    region,
    selectionEnabled,
    zoom: getZoomLevel(region),
  });

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />
    <style>
      html,
      body,
      #map {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #d7e6e8;
      }

      body {
        font-family: Arial, sans-serif;
      }

      .leaflet-control-attribution {
        display: none;
      }

      .leaflet-container {
        background: #d7e6e8;
      }

      .property-pin,
      .selection-pin {
        align-items: center;
        border: 2px solid #ffffff;
        border-radius: 18px;
        box-shadow: 0 4px 14px rgba(16, 12, 10, 0.24);
        color: #ffffff;
        display: flex;
        font-size: 11px;
        font-weight: 700;
        height: 36px;
        justify-content: center;
        position: relative;
        width: 36px;
      }

      .property-pin {
        background: #f0b53a;
      }

      .property-pin.is-highlighted,
      .selection-pin {
        background: #3f7765;
      }

      .property-pin::after,
      .selection-pin::after {
        background: #ffffff;
        border-bottom-left-radius: 2px;
        border-bottom-right-radius: 2px;
        bottom: -10px;
        content: '';
        height: 10px;
        left: 50%;
        position: absolute;
        transform: translateX(-50%);
        width: 4px;
      }

      .selection-pin {
        transform: scale(1.06);
      }

      .property-tooltip {
        background: rgba(25, 21, 19, 0.84);
        border: none;
        border-radius: 12px;
        box-shadow: 0 8px 18px rgba(16, 12, 10, 0.22);
        color: #ffffff;
        padding: 0;
      }

      .property-tooltip::before {
        display: none;
      }

      .property-tooltip .leaflet-tooltip-content {
        margin: 0;
      }

      .property-tooltip-card {
        max-width: 160px;
        padding: 8px 10px;
      }

      .property-tooltip-title {
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        line-height: 14px;
      }

      .property-tooltip-meta {
        color: #d7ded8;
        font-size: 10px;
        line-height: 12px;
        margin-top: 2px;
      }

      .property-popup {
        min-width: 140px;
      }

      .property-popup-title {
        color: #191513;
        font-size: 13px;
        font-weight: 700;
        line-height: 16px;
      }

      .property-popup-meta {
        color: #625a54;
        font-size: 12px;
        line-height: 16px;
        margin-top: 4px;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      (function () {
        const config = ${payload};
        const map = L.map('map', {
          attributionControl: false,
          boxZoom: config.interactive,
          doubleClickZoom: config.interactive,
          dragging: config.interactive,
          keyboard: config.interactive,
          scrollWheelZoom: config.interactive,
          touchZoom: config.interactive,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
        }).addTo(map);

        const bounds = [];

        const escapeHtml = (value) =>
          String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        const buildTooltipHtml = (marker) =>
          '<div class="property-tooltip-card">' +
          '<div class="property-tooltip-title">' +
          escapeHtml(marker.title || marker.indexLabel || 'Property') +
          '</div>' +
          (marker.description
            ? '<div class="property-tooltip-meta">' +
              escapeHtml(marker.description) +
              '</div>'
            : '') +
          '</div>';

        const buildPopupHtml = (marker) =>
          '<div class="property-popup">' +
          '<div class="property-popup-title">' +
          escapeHtml(marker.title || 'Property') +
          '</div>' +
          (marker.description
            ? '<div class="property-popup-meta">' +
              escapeHtml(marker.description) +
              '</div>'
            : '') +
          '</div>';

        let selectedMarker = null;
        const selectionIcon = L.divIcon({
          className: '',
          html: '<div class="selection-pin">PIN</div>',
          iconAnchor: [18, 46],
          iconSize: [36, 46],
        });

        const updateSelectedMarker = (coordinate) => {
          if (!coordinate) {
            return;
          }

          const markerPosition = [coordinate.latitude, coordinate.longitude];

          if (!selectedMarker) {
            selectedMarker = L.marker(markerPosition, {
              icon: selectionIcon,
              riseOnHover: true,
            }).addTo(map);
            return;
          }

          selectedMarker.setLatLng(markerPosition);
        };

        config.markers.forEach((marker) => {
          const markerIcon = L.divIcon({
            className: '',
            html:
              '<div class="property-pin' +
              (marker.highlighted ? ' is-highlighted' : '') +
              '">' +
              escapeHtml(marker.indexLabel || '*') +
              '</div>',
            iconAnchor: [18, 46],
            iconSize: [36, 46],
          });

          const mapMarker = L.marker([marker.latitude, marker.longitude], {
            icon: markerIcon,
            riseOnHover: true,
          }).addTo(map);

          mapMarker.bindPopup(buildPopupHtml(marker), {
            autoPanPadding: [24, 24],
            closeButton: false,
          });

          if (marker.showTooltip) {
            mapMarker.bindTooltip(buildTooltipHtml(marker), {
              className: 'property-tooltip',
              direction: 'top',
              offset: [0, -42],
              opacity: 1,
              permanent: true,
            });
          }

          bounds.push([marker.latitude, marker.longitude]);
        });

        if (config.initialSelectedCoordinate) {
          updateSelectedMarker(config.initialSelectedCoordinate);
          bounds.push([
            config.initialSelectedCoordinate.latitude,
            config.initialSelectedCoordinate.longitude,
          ]);
        }

        if (config.interactive && config.selectionEnabled) {
          map.on('click', function (event) {
            const coordinate = {
              latitude: Number(event.latlng.lat.toFixed(6)),
              longitude: Number(event.latlng.lng.toFixed(6)),
            };

            updateSelectedMarker(coordinate);

            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  coordinate: coordinate,
                  type: 'mapPress',
                })
              );
            }
          });
        }

        const focusMarkers = (animated) => {
          if (bounds.length === 0) {
            map.setView(
              [config.region.latitude, config.region.longitude],
              config.zoom,
              {animate: animated}
            );
            return;
          }

          if (bounds.length === 1) {
            map.setView(bounds[0], Math.max(config.zoom, 15), {
              animate: animated,
            });
            return;
          }

          map.fitBounds(bounds, {
            animate: animated,
            maxZoom: 16,
            padding: [40, 40],
          });
        };

        focusMarkers(false);
        window.__openStreetMapView = {
          focusMarkers,
          zoomIn: function () {
            map.zoomIn();
          },
          zoomOut: function () {
            map.zoomOut();
          },
        };
      })();
    </script>
  </body>
</html>`;
};

const runMapCommand = (
  webView: WebView | null,
  type: 'focusMarkers' | 'zoomIn' | 'zoomOut',
) => {
  if (!webView) {
    return;
  }

  webView.injectJavaScript(
    `window.__openStreetMapView && window.__openStreetMapView.${type}(); true;`,
  );
};

export const OpenStreetMapView = forwardRef<
  OpenStreetMapViewHandle,
  OpenStreetMapViewProps
>(
  (
    {
      initialSelectedCoordinate = null,
      interactive = true,
      markers,
      onMapPress,
      region,
    },
    ref,
  ) => {
    const webViewRef = useRef<WebView | null>(null);
    const selectionEnabled = Boolean(onMapPress);
    const sourceHtml = useMemo(
      () =>
        buildHtml(
          markers,
          region,
          interactive,
          initialSelectedCoordinate,
          selectionEnabled,
        ),
      [
        initialSelectedCoordinate,
        interactive,
        markers,
        region,
        selectionEnabled,
      ],
    );

    useImperativeHandle(
      ref,
      () => ({
        fitToMarkers: () => runMapCommand(webViewRef.current, 'focusMarkers'),
        zoomIn: () => runMapCommand(webViewRef.current, 'zoomIn'),
        zoomOut: () => runMapCommand(webViewRef.current, 'zoomOut'),
      }),
      [],
    );

    const handleMessage = (event: WebViewMessageEvent) => {
      if (!onMapPress) {
        return;
      }

      try {
        const payload = JSON.parse(event.nativeEvent.data) as {
          coordinate?: OpenStreetMapCoordinate;
          type?: string;
        };

        if (
          payload.type === 'mapPress' &&
          payload.coordinate &&
          Number.isFinite(payload.coordinate.latitude) &&
          Number.isFinite(payload.coordinate.longitude)
        ) {
          onMapPress(payload.coordinate);
        }
      } catch (error) {
        return;
      }
    };

    return (
      <WebView
        bounces={false}
        domStorageEnabled
        javaScriptEnabled
        onMessage={selectionEnabled ? handleMessage : undefined}
        originWhitelist={['*']}
        ref={refValue => {
          webViewRef.current = refValue;
        }}
        scrollEnabled={false}
        setSupportMultipleWindows={false}
        source={{html: sourceHtml}}
        style={styles.webView}
      />
    );
  },
);

const styles = StyleSheet.create({
  webView: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});
