/**
 * Утилиты для преобразования данных полей в GeoJSON формат
 */

/**
 * Создает маппинг цветов для культур из legends
 */
export const createCropColorMap = (legends = []) => {
  const cropColorMap = {};
  if (Array.isArray(legends)) {
    legends.forEach(legend => {
      if (legend.crop_id && legend.color) {
        cropColorMap[legend.crop_id] = legend.color;
      }
      if (legend.crop_name && legend.color) {
        cropColorMap[legend.crop_name] = legend.color;
      }
    });
  }
  return cropColorMap;
};

/**
 * Извлекает геометрию из различных вариантов структуры field
 */
export const extractGeometry = (field) => {
  if (field.geojson) {
    if (field.geojson.geometry) {
      return field.geojson.geometry;
    } else if (field.geojson.type) {
      return field.geojson;
    }
  } else if (field.geometry) {
    return field.geometry;
  }
  return null;
};

/**
 * Извлекает историю севооборота из field
 */
export const extractRotationHistory = (field) => {
  if (field.geojson?.properties?.sevooborot) {
    return field.geojson.properties.sevooborot;
  }
  if (Array.isArray(field.rotation_history)) {
    return field.rotation_history;
  }
  if (Array.isArray(field.rotation)) {
    return field.rotation;
  }
  if (Array.isArray(field.crop_rotation)) {
    return field.crop_rotation;
  }
  if (Array.isArray(field.sevooborot)) {
    return field.sevooborot;
  }
  return null;
};

/**
 * Извлекает репродукцию из field
 */
export const extractReproduction = (field) => {
  return field.geojson?.properties?.reproduction || field.reproduction || null;
};

/**
 * Создает базовые properties для поля
 */
export const createBaseProperties = (field, crop, cropColorMap) => {
  return {
    id: field.field_id,
    name: field.field_name,
    area: field.area,
    color: crop?.color || cropColorMap[field.crop_id] || cropColorMap[field.crop_name] || "#e4da3b",
    center: field.center,
  };
};

/**
 * Добавляет свойства для группировки
 */
export const addGroupingProperties = (properties, field, group, grouping) => {
  const baseGroupingProps = {
    crop: field.crop_name,
    crop_name: field.crop_name,
    cultivar: field.cultivar,
    crop_kind: field.cultivar,
    crop_group: group.group_name,
  };

  switch (grouping) {
    case 'crop':
      return {
        ...properties,
        ...baseGroupingProps,
        crop: field.crop_name,
        [grouping]: field.crop_name,
      };
    case 'crop_group':
      return {
        ...properties,
        ...baseGroupingProps,
        [grouping]: group.group_name,
      };
    case 'productivity':
      return {
        ...properties,
        ...baseGroupingProps,
        [grouping]: group.group_name,
        productivity_value: field.productivity_value,
      };
    default:
      return properties;
  }
};

/**
 * Обрабатывает одно поле и добавляет его в features
 */
export const processField = (field, group, crop, cropColorMap, grouping, features) => {
  const geometry = extractGeometry(field);
  if (!geometry) return;

  let properties = createBaseProperties(field, crop, cropColorMap);

  // Добавляем историю севооборота
  const rotationHistory = extractRotationHistory(field);
  if (rotationHistory) {
    properties.rotation_history = rotationHistory;
  }

  // Добавляем репродукцию
  const reproduction = extractReproduction(field);
  if (reproduction) {
    properties.reproduction = reproduction;
  }

  // Добавляем свойства для группировки
  properties = addGroupingProperties(properties, field, group, grouping);

  features.push({
    type: 'Feature',
    geometry: geometry,
    properties: properties,
  });
};

/**
 * Обрабатывает поля из структуры groups -> crops -> fields
 */
const processFieldsFromCrops = (group, cropColorMap, grouping, features) => {
  if (!group.crops || !Array.isArray(group.crops)) return;

  group.crops.forEach(crop => {
    if (crop.fields && Array.isArray(crop.fields)) {
      crop.fields.forEach(field => {
        processField(field, group, crop, cropColorMap, grouping, features);
      });
    }
  });
};

/**
 * Обрабатывает поля из структуры groups -> fields
 */
const processFieldsDirect = (group, cropColorMap, grouping, features) => {
  if (!group.fields || !Array.isArray(group.fields)) return;

  group.fields.forEach(field => {
    processField(field, group, null, cropColorMap, grouping, features);
  });
};

/**
 * Преобразует данные API в формат GeoJSON
 */
export const transformNewDataToGeoJSON = (data, grouping) => {
  const features = [];
  
  if (!data?.groups || !Array.isArray(data.groups)) {
    return {
      type: 'FeatureCollection',
      center: data?.center || [0, 0],
      total_area: data?.total_area || 0,
      features: [],
    };
  }

  const cropColorMap = createCropColorMap(data.legends);

  data.groups.forEach(group => {
    // Обрабатываем оба варианта структуры
    processFieldsFromCrops(group, cropColorMap, grouping, features);
    processFieldsDirect(group, cropColorMap, grouping, features);
  });

  return {
    type: 'FeatureCollection',
    center: data.center,
    total_area: data.total_area,
    features: features,
  };
};

