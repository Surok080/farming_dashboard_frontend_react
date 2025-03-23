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

