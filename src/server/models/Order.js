class Order extends Database {
  constructor() {
    super(Config.SPREADSHEET_IDS.DATABASE, Config.SHEET_NAMES.ORDERS);
  }
  
  findById(orderId) {
    try {
      const result = this.findRowByValue(orderId, 0);
      if (result) {
        return this.mapRowToOrder(result.data, result.rowNumber);
      }
      return null;
    } catch (error) {
      LoggingService.logError('Order.findById', error, { orderId });
      throw error;
    }
  }
  
  getUserOrders(userId) {
    try {
      const allData = this.getAllData();
      return allData
        .filter(row => row[1] === userId)
        .map((row, index) => this.mapRowToOrder(row, index + 2));
    } catch (error) {
      LoggingService.logError('Order.getUserOrders', error, { userId });
      throw error;
    }
  }
  
  getAllOrders() {
    try {
      const allData = this.getAllData();
      return allData.map((row, index) => this.mapRowToOrder(row, index + 2));
    } catch (error) {
      LoggingService.logError('Order.getAllOrders', error);
      throw error;
    }
  }
  
  createOrder(orderData) {
    try {
      const orderId = 'ORD_' + new Date().getTime();
      const rowData = [
        orderId,
        orderData.userId,
        orderData.userEmail,
        orderData.userName,
        orderData.department,
        new Date(),
        'СОЗДАН',
        orderData.totalAmount,
        orderData.comment || '',
        '',
        ''
      ];
      
      const rowNumber = this.appendRow(rowData);
      return this.mapRowToOrder(rowData, rowNumber);
    } catch (error) {
      LoggingService.logError('Order.createOrder', error);
      throw error;
    }
  }
  
  mapRowToOrder(rowData, rowNumber) {
    return {
      id: rowData[0],
      userId: rowData[1],
      userEmail: rowData[2],
      userName: rowData[3],
      department: rowData[4],
      createDate: rowData[5],
      status: rowData[6],
      totalAmount: rowData[7],
      comment: rowData[8],
      approvedBy: rowData[9],
      approvedDate: rowData[10],
      rowNumber: rowNumber
    };
  }
}
