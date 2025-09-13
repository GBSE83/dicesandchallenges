// connection.js

// Estado de la conexión
let connectionState = {
    role: null, // 'host' o 'guest'
    name: '',
    accessCode: '',
    peer: null,
    peerId: null,
    hostConnection: null,
    guestConnections: [],
    isConnected: false
};

// Referencias a los elementos del DOM
const connectionIndicator = document.getElementById('connection-indicator');
const userRoleSpan = document.getElementById('user-role');
const exitGameBtn = document.getElementById('exit-game-btn');

/**
 * Inicializa la conexión al cargar la página.
 */
function initConnection() {
    const urlParams = new URLSearchParams(window.location.search);
    connectionState.role = urlParams.get('role');
    connectionState.name = urlParams.get('name');
    connectionState.accessCode = urlParams.get('accessCode');

    if (!connectionState.role || !connectionState.name || !connectionState.accessCode) {
        window.location.href = 'landing.html';
        return;
    }
    
    updateConnectionDisplay();
    exitGameBtn.addEventListener('click', exitGame);

    if (connectionState.role === 'host') {
        initHostConnection();
        // Se sobreescriben las funciones del juego para que el anfitrión notifique a los invitados
        setTimeout(setupHostFunctionOverrides, 500);
    } else {
        initGuestConnection();
        disableControlsForGuests();
    }
}

/**
 * Inicializa la conexión para el anfitrión (host).
 */
function initHostConnection() {
    connectionState.peer = new Peer(`dice-game-${connectionState.accessCode}`);
    connectionState.peer.on('open', id => {
        connectionState.peerId = id;
        connectionState.isConnected = true;
        updateConnectionDisplay();
        console.log('Host connected with ID:', id);

        connectionState.peer.on('connection', conn => {
            console.log('Guest connected:', conn.peer);
            setupGuestConnection(conn);
        });
    });

    connectionState.peer.on('error', err => {
        console.error('PeerJS error (Host):', err);
        connectionState.isConnected = false;
        updateConnectionDisplay();
    });
}

/**
 * Inicializa la conexión para el invitado (guest).
 */
function initGuestConnection() {
    connectionState.peer = new Peer();
    connectionState.peer.on('open', id => {
        connectionState.peerId = id;
        console.log('Guest connected with ID:', id);
        
        const conn = connectionState.peer.connect(`dice-game-${connectionState.accessCode}`);
        connectionState.hostConnection = conn;

        conn.on('open', () => {
            connectionState.isConnected = true;
            updateConnectionDisplay();
            console.log('Connected to host.');
            conn.send({ type: 'guest-info', name: connectionState.name });
        });

        conn.on('data', handleHostData);

        conn.on('close', () => {
            connectionState.isConnected = false;
            updateConnectionDisplay();
            alert('Se ha perdido la conexión con el anfitrión.');
        });
    });

    connectionState.peer.on('error', err => {
        console.error('PeerJS error (Guest):', err);
        connectionState.isConnected = false;
        updateConnectionDisplay();
    });
}

/**
 * Configura la conexión con un nuevo invitado.
 */
function setupGuestConnection(conn) {
    connectionState.guestConnections.push(conn);
    
    conn.on('data', data => {
        console.log('Data from guest:', data);
    });

    conn.on('close', () => {
        connectionState.guestConnections = connectionState.guestConnections.filter(c => c.peer !== conn.peer);
        console.log('Guest disconnected:', conn.peer);
    });
    
    setTimeout(broadcastGameState, 1000);
}

/**
 * Maneja los datos recibidos del anfitrión.
 */
function handleHostData(data) {
    if (data.type === 'game-state') {
        updateGameState(data.payload);
    } else if (data.type === 'dice-roll-start') {
        openDiceModal();
        const modalDiceContainer = document.getElementById('modal-dice-container');
        modalDiceContainer.innerHTML = '<h2>Lanzando dados...</h2>';
    }
}

/**
 * El anfitrión envía el estado del juego a todos los invitados.
 */
