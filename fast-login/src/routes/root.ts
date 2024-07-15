import { FastifyPluginAsync } from "fastify";
import { sign, verify } from "jsonwebtoken";

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const secret = "abcde12345jsonwebtoken";
  const expireTime = "1d";

  const generateToken = (payload: any, secret: string, expiresIn: string) => {
    return sign(payload, secret, { expiresIn });
  };

  const validateToken = (token: string, secret: string) => {
    return verify(token, secret);
  };

  type User = { email: string; password: string };
  const users: Array<User> = [{ email: "user@email", password: "12345" }];

  const findUser = (user: User) => {
    const foundUser = users.find(
      (x) => x.email === user.email && x.password === user.password
    );

    return foundUser;
  };

  const verifyUser = (candidate: any): candidate is User => {
    return !!candidate && !!candidate.email && !!candidate.password;
  };

  fastify
    .get("/", async function (request, reply) {
      return "log in using the /login route";
    })
    .get("/login", async function (request, reply) {
      return "access this route using POST method to log in";
    })
    .post("/login", async function (request, reply) {
      const user = request.body as User;

      const isUser = verifyUser(user);

      if (!isUser) {
        reply
          .status(400)
          .send({ error: "You must provide both email and password" });
      }

      if (!findUser(user)) {
        reply.status(400).send({
          error: "Invalid Credentials",
        });
        return;
      }

      reply.send({
        token: generateToken({ email: user.email }, secret, expireTime),
      });
    })
    .post("/validate", async function (request, reply) {
      console.log("headers", request.headers.authorization?.split(" ")[1]);

      const token = request.headers.authorization?.split(" ")[1];
      if (!token) {
        reply.status(400).send({
          error: "token not found",
        });
        return;
      }

      try {
        const verified = validateToken(token, secret);
        console.log(verified);
        reply.send({
          ok: "valid token",
        });
      } catch (error) {
        reply.status(400).send({
          error,
        });
        return;
      }
    });
};

export default root;
