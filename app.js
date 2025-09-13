// 👇 CAMBIO 1: IMPORTAMOS LA FUNCIÓN DE CONNECTION.JS 👇
import { broadcastGameState } from './connection.js';

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
        resetDataConfirmation: "¿Estás seguro de que quieres borrar todos los datos (jugadores y pruebas)?",
        language: "Idioma",
        spanish: "Español",
        english: "English",
        showLastResult: "Mostrar última tirada"
    },
    en: {
        gameTitle: "Dice and Challenges Game",
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
        footerText: "Dice and Challenges Game 2025 ",
        deleteBtn: "Delete",
        winner: "Winner!",
        nextLevel: "Advance to the next level",
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
        resetData: "Clear Data",
        resetDataConfirmation: "Are you sure you want to delete all data (players and challenges)?",
        language: "Language",
        spanish: "Español",
        english: "English",
        showLastResult: "Show last result"
    }
};

let currentLanguage = 'es';

// DOM Elements
const playerNameInput = document.getElementById('player-name-input');
const addPlayerBtn = document.getElementById('add-player-btn');
const playerList = document.getElementById('player-list');

const challengeNameInput = document.getElementById('challenge-name-input');
const challengeDescriptionInput = document.getElementById('challenge-description-input');
const addChallengeBtn = document.getElementById('add-challenge-btn');
const challengeList = document.getElementById('challenge-list');
const deactivatedChallengeList = document.getElementById('deactivated-challenge-list');

const startGameBtn = document.getElementById('start-game-btn');
const rollDiceBtn = document.getElementById('roll-dice-btn');
const gameInfo = document.getElementById('game-info');
const currentChallengeSpan = document.getElementById('current-challenge');
const playerLevelsDiv = document.getElementById('player-levels');
const roundsLog = document.getElementById('rounds-log');

const diceModal = document.getElementById('dice-modal');
const modalDiceContainer = document.getElementById('modal-dice-container');
const closeDiceModalBtn = document.getElementById('close-dice-modal');
const diceMaxValueInput = document.getElementById('dice-max-value');
const allowDuplicateRollsCheckbox = document.getElementById('allow-duplicate-rolls-checkbox');

const themeToggle = document.getElementById('theme-toggle');
const saveGameBtn = document.getElementById('save-game-btn');
const loadGameBtn = document.getElementById('load-game-btn');
const resetGameBtn = document.getElementById('reset-game-btn');

const gameTitleInput = document.getElementById('game-title-input');
const gameDescription = document.getElementById('game-description');
const gameInstructions = document.getElementById('game-instructions');
const showLastResultBtn = document.getElementById('show-last-result-btn');

// Load list modal elements
const loadListModal = document.getElementById('load-list-modal');
const loadFromFileBtn = document.getElementById('load-from-file-btn');
const loadFromSimpleListBtn = document.getElementById('load-from-simple-list-btn');
const loadFromTextBtn = document.getElementById('load-from-text-btn');
const cancelLoadListBtn = document.getElementById('cancel-load-list-btn');
const closeLoadListModalBtn = document.getElementById('close-load-list-modal');
const pasteTextArea = document.getElementById('paste-text-area');
const pastedTextInput = document.getElementById('pasted-text');
const clearPasteTextBtn = document.getElementById('clear-paste-text-btn');
const pasteClipboardTextBtn = document.getElementById('paste-clipboard-text-btn');
const confirmPasteBtn = document.getElementById('confirm-paste-btn');

// Autoclose modal elements
const autoCloseModalCheckbox = document.getElementById('auto-close-modal-checkbox');
const autoCloseTimerContainer = document.getElementById('auto-close-timer-container');
const autoCloseTimerInput = document.getElementById('auto-close-timer');

