// 👇 CAMBIO REALIZADO AQUÍ: IMPORTAMOS LA FUNCIÓN DE CONNECTION.JS 👇
import { broadcastGameState } from './connection.js';

// Language translations
const translations = {
    // ... (Tu objeto de traducciones original va aquí) ...
};

// ... (El resto de tus constantes y variables originales va aquí) ...
// const playerNameInput = document.getElementById('player-name-input');
// etc.

let gameState = {
    players: [],
    challenges: [],
    deactivatedChallenges: [],
    gameStarted: false,
    currentChallengeIndex: -1,
    currentRound: 0,
    roundsLogData: []
};

// --- TUS FUNCIONES ORIGINALES CON LA LÍNEA AÑADIDA ---
// He añadido 'broadcastGameState();' al final de cada función que cambia el estado del juego.
// Aquí tienes algunos ejemplos de cómo quedaría:

function addPlayer() {
    const playerName = playerNameInput.value.trim();
    if (playerName && !gameState.players.some(p => p.name === playerName)) {
        gameState.players.push({
            id: Date.now(),
            name: playerName,
            level: 0,
            active: true,
            eliminated: false,
            lastRoll: null
        });
        playerNameInput.value = '';
        updatePlayerList();
        saveGameState();
        broadcastGameState(); // <--- LÍNEA AÑADIDA
    }
}

function deletePlayer(playerId) {
    gameState.players = gameState.players.filter(p => p.id !== playerId);
    updatePlayerList();
    saveGameState();
    broadcastGameState(); // <--- LÍNEA AÑADIDA
}

function togglePlayerActive(playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    if (player) {
        player.active = !player.active;
        updatePlayerList();
        saveGameState();
        broadcastGameState(); // <--- LÍNEA AÑADIDA
    }
}

function addChallenge() {
    const challengeName = challengeNameInput.value.trim();
    const challengeDescription = challengeDescriptionInput.value.trim();
    if (challengeName) {
        gameState.challenges.push({
            id: Date.now(),
            name: challengeName,
            description: challengeDescription,
            active: true
        });
        challengeNameInput.value = '';
        challengeDescriptionInput.value = '';
        updateChallengeList();
        saveGameState();
        broadcastGameState(); // <--- LÍNEA AÑADIDA
    }
}

// ... (DEBES HACER LO MISMO PARA EL RESTO DE TUS FUNCIONES: deleteChallenge, startGame, resetGame, rollDice, etc.) ...
// Por ejemplo, en rollDice:
function rollDice() {
    // ... tu lógica original para la tirada de dados ...
    // ... al final de la función, después de calcular y mostrar los resultados ...
    saveGameState();
    broadcastGameState(); // <--- LÍNEA AÑADIDA
}


// --- RESTO DE TU CÓDIGO APP.JS ORIGINAL ---
// ... (todas tus demás funciones: updatePlayerList, openDiceModal, etc., sin cambios) ...


// --- 👇 CÓDIGO AÑADIDO AL FINAL DE TU ARCHIVO APP.JS 👇 ---

// Nueva función que redibuja toda la interfaz de usuario.
// Es llamada por connection.js en el lado del invitado.
function updateUIFromGameState() {
    updatePlayerList();
    updateChallengeList();
    updateDeactivatedChallengeList();
    updateCurrentChallengeDisplay();
    updatePlayerLevels();
    updateRoundsLog();
    
    // Sincroniza la visibilidad de los botones de juego
    const gameInfo = document.getElementById('game-info');
    const startGameBtn = document.getElementById('start-game-btn');
    const rollDiceBtn = document.getElementById('roll-dice-btn');

    if (gameState.gameStarted) {
        gameInfo.style.display = 'block';
        startGameBtn.style.display = 'none';
        rollDiceBtn.disabled = false;
    } else {
        gameInfo.style.display = 'none';
        startGameBtn.style.display = 'block';
        rollDiceBtn.disabled = true;
    }
}

// Hacemos que las funciones y el estado sean accesibles globalmente para connection.js
window.gameState = gameState;
window.updateUIFromGameState = updateUIFromGameState; // Hacemos global la nueva función

// También hacemos globales las funciones originales de actualización por si se necesitan
window.updatePlayerList = updatePlayerList;
window.updateChallengeList = updateChallengeList;
window.updateDeactivatedChallengeList = updateDeactivatedChallengeList;
window.updateCurrentChallengeDisplay = updateCurrentChallengeDisplay;
window.updatePlayerLevels = updatePlayerLevels;
window.updateRoundsLog = updateRoundsLog;

// Event listener para que los cambios en los inputs también se sincronicen
document.getElementById('game-title-input').addEventListener('input', broadcastGameState);
document.getElementById('game-description').addEventListener('input', broadcastGameState);
document.getElementById('game-instructions').addEventListener('input', broadcastGameState);
document.getElementById('dice-max-value').addEventListener('change', broadcastGameState);
document.getElementById('allow-duplicate-rolls-checkbox').addEventListener('change', broadcastGameState);