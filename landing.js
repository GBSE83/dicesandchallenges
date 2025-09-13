// Language translations for landing page
const landingTranslations = {
    es: {
        welcomeMessage: "Bienvenido al Juego de Dados y Pruebas",
        landingInstructions: "Elige una de las siguientes opciones para comenzar:",
        hostTitle: "Opción 1: Anfitrión",
        hostDescription: "Crea una nueva partida y comparte el código con tus amigos para que puedan unirse como invitados.",
        hostNameLabel: "Tu nombre:",
        createGameBtn: "Crear partida",
        guestTitle: "Opción 2: Invitado",
        guestDescription: "Únete a una partida existente con el código proporcionado por el anfitrión.",
        guestNameLabel: "Tu nombre:",
        accessCodeLabel: "Código de acceso:",
        joinGameBtn: "Unirse a partida",
        hostCodeTitle: "Tu código de acceso",
        hostCodeInstructions: "Comparte este código con los invitados para que puedan unirse a tu partida:",
        copyCodeBtn: "Copiar",
        connectedUsersTitle: "Usuarios conectados:",
        startAsHostBtn: "Comenzar partida",
        hostStartNote: "Puedes comenzar la partida sin invitados o esperar a que se conecten.",
        errorTitle: "Error",
        errorOkBtn: "Aceptar",
        footerText: "Juego de Dados y Pruebas 2025",
        emptyNameError: "Por favor, introduce tu nombre",
        emptyCodeError: "Por favor, introduce el código de acceso",
        invalidCodeError: "El código de acceso no es válido",
        connectionErrorPrefix: "Error de conexión: ",
        codeCopied: "Código copiado",
        waitingForHostTitle: "Esperando al anfitrión",
        waitingForHostMessage: "Por favor, espera a que el anfitrión comience la partida.",
        cancelButton: "Cancelar"
    },
    en: {
        welcomeMessage: "Welcome to the Dice and Challenge Game",
        landingInstructions: "Choose one of the following options to start:",
        hostTitle: "Option 1: Host",
        hostDescription: "Create a new game and share the code with your friends so they can join as guests.",
        hostNameLabel: "Your name:",
        createGameBtn: "Create Game",
        guestTitle: "Option 2: Guest",
        guestDescription: "Join an existing game with the code provided by the host.",
        guestNameLabel: "Your name:",
        accessCodeLabel: "Access Code:",
        joinGameBtn: "Join Game",
        hostCodeTitle: "Your Access Code",
        hostCodeInstructions: "Share this code with guests so they can join your game:",
        copyCodeBtn: "Copy",
        connectedUsersTitle: "Connected Users:",
        startAsHostBtn: "Start Game",
        hostStartNote: "You can start the game without guests or wait for them to connect.",
        errorTitle: "Error",
        errorOkBtn: "OK",
        footerText: "Dice and Challenge Game 2025",
        emptyNameError: "Please enter your name",
        emptyCodeError: "Please enter the access code",
        invalidCodeError: "The access code is not valid",
        connectionErrorPrefix: "Connection Error: ",
        codeCopied: "Code copied",
        waitingForHostTitle: "Waiting for host",
        waitingForHostMessage: "Please wait for the host to start the game.",
        cancelButton: "Cancel"
    }
};

let landingState = {
    role: null,
    name: '',
    accessCode: '',
    isDarkMode: false,
    currentLanguage: 'es'
};

// DOM elements
const hostOption = document.getElementById('host-option');
const guestOption = document.getElementById('guest-option');
const createGameBtn = document.getElementById('create-game-btn');
const joinGameBtn = document.getElementById('join-game-btn');
const hostForm = document.getElementById('host-form');
const guestForm = document.getElementById('guest-form');
const hostNameInput = document.getElementById('host-name-input');
const guestNameInput = document.getElementById('guest-name-input');
const accessCodeInput = document.getElementById('access-code-input');
const codeDisplayContainer = document.getElementById('access-code-container');
const generatedCodeSpan = document.getElementById('generated-code');
const copyCodeBtn = document.getElementById('copy-code-btn');
const startAsHostBtn = document.getElementById('start-as-host-btn');
const themeToggle = document.getElementById('theme-toggle');
const languageToggle = document.getElementById('language-toggle');
const errorModal = document.getElementById('error-modal');
const errorMessage = document.getElementById('error-message');
const errorOkBtn = document.getElementById('error-ok-btn');
const closeErrorBtn = document.getElementById('close-error-modal');

// Initial state and event listeners
document.addEventListener('DOMContentLoaded', init);
themeToggle.addEventListener('click', toggleTheme);
languageToggle.addEventListener('click', toggleLanguage);
createGameBtn.addEventListener('click', createHostGame);
joinGameBtn.addEventListener('click', joinGuestGame);
copyCodeBtn.addEventListener('click', copyAccessCode);
startAsHostBtn.addEventListener('click', startHostGame);
errorOkBtn.addEventListener('click', hideError);
closeErrorBtn.addEventListener('click', hideError);

function init() {
    updateTextBasedOnLanguage();
    applyTheme(landingState.isDarkMode);
}

