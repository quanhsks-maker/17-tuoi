import { getCurrentUser } from './core/auth.js';
import { getPlayerProgress, savePlayerProgress } from './core/storage.js';
import { initAuthUI } from './ui/authUI.js';
import { initChoiceUI } from './ui/choiceUI.js';
import { GameEngine } from './core/gameEngine.js';
import { initHudUI } from './ui/hudUI.js';

let activeEngine = null;

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function enterWorld(user, save) {
  showScreen('world-screen');
  const canvas = document.getElementById('game-canvas');

  if (activeEngine) activeEngine.stop();

  activeEngine = new GameEngine(
    canvas,
    save.position,
    () => {},
    (x, y) => {
      save.position.x = x;
      save.position.y = y;
      savePlayerProgress(user.user_id, save);
    }
  );

  initHudUI(user, save, activeEngine);
  activeEngine.start();
}

function handleLoginSuccess(user) {
  const save = getPlayerProgress(user.user_id);
  if (!save || !save.is_initialized) {
    showScreen('choice-screen');
    initChoiceUI(user, (updatedSave) => {
      enterWorld(user, updatedSave);
    });
  } else {
    enterWorld(user, save);
  }
}

initAuthUI(handleLoginSuccess);

const currentUser = getCurrentUser();
if (currentUser) {
  handleLoginSuccess(currentUser);
} else {
  showScreen('auth-screen');
}
