// Game state variables
const gameState = {
    gameTitle: "Juego de Dados y Pruebas",
    players: [],
    challenges: [],
    currentChallengeIndex: 0,
    roundNumber: 0,
    minRoll: null,
    minRollPlayer: null,
    isGameStarted: false,
    roundsLogData: [],
    isDarkMode: false,
    currentLanguage: 'es'
};

// Language translations
const translations = {
    es: {
        gameTitle: "Juego de Dados y Pruebas",
        playersTitle: "Jugadores",
        challengesTitle: "Pruebas",
        gameStatusTitle: "Estado del Juego",
        addPlayer: "Añadir Jugador",
        addChallenge: "Añadir Prueba",
        startGame: "Comenzar Juego",
        rollDice: "Lanzar Dados",
        resultsTitle: "Resultados",
        currentChallengeLabel: "Prueba Actual:",
        playerNamePlaceholder: "Nombre del jugador",
        challengeNamePlaceholder: "Nombre de la prueba",
        challengeDescriptionPlaceholder: "Descripción de la prueba",
        footerText: "Juego de Dados y Pruebas 2025 ",
        deleteBtn: "Eliminar",
        winner: "¡Ganador!",
        nextLevel: "Avanza al siguiente nivel",
        gameOver: "¡Juego Terminado! ",
        noPlayers: "Agregue al menos un jugador para comenzar",
        noChallenges: "Agregue al menos una prueba para comenzar",
        saveGame: "Guardar partida",
        saveGameTitle: "Guardar Partida",
        saveFilenamePlaceholder: "nombre-partida",
        saveButton: "Guardar",
        cancelButton: "Cancelar",
        saveGamePrompt: "Introduce un nombre para el archivo de guardado:",
        resetGameData: "Vaciar Datos",
        resetGameConfirmation: "¿Estás seguro de que quieres reiniciar el juego? Se mantendrán los jugadores y las pruebas, pero se reiniciarán las tiradas.",
        loadGame: "Cargar Partida",
        resetData: "Vaciar Datos",
        importChallenges: "Importar pruebas",
        importTitle: "Importar Pruebas",
        importInstructions: "Pega la lista de pruebas o sube un archivo.",
        saveList: "Guardar lista",
        saveListTitle: "Guardar Lista de Pruebas",
        saveListInstructions: "Copia esta lista de pruebas o guárdala en un archivo de texto.",
        copyText: "Copiar Texto",
        importFile: "Importar desde archivo",
        pasteText: "Pegar texto",
        noChallengesToSave: "No hay pruebas para guardar.",
        diceInfo: "Información de la Tirada",
        diceDetails: "Detalles de la tirada para: ",
        lowestRollsHeader: "Tirada más baja:",
        historyHeader: "Historial de tiradas:",
        close: "Cerrar",
        autoCloseModal: "Cerrar ventana de tiradas automáticamente",
        lowestRoll: "Tirada más baja",
        isEliminated: "Eliminado",
        roundsLogTitle: "Registro de Rondas",
        loading: "Cargando..."
    },
    en: {
        gameTitle: "Dice and Challenge Game",
        playersTitle: "Players",
        challengesTitle: "Challenges",
        gameStatusTitle: "Game Status",
        addPlayer: "Add Player",
        addChallenge: "Add Challenge",
        startGame: "Start Game",
        rollDice: "Roll Dice",
        resultsTitle: "Results",
        currentChallengeLabel: "Current Challenge:",
        playerNamePlaceholder: "Player name",
        challengeNamePlaceholder: "Challenge name",
        challengeDescriptionPlaceholder: "Challenge description",
        footerText: "Dice and Challenge Game 2025 ",
        deleteBtn: "Delete",
        winner: "Winner!",
        nextLevel: "Advance to next level",
        gameOver: "Game Over! ",
        noPlayers: "Add at least one player to start",
        noChallenges: "Add at least one challenge to start",
        saveGame: "Save Game",
        saveGameTitle: "Save Game",
        saveFilenamePlaceholder: "game-name",
        saveButton: "Save",
        cancelButton: "Cancel",
        saveGamePrompt: "Enter a name for the save file:",
        resetGameData: "Reset Data",
        resetGameConfirmation: "Are you sure you want to reset the game? Players and challenges will be kept, but rolls will be reset.",
        loadGame: "Load Game",
        resetData: "Reset Data",
        importChallenges: "Import challenges",
        importTitle: "Import Challenges",
        importInstructions: "Paste the list of challenges or upload a file.",
        saveList: "Save list",
        saveListTitle: "Save Challenge List",
        saveListInstructions: "Copy this challenge list or save it to a text file.",
        copyText: "Copy Text",
        importFile: "Import from file",
        pasteText: "Paste text",
        noChallengesToSave: "No challenges to save.",
        diceInfo: "Roll Info",
        diceDetails: "Roll details for: ",
        lowestRollsHeader: "Lowest roll:",
        historyHeader: "Roll history:",
        close: "Close",
        autoCloseModal: "Auto close dice modal",
        lowestRoll: "Lowest Roll",
        isEliminated: "Eliminated",
        roundsLogTitle: "Rounds Log",
        loading: "Loading..."
    }
};

