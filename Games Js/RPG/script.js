const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');

let ship = { x: canvas.width / 2, y: canvas.height - 50, size: 20 };
let enemyShips = [];
let asteroids = [];
let bullets = [];
let ammoCount = 1000;
let score = 0;

// --- НОВЫЕ ПЕРЕМЕННЫЕ ДЛЯ УРОВНЕЙ ---
let level = 1;
let xp = 0;
let xpForNextLevel = 10; // Сколько опыта нужно для перехода на уровень 2

let gameRunning = false;

// Управление для телефона
let touchStartX, touchStartY;
let isTouching = false;

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
    canvas.width = innerWidth * 0.8;
    canvas.height = innerHeight * 0.8;
    ship.x = canvas.width / 2;
}

function startGame() {
    gameRunning = true;
    gameOverScreen.style.display = 'none';
    
    // Сброс всех параметров при старте новой игры
    score = 0;
    ammoCount = 1000;
    level = 1;
    xp = 0;
    xpForNextLevel = 10;
    
    enemyShips = [];
    asteroids = [];
    bullets = [];
    requestAnimationFrame(updateGame);
}

function gameOver() {
    gameRunning = false;
    gameOverScreen.style.display = 'flex';
    finalScoreDisplay.textContent = `Уровень: ${level} | Очки: ${score}`;
}

function spawnEnemyShip() {
    const enemySize = Math.random() * 30 + 20;
    
    // --- УВЕЛИЧЕНИЕ СЛОЖНОСТИ ---
    // Базовая скорость + бонус за уровень (чем выше уровень, тем быстрее враги)
    const baseSpeed = Math.random() * 2 + 1;
    const levelBonusSpeed = level * 0.2; 
    
    enemyShips.push({
        x: Math.random() * (canvas.width - enemySize),
        y: -enemySize,
        size: enemySize,
        speed: baseSpeed + levelBonusSpeed
    });
}

function spawnAsteroid() {
    const asteroidSize = Math.random() * 30 + 20;
    asteroids.push({
        x: Math.random() * (canvas.width - asteroidSize),
        y: -asteroidSize,
        size: asteroidSize,
        speed: Math.random() * 2 + 1
    });
}

function shootBullet() {
    if (ammoCount > 0) {
        bullets.push({
            x: ship.x,
            y: ship.y - 10,
            speed: 5
        });
        ammoCount--;
    }
}

// Автоматическая стрельба каждые 50 мс (каждые полсекунды)
setInterval(() => {
    if (gameRunning) {
        shootBullet();
    }
}, 50); 


// --- НОВАЯ ФУНКЦИЯ: Проверка повышения уровня ---
function checkLevelUp() {
    if (xp >= xpForNextLevel) {
        level++;
        xp = xp - xpForNextLevel; // Остаток опыта переходит на новый уровень (можно убрать, если хочешь полный сброс)
        xpForNextLevel = Math.floor(xpForNextLevel * 1.5); // Увеличение порога для следующего уровня

        // Можно добавить здесь бонусы за уровень, например:
        // ship.size += 1;
        console.log(`🎉 Уровень повышен! Теперь вы на уровне ${level}`);
    }
}


