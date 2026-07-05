import net from "net";

const LOCAL_PORT = 5433;
const REMOTE_HOST = "ep-old-night-ap9pjo6w.c-7.us-east-1.aws.neon.tech";
const REMOTE_PORT = 5432;

const server = net.createServer((localSocket) => {
  console.log("Client connected from", localSocket.remoteAddress);

  const remoteSocket = net.createConnection(
    {
      host: REMOTE_HOST,
      port: REMOTE_PORT,
    },
    () => {
      console.log("Connected to Neon database");
    }
  );

  localSocket.pipe(remoteSocket);
  remoteSocket.pipe(localSocket);

  localSocket.on("error", (err) => {
    console.error("Local socket error:", err.message);
    remoteSocket.destroy();
  });

  remoteSocket.on("error", (err) => {
    console.error("Remote socket error:", err.message);
    localSocket.destroy();
  });

  localSocket.on("close", () => {
    remoteSocket.end();
  });

  remoteSocket.on("close", () => {
    localSocket.end();
  });
});

server.listen(LOCAL_PORT, "127.0.0.1", () => {
  console.log(
    `TCP Proxy listening on localhost:${LOCAL_PORT} -> ${REMOTE_HOST}:${REMOTE_PORT}`
  );
});
