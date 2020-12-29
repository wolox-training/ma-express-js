module.exports = {
  name: {
    type: 'string',
    example: 'Juan'
  },
  lastName: {
    type: 'string',
    example: 'Perez'
  },
  email: {
    type: 'string',
    example: 'juan.perez@wolox.com.ar'
  },
  password: {
    type: 'string',
    example: 'hola1234'
  },
  User: {
    type: 'object',
    properties: {
      name: {
        $ref: '#/components/schemas/name'
      },
      last_name: {
        $ref: '#/components/schemas/lastName'
      },
      email: {
        $ref: '#/components/schemas/email'
      },
      password: {
        $ref: '#/components/schemas/password'
      }
    }
  }
};
