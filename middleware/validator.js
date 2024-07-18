const Joi = require("joi");


const Validator = {
  execute: (schema, property) => {
    return (request, response, next) => {
      const { error } = schema.validate(request.body, { abortEarly: false });

      if (error == null) {
        next();
      } else {
        const { details } = error;

        response.status(200).json({
          success: false,
          message: details,
        });
      }
    };
  },

};

module.exports = Validator;

