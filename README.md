# file-chunking-plugin
This is a plugin for ConnextCMS/KeystoneJS based on the [plugin template repository](https://github.com/skagitpublishing/plugin-template-connextcms).
It incorporates file uploading with chunking and resumable uploads.

This repository is currently being developed and is not intended for public use.
This plugin is based on [flow.js](https://github.com/flowjs/flow.js)

At present the following APIs are functional:

* Adapted from flow.js:
  * GET /api/flow - retrieves data about a flow upload.
  * POST /api/flow - used to upload files using chunking and create a new database model
  * GET /api/flow/download/:identifier - Used to download files previously uploaded using flow
  
* KeystoneJS 'standard' API functions:
  * GET /api/flowfiles/list - Get all the DB entries of flow files that have been uploaded
  * GET /api/flowfiles/:id - Get a specific DB entry for a flow file
  * POST /api/flowfiles/:id/update - Update a DB entry for a flow file
  * GET /api/flowfiles:id/remove - Delete a DB entry for a flow file.
  
Things that will need significant research and development:
* Removing files from the server hard drive when the /remove api is called.
* Compiling uploaded file chunks into a single file on the server side after upload is complete
* Creating a ConnextCMS view to replace the existing file and image management.