// Game state
let gameState = {
    players: [],
    challenges: [],
    deactivatedChallenges: [],
    gameStarted: false,
    currentChallengeIndex: -1,
    currentRound: 0,
    roundsLogData: [], // Store data for re-rendering
    lastDiceResultHTML: ''
};

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLanguage);
    loadGameState();
    initializeSortableLists();
    setupEventListeners();
});

function setupEventListeners() {
    addPlayerBtn.addEventListener('click', addPlayer);
    addChallengeBtn.addEventListener('click', addChallenge);
    startGameBtn.addEventListener('click', startGame);
    rollDiceBtn.addEventListener('click', rollDice);
    closeDiceModalBtn.addEventListener('click', closeDiceModal);
    themeToggle.addEventListener('click', toggleTheme);
    saveGameBtn.addEventListener('click', saveGame);
    loadGameBtn.addEventListener('click', loadGame);
    resetGameBtn.addEventListener('click', confirmResetGame);
    showLastResultBtn.addEventListener('click', showLastDiceResult);
    
    // Toggle section visibility
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.dataset.target;
            const targetBody = document.getElementById(targetId);
            if (targetBody) {
                const isVisible = targetBody.style.display !== 'none';
                targetBody.style.display = isVisible ? 'none' : 'block';
                e.target.textContent = isVisible ? '+' : '-';
            }
        });
    });

    // Auto-close modal functionality
    autoCloseModalCheckbox.addEventListener('change', () => {
        autoCloseTimerContainer.style.display = autoCloseModalCheckbox.checked ? 'flex' : 'none';
    });

    // Load list modal event listeners
    addChallengeBtn.addEventListener('click', () => {
        const challengeName = challengeNameInput.value.trim();
        const challengeDescription = challengeDescriptionInput.value.trim();
        if (!challengeName && !challengeDescription) {
            loadListModal.style.display = 'flex';
        } else {
            addChallenge();
        }
    });

    closeLoadListModalBtn.addEventListener('click', () => loadListModal.style.display = 'none');
    cancelLoadListBtn.addEventListener('click', () => loadListModal.style.display = 'none');
    loadFromFileBtn.addEventListener('click', loadChallengesFromFile);
    loadFromSimpleListBtn.addEventListener('click', loadChallengesFromSimpleList);
    loadFromTextBtn.addEventListener('click', () => {
        pasteTextArea.style.display = 'block';
    });
    
    clearPasteTextBtn.addEventListener('click', clearPastedText);
    pasteClipboardTextBtn.addEventListener('click', pasteFromClipboard);
    confirmPasteBtn.addEventListener('click', () => {
        loadChallengesFromText(pastedTextInput.value);
        loadListModal.style.display = 'none';
        pasteTextArea.style.display = 'none';
    });
}


function setLanguage(lang) {
    currentLanguage = lang;
    const t = translations[lang];
    document.querySelectorAll('[id]').forEach(element => {
        const key = element.id.replace(/-([a-z])/g, g => g[1].toUpperCase());
        if (t[key]) {
            if (element.placeholder) {
                element.placeholder = t[key];
            } else {
                element.textContent = t[key];
            }
        }
    });
}

// Player functions
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
        broadcastGameState(); // <--- NOTIFY CHANGE
    }
}

function deletePlayer(playerId) {
    gameState.players = gameState.players.filter(p => p.id !== playerId);
    updatePlayerList();
    saveGameState();
    broadcastGameState(); // <--- NOTIFY CHANGE
}

function togglePlayerActive(playerId) {
    const player = gameState.players.find(p => p.id === playerId);
    if (player) {
        player.active = !player.active;
    }
    updatePlayerList();
    saveGameState();
    broadcastGameState(); // <--- NOTIFY CHANGE
}

// Challenge functions
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
        broadcastGameState(); // <--- NOTIFY CHANGE
    }
}

function deleteChallenge(challengeId) {
    gameState.challenges = gameState.challenges.filter(c => c.id !== challengeId);
    updateChallengeList();
    saveGameState();
    broadcastGameState(); // <--- NOTIFY CHANGE
}

