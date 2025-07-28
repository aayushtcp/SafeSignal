import React, { useState, useEffect } from "react";
import { geoOrthographic } from "d3-geo";
import { timer } from "d3";
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography
} from "react-simple-maps";

const Globe = () => {
  const [rotation, setRotation] = useState([0, 0, 0]);

  const projection = () =>
    geoOrthographic()
      .translate([400, 400]) // Centered for 800x800 map
      .rotate(rotation)
      .scale(200)
      .clipAngle(90)
      .precision(0.1);

  useEffect(() => {
    const autorotation = timer(() => {
      setRotation((prevRotation) => [prevRotation[0] + 0.2, 0, 0]);
    });

    return () => autorotation.stop();
  }, []);

  return (
    <ComposableMap projection={projection} width={800} height={800}>
      <ZoomableGroup>
        <Geographies geography="https://unpkg.com/world-atlas@1.1.4/world/110m.json">
          {({ geographies }) =>
            geographies.map((geo, i) => (
              <Geography key={geo.rsmKey} geography={geo} />
            ))
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
};

export default Globe;