function broadcastGameState() {
    if (connectionState.role !== 'host') return;

    const payload = {
        gameState: window.gameState,
        gameTitle: document.getElementById('game-title-input').value,
        gameDescription: document.getElementById('game-description').value,
        gameInstructions: document.getElementById('game-instructions').value,
        diceMaxValue: document.getElementById('dice-max-value').value,
        allowDuplicateRolls: document.getElementById('allow-duplicate-rolls-checkbox').checked,
    };

    const dataToSend = { type: 'game-state', payload };
    connectionState.guestConnections.forEach(conn => conn.send(dataToSend));
    console.log('Game state broadcasted.');
}

/**
 * El anfitrión envía un mensaje específico a todos los invitados.
 */
function broadcastMessage(type, payload) {
    if (connectionState.role !== 'host') return;
    connectionState.guestConnections.forEach(conn => conn.send({ type, payload }));
}

/**
 * Actualiza el estado del juego en el lado del invitado.
 */
function updateGameState(payload) {
    Object.assign(window.gameState, payload.gameState);

    document.getElementById('game-title-input').value = payload.gameTitle;
    document.getElementById('game-description').value = payload.gameDescription;
    document.getElementById('game-instructions').value = payload.gameInstructions;
    document.getElementById('game-title').textContent = payload.gameTitle || "Juego de Dados y Pruebas";
    
    document.getElementById('dice-max-value').value = payload.diceMaxValue;
    document.getElementById('allow-duplicate-rolls-checkbox').checked = payload.allowDuplicateRolls;

    window.updatePlayerList();
    window.updateChallengeList();
    window.updateDeactivatedChallengeList();
    window.updateCurrentChallengeDisplay();
    window.updatePlayerLevels();
    window.updateRoundsLog();
}

/**
 * Actualiza el indicador visual de conexión.
 */
function updateConnectionDisplay() {
    if (connectionState.isConnected) {
        connectionIndicator.className = 'connected';
        connectionIndicator.title = 'Conectado';
    } else {
        connectionIndicator.className = 'disconnected';
        connectionIndicator.title = 'Desconectado';
    }
    userRoleSpan.textContent = `Rol: ${connectionState.role} | Nombre: ${connectionState.name}`;
}

/**
 * Deshabilita los controles para los invitados.
 */
function disableControlsForGuests() {
    document.querySelectorAll('input, button, textarea').forEach(el => {
        if (!['theme-toggle', 'exit-game-btn'].includes(el.id)) {
            el.disabled = true;
        }
    });
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.disabled = false);
}

/**
 * Sale del juego y vuelve a la página de inicio.
 */
function exitGame() {
    if (confirm('¿Seguro que quieres salir?')) {
        if (connectionState.peer) connectionState.peer.destroy();
        window.location.href = 'landing.html';
    }
}

/**
 * Sobrescribe las funciones del juego para que el anfitrión
 * notifique a los invitados después de cada acción.
 */
function setupHostFunctionOverrides() {
    const originalFunctions = {
        addPlayer: window.addPlayer,
        addChallenge: window.addChallenge,
        startGame: window.startGame,
        rollDice: window.rollDice,
        resetGame: window.resetGame,
    };

    const overrideAndBroadcast = (funcName) => {
        window[funcName] = (...args) => {
            originalFunctions[funcName].apply(null, args);
            broadcastGameState();
        };
    };

    Object.keys(originalFunctions).forEach(funcName => {
        if (funcName !== 'rollDice') {
            overrideAndBroadcast(funcName);
        }
    });

    window.rollDice = (...args) => {
        broadcastMessage('dice-roll-start');
        originalFunctions.rollDice.apply(null, args);
        setTimeout(broadcastGameState, 3000); 
    };

    document.getElementById('game-title-input').addEventListener('input', broadcastGameState);
    document.getElementById('game-description').addEventListener('input', broadcastGameState);
}

// Iniciar la conexión cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', initConnection);