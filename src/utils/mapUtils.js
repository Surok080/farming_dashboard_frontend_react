export   const getAreaLayers = (layers, setStatistics, grouping) => {
  const graphStatics = [["Поле", "Площадь"]];
  let nameParams = grouping

  if (nameParams === 'form_owner') {
    nameParams = 'plot_form_owner'
  } else if (nameParams === 'land_owner') {
    nameParams = 'plot_land_owner'
  }

    layers.features.map((item, index) => {
      
      if (graphStatics.find((area) => area[0] === item.properties[nameParams])) {
        graphStatics.map((area) => {
          if (area[0] === item.properties[nameParams]) {
            area[1] = +parseFloat(
              area[1] + +parseFloat(item.properties.area).toFixed(1)
            ).toFixed(1);
          }
        });
      } else {
        graphStatics.push([
          item.properties[nameParams],
          +parseFloat(item.properties.area).toFixed(1),
        ]);
      }
    });

  setStatistics(graphStatics);
};

export const getColorLayers = (layers, setColorLayers, grouping) => {
  let colorsLayers = [];
  let nameParams = grouping

  if (nameParams === 'form_owner') {
    nameParams = 'plot_form_owner'
  } else if (nameParams === 'land_owner') {
    nameParams = 'plot_land_owner'
  }
  
    layers.features.map((item, index) => {
      if (colorsLayers.find((layer) => layer.name === item.properties[nameParams])) {
      } else {
        colorsLayers.push({
          name: item.properties[nameParams],
          color: item.properties.color,
        });
      }
    });

  setColorLayers(colorsLayers);
};

export const getOptionChart = (colors) => {
  return {
    title: "Структура посевов (га)",
    legend: {
      position: "right",
      alignment: "center",
      orientation: "vertical",
    }, // Размещение легенды
    chartArea: { left: 20, top: 100, width: "100%", height: "50%" }, // Управление областью рисования диаграммы
    pieSliceText: "value",
    pieHole: 0.4,
    is3D: false,
    colors: colors.map((item) => item.color),
  }
}
