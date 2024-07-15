import koa from "koa";
import Router from "koa-router";
import { koaBody } from "koa-body";
import jwt from "jsonwebtoken";

const server = new koa();
const router = new Router();

const secret = "abcde12345jsonwebtoken";
const expireTime = "1d";

const generateToken = (payload: any, secret: string, expiresIn: string) => {
  return jwt.sign(payload, secret, { expiresIn });
};

const validateToken = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};

const users = [{ email: "user@email", password: "12345" }];

const findUser = (user: { email: string; password: string }) => {
  const foundUser = users.find(
    (x) => x.email === user.email && x.password === user.password
  );

  return foundUser;
};

router
  .get("/", (ctx, _) => {
    console.log("req chegando", ctx.request);
    ctx.headers["content-type"] = "application/json";
    ctx.body = {
      error: "access /login route using POST method to log in",
    };
  })
  .get("/login", (ctx) => {
    ctx.body = {
      error: "access this route using POST method to log in",
    };
  })
  .post("/login", (ctx) => {
    console.log("POST /login");
    const user = ctx.request.body;

    if (!user?.email || !user?.password) {
      ctx.status = 400;
      ctx.body = {
        error: "You must provide both email and password",
      };
      return;
    }

    if (!findUser(ctx.request.body)) {
      ctx.status = 400;
      ctx.body = {
        error: "Invalid Credentials",
      };
      return;
    }

    ctx.body = {
      token: generateToken({ email: user.email }, secret, expireTime),
    };
  })
  .post("/validate", (ctx) => {
    console.log("headers", ctx.headers.authorization?.split(" ")[1]);

    const token = ctx.headers.authorization?.split(" ")[1];
    if (!token) {
      ctx.status = 400;
      ctx.body = {
        error: "token not found",
      };
      return;
    }

    try {
      const verified = validateToken(token, secret);
      console.log(verified);
      ctx.status = 200;
      ctx.body = {
        ok: "valid token",
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        error,
      };
      return;
    }
  });

server.use(koaBody());
server.use(router.routes()).use(router.allowedMethods());

server.listen(3333, "localhost", undefined, () => {
  console.log("server up on port:3333");
});