function toggleChallengeActive(challengeId, isDeactivatedList = false) {
    let challenge;
    if (isDeactivatedList) {
        challenge = gameState.deactivatedChallenges.find(c => c.id === challengeId);
        if (challenge) {
            gameState.deactivatedChallenges = gameState.deactivatedChallenges.filter(c => c.id !== challengeId);
            gameState.challenges.push(challenge);
        }
    } else {
        challenge = gameState.challenges.find(c => c.id === challengeId);
        if (challenge) {
            gameState.challenges = gameState.challenges.filter(c => c.id !== challengeId);
            gameState.deactivatedChallenges.push(challenge);
        }
    }
    updateChallengeList();
    updateDeactivatedChallengeList();
    saveGameState();
    broadcastGameState(); // <--- NOTIFY CHANGE
}

function updateChallenge(challengeId, newName, newDescription) {
    const challenge = gameState.challenges.find(c => c.id === challengeId) || gameState.deactivatedChallenges.find(c => c.id === challengeId);
    if (challenge) {
        challenge.name = newName;
        challenge.description = newDescription;
    }
    updateChallengeList();
    updateDeactivatedChallengeList();
    saveGameState();
    broadcastGameState(); // <--- NOTIFY CHANGE
}


// Game flow functions
function startGame() {
    if (gameState.players.filter(p => p.active).length === 0) {
        alert(translations[currentLanguage].noPlayers);
        return;
    }
    if (gameState.challenges.length === 0) {
        alert(translations[currentLanguage].noChallenges);
        return;
    }

    gameState.gameStarted = true;
    gameState.currentChallengeIndex = 0;
    gameState.currentRound = 1;
    gameState.players.forEach(p => p.level = 0);

    gameInfo.style.display = 'block';
    startGameBtn.style.display = 'none';
    rollDiceBtn.disabled = false;

    updateCurrentChallengeDisplay();
    updatePlayerLevels();
    saveGameState();
    broadcastGameState(); // <--- NOTIFY CHANGE
}

function rollDice() {
    const activePlayers = gameState.players.filter(p => p.active && !p.eliminated);
    if (activePlayers.length === 0) {
        return;
    }

    const max = parseInt(diceMaxValueInput.value, 10);
    const allowDuplicates = allowDuplicateRollsCheckbox.checked;
    let rolls = [];

    // Generate unique rolls if duplicates are not allowed
    if (!allowDuplicates) {
        if (activePlayers.length > max) {
            alert("No se pueden obtener tiradas únicas para más jugadores que caras del dado.");
            return;
        }
        let availableNumbers = Array.from({ length: max }, (_, i) => i + 1);
        for (let i = 0; i < activePlayers.length; i++) {
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            rolls.push(availableNumbers.splice(randomIndex, 1)[0]);
        }
    } else {
        // Generate rolls with possible duplicates
        for (let i = 0; i < activePlayers.length; i++) {
            rolls.push(Math.floor(Math.random() * max) + 1);
        }
    }

    // Assign rolls to players
    activePlayers.forEach((player, index) => {
        player.lastRoll = rolls[index];
    });

    showDiceResult(activePlayers);
    saveGameState();
    broadcastGameState(); // <--- NOTIFY CHANGE
}

function confirmResetGame() {
    if (confirm(translations[currentLanguage].resetDataConfirmation)) {
        resetGame();
    }
}

function resetGame() {
    gameState = {
        players: [],
        challenges: [],
        deactivatedChallenges: [],
        gameStarted: false,
        currentChallengeIndex: -1,
        currentRound: 0,
        roundsLogData: [],
        lastDiceResultHTML: ''
    };
    
    updateAllLists();
    gameInfo.style.display = 'none';
    startGameBtn.style.display = 'block';
    rollDiceBtn.disabled = true;
    roundsLog.innerHTML = '';
    
    localStorage.removeItem('diceGameState');
    broadcastGameState(); // <--- NOTIFY CHANGE
}


