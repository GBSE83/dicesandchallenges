// Real-time connection system for game.html

import { updateGameFromHostData } from './app.js';

let connectionState = {
    role: null, // 'host' or 'guest'
    name: '',
    accessCode: '',
    peer: null,
    peerId: null,
    hostConnection: null,
    guestConnections: [],
    isConnected: false,
    darkMode: false,
    language: 'es'
};

// DOM elements
const connectionIndicator = document.getElementById('connection-indicator');
const userRoleSpan = document.getElementById('user-role');
const exitGameBtn = document.getElementById('exit-game-btn');

// Initialize connection system
function initConnection() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    connectionState.role = urlParams.get('role');
    connectionState.name = urlParams.get('name');
    connectionState.accessCode = urlParams.get('accessCode');
    connectionState.peerId = urlParams.get('peerId');
    connectionState.language = urlParams.get('language') || 'es';
    connectionState.darkMode = urlParams.get('darkMode') === 'true';
    
    // Apply theme and language
    if (connectionState.darkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // Update connection indicator and user role
    updateConnectionDisplay();
    
    // Setup event listeners
    exitGameBtn.addEventListener('click', exitGameHandler);
    
    // Initialize PeerJS based on role
    if (connectionState.role === 'host') {
        initHostConnection();
        
        // Start periodic update for the guest list
        setInterval(updateGuestsList, 2000); // Update guests list every 2 seconds
        
        // Setup function overrides after a short delay to ensure app.js is loaded
        setTimeout(() => {
            setupHostFunctionOverrides();
        }, 500);
    } else if (connectionState.role === 'guest') {
        initGuestConnection();
    } else {
        // Handle direct access to game.html without proper role
        redirectToLanding();
    }
    
    // Disable controls for guests
    if (connectionState.role === 'guest') {
        disableControlsForGuests();
    }
}

// Initialize connection as host
function initHostConnection() {
    try {
        // Reconnect to the same peer ID
        connectionState.peer = new Peer(`dice-game-${connectionState.accessCode}`);
        
        connectionState.peer.on('open', (id) => {
            connectionState.isConnected = true;
            updateConnectionDisplay();
            
            // Listen for new guest connections
            connectionState.peer.on('connection', (conn) => {
                setupGuestConnection(conn);
            });
            
            // Send initial game state to all guests
            setTimeout(() => {
                broadcastGameState();
            }, 1000);
        });
        
        connectionState.peer.on('error', (err) => {
            console.error('Host PeerJS error:', err);
            connectionState.isConnected = false;
            updateConnectionDisplay();
        });
    } catch (err) {
        console.error('Failed to initialize host PeerJS:', err);
        connectionState.isConnected = false;
        updateConnectionDisplay();
    }
}

// Initialize connection as guest
function initGuestConnection() {
    try {
        // Create a new peer for the guest
        connectionState.peer = new Peer();
        
        connectionState.peer.on('open', (id) => {
            // Connect to host
            const conn = connectionState.peer.connect(`dice-game-${connectionState.accessCode}`);
            
            conn.on('open', () => {
                connectionState.hostConnection = conn;
                connectionState.isConnected = true;
                updateConnectionDisplay();
                
                // Send guest info to host
                conn.send({
                    type: 'guest-info',
                    name: connectionState.name,
                    peerId: connectionState.peer.id
                });
                
                // Listen for data from host
                conn.on('data', (data) => {
                    handleHostData(data);
                });
                
                // Handle connection closing
                conn.on('close', () => {
                    connectionState.isConnected = false;
                    connectionState.hostConnection = null;
                    updateConnectionDisplay();
                    alert('La conexión con el anfitrión se ha cerrado.');
                });
            });
            
            conn.on('error', (err) => {
                console.error('Guest connection error:', err);
                connectionState.isConnected = false;
                updateConnectionDisplay();
            });
        });
        
        connectionState.peer.on('error', (err) => {
            console.error('Guest PeerJS error:', err);
            connectionState.isConnected = false;
            updateConnectionDisplay();
        });
    } catch (err) {
        console.error('Failed to initialize guest PeerJS:', err);
        connectionState.isConnected = false;
        updateConnectionDisplay();
    }
}

