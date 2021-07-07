import errors from "http-errors";
import SQL from "@nearform/sql";
import S from "fluent-json-schema";

const schema = {
  body: S.object()
    .prop("email", S.string().required())
    .prop("password", S.string().required()),
  response: {
    200: S.object().prop("token", S.string().required()),
  },
};

export default async function login(fastify) {
  fastify.post("/login", { schema }, async request => {
    const { email, password } = request.body;

    if (email !== password) {
      throw errors.Unauthorized();
    }

    const {
      rows: [user],
    } = await fastify.pg.query(
      SQL` SELECT id, email FROM users WHERE email = ${email}`
    );

    if (!user) {
      throw errors.Unauthorized();
    }

    return { token: fastify.jwt.sign({ email }) };
  });
}
