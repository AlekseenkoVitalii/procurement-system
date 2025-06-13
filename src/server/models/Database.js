class Database {
  constructor(spreadsheetId, sheetName) {
    this.spreadsheetId = spreadsheetId;
    this.sheetName = sheetName;
    this._sheet = null;
  }
  
  get sheet() {
    if (!this._sheet) {
      const spreadsheet = SpreadsheetApp.openById(this.spreadsheetId);
      this._sheet = spreadsheet.getSheetByName(this.sheetName);
      if (!this._sheet) {
        throw new Error(`Лист "${this.sheetName}" не найден`);
      }
    }
    return this._sheet;
  }
  
  getAllData(includeHeaders = false) {
    try {
      const data = this.sheet.getDataRange().getValues();
      return includeHeaders ? data : data.slice(1);
    } catch (error) {
      LoggingService.logError('Database.getAllData', error);
      throw error;
    }
  }
  
  appendRow(rowData) {
    try {
      this.sheet.appendRow(rowData);
      return this.sheet.getLastRow();
    } catch (error) {
      LoggingService.logError('Database.appendRow', error);
      throw error;
    }
  }
  
  findRowByValue(value, columnIndex = 0) {
    try {
      const data = this.getAllData();
      for (let i = 0; i < data.length; i++) {
        if (data[i][columnIndex] === value) {
          return {
            rowNumber: i + 2,
            data: data[i]
          };
        }
      }
      return null;
    } catch (error) {
      LoggingService.logError('Database.findRowByValue', error);
      throw error;
    }
  }
}
