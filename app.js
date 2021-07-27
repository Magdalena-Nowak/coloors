// //Global selections and variables
const colorDivs = document.querySelectorAll(".color");
const sliders = document.querySelectorAll('input[type="range"]');
let initialColors;
const currentHexes = document.querySelectorAll(".color--header");
const popup = document.querySelector(".copy__container");
const adjustBtns = document.querySelectorAll(".controls--adjust");
const slidersContainer = document.querySelectorAll(".sliders");
const slidersAdjustmentClose = document.querySelectorAll(".sliders--close");
const refreshBtn = document.querySelector(".panel--refresh");
const lockBtns = document.querySelectorAll(".controls--lock");

let savedPalettes = [];
// Add event listeners

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

adjustBtns.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

lockBtns.forEach((button, index) => {
  button.addEventListener("click", () => lockChangeColor(index));
});

refreshBtn.addEventListener("click", randomColors);

slidersAdjustmentClose.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

// // Generate new color in HEX

function generateHex() {
  // ZAMIANA PĘTLI NA WERSJĘ Z BIBLIOTEKĄ CHROMA.JS
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    const controlsBtns = div.querySelectorAll(".color--controls button");

    //Ckeck for contrast
    checkTextContrast(randomColor, hexText, controlsBtns);

    // Initial colorize Sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });

  //Reset Inputs
  resetInputs();
}

function checkTextContrast(color, text, controlsBtns) {
  const luminColor = chroma(color).luminance();
  // DODAĆ OPCJĘ ZMIANY KOLORÓW IKON RAZEM Z TEKSTEM
  if (luminColor < 0.5) {
    text.style.color = "white";
    controlsBtns.forEach((btn) => (btn.style.color = "white"));
  } else {
    text.style.color = "black";
    controlsBtns.forEach((btn) => (btn.style.color = "black"));
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
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
  saturation.value = color.hsl()[1];
  brightness.value = color.hsl()[2];
  hue.value = color.hsl()[0];
}

function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
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
}

function resetInputsNew(index, color) {
  const sliders = document.querySelectorAll(".sliders");
  const sliderInputs = sliders[index].querySelectorAll("input");
  sliderInputs.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
      const sliderHue = slider;
      return sliderHue
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      console.log(brightColor);
      const brightValue = chroma(brightColor).hsl()[2];
      console.log(brightValue);
      slider.value = Math.floor(brightValue * 100) / 100;
      const sliderBright = slider;
      return sliderBright
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
      const sliderSat = slider;
      return sliderSat
    }
    // const newColor = chroma(color);
    colorizeSliders(color, sliderHue, sliderBright, sliderSat);
  });
}

