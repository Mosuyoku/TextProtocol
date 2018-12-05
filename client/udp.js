const dgram = require("dgram");
const client = dgram.createSocket("udp4");
const { prompt } = require("inquirer");
const time = require("moment");

const game = {
  token: null,
  serverPort: null,
  serverAddress: null,
};

const rozSuma = {
  receiverNumbers: [],
  isActive: 0,
  lastMsg: 0
}

//wysłanie komunikatu

const sentMessage = param => {
  let req = [param[0], param[1], param[2], param[3], param[4]].join(" ");
  req = `${req} `;
  if (param[5] == true) {
    client.send(req, game.serverPort, game.serverAddress, () => {
      client.close();
    });
  } else {
    client.send(req, game.serverPort, game.serverAddress, () => { });
  }
};

//odebranie komunikatu

const receiveData = param => {
  let req = param.toString().split(" ");
  let map = new Map();
  req.forEach((i) => {
    let x = i.split("#");
    map.set(x[0], x[1]);
  });

  return map;
};

//menu wyboru działania na liczbach

const mathq = [
  {
    type: "list",
    name: "mathop",
    message: "Wybierz działanie:",
    choices: [
      "dodawanie",
      "mnożenie",
      "odejmowanie",
      "suma kwadratów",
      "rozszerzona suma",
      "zakończ"
    ]
  },
];

//3 pola przeznaczone na wpisanie liczby przez klienta

const number = [
  {
    type: "input",
    name: "num1",
    message: "Wpisz liczbę:"
  },
  {
    type: "input",
    name: "num2",
    message: "Wpisz liczbę:"
  }, {
    type: "input",
    name: "num3",
    message: "Wpisz liczbę:"
  },

];

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

//funkcja wysyłająca liczby do wykonania operacji dodawania

const dodawanie = () => {
  prompt(number).then(ans => {
    if (isNumber(ans.num1) && isNumber(ans.num2) && isNumber(ans.num3)) {
      let num = [];
      num.push(parseFloat(ans.num1));
      num.push(parseFloat(ans.num2));
      num.push(parseFloat(ans.num3));
      for (let i = 0; i < 3; i++) {
        sentMessage(["oper#suma", "stat#liczba", `iden#${game.token}`, `dane#${num[i]}`, `czas#${time().format("x")}`]);
      }
    }
  })
}

//funkcja wysyłająca liczby do wykonania operacji mnożenia

const mnozenie = () => {
  prompt(number).then(ans => {
    if (isNumber(ans.num1) && isNumber(ans.num2) && isNumber(ans.num3)) {
      let num = [];
      num.push(parseFloat(ans.num1));
      num.push(parseFloat(ans.num2));
      num.push(parseFloat(ans.num3));
      for (let i = 0; i < 3; i++) {
        sentMessage(["oper#mnozenie", "stat#liczba", `iden#${game.token}`, `dane#${num[i]}`, `czas#${time().format("x")}`])
      }
    }
  })
}

//funkcja wysyłająca liczby do wykonania operacji odejmowania

const odejmowanie = () => {
  prompt(number).then(ans => {
    if (isNumber(ans.num1) && isNumber(ans.num2) && isNumber(ans.num3)) {
      let num = [];
      num.push(parseFloat(ans.num1));
      num.push(parseFloat(ans.num2));
      num.push(parseFloat(ans.num3));
      for (let i = 0; i < 3; i++) {
        sentMessage(["oper#odejmowanie", "stat#liczba", `iden#${game.token}`, `dane#${num[i]}`, `czas#${time().format("x")}`])
      }
    }
  })
}

//funkcja wysyłająca liczby do wykonania operacji sumy kwadratów

const sumakwadratow = () => {
  prompt(number).then(ans => {
    if (isNumber(ans.num1) && isNumber(ans.num2) && isNumber(ans.num3)) {
      let num = [];
      num.push(parseFloat(ans.num1));
      num.push(parseFloat(ans.num2));
      num.push(parseFloat(ans.num3));
      for (let i = 0; i < 3; i++) {
        sentMessage(["oper#sumakwadratow", "stat#liczba", `iden#${game.token}`, `dane#${num[i]}`, `czas#${time().format("x")}`])
      }
    }
  })
}