// Setup connection with a guest
function setupGuestConnection(conn) {
    conn.on('open', () => {
        // Add connection to list
        connectionState.guestConnections.push(conn);
        
        // Listen for data from this guest
        conn.on('data', (data) => {
            handleGuestData(conn, data);
        });
        
        // Handle connection closing
        conn.on('close', () => {
            connectionState.guestConnections = connectionState.guestConnections.filter(c => c !== conn);
            updateConnectionDisplay();
            broadcastGameState();
        });
        
        // Force an immediate update of the guests list
        updateGuestsList();
    });
}

// Handle data received from host
function handleHostData(data) {
    console.log('Received data from host:', data);
    
    if (data.type === 'name-rejected') {
        alert(data.message);
        // Clear the guest name input and focus it
        guestNameInput.value = '';
        guestNameInput.focus();
        return;
    }
    
    if (data.type === 'guest-approved') {
        hideWaitingScreen();
        const params = new URLSearchParams();
        params.append('role', 'guest');
        params.append('name', landingState.guestName);
        params.append('accessCode', landingState.accessCode);
        params.append('peerId', landingState.peerId);
        params.append('language', landingState.currentLanguage);
        params.append('darkMode', landingState.isDarkMode);
        window.location.href = `game.html?${params.toString()}`;
        return;
    }
    
    if (data.type === 'host-kicked') {
        alert(data.message);
        exitGame();
        return;
    }
    
    if (data.type === 'game-start') {
        hideWaitingScreen();
        const params = new URLSearchParams();
        params.append('role', 'guest');
        params.append('name', landingState.guestName);
        params.append('accessCode', landingState.accessCode);
        params.append('peerId', landingState.peerId);
        params.append('language', landingState.currentLanguage);
        params.append('darkMode', landingState.isDarkMode);
        window.location.href = `game.html?${params.toString()}`;
    }
    
    if (data.type === 'guest-approved') {
        hideWaitingScreen();
        updateConnectionDisplay();
    } else if (data.type === 'guest-denied') {
        alert(data.message || 'El anfitrión ha rechazado tu solicitud para unirte a la partida.');
        exitGame();
    } else if (data.type === 'game-state-update') {
        // Update the game state with data from host
        updateGameFromHostData(data.gameState);
    } else if (data.type === 'name-rejected') {
        alert(data.message);
        // Exit to landing page to choose a different name
        exitGame();
    } else if (data.type === 'game-start') {
        // Hide waiting screen if host starts the game
        hideWaitingScreen();
        updateConnectionDisplay();
    } else if (data.type === 'host-ended-game') {
        alert(data.message || 'El anfitrión ha terminado la partida.');
        exitGame();
    }
}

// Handle data received from a guest
function handleGuestData(conn, data) {
    console.log('Received data from guest:', data);
    
    if (data.type === 'guest-info') {
        const isDuplicateName = connectionState.guestConnections.some(existingConn => 
            existingConn !== conn && existingConn.guestName === data.name
        ) || data.name === connectionState.name;
        
        if (isDuplicateName) {
            conn.send({
                type: 'name-rejected',
                message: connectionState.language === 'es' ? 
                    'Este nombre ya está en uso. Por favor, elige otro nombre.' : 
                    'This name is already in use. Please choose a different name.'
            });
            return;
        }
        
        // Auto-approve guest (no modal confirmation needed)
        conn.approved = true;
        conn.guestName = data.name;
        conn.guestId = data.peerId;
        
        // Notify host about the new guest
        showGuestJoinedNotification(data.name);
        
        // Send approval to guest
        conn.send({ type: 'guest-approved' });
        
        updateConnectionDisplay();
        broadcastGameState();
    }
}

