import createFolder from './create-folder';
import deleteResource from './delete-resource';
import download from './download';
import fetchAndUse from './fetchAndUse';
import upload from './upload';
import rename from './rename';
import sort from './sort';
import ktkAssignImageSeries from './ktkAssignImageSeries';

const capabilities = [
  createFolder,
  rename,
  download,
  upload,
  deleteResource,
  fetchAndUse,
  sort,
  ktkAssignImageSeries
];

/**
 * Actions' fields list:
 *  showDialog,
 *  hideDialog,
 *  navigateToDir,
 *  updateNotifications,
 *  getSelection,
 *  getSelectedResources,
 *  getResource,
 *  getResourceChildren,
 *  getResourceLocation,
 *  getNotifications,
 *  getSortState
 *
 *  Called from FileNavigator (componentDidMount() and componentWillReceiveProps())
 *
 * @param apiOptions
 * @param {object} actions
 * @returns {array}
 */
export default (apiOptions, actions) => (
  capabilities.map(capability => capability(apiOptions, actions))
);