function updateGame() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- РИСОВАНИЕ КОРАБЛЯ ИГРОКА (ЗЕЛЁНЫЙ ТРЕУГОЛЬНИК) ---
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y);
    ctx.lineTo(ship.x - ship.size, ship.y + ship.size);
    ctx.lineTo(ship.x + ship.size, ship.y + ship.size);
    ctx.closePath();
    ctx.fill();


    // --- ВЫСТРЕЛЫ (ЖЁЛТЫЕ ПРЯМОУГОЛЬНИКИ) ---
    ctx.fillStyle = 'yellow';
    bullets.forEach(bullet => {
        bullet.y -= bullet.speed;
        ctx.fillRect(bullet.x, bullet.y, 4, 10);
    });
    bullets = bullets.filter(bullet => bullet.y > -15);


    // --- АСТЕРОИДЫ (КРАСНЫЕ КРУГИ) ---
    ctx.fillStyle = 'red';
    asteroids.forEach(asteroid => {
        asteroid.y += asteroid.speed;
        
        ctx.beginPath();
        ctx.arc(asteroid.x + asteroid.size / 2, asteroid.y + asteroid.size / 2, asteroid.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        bullets.forEach(bullet => {
            if (bullet.x > asteroid.x &&
                bullet.x < asteroid.x + asteroid.size &&
                bullet.y > asteroid.y &&
                bullet.y < asteroid.y + asteroid.size) {
                asteroids = asteroids.filter(a => a !== asteroid);
                bullets = bullets.filter(b => b !== bullet);
            }
        });

        if (ship.x > asteroid.x &&
            ship.x < asteroid.x + asteroid.size &&
            ship.y > asteroid.y &&
            ship.y < asteroid.y + asteroid.size) {
            gameOver();
        }
    });

    asteroids = asteroids.filter(asteroid => asteroid.y < canvas.height + asteroid.size);


    // --- ВРАГИ (СИНИЕ КВАДРАТЫ) ---
    ctx.fillStyle = 'blue';
    enemyShips.forEach(enemy => {
        enemy.y += enemy.speed;
        
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);
        
        bullets.forEach(bullet => {
            if (bullet.x > enemy.x &&
                bullet.x < enemy.x + enemy.size &&
                bullet.y > enemy.y &&
                bullet.y < enemy.y + enemy.size) {
                
                // --- НАЧИСЛЕНИЕ ОПЫТА И ОЧКОВ ---
                score++;
                xp++; // Даем опыт за убийство
                
                ammoCount += 200; 
                
                // Проверяем, не повысился ли уровень после этого убийства
                checkLevelUp();
                
                enemyShips = enemyShips.filter(e => e !== enemy);
                bullets = bullets.filter(b => b !== bullet);
            }
        });

        if (ship.x > enemy.x &&
            ship.x < enemy.x + enemy.size &&
            ship.y > enemy.y &&
            ship.y < enemy.y + enemy.size) {
            gameOver();
        }
    });

    enemyShips = enemyShips.filter(enemy => enemy.y < canvas.height + enemy.size);


    // --- СПАВН НОВЫХ ОБЪЕКТОВ ---
    
    // Частота спавна зависит от уровня (враги появляются чаще)
    if (Math.random() < (0.02 * level)) spawnAsteroid();
    if (Math.random() < (0.01 * level)) spawnEnemyShip();


    // --- УПРАВЛЕНИЕ ---
    
    if (keys.ArrowLeft) ship.x -= 5;
    if (keys.ArrowRight) ship.x += 5;
    if (keys.ArrowUp) ship.y -= 5;
    if (keys.ArrowDown) ship.y += 5;

if (isTouching) {
    const moveX = touchStartX - ship.x;
    const moveY = touchStartY - ship.y;
    ship.x -= moveX * 0.1; 
    ship.y -= moveY * 0.1;
    isTouching = false; 
}
    

    ship.x = Math.max(ship.size, Math.min(canvas.width - ship.size, ship.x));
    ship.y = Math.max(ship.size, Math.min(canvas.height - ship.size, ship.y));
    

    // --- ИНТЕРФЕЙС ---
    
    ctx.fillStyle = 'white';
    
    // Отображение счёта и патронов (справа)
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Очки: ${score}`, canvas.width - 180, 40); 
    
    ctx.font = 'bold 18px Arial';
    ctx.fillText(`Патроны: ${ammoCount}`, canvas.width - 180, 70); 


    // --- НОВОЕ: Отображение уровня и полоски опыта (слева) ---
    
    // Текущий уровень
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Уровень: ${level}`, 10, 35);
    
    // Текст полоски опыта
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Опыт: ${xp} / ${xpForNextLevel}`, 10, canvas.height - 25);
    
    
    // Сама полоска опыта (фон)
    const barWidth = canvas.width * 0.3; // Ширина полоски
    const barX = canvas.width - barWidth - 15; // Позиция справа
    
    ctx.fillStyle = 'gray';
    ctx.fillRect(barX, canvas.height - 55, barWidth, 25);
    
    // Заполненная часть полоски
    const fillAmount = (xp / xpForNextLevel) * barWidth;
    
    ctx.fillStyle = 'lime'; // Ярко-зеленый цвет для заполнения
    ctx.fillRect(barX, canvas.height - 55, fillAmount, 25);
    
    

    requestAnimationFrame(updateGame);
}


// --- СЛУШАТЕЛИ СОБЫТИЙ ---
const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => delete keys[e.code]);

canvas.addEventListener('touchstart', e => {
    e.preventDefault(); 
    
    const touch = e.touches[0];
     touchStartX = touch.clientX - canvas.offsetLeft;
     touchStartY = touch.clientY - canvas.offsetTop;
     isTouching = true; 
});


document.getElementById('start-button')?.addEventListener('click', startGame);
document.addEventListener('click', () => { if (!gameRunning) startGame(); });