const diceFaces = [
    '&#9856;', '&#9857;', '&#9858;', '&#9859;', '&#9860;', '&#9861;'
];

const playerList = document.getElementById('player-list');
const challengeList = document.getElementById('challenge-list');
const gameStatus = document.getElementById('game-status');
const playerInput = document.getElementById('player-name-input');
const addPlayerBtn = document.getElementById('add-player-btn');
const challengeNameInput = document.getElementById('challenge-name-input');
const challengeDescriptionInput = document.getElementById('challenge-description-input');
const addChallengeBtn = document.getElementById('add-challenge-btn');
const startGameBtn = document.getElementById('start-game-btn');
const rollDiceBtn = document.getElementById('roll-dice-btn');
const currentChallengeDisplay = document.getElementById('current-challenge-display');
const currentChallengeLabel = document.getElementById('current-challenge-label');
const resultsLog = document.getElementById('results-log');
const languageToggle = document.getElementById('language-toggle');
const themeToggle = document.getElementById('theme-toggle');
const saveGameBtn = document.getElementById('save-game-btn');
const loadGameBtn = document.getElementById('load-game-btn');
const resetGameBtn = document.getElementById('reset-game-btn');
const saveGameModal = document.getElementById('save-game-modal');
const saveFileNameInput = document.getElementById('save-filename-input');
const saveButton = document.getElementById('save-button');
const cancelSaveButton = document.getElementById('cancel-save-button');
const loadGameModal = document.getElementById('load-game-modal');
const loadFileInput = document.getElementById('load-file-input');
const loadButton = document.getElementById('load-button');
const cancelLoadButton = document.getElementById('cancel-load-button');
const importModal = document.getElementById('import-modal');
const importChallengesBtn = document.getElementById('import-challenges-btn');
const importFromFileBtn = document.getElementById('load-from-file-btn');
const importFromTextBtn = document.getElementById('load-from-text-btn');
const cancelImportBtn = document.getElementById('cancel-load-list-btn');
const pasteTextArea = document.getElementById('paste-text-area');
const pastedTextInput = document.getElementById('pasted-text');
const clearPastedTextBtn = document.getElementById('clear-paste-text-btn');
const pasteClipboardBtn = document.getElementById('paste-clipboard-text-btn');
const confirmPasteBtn = document.getElementById('confirm-paste-btn');
const saveListModal = document.getElementById('save-list-modal');
const saveListBtn = document.getElementById('save-list-btn');
const saveListTextarea = document.getElementById('save-list-text-area');
const copyListTextBtn = document.getElementById('copy-list-text-btn');
const cancelSaveListBtn = document.getElementById('cancel-save-list-btn');
const diceModal = document.getElementById('dice-modal');
const modalDiceContainer = document.getElementById('modal-dice-container');
const closeDiceModalBtn = document.getElementById('close-dice-modal');
const modalPlayerName = document.getElementById('modal-player-name');
const modalLowestRoll = document.getElementById('modal-lowest-roll');
const modalRollHistory = document.getElementById('modal-roll-history');
const modalTitle = document.getElementById('modal-title');
const autoCloseModalCheckbox = document.getElementById('auto-close-modal-checkbox');
const autoCloseTimerContainer = document.getElementById('auto-close-timer-container');
const autoCloseTimerText = document.getElementById('auto-close-timer-text');
const gameTitleInput = document.getElementById('game-title-input');
const editTitleBtn = document.getElementById('edit-title-btn');
const saveTitleBtn = document.getElementById('save-title-btn');

let autoCloseTimer = null;
let connectionState = window.connectionState || { role: 'host' };

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    loadChallengesFromLocalStorage();
    renderPlayers();
    renderChallenges();
    updateGameStatus();
    updateCurrentChallengeDisplay();
    updateTextBasedOnLanguage();
    applyTheme(gameState.isDarkMode);
    renderRoundsLog();

    if (connectionState.role === 'guest') {
        makePageReadOnly();
    }
});