function hslControls(e) {
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
  colorDivs[index].style.backgroundColor = color;
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h1");
  const icons = activeDiv.querySelectorAll(".controls i");
  textHex.innerText = color.hex();
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function copyToClipboard(hex) {
  const hexText = document.createElement("textarea");
  hexText.value = hex.innerText;
  document.body.appendChild(hexText);
  hexText.select();
  document.execCommand("copy");
  document.body.removeChild(hexText);
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
  slidersContainer[index].classList.toggle("active");
}

function lockChangeColor(index) {
  colorDivs[index].classList.toggle("locked");
  if (colorDivs[index].classList.contains("locked") == true) {
    lockBtns[index].innerHTML = `<i class="fas fa-lock"></i>`;
    adjustBtns[index].style.pointerEvents = "none";
  } else {
    lockBtns[index].innerHTML = `<i class="fas fa-lock-open"></i>`;
    adjustBtns[index].style.pointerEvents = "all";
  }
}

function closeAdjustmentPanel(index) {
  slidersContainer[index].classList.remove("active");
}

// // Implement Save to palette and Local Storage

const saveContainer = document.querySelector(".save__container");
const submitSave = document.querySelector(".save__submit");
const saveInput = document.querySelector(".save__name");
const closeSave = document.querySelector(".save__close");
const saveBtn = document.querySelector(".panel--save");
const openLibraryBtn = document.querySelector(".panel--library");
const libraryContainer = document.querySelector(".library__container");
const libraryBtn = document.querySelector(".pick-palette-btn");
const closeLibraryBtn = document.querySelector(".library__close");

saveBtn.addEventListener("click", openPalette);

function openPalette() {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}

closeSave.addEventListener("click", closePalette);

function closePalette() {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}

submitSave.addEventListener("click", savePalette);

function savePalette(e) {
  saveContainer.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });

  //generate Object
  let paletteNr;
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  if (!paletteObjects) {
    palleteNr = paletteObjects.length;
  } else {
    paletteNr = savedPalettes.length;
  }

  const paletteObj = { name, colors, nr: paletteNr };
  savedPalettes.push(paletteObj);

  //Save to local storage
  savetoLocal(paletteObj);
  saveInput.value = "";
  //Generate the palette library
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.classList.add("preview-color");
    preview.appendChild(smallDiv);
    smallDiv.style.backgroundColor = smallColor;
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = "Select";
  const paletteRemoveBtn = document.createElement("button");
  paletteRemoveBtn.classList.add("delete-palette-btn");
  paletteRemoveBtn.classList.add(paletteObj.nr);
  paletteRemoveBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;

  //Attach event to the btn
  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const hexText = colorDivs[index].children[0];
      hexText.innerText = color;
      const controlsBtns = colorDivs[index].querySelectorAll(
        ".color--controls button"
      );
      checkTextContrast(color, hexText, controlsBtns);
      resetInputsNew(index, color);
    });
  });

  paletteRemoveBtn.addEventListener("click", (e) => {
    const paletteIndex = e.target.classList[1];
    const libraryPopup = document.querySelector(".library__container--popup");
    savedPalettes.slice(paletteIndex, paletteIndex + 1);
    libraryPopup.removeChild(e.target.parentElement);
  });

  // Append to library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  palette.appendChild(paletteRemoveBtn);
  libraryContainer.children[0].appendChild(palette);
}

function savetoLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

openLibraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

function openLibrary() {
  libraryContainer.classList.add("active");
}

function closeLibrary() {
  libraryContainer.classList.remove("active");
}

function getLocal() {
  // let localPalettes;
  // if (localStorage.getItem("palettes") === null) {
  //   localPalettes = [];
  // } else {
  //   const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  //   savedPalettes = [...paletteObjects];
  //   console.log(savedPalettes);
  //   savedPalettes.forEach((paletteObj) => {
  //     //Generate the palette library
  //     const palette = document.createElement("div");
  //     palette.classList.add("custom-palette");
  //     const title = document.createElement("h4");
  //     title.innerText = paletteObj.name;
  //     const preview = document.createElement("div");
  //     preview.classList.add("small-preview");
  //     paletteObj.colors.forEach((smallColor) => {
  //       const smallDiv = document.createElement("div");
  //       smallDiv.classList.add("preview-color");
  //       preview.appendChild(smallDiv);
  //       smallDiv.style.backgroundColor = smallColor;
  //     });
  //     const paletteBtn = document.createElement("button");
  //     paletteBtn.classList.add("pick-palette-btn");
  //     paletteBtn.classList.add(paletteObj.nr);
  //     paletteBtn.innerText = "Select";
  //     const paletteRemoveBtn = document.createElement("button");
  //     paletteRemoveBtn.classList.add("delete-palette-btn");
  //     paletteRemoveBtn.classList.add(paletteObj.nr);
  //     paletteRemoveBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;
  //     //Attach event to the btn
  //     paletteBtn.addEventListener("click", (e) => {
  //       closeLibrary();
  //       initialColors = [];
  //       paletteObjects[paletteIndex].colors.forEach((color, index) => {
  //         initialColors.push(color);
  //         colorDivs[index].style.backgroundColor = color;
  //         const text = colorDivs[index].children[0];
  // updateTextUI(index);
  //       });
  //     });
  //     // resetInputs();
  //     // Append to library
  //     palette.appendChild(title);
  //     palette.appendChild(preview);
  //     palette.appendChild(paletteBtn);
  //     palette.appendChild(paletteRemoveBtn);
  //     libraryContainer.children[0].appendChild(palette);
  //     // paletteRemoveBtn.addEventListener("click", (e) => {
  //     // });
  //   });
  // }
}
getLocal();
// localStorage.clear();
randomColors();
