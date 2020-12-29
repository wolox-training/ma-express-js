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
        204: {
          description: 'New user was created'
        },
        400: {
          description: 'Email in use for another user',
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
        }
      }
    }
  }
};
