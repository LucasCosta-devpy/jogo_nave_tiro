const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');

// Variáveis globais
let player;
let bullets = [];
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
    updateEnemies(); // Atualiza os inimigos primeiro
    player.draw();
    updateBullets(); // Atualiza as balas

    // Verifica se é hora de enfrentar o chefe
    if (enemyCount >= 10 && !bossFight) {
        bossFight = true;
        boss = new Boss();
        clearInterval(enemyInterval);
    }

    if (bossFight) {
        boss.draw();
        bossShoot(); // Faz o chefe atirar
    }

    ctx.fillStyle = 'white';
    ctx.fillText('Pontuação: ' + score, 10, 20);
}

// Função para atualizar as balas
function updateBullets() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].y -= 15; // Aumenta a velocidade da bala

        // Verifica se a bala saiu da tela
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            i--;
            continue; // Continue para a próxima iteração
        }

        // Desenha a bala
        bullets[i].draw();

        // Verifica colisão com inimigos
        for (let j = 0; j < enemies.length; j++) {
            if (bullets[i].collidesWith(enemies[j])) {
                score += 10;
                enemyCount++;
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                i--;
                break; // Sai do loop de colisão
            }
        }

        // Se o chefe estiver no jogo, verifica colisão com o chefe
        if (bossFight && bullets[i].collidesWith(boss)) {
            boss.health -= 1; // O boss recebe 1 dano por tiro
            bullets.splice(i, 1);
            i--;

            // Se o chefe for derrotado
            if (boss.health <= 0) {
                alert('Você derrotou o chefe! Sua pontuação: ' + score);
                clearInterval(game);
                return;
            }
        }
    }
}

// Função para atualizar inimigos
function updateEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += 2; // Move o inimigo para baixo

        // Verifica se o inimigo saiu da tela
        if (enemies[i].y > canvas.height) {
            clearInterval(game);
            alert('Game Over! Sua pontuação: ' + score);
            return;
        }

        // Verifica colisão com o jogador
        if (player.collidesWith(enemies[i])) {
            clearInterval(game);
            alert('Game Over! Sua pontuação: ' + score);
            return;
        }

        enemies[i].draw(); // Certifique-se de desenhar os inimigos
    }
}

// Função para gerar inimigos
function spawnEnemy() {
    let enemy = new Enemy();
    enemies.push(enemy);
}

// Função para o chefe atirar
function bossShoot() {
    if (Math.random() < 0.02) { // Chance de 2% de o boss atirar a cada frame
        const bullet = new Bullet(boss.x + boss.width / 2 - 5, boss.y + boss.height); // Tamanho aumentado
        bullets.push(bullet);
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
        this.image.src = 'mario.png'; // Imagem da nave do jogador
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    move(direction) {
        if (direction === 'left' && this.x > 0) this.x -= 10;
        if (direction === 'right' && this.x < canvas.width - this.width) this.x += 10;
    }

    shoot() {
        const bullet = new Bullet(this.x + this.width / 2 - 25, this.y); // Tamanho da bala igual ao inimigo
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

// Classe da bala
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50; // Tamanho da bala igual ao inimigo
        this.height = 50; // Tamanho da bala igual ao inimigo
        this.image = new Image();
        this.image.src = 'coco.jpg'; // Imagem da bala

        // Carregar a imagem da bala antes de desenhar
        this.image.onload = () => {
            this.imageLoaded = true; // Marca a imagem como carregada
        };
        this.imageLoaded = false; // Inicializa como não carregada
    }

    draw() {
        if (this.imageLoaded) { // Verifica se a imagem está carregada
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
        this.y = -50; // Começa fora da tela
        this.width = 50;
        this.height = 50;
        this.image = new Image();
        this.image.src = 'lula.jpg'; // Imagem do inimigo

        // Carregar a imagem do inimigo antes de desenhar
        this.image.onload = () => {
            this.imageLoaded = true; // Marca a imagem como carregada
        };
        this.imageLoaded = false; // Inicializa como não carregada
    }

    draw() {
        if (this.imageLoaded) { // Verifica se a imagem está carregada
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
        this.health = 50; // O chefe precisa de 50 tiros para ser derrotado
        this.image = new Image();
        this.image.src = 'lula.jpg'; // Imagem do chefe

        // Carregar a imagem do chefe antes de desenhar
        this.image.onload = () => {
            this.imageLoaded = true; // Marca a imagem como carregada
        };
        this.imageLoaded = false; // Inicializa como não carregada
    }

    draw() {
        if (this.imageLoaded) { // Verifica se a imagem está carregada
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y - 10, this.width, 5);
            ctx.fillStyle = 'green';
            ctx.fillRect(this.x, this.y - 10, (this.health / 50) * this.width, 5); // Barra de vida
        }
    }
}

// Controle do teclado
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
