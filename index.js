const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/ussd", (req, res) => {
  const { text } = req.body;
  const inputs = text.split("*");
  const level = inputs.length;
  let response = "";

  const lang = inputs[0];

  if (text === "") {
    response = `CON Welcome to BMI Calculator / Murakaza neza
1. English
2. Kinyarwanda`;
  } else if (level === 1) {
    if (lang === "1") {
      response = "CON Enter your weight in KG:";
    } else if (lang === "2") {
      response = "CON Andika ibiro byawe mu kilo (KG):";
    } else {
      response = "END Invalid language.";
    }
  } else if (level === 2) {
    if (lang === "1") {
      response = "CON Enter your height in CM:";
    } else {
      response = "CON Andika uburebure bwawe mu centimetero (CM):";
    }
  } else if (level === 3) {
    const weight = parseFloat(inputs[1]);
    const heightCm = parseFloat(inputs[2]);
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    const bmiRounded = bmi.toFixed(1);
    let status = "";
    if (bmi < 18.5) status = lang === "1" ? "Underweight" : "Ufite ibiro biri hasi cyane.";
    else if (bmi < 25) status = lang === "1" ? "Normal weight" : "Ufite ibiro bisanzwe.";
    else if (bmi < 30) status = lang === "1" ? "Overweight" : "Ufite ibiro birenze bisanzwe.";
    else status = lang === "1" ? "Obese" : "Ufite umubyibuho ukabije.";

    if (lang === "1") {
      response = `CON Your BMI is ${bmiRounded} (${status})
Would you like health tips?
1. Yes
2. No`;
    } else {
      response = `CON BMI yawe ni ${bmiRounded} (${status})
Ukeneye inama z’ubuzima?
1. Yego
2. Oya`;
    }
  } else if (level === 4) {
    const choice = inputs[3];
    if (choice === "1") {
      if (lang === "1") {
        response = `END Health Tips:
- Eat fruits and vegetables
- Drink water regularly
- Avoid fast food and sugar`;
      } else {
        response = `END Inama z'ubuzima:
- Rya imbuto n’imboga
- Nywa amazi kenshi
- Irinde ibiryo bya vuba na isukari nyinshi`;
      }
    } else if (choice === "2") {
      response = lang === "1" ? "END Thank you. Stay healthy!" : "END Murakoze. Mugire ubuzima bwiza!";
    } else {
      response = "END Invalid option.";
    }
  } else {
    response = "END Session ended or invalid input.";
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("BMI USSD app running on port " + PORT));