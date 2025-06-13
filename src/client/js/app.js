/**
 * Основная логика веб-приложения
 */
let currentUser = null;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Инициализация системы заказов...');
    
    try {
        // Проверяем доступ и получаем информацию о пользователе
        const userInfo = await api.getUserInfo();
        currentUser = userInfo.data;
        
        // Обновляем интерфейс с данными пользователя
        updateUserInterface();
        
        // Показываем дашборд по умолчанию
        await showDashboard();
        
        // Скрываем загрузку и показываем приложение
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        
        console.log('✅ Система успешно загружена');
        
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        showLoginError();
    }
});

/**
 * Обновление интерфейса с данными пользователя
 */
function updateUserInterface() {
    if (!currentUser) return;
    
    // Обновляем имя пользователя
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        userNameElement.textContent = currentUser.name;
    }
    
    // Показываем админ меню если пользователь админ
    if (['ADMIN', 'PROCUREMENT'].includes(currentUser.role)) {
        const adminMenu = document.getElementById('admin-menu');
        if (adminMenu) {
            adminMenu.style.display = 'block';
        }
    }
}

/**
 * Показ дашборда
 */
async function showDashboard() {
    try {
        setActiveMenuItem('dashboard');
        
        const ordersResponse = await api.getUserOrders();
        const orders = ordersResponse.data || [];
        
        const html = `
            <div class="fade-in">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2><i class="fas fa-tachometer-alt me-2"></i>Дашборд</h2>
                    <span class="text-muted">Добро пожаловать, ${currentUser.name}!</span>
                </div>
                
                <!-- Статистика -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="stats-card">
                            <div class="stats-value">${orders.length}</div>
                            <div class="stats-label">Мои заказы</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
                            <div class="stats-value">${orders.filter(o => o.status === 'УТВЕРЖДЕН').length}</div>
                            <div class="stats-label">Утвержденные</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card" style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);">
                            <div class="stats-value">${orders.filter(o => o.status === 'СОЗДАН').length}</div>
                            <div class="stats-label">В ожидании</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stats-card" style="background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%);">
                            <div class="stats-value">${orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}₽</div>
                            <div class="stats-label">Общая сумма</div>
                        </div>
                    </div>
                </div>
                
                <!-- Последние заказы -->
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="fas fa-clock me-2"></i>Последние заказы</h5>
                        <button class="btn btn-primary btn-sm" onclick="showCreateOrder()">
                            <i class="fas fa-plus me-1"></i>Новый заказ
                        </button>
                    </div>
                    <div class="card-body">
                        ${orders.length > 0 ? renderOrdersList(orders.slice(0, 5)) : '<p class="text-muted text-center">У вас пока нет заказов</p>'}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('content-area').innerHTML = html;
        
    } catch (error) {
        console.error('Ошибка загрузки дашборда:', error);
        api.showError('Ошибка загрузки дашборда');
    }
}

/**
 * Рендеринг списка заказов
 */
function renderOrdersList(orders) {
    return orders.map(order => `
        <div class="order-card card mb-2 status-${order.status.toLowerCase()}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="card-title mb-1">${order.id}</h6>
                        <p class="card-text text-muted mb-2">${order.comment || 'Без комментария'}</p>
                        <small class="text-muted">
                            <i class="fas fa-calendar me-1"></i>
                            ${formatDate(order.createDate)}
                        </small>
                    </div>
                    <div class="text-end">
                        <span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span>
                        <div class="mt-1">
                            <strong>${order.totalAmount?.toLocaleString() || 0}₽</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Получение CSS класса для бейджа статуса
 */
function getStatusBadgeClass(status) {
    const classes = {
        'СОЗДАН': 'bg-info',
        'УТВЕРЖДЕН': 'bg-success',
        'ОТМЕНЕН': 'bg-danger',
        'В_ОБРАБОТКЕ': 'bg-warning'
    };
    return classes[status] || 'bg-secondary';
}

/**
 * Форматирование даты
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Установка активного пункта меню
 */
function setActiveMenuItem(page) {
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const menuItems = {
        'dashboard': 0,
        'create-order': 1,
        'my-orders': 2,
        'all-orders': 3,
        'management': 4
    };
    
    const index = menuItems[page];
    if (index !== undefined) {
        const items = document.querySelectorAll('.list-group-item');
        if (items[index]) {
            items[index].classList.add('active');
        }
    }
}

/**
 * Заглушки для других функций (будем реализовывать постепенно)
 */
async function showCreateOrder() {
    setActiveMenuItem('create-order');
    document.getElementById('content-area').innerHTML = `
        <div class="text-center">
            <h3>🚧 Создание заказа</h3>
            <p>Функция в разработке...</p>
            <button class="btn btn-primary" onclick="showDashboard()">Назад к дашборду</button>
        </div>
    `;
}

async function showMyOrders() {
    setActiveMenuItem('my-orders');
    document.getElementById('content-area').innerHTML = `
        <div class="text-center">
            <h3>�� Мои заказы</h3>
            <p>Функция в разработке...</p>
            <button class="btn btn-primary" onclick="showDashboard()">Назад к дашборду</button>
        </div>
    `;
}

async function showAllOrders() {
    setActiveMenuItem('all-orders');
    document.getElementById('content-area').innerHTML = `
        <div class="text-center">
            <h3>📊 Все заказы</h3>
            <p>Функция в разработке...</p>
            <button class="btn btn-primary" onclick="showDashboard()">Назад к дашборду</button>
        </div>
    `;
}

function showProfile() {
    alert('Профиль пользователя - в разработке');
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        window.location.reload();
    }
}

function showLoginError() {
    document.getElementById('loading-screen').innerHTML = `
        <div class="text-center text-white">
            <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
            <h4>Ошибка доступа</h4>
            <p>Не удалось загрузить систему</p>
            <button class="btn btn-light" onclick="window.location.reload()">Попробовать снова</button>
        </div>
    `;
}
