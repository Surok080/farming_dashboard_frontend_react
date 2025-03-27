export const appBarName = (menu) => {
  switch (menu) {
      case 'cartogram':
            return "Картограммы"
      case 'fields':
          return "Поля"
      case 'state_monitoring':
          return "Госмониторинг"
      case 'tech_map':
          return "ТехКарта"
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