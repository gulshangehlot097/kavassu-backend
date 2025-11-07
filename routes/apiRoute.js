
async function apiRoute(fastify) {
    fastify.register(require('./userRoutes'),{prefix:'/user'});
    fastify.register(require('./adminRoutes'),{prefix:'/admin'});
}
module.exports=apiRoute