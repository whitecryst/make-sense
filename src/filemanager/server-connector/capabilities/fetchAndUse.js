import api from '../api';
import notifUtils from '../utils/notifications';
import { promptToSaveBlob } from '../utils/download';
import onFailError from '../utils/onFailError';
import {nanoid} from 'nanoid';
import icons from '../icons-svg';
import getMess from '../translations';
import request from 'superagent';
import {ImageDataUtil} from "../../../utils/ImageDataUtil";


const label = 'annotate';

async function handler(apiOptions, actions) {
    const {
      updateNotifications,
      getSelectedResources,
      getNotifications,
      addImageData
    } = actions;
  
    const getMessage = getMess.bind(null, apiOptions.locale);
  
    const notificationId = label;
    const notificationChildId = nanoid();
  
    const onStart = ({ archiveName, quantity }) => {
      const notifications = getNotifications();
      const notification = notifUtils.getNotification(notifications, notificationId);
  
      const childElement = {
        elementType: 'NotificationProgressItem',
        elementProps: {
          title: getMessage('creatingName', { name: archiveName }),
          progress: 0
        }
      };
  
      const newChildren = notifUtils.addChild(
        (notification && notification.children) || [], notificationChildId, childElement
      );
      const newNotification = {
        title: quantity > 1 ? getMessage('zippingItems', { quantity }) : getMessage('zippingItem'),
        children: newChildren
      };
  
      const newNotifications = notification ?
        notifUtils.updateNotification(notifications, notificationId, newNotification) :
        notifUtils.addNotification(notifications, notificationId, newNotification);
  
      updateNotifications(newNotifications);
    };
  
    const onSuccess = _ => {
      const notifications = getNotifications();
      const notification = notifUtils.getNotification(notifications, notificationId);
      const notificationChildrenCount = notification.children.length;
      let newNotifications;
  
      if (notificationChildrenCount > 1) {
        newNotifications = notifUtils.updateNotification(
          notifications,
          notificationId, {
            children: notifUtils.removeChild(notification.children, notificationChildId)
          }
        );
      } else {
        newNotifications = notifUtils.removeNotification(notifications, notificationId);
      }
      updateNotifications(newNotifications);
    };
  
    const onProgress = (progress) => {
      /*const notifications = getNotifications();
      const notification = notifUtils.getNotification(notifications, notificationId);
      const child = notifUtils.getChild(notification.children, notificationChildId);
  
      const newChild = {
        ...child,
        element: {
          ...child.element,
          elementProps: {
            ...child.element.elementProps,
            progress
          }
        }
      };
      const newChildren = notifUtils.updateChild(notification.children, notificationChildId, newChild);
      const newNotifications = notifUtils.updateNotification(notifications, notificationId, { children: newChildren });
      updateNotifications(newNotifications);*/
    };


    try {
      const resources = getSelectedResources();
      
      for( var actResource of resources ){
        const { id, name } = actResource;
        const downloadUrl = `${apiOptions.apiRoot}/download?items=${id}`;
        const res = await request.get(downloadUrl).
        responseType('blob').
        on('progress', event => {
          onProgress(event.percent);
        });

        console.log(res.body);
        var b = res.body;
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        b.lastModifiedDate = new Date();
        b.name = "test.jpg";
        
        addImageData( ImageDataUtil.createImageDataFromFileData(b) );
      }
/*
      const quantity = resources.length;
      if (quantity === 1) {
        const { id, name } = resources[0];
        const downloadUrl = `${apiOptions.apiRoot}/download?items=${id}`;
        // check if the file is available and trigger native browser saving prompt
        // if server is down the error will be catched and trigger relevant notification
        //const resourceMeta = await api.getResourceById(apiOptions, id);
        //console.log(resourceMeta);
        console.log(resources);
        const res = await request.get(downloadUrl).
        responseType('blob').
        on('progress', event => {
          onProgress(event.percent);
        });

        console.log(res.body);
        var b = res.body;
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        b.lastModifiedDate = new Date();
        b.name = "test.jpg";
        
        addImageData( ImageDataUtil.createImageDataFromFileData(b) );
        //addImageData( ImageDataUtil.createImageDataFromFileData(b));
        
      } else {
        // multiple resources -> download as a single archive
        
        for(  )
        setTimeout(onSuccess, 1000);
        //promptToSaveBlob({ content, name: archiveName })
        console.log(content);
      }*/
    } catch (err) {
      onFailError({
        getNotifications,
        label: getMessage(label),
        notificationId : String,
        updateNotifications,
        err
      });
      console.log(err)
    }
  }


  
export default function f(apiOptions, actions) {
    const localeLabel = getMess(apiOptions.locale, label);
    const { getSelectedResources } = actions;
    return {
      id: label,
      icon: { svg: icons.annotate },
      label: localeLabel,
      shouldBeAvailable: (apiOptions) => {
        const selectedResources = getSelectedResources();
  
        return (
          selectedResources.length > 0 &&
          !selectedResources.some(r => r.type === 'dir') &&
          selectedResources.every(r => r.capabilities.canDownload)
        );
      },
      availableInContexts: ['row', 'toolbar'],
      handler: () => handler(apiOptions, actions)
    };
  }