function updateTextBasedOnLanguage() {
    const lang = landingState.currentLanguage;
    document.getElementById('landing-title').textContent = landingTranslations[lang].welcomeMessage;
    document.getElementById('landing-instructions').textContent = landingTranslations[lang].landingInstructions;
    document.getElementById('host-title').textContent = landingTranslations[lang].hostTitle;
    document.getElementById('host-description').textContent = landingTranslations[lang].hostDescription;
    document.getElementById('host-name-label').textContent = landingTranslations[lang].hostNameLabel;
    document.getElementById('create-game-btn').textContent = landingTranslations[lang].createGameBtn;
    document.getElementById('guest-title').textContent = landingTranslations[lang].guestTitle;
    document.getElementById('guest-description').textContent = landingTranslations[lang].guestDescription;
    document.getElementById('guest-name-label').textContent = landingTranslations[lang].guestNameLabel;
    document.getElementById('access-code-label').textContent = landingTranslations[lang].accessCodeLabel;
    document.getElementById('join-game-btn').textContent = landingTranslations[lang].joinGameBtn;
    document.getElementById('host-code-title').textContent = landingTranslations[lang].hostCodeTitle;
    document.getElementById('host-code-instructions').textContent = landingTranslations[lang].hostCodeInstructions;
    document.getElementById('copy-code-btn').textContent = landingTranslations[lang].copyCodeBtn;
    document.getElementById('start-as-host-btn').textContent = landingTranslations[lang].startAsHostBtn;
    document.getElementById('host-note').textContent = landingTranslations[lang].hostStartNote;
    document.getElementById('landing-footer-text').innerHTML = `${landingTranslations[lang].footerText} &copy; ${new Date().getFullYear()}`;
    document.getElementById('error-title').textContent = landingTranslations[lang].errorTitle;
    document.getElementById('error-ok-btn').textContent = landingTranslations[lang].errorOkBtn;
}

function applyTheme(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>`;
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" class="moon-icon"></path><circle cx="12" cy="12" r="5" class="sun-icon"></circle><line x1="12" y1="1" x2="12" y2="3" class="sun-icon"></line><line x1="12" y1="21" x2="12" y2="23" class="sun-icon"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" class="sun-icon"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" class="sun-icon"></line><line x1="1" y1="12" x2="3" y2="12" class="sun-icon"></line><line x1="21" y1="12" x2="23" y2="12" class="sun-icon"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" class="sun-icon"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" class="sun-icon"></line></svg>`;
    }
}

function toggleLanguage() {
    landingState.currentLanguage = landingState.currentLanguage === 'es' ? 'en' : 'es';
    updateTextBasedOnLanguage();
}

function toggleTheme() {
    landingState.isDarkMode = !landingState.isDarkMode;
    applyTheme(landingState.isDarkMode);
}

function createHostGame() {
    const playerName = hostNameInput.value.trim();
    if (playerName === '') {
        showError(landingTranslations[landingState.currentLanguage].emptyNameError);
        return;
    }
    
    // Generate a simple, unique access code
    const accessCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    landingState.accessCode = accessCode;
    
    // Hide host creation form and show the start game button
    hostForm.style.display = 'none';
    guestOption.style.display = 'none';
    codeDisplayContainer.style.display = 'block';
    startAsHostBtn.style.display = 'block';
    
    generatedCodeSpan.textContent = accessCode;
}

function startHostGame() {
    const playerName = hostNameInput.value.trim();
    if (playerName === '') {
        showError(landingTranslations[landingState.currentLanguage].emptyNameError);
        return;
    }
    const accessCode = landingState.accessCode;
    const url = `game.html?role=host&name=${encodeURIComponent(playerName)}&accessCode=${encodeURIComponent(accessCode)}&darkMode=${landingState.isDarkMode}&language=${landingState.currentLanguage}`;
    window.location.href = url;
}

function joinGuestGame() {
    const playerName = guestNameInput.value.trim();
    const accessCode = accessCodeInput.value.trim();
    if (playerName === '') {
        showError(landingTranslations[landingState.currentLanguage].emptyNameError);
        return;
    }
    if (accessCode === '') {
        showError(landingTranslations[landingState.currentLanguage].emptyCodeError);
        return;
    }
    
    // Redirect immediately to the game page, which will handle the connection
    const url = `game.html?role=guest&name=${encodeURIComponent(playerName)}&accessCode=${encodeURIComponent(accessCode)}&darkMode=${landingState.isDarkMode}&language=${landingState.currentLanguage}`;
    window.location.href = url;
}

function copyAccessCode() {
    navigator.clipboard.writeText(generatedCodeSpan.textContent)
        .then(() => {
            alert(landingTranslations[landingState.currentLanguage].codeCopied);
        })
        .catch(err => {
            console.error('Error al copiar: ', err);
            alert('Error al copiar el código. Intenta copiarlo manualmente.');
        });
}

function showError(message) {
    errorMessage.textContent = message;
    errorModal.style.display = 'flex';
}

function hideError() {
    errorModal.style.display = 'none';
}