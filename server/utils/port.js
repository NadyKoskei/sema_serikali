const net = require("net");

function isPortAvailable(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const tester = net.createServer();

    tester.once("error", () => {
      resolve(false);
    });

    tester.once("listening", () => {
      tester.close(() => resolve(true));
    });

    tester.listen(port, host);
  });
}

module.exports = {
  isPortAvailable,
};
