export const state = {
  boardImage: new Image(),
  imageLoaded: false,

  camera: {
    x: 0,
    y: 0,
    scale: 1,
    minScale: 1,
    maxScale: 3
  },

  circle: {
    x: 0,
    y: 0,
    radius: 20,
    dragging: false,
    dragPointerId: null
  }
};
