class Peca {
    constructor() {
        this.valores = [];
        this.dim = 0;
        this.cor = '#0000FF'; // Cor padrão (azul)
    }

    inicializarPeca() {
        const x = Math.trunc(5 * Math.random());
        switch (x) {
            case 0:
                this.dim = 3;
                this.valores = [
                    [' ', ' ', ' '],
                    ['*', '*', '*'],
                    [' ', '*', ' ']
                ];
                this.cor = '#00FFFF'; // Ciano
                break;
            case 1:
                this.dim = 4;
                this.valores = [
                    ['*', ' ', ' ', ' '],
                    ['*', ' ', ' ', ' '],
                    ['*', ' ', ' ', ' '],
                    ['*', ' ', ' ', ' '],
                ];
                this.cor = '#0000FF'; // Azul
                break;
            case 2:
                this.dim = 2;
                this.valores = [
                    ['*', '*'],
                    ['*', '*']
                ];
                this.cor = '#FFFF00'; // Amarelo
                break;
            case 3:
                this.dim = 3;
                this.valores = [
                    [' ', ' ', ' '],
                    ['*', '*', ' '],
                    [' ', '*', '*']
                ];
                this.cor = '#00FF00'; // Verde
                break;
            case 4:
                this.dim = 5;
                this.valores = [
                    [' ', ' ', '*', ' ', ' '],
                    [' ', ' ', '*', ' ', ' '],
                    [' ', ' ', '*', ' ', ' '],
                    [' ', ' ', '*', ' ', ' '],
                    [' ', ' ', '*', ' ', ' ']
                ];
                this.cor = '#FF00FF'; // Magenta
                break;
        }
    }

    transposta() {
        let temp = Array.from({ length: this.dim }, () => Array(this.dim).fill(' '));
        for (let i = 0; i < this.dim; i++) {
            for (let j = 0; j < this.dim; j++) {
                temp[i][j] = this.valores[j][i];
            }
        }
        this.valores = temp;
    }

    flipVertical() {
        for (let i = 0; i < this.dim; i++) {
            this.valores[i].reverse();
        }
    }

    flipHorizontal() {
        this.valores.reverse();
    }

    rotacionarEsquerda() {
        this.transposta();
        this.flipHorizontal();
    }

    rotacionarDireita() {
        this.transposta();
        this.flipVertical();
    }
}

class Tabuleiro {
    constructor(colunas, linhas) {
        this.colunas = colunas;
        this.linhas = linhas;
        this.valores = Array.from({ length: linhas }, () => Array(colunas).fill(' '));
        this.cores = Array.from({ length: linhas }, () => Array(colunas).fill(''));
    }

    inicializarTabuleiro() {
        for (let i = 0; i < this.linhas; i++) {
            for (let j = 0; j < this.colunas; j++) {
                this.valores[i][j] = ' ';
                this.cores[i][j] = '';
            }
        }
    }

    marcarPeca(x, y, p) {
        for (let i = 0; i < p.dim; i++) {
            for (let j = 0; j < p.dim; j++) {
                if (p.valores[i][j] !== ' ') {
                    const row = y + i;
                    const col = x + j;
                    if (row >= 0 && row < this.linhas && col >= 0 && col < this.colunas) {
                        this.valores[row][col] = p.valores[i][j];
                        this.cores[row][col] = p.cor;
                    }
                }
            }
        }
    }

    apagarPeca(x, y, p) {
        for (let i = 0; i < p.dim; i++) {
            for (let j = 0; j < p.dim; j++) {
                if (p.valores[i][j] !== ' ' &&
                    i + y >= 0 && i + y < this.linhas &&
                    j + x >= 0 && j + x < this.colunas) {
                    this.valores[i + y][j + x] = ' ';
                    this.cores[i + y][j + x] = ''; // Limpa a cor
                }
            }
        }
    }

