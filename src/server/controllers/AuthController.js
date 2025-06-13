class AuthController {
  constructor() {
    this.userModel = new User();
  }
  
  checkAccess() {
    try {
      const userEmail = Session.getActiveUser().getEmail();
      
      if (!userEmail) {
        return {
          hasAccess: false,
          message: "Не удалось определить пользователя"
        };
      }
      
      const user = this.userModel.findByEmail(userEmail);
      
      if (!user) {
        return {
          hasAccess: false,
          message: "Доступ ограничен. Обратитесь к администратору."
        };
      }
      
      if (!user.isActive) {
        return {
          hasAccess: false,
          message: "Ваш аккаунт деактивирован."
        };
      }
      
      LoggingService.logInfo('AuthController.checkAccess', 'Успешная авторизация', {
        userId: user.id,
        email: userEmail
      });
      
      return {
        hasAccess: true,
        userInfo: user
      };
      
    } catch (error) {
      LoggingService.logError('AuthController.checkAccess', error);
      return {
        hasAccess: false,
        message: "Системная ошибка"
      };
    }
  }
}