function updateTextBasedOnLanguage() {
    const lang = gameState.currentLanguage;
    document.getElementById('game-title').textContent = translations[lang].gameTitle;
    document.getElementById('players-title').textContent = translations[lang].playersTitle;
    document.getElementById('challenges-title').textContent = translations[lang].challengesTitle;
    document.getElementById('game-status-title').textContent = translations[lang].gameStatusTitle;
    document.getElementById('add-player-btn').textContent = translations[lang].addPlayer;
    document.getElementById('add-challenge-btn').textContent = translations[lang].addChallenge;
    document.getElementById('start-game-btn').textContent = translations[lang].startGame;
    document.getElementById('roll-dice-btn').textContent = translations[lang].rollDice;
    document.getElementById('results-title').textContent = translations[lang].resultsTitle;
    document.getElementById('current-challenge-label').textContent = translations[lang].currentChallengeLabel;
    document.getElementById('player-name-input').placeholder = translations[lang].playerNamePlaceholder;
    document.getElementById('challenge-name-input').placeholder = translations[lang].challengeNamePlaceholder;
    document.getElementById('challenge-description-input').placeholder = translations[lang].challengeDescriptionPlaceholder;
    document.getElementById('footer-text').innerHTML = `${translations[lang].footerText} &copy; ${new Date().getFullYear()}`;
    document.getElementById('save-game-btn').textContent = translations[lang].saveGame;
    document.getElementById('load-game-btn').textContent = translations[lang].loadGame;
    document.getElementById('reset-game-btn').textContent = translations[lang].resetData;
    document.getElementById('import-challenges-btn').textContent = translations[lang].importChallenges;
    document.getElementById('save-list-btn').textContent = translations[lang].saveList;
    document.getElementById('import-title').textContent = translations[lang].importTitle;
    document.getElementById('import-instructions').textContent = translations[lang].importInstructions;
    document.getElementById('save-list-title').textContent = translations[lang].saveListTitle;
    document.getElementById('save-list-instructions').textContent = translations[lang].saveListInstructions;
    document.getElementById('copy-list-text-btn').textContent = translations[lang].copyText;
    document.getElementById('cancel-save-list-btn').textContent = translations[lang].cancelButton;
    document.getElementById('load-from-file-btn').textContent = translations[lang].importFile;
    document.getElementById('load-from-text-btn').textContent = translations[lang].pasteText;
    document.getElementById('cancel-load-list-btn').textContent = translations[lang].cancelButton;
    document.getElementById('close-dice-modal').textContent = translations[lang].close;
    document.getElementById('auto-close-modal-label').textContent = translations[lang].autoCloseModal;
    document.getElementById('rounds-log-title').textContent = translations[lang].roundsLogTitle;
}

// Function to apply theme
function applyTheme(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`;
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-toggle').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" class="moon-icon"></path><circle cx="12" cy="12" r="5" class="sun-icon"></circle><line x1="12" y1="1" x2="12" y2="3" class="sun-icon"></line><line x1="12" y1="21" x2="12" y2="23" class="sun-icon"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" class="sun-icon"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" class="sun-icon"></line><line x1="1" y1="12" x2="3" y2="12" class="sun-icon"></line><line x1="21" y1="12" x2="23" y2="12" class="sun-icon"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" class="sun-icon"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" class="sun-icon"></line></svg>`;
    }
}

// Function to update the entire game state based on host's data
function updateGameFromHostData(hostGameState) {
    console.log("Updating game state from host:", hostGameState);

    // Update the local game state with the received state
    Object.assign(gameState, hostGameState);

    // Call the rendering functions to refresh the UI
    renderPlayers();
    renderChallenges();
    updateCurrentChallengeDisplay();
    renderRoundsLog();
    updateGameStatus();
    renderPlayerLevels();

    // Reapply theme and language in case they were changed by the host
    applyTheme(gameState.isDarkMode);
    setLanguage(gameState.currentLanguage);
}
window.updateGameFromHostData = updateGameFromHostData; // Make it a global function

// Function to make the page read-only for guests
function makePageReadOnly() {
    const hostOnlyElements = document.querySelectorAll('.host-only');
    hostOnlyElements.forEach(el => el.style.display = 'none');
    
    // Disable inputs and buttons that guests shouldn't use
    const inputs = document.querySelectorAll('input, button, textarea');
    inputs.forEach(input => {
        if (!input.classList.contains('exit-game-btn') && !input.classList.contains('theme-toggle') && !input.classList.contains('language-toggle')) {
             input.disabled = true;
        }
    });

    document.getElementById('game-title-input').disabled = true;
    document.getElementById('edit-title-btn').style.display = 'none';
    document.getElementById('save-title-btn').style.display = 'none';
    document.getElementById('connection-status').style.display = 'block';
}

function updateGameTitle() {
    const title = gameTitleInput.value;
    if (title.trim() !== '') {
        gameState.gameTitle = title;
        document.getElementById('game-title').textContent = title;
        toggleTitleEdit();
        
        // Broadcast the updated state
        if (window.connectionState.role === 'host' && window.broadcastGameState) {
            window.broadcastGameState(gameState);
        }
    } else {
        showError('Por favor, introduce un título válido.');
    }
}