// Show notification that a guest has joined
function showGuestJoinedNotification(guestName) {
    const notificationEl = document.createElement('div');
    notificationEl.className = 'notification';
    notificationEl.style.position = 'fixed';
    notificationEl.style.bottom = '20px';
    notificationEl.style.right = '20px';
    notificationEl.style.backgroundColor = 'var(--primary-color)';
    notificationEl.style.color = 'white';
    notificationEl.style.padding = '10px 20px';
    notificationEl.style.borderRadius = '4px';
    notificationEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    notificationEl.style.zIndex = '9999';
    
    notificationEl.textContent = connectionState.language === 'es' ? 
        `${guestName} se ha unido a la partida` : 
        `${guestName} has joined the game`;
    
    document.body.appendChild(notificationEl);
    
    setTimeout(() => {
        document.body.removeChild(notificationEl);
    }, 3000);
}

// Update game state from host data (for guests)
function updateGameFromHostData(receivedGameState) {
    if (connectionState.role !== 'guest') return;
    
    // Set the game state based on host data
    Object.assign(gameState, receivedGameState);
    
    // Update UI elements
    updateUIFromGameState();
    
    // Update dice roll results if available
    if (receivedGameState.roundsLogData && receivedGameState.roundsLogData.length > 0) {
        roundsLog.innerHTML = '';
        receivedGameState.roundsLogData.forEach(roundData => {
            const roundEntry = document.createElement('div');
            roundEntry.classList.add('round-entry');
            roundEntry.innerHTML = roundData.html;
            roundsLog.prepend(roundEntry);
        });
    }
    
    // Update button states
    updateButtonStates();
    
    // Update form inputs
    updateFormInputs(receivedGameState);
    
    // Handle modal state
    handleModalState(receivedGameState);
}

// Update all UI elements from game state
function updateUIFromGameState() {
    updatePlayerList();
    updateChallengeList();
    updateCurrentChallengeDisplay();
    updateStartButtonText();
    updatePlayerLevelsDisplay();
    updateDeactivatedChallengeList();
    
    // Update language if changed
    if (gameState.currentLanguage !== connectionState.language) {
        connectionState.language = gameState.currentLanguage;
        document.getElementById('language-toggle').textContent = gameState.currentLanguage.toUpperCase();
        updateLanguage();
    }
    
    // Update theme if changed
    if (gameState.isDarkMode !== connectionState.darkMode) {
        connectionState.darkMode = gameState.isDarkMode;
        document.body.classList.toggle('dark-mode', gameState.isDarkMode);
    }
}

// Update button states based on game state
function updateButtonStates() {
    const rollDiceBtn = document.getElementById('roll-dice');
    const continueGameBtn = document.getElementById('continue-game');
    const undoLastRollBtn = document.getElementById('undo-last-roll');
    const showLastDiceResultBtn = document.getElementById('show-last-dice-result');
    const startGameBtn = document.getElementById('start-game');
    
    if (rollDiceBtn) rollDiceBtn.disabled = !gameState.gameStarted || gameState.gameEnded;
    if (continueGameBtn) continueGameBtn.disabled = !gameState.gameEnded;
    if (undoLastRollBtn) undoLastRollBtn.disabled = !gameState.playerStateHistory || gameState.playerStateHistory.length === 0;
    if (showLastDiceResultBtn) showLastDiceResultBtn.disabled = !gameState.roundsLogData || gameState.roundsLogData.length === 0;
}

// Update form inputs from game state
function updateFormInputs(receivedGameState) {
    const gameTitleInput = document.getElementById('game-title-input');
    const gameDescription = document.getElementById('game-description');
    const gameInstructions = document.getElementById('game-instructions');
    const diceMaxValueInput = document.getElementById('dice-max-value');
    const allowDuplicateRollsCheckbox = document.getElementById('allow-duplicate-rolls-checkbox');
    const rollNoChallengeCheckbox = document.getElementById('roll-no-challenge-checkbox');
    const autoCloseModalCheckbox = document.getElementById('auto-close-modal-checkbox');
    
    if (gameTitleInput && receivedGameState.gameTitle !== undefined) {
        gameTitleInput.value = receivedGameState.gameTitle || '';
    }
    if (gameDescription && receivedGameState.gameDescription !== undefined) {
        gameDescription.value = receivedGameState.gameDescription || '';
    }
    if (gameInstructions && receivedGameState.gameInstructions !== undefined) {
        gameInstructions.value = receivedGameState.gameInstructions || '';
    }
    if (diceMaxValueInput && receivedGameState.diceMaxValue !== undefined) {
        diceMaxValueInput.value = receivedGameState.diceMaxValue;
    }
    if (allowDuplicateRollsCheckbox && receivedGameState.allowDuplicateRolls !== undefined) {
        allowDuplicateRollsCheckbox.checked = receivedGameState.allowDuplicateRolls;
    }
    if (rollNoChallengeCheckbox && receivedGameState.rollNoChallenge !== undefined) {
        rollNoChallengeCheckbox.checked = receivedGameState.rollNoChallenge;
    }
    if (autoCloseModalCheckbox && receivedGameState.autoCloseModal !== undefined) {
        autoCloseModalCheckbox.checked = receivedGameState.autoCloseModal;
    }
}

