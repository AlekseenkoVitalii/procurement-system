class LoggingService {
  static logInfo(source, message, details = {}) {
    const timestamp = new Date().toISOString();
    const user = Session.getActiveUser().getEmail() || 'Unknown';
    console.log(`[INFO] ${timestamp} | ${user} | ${source}: ${message}`, details);
    
    // Опционально: запись в лист логов
    try {
      this.writeToLogSheet('INFO', source, message, details);
    } catch (e) {
      // Игнорируем ошибки записи логов
    }
  }
  
  static logError(source, error, details = {}) {
    const timestamp = new Date().toISOString();
    const user = Session.getActiveUser().getEmail() || 'Unknown';
    const errorMessage = error.message || error.toString();
    const stackTrace = error.stack || 'No stack trace';
    
    console.error(`[ERROR] ${timestamp} | ${user} | ${source}: ${errorMessage}`, {
      details: details,
      stack: stackTrace
    });
    
    // Опционально: запись в лист логов
    try {
      this.writeToLogSheet('ERROR', source, errorMessage, {
        ...details,
        stack: stackTrace
      });
    } catch (e) {
      // Игнорируем ошибки записи логов
    }
  }
  
  static logDebug(source, message, details = {}) {
    const timestamp = new Date().toISOString();
    const user = Session.getActiveUser().getEmail() || 'Unknown';
    console.log(`[DEBUG] ${timestamp} | ${user} | ${source}: ${message}`, details);
  }
  
  static writeToLogSheet(level, source, message, details) {
    try {
      const spreadsheet = SpreadsheetApp.openById(Config.SPREADSHEET_IDS.DATABASE);
      const logSheet = spreadsheet.getSheetByName(Config.SHEET_NAMES.LOGS);
      
      if (!logSheet) {
        // Создаем лист логов если его нет
        const newSheet = spreadsheet.insertSheet(Config.SHEET_NAMES.LOGS);
        newSheet.appendRow(['Timestamp', 'Level', 'User', 'Source', 'Message', 'Details']);
        newSheet.getRange(1, 1, 1, 6).setFontWeight('bold');
      }
      
      const rowData = [
        new Date(),
        level,
        Session.getActiveUser().getEmail() || 'Unknown',
        source,
        message,
        JSON.stringify(details)
      ];
      
      (logSheet || newSheet).appendRow(rowData);
    } catch (error) {
      // Молча игнорируем ошибки записи в лог
    }
  }
  
  // Метод для просмотра последних логов
  static getRecentLogs(count = 50) {
    try {
      const spreadsheet = SpreadsheetApp.openById(Config.SPREADSHEET_IDS.DATABASE);
      const logSheet = spreadsheet.getSheetByName(Config.SHEET_NAMES.LOGS);
      
      if (!logSheet || logSheet.getLastRow() <= 1) {
        return 'Логи не найдены';
      }
      
      const lastRow = logSheet.getLastRow();
      const startRow = Math.max(2, lastRow - count + 1);
      const numRows = lastRow - startRow + 1;
      
      const logs = logSheet.getRange(startRow, 1, numRows, 6).getValues();
      
      return logs.map(row => ({
        timestamp: row[0],
        level: row[1],
        user: row[2],
        source: row[3],
        message: row[4],
        details: row[5]
      })).reverse(); // Последние логи первыми
      
    } catch (error) {
      return 'Ошибка чтения логов: ' + error.message;
    }
  }
}