//funkcja wysyłająca liczby do wykonania operacji rozszerzonej sumy

const rozDodawanie = () => {
  prompt({
    type: "input",
    name: "num",
    message: "Wpisz liczbę:"
  }).then(ans => {
    if (isNumber(ans.num)) {
      let actTime = time().format("x");
      sentMessage(["oper#rozsuma", "stat#liczba", `iden#${game.token}`, `dane#${ans.num}`, `czas#${actTime}`]);
      rozSuma.isActive = 1;
      rozSuma.lastMsg = actTime; 
    } else {
      rozSuma.isActive = 0;
      sentMessage(["oper#rozsuma", "stat#koniec", `iden#${game.token}`, `dane#brak`, `czas#${time().format("x")}`]);
    }
  })
}

//funkcja kończąca komunikację po stronie klienta


const zakoncz = () => {
  sentMessage(["oper#zakoncz", "stat#zwalniam", `iden#${game.token}`, "dane#brak", `czas#${time().format("x")}`, true]);
}

//menu wyboru działania na liczbach


const operationMenu = () => {
  prompt(mathq).then(ans => {
    if (ans.mathop == "dodawanie") {
      dodawanie()
    } else if (ans.mathop == "mnożenie") {
      mnozenie()
    } else if (ans.mathop == "odejmowanie") {
      odejmowanie()
    } else if (ans.mathop == "suma kwadratów") {
      sumakwadratow()
    } else if (ans.mathop == "rozszerzona suma") {
      rozDodawanie()
    } else if (ans.mathop == "zakończ") {
      zakoncz();
    }
  });
}

client.on("message", function (msg, info) {
  let data = receiveData(msg);

//uzyskanie identyfikatora

  if (data.get("oper") == "autoryzacja") {
    if (data.get("stat") == "przydzial") {
      console.log(`Uzyskałem identyfikator ${data.get("dane")}`);
      game.token = data.get("dane");

      operationMenu();
    }
    if (data.get("stat") == "odrzucenie") {
      console.log(`Serwer mnie odrzucił`);
      // prompts.complete();
      client.close();
    }
  }

//uzyskanie wyniku sumy

  if (data.get("oper") == "suma") {
    if (data.get("stat") == "wynik") {
      console.log(`Uzyskałem wynik operacji dodawanie: ${data.get("dane")}`)
      operationMenu();
    }
  }

//uzyskanie wyniku mnożenia

  if (data.get("oper") == "mnozenie") {
    if (data.get("stat") == "wynik") {
      console.log(`Uzyskałem wynik operacji mnożenie: ${data.get("dane")}`)
      operationMenu();
    }
  }

//uzyskanie wyniku odejmowania

  if (data.get("oper") == "odejmowanie") {
    if (data.get("stat") == "wynik") {
      console.log(`Uzyskałem wynik operacji odejmowanie: ${data.get("dane")}`)
      operationMenu();
    }
  }

//uzyskanie wyniku sumy kwadratów

  if (data.get("oper") == "sumakwadratow") {
    if (data.get("stat") == "wynik") {
      console.log(`Uzyskałem wynik operacji suma kwadratów: ${data.get("dane")}`)
      operationMenu();
    }
  }

//uzyskanie potwierdzeń od serwera podczas wysyłąnia liczb do rozszerzonej sumy oraz uzyskanie wyniku rozszerzonej sumy

  if (data.get("oper") == "rozsuma") {
    if (data.get("stat") == "potwierdzam") {
      rozDodawanie(data)
    }
  }
  if (data.get("oper") == "rozsuma") {
    if (data.get("stat") == "wynik") {
      console.log(`Uzyskałem wynik operacji rozszerzonej sumy: ${data.get("dane")}`)
      operationMenu();
    }
  }
});

const runClient = param => {
  game.serverAddress = param.serverAddress;
  game.serverPort = param.serverPort;

  // 1. żądanie o identyfikator
  sentMessage(["oper#autoryzacja", "stat#prosba", "iden#brak", "dane#brak", `czas#${time().format("x")}`]);
};

module.exports = { runClient };
