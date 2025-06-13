/**
 * API клиент для работы с системой заказов
 */
class ProcurementAPI {
    constructor() {
        this.baseUrl = window.location.origin + window.location.pathname;
    }

    /**
     * Базовый метод для API запросов
     */
    async request(action, data = {}) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: action,
                    ...data
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error?.message || 'Ошибка API');
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            this.showError('Ошибка соединения с сервером: ' + error.message);
            throw error;
        }
    }

    /**
     * Проверка доступа пользователя
     */
    async checkAccess() {
        return await this.request('checkAccess');
    }

    /**
     * Получение информации о пользователе
     */
    async getUserInfo() {
        return await this.request('getUserInfo');
    }

    /**
     * Получение заказов текущего пользователя
     */
    async getUserOrders() {
        return await this.request('getUserOrders');
    }

    /**
     * Получение всех заказов (только для админов)
     */
    async getAllOrders() {
        return await this.request('getAllOrders');
    }

    /**
     * Получение деталей заказа
     */
    async getOrderDetails(orderId) {
        return await this.request('getOrderDetails', { orderId });
    }

    /**
     * Создание нового заказа
     */
    async createOrder(orderData) {
        return await this.request('createOrder', { orderData });
    }

    /**
     * Показ ошибки пользователю
     */
    showError(message) {
        const alertHtml = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        const container = document.getElementById('content-area');
        if (container) {
            container.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }

    /**
     * Показ успешного сообщения
     */
    showSuccess(message) {
        const alertHtml = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fas fa-check-circle me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        const container = document.getElementById('content-area');
        if (container) {
            container.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }
}

// Глобальный экземпляр API
const api = new ProcurementAPI();