// UI Update functions
function updatePlayerList() {
    playerList.innerHTML = '';
    gameState.players.forEach(player => {
        const li = document.createElement('li');
        li.className = 'player-list-item';
        li.dataset.id = player.id;
        li.innerHTML = `
            <span class="player-name ${!player.active ? 'inactive' : ''}">${player.name}</span>
            <div class="item-controls">
                <button class="toggle-active-btn">${player.active ? 'Desactivar' : 'Activar'}</button>
                <button class="delete-btn">Eliminar</button>
            </div>
        `;
        li.querySelector('.delete-btn').addEventListener('click', () => deletePlayer(player.id));
        li.querySelector('.toggle-active-btn').addEventListener('click', () => togglePlayerActive(player.id));
        playerList.appendChild(li);
    });
}

function updateChallengeList() {
    challengeList.innerHTML = '';
    gameState.challenges.forEach(c => {
        challengeList.appendChild(createChallengeListItem(c, false));
    });
}

function updateDeactivatedChallengeList() {
    deactivatedChallengeList.innerHTML = '';
    gameState.deactivatedChallenges.forEach(c => {
        deactivatedChallengeList.appendChild(createChallengeListItem(c, true));
    });
}

function createChallengeListItem(challenge, isDeactivated) {
    const li = document.createElement('li');
    li.className = 'challenge-list-item';
    li.dataset.id = challenge.id;
    li.innerHTML = `
        <div class="challenge-content">
            <span class="challenge-name">${challenge.name}</span>
            ${challenge.description ? '<button class="challenge-description-btn">?</button>' : ''}
            <div class="item-controls">
                <button class="edit-btn">Editar</button>
                <button class="toggle-active-btn">${isDeactivated ? 'Activar' : 'Desactivar'}</button>
                <button class="delete-btn">Eliminar</button>
            </div>
        </div>
        ${challenge.description ? `<div class="challenge-description-text">${challenge.description}</div>` : ''}
    `;

    // Event Listeners
    li.querySelector('.delete-btn').addEventListener('click', () => {
        if (isDeactivated) {
            gameState.deactivatedChallenges = gameState.deactivatedChallenges.filter(c => c.id !== challenge.id);
            updateDeactivatedChallengeList();
        } else {
            deleteChallenge(challenge.id);
        }
        saveGameState();
    });
    
    li.querySelector('.toggle-active-btn').addEventListener('click', () => toggleChallengeActive(challenge.id, isDeactivated));
    
    const editBtn = li.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => {
        const nameSpan = li.querySelector('.challenge-name');
        const currentName = nameSpan.textContent;
        const currentDescription = challenge.description;

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = currentName;
        nameInput.className = 'edit-challenge-input';

        const descriptionInput = document.createElement('textarea');
        descriptionInput.value = currentDescription;
        descriptionInput.className = 'edit-challenge-input';

        nameSpan.replaceWith(nameInput);
        li.querySelector('.challenge-description-text')?.replaceWith(descriptionInput);

        editBtn.textContent = 'Guardar';
        editBtn.onclick = () => {
            updateChallenge(challenge.id, nameInput.value, descriptionInput.value);
            // Re-render the list to restore structure
            updateChallengeList();
            updateDeactivatedChallengeList();
        };
    });

    if (challenge.description) {
        li.querySelector('.challenge-description-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            const desc = li.querySelector('.challenge-description-text');
            desc.style.display = desc.style.display === 'block' ? 'none' : 'block';
        });
    }

    return li;
}

function updateCurrentChallengeDisplay() {
    if (gameState.gameStarted && gameState.currentChallengeIndex < gameState.challenges.length) {
        currentChallengeSpan.textContent = `Nivel ${gameState.currentChallengeIndex + 1}: ${gameState.challenges[gameState.currentChallengeIndex].name}`;
    } else {
        currentChallengeSpan.textContent = '---';
    }
}

