class Enemy {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.setupStats();
    }

    setupStats() {
        switch(this.type) {
            case 'normal':
                this.radius = 15;
                this.health = 100;
                this.maxHealth = 100;
                this.color = '#ff4444';
                this.shootInterval = 2;
                this.speed = 2;
                this.xpValue = 20;
                break;
            case 'fast':
                this.radius = 12;
                this.health = 80;
                this.maxHealth = 80;
                this.color = '#ff8844';
                this.shootInterval = 1;
                this.speed = 3;
                this.xpValue = 25;
                break;
            case 'tank':
                this.radius = 20;
                this.health = 200;
                this.maxHealth = 200;
                this.color = '#ff4444';
                this.shootInterval = 3;
                this.speed = 1.5;
                this.xpValue = 35;
                break;
            case 'boss':
                this.radius = 40;
                this.health = 1000;
                this.maxHealth = 1000;
                this.color = '#ff0000';
                this.shootInterval = 1;
                this.speed = 1;
                this.xpValue = 100;
                this.pattern = 0;
                this.patternTimer = 0;
                break;
        }
        this.shootCooldown = 0;
    }

    update(deltaTime, playerX, playerY) {
        this.shootCooldown -= deltaTime;

        if (this.type === 'boss') {
            this.updateBossPattern(deltaTime, playerX, playerY);
        } else {
            // Movimento normal em direção ao jogador
            const angle = Math.atan2(playerY - this.y, playerX - this.x);
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;
        }
    }

    updateBossPattern(deltaTime, playerX, playerY) {
        this.patternTimer += deltaTime;

        switch(this.pattern) {
            case 0: // Movimento circular
                const radius = 100;
                const speed = 2;
                this.x = playerX + Math.cos(this.patternTimer * speed) * radius;
                this.y = playerY + Math.sin(this.patternTimer * speed) * radius;
                if (this.patternTimer >= 5) {
                    this.pattern = 1;
                    this.patternTimer = 0;
                }
                break;
            case 1: // Movimento em espiral
                const spiralSpeed = 3;
                const spiralRadius = 50 + this.patternTimer * 10;
                this.x = playerX + Math.cos(this.patternTimer * spiralSpeed) * spiralRadius;
                this.y = playerY + Math.sin(this.patternTimer * spiralSpeed) * spiralRadius;
                if (this.patternTimer >= 8) {
                    this.pattern = 2;
                    this.patternTimer = 0;
                }
                break;
            case 2: // Perseguição direta
                const angle = Math.atan2(playerY - this.y, playerX - this.x);
                this.x += Math.cos(angle) * this.speed;
                this.y += Math.sin(angle) * this.speed;
                if (this.patternTimer >= 5) {
                    this.pattern = 0;
                    this.patternTimer = 0;
                }
                break;
        }
    }

    draw(ctx) {
        // Desenhar glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Desenhar inimigo
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        // Desenhar barra de vida
        const barWidth = this.type === 'boss' ? 80 : 40;
        const barHeight = this.type === 'boss' ? 5 : 3;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, barWidth, barHeight);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 10, (this.health / this.maxHealth) * barWidth, barHeight);

        // Desenhar efeito especial para o boss
        if (this.type === 'boss') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        }

        ctx.shadowBlur = 0;
    }
}

class XPOrb {
    constructor(x, y, xpValue) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.color = '#00ff00';
        this.xpValue = xpValue;
        this.baseSpeed = 3;
        this.maxSpeed = 8;
        this.attractionRadius = 200;
        this.attractionForce = 0.5;
        this.rotation = 0;
        this.rotationSpeed = 0.1;
        this.collected = false;
    }

    update(playerX, playerY) {
        // Rotação do orb
        this.rotation += this.rotationSpeed;

        // Movimento em direção ao jogador
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.attractionRadius) {
            const angle = Math.atan2(dy, dx);
            
            // Calcular velocidade baseada na distância
            const speedMultiplier = 1 + (this.attractionRadius - distance) / this.attractionRadius * this.attractionForce;
            const currentSpeed = this.baseSpeed + (this.maxSpeed - this.baseSpeed) * (1 - distance / this.attractionRadius);
            
            this.x += Math.cos(angle) * currentSpeed * speedMultiplier;
            this.y += Math.sin(angle) * currentSpeed * speedMultiplier;
        }
    }

    draw(ctx) {
        // Desenhar glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        
        // Desenhar orb com rotação
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Desenhar círculo principal
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Desenhar detalhes
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        ctx.restore();
        ctx.shadowBlur = 0;
    }
}

