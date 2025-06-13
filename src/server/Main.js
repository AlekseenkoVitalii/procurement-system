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
        
      default:
        return ApiResponse.error('Неизвестное действие: ' + action);
    }
    
  } catch (error) {
    LoggingService.logError('Main.doPost', error);
    return ApiResponse.error('Системная ошибка', 500);
  }
}

function renderDashboard(userInfo) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${Config.APP_SETTINGS.NAME}</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { background: #3498db; color: white; padding: 20px; border-radius: 10px; }
        .user-info { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .success { color: #27ae60; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 ${Config.APP_SETTINGS.NAME}</h1>
          <p>Добро пожаловать в систему заказов!</p>
        </div>
        
        <div class="user-info">
          <h3>Информация о пользователе:</h3>
          <p><strong>ФИО:</strong> ${userInfo.name}</p>
          <p><strong>Email:</strong> ${userInfo.email}</p>
          <p><strong>Департамент:</strong> ${userInfo.department}</p>
          <p><strong>Роль:</strong> ${userInfo.role}</p>
        </div>
        
        <div class="success">
          <h3>✅ Система работает корректно!</h3>
          <p>MVC архитектура настроена и готова к развитию.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html);
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
