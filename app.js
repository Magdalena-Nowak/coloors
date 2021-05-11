//Global selections and variables
const colorDivs = document.querySelectorAll(".color");
const sliders = document.querySelectorAll('input[type="range"]');
let initialColors;
const currentHexes = document.querySelectorAll(".color--header");
const popup = document.querySelector(".container__copy");
const adjustBtn = document.querySelectorAll(".controls--adjust");
const slidersContainer = document.querySelectorAll(".sliders");
const slidersClose = document.querySelectorAll("sliders--close");
const refreshBtn = document.querySelector(".refresh");
const lockedBtn = document.querySelectorAll(".controls--lock");
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

adjustBtn.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

lockedBtn.forEach((button, index) => {
  button.addEventListener("click", () => lockChangeColor(index));
});

// lockedBtn.forEach((button, index) => {
//   button.addEventListener("click", () => unlockChangeColor(index));
// });

refreshBtn.addEventListener("click", randomColors);

// slidersClose.forEach((btn, number) => {
//   btn.addEventListener("click", () => {
//     closeAdjustmentPanel(number);
//   });
// }); NIE DZIAŁA ????????

// Generate new color in HEX

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

    const iconColors = div.querySelectorAll("button");
    const adjustBtn = iconColors[0];
    const lockBtn = iconColors[1];

    // //Ckeck for contrast
    checkTextContrast(randomColor, hexText, adjustBtn, lockBtn);

    // // Initial colorize Sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
}

function checkTextContrast(color, hex, adjust, lock) {
  const luminColor = color.get("lab.l");
  // DODAĆ OPCJĘ ZMIANY KOLORÓW IKON RAZEM Z TEKSTEM
  if (luminColor < 50) {
    hex.style.color = "white";
    adjust.style.color = "white";
    lock.style.color = "white";
  } else {
    hex.style.color = "black";
    adjust.style.color = "black";
    lock.style.color = "black";
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
  const adjustBtn = activeDiv.querySelector(".controls--adjust");
  const lockBtn = activeDiv.querySelector(".controls--lock");
  textHex.innerText = color.hex();
  checkTextContrast(color, textHex, adjustBtn, lockBtn);
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  console.log(el);
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
    lockedBtn[index].innerHTML = `<i class="fas fa-lock"></i>`;
  } else {
    lockedBtn[index].innerHTML = `<i class="fas fa-lock-open"></i>`;
  }
}
// function unlockChangeColor(index) {
//   colorDivs[index].classList.remove("locked");
// lockedBtn[index].innerHTML = `<i class="fas fa-lock-open"></i>`;
// }
// function closeAdjustmentPanel(number) {
//   slidersContainer[number].classList.remove("active");
// } NIE DZIAŁA ????

randomColors();
