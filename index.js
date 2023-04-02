/* Připojení modulu frameworku Express */ 
const express = require("express");
/* Připojení externího modulu body-parser (https://www.npmjs.com/package/body-parser) - middleware pro parsování těla požadavku */ 
const bodyParser = require("body-parser"); /* Připojení externího modulu moment (https://momentjs.com/) - knihovna pro formátování datových a časových údajů */ 
const moment = require("moment"); 
const csvtojson = require('csvtojson');
/* Připojení vestavěných modulů fs (práce se soubory) a path (cesty v adresářové struktuře) */ 
const fs = require("fs"); 
const path = require("path");

/* Vytvoření základního objektu serverové aplikace */ 
const app = express();
/* Nastavení portu, na němž bude spuštěný server naslouchat */ 
const port = 3000;

/* Identifikace složky obsahující statické soubory klientské části webu */
app.use(express.static('public'));

/* Nastavení typu šablonovacího engine na pug*/ 
app.set("view engine", "pug"); 
/* Nastavení složky, kde budou umístěny šablony pug */ 
app.set("views", path.join(__dirname, "views"));

const urlencodedParser = bodyParser.urlencoded({extended: false});
app.post('/savedata', urlencodedParser, function(req, res) {
  let date = moment().format('YYYY-MM-DD');
  let str = `"${req.body.jmeno}","${req.body.hodnoceni}","${date}","${req.body.komentar}"\n`;
  console.log(str);
  fs.appendFile(path.join(__dirname, 'data/recenze.csv'), str, function(err) {
    if (err) {
      console.error(err);
      return res.status(400).json({
        success: false,
        message: "Nastala chyba během ukládání souboru"
      });
    }
    res.redirect(301, '/');
  });          
});


/* Reakce na požadavek odeslaný metodou get na adresu <server>/todolist */ 
app.get("/recenze", (req, res) => { 
  /* Použití knihovny csvtojson k načtení dat ze souboru ukoly.csv. Atribut headers zjednodušuje pojmenování jednotlivých datových sloupců. */ /* Pro zpracování je použito tzv. promises, které pracují s částí .then (úspěšný průběh operace) a .catch (zachycení možných chyb) */ 
  csvtojson({headers:['jmeno','hodnoceni','zadani','komentar']}).fromFile(path.join(__dirname, 'data/recenze.csv')) 
  .then(data => { 
    /* Vypsání získaných dat ve formátu JSON do konzole */ 
    console.log(data); 
    /* Vykreslení šablony index.pug i s předanými daty (objekt v druhém parametru) */ 
    res.render('index', {nadpis: "Seznam recenzí", recenze: data}); 
  }) 
  .catch(err => { 
    /* Vypsání případné chyby do konzole */ 
    console.log(err); 
    /* Vykreslení šablony error.pug s předanými údaji o chybě */ 
    res.render('error', {nadpis: "Chyba v aplikaci", chyba: err}); 
  }); 
});

/* Spuštění webového serveru */ 
app.listen(port, () => {
  console.log(`Server naslouchá na portu ${port}`);
});
