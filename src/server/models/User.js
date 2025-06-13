class User extends Database {
  constructor() {
    super(Config.SPREADSHEET_IDS.DATABASE, Config.SHEET_NAMES.USERS);
  }
  
  findByEmail(email) {
    try {
      const result = this.findRowByValue(email, 1); // Колонка B = Email
      if (result) {
        return this.mapRowToUser(result.data, result.rowNumber);
      }
      return null;
    } catch (error) {
      LoggingService.logError('User.findByEmail', error, { email });
      throw error;
    }
  }
  
  getCurrentUser() {
    try {
      const userEmail = Session.getActiveUser().getEmail();
      if (!userEmail) {
        return null;
      }
      return this.findByEmail(userEmail);
    } catch (error) {
      LoggingService.logError('User.getCurrentUser', error);
      return null;
    }
  }
  
  mapRowToUser(rowData, rowNumber) {
    try {
      return {
        id: rowData[0],           // A: ID
        email: rowData[1],        // B: Email  
        name: rowData[2],         // C: ФИО
        department: rowData[3],   // D: Департамент
        role: rowData[4],         // E: Роль
        allowedCategories: rowData[5] ? rowData[5].split(',') : [], // F: Категории
        isActive: rowData[6],     // G: Активный
        rowNumber: rowNumber
      };
    } catch (error) {
      LoggingService.logError('User.mapRowToUser', error);
      throw error;
    }
  }
}