function toggleTitleEdit() {
    const titleDisplay = document.getElementById('game-title');
    const titleInput = document.getElementById('game-title-input');
    const editBtn = document.getElementById('edit-title-btn');
    const saveBtn = document.getElementById('save-title-btn');

    const isEditing = titleInput.style.display === 'block';

    if (isEditing) {
        titleDisplay.style.display = 'block';
        titleInput.style.display = 'none';
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
    } else {
        titleDisplay.style.display = 'none';
        titleInput.style.display = 'block';
        titleInput.value = gameState.gameTitle;
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
    }
}

function setLanguage(lang) {
    gameState.currentLanguage = lang;
    updateTextBasedOnLanguage();
}

function toggleLanguage() {
    gameState.currentLanguage = gameState.currentLanguage === 'es' ? 'en' : 'es';
    setLanguage(gameState.currentLanguage);
    
    // Broadcast the updated state
    if (window.connectionState.role === 'host' && window.broadcastGameState) {
        window.broadcastGameState(gameState);
    }
}

// Function to toggle between light and dark mode
function toggleTheme() {
    gameState.isDarkMode = !gameState.isDarkMode;
    applyTheme(gameState.isDarkMode);
    
    // Broadcast the updated state
    if (window.connectionState.role === 'host' && window.broadcastGameState) {
        window.broadcastGameState(gameState);
    }
}

// Function to handle dice roll and update game state
function handleDiceRoll() {
    if (!gameState.isGameStarted) {
        showError(translations[gameState.currentLanguage].noPlayers);
        return;
    }
    
    // Reset rolls for the new round
    gameState.minRoll = null;
    gameState.minRollPlayer = null;

    // Filter out eliminated players
    const activePlayers = gameState.players.filter(p => !p.eliminated);
    
    if (activePlayers.length === 0) {
        showError(translations[gameState.currentLanguage].gameOver);
        return;
    }

    const currentRoundRolls = [];

    activePlayers.forEach(player => {
        const roll = Math.floor(Math.random() * 6) + 1;
        player.lastDiceRoll = roll;
        player.diceRollsHistory.push(roll);
        player.totalRolls += 1;
        currentRoundRolls.push({ name: player.name, roll: roll });

        if (gameState.minRoll === null || roll < gameState.minRoll) {
            gameState.minRoll = roll;
            gameState.minRollPlayer = player;
        } else if (roll === gameState.minRoll) {
            gameState.minRollPlayer = null;
        }
    });

    if (gameState.minRollPlayer) {
        gameState.minRollPlayer.lowestRolls += 1;
        gameState.minRollPlayer.eliminated = true;
    }
    
    // Log the round results
    const roundResult = {
        round: gameState.roundNumber + 1,
        challenge: gameState.challenges[gameState.currentChallengeIndex] || { name: translations[gameState.currentLanguage].noChallenges, description: '' },
        diceResult: generateDiceHtml(currentRoundRolls),
        minRoll: gameState.minRoll,
        loser: gameState.minRollPlayer ? gameState.minRollPlayer.name : null
    };
    gameState.roundsLogData.push(roundResult);
    renderRoundsLog();

    // Move to the next challenge
    gameState.currentChallengeIndex++;
    if (gameState.currentChallengeIndex >= gameState.challenges.length) {
        gameState.currentChallengeIndex = 0;
    }
    gameState.roundNumber++;

    renderPlayers();
    renderChallenges();
    updateGameStatus();
    updateCurrentChallengeDisplay();
    
    showLastDiceResult();

    // Broadcast the updated state
    if (window.connectionState.role === 'host' && window.broadcastGameState) {
        window.broadcastGameState(gameState);
    }
}

// Function to update the game status message
function updateGameStatus() {
    const lang = gameState.currentLanguage;
    const activePlayersCount = gameState.players.filter(p => !p.eliminated).length;
    const totalPlayersCount = gameState.players.length;

    if (gameState.isGameStarted) {
        if (activePlayersCount === 0) {
            gameStatus.innerHTML = `<span class="game-over">${translations[lang].gameOver}</span>`;
            
            // Broadcast the updated state
            if (window.connectionState.role === 'host' && window.broadcastGameState) {
                window.broadcastGameState(gameState);
            }
        } else if (activePlayersCount === 1) {
            const winner = gameState.players.find(p => !p.eliminated);
            gameStatus.innerHTML = `<span class="winner">${translations[lang].winner} ${winner.name}!</span>`;
            
            // Broadcast the updated state
            if (window.connectionState.role === 'host' && window.broadcastGameState) {
                window.broadcastGameState(gameState);
            }
        } else {
            gameStatus.textContent = `${activePlayersCount} de ${totalPlayersCount} jugadores en la partida. Ronda #${gameState.roundNumber + 1}.`;
        }
    } else {
        gameStatus.textContent = translations[lang].noPlayers;
    }
}

