// src/components/PriceSlider.jsx

import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css"; // Import the slider's CSS

const PriceSlider = ({ min, max, values, onChange }) => {
  // Don't render if the max price hasn't been calculated yet
  if (max === 0) return null;
    
  return (
    <div className="py-6">
      <h3 className="font-medium text-gray-900 mb-4">Prix</h3>
      <Slider
        range
        min={min}
        max={max}
        value={values}
        onChange={onChange}
        allowCross={false}
        step={5}
        handleStyle={[
          {
            borderColor: "#111827",
            backgroundColor: "white",
            borderWidth: 2,
            height: 16,
            width: 16,
            marginTop: -6,
          },
          {
            borderColor: "#111827",
            backgroundColor: "white",
            borderWidth: 2,
            height: 16,
            width: 16,
            marginTop: -6,
          },
        ]}
        trackStyle={[{ backgroundColor: "#111827", height: 4 }]}
        railStyle={{ backgroundColor: "#e5e7eb", height: 4 }}
      />
      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>€{values[0]}</span>
        <span>€{values[1]}</span>
      </div>
    </div>
  );
};

export default PriceSlider;
