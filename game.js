// Open World Platformer Game Engine
// Name: game.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game States
const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

// Game Variables
let gameState = GAME_STATE.MENU;
let camera = { x: 0, y: 0 };
let particles = [];
let enemies = [];
let platforms = [];
let collectibles = [];
let score = 0;
let lives = 3;

// Player Object
const player = {
    x: 100,
    y: 400,
    width: 30,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    speed: 5,
    jumpPower: 12,
    isJumping: false,
    canDoubleJump: true,
    direction: 1, // 1 for right, -1 for left
    animationFrame: 0,
    animationTimer: 0,
    isMoving: false
};

// Input Handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        if (gameState === GAME_STATE.PLAYING) {
            handleJump();
        }
    }
    
    if (e.key === 'Escape') {
        togglePause();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Jump Handler with Double Jump
function handleJump() {
    if (!player.isJumping) {
        player.velocityY = -player.jumpPower;
        player.isJumping = true;
        createParticles(player.x + player.width / 2, player.y + player.height, 'jump');
    } else if (player.canDoubleJump) {
        player.velocityY = -player.jumpPower * 0.8;
        player.canDoubleJump = false;
        createParticles(player.x + player.width / 2, player.y + player.height / 2, 'doubleJump');
    }
}

// Create Particle Effects
function createParticles(x, y, type) {
    const particleCount = type === 'doubleJump' ? 12 : 6;
    const colors = type === 'doubleJump' 
        ? ['#FFD700', '#FFA500', '#FF6347'] 
        : ['#87CEEB', '#4169E1'];
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = type === 'doubleJump' ? 4 : 2;
        
        particles.push({
            x: x,
            y: y,
            velocityX: Math.cos(angle) * velocity,
            velocityY: Math.sin(angle) * velocity,
            life: 30,
            maxLife: 30,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 4 + 2
        });
    }
}

// Initialize Game World
function initializeGame() {
    platforms = [
        // Ground
        { x: 0, y: 580, width: 2000, height: 20, color: '#2C3E50', type: 'solid' },
        
        // Starting platforms
        { x: 150, y: 500, width: 200, height: 20, color: '#27AE60', type: 'solid' },
        { x: 450, y: 450, width: 150, height: 20, color: '#27AE60', type: 'solid' },
        { x: 750, y: 400, width: 180, height: 20, color: '#27AE60', type: 'solid' },
        { x: 1100, y: 350, width: 160, height: 20, color: '#27AE60', type: 'solid' },
        
        // Mid section
        { x: 1400, y: 480, width: 200, height: 20, color: '#E74C3C', type: 'solid' },
        { x: 1700, y: 420, width: 150, height: 20, color: '#E74C3C', type: 'solid' },
        
        // Secret area
        { x: 800, y: 300, width: 100, height: 20, color: '#F39C12', type: 'solid' },
    ];
    
    collectibles = [
        { x: 300, y: 450, width: 15, height: 15, color: '#FFD700', collected: false, points: 10 },
        { x: 600, y: 400, width: 15, height: 15, color: '#FFD700', collected: false, points: 10 },
        { x: 950, y: 350, width: 15, height: 15, color: '#FFD700', collected: false, points: 10 },
        { x: 1250, y: 300, width: 15, height: 15, color: '#FFD700', collected: false, points: 10 },
        { x: 830, y: 270, width: 20, height: 20, color: '#FF69B4', collected: false, points: 50 }, // Bonus
    ];
    
    enemies = [
        { x: 600, y: 550, width: 25, height: 25, color: '#E74C3C', speed: 2, minX: 500, maxX: 700, direction: 1 },
        { x: 1200, y: 550, width: 25, height: 25, color: '#E74C3C', speed: 2.5, minX: 1100, maxX: 1300, direction: 1 },
        { x: 1800, y: 550, width: 25, height: 25, color: '#9B59B6', speed: 3, minX: 1700, maxX: 1900, direction: 1 },
    ];
    
    gameState = GAME_STATE.PLAYING;
}

// Update Game Logic
function update() {
    if (gameState !== GAME_STATE.PLAYING) return;
    
    // Player Movement
    player.isMoving = false;
    if (keys['ArrowLeft'] || keys['a']) {
        player.velocityX = -player.speed;
        player.direction = -1;
        player.isMoving = true;
    } else if (keys['ArrowRight'] || keys['d']) {
        player.velocityX = player.speed;
        player.direction = 1;
        player.isMoving = true;
    } else {
        player.velocityX *= 0.8; // Friction
    }
    
    // Gravity
    player.velocityY += 0.5;
    player.velocityY = Math.min(player.velocityY, 15); // Terminal velocity
    
    // Update Position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Collision Detection with Platforms
    let isOnPlatform = false;
    platforms.forEach(platform => {
        if (player.velocityY >= 0 &&
            player.y + player.height <= platform.y + 5 &&
            player.y + player.height + player.velocityY >= platform.y &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width) {
            
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
            player.canDoubleJump = true;
            isOnPlatform = true;
        }
    });
    
    // Reset jump if not on platform
    if (!isOnPlatform && player.y > canvas.height) {
        lives--;
        if (lives <= 0) {
            gameState = GAME_STATE.GAME_OVER;
        } else {
            resetPlayerPosition();
        }
    }
    
    // Collect Items
    collectibles.forEach(item => {
        if (!item.collected &&
            player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y) {
            
            item.collected = true;
            score += item.points;
            createParticles(item.x, item.y, 'collect');
        }
    });
    
    // Update Enemies
    enemies.forEach(enemy => {
        enemy.x += enemy.speed * enemy.direction;
        
        if (enemy.x < enemy.minX || enemy.x > enemy.maxX) {
            enemy.direction *= -1;
        }
        
        // Collision with player
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            
            if (player.velocityY > 0 && player.y + player.height < enemy.y + enemy.height / 2) {
                enemy.x = -100; // Remove enemy
                score += 100;
                createParticles(enemy.x, enemy.y, 'doubleJump');
            } else {
                lives--;
                if (lives <= 0) {
                    gameState = GAME_STATE.GAME_OVER;
                } else {
                    resetPlayerPosition();
                }
            }
        }
    });
    
    // Update Particles
    particles = particles.filter(p => {
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.life--;
        return p.life > 0;
    });
    
    // Camera Follow
    camera.x = player.x - canvas.width / 4;
    camera.x = Math.max(0, Math.min(camera.x, 2000 - canvas.width));
    
    // Animation
    if (player.isMoving) {
        player.animationTimer++;
        if (player.animationTimer > 5) {
            player.animationFrame = (player.animationFrame + 1) % 4;
            player.animationTimer = 0;
        }
    } else {
        player.animationFrame = 0;
    }
}