class PowerUp {
    constructor(type, level = 1) {
        this.type = type;
        this.level = Math.min(level, 5);
        this.name = this.getPowerUpName();
        this.description = this.getPowerUpDescription();
        this.icon = this.getPowerUpIcon();
    }

    getPowerUpName() {
        const names = {
            'speed': 'Velocidade',
            'parry': 'Parry Aprimorado',
            'energy': 'Energia Extra',
            'shield': 'Escudo',
            'time': 'Tempo Lento',
            'explosion': 'Explosão',
            'chain': 'Cadeia',
            'heal': 'Cura'
        };
        return names[this.type] || 'Power-Up';
    }

    getPowerUpDescription() {
        const descriptions = {
            'speed': `Aumenta sua velocidade em ${this.level * 20}%`,
            'parry': `Aumenta duração do parry em ${this.level * 0.2}s`,
            'energy': `Aumenta energia máxima em ${this.level * 20}`,
            'shield': `Gera um escudo que absorve ${this.level * 20} de dano`,
            'time': `Desacelera inimigos em ${this.level * 20}% por 5s`,
            'explosion': `Cria uma explosão que causa ${this.level * 20} de dano`,
            'chain': `Projéteis refletidos acertam mais ${this.level} inimigos`,
            'heal': `Cura ${this.level * 20} de vida`
        };
        return descriptions[this.type] || 'Power-Up';
    }

    getPowerUpIcon() {
        const icons = {
            'speed': '⚡',
            'parry': '🛡️',
            'energy': '⚡',
            'shield': '🛡️',
            'time': '⏰',
            'explosion': '💥',
            'chain': '⛓️',
            'heal': '❤️'
        };
        return icons[this.type] || '❓';
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;

        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 20,
            speed: 6,
            health: 100,
            energy: 100,
            parryActive: false,
            parryCooldown: 0,
            parryDuration: 0.5,
            parryEnergyCost: 20,
            parryCooldownTime: 2,
            maxEnergy: 100,
            parryMultiplier: 1.5,
            parryColor: '#00ffff',
            xp: 0,
            level: 1,
            xpToNextLevel: 100,
            powerUps: {},
            shield: 0,
            chainCount: 1
        };

        this.projectiles = [];
        this.particles = [];
        this.bloodSplats = [];
        this.score = 0;
        this.gameTime = 0;
        this.isGameOver = false;
        this.isTutorialActive = true;
        this.screenShake = {
            intensity: 0,
            duration: 0
        };

