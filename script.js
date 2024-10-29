const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');

// Variáveis globais
let player;
let bullets = [];
let bossBullets = [];
let enemies = [];
let boss;
let score = 0;
let game;
let enemyInterval;
let bossFight = false;
let enemyCount = 0;

// Função para iniciar o jogo
function startGame() {
    player = new Player();
    bullets = [];
    bossBullets = [];
    enemies = [];
    score = 0;
    bossFight = false;
    enemyCount = 0;

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Inicia o loop do jogo
    game = setInterval(update, 100);
    enemyInterval = setInterval(spawnEnemy, 2000); // Inicia o spawn de inimigos
}

// Função para atualizar o jogo
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateEnemies();
    player.draw();
    updateBullets();
    updateBossBullets();

    // Verifica se é hora de enfrentar o chefe
    if (enemyCount >= 10 && !bossFight) {
        bossFight = true;
        boss = new Boss();
        clearInterval(enemyInterval);
    }

    if (bossFight) {
        boss.draw();
        bossShoot();
    }

    ctx.fillStyle = 'white';
    ctx.fillText('Pontuação: ' + score, 10, 20);
}

// Função para atualizar as balas do jogador
function updateBullets() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].y -= 15;

        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            i--;
            continue;
        }

        bullets[i].draw();

        for (let j = 0; j < enemies.length; j++) {
            if (bullets[i].collidesWith(enemies[j])) {
                score += 10;
                enemyCount++;
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                i--;
                break;
            }
        }

        if (bossFight && bullets[i].collidesWith(boss)) {
            boss.health -= 1;
            bullets.splice(i, 1);
            i--;

            if (boss.health <= 0) {
                alert('Você derrotou o chefe! Sua pontuação: ' + score);
                clearInterval(game);
                return;
            }
        }
    }
}

// Função para atualizar as balas do chefe
function updateBossBullets() {
    for (let i = 0; i < bossBullets.length; i++) {
        bossBullets[i].x += bossBullets[i].dx;
        bossBullets[i].y += bossBullets[i].dy;

        // Remove a bala se ela sair da tela
        if (bossBullets[i].x < 0 || bossBullets[i].x > canvas.width || bossBullets[i].y > canvas.height) {
            bossBullets.splice(i, 1);
            i--;
            continue;
        }

        bossBullets[i].draw();

        // Verifica colisão com o jogador
        if (bossBullets[i].collidesWith(player)) {
            clearInterval(game);
            alert('Game Over! Você foi atingido pelo chefe.');
            return;
        }
    }
}

// Função para atualizar os inimigos
function updateEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += 2;

        if (enemies[i].y > canvas.height) {
            clearInterval(game);
            alert('Game Over! Sua pontuação: ' + score);
            return;
        }

        if (player.collidesWith(enemies[i])) {
            clearInterval(game);
            alert('Game Over! Sua pontuação: ' + score);
            return;
        }

        enemies[i].draw();
    }
}

// Função para gerar inimigos
function spawnEnemy() {
    let enemy = new Enemy();
    enemies.push(enemy);
}

// Função para o chefe atirar
function bossShoot() {
    if (Math.random() < 0.05) { // Chance de 5% de atirar por frame
        const bullet = new BossBullet(boss.x + boss.width / 2, boss.y + boss.height, player.x, player.y);
        bossBullets.push(bullet);
    }
}

// Classe da nave do jogador
class Player {
    constructor() {
        this.x = canvas.width / 2 - 25;
        this.y = canvas.height - 60;
        this.width = 50;
        this.height = 50;
        this.image = new Image();
        this.image.src = 'mario.png';
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) this.x -= 10;
        if (direction === 'right' && this.x < canvas.width - this.width) this.x += 10;
    }

    shoot() {
        const bullet = new Bullet(this.x + this.width / 2 - 25, this.y);
        bullets.push(bullet);
    }

    collidesWith(enemy) {
        return (
            this.x < enemy.x + enemy.width &&
            this.x + this.width > enemy.x &&
            this.y < enemy.y + enemy.height &&
            this.y + this.height > enemy.y
        );
    }
}

// Classe da bala do chefe
class BossBullet {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.speed = 6;

        // Calcula a direção
        const angle = Math.atan2(targetY - y, targetX - x);
        this.dx = Math.cos(angle) * this.speed;
        this.dy = Math.sin(angle) * this.speed;

        this.image = new Image();
        this.image.src = 'imposto.jpg';
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    collidesWith(player) {
        return (
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y
        );
    }
}

// Classe da bala do jogador
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.image = new Image();
        this.image.src = 'coco.jpg';

        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.imageLoaded = false;
    }

    draw() {
        if (this.imageLoaded) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    collidesWith(enemy) {
        return (
            this.x < enemy.x + enemy.width &&
            this.x + this.width > enemy.x &&
            this.y < enemy.y + enemy.height &&
            this.y + this.height > enemy.y
        );
    }
}

// Classe do inimigo
class Enemy {
    constructor() {
        this.x = Math.random() * (canvas.width - 50);
        this.y = -50;
        this.width = 50;
        this.height = 50;
        this.image = new Image();
        this.image.src = 'lula.jpg';

        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.imageLoaded = false;
    }

    draw() {
        if (this.imageLoaded) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
}

// Classe do chefe
class Boss {
    constructor() {
        this.x = canvas.width / 2 - 75;
        this.y = 50;
        this.width = 150;
        this.height = 150;
        this.health = 50;
        this.image = new Image();
        this.image.src = 'lula.jpg';

        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.imageLoaded = false;
    }

    draw() {
        if (this.imageLoaded) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y - 10, this.width, 5);
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x, this.y - 10, (this.health / 50) * this.width, 5);
        }
    }
}

// Eventos de controle do jogador
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        player.move('left');
    }
    if (event.key === 'ArrowRight') {
        player.move('right');
    }
    if (event.key === ' ') {
        player.shoot();
    }
});

// Evento do botão de iniciar
startButton.addEventListener('click', startGame);
