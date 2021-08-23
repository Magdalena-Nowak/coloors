// //Global selections and variables
const colorsPanels = document.querySelectorAll(".colors__panel");
const sliders = document.querySelectorAll('input[type="range"]');
let initialColors;
const currentHexes = document.querySelectorAll(".colors__panel-header");
const popupContainer = document.querySelector(".container");
const controlsAdjustBtns = document.querySelectorAll(
  ".colors__panel-controls--adjust-btn"
);
const slidersContainer = document.querySelectorAll(".colors__sliders");
const slidersAdjustmentClose = document.querySelectorAll(".sliders__close-btn");
const refreshBtn = document.querySelector(".options__refresh");
const lockBtns = document.querySelectorAll(".colors__panel-controls--lock-btn");
const clipboardContainer = document.querySelector(".clipboard");
const closeSavePanelBtn = document.querySelector(".save__popup-close-btn");
const saveContainer = document.querySelector(".save");
const optionSaveBtn = document.querySelector(".options__save");
const saveBtn = document.querySelector(".save__popup-save-btn");
const saveInput = document.querySelector(".save__popup-name");
const openLibraryBtn = document.querySelector(".options__library");
const libraryContainer = document.querySelector(".library");
const libraryCloseBtn = document.querySelector(".library__popup-close-btn");
const libraryPopup = document.querySelector(".library__popup");
let removePaletteBtn,
  pickPaletteBtn,
  smallLibraryDiv,
  libraryPreview,
  libraryTitle,
  libraryPalette,
  paletteNr;
let savedPalettes = [];

const generateHex = () => {
  const hexColor = chroma.random();
  return hexColor;
};

const checkTextContrast = (color, text, controls) => {
  const luminColor = chroma(color).luminance();
  if (luminColor < 0.5) {
    text.style.color = "white";
    controls.forEach((btn) => (btn.style.color = "white"));
  } else {
    text.style.color = "black";
    controls.forEach((btn) => (btn.style.color = "black"));
  }
};

const resetInputs = () => {
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
};

