 export function showToast(text) {
    let toast = document.getElementById("debug-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "debug-toast";
      document.body.appendChild(toast);

      Object.assign(toast.style, {
        position: "fixed",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.85)",
        color: "#fff",
        padding: "8px 14px",
        borderRadius: "8px",
        fontSize: "14px",
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 0.2s"
      });
    }

    toast.textContent = text;
    toast.style.opacity = 1;

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = 0;
    }, 1200);
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