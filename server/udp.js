const dgram = require("dgram");
const server = dgram.createSocket("udp4");
const time = require("moment");

const game = {
  numberOfClients: 0,
  clients: new Map(),
  incorrectCode: 0,
  mathOp: "brak",
  receivedNumbers: []
};

const rozSuma = {
  receivedNumbers: [],
  isActive: 0,
  lastMsg: 0
}

// Wysyłanie komunikatu

const sentMessage = param => {
  let req = [param[0], param[1], param[2], param[3], param[4]].join(" ");
  req = `${req} `;
  server.send(req, param[5].port, param[5].address, err => { });
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

//sprawdzenie czy klient posiada token

const auth = token => {

  if (game.clients.has(token)) {
    return true;
  } else {
    return false;
  }
};

server.on("message", (msg, rinfo) => {
  let data = receiveData(msg);

  // odebranie żądania o identyfikator
  if (data.get("oper") == "autoryzacja") {
    if (data.get("stat") == "prosba") {
      game.numberOfClients++;
      sentMessage(["oper#autoryzacja", "stat#przydzial", "iden#brak", `dane#${game.numberOfClients}`, `czas#${time().format("x")}`, rinfo]);
      game.clients.set(game.numberOfClients.toString(), {
        args: rinfo,
        waitingForACK: 0,
        won: 0,
        randomNumber: -1,
        receiveNumbers: []
      });
      console.log(
        `Dodano nowego klienta: ${
        game.clients.get(game.numberOfClients.toString()).args.address
        }, ${game.clients.get(game.numberOfClients.toString()).args.port}`
      );
      //   }
    } else {
      game.incorrectCode = 1;
    }
  } else {
    game.incorrectCode = 2;
  }

// Operacja sumowania

  if (data.get("oper") == "suma") {
    if (data.get("stat") == "liczba") {
      if (auth(data.get("iden"))) {
        game.mathOp = "suma";
        game.clients.get(data.get("iden")).receiveNumbers.push(data.get("dane"));
        if (game.clients.get(data.get("iden")).receiveNumbers.length == 3) {
          let suma = 0;
          game.clients.get(data.get("iden")).receiveNumbers.forEach((x) => {
            suma += parseInt(x);
          })

          sentMessage(["oper#suma", "stat#wynik", `iden#brak`, `dane#${suma}`, `czas#${time().format("x")}`, rinfo])
          game.clients.get(data.get("iden")).receiveNumbers = [];
          game.clients.get(data.get("iden")).receiveNumbers.length = 0;
          data.mathOp = "brak";
        }
      } else {
        console.log('Nieautoryzowano')
      }
    }
  }

// Operacja mnożenia

  if (data.get("oper") == "mnozenie") {
    if (data.get("stat") == "liczba") {
      if (auth(data.get("iden"))) {
        game.mathOp = "iloczyn";
        game.clients.get(data.get("iden")).receiveNumbers.push(data.get("dane"));
        if (game.clients.get(data.get("iden")).receiveNumbers.length == 3) {
          let iloczyn = 1;
          game.clients.get(data.get("iden")).receiveNumbers.forEach((x) => {
            iloczyn *= parseInt(x);
          })
          sentMessage(["oper#mnozenie", "stat#wynik", `iden#brak`, `dane#${iloczyn}`, `czas#${time().format("x")}`, rinfo])
          game.clients.get(data.get("iden")).receiveNumbers = [];
          game.clients.get(data.get("iden")).receiveNumbers.length = 0;
          data.mathOp = "brak";
        }
      } else {
        console.log('Nieautoryzowano')
      }
    }
  }

// Operacja odejmowania

  if (data.get("oper") == "odejmowanie") {
    if (data.get("stat") == "liczba") {
      if (auth(data.get("iden"))) {
        game.mathOp = "roznica";
        game.clients.get(data.get("iden")).receiveNumbers.push(data.get("dane"));
        if (game.clients.get(data.get("iden")).receiveNumbers.length == 3) {
          let roznica = 0;
          game.clients.get(data.get("iden")).receiveNumbers.forEach((x) => {
            roznica -= parseInt(x);
          })
          sentMessage(["oper#odejmowanie", "stat#wynik", `iden#brak`, `dane#${roznica}`, `czas#${time().format("x")}`, rinfo])
          game.clients.get(data.get("iden")).receiveNumbers = [];
          game.clients.get(data.get("iden")).receiveNumbers.length = 0;
          data.mathOp = "brak";
        }
      } else {
        console.log('Nieautoryzowano')
      }
    }
  }

// Operacja sumowania kwadratów

  if (data.get("oper") == "sumakwadratow") {
    if (data.get("stat") == "liczba") {
      if (auth(data.get("iden"))) {
        game.mathOp = "suma kwadratów";
        game.clients.get(data.get("iden")).receiveNumbers.push(data.get("dane"));
        if (game.clients.get(data.get("iden")).receiveNumbers.length == 3) {
          let a = game.clients.get(data.get("iden")).receiveNumbers[0];
          let b = game.clients.get(data.get("iden")).receiveNumbers[1];
          let c = game.clients.get(data.get("iden")).receiveNumbers[2];
          a = Math.pow(a, 2);
          b = Math.pow(b, 2);
          c = Math.pow(c, 2);
          let suma = a+b+c;
          sentMessage(["oper#sumakwadratow", "stat#wynik", `iden#brak`, `dane#${suma}`, `czas#${time().format("x")}`, rinfo])
          game.clients.get(data.get("iden")).receiveNumbers = [];
          game.clients.get(data.get("iden")).receiveNumbers.length = 0;
          data.mathOp = "brak";
        }
      } else {
        console.log('Nieautoryzowano')
      }
    }
  }

// Operacja rozszerzonej sumy

  if (data.get("oper") == "rozsuma") {
    if (data.get("stat") == "liczba") {
      if (auth(data.get("iden"))) {
        game.mathOp = "rozsuma";
        game.clients.get(data.get("iden")).receiveNumbers.push(data.get("dane"));
        sentMessage(["oper#rozsuma", "stat#potwierdzam", `iden#brak`, `dane#${data.get("czas")}`, `czas#${time().format("x")}`, rinfo])
      } else {
        console.log('Nieautoryzowano')
      }
    }
  }
  if (data.get("oper") == "rozsuma") {
    if (data.get("stat") == "koniec") {
      if (auth(data.get("iden"))) {
        rozSuma.isActive = 0;
        let suma = 0;
        game.clients.get(data.get("iden")).receiveNumbers.forEach((x) => {
          suma += parseInt(x);
        })
        sentMessage(["oper#rozsuma", "stat#wynik", `iden#brak`, `dane#${suma}`, `czas#${time().format("x")}`, rinfo])
        game.clients.get(data.get("iden")).receiveNumbers = [];
          game.clients.get(data.get("iden")).receiveNumbers.length = 0;
        data.mathOp = "brak";
      } else {
        console.log('Nieautoryzowano')
      }
    }
  }
    if (data.get("oper") == "zakoncz") {
    if (data.get("stat") == "zwalniam") {
      if (auth(data.get("iden"))) {
        game.clients.delete(data.get("iden"));        
        console.log(`Klient o tokenie ${data.get("iden")} się zwolnił.`);
      } else {
        console.log('Nieautoryzowano')
      }
    }
  }

});

server.on("listening", () => {
  const address = server.address();
  console.log(
    `Serwer nasłuchuje na adresie ${address.address} i porcie ${address.port}`
  );
});

server.on("error", err => {
  console.error(`server error:\n${err.stack}`);
  server.close();
});

const runServer = param => {
  server.bind(param.port, param.address);
};

module.exports = { runServer, server, sentMessage, receiveData };
