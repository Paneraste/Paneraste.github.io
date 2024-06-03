import { firestore } from './firebase.js';
import { collection, doc, query, orderBy, limit, getDocs, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

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
        let linhasRemovidas = 0;
        for (let i = 0; i < this.linhas; i++) {
            let completa = true;
            for (let j = 0; j < this.colunas; j++) {
                if (this.valores[i][j] === ' ') {
                    completa = false;
                    break;
                }
            }
            if (completa) {
                linhasRemovidas++;
                for (let k = i; k > 0; k--) {
                    for (let j = 0; j < this.colunas; j++) {
                        this.valores[k][j] = this.valores[k-1][j];
                        this.cores[k][j] = this.cores[k-1][j];
                    }
                }
                for (let j = 0; j < this.colunas; j++) {
                    this.valores[0][j] = ' ';
                    this.cores[0][j] = ''; // Reseta a cor
                }
            }
        }
        
        pontuacao += linhasRemovidas * 100; // Atualiza a pontuação
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
const cellSize = 30;
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

// Funções de recordes
async function carregarRecordes() {
    const recordesRef = collection(firestore, 'recordes');
    const q = query(recordesRef, orderBy('pontos', 'desc'), limit(3));
    const querySnapshot = await getDocs(q);
    const recordes = [];
    querySnapshot.forEach((doc) => {
        recordes.push(doc.data());
    });
    return recordes;
}

async function salvarRecorde(nome, pontos) {
    await setDoc(doc(firestore, 'recordes', 'record_' + nome), {
        nome: nome,
        pontos: pontos
    });
}

async function adicionarNovoRecorde(nome, pontos) {
    await salvarRecorde(nome, pontos);
    await atualizarTabelaRecordes();
}

async function checarNovoRecorde(pontos) {
    const recordesRef = collection(firestore, 'recordes');
    const q = query(recordesRef, orderBy('pontos', 'asc'), limit(1));
    const querySnapshot = await getDocs(q);
    let menorRecorde = 0;
    querySnapshot.forEach((doc) => {
        menorRecorde = doc.data().pontos;
    });
    // Retorna true se a pontuação for maior que o menor recorde ou se não há recordes
    return pontos > menorRecorde || querySnapshot.empty;
}

async function atualizarTabelaRecordes() {
    const recordes = await carregarRecordes();
    for (let i = 0; i < recordes.length; i++) {
        const recordeElement = document.getElementById(`recorde${i + 1}`);
        if (recordeElement) {
            recordeElement.textContent = `${i + 1}. ${recordes[i].nome} - ${recordes[i].pontos}`;
        }
    }
}
//---------------------------------------------
  // Função para descer automaticamente
  function descerAutomatico() {
    if (!gameOver && !paused) {
      descer();
    }
  }

// Função para descer a peça
async function descer() {
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
            const novoRecorde = await checarNovoRecorde(pontuacao);
            if (novoRecorde) {
                nameInputContainer.style.display = 'flex';
                saveNameButton.onclick = async () => {
                    const nome = playerNameInput.value.trim();
                    if (nome) {
                        await adicionarNovoRecorde(nome, pontuacao);
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
    }
});

document.addEventListener('keydown', (e) => {
    if (paused) return; // Não permite movimentação se o jogo estiver pausado
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
    if (paused) return; // Não permite rotação se o jogo estiver pausado
    t.apagarPeca(x, y, p);
    p.rotacionarDireita();
    if (!t.encaixa(x, y, p)) p.rotacionarEsquerda();
    t.marcarPeca(x, y, p);
    t.desenharTabuleiro(ctx);
});

document.getElementById('btnesq').addEventListener('click', () => {
    if (paused) return; // Não permite rotação se o jogo estiver pausado
    t.apagarPeca(x, y, p);
    p.rotacionarEsquerda();
    if (!t.encaixa(x, y, p)) p.rotacionarDireita();
    t.marcarPeca(x, y, p);
    t.desenharTabuleiro(ctx);
});
//botões de movimentação
document.getElementById('btnleft').addEventListener('click', () => {
    if (paused) return; // Não permite movimentação se o jogo estiver pausado
    t.apagarPeca(x, y, p);
    if (t.encaixa(x - 1, y, p)) x--;
    t.marcarPeca(x, y, p);
    t.desenharTabuleiro(ctx);
});

document.getElementById('btnright').addEventListener('click', () => {
    if (paused) return; // Não permite movimentação se o jogo estiver pausado
    t.apagarPeca(x, y, p);
    if (t.encaixa(x + 1, y, p)) x++;
    t.marcarPeca(x, y, p);
    t.desenharTabuleiro(ctx);
});

//desce mais rapido
document.getElementById('btndown').addEventListener('click', () => {
    if (paused) return; // Não permite descida se o jogo estiver pausado
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
}, 250);

// cena
//================================================================================

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

// Configuração básica da cena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

const particleContainer = document.getElementById('particle-background');
renderer.setSize(window.innerWidth, window.innerHeight);
particleContainer.appendChild(renderer.domElement);

// Reposiciona a câmera
camera.position.z = 5;

// Criação das partículas
const particleCount = 1000;
const particles = new THREE.Group();
scene.add(particles);

const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });

for (let i = 0; i < particleCount; i++) {
  const particle = new THREE.Mesh(particleGeometry, particleMaterial);
  const x = (Math.random() - 0.5) * 20;
  const y = (Math.random() - 0.5) * 20;
  const z = (Math.random() - 0.5) * 20;
  particle.position.set(x, y, z);
  particle.scale.set(0.3, 0.3, 0.3);
  particleMaterial.opacity = Math.random() * 0.8 + 0.2;
  particles.add(particle);
}

// Animação das partículas
function animateParticles() {
  requestAnimationFrame(animateParticles);
  particles.rotation.y += 0.001;
  renderer.render(scene, camera);
}

animateParticles();

// Ajustar o tamanho do renderer ao redimensionar a janela
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
