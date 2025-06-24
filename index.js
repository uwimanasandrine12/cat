const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// PostgreSQL connection
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_wk7Rez8amVGT@ep-proud-moon-a8323qx7-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
});

// USSD logic
app.post("/ussd", async (req, res) => {
  const { sessionId, phoneNumber, text } = req.body;
  const inputs = text.split("*");
  const level = inputs.length;
  let response = "";

  const lang = inputs[0]; // Language selection

  try {
    if (text === "") {
      response = `CON Welcome to BMI Calculator / Murakaza neza
1. English
2. Kinyarwanda`;
    } else if (level === 1) {
      const language = lang === "1" ? "English" : lang === "2" ? "Kinyarwanda" : null;
      if (!language) {
        response = "END Invalid language.";
      } else {
        await pool.query(
          "INSERT INTO sessions (session_id, phone_number, lang) VALUES ($1, $2, $3)",
          [sessionId, phoneNumber, language]
        );
        response = lang === "1"
          ? "CON Enter your age:"
          : "CON Andika imyaka yawe:";
      }
    } else if (level === 2) {
      response = lang === "1"
        ? "CON Enter your weight in KG:"
        : "CON Andika ibiro byawe mu kilo (KG):";
    } else if (level === 3) {
      response = lang === "1"
        ? "CON Enter your height in CM:"
        : "CON Andika uburebure bwawe mu centimetero (CM):";
    } else if (level === 4) {
      const age = parseInt(inputs[1]);
      const weight = parseFloat(inputs[2]);
      const heightCm = parseFloat(inputs[3]);
      const heightM = heightCm / 100;
      const bmi = weight / (heightM * heightM);
      const bmiRounded = parseFloat(bmi.toFixed(1));

      let status = "";
      if (bmi < 18.5) status = lang === "1" ? "Underweight" : "Ufite ibiro biri hasi cyane.";
      else if (bmi < 25) status = lang === "1" ? "Normal weight" : "Ufite ibiro bisanzwe.";
      else if (bmi < 30) status = lang === "1" ? "Overweight" : "Ufite ibiro birenze bisanzwe.";
      else status = lang === "1" ? "Obese" : "Ufite umubyibuho ukabije.";

      await pool.query(
        "INSERT INTO bmi_records (session_id, age, weight, height_cm, bmi, status) VALUES ($1, $2, $3, $4, $5, $6)",
        [sessionId, age, weight, heightCm, bmiRounded, status]
      );

      response = lang === "1"
        ? `CON Your BMI is ${bmiRounded} (${status})
Would you like health tips?
1. Yes
2. No`
        : `CON BMI yawe ni ${bmiRounded} (${status})
Ukeneye inama z’ubuzima?
1. Yego
2. Oya`;
    } else if (level === 5) {
      const choice = inputs[4];
      if (choice === "1") {
        response = lang === "1"
          ? `END Health Tips:
- Eat fruits and vegetables
- Drink water regularly
- Avoid fast food and sugar`
          : `END Inama z'ubuzima:
- Rya imbuto n’imboga
- Nywa amazi kenshi
- Irinde ibiryo bya vuba na isukari nyinshi`;
      } else if (choice === "2") {
        response = lang === "1"
          ? "END Thank you. Stay healthy!"
          : "END Murakoze. Mugire ubuzima bwiza!";
      } else {
        response = "END Invalid option.";
      }
    } else {
      response = "END Session ended or invalid input.";
    }

    res.set("Content-Type", "text/plain");
    res.send(response);
  } catch (err) {
    console.error("❌ Error handling USSD request:", err);
    res.set("Content-Type", "text/plain");
    res.send("END Something went wrong. Please try again later.");
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ BMI USSD app running on port ${PORT}`);
});