// Handle modal state synchronization
function handleModalState(receivedGameState) {
    const modal = document.getElementById('results-modal');
    const modalDiceContainer = document.getElementById('modal-dice-container');
    
    if (receivedGameState.modalOpen && modal) {
        modalDiceContainer.innerHTML = receivedGameState.modalDiceHtml || '';
        modal.style.display = 'flex';
        
        // Restore click event listeners for dice
        const diceElements = modalDiceContainer.querySelectorAll('.dice');
        diceElements.forEach(dice => {
            if (dice.classList.contains('lowest-roll')) {
                const playerNameDiv = dice.querySelector('.player-name');
                if (playerNameDiv) {
                    const playerName = playerNameDiv.textContent;
                    const player = gameState.players.find(p => p.name === playerName);
                    if (player) {
                        dice.addEventListener('click', () => showDicePopup(player));
                    }
                }
            }
        });
    } else if (modal) {
        modal.style.display = 'none';
    }
}

// Update connection display
function updateConnectionDisplay() {
    // Update connection indicator
    connectionIndicator.className = connectionState.isConnected ? 'connected' : 'disconnected';
    
    // Update user role display with guest count
    if (connectionState.role === 'host') {
        const guestCount = connectionState.guestConnections.length;
        const guestText = connectionState.language === 'es' 
            ? `(${guestCount} invitado${guestCount !== 1 ? 's' : ''})`
            : `(${guestCount} guest${guestCount !== 1 ? 's' : ''})`;
        
        userRoleSpan.textContent = `${connectionState.language === 'es' ? 'Anfitrión' : 'Host'} ${guestText}`;
        
        // Create toggle button for guests list if it doesn't exist
        createGuestsListToggle();
        updateGuestsList();
    } else {
        userRoleSpan.textContent = connectionState.language === 'es' ? 'Invitado' : 'Guest';
    }
}

// Create toggle button for guests list
function createGuestsListToggle() {
    // Check if toggle button already exists
    let toggleButton = document.getElementById('toggle-guests-list-btn');
    
    if (!toggleButton) {
        toggleButton = document.createElement('button');
        toggleButton.id = 'toggle-guests-list-btn';
        toggleButton.className = 'btn';
        toggleButton.style.marginLeft = '10px';
        toggleButton.style.fontSize = '0.8rem';
        toggleButton.style.padding = '2px 6px';
        toggleButton.textContent = connectionState.language === 'es' ? 'Mostrar usuarios' : 'Show users';
        
        // Add it next to the connection status
        const connectionStatus = document.getElementById('connection-status');
        connectionStatus.appendChild(toggleButton);
        
        // Add event listener
        toggleButton.addEventListener('click', toggleGuestsList);
    }
}

// Toggle guests list visibility
function toggleGuestsList() {
    let guestsContainer = document.getElementById('host-connected-users');
    const toggleButton = document.getElementById('toggle-guests-list-btn');
    
    if (!guestsContainer) {
        createGuestsContainer();
        guestsContainer = document.getElementById('host-connected-users');
        toggleButton.textContent = connectionState.language === 'es' ? 'Ocultar usuarios' : 'Hide users';
    } else {
        const isVisible = guestsContainer.style.display !== 'none';
        guestsContainer.style.display = isVisible ? 'none' : 'block';
        toggleButton.textContent = isVisible ? 
            (connectionState.language === 'es' ? 'Mostrar usuarios' : 'Show users') : 
            (connectionState.language === 'es' ? 'Ocultar usuarios' : 'Hide users');
    }
}

