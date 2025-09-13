// Pega aquí TODO tu código existente de app.js
// ...
// ... (todo tu código, variables, funciones, etc.)
// ...

// AL FINAL de tu archivo app.js, añade o asegúrate de que existen estas exportaciones globales:

// Función para que el invitado muestre la animación de "lanzando"
function showDiceRollingAnimation() {
    const modalDiceContainer = document.getElementById('modal-dice-container');
    modalDiceContainer.innerHTML = '<h2>Lanzando dados...</h2>';
    openDiceModal();
}

// Función centralizada para actualizar toda la UI desde el gameState
function updateUIFromGameState() {
    updatePlayerList();
    updateChallengeList();
    updateDeactivatedChallengeList();
    updateCurrentChallengeDisplay();
    updatePlayerLevels();
    updateRoundsLog();
    
    // También actualiza el estado de los botones y la información del juego
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

// --- Exportaciones globales para connection.js ---
window.gameState = gameState;

// Funciones que modifican el estado
window.addPlayer = addPlayer;
window.deletePlayer = deletePlayer;
window.togglePlayerActive = togglePlayerActive;
window.addChallenge = addChallenge;
window.deleteChallenge = deleteChallenge;
window.toggleChallengeActive = toggleChallengeActive;
window.updateChallenge = updateChallenge;
window.startGame = startGame;
window.resetGame = resetGame;
window.rollDice = rollDice;
window.showDiceResult = showDiceResult; // importante para sincronizar resultados

// Funciones que actualizan la UI
window.updateUIFromGameState = updateUIFromGameState;
window.showDiceRollingAnimation = showDiceRollingAnimation;// Pega aquí TODO tu código existente de app.js
// ...
// ... (todo tu código, variables, funciones, etc.)
// ...

// AL FINAL de tu archivo app.js, añade o asegúrate de que existen estas exportaciones globales:

// Función para que el invitado muestre la animación de "lanzando"
function showDiceRollingAnimation() {
    const modalDiceContainer = document.getElementById('modal-dice-container');
    modalDiceContainer.innerHTML = '<h2>Lanzando dados...</h2>';
    openDiceModal();
}

// Función centralizada para actualizar toda la UI desde el gameState
function updateUIFromGameState() {
    updatePlayerList();
    updateChallengeList();
    updateDeactivatedChallengeList();
    updateCurrentChallengeDisplay();
    updatePlayerLevels();
    updateRoundsLog();
    
    // También actualiza el estado de los botones y la información del juego
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

// --- Exportaciones globales para connection.js ---
window.gameState = gameState;

// Funciones que modifican el estado
window.addPlayer = addPlayer;
window.deletePlayer = deletePlayer;
window.togglePlayerActive = togglePlayerActive;
window.addChallenge = addChallenge;
window.deleteChallenge = deleteChallenge;
window.toggleChallengeActive = toggleChallengeActive;
window.updateChallenge = updateChallenge;
window.startGame = startGame;
window.resetGame = resetGame;
window.rollDice = rollDice;
window.showDiceResult = showDiceResult; // importante para sincronizar resultados

// Funciones que actualizan la UI
window.updateUIFromGameState = updateUIFromGameState;
window.showDiceRollingAnimation = showDiceRollingAnimation;