        // Controles
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);

        // Elementos da UI
        this.scoreElement = document.getElementById('score');
        this.healthElement = document.getElementById('health');
        this.cooldownBar = document.querySelector('.cooldown-bar');
        this.gameOverScreen = document.querySelector('.game-over');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartButton = document.getElementById('restartButton');
        this.startButton = document.getElementById('startButton');
        this.tutorialScreen = document.querySelector('.tutorial-screen');
        this.powerUpScreen = document.querySelector('.power-up-screen');
        this.xpBarFill = document.querySelector('.xp-bar-fill');
        this.playerLevelElement = document.querySelector('.player-level');
        this.powerUpOptions = [];
        this.isPowerUpScreenActive = false;

        // Eventos
        this.restartButton.addEventListener('click', () => this.restart());
        this.startButton.addEventListener('click', () => this.startGame());

        // Iniciar o loop do jogo
        this.lastTime = 0;
        this.enemies = [];
        this.enemySpawnInterval = 3; // Segundos entre spawns de inimigos
        this.lastEnemySpawn = 0;
        this.xpOrbs = [];
        this.animate();

        // Adicionar propriedades para controle de dificuldade
        this.difficultyLevel = 1;
        this.bossSpawned = false;
        this.bossSpawnInterval = 30; // Segundos entre spawns de boss
        this.lastBossSpawn = 0;
        this.enemyTypes = ['normal'];
        this.enemyTypeWeights = [1];
    }

    createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 2 + Math.random() * 2;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color,
                size: 2 + Math.random() * 3
            });
        }
    }

    createBloodSplat(x, y) {
        const count = 10 + Math.floor(Math.random() * 10);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 30;
            this.bloodSplats.push({
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                size: 3 + Math.random() * 5,
                life: 1
            });
        }
    }

    screenShakeEffect(intensity, duration) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateBloodSplats() {
        for (let i = this.bloodSplats.length - 1; i >= 0; i--) {
            const splat = this.bloodSplats[i];
            splat.life -= 0.001;
            if (splat.life <= 0) {
                this.bloodSplats.splice(i, 1);
            }
        }
    }

    updateScreenShake() {
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= 1/60;
            this.screenShake.intensity *= 0.95;
        }
    }

    startGame() {
        this.isTutorialActive = false;
        this.tutorialScreen.classList.add('hidden');
        this.restart();
    }

    spawnProjectile() {
        if (Math.random() < 0.02) {
            const x = Math.random() < 0.5 ? -10 : this.canvas.width + 10;
            const y = Math.random() * this.canvas.height;
            const angle = Math.atan2(this.player.y - y, this.player.x - x);
            const speed = 3 + Math.random() * 2;
            
            // Criar efeito de tiro
            this.createParticles(x, y, '#ff0000', 5);
            
            this.projectiles.push({
                x,
                y,
                radius: 5,
                speed,
                angle,
                damage: 10,
                trail: [],
                isReflected: false
            });
        }
    }

    checkCollision(projectile, player) {
        const dx = projectile.x - player.x;
        const dy = projectile.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (projectile.radius + player.radius);
    }

    updatePlayer() {
        // Mudando para WASD
        if (this.keys['a'] || this.keys['A']) {
            this.player.x = Math.max(this.player.radius, this.player.x - this.player.speed);
        }
        if (this.keys['d'] || this.keys['D']) {
            this.player.x = Math.min(this.canvas.width - this.player.radius, this.player.x + this.player.speed);
        }
        if (this.keys['w'] || this.keys['W']) {
            this.player.y = Math.max(this.player.radius, this.player.y - this.player.speed);
        }
        if (this.keys['s'] || this.keys['S']) {
            this.player.y = Math.min(this.canvas.height - this.player.radius, this.player.y + this.player.speed);
        }

        // Atualizar parry
        if (this.keys[' ']) {
            if (!this.player.parryActive && this.player.parryCooldown <= 0 && this.player.energy >= this.player.parryEnergyCost) {
                this.player.parryActive = true;
                this.player.parryCooldown = this.player.parryDuration;
                // Efeito de parry
                this.createParticles(this.player.x, this.player.y, '#00ffff', 20);
            }
        } else {
            this.player.parryActive = false;
        }

        // Atualizar energia e cooldown do parry
        if (this.player.parryActive) {
            this.player.energy -= this.player.parryEnergyCost * (1/60);
            if (this.player.energy <= 0) {
                this.player.parryActive = false;
                this.player.energy = 0;
            }
        } else {
            this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 5 * (1/60));
        }

        if (this.player.parryCooldown > 0) {
            this.player.parryCooldown -= 1/60;
            this.cooldownBar.style.width = `${(this.player.parryCooldown / this.player.parryDuration) * 100}%`;
        }

        this.cooldownBar.style.backgroundColor = this.player.energy >= this.player.parryEnergyCost ? '#4CAF50' : '#ff4444';

        // Atualizar barra de XP
        this.xpBarFill.style.width = `${(this.player.xp / this.player.xpToNextLevel) * 100}%`;
        this.playerLevelElement.textContent = `Nível ${this.player.level}`;
    }

    spawnEnemy() {
        if (this.bossSpawned) return;

        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch(side) {
            case 0: x = Math.random() * this.canvas.width; y = -20; break;
            case 1: x = this.canvas.width + 20; y = Math.random() * this.canvas.height; break;
            case 2: x = Math.random() * this.canvas.width; y = this.canvas.height + 20; break;
            case 3: x = -20; y = Math.random() * this.canvas.height; break;
        }

        // Escolher tipo de inimigo baseado nos pesos
        const totalWeight = this.enemyTypeWeights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        let enemyType = 'normal';
        
        for (let i = 0; i < this.enemyTypes.length; i++) {
            if (random <= this.enemyTypeWeights[i]) {
                enemyType = this.enemyTypes[i];
                break;
            }
            random -= this.enemyTypeWeights[i];
        }

        this.enemies.push(new Enemy(x, y, enemyType));
    }

    spawnBoss() {
        if (this.bossSpawned) return;

        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch(side) {
            case 0: x = Math.random() * this.canvas.width; y = -50; break;
            case 1: x = this.canvas.width + 50; y = Math.random() * this.canvas.height; break;
            case 2: x = Math.random() * this.canvas.width; y = this.canvas.height + 50; break;
            case 3: x = -50; y = Math.random() * this.canvas.height; break;
        }

        this.enemies.push(new Enemy(x, y, 'boss'));
        this.bossSpawned = true;
        this.createParticles(x, y, '#ff0000', 50);
        this.screenShakeEffect(10, 0.5);
    }

    updateEnemies(deltaTime) {
        // Verificar spawn de boss
        if (!this.bossSpawned && this.gameTime - this.lastBossSpawn >= this.bossSpawnInterval) {
            this.spawnBoss();
        }

        // Spawn de inimigos normais
        if (!this.bossSpawned && this.gameTime - this.lastEnemySpawn >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.lastEnemySpawn = this.gameTime;
        }

        // Atualizar inimigos
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime, this.player.x, this.player.y);

            // Atirar quando o cooldown acabar
            if (enemy.shootCooldown <= 0) {
                const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
                const speed = enemy.type === 'fast' ? 5 : 4;
                
                this.createParticles(enemy.x, enemy.y, enemy.color, 5);
                
                this.projectiles.push({
                    x: enemy.x,
                    y: enemy.y,
                    radius: enemy.type === 'boss' ? 8 : 5,
                    speed,
                    angle,
                    damage: enemy.type === 'boss' ? 20 : 10,
                    trail: [],
                    isReflected: false
                });

                enemy.shootCooldown = enemy.shootInterval;
            }

            // Remover inimigos mortos
            if (enemy.health <= 0) {
                this.enemies.splice(i, 1);
                this.createParticles(enemy.x, enemy.y, enemy.color, 20);
                this.spawnXPOrb(enemy.x, enemy.y, enemy.xpValue);

                // Se era um boss, resetar o estado
                if (enemy.type === 'boss') {
                    this.bossSpawned = false;
                    this.lastBossSpawn = this.gameTime;
                    this.increaseDifficulty();
                }
            }
        }
    }

    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            // Atualizar trail
            projectile.trail.push({ x: projectile.x, y: projectile.y });
            if (projectile.trail.length > 5) {
                projectile.trail.shift();
            }

            // Aplicar velocidade normal ou aumentada baseado no parry
            const currentSpeed = projectile.angle > Math.PI ? 
                projectile.speed * this.player.parryMultiplier : 
                projectile.speed;

            projectile.x += Math.cos(projectile.angle) * currentSpeed;
            projectile.y += Math.sin(projectile.angle) * currentSpeed;

            // Verificar colisão com o jogador
            if (this.checkCollision(projectile, this.player)) {
                if (this.player.parryActive) {
                    // Refletir o projétil
                    projectile.angle += Math.PI;
                    // Efeito de parry bem sucedido
                    this.createParticles(projectile.x, projectile.y, this.player.parryColor, 15);
                    // Aumentar o dano do projétil refletido
                    projectile.damage *= 2;
                    // Marcar o projétil como refletido
                    projectile.isReflected = true;
                } else {
                    this.player.health -= projectile.damage;
                    this.healthElement.textContent = this.player.health;
                    this.projectiles.splice(i, 1);
                    // Efeitos de dano
                    this.createParticles(projectile.x, projectile.y, '#ff0000', 10);
                    this.createBloodSplat(projectile.x, projectile.y);
                    this.screenShakeEffect(5, 0.2);
                }
            }

            // Verificar colisão com inimigos (apenas para projéteis refletidos)
            if (projectile.isReflected) {
                let hitCount = 0;
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    if (hitCount >= this.player.chainCount) break;
                    
                    const enemy = this.enemies[j];
                    const dx = projectile.x - enemy.x;
                    const dy = projectile.y - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < (projectile.radius + enemy.radius)) {
                        enemy.health = 0;
                        hitCount++;
                        this.createParticles(projectile.x, projectile.y, '#ff0000', 20);
                        this.createParticles(projectile.x, projectile.y, this.player.parryColor, 10);
                        
                        if (enemy.health <= 0) {
                            this.score += 10;
                            this.scoreElement.textContent = this.score;
                            this.spawnXPOrb(enemy.x, enemy.y, enemy.xpValue);
                        }
                    }
                }
                if (hitCount > 0) {
                    this.projectiles.splice(i, 1);
                }
            }

            // Remover projéteis fora da tela
            if (projectile.x < -20 || projectile.x > this.canvas.width + 20 ||
                projectile.y < -20 || projectile.y > this.canvas.height + 20) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    draw() {
        // Limpar canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Aplicar shake da tela
        const shakeX = (Math.random() - 0.5) * this.screenShake.intensity;
        const shakeY = (Math.random() - 0.5) * this.screenShake.intensity;
        this.ctx.save();
        this.ctx.translate(shakeX, shakeY);

        // Desenhar sangue no chão
        this.bloodSplats.forEach(splat => {
            this.ctx.beginPath();
            this.ctx.arc(splat.x, splat.y, splat.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(139, 0, 0, ${splat.life})`;
            this.ctx.fill();
            this.ctx.closePath();
        });

        // Desenhar trails dos projéteis
        this.projectiles.forEach(projectile => {
            projectile.trail.forEach((pos, index) => {
                const alpha = index / projectile.trail.length;
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, projectile.radius * alpha, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${projectile.isReflected ? '0, 255, 255' : '255, 0, 0'}, ${alpha * 0.5})`;
                this.ctx.fill();
                this.ctx.closePath();
            });
        });

        // Desenhar partículas
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${particle.color === '#ff0000' ? '255, 0, 0' : '0, 255, 255'}, ${particle.life})`;
            this.ctx.fill();
            this.ctx.closePath();
        });

        // Desenhar orbs de XP
        this.xpOrbs.forEach(orb => orb.draw(this.ctx));

        // Desenhar jogador com glow
        this.ctx.shadowColor = this.player.parryActive ? '#00f' : '#fff';
        this.ctx.shadowBlur = 20;
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.player.parryActive ? '#00f' : '#fff';
        this.ctx.fill();
        this.ctx.closePath();
        this.ctx.shadowBlur = 0;

        // Desenhar barra de energia do jogador
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(this.player.x - 25, this.player.y - 35, 50, 5);
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(this.player.x - 25, this.player.y - 35, (this.player.energy / this.player.maxEnergy) * 50, 5);

        // Desenhar projéteis
        this.projectiles.forEach(projectile => {
            this.ctx.shadowColor = projectile.isReflected ? this.player.parryColor : '#ff0000';
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = projectile.isReflected ? this.player.parryColor : '#ff0000';
            this.ctx.fill();
            this.ctx.closePath();
            this.ctx.shadowBlur = 0;
        });

        // Desenhar inimigos
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        this.ctx.restore();
    }

    gameOver() {
        this.isGameOver = true;
        this.gameOverScreen.classList.remove('hidden');
        this.finalScoreElement.textContent = this.score;
    }

    restart() {
        this.player.health = 100;
        this.player.energy = 100;
        this.score = 0;
        this.projectiles = [];
        this.particles = [];
        this.bloodSplats = [];
        this.gameTime = 0;
        this.isGameOver = false;
        this.scoreElement.textContent = '0';
        this.healthElement.textContent = '100';
        this.cooldownBar.style.width = '100%';
        this.cooldownBar.style.backgroundColor = '#4CAF50';
        this.gameOverScreen.classList.add('hidden');
        this.enemies = [];
        this.lastEnemySpawn = 0;
        this.xpOrbs = [];
        this.xpBarFill.style.width = '0%';
        this.playerLevelElement.textContent = 'Nível 1';
        this.difficultyLevel = 1;
        this.bossSpawned = false;
        this.lastBossSpawn = 0;
        this.enemyTypes = ['normal'];
        this.enemyTypeWeights = [1];
    }

    animate(currentTime = 0) {
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (!this.isTutorialActive && !this.isGameOver && !this.isPowerUpScreenActive) {
            this.gameTime += deltaTime;
            this.updatePlayer();
            this.updateEnemies(deltaTime);
            this.updateProjectiles();
            this.updateParticles();
            this.updateBloodSplats();
            this.updateScreenShake();
            this.updateXPOrbs();
            this.draw();

            if (this.player.health <= 0) {
                this.gameOver();
            }
        }

        requestAnimationFrame((time) => this.animate(time));
    }

    spawnXPOrb(x, y, xpValue) {
        this.xpOrbs.push(new XPOrb(x, y, xpValue));
    }

    updateXPOrbs() {
        for (let i = this.xpOrbs.length - 1; i >= 0; i--) {
            const orb = this.xpOrbs[i];
            orb.update(this.player.x, this.player.y);

            // Verificar colisão com o jogador
            const dx = orb.x - this.player.x;
            const dy = orb.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < (orb.radius + this.player.radius) && !orb.collected) {
                orb.collected = true;
                this.xpOrbs.splice(i, 1);
                this.player.xp += orb.xpValue;
                this.createParticles(orb.x, orb.y, orb.color, 10);

                // Verificar level up
                if (this.player.xp >= this.player.xpToNextLevel) {
                    this.levelUp();
                }
            }
        }
    }

    levelUp() {
        this.player.level++;
        this.player.xp -= this.player.xpToNextLevel;
        this.player.xpToNextLevel = Math.floor(this.player.xpToNextLevel * 1.5);
        this.showPowerUpScreen();
    }

    showPowerUpScreen() {
        this.isPowerUpScreenActive = true;
        this.powerUpOptions = this.generatePowerUpOptions();
        this.powerUpScreen.classList.remove('hidden');
        this.renderPowerUpOptions();
    }

    generatePowerUpOptions() {
        const powerUpTypes = ['speed', 'parry', 'energy', 'shield', 'time', 'explosion', 'chain', 'heal'];
        const options = [];
        
        // Gerar 3 opções únicas
        while (options.length < 3) {
            const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            if (!options.find(opt => opt.type === type)) {
                const currentLevel = this.player.powerUps[type] || 0;
                options.push(new PowerUp(type, currentLevel + 1));
            }
        }
        
        return options;
    }

    renderPowerUpOptions() {
        const container = this.powerUpScreen.querySelector('.power-up-options');
        container.innerHTML = '';
        
        this.powerUpOptions.forEach((powerUp, index) => {
            const option = document.createElement('div');
            option.className = 'power-up-option';
            option.innerHTML = `
                <div class="power-up-icon">${powerUp.icon}</div>
                <div class="power-up-name">${powerUp.name}</div>
                <div class="power-up-description">${powerUp.description}</div>
                <div class="power-up-level">Nível ${powerUp.level}/5</div>
            `;
            option.addEventListener('click', () => this.selectPowerUp(index));
            container.appendChild(option);
        });
    }

    selectPowerUp(index) {
        const powerUp = this.powerUpOptions[index];
        this.applyPowerUp(powerUp);
        this.powerUpScreen.classList.add('hidden');
        this.isPowerUpScreenActive = false;
    }

    applyPowerUp(powerUp) {
        // Atualizar nível do power-up
        this.player.powerUps[powerUp.type] = powerUp.level;

        // Aplicar efeitos baseados no tipo
        switch (powerUp.type) {
            case 'speed':
                this.player.speed *= 1.2;
                break;
            case 'parry':
                this.player.parryDuration += 0.2;
                break;
            case 'energy':
                this.player.maxEnergy += 20;
                this.player.energy = this.player.maxEnergy;
                break;
            case 'shield':
                this.player.shield += 20;
                break;
            case 'time':
                this.enemySlowMultiplier = 1 - (powerUp.level * 0.2);
                setTimeout(() => this.enemySlowMultiplier = 1, 5000);
                break;
            case 'explosion':
                this.createExplosion(this.player.x, this.player.y, powerUp.level * 20);
                break;
            case 'chain':
                this.player.chainCount = powerUp.level;
                break;
            case 'heal':
                this.player.health = Math.min(100, this.player.health + (powerUp.level * 20));
                this.healthElement.textContent = this.player.health;
                break;
        }
    }

    createExplosion(x, y, damage) {
        // Criar efeito de explosão
        this.createParticles(x, y, '#ff0000', 30);
        
        // Causar dano aos inimigos próximos
        this.enemies.forEach(enemy => {
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                enemy.health = 0;
                this.createParticles(enemy.x, enemy.y, '#ff0000', 15);
            }
        });
    }

    increaseDifficulty() {
        this.difficultyLevel++;
        
        // Ajustar intervalos baseado na dificuldade
        this.enemySpawnInterval = Math.max(1, 3 - (this.difficultyLevel * 0.2));
        this.bossSpawnInterval = Math.max(15, 30 - (this.difficultyLevel * 2));

        // Desbloquear novos tipos de inimigos
        if (this.difficultyLevel === 2) {
            this.enemyTypes.push('fast');
            this.enemyTypeWeights.push(0.3);
        } else if (this.difficultyLevel === 3) {
            this.enemyTypes.push('tank');
            this.enemyTypeWeights.push(0.2);
        }

        // Ajustar pesos dos inimigos
        this.enemyTypeWeights[0] = Math.max(0.3, 1 - (this.difficultyLevel * 0.2));
    }
}

// Iniciar o jogo quando a página carregar
window.addEventListener('load', () => {
    new Game();
}); 