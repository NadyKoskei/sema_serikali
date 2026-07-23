const test = require("node:test");
const assert = require("node:assert/strict");
const net = require("net");
const { isPortAvailable } = require("../utils/port");

test("isPortAvailable reports a busy port as unavailable", async () => {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;

  try {
    assert.equal(await isPortAvailable(port), false);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
});

test("isPortAvailable reports a free port as available", async () => {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;

  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));

  assert.equal(await isPortAvailable(port), true);
});
