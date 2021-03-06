var async = require('async'),
keystone = require('keystone');
var exec = require('child_process').exec;
var flow = require('./flow-node.js')('public/uploads/flow');

var security = keystone.security;

var FlowModel = keystone.list('FlowModel');
 
/**
 * List the flow file records stored in the database
 */
exports.list = function(req, res) {
        FlowModel.model.find(function(err, items) {

                if (err) return res.apiError('database error', err);

                res.apiResponse({
                        collections: items
                });

        });
}

/**
 * Get File DB entry by ID
 */
exports.getDBItem = function(req, res) {
  
  FlowModel.model.findById(req.params.id).exec(function(err, item) {

    if (err) return res.apiError('database error', err);
    if (!item) return res.apiError('not found');

    res.apiResponse({
            collection: item
    });

  });
  
}




/**
 * Update File by ID. Note, this only affects the DB model, not the actual file.
 */
exports.update = function(req, res) {
  
  //Ensure the user has a valid CSRF token
	//if (!security.csrf.validate(req)) {
	//	return res.apiError(403, 'invalid csrf');
	//}
  
  //Ensure the user making the request is a Keystone Admin
  var isAdmin = req.user.get('isAdmin');
  if(!isAdmin) {
    return res.apiError(403, 'Not allowed to access this API. Not Keystone Admin.');
  }
  
  //Since it's possible to spoof the Keystone Admin setting in the current version of the User model,
  //This is a check to make sure the user is a ConnexstCMS Admin
  var admins = keystone.get('admins');
  var userId = req.user.get('id');
  if(admins.indexOf(userId) == -1) {
    return res.apiError(403, 'Not allowed to access this API. Not ConnextCMS Admin')
  }
  
  FlowModel.model.findById(req.params.id).exec(function(err, item) {

    if (err) return res.apiError('database error', err);
    if (!item) return res.apiError('not found');

    var data = (req.method == 'POST') ? req.body : req.query;

    item.getUpdateHandler(req).process(data, function(err) {

      if (err) return res.apiError('create error', err);

      res.apiResponse({
              collection: item
      });

    });

  });
}


/**
 * Delete File by ID
 * Note: This will only delete the database entry. The file will still exist on the drive of the server.
 */
exports.remove = function(req, res) {
  
  //Ensure the user has a valid CSRF token
	//if (!security.csrf.validate(req)) {
	//	return res.apiError(403, 'invalid csrf');
	//}
  
  //Ensure the user making the request is a Keystone Admin
  var isAdmin = req.user.get('isAdmin');
  if(!isAdmin) {
    return res.apiError(403, 'Not allowed to access this API. Not Keystone Admin.');
  }
  
  //Since it's possible to spoof the Keystone Admin setting in the current version of the User model,
  //This is a check to make sure the user is a ConnexstCMS Admin
  var admins = keystone.get('admins');
  var userId = req.user.get('id');
  if(admins.indexOf(userId) == -1) {
    return res.apiError(403, 'Not allowed to access this API. Not ConnextCMS Admin')
  }
  
	var fileId = req.params.id;
	FlowModel.model.findById(req.params.id).exec(function (err, item) {

		if (err) return res.apiError('database error', err);
		if (!item) return res.apiError('not found');
		
		item.remove(function (err) {

			if (err) return res.apiError('database error', err);
			
			//Delete the file
      exec('rm public/uploads/files/'+fileId+'.*', function(err, stdout, stderr) { 
        if (err) { 
            console.log('child process exited with error code ' + err.code); 
            return; 
        } 
        console.log(stdout); 
      });

			return res.apiResponse({
				success: true
			});
		});
		
	});
}

/*
 * These functions are adapted from the flow.js sample file
 *
*/

/**
 * Get information on file upload progress
 */
exports.get = function(req, res) {

  flow.get(req, function(status, filename, original_filename, identifier) {
    console.log('GET', status);

    if (status == 'found') {
      status = 200;
    } else {
      status = 204;
    }

    res.status(status).send();
  });
}

/*
 * Download the selected file
 */
exports.download = function(req, res) {
  flow.write(req.params.identifier, res);
}

/**
 * Upload a New File and create a new DB model.
 */
//exports.create = function(req, res) {
exports.post = function(req, res) {
  //debugger;
/*
  //Ensure the user has a valid CSRF token
	if (!security.csrf.validate(req)) {
		return res.apiError(403, 'invalid csrf');
	}
  
  //Ensure the user making the request is a Keystone Admin
  var isAdmin = req.user.get('isAdmin');
  if(!isAdmin) {
    return res.apiError(403, 'Not allowed to access this API. Not Keystone Admin.');
  }
  
  //Since it's possible to spoof the Keystone Admin setting in the current version of the User model,
  //This is a check to make sure the user is a ConnexstCMS Admin
  var admins = keystone.get('admins');
  var userId = req.user.get('id');
  if(admins.indexOf(userId) == -1) {
    return res.apiError(403, 'Not allowed to access this API. Not ConnextCMS Admin')
  }
*/  
  
  var data = (req.method == 'POST') ? req.body : req.query;
  
  //Only create the new model on the first chunk.
  if(data.flowChunkNumber == "1") {
    debugger;
    
    var item = new FlowModel.model();
		
    
    item.set({
      name: data.name,
      createdTimeStamp: data.createdTimeStamp,
      fileType: data.fileType,
      flowIdentifier: data.flowIdentifier
    });
    
    item.save();
  }
  
  
  flow.post(req, function(status, filename, original_filename, identifier) {
    console.log('POST', status, original_filename, identifier);

    if((status == "partly_done") || (status == "done")){
      var statusVal = 200;
    } else {
      var statusVal = 500;
    }
    
    res.status(statusVal).send(status);
  });
}
