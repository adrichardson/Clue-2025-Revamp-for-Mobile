import { TOASTS, TOAST_DURATIONS } from "../../../../shared/data/index.js";

export function showToast(text, type = TOASTS.INFO, duration = TOAST_DURATIONS.ALERT) {

  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }

  toast.className = "toast";
  toast.classList.add(`toast-${type}`);
  toast.textContent = text;
  toast.classList.add("visible");

  toast.addEventListener("click", (e) => {
    e.currentTarget.classList.remove("visible");
  });

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove("visible");
  }, duration);
}

export function hideToast() {
  let toast = document.getElementById("toast");
  toast?.classList.remove("visible");
}

export function fitText(el, max = 1.5, min = 0.7) {

  const original = el.textContent;
  const canWrap = original.includes(" ");
  let bestSize = min;

  function fits(size, nowrap) {
    el.style.fontSize = `${size}rem`;
    el.style.whiteSpace = nowrap ? "nowrap" : "normal";

    return (
      el.scrollWidth <= el.clientWidth &&
      el.scrollHeight <= el.clientHeight
    );
  }

  if (!canWrap) {
    let size = max;

    while (size >= min) {
      if (fits(size, true)) {
        bestSize = size;
        break;
      }
      size -= 0.05;
    }
  } else {
    let size = max;
    
    while (size >= min) {
      if (fits(size, false)) {
        bestSize = size;
        break;
      }
      size -= 0.05;
    }
  }

  el.style.fontSize = `${bestSize}rem`;
  el.style.whiteSpace = canWrap ? "normal" : "nowrap";
}