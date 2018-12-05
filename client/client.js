const program = require("commander");
const { prompt } = require("inquirer");

const { runClient } = require("./udp");
var colors = require("colors");

program.version("0.0.1").description("Contact management system");

const questions = [
  {
    type: "input",
    name: "serverPort",
    message: "Port serwera:"
  },
  {
    type: "input",
    name: "serverAddress",
    message: "Adres IP serwera:"
  }
];

const triggerRunClient = () => {
  prompt(questions).then(answers => {
    runClient(answers);
  });
};

program
  .command("start")
  .alias("s")
  .description("Uruchom klienta")
  .action(() => triggerRunClient());

const customHelp = txt => {
  let text = `Użycie: client [flagi] [opcje]

Klient operacji na argumentach opartych na protokole tekstowym napisanym w node.js

Flagi:
 -V, --version  output the version number
 -h, --help     output usage information

Opcje:
 start, s       uruchamia serwer\n`;
  return colors.red(text);
};

program.parse(process.argv);

if (!program.args.length) program.help(customHelp);
