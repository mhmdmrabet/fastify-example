import S from "fluent-json-schema";

const schema = {
  response: {
    200: S.array().items(
      S.object()
        .prop("id", S.integer().required())
        .prop("email", S.string().required())
    ),
  },
};

export default async function users(fastify) {
  fastify.get(
    "/",
    {
      onRequest: [fastify.authenticate],
      schema,
    },
    async request => {
      request.log.info("Users route called");

      const { rows: users } = await fastify.pg.query(
        `SELECT id, email FROM users`
      );

      return users;
    }
  );
}
