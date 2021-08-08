// //Global selections and variables
const colorsPanels = document.querySelectorAll(".colors__panel");
const sliders = document.querySelectorAll('input[type="range"]');
let initialColors;
const currentHexes = document.querySelectorAll(".colors__panel-header");
const popup = document.querySelector(".container");
const controlsAdjustBtns = document.querySelectorAll(
  ".colors__panel-controls--adjust-btn"
);
const slidersContainer = document.querySelectorAll(".colors__sliders");
const slidersAdjustmentClose = document.querySelectorAll(".sliders__close-btn");
const refreshBtn = document.querySelector(".options__refresh");
const controlsLockBtns = document.querySelectorAll(
  ".colors__panel-controls--lock-btn"
);

// let savedPalettes = [];

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

const resetInputs = () => {
  const sliders = document.querySelectorAll(".colors__panel input");
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
  if (controlsLockBtns[index].classList.contains("locked") == true) {
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
  const popupBox = popup.children[1];
  popup.classList.add("active");
  popupBox.classList.add("active");
}


// // Implement Save to palette and Local Storage

// const saveContainer = document.querySelector(".save__container");
// const submitSave = document.querySelector(".container__popup-save-btn");
// const saveInput = document.querySelector(".save__name");
// const closeSave = document.querySelector(".container__popup-close-btn");
// const saveBtn = document.querySelector(".options__save");
// const openLibraryBtn = document.querySelector(".options__library");
// const libraryContainer = document.querySelector(".library__container");
// const libraryBtn = document.querySelector(".pick-palette-btn");
// const closeLibraryBtn = document.querySelector(".library__popup-close-btn");

// saveBtn.addEventListener("click", openPalette);

// function openPalette() {
//   const popup = saveContainer.children[0];
//   saveContainer.classList.add("active");
//   popup.classList.add("active");
// }

// closeSave.addEventListener("click", closePalette);

// function closePalette() {
//   const popup = saveContainer.children[0];
//   saveContainer.classList.remove("active");
//   popup.classList.remove("active");
// }

// submitSave.addEventListener("click", savePalette);

// function savePalette(e) {
//   // saveContainer.classList.remove("active");
//   // const name = saveInput.value;
//   // const colors = [];
//   // currentHexes.forEach((hex) => {
//   //   colors.push(hex.innerText);
//   // });
//   saveContainer.classList.remove("active");
//   const name = saveInput.value;
//   const colors = [];
//   currentHexes.forEach((hex) => {
//     colors.push(hex.innerText);
//   });
//   // console.log(colors);
//   //generate Object
//   let paletteNr;
//   const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
//   // if (paletteObjects) {
//   //   paletteNr = savedPalettes.length;
//   // } else {
//   //   palleteNr = paletteObjects.length;
//   // }
//   paletteObjects
//     ? (palleteNr = paletteObjects.length)
//     : (paletteNr = savedPalettes.length);

//   console.log(paletteObjects.length);
//   console.log(savedPalettes.length);
//   console.log(paletteNr);
//   // console.log(paletteObjects);
//   // console.log(savedPalettes);
//   const paletteObj = { name, colors, nr: paletteNr };
//   savedPalettes.push(paletteObj);

//   //Save to local storage
//   savetoLocal(paletteObj);
//   saveInput.value = "";
//   //Generate the palette library
//   const palette = document.createElement("div");
//   palette.classList.add("custom-palette");
//   const title = document.createElement("h4");
//   title.innerText = paletteObj.name;
//   const preview = document.createElement("div");
//   preview.classList.add("small-preview");
//   paletteObj.colors.forEach((smallColor) => {
//     const smallDiv = document.createElement("div");
//     smallDiv.classList.add("preview-color");
//     preview.appendChild(smallDiv);
//     smallDiv.style.backgroundColor = smallColor;
//   });
//   const paletteBtn = document.createElement("button");
//   paletteBtn.classList.add("pick-palette-btn");
//   paletteBtn.classList.add(paletteObj.nr);
//   paletteBtn.innerText = "Select";
//   const paletteRemoveBtn = document.createElement("button");
//   paletteRemoveBtn.classList.add("delete-palette-btn");
//   paletteRemoveBtn.classList.add(paletteObj.nr);
//   paletteRemoveBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;

//Attach event to the btn
// paletteBtn.addEventListener("click", (e) => {
//   closeLibrary();
//   const paletteIndex = e.target.classList[1];
//   initialColors = [];
//   savedPalettes[paletteIndex].colors.forEach((color, index) => {
//     initialColors.push(color);
//     colorsPanels[index].style.backgroundColor = color;
//     const hexText = colorsPanels[index].children[0];
//     hexText.innerText = color;
//     const controlsBtns = colorsPanels[index].querySelectorAll(
//       ".colors__panel-controls button"
//     );
//     checkTextContrast(color, hexText, controlsBtns);
//     resetInputsNew(index, color);
//   });
// });

//   paletteRemoveBtn.addEventListener("click", (e) => {
//     const paletteIndex = e.target.classList[1];
//     const libraryPopup = document.querySelector(".library__container--popup");
//     savedPalettes.slice(paletteIndex, paletteIndex + 1);
//     libraryPopup.removeChild(e.target.parentElement);
//   });

//   // Append to library
//   palette.append(title, preview, paletteBtn, paletteRemoveBtn);
//   libraryContainer.children[0].append(palette);
// }

// function savetoLocal(paletteObj) {
//   let localPalettes;
//   if (localStorage.getItem("palettes") === null) {
//     localPalettes = [];
//   } else {
//     localPalettes = JSON.parse(localStorage.getItem("palettes"));
//   }
//   localPalettes.push(paletteObj);
//   localStorage.setItem("palettes", JSON.stringify(localPalettes));
// }

// openLibraryBtn.addEventListener("click", openLibrary);
// closeLibraryBtn.addEventListener("click", closeLibrary);

// function openLibrary() {
//   libraryContainer.classList.add("active");
// }

// function closeLibrary() {
//   libraryContainer.classList.remove("active");
// }

// function getLocal() {
//   let localPalettes;
//   if (localStorage.getItem("palettes") === null) {
//     localPalettes = [];
//   } else {
//     const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
//     savedPalettes = [...paletteObjects];
//     console.log(savedPalettes);
//     savedPalettes.forEach((paletteObj) => {
//       //Generate the palette library
//       const palette = document.createElement("div");
//   palette.classList.add("custom-palette");
//   const title = document.createElement("h4");
//   title.innerText = paletteObj.name;
//   const preview = document.createElement("div");
//   preview.classList.add("small-preview");
//   paletteObj.colors.forEach((smallColor) => {
//     const smallDiv = document.createElement("div");
//     smallDiv.classList.add("preview-color");
//     preview.appendChild(smallDiv);
//     smallDiv.style.backgroundColor = smallColor;
//   });
//   const paletteBtn = document.createElement("button");
//   paletteBtn.classList.add("pick-palette-btn");
//   paletteBtn.classList.add(paletteObj.nr);
//   paletteBtn.innerText = "Select";
//   const paletteRemoveBtn = document.createElement("button");
//   paletteRemoveBtn.classList.add("delete-palette-btn");
//   paletteRemoveBtn.classList.add(paletteObj.nr);
//   paletteRemoveBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;

//   //Attach event to the btn
//   paletteBtn.addEventListener("click", (e) => {
//     closeLibrary();
//     const paletteIndex = e.target.classList[1];
//     initialColors = [];
//     savedPalettes[paletteIndex].colors.forEach((color, index) => {
//       initialColors.push(color);
//       colorsPanels[index].style.backgroundColor = color;
//       const hexText = colorsPanels[index].children[0];
//       hexText.innerText = color;
//       const controlsBtns = colorsPanels[index].querySelectorAll(
//         ".colors__panel-controls button"
//       );
//       checkTextContrast(color, hexText, controlsBtns);
//       resetInputsNew(index, color);
//     });
//   });

//   paletteRemoveBtn.addEventListener("click", (e) => {
//     const paletteIndex = e.target.classList[1];
//     const libraryPopup = document.querySelector(".library__container--popup");
//     savedPalettes.slice(paletteIndex, paletteIndex + 1);
//     libraryPopup.removeChild(e.target.parentElement);
//   });

//   // savedPalettes = [];
//   // Append to library
//   palette.appendChild(title);
//   palette.appendChild(preview);
//   palette.appendChild(paletteBtn);
//   palette.appendChild(paletteRemoveBtn);
//   libraryContainer.children[0].appendChild(palette);
//   //     const palette = document.createElement("div");
//   //     palette.classList.add("custom-palette");
//   //     const title = document.createElement("h4");
//   //     title.innerText = paletteObj.name;
//   //     const preview = document.createElement("div");
//   //     preview.classList.add("small-preview");
//   //     paletteObj.colors.forEach((smallColor) => {
//   //       const smallDiv = document.createElement("div");
//   //       smallDiv.classList.add("preview-color");
//   //       preview.appendChild(smallDiv);
//   //       smallDiv.style.backgroundColor = smallColor;
//   //     });
//   //     const paletteBtn = document.createElement("button");
//   //     paletteBtn.classList.add("pick-palette-btn");
//   //     paletteBtn.classList.add(paletteObj.nr);
//   //     paletteBtn.innerText = "Select";
//   //     const paletteRemoveBtn = document.createElement("button");
//   //     paletteRemoveBtn.classList.add("delete-palette-btn");
//   //     paletteRemoveBtn.classList.add(paletteObj.nr);
//   //     paletteRemoveBtn.innerHTML = `<i class="fas fa-trash-alt"></i>`;
//   //     //Attach event to the btn
//   //     paletteBtn.addEventListener("click", (e) => {
//   //       closeLibrary();
//   //       initialColors = [];
//   //       paletteObjects[paletteIndex].colors.forEach((color, index) => {
//   //         initialColors.push(color);
//   //         colorsPanels[index].style.backgroundColor = color;
//   //         const text = colorsPanels[index].children[0];
//   // updateTextUI(index);
//   //       });
//   //     });
//   //     // resetInputs();
//   //     // Append to library
//   //     palette.appendChild(title);
//   //     palette.appendChild(preview);
//   //     palette.appendChild(paletteBtn);
//   //     palette.appendChild(paletteRemoveBtn);
//   //     libraryContainer.children[0].appendChild(palette);
//   //     // paletteRemoveBtn.addEventListener("click", (e) => {
//   //     // });
//     });
//   }
// }

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

// popup.addEventListener("transitionend", () => {
//   const popupBox = popup.children[1];
//   popup.classList.remove("active");
//   popupBox.classList.remove("active");
//   console.log(popup)
// });

// getLocal();
// localStorage.clear();
randomColors();