// Function to render players on the list
function renderPlayers() {
    playerList.innerHTML = '';
    const sortedPlayers = [...gameState.players].sort((a, b) => {
        if (a.level !== b.level) {
            return b.level - a.level; // Sort by level descending
        }
        return a.name.localeCompare(b.name); // Sort by name ascending
    });

    sortedPlayers.forEach(player => {
        const li = document.createElement('li');
        li.classList.add('player-list-item');
        if (player.eliminated) {
            li.classList.add('eliminated');
        }

        const nameSpan = document.createElement('span');
        nameSpan.classList.add('player-name');
        nameSpan.textContent = player.name;

        const infoSpan = document.createElement('span');
        infoSpan.classList.add('player-info');

        const levelSpan = document.createElement('span');
        levelSpan.classList.add('player-level');
        levelSpan.textContent = `Nivel ${player.level}`;

        const rollsSpan = document.createElement('span');
        rollsSpan.classList.add('player-rolls');
        rollsSpan.textContent = `Tiradas: ${player.totalRolls}`;

        const lowestRollsSpan = document.createElement('span');
        lowestRollsSpan.classList.add('player-lowest-rolls');
        lowestRollsSpan.textContent = `Tiradas más bajas: ${player.lowestRolls}`;
        
        infoSpan.appendChild(levelSpan);
        infoSpan.appendChild(rollsSpan);
        infoSpan.appendChild(lowestRollsSpan);

        if (player.eliminated) {
            const eliminatedSpan = document.createElement('span');
            eliminatedSpan.classList.add('player-status');
            eliminatedSpan.textContent = `(${translations[gameState.currentLanguage].isEliminated})`;
            infoSpan.appendChild(eliminatedSpan);
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn', 'host-only');
        deleteBtn.textContent = translations[gameState.currentLanguage].deleteBtn;
        deleteBtn.addEventListener('click', () => {
            if (confirm(`¿Estás seguro de que quieres eliminar a ${player.name}?`)) {
                removePlayer(player.name);
            }
        });

        li.appendChild(nameSpan);
        li.appendChild(infoSpan);
        li.appendChild(deleteBtn);

        playerList.appendChild(li);
    });
}

function renderPlayerLevels() {
    const playerLevelElements = document.querySelectorAll('.player-level');
    playerLevelElements.forEach(el => {
        const playerName = el.parentElement.parentElement.querySelector('.player-name').textContent;
        const player = gameState.players.find(p => p.name === playerName);
        if (player) {
            el.textContent = `Nivel ${player.level}`;
        }
    });
}

// Function to render challenges on the list
function renderChallenges() {
    challengeList.innerHTML = '';
    gameState.challenges.forEach((challenge, index) => {
        const li = document.createElement('li');
        li.classList.add('challenge-list-item');
        if (index === gameState.currentChallengeIndex && gameState.isGameStarted) {
            li.classList.add('current');
        }

        const challengeName = document.createElement('div');
        challengeName.classList.add('challenge-name');
        challengeName.textContent = challenge.name;

        const descriptionBtn = document.createElement('button');
        descriptionBtn.classList.add('challenge-description-btn');
        descriptionBtn.innerHTML = `ⓘ`;
        descriptionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleChallengeDescription(li);
        });

        const descriptionText = document.createElement('div');
        descriptionText.classList.add('challenge-description-text');
        descriptionText.textContent = challenge.description || 'Sin descripción.';

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn', 'host-only');
        deleteBtn.textContent = translations[gameState.currentLanguage].deleteBtn;
        deleteBtn.addEventListener('click', () => {
            if (confirm(`¿Estás seguro de que quieres eliminar la prueba "${challenge.name}"?`)) {
                removeChallenge(index);
            }
        });

        li.appendChild(challengeName);
        li.appendChild(descriptionBtn);
        li.appendChild(descriptionText);
        li.appendChild(deleteBtn);
        challengeList.appendChild(li);
    });

    if (window.connectionState.role === 'host') {
        new Sortable(challengeList, {
            animation: 150,
            onEnd: (evt) => {
                const [movedItem] = gameState.challenges.splice(evt.oldIndex, 1);
                gameState.challenges.splice(evt.newIndex, 0, movedItem);
                
                // Broadcast the updated state
                if (window.broadcastGameState) {
                    window.broadcastGameState(gameState);
                }
            }
        });
    }
}

function toggleChallengeDescription(li) {
    li.classList.toggle('description-expanded');
}

