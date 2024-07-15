import http from "http";
import jwt from "jsonwebtoken";

const users = [{ email: "user@email", password: "12345" }];

const findUser = (user: { email: string; password: string }) => {
  return users.find(
    (x) => x.email === user.email && x.password === user.password
  );
};

const secret = "abcde12345jsonwebtoken";
const expireTime = "1d";

const generateToken = (email: string, secret: string, expiresIn: string) => {
  return jwt.sign({ email }, secret, { expiresIn });
};

const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};

http
  .createServer((req, res) => {
    console.log("request came:", req.url, " ", req.method);
    switch (req.url) {
      case "/":
        res.writeHead(200);
        res.end("access /login to log in");
        return;
      case "/login":
        if (req.method === "POST") {
          const body: any[] = [];
          req
            .on("data", (chunk) => {
              body.push(chunk);
            })
            .on("end", () => {
              const data = JSON.parse(Buffer.concat(body).toString());
              console.log(data);

              if (!data || !data.email || !data.password) {
                res.setHeader("Content-type", "application/json");
                res.writeHead(400);
                res.end(JSON.stringify({ error: "invalid payload" }));
                return;
              }

              if (!findUser(data)) {
                res.setHeader("Content-type", "application/json");
                res.writeHead(400);
                res.end(JSON.stringify({ error: "invalid credentials" }));
                return;
              }

              res.setHeader("Content-type", "application/json");
              res.writeHead(200);
              res.end(
                JSON.stringify({
                  token: generateToken(data.email, secret, expireTime),
                })
              );
              return;
            });
        } else {
          res.setHeader("Content-type", "application/json");
          res.writeHead(200);
          res.end(
            JSON.stringify({
              redirect: "Access this route with POST request to log in",
            })
          );
          return;
        }

        return;
      case "/validate":
        if (req.method === "POST") {
          const token = req.headers.authorization?.split(" ")[1];

          if (!token) {
            res.setHeader("Content-type", "application/json");
            res.writeHead(400);
            res.end(JSON.stringify({ error: "token not found" }));
            return;
          }

          try {
            verifyToken(token, secret);
            res.writeHead(200);
            res.end("valid token");
          } catch (error) {
            res.setHeader("Content-type", "application/json");
            res.writeHead(400);
            res.end(JSON.stringify({ error }));
          }
        } else {
          res.writeHead(200);
          res.end("access this route via POST to verify token");
          return;
        }
        return;
      default:
        res.setHeader("Content-type", "application/json");
        res.writeHead(400);
        res.end(JSON.stringify({ error: "invalid route" }));
        return;
    }
  })
  .listen(3333, "localhost", undefined, () => {
    console.log("server up...");
  });