function updatePlayerLevels() {
    playerLevelsDiv.innerHTML = '';
    gameState.players.filter(p => p.active).forEach(player => {
        const playerLevel = document.createElement('p');
        playerLevel.innerHTML = `${player.name}: <strong>Nivel ${player.level}</strong>`;
        playerLevelsDiv.appendChild(playerLevel);
    });
}

function updateRoundsLog() {
    roundsLog.innerHTML = '';
    gameState.roundsLogData.forEach(log => {
        const roundEntry = document.createElement('div');
        roundEntry.className = 'round-entry';
        roundEntry.innerHTML = log.html;
        roundsLog.appendChild(roundEntry);
    });
}


function updateAllLists() {
    updatePlayerList();
    updateChallengeList();
    updateDeactivatedChallengeList();
    updatePlayerLevels();
    updateCurrentChallengeDisplay();
}

// Modal functions
function openDiceModal() {
    diceModal.style.display = 'flex';
}

function closeDiceModal() {
    diceModal.style.display = 'none';
}


function showDiceResult(players) {
    modalDiceContainer.innerHTML = '';
    const sortedPlayers = [...players].sort((a, b) => a.lastRoll - b.lastRoll);

    let diceHtml = '';
    sortedPlayers.forEach((player, index) => {
        let specialClass = '';
        if (index === 0) specialClass = 'lowest-roll';
        if (index === sortedPlayers.length - 1 && sortedPlayers.length > 1) specialClass = 'highest-roll';
        
        diceHtml += `
            <div class="dice ${specialClass}">
                <div class="player-name">${player.name}</div>
                <div class="dice-value">${player.lastRoll}</div>
            </div>
        `;
    });
    modalDiceContainer.innerHTML = diceHtml;
    gameState.lastDiceResultHTML = diceHtml; // Store for "show last result"

    openDiceModal();
    
    // Auto-close logic
    if (autoCloseModalCheckbox.checked) {
        let countdown = parseInt(autoCloseTimerInput.value, 10);
        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'modal-countdown';
        modalDiceContainer.appendChild(timerDisplay);

        const interval = setInterval(() => {
            timerDisplay.textContent = `Cerrando en ${countdown}...`;
            countdown--;
            if (countdown < 0) {
                clearInterval(interval);
                closeDiceModal();
            }
        }, 1000);
    }

    // Process game logic
    const lowestRollPlayer = sortedPlayers[0];
    if (lowestRollPlayer) {
        lowestRollPlayer.level++;
        if (lowestRollPlayer.level >= gameState.challenges.length) {
            // Player wins
            setTimeout(() => alert(`${lowestRollPlayer.name} ha ganado el juego!`), 100);
            gameState.gameStarted = false; // Or handle game end differently
        }
    }
    
    if (lowestRollPlayer.level > gameState.currentChallengeIndex) {
        gameState.currentChallengeIndex = lowestRollPlayer.level;
    }
    
    // Log round
    const roundLogEntry = {
        round: gameState.currentRound,
        challenge: gameState.challenges[gameState.currentChallengeIndex].name,
        html: `<h4>Ronda ${gameState.currentRound}</h4>` + diceHtml,
        diceResult: diceHtml // store just the dice results
    };
    gameState.roundsLogData.push(roundLogEntry);
    updateRoundsLog();

    gameState.currentRound++;
    updatePlayerLevels();
    updateCurrentChallengeDisplay();
}

// Persistence functions
function saveGameState() {
    localStorage.setItem('diceGameState', JSON.stringify(gameState));
}

function loadGameState() {
    const savedState = localStorage.getItem('diceGameState');
    if (savedState) {
        gameState = JSON.parse(savedState);
        updateAllLists();
        
        if (gameState.gameStarted) {
            gameInfo.style.display = 'block';
            startGameBtn.style.display = 'none';
            rollDiceBtn.disabled = false;
        }
    }
}

