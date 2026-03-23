// --- ИНИЦИАЛИЗАЦИЯ ПЕРЕМЕННЫХ ---
let stones = 0; // Новая переменная: количество камней
let miners = 0; // Новый параметр: количество гномов
let pickaxeLevel = 0; // Новый уровень кирки

// Базовая скорость добычи одного гнома (камней в секунду)
const baseMinerSpeed = 1;

// Ссылки на HTML-элементы для быстрого доступа
const stonesCountElem = document.getElementById('stones-count'); // Новый элемент для отображения камней
const minerCountElem = document.getElementById('miner-count'); // Новый элемент для отображения гномов
const minerProductionElem = document.getElementById('miner-production'); // Новый элемент для отображения производительности
const pickaxeLevelElem = document.getElementById('pickaxe-level'); // Новый элемент для отображения уровня кирки
const pickaxeCostElem = document.getElementById('pickaxe-cost'); // Новый элемент для отображения стоимости кирки


// --- ФУНКЦИИ ОБНОВЛЕНИЯ ИНТЕРФЕЙСА ---
function updateUI() {
    stonesCountElem.textContent = Math.floor(stones); // Отображаем количество камней
    minerCountElem.textContent = miners;    // Отображаем количество гномов
    
    // Считаем общую производительность всех гномов с учетом улучшений
    const productionPerMiner = baseMinerSpeed * (1 + pickaxeLevel * 0.2); // 
    const totalProduction = productionPerMiner * miners; // 
    
    minerProductionElem.textContent = totalProduction.toFixed(2); // Отображаем производительность
}




// --- ЛОГИКА ПОКУПКИ И ДОБЫЧИ ---

// Функция для добычи вручную
document.getElementById('mine-button').onclick = () => {
    stones += 1 + pickaxeLevel * 0.5; // Улучшенная кирка дает бонус и к ручному труду
    updateUI();
};

// Функция найма гнома
document.getElementById('hire-miner').onclick = () => {
    const cost = 10;
    if(stones >= cost) {
        stones -= cost;
        miners += 1;
        updateUI();
    }
};

document.getElementById('buy-pickaxe').onclick = () => {
    const cost = 10;
    if(stones >= cost) {
        stones -= cost;
        baseMinerSpeed += 1; // Улучшаем добычу камней
        updateUI();      
    }

};




// --- ГЛАВНЫЙ ЦИКЛ ИГРЫ (IDLE) ---
// Эта функция будет вызываться каждую секунду автоматически

function gameLoop() {
    if(miners > 0) {
        // Считаем, сколько камней добыли гномы за эту секунду
        const productionPerMiner = baseMinerSpeed * (1 + pickaxeLevel * 0.2);
        const totalProduction = productionPerMiner * miners;
        
        stones += totalProduction;
    }
    
    updateUI();
}

// Запускаем цикл каждую секунду (1000 мс)
setInterval(gameLoop, 1000);

// Первоначальный запуск интерфейса при загрузке страницы
updateUI();
updateUpgradeButton();