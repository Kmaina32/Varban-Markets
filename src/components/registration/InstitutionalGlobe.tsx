'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * @fileOverview Institutional 3D Globe Component.
 * Visual representation of Varban Markets' global data centers.
 * Refactored for stable vanilla JS initialization.
 */

export default function InstitutionalGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const globeInstance = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!containerRef.current || dimensions.width === 0) return;

    let active = true;

    // Direct dynamic import of the vanilla library
    import('globe.gl').then(({ default: GlobeLib }) => {
      const Globe: any = GlobeLib;
      if (!active || !containerRef.current) return;

      // PoP (Points of Presence) locations
      const gData = [
        { lat: 51.5074, lng: -0.1278, name: 'London Node' },
        { lat: -4.6191, lng: 55.4513, name: 'Seychelles Hub' },
        { lat: 40.7128, lng: -74.0060, name: 'New York Relay' },
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo Node' },
        { lat: 1.3521, lng: 103.8198, name: 'Singapore Gateway' },
        { lat: 6.5244, lng: 3.3792, name: 'Lagos Node' }
      ];

      // Update existing instance if it exists
      if (globeInstance.current) {
        globeInstance.current
          .width(dimensions.width)
          .height(dimensions.height);
        return;
      }

      // Create new instance
      const make = () => { try { return Globe()(containerRef.current!); } catch { return new Globe(containerRef.current!); } };
      globeInstance.current = make()
        .width(dimensions.width)
        .height(dimensions.height)
        .backgroundColor('rgba(0,0,0,0)')
        .showAtmosphere(true)
        .atmosphereColor('#0055FF')
        .atmosphereAltitude(0.2)
        .globeImageUrl('https://unpkg.com/three-globe@2.31.0/example/img/earth-night.jpg')
        .globeColor('#0B1530')
        .lineHoverPrecision(0)
        .pointsData(gData)
        .pointColor(() => '#4D8DFF')
        .pointAltitude(0.05)
        .pointRadius(0.8)
        .pointsMerge(true)
        .labelsData(gData)
        .labelDotRadius(0.3)
        .labelColor(() => '#D6E4FF')
        .labelSize(1.5)
        .labelText('name')
        .labelResolution(2);

      globeInstance.current.controls().autoRotate = true;
      globeInstance.current.controls().autoRotateSpeed = 0.6;
      globeInstance.current.controls().enableZoom = false;
    });

    return () => {
      active = false;
      // Globe GL cleans up internally when the container is detached
    };
  }, [dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}
