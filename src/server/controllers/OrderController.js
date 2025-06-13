class OrderController {
  constructor() {
    this.orderModel = new Order();
  }
  
  getUserOrders(userInfo) {
    try {
      const orders = this.orderModel.getUserOrders(userInfo.id);
      LoggingService.logInfo('OrderController.getUserOrders', 'Получены заказы пользователя', {
        userId: userInfo.id,
        ordersCount: orders.length
      });
      return ApiResponse.success(orders, `Найдено заказов: ${orders.length}`);
    } catch (error) {
      LoggingService.logError('OrderController.getUserOrders', error);
      return ApiResponse.error('Ошибка получения заказов');
    }
  }
  
  getAllOrders(userInfo) {
    try {
      // Проверка прав (только ADMIN и PROCUREMENT)
      if (!['ADMIN', 'PROCUREMENT'].includes(userInfo.role)) {
        return ApiResponse.error('Недостаточно прав доступа', 403);
      }
      
      const orders = this.orderModel.getAllOrders();
      return ApiResponse.success(orders, `Всего заказов: ${orders.length}`);
    } catch (error) {
      LoggingService.logError('OrderController.getAllOrders', error);
      return ApiResponse.error('Ошибка получения всех заказов');
    }
  }
  
  getOrderDetails(orderId, userInfo) {
    try {
      const order = this.orderModel.findById(orderId);
      if (!order) {
        return ApiResponse.error('Заказ не найден', 404);
      }
      
      // Проверка прав доступа
      if (order.userId !== userInfo.id && !['ADMIN', 'PROCUREMENT'].includes(userInfo.role)) {
        return ApiResponse.error('Нет доступа к заказу', 403);
      }
      
      return ApiResponse.success(order, 'Детали заказа получены');
    } catch (error) {
      LoggingService.logError('OrderController.getOrderDetails', error);
      return ApiResponse.error('Ошибка получения деталей заказа');
    }
  }
  
  createOrder(orderData, userInfo) {
    try {
      // Подготовка данных заказа
      const newOrderData = {
        userId: userInfo.id,
        userEmail: userInfo.email,
        userName: userInfo.name,
        department: userInfo.department,
        totalAmount: orderData.totalAmount || 0,
        comment: orderData.comment || ''
      };
      
      const createdOrder = this.orderModel.createOrder(newOrderData);
      
      LoggingService.logInfo('OrderController.createOrder', 'Создан новый заказ', {
        orderId: createdOrder.id,
        userId: userInfo.id,
        amount: createdOrder.totalAmount
      });
      
      return ApiResponse.success(createdOrder, 'Заказ успешно создан');
    } catch (error) {
      LoggingService.logError('OrderController.createOrder', error);
      return ApiResponse.error('Ошибка создания заказа');
    }
  }
}
