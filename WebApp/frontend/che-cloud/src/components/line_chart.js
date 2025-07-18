import { text } from 'd3';
import React from 'react';
import Chart from "react-apexcharts";

const BrushChart = ({
  title = "FAIR score",
  data,
  height = 300,
  minDate,
  maxDate,
  kg_name
}) => {
  const mainOptions = {
    chart: {
      id: "main",
      type: "scatter",
      height: height,
      toolbar: { autoSelected: "pan", show: false },
      zoom: { enabled: false }
    },
    title: {
      text: title,
      align: 'center',
        style: {
            fontSize: '18px',
        }
    },
    subtitle : {
        text: kg_name ? `${kg_name}` : '',
        align: 'center',
    },
    xaxis: {
      type: "datetime",
      min: minDate,
      max: maxDate
    },
    stroke: {
    width: 0
    },
    markers: {
        size: 4
    },
    yaxis: {
      min: 0,
      max: 4,
    },
    tooltip: {
      x: { format: "dd MMM yyyy" },
      y: {
        formatter: (val) => val.toFixed(2)
      }
    },
    stroke: {
      width: 2,
      curve: 'smooth'
    }
  };

 const brushOptions = {
  chart: {
    id: "brush",
    height: 100,
    type: "area",
    brush: {
      target: "main",
      enabled: true
    },
    selection: {
      enabled: true,
      xaxis: {
        min: minDate,
        max: maxDate
      }
    }
  },
  xaxis: {
    type: "datetime",
    tooltip: { enabled: false }
  },
  yaxis: {
    min: 0,
    tickAmount: 2
  },
  stroke: {
    width: 2, 
    curve: 'straight' 
  },
  fill: {
    type: 'gradient'
  }
};

  return (
    <div>
      <Chart
        options={mainOptions}
        series={[{ name: "FAIR score", data }]}
        type="line"
        height={height}
      />
      <Chart
        options={brushOptions}
        series={[{ name: "FAIR score", data: data }]}
        type="area"
        height={130}
      />
    </div>
  );
};

export default BrushChart;
