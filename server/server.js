const program = require("commander");
const { prompt } = require("inquirer");

const { runServer } = require("./udp");
var colors = require("colors");

program.version("0.0.1").description("Contact management system");

const questions = [
  {
    type: "input",
    name: "port",
    message: "Port serwera:"
  },
  {
    type: "input",
    name: "address",
    message: "Adres IP serwera:"
  }
];

const triggerRunServer = () => {
  prompt(questions).then(answers => {
    runServer(answers);
  });
};

program
  .command("start")
  .alias("s")
  .description("Uruchom server")
  .action(() => triggerRunServer());

const customHelp = txt => {
  let text = `Użycie: serwer [flagi] [opcje]

Serwer operacji arytmetycznych opartych na protokole tekstowym napisanym w node.js

Flagi:
 -V, --version  output the version number
 -h, --help     output usage information

Opcje:
 start, s       uruchamia serwer\n`;
  return colors.red(text);
};

program.parse(process.argv);

if (!program.args.length) program.help(customHelp);
