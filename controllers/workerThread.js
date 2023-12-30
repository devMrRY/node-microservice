const {
  Worker,
  workerData,
  isMainThread,
  parentPort,
  MessageChannel,
} = require("worker_threads");
const { ev } = process.app.settings;

module.exports.workerThread = (req, res) => {
  console.time("w1");
  let done = {
    first: false,
    sec: false,
  };
  if (isMainThread) {
    const { port1, port2 } = new MessageChannel();
    const worker1 = new Worker("./services/multiThreading/first_worker.js", {
      workerData: port1,
      transferList: [port1],    // ports needs to be added to transferList otherwise it will throw error as all workerdata are not transferable
    });
    const worker2 = new Worker("./services/multiThreading/sec_worker.js", {
      workerData: port2,
      transferList: [port2],
    });
    worker1.on("message", (message) => {
      done["first"] = true;
      console.log(message);
      worker2.postMessage({
        message: `workder1 message: ${JSON.stringify(message)}`,
      });
      ev.emit("done");
    });
    worker2.on("message", (message) => {
      done["sec"] = true;
      console.log(message);
      worker1.postMessage({
        message: `workder2 message: ${JSON.stringify(message)}`,
      });
      ev.emit("done");
    });
  }
  ev.on("done", () => {
    if (done["first"] && done["sec"]) {
      console.timeEnd("w1");
      res.send(`process ${process.pid}, data: ${workerData}`);
    }
  });
};
