/**
 * Диагностические функции для проверки и настройки системы
 */

// Проверка всех компонентов системы
function runFullDiagnostics() {
    console.log('=== ПОЛНАЯ ДИАГНОСТИКА СИСТЕМЫ ===');
    
    const results = {
      timestamp: new Date().toISOString(),
      user: null,
      database: null,
      sheets: null,
      access: null
    };
    
    // 1. Проверка текущего пользователя
    try {
      const email = Session.getActiveUser().getEmail();
      results.user = {
        success: true,
        email: email || 'Не определен',
        message: email ? 'Пользователь определен' : 'Email пользователя не доступен'
      };
    } catch (error) {
      results.user = {
        success: false,
        error: error.message
      };
    }
    
    // 2. Проверка доступа к базе данных
    try {
      const spreadsheet = SpreadsheetApp.openById(Config.SPREADSHEET_IDS.DATABASE);
      results.database = {
        success: true,
        spreadsheetName: spreadsheet.getName(),
        message: 'База данных доступна'
      };
    } catch (error) {
      results.database = {
        success: false,
        error: error.message,
        message: 'Не удается открыть таблицу базы данных'
      };
    }
    
    // 3. Проверка всех листов
    try {
      const spreadsheet = SpreadsheetApp.openById(Config.SPREADSHEET_IDS.DATABASE);
      const sheets = {};
      
      for (const [key, sheetName] of Object.entries(Config.SHEET_NAMES)) {
        const sheet = spreadsheet.getSheetByName(sheetName);
        sheets[key] = {
          name: sheetName,
          exists: !!sheet,
          rowCount: sheet ? sheet.getLastRow() : 0
        };
      }
      
      results.sheets = {
        success: true,
        sheets: sheets
      };
    } catch (error) {
      results.sheets = {
        success: false,
        error: error.message
      };
    }
    
    // 4. Проверка доступа пользователя
    try {
      const authController = new AuthController();
      const accessCheck = authController.checkAccess();
      results.access = accessCheck;
    } catch (error) {
      results.access = {
        success: false,
        error: error.message
      };
    }
    
    console.log(JSON.stringify(results, null, 2));
    return results;
  }
  
  // Инициализация базы данных с тестовыми данными
  function initializeDatabase() {
    try {
      const email = Session.getActiveUser().getEmail();
      if (!email) {
        return { success: false, message: 'Не удалось получить email пользователя' };
      }
      
      const userModel = new User();
      let user = userModel.findByEmail(email);
      
      if (!user) {
        // Добавляем текущего пользователя как админа
        const userId = 'USER_ADMIN_001';
        const rowData = [
          userId,
          email,
          'Администратор системы',
          'IT',
          'ADMIN',
          'Канцелярия,IT,Хозтовары', // Все категории
          true
        ];
        
        userModel.appendRow(rowData);
        console.log(`Добавлен администратор: ${email}`);
        
        // Добавляем тестовых пользователей
        const testUsers = [
          ['USER_002', 'test.user@company.com', 'Тестовый пользователь', 'Продажи', 'USER', 'Канцелярия', true],
          ['USER_003', 'manager@company.com', 'Менеджер отдела', 'Закупки', 'MANAGER', 'Канцелярия,Хозтовары', true],
          ['USER_004', 'procurement@company.com', 'Специалист закупок', 'Закупки', 'PROCUREMENT', 'Канцелярия,IT,Хозтовары', true]
        ];
        
        testUsers.forEach(userData => {
          userModel.appendRow(userData);
          console.log(`Добавлен пользователь: ${userData[2]}`);
        });
      }
      
      // Добавляем тестовые заказы
      const orderModel = new Order();
      const testOrders = [
        {
          userId: 'USER_ADMIN_001',
          userEmail: email,
          userName: 'Администратор системы',
          department: 'IT',
          totalAmount: 15000,
          comment: 'Закупка канцтоваров для офиса'
        },
        {
          userId: 'USER_002',
          userEmail: 'test.user@company.com',
          userName: 'Тестовый пользователь',
          department: 'Продажи',
          totalAmount: 5000,
          comment: 'Бумага для принтера'
        }
      ];
      
      testOrders.forEach(orderData => {
        orderModel.createOrder(orderData);
        console.log(`Создан тестовый заказ для: ${orderData.userName}`);
      });
      
      return {
        success: true,
        message: 'База данных успешно инициализирована',
        adminEmail: email
      };
      
    } catch (error) {
      return {
        success: false,
        message: 'Ошибка инициализации: ' + error.message,
        error: error.toString()
      };
    }
  }
  
  // Проверка конкретного пользователя
  function checkUserAccess(email) {
    try {
      const userModel = new User();
      const user = userModel.findByEmail(email || Session.getActiveUser().getEmail());
      
      if (!user) {
        return {
          exists: false,
          message: `Пользователь ${email} не найден в базе данных`
        };
      }
      
      return {
        exists: true,
        user: user,
        message: `Пользователь найден: ${user.name} (${user.role})`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Быстрая проверка системы
  function quickSystemCheck() {
    const email = Session.getActiveUser().getEmail();
    const authController = new AuthController();
    const accessCheck = authController.checkAccess();
    
    console.log('=== БЫСТРАЯ ПРОВЕРКА ===');
    console.log('Email:', email || 'Не определен');
    console.log('Доступ:', accessCheck.hasAccess ? 'Разрешен' : 'Запрещен');
    console.log('Сообщение:', accessCheck.message || 'Нет сообщения');
    
    if (accessCheck.userInfo) {
      console.log('Пользователь:', accessCheck.userInfo.name);
      console.log('Роль:', accessCheck.userInfo.role);
    }
    
    return accessCheck;
  }
  
  // Очистка всех данных (ОСТОРОЖНО!)
  function clearAllData() {
    const confirmation = 'DELETE_ALL'; // Измените на DELETE_ALL для подтверждения
    
    if (confirmation !== 'DELETE_ALL') {
      return 'Для очистки измените confirmation на DELETE_ALL в коде';
    }
    
    try {
      const spreadsheet = SpreadsheetApp.openById(Config.SPREADSHEET_IDS.DATABASE);
      
      // Очищаем листы, сохраняя заголовки
      ['Пользователи', 'Заказы'].forEach(sheetName => {
        const sheet = spreadsheet.getSheetByName(sheetName);
        if (sheet && sheet.getLastRow() > 1) {
          sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clear();
        }
      });
      
      return 'Все данные очищены';
    } catch (error) {
      return 'Ошибка очистки: ' + error.message;
    }
  }