// Theme function
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

// Sortable lists initialization
function initializeSortableLists() {
    new Sortable(playerList, {
        animation: 150,
        onEnd: () => {
            const newOrder = Array.from(playerList.children).map(li => li.dataset.id);
            gameState.players.sort((a, b) => newOrder.indexOf(a.id.toString()) - newOrder.indexOf(b.id.toString()));
            saveGameState();
        }
    });
    new Sortable(challengeList, {
        animation: 150,
        onEnd: () => {
            const newOrder = Array.from(challengeList.children).map(li => li.dataset.id);
            gameState.challenges.sort((a, b) => newOrder.indexOf(a.id.toString()) - newOrder.indexOf(b.id.toString()));
            saveGameState();
        }
    });
}

// File I/O for challenges
function loadChallengesFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json, .txt';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            if (file.name.endsWith('.json')) {
                const data = JSON.parse(content);
                if (data.challenges) {
                    gameState.challenges = [...gameState.challenges, ...data.challenges];
                }
            } else {
                loadChallengesFromText(content);
            }
            updateChallengeList();
            saveGameState();
            loadListModal.style.display = 'none';
        };
        reader.readAsText(file);
    };
    input.click();
}

function loadChallengesFromSimpleList() {
     const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            const lines = content.split('\n').filter(line => line.trim() !== '');
            lines.forEach(line => {
                gameState.challenges.push({
                    id: Date.now() + Math.random(),
                    name: line.trim(),
                    description: '',
                    active: true
                });
            });
            updateChallengeList();
            saveGameState();
            loadListModal.style.display = 'none';
        };
        reader.readAsText(file);
    };
    input.click();
}

function loadChallengesFromText(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    lines.forEach(line => {
        const parts = line.split(';').map(part => part.trim());
        if (parts.length > 0 && parts[0]) {
            gameState.challenges.push({
                id: Date.now() + Math.random(),
                name: parts[0],
                description: parts[1] || '',
                active: true
            });
        }
    });
    updateChallengeList();
    saveGameState();
}

function saveGame() {
    const filename = prompt(translations[currentLanguage].saveGamePrompt, 'partida');
    if (filename) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gameState));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", filename + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}

function loadGame() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = readerEvent => {
            const content = readerEvent.target.result;
            gameState = JSON.parse(content);
            updateAllLists();
            saveGameState();
        };
        reader.readAsText(file);
    };
    input.click();
}

function showLastDiceResult() {
    if (gameState.lastDiceResultHTML) {
        modalDiceContainer.innerHTML = gameState.lastDiceResultHTML;
        openDiceModal();
    }
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
        alert('Error al leer el portapapeles.');
    }
}

// 👇 CAMBIO 3: NUEVA FUNCIÓN PARA QUE EL INVITADO ACTUALICE SU PANTALLA 👇
function handleGameStateUpdate(payload) {
    // Sobrescribimos el estado local con la información recibida del anfitrión
    Object.assign(gameState, payload.gameState);

    // Actualizamos también los campos de texto y configuración
    document.getElementById('game-title-input').value = payload.gameTitle;
    document.getElementById('game-title').textContent = payload.gameTitle;
    document.getElementById('game-description').value = payload.gameDescription;
    document.getElementById('game-instructions').value = payload.gameInstructions;
    document.getElementById('dice-max-value').value = payload.diceMaxValue;
    document.getElementById('allow-duplicate-rolls-checkbox').checked = payload.allowDuplicateRolls;

    // Usamos tus propias funciones para redibujar toda la interfaz
    updateAllLists();
    updateRoundsLog();

    // Sincronizamos el estado de los botones (empezar/lanzar)
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


// 👇 CAMBIO 4: HACEMOS GLOBALES LAS FUNCIONES NECESARIAS 👇
window.handleGameStateUpdate = handleGameStateUpdate;
window.gameState = gameState; // Hacemos gameState global para que connection.js pueda leerlo