// Create guests container
function createGuestsContainer() {
    const connectedUsersContainer = document.createElement('div');
    connectedUsersContainer.id = 'host-connected-users';
    connectedUsersContainer.className = 'connected-users-container';
    connectedUsersContainer.style.position = 'fixed';
    connectedUsersContainer.style.top = '60px';
    connectedUsersContainer.style.right = '10px';
    connectedUsersContainer.style.backgroundColor = 'var(--card-bg-color)';
    connectedUsersContainer.style.border = '1px solid var(--border-color)';
    connectedUsersContainer.style.borderRadius = '4px';
    connectedUsersContainer.style.padding = '10px';
    connectedUsersContainer.style.zIndex = '1000';
    connectedUsersContainer.style.boxShadow = '0 2px 4px var(--shadow-color)';
    connectedUsersContainer.style.minWidth = '200px';
    
    const title = document.createElement('h3');
    title.textContent = connectionState.language === 'es' ? 'Usuarios conectados' : 'Connected Users';
    title.style.marginTop = '0';
    connectedUsersContainer.appendChild(title);
    
    const usersList = document.createElement('ul');
    usersList.id = 'host-connected-users-list';
    usersList.style.listStyle = 'none';
    usersList.style.padding = '0';
    usersList.style.margin = '0';
    connectedUsersContainer.appendChild(usersList);
    
    document.body.appendChild(connectedUsersContainer);
}

// Update guests list content
function updateGuestsList() {
    const container = document.getElementById('host-connected-users');
    if (!container) return; // Skip if not visible
    
    const usersList = document.getElementById('host-connected-users-list');
    usersList.innerHTML = '';
    
    connectionState.guestConnections.forEach(conn => {
        if (conn.guestName) {
            const userItem = document.createElement('li');
            userItem.textContent = conn.guestName;
            userItem.style.padding = '5px 0';
            userItem.style.borderBottom = '1px solid var(--border-color)';
            userItem.style.cursor = 'pointer';
            userItem.title = connectionState.language === 'es' ? 
                'Doble clic para expulsar al usuario' : 
                'Double-click to kick user';
            
            // Add double-click event to kick user
            userItem.addEventListener('dblclick', () => {
                kickGuest(conn);
            });
            
            usersList.appendChild(userItem);
        }
    });
    
    if (connectionState.guestConnections.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = connectionState.language === 'es' ? 
            'No hay usuarios conectados' : 
            'No connected users';
        emptyItem.style.padding = '5px 0';
        emptyItem.style.fontStyle = 'italic';
        usersList.appendChild(emptyItem);
    }
}

// Replace the old showConnectedUsersList function
function showConnectedUsersList() {
    // This function is now replaced by createGuestsContainer and updateGuestsList
    // But we keep it for compatibility
    updateGuestsList();
}

// Kick a specific guest
function kickGuest(conn) {
    if (connectionState.role !== 'host') return;
    
    const guestName = conn.guestName;
    
    // Send kick message to guest
    conn.send({
        type: 'host-kicked',
        message: connectionState.language === 'es' ? 
            'Has sido expulsado por el anfitrión.' : 
            'You have been kicked by the host.'
    });
    
    // Remove connection from list
    connectionState.guestConnections = connectionState.guestConnections.filter(c => c !== conn);
    
    // Update display
    updateConnectionDisplay();
    
    // Show notification
    const kickNotification = document.createElement('div');
    kickNotification.className = 'notification';
    kickNotification.style.position = 'fixed';
    kickNotification.style.bottom = '20px';
    kickNotification.style.right = '20px';
    kickNotification.style.backgroundColor = '#f44336';
    kickNotification.style.color = 'white';
    kickNotification.style.padding = '10px 20px';
    kickNotification.style.borderRadius = '4px';
    kickNotification.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
    kickNotification.style.zIndex = '9999';
    
    kickNotification.textContent = connectionState.language === 'es' ? 
        `Se ha expulsado a ${guestName}` : 
        `${guestName} has been kicked`;
    
    document.body.appendChild(kickNotification);
    
    setTimeout(() => {
        document.body.removeChild(kickNotification);
    }, 3000);
}

