const express = require("express");
const app = express();
const session = require("express-session");
const mongoSession = require("connect-mongodb-session")(session);
const cluster = require("cluster");
const os = require("os");
const PORT = 5000;
const cors = require("cors");
const EventEmitter = require("events");
const ev = new EventEmitter();
const corsOption = {
  credentials: true,
  origin: "*",
  optionSuccessStatus: 200,
  method: "GET, POST, PUT, DELETE",
};
app.use(cors(corsOption));

mongoURI = 'mongodb://localhost:27017/sessions';

const store = new mongoSession({
  uri: mongoURI,
  collection: "mysessions"
})
app.use(
  session({
    secret: "mysecretkey",
    resave: true,
    store: store,   // memory storage
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 10,
    },
  })
);

process.on("unhandledRejection", (err, data) => {
  console.log("unhandled rejection occured");
  console.error(err ? err.message : err);
});

app.get("/server/health", (req, res) => {
  res.cookie("webToken", "rahultest", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
  });
  res.send(`latest server is running ${process.pid}`);
});

app.get("/login", (req, res) => {
  req.session.isAuth = true;
  req.session.save(() => res.redirect("/protectedroute"));
});

app.get(
  "/protectedroute",
  (req, res, next) => {
    if (req.session.isAuth) {
      next();
    } else {
      res.send("unAuthorized user");
    }
  },
  (req, res) => {
    res.send("proctected route successful");
  }
);

app.get("/unprotectedroute", (req, res) => {
  res.send("unproctected route successful");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err)  throw err;
    res.redirect("/unprotectedroute");
  })
})

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
