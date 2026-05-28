const gameListeners = {};

export function on(event, callback) {
  if (!gameListeners[event]) {
    gameListeners[event] = [];
  }
  gameListeners[event].push(callback);
}

export function emit(event, ...args) {
  const listeners = gameListeners[event];
  if (!listeners) return;

  for (const cb of listeners) {
    cb(...args);
  }
}

//not used currently
export function off(event, callback) {
  if (!gameListeners[event]) return;
  gameListeners[event] = gameListeners[event].filter(cb => cb !== callback);
}