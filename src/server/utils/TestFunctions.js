/**
 * Тестовые функции для проверки системы
 */

function testUserOrders() {
  try {
    LoggingService.logInfo('testUserOrders', 'Тест заказов пользователя USER_002');
    
    const orderModel = new Order();
    const orders = orderModel.getUserOrders('USER_002');
    
    console.log('Найдено заказов:', orders.length);
    console.log('Заказы:', orders);
    
    return {
      success: true,
      ordersCount: orders.length,
      orders: orders
    };
  } catch (error) {
    LoggingService.logError('testUserOrders', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function testAllOrders() {
  try {
    LoggingService.logInfo('testAllOrders', 'Тест всех заказов в системе');
    
    const orderModel = new Order();
    const orders = orderModel.getAllOrders();
    
    console.log('Всего заказов в системе:', orders.length);
    console.log('Все заказы:', orders);
    
    return {
      success: true,
      totalOrders: orders.length,
      orders: orders
    };
  } catch (error) {
    LoggingService.logError('testAllOrders', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function testCreateOrder() {
  try {
    LoggingService.logInfo('testCreateOrder', 'Тест создания заказа');
    
    const orderController = new OrderController();
    
    const userInfo = {
      id: 'USER_001',
      email: 'alieksieienkovitalii@gmail.com',
      name: 'Алексеенко Виталий',
      department: 'IT',
      role: 'ADMIN'
    };
    
    const orderData = {
      totalAmount: 5000,
      comment: 'Тестовый заказ из VS Code'
    };
    
    const result = orderController.createOrder(orderData, userInfo);
    console.log('Результат создания заказа:', result);
    
    return result;
  } catch (error) {
    LoggingService.logError('testCreateOrder', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function testOrderSystem() {
  try {
    console.log('=== ТЕСТ СИСТЕМЫ ЗАКАЗОВ ===');
    
    const userOrders = testUserOrders();
    const allOrders = testAllOrders();
    const newOrder = testCreateOrder();
    
    return {
      userOrders: userOrders,
      allOrders: allOrders,
      newOrder: newOrder,
      summary: `
        Заказов пользователя: ${userOrders.ordersCount || 0}
        Всего заказов: ${allOrders.totalOrders || 0}
        Создание заказа: ${newOrder.success ? 'Успешно' : 'Ошибка'}
      `
    };
  } catch (error) {
    console.error('Ошибка тестирования:', error);
    return { error: error.message };
  }
}
