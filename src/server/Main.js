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
    return HtmlService.createHtmlOutput(`
      <h1>Системная ошибка</h1>
      <p>${error.message}</p>
      <pre>${error.stack}</pre>
    `);
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
      
      case 'getUserOrders': {
        const orderController = new OrderController();
        return orderController.getUserOrders(accessCheck.userInfo);
      }
      
      case 'getAllOrders': {
        const orderController = new OrderController();
        return orderController.getAllOrders(accessCheck.userInfo);
      }
      
      case 'getOrderDetails': {
        const orderController = new OrderController();
        return orderController.getOrderDetails(requestData.orderId, accessCheck.userInfo);
      }
      
      case 'createOrder': {
        const orderController = new OrderController();
        return orderController.createOrder(requestData.orderData, accessCheck.userInfo);
      }
      
      default:
        return ApiResponse.error('Неизвестное действие: ' + action);
    }
    
  } catch (error) {
    LoggingService.logError('Main.doPost', error);
    return ApiResponse.error('Системная ошибка', 500);
  }
}

function renderDashboard(userInfo) {
  try {
    const template = HtmlService.createTemplateFromFile('index');
    template.userInfo = userInfo;
    
    return template.evaluate()
      .setTitle(Config.APP_SETTINGS.NAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    LoggingService.logError('Main.renderDashboard', error);
    return HtmlService.createHtmlOutput(`
      <h1>Ошибка загрузки интерфейса</h1>
      <p>${error.message}</p>
    `);
  }
}

function include(filename) {
  try {
    // Логируем для отладки
    LoggingService.logDebug('Main.include', 'Подключение файла', { filename });
    
    if (filename === 'styles') {
      // Пробуем разные варианты имен файлов
      try {
        return HtmlService.createHtmlOutputFromFile('styles.html').getContent();
      } catch (e) {
        try {
          return HtmlService.createHtmlOutputFromFile('styles').getContent();
        } catch (e2) {
          LoggingService.logError('Main.include', e2, { filename: 'styles' });
          // Возвращаем минимальные стили если файл не найден
          return getDefaultStyles();
        }
      }
    }
    
    if (filename === 'app') {
      try {
        // Сначала пробуем загрузить api.html и app.html
        const apiContent = HtmlService.createHtmlOutputFromFile('api.html').getContent();
        const appContent = HtmlService.createHtmlOutputFromFile('app.html').getContent();
        return apiContent + '\n' + appContent;
      } catch (e) {
        try {
          // Если не получилось, пробуем без .html
          const apiContent = HtmlService.createHtmlOutputFromFile('api').getContent();
          const appContent = HtmlService.createHtmlOutputFromFile('app').getContent();
          return apiContent + '\n' + appContent;
        } catch (e2) {
          LoggingService.logError('Main.include', e2, { filename: 'app' });
          // Возвращаем минимальный JS если файлы не найдены
          return getDefaultApp();
        }
      }
    }
    
    return '';
  } catch (error) {
    LoggingService.logError('Main.include', error);
    return '';
  }
}

function getDefaultStyles() {
  return `
    body { font-family: Arial, sans-serif; margin: 20px; }
    .loading-screen { text-align: center; padding: 50px; }
    .alert { padding: 10px; margin: 10px 0; border-radius: 5px; }
    .alert-danger { background-color: #f8d7da; color: #721c24; }
  `;
}

function getDefaultApp() {
  return `
    document.addEventListener('DOMContentLoaded', function() {
      document.getElementById('loading-screen').innerHTML = 
        '<div class="alert alert-danger">Ошибка загрузки приложения. Проверьте файлы api.html и app.html</div>';
    });
  `;
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

// ===== ТЕСТОВЫЕ ФУНКЦИИ =====

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

// Функция для проверки существования HTML файлов
function checkHtmlFiles() {
  const results = {
    'index.html': false,
    'styles.html': false,
    'app.html': false,
    'api.html': false,
    'index': false,
    'styles': false,
    'app': false,
    'api': false
  };
  
  for (const filename of Object.keys(results)) {
    try {
      HtmlService.createHtmlOutputFromFile(filename);
      results[filename] = true;
    } catch (e) {
      results[filename] = false;
    }
  }
  
  console.log('Проверка HTML файлов:', results);
  return results;
}

// Функция для отладки веб-приложения
function debugWebApp() {
  try {
    console.log('=== ОТЛАДКА ВЕБ-ПРИЛОЖЕНИЯ ===');
    
    // 1. Проверяем доступ
    const authController = new AuthController();
    const accessCheck = authController.checkAccess();
    console.log('Проверка доступа:', accessCheck);
    
    // 2. Проверяем HTML файлы
    const htmlFiles = checkHtmlFiles();
    console.log('HTML файлы:', htmlFiles);
    
    // 3. Пробуем рендерить dashboard
    if (accessCheck.hasAccess) {
      try {
        const output = renderDashboard(accessCheck.userInfo);
        console.log('Dashboard рендерится успешно');
      } catch (e) {
        console.error('Ошибка рендеринга dashboard:', e);
      }
    }
    
    return {
      access: accessCheck,
      htmlFiles: htmlFiles
    };
  } catch (error) {
    console.error('Ошибка отладки:', error);
    return { error: error.message };
  }
}