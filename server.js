const express = require("express");
const app = express();
const cluster = require("cluster");
const os = require("os");
const PORT = 5000;
const cors = require("cors");
const EventEmitter = require("events");
const ev = new EventEmitter();
const corsOption = {
  credentials: true,
  origin: "https://mm-dev.manheim.ca",
  optionSuccessStatus: 200,
  method: "GET, POST, PUT, DELETE",
};
app.use(cors(corsOption));
process.on("unhandledRejection", (err, data) => {
  console.log("unhandled rejection occured");
  console.error(err ? err.message : err);
});

app.get("/server/health", (req, res) => {
  res.cookie("testcookie", "rahultest", {
    httpOnly: true,
    // secure: true,
    // sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
  });
  res.send(`latest server is running ${process.pid}`);
});

app.set("ev", ev);
process.app = app;

app.get(
  "/test/multi_process",
  require("./controllers/multiProcess").multiProcess
);
app.get(
  "/test/worker_thread",
  require("./controllers/workerThread").workerThread
);
app.get(
  "/test/single_process",
  require("./controllers/singleProcess").singleProcess
);
app.get(
  "/testEvent",
  require("./services/eventEmitter/event-emitter").testEvent
);

if (cluster.isMaster) {
  let nCPUs = os.cpus().length;
  for (let i = 0; i < nCPUs; i++) {
    let worker = cluster.fork();
  }
} else {
  const server = app.listen(PORT, () => {
    console.log(
      `server is listening with process ${process.pid} on port ${PORT}`
    );
  });

  process.on("SIGTERM", () => {
    server.close(() => {
      console.log("server is closed");
      process.exit(0);
    });
  });
}
