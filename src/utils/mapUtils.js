export   const getAreaLayers = (layers, setStatistics) => {
  const graphStatics = [["Поле", "Площадь"]];

  layers.features.map((item, index) => {
    if (graphStatics.find((area) => area[0] === item.properties.crop)) {
      graphStatics.map((area) => {
        if (area[0] === item.properties.crop) {
          area[1] = +parseFloat(
            area[1] + +parseFloat(item.properties.area).toFixed(1)
          ).toFixed(1);
        }
      });
    } else {
      graphStatics.push([
        item.properties.crop,
        +parseFloat(item.properties.area).toFixed(1),
      ]);
    }
  });

  setStatistics(graphStatics);
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