// Function to render the rounds log
function renderRoundsLog() {
    resultsLog.innerHTML = '';
    gameState.roundsLogData.forEach(round => {
        const li = document.createElement('li');
        li.classList.add('result-log-item');

        const header = document.createElement('div');
        header.classList.add('result-header');
        header.innerHTML = `Ronda #${round.round}: ${round.challenge.name}`;

        const resultBody = document.createElement('div');
        resultBody.classList.add('result-body');
        resultBody.innerHTML = round.diceResult;

        li.appendChild(header);
        li.appendChild(resultBody);
        
        resultsLog.prepend(li); // Add to the top of the list
    });
}

function updateCurrentChallengeDisplay() {
    if (gameState.challenges.length > 0 && gameState.isGameStarted) {
        currentChallengeDisplay.textContent = gameState.challenges[gameState.currentChallengeIndex].name;
    } else {
        currentChallengeDisplay.textContent = '---';
    }
}

// Function to add a player to the game
function addPlayerToList(name) {
    if (name.trim() === '') {
        showError('Por favor, introduce tu nombre');
        return;
    }
    const newPlayer = {
        name: name,
        level: 1,
        eliminated: false,
        totalRolls: 0,
        lowestRolls: 0,
        lastDiceRoll: null,
        diceRollsHistory: []
    };
    gameState.players.push(newPlayer);
    renderPlayers();
    playerInput.value = '';
    
    // Broadcast the updated state
    if (window.connectionState.role === 'host' && window.broadcastGameState) {
        window.broadcastGameState(gameState);
    }
}

// Function to add a challenge to the game
function addChallengeToList(name, description) {
    if (name.trim() === '') {
        showError('Por favor, introduce el nombre de la prueba');
        return;
    }
    gameState.challenges.push({ name, description });
    renderChallenges();
    challengeNameInput.value = '';
    challengeDescriptionInput.value = '';
    
    // Broadcast the updated state
    if (window.connectionState.role === 'host' && window.broadcastGameState) {
        window.broadcastGameState(gameState);
    }
}

// Function to remove a player
function removePlayer(name) {
    gameState.players = gameState.players.filter(player => player.name !== name);
    renderPlayers();
    updateGameStatus();
    
    // Broadcast the updated state
    if (window.connectionState.role === 'host' && window.broadcastGameState) {
        window.broadcastGameState(gameState);
    }
}

// Function to remove a challenge
function removeChallenge(index) {
    gameState.challenges.splice(index, 1);
    renderChallenges();
    updateCurrentChallengeDisplay();
    
    // Broadcast the updated state
    if (window.connectionState.role === 'host' && window.broadcastGameState) {
        window.broadcastGameState(gameState);
    }
}

// Function to generate the dice HTML based on rolls
function generateDiceHtml(rolls) {
    const minRoll = Math.min(...rolls.map(r => r.roll));
    
    return rolls.map(roll => {
        const isLowest = roll.roll === minRoll;
        const className = isLowest ? 'dice lowest-roll' : 'dice';
        return `
            <div class="${className}">
                ${diceFaces[roll.roll - 1]}
                <span class="player-name">${roll.name}</span>
            </div>
        `;
    }).join('');
}

// Function to start the game
function startGame() {
    if (gameState.players.length === 0) {
        showError(translations[gameState.currentLanguage].noPlayers);
        return;
    }
    if (gameState.challenges.length === 0) {
        showError(translations[gameState.currentLanguage].noChallenges);
        return;
    }
    gameState.isGameStarted = true;
    gameState.roundNumber = 0;
    gameState.currentChallengeIndex = 0;
    gameStatus.textContent = `¡Comienza la partida! Ronda #1`;
    startGameBtn.style.display = 'none';
    rollDiceBtn.style.display = 'block';
    
    // Hide add player/challenge buttons
    document.getElementById('add-player-form').style.display = 'none';
    document.getElementById('add-challenge-form').style.display = 'none';
    document.getElementById('import-challenges-btn').style.display = 'none';
    
    renderPlayers();
    renderChallenges();
    updateCurrentChallengeDisplay();
    
    // Broadcast the updated state
    if (window.connectionState.role === 'host' && window.broadcastGameState) {
        window.broadcastGameState(gameState);
    }
}

// Function to show error message in a modal
function showError(message) {
    const errorModal = document.getElementById('error-modal');
    document.getElementById('error-message').textContent = message;
    errorModal.style.display = 'flex';
}

function hideErrorModal() {
    const errorModal = document.getElementById('error-modal');
    errorModal.style.display = 'none';
}

function saveGame() {
    if (window.connectionState.role === 'guest') {
        showError('Solo el anfitrión puede guardar la partida.');
        return;
    }
    saveGameModal.style.display = 'flex';
    document.getElementById('save-filename-input').focus();
}

