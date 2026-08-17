export const appBarName = (menu) => {
  switch (menu) {
      case 'cartogram':
            return "Картограммы"
      case 'fields':
      case 'fields_v2':
          return "Поля"
      case 'monitoring':
          return "Мониторинг"
      case 'state_monitoring':
          return "Госмониторинг"
      case 'tech_map':
          return "ТехКарта"
      case 'warehouse_accounting':
          return "Склад-учёт"
      default:
          return menu
  }
}

export function moveStringToSecondPositionImmutable(array, targetString) {
    // Фильтруем массив, исключая целевую строку
    const filteredArray = array.filter(item => item !== targetString);

    // Если строка была в исходном массиве
    if (filteredArray.length !== array.length) {
        // Создаём новый массив:
        // - первый элемент исходного массива
        // - целевая строка
        // - остальные элементы из отфильтрованного массива
        return [
            filteredArray[0],  // Первый элемент остаётся на месте
            targetString,      // Вставляем целевую строку на вторую позицию
            ...filteredArray.slice(1) // Все остальные элементы
        ];
    }

    // Если строка не найдена, возвращаем исходный массив
    return array;
}

export function moveStringToFirstPositionImmutable(array, targetString) {
    // Фильтруем массив, исключая целевую строку
    const filteredArray = array.filter(item => item !== targetString);

    // Если строка была в исходном массиве
    if (filteredArray.length !== array.length) {
        // Создаём новый массив:
        // - целевая строка на первой позиции
        // - все остальные элементы из отфильтрованного массива
        return [
            targetString,      // Вставляем целевую строку на первую позицию
            ...filteredArray   // Все остальные элементы
        ];
    }

    // Если строка не найдена, возвращаем исходный массив
    return array;
}

/**
 * Сортирует массив вкладок по фиксированному порядку:
 * 1. tech_map (ТехКарта)
 * 2. fields/fields_v2 (Поля)
 * 3. monitoring (Мониторинг)
 * 4. cartogram (Картограммы)
 * 5. state_monitoring (Госмониторинг)
 * 6. warehouse_accounting (Склад-учёт)
 * Остальные вкладки добавляются в конец
 */
export function sortTabsByFixedOrder(tabs) {
    // Создаём копию массива, чтобы не мутировать исходный
    const tabsCopy = [...tabs];
    
    // Если есть fields_v2, убираем fields чтобы не было дубликатов
    if (tabsCopy.includes('fields_v2')) {
        const filtered = tabsCopy.filter(tab => tab !== 'fields');
        return sortTabsByOrder(filtered);
    }
    
    return sortTabsByOrder(tabsCopy);
}

/**
 * Вспомогательная функция для сортировки вкладок по заданному порядку
 */
function sortTabsByOrder(tabs) {
    // Определяем порядок вкладок
    const order = ['tech_map', 'fields', 'fields_v2', 'monitoring', 'cartogram', 'state_monitoring', 'warehouse_accounting'];
    
    // Создаём Map для быстрого поиска индекса
    const orderMap = new Map();
    order.forEach((tab, index) => {
        orderMap.set(tab, index);
    });
    
    // Сортируем вкладки (создаём новый массив)
    const sorted = [...tabs].sort((a, b) => {
        const indexA = orderMap.get(a);
        const indexB = orderMap.get(b);
        
        // Если обе вкладки в порядке - сортируем по порядку
        if (indexA !== undefined && indexB !== undefined) {
            return indexA - indexB;
        }
        
        // Если только одна в порядке - она идёт первой
        if (indexA !== undefined) return -1;
        if (indexB !== undefined) return 1;
        
        // Если обе не в порядке - сохраняем исходный порядок
        return 0;
    });
    
    return sorted;
}