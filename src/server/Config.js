class Config {
  static get SPREADSHEET_IDS() {
    return {
      DATABASE: 'ВАШ_РЕАЛЬНЫЙ_ID_ТАБЛИЦЫ_СЮДА'
    };
  }
  
  static get SHEET_NAMES() {
    return {
      USERS: 'Пользователи',
      NOMENCLATURE: 'Номенклатура',
      SUPPLIERS: 'Поставщики',
      ORDERS: 'Заказы',
      ORDER_ITEMS: 'Детали_заказов',
      LOGS: 'Лог_действий'
    };
  }
  
  static get USER_ROLES() {
    return {
      USER: 'USER',
      MANAGER: 'MANAGER',
      PROCUREMENT: 'PROCUREMENT',
      ADMIN: 'ADMIN'
    };
  }
  
  static get APP_SETTINGS() {
    return {
      NAME: 'Система заказов',
      VERSION: '1.0.0'
    };
  }
  
  static get ERROR_MESSAGES() {
    return {
      ACCESS_DENIED: 'Доступ запрещен',
      USER_NOT_FOUND: 'Пользователь не найден',
      SYSTEM_ERROR: 'Системная ошибка'
    };
  }
}