function handleSaveGame() {
    const filename = saveFileNameInput.value.trim();
    if (filename === '') {
        showError(translations[gameState.currentLanguage].saveGamePrompt);
        return;
    }
    const dataStr = JSON.stringify(gameState, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    saveGameModal.style.display = 'none';
}

function loadGame() {
    if (window.connectionState.role === 'guest') {
        showError('Solo el anfitrión puede cargar una partida.');
        return;
    }
    document.getElementById('load-modal').style.display = 'flex';
}

function handleLoadGame(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const loadedState = JSON.parse(e.target.result);
            Object.assign(gameState, loadedState);
            renderPlayers();
            renderChallenges();
            updateGameStatus();
            updateCurrentChallengeDisplay();
            renderRoundsLog();
            
            if (window.connectionState.role === 'host' && window.broadcastGameState) {
                window.broadcastGameState(gameState);
            }

            document.getElementById('load-modal').style.display = 'none';
            alert('Partida cargada exitosamente.');

        } catch (error) {
            alert('Error al cargar la partida. Asegúrate de que el archivo es un JSON válido.');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

function resetGame() {
    if (window.connectionState.role === 'guest') {
        showError('Solo el anfitrión puede reiniciar la partida.');
        return;
    }

    if (confirm(translations[gameState.currentLanguage].resetGameConfirmation)) {
        gameState.isGameStarted = false;
        gameState.roundNumber = 0;
        gameState.currentChallengeIndex = 0;
        gameState.players.forEach(p => {
            p.level = 1;
            p.eliminated = false;
            p.totalRolls = 0;
            p.lowestRolls = 0;
            p.lastDiceRoll = null;
            p.diceRollsHistory = [];
        });
        gameState.roundsLogData = [];
        
        renderPlayers();
        renderChallenges();
        updateGameStatus();
        updateCurrentChallengeDisplay();
        renderRoundsLog();

        startGameBtn.style.display = 'block';
        rollDiceBtn.style.display = 'none';
        
        // Show add player/challenge buttons
        document.getElementById('add-player-form').style.display = 'block';
        document.getElementById('add-challenge-form').style.display = 'block';
        document.getElementById('import-challenges-btn').style.display = 'block';
        
        // Broadcast the updated state
        if (window.connectionState.role === 'host' && window.broadcastGameState) {
            window.broadcastGameState(gameState);
        }
    }
}

function saveChallengesToLocalStorage() {
    localStorage.setItem('challenges', JSON.stringify(gameState.challenges));
}

function loadChallengesFromLocalStorage() {
    const savedChallenges = localStorage.getItem('challenges');
    if (savedChallenges) {
        gameState.challenges = JSON.parse(savedChallenges);
    }
}

// Function to show the dice roll result in a modal
function showLastDiceResult() {
    if (gameState.roundsLogData.length === 0) {
        return;
    }
    
    const lastRound = gameState.roundsLogData[gameState.roundsLogData.length - 1];
    modalDiceContainer.innerHTML = lastRound.diceResult;

    const diceElements = modalDiceContainer.querySelectorAll('.dice');
    diceElements.forEach(dice => {
        const playerNameDiv = dice.querySelector('.player-name');
        if (playerNameDiv) {
            const playerName = playerNameDiv.textContent;
            const player = gameState.players.find(p => p.name === playerName);
            if (player) {
                dice.addEventListener('click', () => showDicePopup(player));
            }
        }
    });
    
    openDiceModal();
}

function showDicePopup(player) {
    modalTitle.textContent = translations[gameState.currentLanguage].diceInfo;
    modalPlayerName.textContent = translations[gameState.currentLanguage].diceDetails + player.name;
    modalLowestRoll.textContent = translations[gameState.currentLanguage].lowestRollsHeader + ' ' + player.lowestRolls;
    modalRollHistory.innerHTML = `<h3>${translations[gameState.currentLanguage].historyHeader}</h3>` + player.diceRollsHistory.map((roll, index) => `<span>Ronda ${index + 1}: ${diceFaces[roll - 1]} (${roll})</span>`).join('<br>');
    openDiceModal();
}

function openDiceModal() {
    diceModal.style.display = 'flex';
    if (autoCloseModalCheckbox.checked) {
        autoCloseTimerContainer.style.display = 'flex';
        let timeLeft = 10;
        autoCloseTimerText.textContent = timeLeft;
        
        if (autoCloseTimer) {
            clearInterval(autoCloseTimer);
        }
        
        autoCloseTimer = setInterval(() => {
            timeLeft--;
            autoCloseTimerText.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(autoCloseTimer);
                closeDiceModal();
            }
        }, 1000);
    } else {
        autoCloseTimerContainer.style.display = 'none';
    }
}

function closeDiceModal() {
    diceModal.style.display = 'none';
    if (autoCloseTimer) {
        clearInterval(autoCloseTimer);
        autoCloseTimer = null;
    }
}

function showImportModal() {
    if (window.connectionState.role === 'guest') {
        showError('Solo el anfitrión puede importar pruebas.');
        return;
    }
    importModal.style.display = 'flex';
    document.getElementById('load-from-text-btn').style.display = 'block';
    document.getElementById('paste-text-area').style.display = 'none';
    pastedTextInput.value = '';
}

function importFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const challengesFromFile = JSON.parse(e.target.result);
            if (Array.isArray(challengesFromFile)) {
                gameState.challenges = challengesFromFile;
                renderChallenges();
                updateCurrentChallengeDisplay();
                saveChallengesToLocalStorage();
                alert('Pruebas importadas exitosamente.');
                importModal.style.display = 'none';
                
                // Broadcast the updated state
                if (window.connectionState.role === 'host' && window.broadcastGameState) {
                    window.broadcastGameState(gameState);
                }
            } else {
                alert('El archivo no contiene un formato de lista de pruebas válido.');
            }
        } catch (error) {
            alert('Error al leer el archivo. Asegúrate de que es un JSON válido.');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

function showPasteArea() {
    pasteTextArea.style.display = 'block';
}

function loadFromPastedText() {
    try {
        const challengesFromText = JSON.parse(pastedTextInput.value);
        if (Array.isArray(challengesFromText)) {
            gameState.challenges = challengesFromText;
            renderChallenges();
            updateCurrentChallengeDisplay();
            saveChallengesToLocalStorage();
            alert('Pruebas importadas exitosamente.');
            importModal.style.display = 'none';
            
            // Broadcast the updated state
            if (window.connectionState.role === 'host' && window.broadcastGameState) {
                window.broadcastGameState(gameState);
            }
        } else {
            alert('El texto no contiene un formato de lista de pruebas válido.');
        }
    } catch (error) {
        alert('Error al analizar el texto. Asegúrate de que es un JSON válido.');
    }
}

function showSaveListModal() {
    if (gameState.challenges.length === 0) {
        showError(translations[gameState.currentLanguage].noChallengesToSave);
        return;
    }
    const dataStr = JSON.stringify(gameState.challenges, null, 2);
    saveListTextarea.value = dataStr;
    saveListModal.style.display = 'flex';
}

function copyListText() {
    saveListTextarea.select();
    navigator.clipboard.writeText(saveListTextarea.value)
        .then(() => {
            alert('Lista de pruebas copiada al portapapeles!');
        })
        .catch(err => {
            console.error('Error al copiar: ', err);
            alert('Error al copiar la lista. Intenta copiarla manualmente.');
        });
}

function hideSaveListModal() {
    saveListModal.style.display = 'none';
}

function hideImportModal() {
    importModal.style.display = 'none';
}

function clearPastedText() {
    pastedTextInput.value = '';
}

async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        pastedTextInput.value = text;
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
        alert('Error al leer el portapapeles. Asegúrate de que tu navegador permite el acceso al portapapeles.');
    }
}

