import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Nexus E-Commerce API',
    description: 'Complete Backend Documentation for Nexus E-Commerce',
  },
 
  host: 'ecommerceapi-nh2j.onrender.com', 
  schemes: ['https'], 
};

const outputFile = './swagger-output.json';
const routes = ['./server.js'];

swaggerAutogen()(outputFile, routes, doc);