// Enhanced broadcast function with comprehensive game state
function broadcastGameState() {
    if (connectionState.role !== 'host') return;
    
    // Create a comprehensive copy of the game state to send
    const gameStateCopy = JSON.parse(JSON.stringify(gameState));
    
    // Add UI state information
    const modal = document.getElementById('results-modal');
    const modalDiceContainer = document.getElementById('modal-dice-container');
    const gameTitleInput = document.getElementById('game-title-input');
    const gameDescription = document.getElementById('game-description');
    const gameInstructions = document.getElementById('game-instructions');
    const rollNoChallengeCheckbox = document.getElementById('roll-no-challenge-checkbox');
    const autoCloseModalCheckbox = document.getElementById('auto-close-modal-checkbox');
    
    // Modal state
    gameStateCopy.modalOpen = (modal && modal.style.display === 'flex');
    gameStateCopy.modalDiceHtml = modalDiceContainer ? modalDiceContainer.innerHTML : '';
    
    // Form inputs state
    gameStateCopy.gameTitle = gameTitleInput ? gameTitleInput.value : '';
    gameStateCopy.gameDescription = gameDescription ? gameDescription.value : '';
    gameStateCopy.gameInstructions = gameInstructions ? gameInstructions.value : '';
    gameStateCopy.rollNoChallenge = rollNoChallengeCheckbox ? rollNoChallengeCheckbox.checked : false;
    gameStateCopy.autoCloseModal = autoCloseModalCheckbox ? autoCloseModalCheckbox.checked : false;
    
    // Send to all connected guests
    connectionState.guestConnections.forEach(conn => {
        if (conn.open && conn.approved) {  // Only send to approved and open connections
            try {
                conn.send({
                    type: 'game-state-update',
                    gameState: gameStateCopy
                });
            } catch (error) {
                console.warn('Failed to send game state to guest:', error);
            }
        }
    });
    
    // Update connection display to show current guest count
    updateConnectionDisplay();
}

