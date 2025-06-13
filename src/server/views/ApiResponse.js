class ApiResponse {
  static success(data = null, message = null) {
    const response = {
      success: true,
      data: data,
      message: message,
      timestamp: new Date().toISOString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  static error(message, statusCode = 400) {
    const response = {
      success: false,
      data: null,
      error: {
        message: message,
        code: statusCode
      },
      timestamp: new Date().toISOString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