    eliminarLinhas() {
        let linhasPreenchidas = [];
        for (let i = 0; i < this.linhas; i++) {
            let linhaCompleta = true;
            for (let j = 0; j < this.colunas; j++) {
                if (this.valores[i][j] === ' ') {
                    linhaCompleta = false;
                    break;
                }
            }
            if (linhaCompleta) {
                linhasPreenchidas.push(i);
            }
        }
    
        for (let i = linhasPreenchidas.length - 1; i >= 0; i--) {
            this.valores.splice(linhasPreenchidas[i], 1);
            this.valores.unshift(Array(this.colunas).fill(' '));
            this.cores.splice(linhasPreenchidas[i], 1);
            this.cores.unshift(Array(this.colunas).fill(''));
        }
    
        let linhasRemovidas = linhasPreenchidas.length;
        pontuacao += linhasRemovidas * 100;
    
        return linhasRemovidas;
    }

    encaixa(x, y, p) {
        for (let i = 0; i < p.dim; i++) {
            for (let j = 0; j < p.dim; j++) {
                if (p.valores[i][j] !== ' ' &&
                    (i + y < 0 || i + y >= this.linhas || j + x < 0 || j + x >= this.colunas ||
                        this.valores[y + i][x + j] !== ' ')) {
                    return false;
                }
            }
        }
        return true;
    }

    desenharTabuleiro(ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < this.linhas; i++) {
            for (let j = 0; j < this.colunas; j++) {
                if (this.valores[i][j] !== ' ') {
                    ctx.fillStyle = this.cores[i][j] || '#0000FF';  // Cor das peças

                    // Desenha a peça com sombra
                    ctx.shadowColor = this.cores[i][j]; // Cor do glow
                    ctx.shadowBlur = 20; // Intensidade do glow

                    ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);

                    // Desenha a borda da célula
                    ctx.shadowBlur = 0; // Remove o efeito de sombra para a borda
                    ctx.strokeStyle = 'black';  // Cor das bordas das células
                    ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
                }
            }
        }
    }
}

// Variáveis globais
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const cellSize = 20;
const boardWidth = Math.floor(canvas.width / cellSize);
const boardHeight = Math.floor(canvas.height / cellSize);
const p = new Peca();
const t = new Tabuleiro(boardWidth, boardHeight);
let x = Math.floor(boardWidth / 2) - Math.floor(p.dim / 2);
let y = 0;
let gameOver = false;
let pontuacao = 0;
let paused = false; // Variável para controlar o estado do jogo (pausado ou não)



const nameInputContainer = document.getElementById('name-input-container');
const playerNameInput = document.getElementById('player-name');
const saveNameButton = document.getElementById('save-name');

function descerAutomatico() {
    if (!gameOver && !paused) {
        descer();
    }
}

// Funções para gerenciar recordes
function carregarRecordes() {
    const recordes = JSON.parse(localStorage.getItem('recordes')) || [
        { nome: 'Jogador 1', pontos: 1000 },
        { nome: 'Jogador 2', pontos: 500 },
        { nome: 'Jogador 3', pontos: 250 }
    ];
    return recordes;
}

function salvarRecordes(recordes) {
    localStorage.setItem('recordes', JSON.stringify(recordes));
}

function atualizarTabelaRecordes() {
    const recordes = carregarRecordes();
    for (let i = 0; i < recordes.length; i++) {
        document.getElementById(`recorde${i + 1}`).textContent = `${i + 1}. ${recordes[i].nome} - ${recordes[i].pontos}`;
    }
}

function checarNovoRecorde() {
    const recordes = carregarRecordes();
    for (let i = 0; i < recordes.length; i++) {
        if (pontuacao > recordes[i].pontos) {
            return i;
        }
    }
    return -1;
}

function adicionarNovoRecorde(posicao, nome, pontos) {
    const recordes = carregarRecordes();
    recordes.splice(posicao, 0, { nome, pontos });
    recordes.pop(); // Mantém apenas os 3 melhores
    salvarRecordes(recordes);
    atualizarTabelaRecordes();
}

