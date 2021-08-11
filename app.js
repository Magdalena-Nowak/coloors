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
const controlsLockBtns = document.querySelectorAll(
  ".colors__panel-controls--lock-btn"
);

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
  const sliders = document.querySelectorAll(".colors__sliders input");
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

const lockChangingColor = (index) => {
  controlsLockBtns[index].classList.toggle("locked");
  if (controlsLockBtns[index].classList.contains("locked") === true) {
    controlsLockBtns[index].innerHTML = `<i class="fas fa-lock"></i>`;
    controlsAdjustBtns[index].style.pointerEvents = "none";
  } else {
    controlsLockBtns[index].innerHTML = `<i class="fas fa-lock-open"></i>`;
    controlsAdjustBtns[index].style.pointerEvents = "all";
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
  const popupBox = popupContainer.children[1];
  popupContainer.classList.add("active");
  popupBox.classList.add("active");
};

// Implement Save to palette and Local Storage
const optionsBtns = document.querySelectorAll(".options div");
const containerPopsup = popupContainer.querySelectorAll("div");
const saveBtn = document.querySelector(".container__popup-save-btn");
const libraryContainer = document.querySelector(".container__popup--library");
const closeLibraryBtn = document.querySelector(
  ".container__popup--library button"
);
const closeSavingBtn = document.querySelector(
  ".container__popup--saving button"
);
const saveInput = document.querySelector(".container__popup-name");

optionsBtns.forEach((button, index) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("options__refresh")) return;
    popupContainer.classList.add("active");
    containerPopsup[index].classList.add("active");
  });
});

const closingLibrary = () => {
  popupContainer.classList.remove("active");
  closeLibraryBtn.parentElement.classList.remove("active");
};

const closingSaving = () => {
  popupContainer.classList.remove("active");
  closeSavingBtn.parentElement.classList.remove("active");
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

const savePalette = (e) => {
  popupContainer.classList.remove("active");
  closeSavingBtn.parentElement.classList.remove("active");
  const paletteName = saveInput.value;
  const colorsInPalette = [];

  currentHexes.forEach((hex) => {
    colorsInPalette.push(hex.innerText);
  });

  // Generate Object

  let paletteNr;
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (paletteObjects) {
    paletteNr = paletteObjects.length;
  } else {
    paletteNr = savedPalettes.length;
  }

  const paletteObj = { paletteName, colorsInPalette, nr: paletteNr };
  savedPalettes.push(paletteObj);
  console.log(`saving - paletteNr: ${paletteNr}`);
  savetoLocal(paletteObj);
  saveInput.value = "";

  // Generate palette in Library

  const palette = document.createElement("div");
  palette.classList.add("library-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.paletteName;
  title.classList.add("library-palette__header");
  const preview = document.createElement("div");
  preview.classList.add("library-palette__colors-preview");
  paletteObj.colorsInPalette.forEach((color) => {
    const smallDiv = document.createElement("div");
    smallDiv.classList.add("library-palette__color");
    preview.appendChild(smallDiv);
    smallDiv.style.backgroundColor = color;
  });
  const pickPaletteBtn = document.createElement("button");
  pickPaletteBtn.classList.add("library-palette__pick-btn");
  pickPaletteBtn.classList.add(paletteObj.nr);
  pickPaletteBtn.innerText = "Select";
  const removePaletteBtn = document.createElement("button");
  removePaletteBtn.classList.add("library-palette__remove-btn");
  removePaletteBtn.classList.add(paletteObj.nr);
  removePaletteBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;

  //Attach event to the btns
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
  });

  removePaletteBtn.addEventListener("click", (e) => {
    const paletteIndex = e.target.classList[1];
    delete savedPalettes[paletteIndex];
    // localStorage.removeItem(palettes);
    console.log(paletteObjects[paletteIndex]);
    libraryContainer.removeChild(e.target.parentElement);
  });

  //Append to library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(pickPaletteBtn);
  palette.appendChild(removePaletteBtn);
  libraryContainer.appendChild(palette);
};

const getLocal = () => {
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));

    savedPalettes = [...paletteObjects];
    paletteObjects.forEach((paletteObj) => {
      const palette = document.createElement("div");
      palette.classList.add("library-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.paletteName;
      title.classList.add("library-palette__header");
      const preview = document.createElement("div");
      preview.classList.add("library-palette__colors-preview");
      paletteObj.colorsInPalette.forEach((color) => {
        const smallDiv = document.createElement("div");
        smallDiv.classList.add("library-palette__color");
        preview.appendChild(smallDiv);
        smallDiv.style.backgroundColor = color;
      });
      const pickPaletteBtn = document.createElement("button");
      pickPaletteBtn.classList.add("library-palette__pick-btn");
      pickPaletteBtn.classList.add(paletteObj.nr);
      pickPaletteBtn.innerText = "Select";
      const removePaletteBtn = document.createElement("button");
      removePaletteBtn.classList.add("library-palette__remove-btn");
      removePaletteBtn.classList.add(paletteObj.nr);
      removePaletteBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;

      //Attach event to the btn
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
      });

      removePaletteBtn.addEventListener("click", (e) => {
        const paletteIndex = e.target.classList[1];
        delete savedPalettes[paletteIndex];
        // localStorage.removeItem("palettes");
        console.log(paletteObjects[paletteIndex]);
        libraryContainer.removeChild(e.target.parentElement);
      });

      //Append to library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(pickPaletteBtn);
      palette.appendChild(removePaletteBtn);
      libraryContainer.appendChild(palette);
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

controlsLockBtns.forEach((button, index) => {
  button.addEventListener("click", () => lockChangingColor(index));
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

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

closeLibraryBtn.addEventListener("click", closingLibrary);
closeSavingBtn.addEventListener("click", closingSaving);
saveBtn.addEventListener("click", savePalette);

popupContainer.addEventListener("transitionend", () => {
  const popupBox = popupContainer.children[1];
  popupContainer.classList.remove("active");
  popupBox.classList.remove("active");
});

getLocal();
// localStorage.clear();
randomColors();

const myLocal = JSON.parse(localStorage.getItem("palettes"));

console.log(myLocal);
