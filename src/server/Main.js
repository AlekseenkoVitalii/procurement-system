function doGet(e) {
  try {
    LoggingService.logInfo('Main.doGet', 'Входящий GET запрос');
    
    // Проверка доступа
    const authController = new AuthController();
    const accessCheck = authController.checkAccess();
    
    if (!accessCheck.hasAccess) {
      return renderAccessDenied(accessCheck.message);
    }
    
    return renderDashboard(accessCheck.userInfo);
      
  } catch (error) {
    LoggingService.logError('Main.doGet', error);
    return HtmlService.createHtmlOutput('<h1>Системная ошибка</h1>');
  }
}

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    // Проверка доступа
    const authController = new AuthController();
    const accessCheck = authController.checkAccess();
    
    if (!accessCheck.hasAccess) {
      return ApiResponse.error('Доступ запрещен', 401);
    }
    
    // API роутинг
    switch (action) {
      case 'checkAccess':
        return ApiResponse.success(accessCheck.userInfo, 'Доступ разрешен');
      
      case 'getUserInfo':
        return ApiResponse.success(accessCheck.userInfo);
      
        case 'getUserOrders':
          const orderController = new OrderController();
          return orderController.getUserOrders(accessCheck.userInfo);
        
        case 'getAllOrders':
          const orderController2 = new OrderController();
          return orderController2.getAllOrders(accessCheck.userInfo);
        
        case 'getOrderDetails':
          const orderController3 = new OrderController();
          return orderController3.getOrderDetails(requestData.orderId, accessCheck.userInfo);
        
        case 'createOrder':
          const orderController4 = new OrderController();
          return orderController4.createOrder(requestData.orderData, accessCheck.userInfo);
        
      default:
        return ApiResponse.error('Неизвестное действие: ' + action);
    }
    
  } catch (error) {
    LoggingService.logError('Main.doPost', error);
    return ApiResponse.error('Системная ошибка', 500);
  }
}

function renderDashboard(userInfo) {
  const template = HtmlService.createTemplateFromFile('index');
  template.userInfo = userInfo;
  
  return template.evaluate()
    .setTitle(Config.APP_SETTINGS.NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  if (filename === 'styles') {
    return HtmlService.createHtmlOutputFromFile('styles').getContent();
  }
  if (filename === 'app') {
    return HtmlService.createHtmlOutputFromFile('app').getContent();
  }
  return '';
}

function renderAccessDenied(message) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Доступ ограничен</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
        .error { color: #e74c3c; }
      </style>
    </head>
    <body>
      <h1 class="error">🔒 Доступ ограничен</h1>
      <p>${message}</p>
    </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html);
}

function test() {
  LoggingService.logInfo('test', 'Тест MVC системы');
  
  // Тестируем создание контроллера
  const auth = new AuthController();
  const user = auth.userModel.getCurrentUser();
  
  return `MVC система работает! Пользователь: ${user ? user.email : 'не найден'}`;
}

function testDatabase() {
  LoggingService.logInfo('testDatabase', 'Тест подключения к базе данных');
  
  try {
    const userModel = new User();
    const currentUser = userModel.getCurrentUser();
    
    return {
      success: true,
      message: 'База данных доступна',
      user: currentUser ? currentUser.email : 'Пользователь не найден в БД'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Ошибка подключения к базе: ' + error.message
    };
  }
}
