class AuthController {
  constructor() {
    this.userModel = new User();
  }
  
  checkAccess() {
    try {
      // Получаем email текущего пользователя
      const userEmail = Session.getActiveUser().getEmail();
      
      LoggingService.logDebug('AuthController.checkAccess', 'Проверка доступа', { 
        userEmail: userEmail || 'не определен' 
      });
      
      if (!userEmail) {
        LoggingService.logError('AuthController.checkAccess', new Error('Email пользователя не определен'));
        return {
          hasAccess: false,
          message: "Не удалось определить пользователя. Убедитесь, что вы вошли в Google аккаунт."
        };
      }
      
      // Ищем пользователя в базе данных
      const user = this.userModel.findByEmail(userEmail);
      
      if (!user) {
        LoggingService.logInfo('AuthController.checkAccess', 'Пользователь не найден в БД', { 
          email: userEmail 
        });
        return {
          hasAccess: false,
          message: `Пользователь ${userEmail} не зарегистрирован в системе. Обратитесь к администратору для получения доступа.`
        };
      }
      
      // Проверяем активность пользователя
      if (!user.isActive) {
        LoggingService.logInfo('AuthController.checkAccess', 'Пользователь деактивирован', { 
          userId: user.id,
          email: userEmail 
        });
        return {
          hasAccess: false,
          message: "Ваш аккаунт деактивирован. Обратитесь к администратору."
        };
      }
      
      LoggingService.logInfo('AuthController.checkAccess', 'Успешная авторизация', {
        userId: user.id,
        email: userEmail,
        role: user.role,
        department: user.department
      });
      
      return {
        hasAccess: true,
        userInfo: {
          id: user.id,
          email: user.email,
          name: user.name,
          department: user.department,
          role: user.role,
          allowedCategories: user.allowedCategories,
          isActive: user.isActive
        }
      };
      
    } catch (error) {
      LoggingService.logError('AuthController.checkAccess', error);
      
      // Более детальная информация об ошибке
      let errorMessage = "Системная ошибка при проверке доступа";
      
      if (error.message.includes('найден')) {
        errorMessage = "Не удается найти базу данных пользователей";
      } else if (error.message.includes('permission')) {
        errorMessage = "Нет прав доступа к базе данных";
      }
      
      return {
        hasAccess: false,
        message: errorMessage,
        technicalDetails: error.message // Для отладки
      };
    }
  }
  
  // Дополнительный метод для детальной диагностики
  diagnoseAccess() {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      userEmail: null,
      spreadsheetAccess: false,
      userFound: false,
      userActive: false,
      errors: []
    };
    
    try {
      // 1. Получаем email
      diagnostics.userEmail = Session.getActiveUser().getEmail();
      
      if (!diagnostics.userEmail) {
        diagnostics.errors.push('Email пользователя не определен');
        return diagnostics;
      }
      
      // 2. Проверяем доступ к таблице
      try {
        const spreadsheet = SpreadsheetApp.openById(Config.SPREADSHEET_IDS.DATABASE);
        diagnostics.spreadsheetAccess = true;
        diagnostics.spreadsheetName = spreadsheet.getName();
      } catch (e) {
        diagnostics.errors.push('Нет доступа к базе данных: ' + e.message);
        return diagnostics;
      }
      
      // 3. Ищем пользователя
      const user = this.userModel.findByEmail(diagnostics.userEmail);
      if (user) {
        diagnostics.userFound = true;
        diagnostics.userActive = user.isActive;
        diagnostics.userData = {
          id: user.id,
          name: user.name,
          role: user.role,
          department: user.department
        };
      } else {
        diagnostics.errors.push('Пользователь не найден в базе данных');
      }
      
    } catch (error) {
      diagnostics.errors.push('Общая ошибка: ' + error.message);
    }
    
    return diagnostics;
  }
}