// Event listeners
addPlayerBtn.addEventListener('click', () => addPlayerToList(playerInput.value));
playerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addPlayerToList(playerInput.value);
    }
});
addChallengeBtn.addEventListener('click', () => addChallengeToList(challengeNameInput.value, challengeDescriptionInput.value));
startGameBtn.addEventListener('click', startGame);
rollDiceBtn.addEventListener('click', handleDiceRoll);
document.getElementById('error-ok-btn').addEventListener('click', hideErrorModal);
document.getElementById('close-error-modal').addEventListener('click', hideErrorModal);
languageToggle.addEventListener('click', toggleLanguage);
themeToggle.addEventListener('click', toggleTheme);
saveGameBtn.addEventListener('click', saveGame);
saveButton.addEventListener('click', handleSaveGame);
cancelSaveButton.addEventListener('click', () => saveGameModal.style.display = 'none');
loadGameBtn.addEventListener('click', loadGame);
loadFileInput.addEventListener('change', handleLoadGame);
cancelLoadButton.addEventListener('click', () => loadGameModal.style.display = 'none');
resetGameBtn.addEventListener('click', resetGame);
closeDiceModalBtn.addEventListener('click', closeDiceModal);
importChallengesBtn.addEventListener('click', showImportModal);
saveListBtn.addEventListener('click', showSaveListModal);
importFromFileBtn.addEventListener('change', importFromFile);
importFromTextBtn.addEventListener('click', showPasteArea);
confirmPasteBtn.addEventListener('click', loadFromPastedText);
cancelImportBtn.addEventListener('click', hideImportModal);
copyListTextBtn.addEventListener('click', copyListText);
cancelSaveListBtn.addEventListener('click', hideSaveListModal);
clearPastedTextBtn.addEventListener('click', clearPastedText);
pasteClipboardBtn.addEventListener('click', pasteFromClipboard);
editTitleBtn.addEventListener('click', toggleTitleEdit);
saveTitleBtn.addEventListener('click', updateGameTitle);
gameTitleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        updateGameTitle();
    }
});