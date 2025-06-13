class LoggingService {
  static logInfo(source, message, details = {}) {
    console.log(`[INFO] ${source}: ${message}`, details);
  }
  
  static logError(source, error, details = {}) {
    console.error(`[ERROR] ${source}: ${error.message}`, details);
  }
}
