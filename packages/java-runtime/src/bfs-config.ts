import * as BrowserFS from 'browserfs';

BrowserFS.configure({ "fs": "IndexedDB", "options": {} }, function(error) {
	if (error) {
		throw new Error(error.toString());
	}
});
