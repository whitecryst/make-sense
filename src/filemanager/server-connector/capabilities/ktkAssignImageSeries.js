import api from '../api';
import onFailError from '../utils/onFailError';
import icons from '../icons-svg';
import getMess from '../translations';
import { KtkActions } from '../../../logic/actions/KtkActions';


const label = 'assignImageSeries';

function handler(apiOptions, actions) {
  const {
    showDialog,
    hideDialog,
    navigateToDir,
    updateNotifications,
    getSelectedResources,
    getResource,
    getNotifications
  } = actions;

  const getMessage = getMess.bind(null, apiOptions.locale);
  const localeLabel = getMessage(label);

  const rawDialogElement = {
    elementType: 'AssignImageSeriesDialog',
    elementProps: {
      initialValue: '',
      onHide: hideDialog,
      onSubmit: async (imageSeriesId) => {
        console.log("submit");
        console.log( imageSeriesId );
        const selectedResources = getSelectedResources();
        try {
          const parentId = await api.getParentIdForResource(apiOptions, selectedResources[0]);
          KtkActions.upsertImageSeriesContentRow(imageSeriesId, selectedResources).then(
            (value) => {
              hideDialog();
              // update ListView
              if (parentId) {
                console.log("parent");
                navigateToDir(parentId, selectedResources.map(x => x.id), true);
              }
            }
          );
          return null;
        } catch (err) {
          hideDialog();
          onFailError({
            getNotifications,
            label: localeLabel,
            notificationId: label,
            updateNotifications
          });
          console.log(err);
          return null
        }
      },
      onValidate: async (imageSeriesId) => {
        console.log("validate");
        if (!imageSeriesId) {
          return getMessage('emptyImageSeriesId');
        } 
        return null;
      },
      inputLabelText: getMessage('imageSeriesId'),
      headerText: getMessage('assignImageSeriesId'),
      submitButtonText: localeLabel,
      cancelButtonText: getMessage('cancel')
    }
  };
  showDialog(rawDialogElement);
}

export default (apiOptions, actions) => {
  const localeLabel = getMess(apiOptions.locale, label);
  const { getSelectedResources } = actions;
  return {
    id: label,
    icon: { svg: icons.assignImageId },
    label: localeLabel,
    shouldBeAvailable: (apiOptions) => {
      const selectedResources = getSelectedResources();
      
      return (
        selectedResources.length > 0 && !selectedResources.some(r => r.type === 'dir')
      );
    },
    availableInContexts: ['row', 'toolbar'],
    handler: () => handler(apiOptions, actions)
  };
}