// Draw Game
function draw() {
    // Clear Canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Background Clouds
    drawClouds();
    
    // Save context and translate for camera
    ctx.save();
    ctx.translate(-camera.x, 0);
    
    // Draw Platforms
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    });
    
    // Draw Collectibles
    collectibles.forEach(item => {
        if (!item.collected) {
            ctx.save();
            ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
            ctx.rotate(Date.now() * 0.003);
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.arc(0, 0, item.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    });
    
    // Draw Enemies
    enemies.forEach(enemy => {
        if (enemy.x > -100) {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            // Enemy eyes
            ctx.fillStyle = '#fff';
            ctx.fillRect(enemy.x + 5, enemy.y + 5, 6, 6);
            ctx.fillRect(enemy.x + 14, enemy.y + 5, 6, 6);
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 6, enemy.y + 6, 3, 3);
            ctx.fillRect(enemy.x + 15, enemy.y + 6, 3, 3);
        }
    });
    
    // Draw Player
    drawPlayer();
    
    // Draw Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
    
    ctx.restore();
    
    // Draw UI
    drawUI();
}

// Draw Player with Animation
function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    
    // Face direction
    if (player.direction === -1) {
        ctx.scale(-1, 1);
    }
    
    // Body
    ctx.fillStyle = '#3498DB';
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    
    // Head
    ctx.fillStyle = '#E8B4A8';
    ctx.beginPath();
    ctx.arc(-2, -25, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes with animation
    const eyeShift = player.isJumping ? -2 : 0;
    ctx.fillStyle = '#000';
    ctx.fillRect(-6, -27 + eyeShift, 3, 3);
    ctx.fillRect(2, -27 + eyeShift, 3, 3);
    
    // Legs animation
    const legAngle = player.animationFrame * 0.3;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(-8, 8 + Math.sin(legAngle) * 3);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(4, 8 - Math.sin(legAngle) * 3);
    ctx.stroke();
    
    ctx.restore();
}

// Draw Background Clouds
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const cloudX = (Date.now() * 0.01) % canvas.width;
    
    // Cloud 1
    drawCloud(cloudX, 50);
    drawCloud(cloudX + canvas.width, 50);
    
    // Cloud 2
    drawCloud(cloudX + 300, 150);
    drawCloud(cloudX + 300 + canvas.width, 150);
}

function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 30, y, 35, 0, Math.PI * 2);
    ctx.arc(x + 60, y, 30, 0, Math.PI * 2);
    ctx.fill();
}

// Draw UI
function drawUI() {
    ctx.fillStyle = '#000';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Lives: ${lives}`, canvas.width - 150, 30);
    
    if (gameState === GAME_STATE.PAUSED) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Press ESC to Resume', canvas.width / 2, canvas.height / 2 + 40);
    }
    
    if (gameState === GAME_STATE.GAME_OVER) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = 'bold 30px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
    }
    
    ctx.textAlign = 'left';
}

// Reset Player Position
function resetPlayerPosition() {
    player.x = 100;
    player.y = 400;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isJumping = false;
    player.canDoubleJump = true;
}

// Toggle Pause
function togglePause() {
    if (gameState === GAME_STATE.PLAYING) {
        gameState = GAME_STATE.PAUSED;
    } else if (gameState === GAME_STATE.PAUSED) {
        gameState = GAME_STATE.PLAYING;
    }
}

// Main Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start Game Function (called from HTML)
function startGame() {
    const container = document.querySelector('.container');
    container.style.display = 'none';
    canvas.classList.add('active');
    canvas.style.display = 'block';
    initializeGame();
    gameLoop();
}

// Toggle Info Function
function toggleInfo() {
    alert('Controls:\n\n' +
        '→ / D - Move Right\n' +
        '← / A - Move Left\n' +
        'SPACE - Jump\n' +
        'SPACE x2 - Double Jump\n' +
        'ESC - Pause\n\n' +
        'Collect gold coins (+10 pts)\n' +
        'Pink diamonds are bonus! (+50 pts)\n' +
        'Jump on enemies to defeat them\n\n' +
        'Good luck, adventurer!');
}
