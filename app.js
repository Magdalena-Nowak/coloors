//Global selections and variables
const colorDivs = document.querySelectorAll(".color");

// Generate new color in HEX

function generateHex() {
  //   const letters = "0123456789ABCDEF";
  //   let hash = "#";
  //   for (let i = 0; i < 6; i++) {
  //     hash += letters[Math.floor(Math.random() * 16)];
  //   }
  //   return hash;
  // ZAMIANA PĘTLI NA WERSJĘ Z BIBLIOTEKĄ CHROMA.JS
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

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
}

randomColors();
