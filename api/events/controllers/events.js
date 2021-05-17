"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  // Create event with linked user
  async create(context) {
    let entity;
    if (context.is("multipart")) {
      const { data, files } = parseMultipartData(context);
      data.user = context.state.user.id;
      entity = await strapi.services.article.create(data, { files });
    } else {
      context.request.body.user = context.state.user.id;
      entity = await strapi.services.article.create(context.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.events });
  },

  //   Update User event
  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    const [events] = await strapi.services.events.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!events) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.events.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.events.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.events });
  },

  //   Delete a user event
  async delete(ctx) {
    const { id } = ctx.params;

    const [events] = await strapi.services.events.find({
      id: ctx.params.id,
      "user.id": ctx.state.user.id,
    });

    if (!events) {
      return ctx.unauthorized("You cant update this entry");
    }

    const entity = await strapi.services.events.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.events });
  },

  // Get logged in users
  async me(context) {
    const user = context.state.user;

    if (!user) {
      return context.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const data = await strapi.services.events.find({ user: user.id });

    if (!data) {
      return context.notFound();
    }

    return sanitizeEntity(data, { model: strapi.models.events });
  },
};
