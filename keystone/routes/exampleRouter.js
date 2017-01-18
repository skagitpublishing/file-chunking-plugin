var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
	api: importRoutes('./api') 
};

module.exports = function(app) {

  // Keystone Views
  app.get('/test', routes.views.test);
  
  // Plugin API Route
  //app.get('/api/exampleplugin/list', keystone.middleware.api, routes.api.exampleplugin.list);
  //app.all('/api/exampleplugin/create', keystone.middleware.api, routes.api.exampleplugin.create);
  //app.all('/api/exampleplugin/:id/update', keystone.middleware.api, routes.api.exampleplugin.update);
	//app.get('/api/exampleplugin/:id/remove', keystone.middleware.api, routes.api.exampleplugin.remove);
  
  //app.get('/fileid', keystone.middleware.api, routes.api.filechunking.fileid);
  //app.all('/upload', keystone.middleware.api, routes.api.filechunking.upload);
  //app.get('/download/:identifier', keystone.middleware.api, routes.api.filechunking.download);
  
  //File Upload with flow.js - These are flow.js specific API calls
  app.get('/api/flow', keystone.middleware.api, routes.api.flow.get); //Get metadata on file upload progress, etc.
  app.post('/api/flow', keystone.middleware.api, routes.api.flow.post); //Upload a file
  app.get('/api/flow/download/:identifier', keystone.middleware.api, routes.api.flow.download); //download a file
  
  //File Upload with flow.js - These are KeystoneJS API calls for managing files in the DB.
  app.get('/api/flowfiles/list', keystone.middleware.api, routes.api.flow.list);
  app.get('/api/flowfiles/:id', keystone.middleware.api, routes.api.flow.getDBItem);
  app.get('/api/flowfiles/:id/update', keystone.middleware.api, routes.api.flow.update);
  app.get('/api/flowfiles/:id/remove', keystone.middleware.api, routes.api.flow.remove);
  
  // NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);
  app.get('/loggedinuser', middleware.requireUser, routes.views.loggedinuser);
}