const colorizeSliders = (color, hue, brightness, saturation) => {
  //Scale Saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  // Scale brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  // Update Input Colors
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
    0
  )}, ${midBright}, ${scaleBright(1)}`;
  hue.style.backgroundImage = `linear-gradient(to right, black,  red, orange, yellow, green, cyan, blue, indigo, violet, grey)`;
};

const randomColors = () => {
  initialColors = [];
  colorsPanels.forEach((panel, index) => {
    const hexText = panel.children[0];
    const randomColor = generateHex();

    if (panel.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }
    panel.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    const controlsBtns = panel.querySelectorAll(
      ".colors__panel-controls button"
    );

    //Ckeck for contrast
    checkTextContrast(randomColor, hexText, controlsBtns);

    // Initial colorize Sliders
    const sliders = panel.querySelectorAll(".colors__sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(randomColor, hue, brightness, saturation);
  });

  //Reset Inputs
  resetInputs();
};

const openAdjustmentPanel = (index) => {
  slidersContainer[index].classList.toggle("active");
};

// Generate new color in HEX

const hslControls = (e) => {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-sat");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];
  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);
  colorsPanels[index].style.backgroundColor = color;
  colorizeSliders(color, hue, brightness, saturation);
};

const updateTextUI = (index) => {
  const activeDiv = colorsPanels[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h1");
  const icons = activeDiv.querySelectorAll(".colors__panel-controls button");
  textHex.innerText = color.hex();
  //Check Contrast
  checkTextContrast(color, textHex, icons);
};

const colorBlocking = (e) => {
  e.target.parentElement.parentElement.classList.toggle("locked");
  if (
    e.target.parentElement.parentElement.classList.contains("locked") === true
  ) {
    e.target.innerHTML = `<i class="fas fa-lock"></i>`;
    e.target.firstChild.style.pointerEvents = "none";
  } else {
    e.target.innerHTML = `<i class="fas fa-lock-open"></i>`;
    e.target.firstChild.style.pointerEvents = "none";
  }
};

const closeAdjustmentPanel = (index) => {
  slidersContainer[index].classList.remove("active");
};

// Copy to clipboard

const copyToClipboard = (hex) => {
  const hexText = document.createElement("textarea");
  hexText.value = hex.innerText;
  document.body.appendChild(hexText);
  hexText.select();
  document.execCommand("copy");
  document.body.removeChild(hexText);
  clipboardContainer.classList.add("active");
  clipboardContainer.children[0].classList.add("active");
};

const openSave = () => {
  saveContainer.classList.add("active");
  saveContainer.children[0].classList.add("active");
};

const closingSavePanel = (e) => {
  saveContainer.classList.remove("active");
  saveContainer.children[0].classList.remove("active");
};

const openingLibrary = () => {
  libraryContainer.classList.add("active");
  libraryContainer.children[0].classList.add("active");
};

const closingLibrary = () => {
  libraryContainer.classList.remove("active");
  libraryContainer.children[0].classList.remove("active");
};

const savetoLocal = (paletteObj) => {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
};

const createPaletteDiv = (paletteObj) => {
  // Generate palette in Library
  libraryPalette = document.createElement("div");
  libraryPalette.classList.add("library-palette");
  libraryTitle = document.createElement("h4");
  libraryTitle.innerText = paletteObj.paletteName;
  libraryTitle.classList.add("library-palette__header");
  libraryPreview = document.createElement("div");
  libraryPreview.classList.add("library-palette__colors-preview");
  paletteObj.colorsInPalette.forEach((color) => {
    smallLibraryDiv = document.createElement("div");
    smallLibraryDiv.classList.add("library-palette__color");
    libraryPreview.append(smallLibraryDiv);
    smallLibraryDiv.style.backgroundColor = color;
  });
  pickPaletteBtn = document.createElement("button");
  pickPaletteBtn.classList.add("library-palette__pick-btn");
  pickPaletteBtn.classList.add(paletteObj.nr);
  pickPaletteBtn.innerText = "Select";
  removePaletteBtn = document.createElement("button");
  removePaletteBtn.classList.add("library-palette__remove-btn");
  removePaletteBtn.classList.add(paletteObj.nr);
  removePaletteBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;
  // Append to library
  libraryPalette.append(
    libraryTitle,
    libraryPreview,
    pickPaletteBtn,
    removePaletteBtn
  );
  libraryPopup.append(libraryPalette);
};

const pickingPalette = () => {
  pickPaletteBtn.addEventListener("click", (e) => {
    closingLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colorsInPalette.forEach((color, index) => {
      initialColors.push(color);
      colorsPanels[index].style.backgroundColor = color;
      const text = colorsPanels[index].children[0];
      updateTextUI(index);
    });

    resetInputs();
    colorsPanels.forEach((panel) => {
      const sliders = panel.querySelectorAll(".colors__sliders input");
      const color = panel.querySelector(".colors__panel-header").textContent;
      const hue = sliders[0];
      const brightness = sliders[1];
      const saturation = sliders[2];
      const colorHsl = chroma(color);
      colorizeSliders(colorHsl, hue, brightness, saturation);
    });
  });
};

const removePalette = () => {
  removePaletteBtn.addEventListener("click", (e) => {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
    const paletteIndex = e.target.classList[1];
    localPalettes = localPalettes.splice(paletteIndex, 1);
    localStorage.setItem("palettes", JSON.stringify(localPalettes));
    e.target.parentElement.remove();
  });
};

const savePalette = (e) => {
  saveContainer.classList.remove("active");
  saveContainer.children[0].classList.remove("active");
  const paletteName = saveInput.value;
  const colorsInPalette = [];

  currentHexes.forEach((hex) => {
    colorsInPalette.push(hex.innerText);
  });

  // Generate Object
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (paletteObjects) {
    paletteNr = paletteObjects.length;
  } else {
    paletteNr = savedPalettes.length;
  }

  const paletteObj = { paletteName, colorsInPalette, nr: paletteNr };
  savedPalettes.push(paletteObj);
  savetoLocal(paletteObj);
  saveInput.value = "";
  createPaletteDiv(paletteObj);

  pickingPalette();
  removePalette();
};

const getLocal = () => {
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    savedPalettes = [...paletteObjects];
    paletteObjects.forEach((paletteObj) => {
      createPaletteDiv(paletteObj);
      pickingPalette();
      removePalette();
    });
  }
};

controlsAdjustBtns.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

slidersAdjustmentClose.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

lockBtns.forEach((button) => {
  button.addEventListener("click", colorBlocking);
});

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorsPanels.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

refreshBtn.addEventListener("click", randomColors);
optionSaveBtn.addEventListener("click", openSave);
currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

libraryCloseBtn.addEventListener("click", closingLibrary);
closeSavePanelBtn.addEventListener("click", closingSavePanel);
saveBtn.addEventListener("click", savePalette);
openLibraryBtn.addEventListener("click", openingLibrary);

clipboardContainer.addEventListener("transitionend", () => {
  clipboardContainer.classList.remove("active");
  clipboardContainer.children[0].classList.remove("active");
});

getLocal();
// localStorage.clear();
randomColors();