// Setup comprehensive function overrides for host
function setupHostFunctionOverrides() {
    if (connectionState.role !== 'host' || typeof window.gameState === 'undefined') return;
    
    // Store original functions
    const originals = {
        addPlayer: window.addPlayer,
        addChallenge: window.addChallenge,
        deletePlayer: window.deletePlayer,
        editPlayer: window.editPlayer,
        updatePlayerName: window.updatePlayerName,
        updateChallengeName: window.updateChallengeName,
        updateChallengeDescription: window.updateChallengeDescription,
        startGame: window.startGame,
        rollDice: window.rollDice,
        continueGame: window.continueGame,
        undoLastRoll: window.undoLastRoll,
        showLastDiceResult: window.showLastDiceResult,
        resetGameData: window.resetGameData,
        toggleSelectChallenges: window.toggleSelectChallenges,
        deleteSelectedChallenges: window.deleteSelectedChallenges,
        deactivateSelectedChallenges: window.deactivateSelectedChallenges,
        reactivateChallenge: window.reactivateChallenge,
        toggleDeactivatedChallengesList: window.toggleDeactivatedChallengesList,
        toggleSelectAllChallenges: window.toggleSelectAllChallenges,
        updateDiceMaxValue: window.updateDiceMaxValue,
        toggleTheme: window.toggleTheme,
        toggleLanguage: window.toggleLanguage,
        openDiceModal: window.openDiceModal,
        closeDiceModal: window.closeDiceModal,
        loadGameData: window.loadGameData,
        saveGameData: window.saveGameData,
        loadChallengesFromTextContent: window.loadChallengesFromTextContent,
        performGameRoll: window.performGameRoll,
        performNoChallengeRoll: window.performNoChallengeRoll,
        endGame: window.endGame,
        showRoundResults: window.showRoundResults
    };
    
    // Override player management functions
    window.addPlayer = function() {
        originals.addPlayer.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.deletePlayer = function(index) {
        originals.deletePlayer.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.editPlayer = function(index) {
        originals.editPlayer.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.updatePlayerName = function(index, newName, revert = false) {
        originals.updatePlayerName.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    // Override challenge management functions
    window.addChallenge = function() {
        originals.addChallenge.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.updateChallengeName = function(index, newName, revert = false) {
        originals.updateChallengeName.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.updateChallengeDescription = function(index, newDescription, revert = false) {
        originals.updateChallengeDescription.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.deleteSelectedChallenges = function() {
        originals.deleteSelectedChallenges.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.deactivateSelectedChallenges = function() {
        originals.deactivateSelectedChallenges.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.reactivateChallenge = function(index) {
        originals.reactivateChallenge.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.toggleSelectChallenges = function() {
        originals.toggleSelectChallenges.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.toggleSelectAllChallenges = function() {
        originals.toggleSelectAllChallenges.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    // Override game control functions
    window.startGame = function() {
        originals.startGame.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.rollDice = function() {
        originals.rollDice.apply(this, arguments);
        // Delayed broadcast after dice animation completes
        setTimeout(broadcastGameState, 1200);
    };
    
    window.performGameRoll = function() {
        originals.performGameRoll.apply(this, arguments);
        setTimeout(broadcastGameState, 1200);
    };
    
    window.performNoChallengeRoll = function() {
        originals.performNoChallengeRoll.apply(this, arguments);
        setTimeout(broadcastGameState, 1200);
    };
    
    window.continueGame = function() {
        originals.continueGame.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.undoLastRoll = function() {
        originals.undoLastRoll.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.showLastDiceResult = function() {
        originals.showLastDiceResult.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.endGame = function(player, isLoser = false) {
        originals.endGame.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.showRoundResults = function(results, losers) {
        originals.showRoundResults.apply(this, arguments);
        setTimeout(broadcastGameState, 200);
    };
    
    // Override modal functions
    window.openDiceModal = function() {
        originals.openDiceModal.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.closeDiceModal = function() {
        originals.closeDiceModal.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    // Override settings functions
    window.updateDiceMaxValue = function() {
        originals.updateDiceMaxValue.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.toggleTheme = function() {
        originals.toggleTheme.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.toggleLanguage = function() {
        originals.toggleLanguage.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    // Override data management functions
    window.resetGameData = function() {
        originals.resetGameData.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    window.loadGameData = function() {
        originals.loadGameData.apply(this, arguments);
        setTimeout(broadcastGameState, 500);
    };
    
    window.loadChallengesFromTextContent = function(fileContent) {
        originals.loadChallengesFromTextContent.apply(this, arguments);
        setTimeout(broadcastGameState, 200);
    };
    
    // Override deactivated challenges functions
    window.toggleDeactivatedChallengesList = function() {
        originals.toggleDeactivatedChallengesList.apply(this, arguments);
        setTimeout(broadcastGameState, 100);
    };
    
    // Setup event listeners for input changes
    setupInputEventListeners();
}

// Setup event listeners for real-time input synchronization
function setupInputEventListeners() {
    if (connectionState.role !== 'host') return;
    
    const gameTitleInput = document.getElementById('game-title-input');
    const gameDescription = document.getElementById('game-description');
    const gameInstructions = document.getElementById('game-instructions');
    const rollNoChallengeCheckbox = document.getElementById('roll-no-challenge-checkbox');
    const autoCloseModalCheckbox = document.getElementById('auto-close-modal-checkbox');
    const allowDuplicateRollsCheckbox = document.getElementById('allow-duplicate-rolls-checkbox');
    
    // Debounce function for text inputs
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Add event listeners with debouncing for text inputs
    if (gameTitleInput) {
        gameTitleInput.addEventListener('input', debounce(broadcastGameState, 1000));
    }
    
    if (gameDescription) {
        gameDescription.addEventListener('input', debounce(broadcastGameState, 1000));
    }
    
    if (gameInstructions) {
        gameInstructions.addEventListener('input', debounce(broadcastGameState, 1000));
    }
    
    // Immediate broadcast for checkboxes
    if (rollNoChallengeCheckbox) {
        rollNoChallengeCheckbox.addEventListener('change', () => {
            setTimeout(broadcastGameState, 100);
        });
    }
    
    if (autoCloseModalCheckbox) {
        autoCloseModalCheckbox.addEventListener('change', () => {
            setTimeout(broadcastGameState, 100);
        });
    }
    
    if (allowDuplicateRollsCheckbox) {
        allowDuplicateRollsCheckbox.addEventListener('change', () => {
            setTimeout(broadcastGameState, 100);
        });
    }
}

// Disable controls for guests
function disableControlsForGuests() {
    // Disable all interactive elements for guests
    document.querySelectorAll('button:not(#exit-game-btn), input').forEach(el => {
        if (el.id !== 'language-toggle' && el.id !== 'theme-toggle') {
            el.disabled = true;
        }
    });
    
    // Make challenge list and player list non-interactive
    document.querySelectorAll('#challenge-list, #player-list').forEach(list => {
        list.classList.add('guest-mode');
    });
}

// Exit game handler
function exitGameHandler() {
    if (connectionState.role === 'host') {
        showExitGameModal();
    } else {
        // For guests, show simple confirmation
        const confirmMessage = connectionState.language === 'es' ? 
            '¿Estás seguro de que quieres salir del juego?' : 
            'Are you sure you want to exit the game?';
            
        if (confirm(confirmMessage)) {
            exitGame();
        }
    }
}

// Show exit game modal for host
function showExitGameModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'exit-game-modal';
    modal.style.display = 'flex';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const title = connectionState.language === 'es' ? 'Salir del Juego' : 'Exit Game';
    const option1 = connectionState.language === 'es' ? 'Terminar partida y mantenerme en la sala' : 'End game and stay in room';
    const option2 = connectionState.language === 'es' ? 'Terminar partida y volver a la sala inicial' : 'End game and return to landing page';
    const option3 = connectionState.language === 'es' ? 'Cancelar acción' : 'Cancel action';
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>${title}</h2>
            <button type="button" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
            <button id="end-game-stay-btn" class="btn">${option1}</button>
            <button id="end-game-exit-btn" class="btn">${option2}</button>
            <button id="cancel-exit-btn" class="btn">${option3}</button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Event listeners for buttons
    document.querySelector('#exit-game-modal .close-button').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    document.getElementById('end-game-stay-btn').addEventListener('click', () => {
        // End game and kick all guests out, but host stays
        kickAllGuests();
        document.body.removeChild(modal);
    });
    
    document.getElementById('end-game-exit-btn').addEventListener('click', () => {
        // End game, kick all guests out, and host exits too
        kickAllGuests();
        exitGame();
    });
    
    document.getElementById('cancel-exit-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Kick all guests out of the game
function kickAllGuests() {
    if (connectionState.role === 'host') {
        // Send message to all guests to exit
        connectionState.guestConnections.forEach(conn => {
            if (conn.open) {
                conn.send({
                    type: 'host-ended-game',
                    message: connectionState.language === 'es' ? 
                        'El anfitrión ha terminado la partida.' : 
                        'The host has ended the game.'
                });
            }
        });
        
        // Clear guest connections
        connectionState.guestConnections = [];
        updateConnectionDisplay();
    }
}

// Exit the game and return to landing page
function exitGame() {
    // Close all connections
    if (connectionState.peer) {
        connectionState.peer.destroy();
    }
    
    // Redirect to landing page
    window.location.href = 'landing.html';
}

// Redirect to landing page
function redirectToLanding() {
    window.location.href = 'landing.html';
}

// Hide waiting screen
function hideWaitingScreen() {
    const waitingModal = document.getElementById('waiting-modal');
    if (waitingModal) {
        document.body.removeChild(waitingModal);
    }
}

// Initialize the connection system when the page loads
document.addEventListener('DOMContentLoaded', initConnection);

// Setup periodic broadcast of game state for hosts
setInterval(() => {
    if (connectionState.role === 'host' && connectionState.guestConnections.length > 0) {
        broadcastGameState();
    }
}, 2000);

// Export functions for use in app.js
export { broadcastGameState };