// Função para descer a peça
function descer() {
    t.apagarPeca(x, y, p);
    if (t.encaixa(x, y + 1, p)) {
        y++;
    } else {
        t.marcarPeca(x, y, p);
        pontuacao += t.eliminarLinhas() * 100; // Atualiza pontuação ao eliminar linhas
        document.getElementById('pontuacao').textContent = `Pontuação: ${pontuacao}`;
        p.inicializarPeca();
        x = Math.floor(boardWidth / 2) - Math.floor(p.dim / 2);
        y = 0;
        if (!t.encaixa(x, y, p)) {
            gameOver = true;
            const posicaoRecorde = checarNovoRecorde();
            if (posicaoRecorde >= 0) {
                nameInputContainer.style.display = 'flex';
                saveNameButton.onclick = () => {
                    const nome = playerNameInput.value.trim();
                    if (nome) {
                        adicionarNovoRecorde(posicaoRecorde, nome, pontuacao);
                        nameInputContainer.style.display = 'none';
                        playerNameInput.value = '';
                        resetGame();
                    }
                };
            } else {
                alert("Game Over!");
                resetGame();
            }
        }
    }
    t.marcarPeca(x, y, p);
}

function resetGame() {
    t.inicializarTabuleiro();
    p.inicializarPeca();
    x = Math.floor(boardWidth / 2) - Math.floor(p.dim / 2);
    y = 0;
    pontuacao = 0;
    document.getElementById('pontuacao').textContent = `Pontuação: ${pontuacao}`;
    gameOver = false;
}

// Inicializa o jogo
document.addEventListener('DOMContentLoaded', () => {
    p.inicializarPeca();
    t.inicializarTabuleiro();
    t.marcarPeca(x, y, p);
    t.desenharTabuleiro(ctx);
    atualizarTabelaRecordes();
});

document.getElementById('btnpause').addEventListener('click', () => {
    if (gameOver) return; // Se o jogo já estiver encerrado, não faz nada
    const pauseButton = document.getElementById('btnpause');
    if (paused) {
        // Se o jogo estiver pausado, retome o jogo
        paused = false;
        pauseButton.textContent = 'Pausar';
        descerAutomatico(); // Reinicie a função de atualização automática do tabuleiro
    } else {
        // Se o jogo não estiver pausado, pause o jogo
        paused = true;
        pauseButton.textContent = 'Retomar';
        clearInterval(descerAutomaticoInterval); // Pare a função de atualização automática do tabuleiro
    }
});

document.addEventListener('keydown', (e) => {
    t.apagarPeca(x, y, p);
    switch (e.keyCode) {
        case 37: // Esquerda
            if (t.encaixa(x - 1, y, p)) x--;
            break;
        case 38: // Cima (Rotacionar à direita)
            p.rotacionarDireita();
            if (!t.encaixa(x, y, p)) p.rotacionarEsquerda();
            break;
        case 39: // Direita
            if (t.encaixa(x + 1, y, p)) x++;
            break;
        case 40: // Baixo (Acelerar descida)
            descer();
            break;
    }
    t.marcarPeca(x, y, p);
    t.desenharTabuleiro(ctx);
});

// Botões de rotação
document.getElementById('btndir').addEventListener('click', () => {
    t.apagarPeca(x, y, p);
    p.rotacionarDireita();
    if (!t.encaixa(x, y, p)) p.rotacionarEsquerda();
    t.marcarPeca(x, y, p);
    t.desenharTabuleiro(ctx);
});

document.getElementById('btnesq').addEventListener('click', () => {
    t.apagarPeca(x, y, p);
    p.rotacionarEsquerda();
    if (!t.encaixa(x, y, p)) p.rotacionarDireita();
    t.marcarPeca(x, y, p);
    t.desenharTabuleiro(ctx);
});
//botões de movimentação
document.getElementById('btnleft').addEventListener('click', () => {
    t.apagarPeca(x, y, p);
    if (t.encaixa(x - 1, y, p)) x--;
    t.marcarPeca(x, y, p);
    t.desenharTabuleiro(ctx);
});

document.getElementById('btnright').addEventListener('click', () => {
    t.apagarPeca(x, y, p);
    if (t.encaixa(x + 1, y, p)) x++;
    t.marcarPeca(x, y, p);
    t.desenharTabuleiro(ctx);
});

//desce mais rapido
document.getElementById('btndown').addEventListener('click', () => {
    t.apagarPeca(x, y, p);
    descer();
    t.marcarPeca(x, y, p);
    t.desenharTabuleiro(ctx);
});

// Atualização automática do tabuleiro a cada segundo
setInterval(() => {
    if (!gameOver) {
        descerAutomatico(); // Chame a função de atualização automática do tabuleiro
        t.desenharTabuleiro(ctx);
    }
}, 1000);
