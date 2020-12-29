module.exports = {
  '/users': {
    post: {
      tags: ['USERS'],
      description: 'Create user',
      operationId: 'createUser',
      parameters: [],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        required: true
      },
      responses: {
        201: {
          description: 'New user was created'
        },
        400: {
          description: 'There was an error with the request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                message: 'Email already in use.',
                internal_code: 'unique_email_error'
              }
            }
          }
        },
        503: {
          description: 'There was an error with the database',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                message: 'Error while trying to create an user',
                internal_code: 'database_error'
              }
            }
          }
        }
      }
    }
  }
};
