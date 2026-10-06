const slides = [
  { id: 1, label: "Slide 1", folder: "slide1" },
  { id: 2, label: "Slide 2", folder: "slide1" },
  { id: 3, label: "Slide 3", folder: "slide1" },
  { id: 4, label: "Slide 4", folder: "slide1" },
  { id: 5, label: "Slide 5", folder: "slide1" },
  { id: 6, label: "Slide 6", folder: "slide1" }
];

const plainViewport = document.getElementById("plainViewport");
const heatViewport = document.getElementById("heatViewport");
const plainImage = document.getElementById("plainImage");
const heatImage = document.getElementById("heatImage");
const slideList = document.getElementById("slideList");
const slideTitle = document.getElementById("slideTitle");
const currentSlide = document.getElementById("currentSlide");
const zoomReadout = document.getElementById("zoomReadout");
const resetBtn = document.getElementById("resetBtn");

let scale = 1;
let x = 0;
let y = 0;
let activePointer = null;
let lastPointerX = 0;
let lastPointerY = 0;

const activePointers = new Map();
let lastPinchDistance = null;

const MIN_SCALE = 1;
const MAX_SCALE = 8;
const ZOOM_FACTOR = 1.15;

function applyTransform() {
  const viewportWidth = plainViewport.clientWidth;
  const viewportHeight = plainViewport.clientHeight;

  const imageWidth = plainImage.offsetWidth * scale;
  const imageHeight = plainImage.offsetHeight * scale;

  // Maximum amount the image can move while keeping it inside the viewport
  const maxX = Math.max(0, (imageWidth - viewportWidth) / 2);
  const maxY = Math.max(0, (imageHeight - viewportHeight) / 2);

  // Prevent dragging the image completely outside the viewport
  x = Math.min(maxX, Math.max(-maxX, x));
  y = Math.min(maxY, Math.max(-maxY, y));

  const transform = `translate(${x}px, ${y}px) scale(${scale})`;

  plainImage.style.transform = transform;
  heatImage.style.transform = transform;

  zoomReadout.textContent = `${Math.round(scale * 100)}%`;
}

function resetView() {
  scale = 1;
  x = 0;
  y = 0;
  applyTransform();
}

function zoomAt(clientX, clientY, factor) {
  const rect = plainViewport.getBoundingClientRect();
  const mouseX = clientX - rect.left;
  const mouseY = clientY - rect.top;

  const oldScale = scale;
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));

  if (newScale === oldScale) return;

  // Keep the point under the cursor fixed while zooming.
  x = mouseX - (mouseX - x) * (newScale / oldScale);
  y = mouseY - (mouseY - y) * (newScale / oldScale);
  scale = newScale;

  applyTransform();
}

function pointerDown(event) {
  if (event.pointerType === "mouse" && event.button !== 0) return;

  activePointers.set(event.pointerId, {
    x: event.clientX,
    y: event.clientY
  });

  if (activePointers.size === 1) {
    activePointer = event.pointerId;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;

    plainViewport.setPointerCapture(event.pointerId);
    heatViewport.setPointerCapture(event.pointerId);

    plainViewport.classList.add("dragging");
    heatViewport.classList.add("dragging");
  }

  if (activePointers.size === 2) {
    const points = [...activePointers.values()];

    const dx = points[0].x - points[1].x;
    const dy = points[0].y - points[1].y;

    lastPinchDistance = Math.hypot(dx, dy);
  }
}

function pointerMove(event) {
  if (!activePointers.has(event.pointerId)) return;

  activePointers.set(event.pointerId, {
    x: event.clientX,
    y: event.clientY
  });

  // Pinch-to-zoom
  if (activePointers.size === 2) {
    const points = [...activePointers.values()];

    const dx = points[0].x - points[1].x;
    const dy = points[0].y - points[1].y;

    const distance = Math.hypot(dx, dy);

    if (lastPinchDistance !== null) {
      const factor = distance / lastPinchDistance;

      const centerX = (points[0].x + points[1].x) / 2;
      const centerY = (points[0].y + points[1].y) / 2;

      zoomAt(centerX, centerY, factor);
    }

    lastPinchDistance = distance;
    return;
  }

  // Normal one-finger / mouse dragging
  if (activePointer !== event.pointerId) return;

  const dx = event.clientX - lastPointerX;
  const dy = event.clientY - lastPointerY;

  x += dx;
  y += dy;

  lastPointerX = event.clientX;
  lastPointerY = event.clientY;

  applyTransform();
}

function pointerUp(event) {
  activePointers.delete(event.pointerId);

  if (activePointers.size < 2) {
    lastPinchDistance = null;
  }

  if (event.pointerId === activePointer) {
    activePointer = null;
  }

  if (activePointers.size === 0) {
    plainViewport.classList.remove("dragging");
    heatViewport.classList.remove("dragging");
  }
}

function addViewerEvents(viewport) {
  viewport.addEventListener("pointerdown", pointerDown);
  viewport.addEventListener("pointermove", pointerMove);
  viewport.addEventListener("pointerup", pointerUp);
  viewport.addEventListener("pointercancel", pointerUp);

  viewport.addEventListener("wheel", (event) => {
    event.preventDefault();

    const factor = event.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    zoomAt(event.clientX, event.clientY, factor);
  }, { passive: false });
}

function loadSlide(slide) {
  // Prototype: all six buttons currently use slide1.
  // Later, simply change slide.folder to slide2, slide3, etc.
  plainImage.src = "dummy_wsi.jpg";
  heatImage.src = "dummy_heatmap.jpg";

  slideTitle.textContent = slide.label;
  currentSlide.textContent = slide.label;

  document.querySelectorAll(".slide-button").forEach(button => {
    button.classList.toggle("active", Number(button.dataset.id) === slide.id);
  });

  resetView();
}

function buildSlideButtons() {
  slides.forEach((slide, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "slide-button";
    button.dataset.id = slide.id;
    button.textContent = slide.label;
    button.addEventListener("click", () => loadSlide(slide));
    slideList.appendChild(button);
  });
}

resetBtn.addEventListener("click", resetView);

addViewerEvents(plainViewport);
addViewerEvents(heatViewport);
buildSlideButtons();
loadSlide(slides[0]);
