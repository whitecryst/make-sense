import api from '../api';
import notifUtils from '../utils/notifications';
import { promptToSaveBlob } from '../utils/download';
import onFailError from '../utils/onFailError';
import {nanoid} from 'nanoid';
import icons from '../icons-svg';
import getMess from '../translations';
import request from 'superagent';
import {ImageDataUtil} from "../../../utils/ImageDataUtil";
import {LabelUtil} from "../../../utils/LabelUtil";
import { KtkSelector } from '../../../store/selectors/KtkSelector';
import { Side } from '../../../store/labels/types';
import { KtkActions } from '../../../logic/actions/KtkActions';


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
      
      for( var actResource of resources ) {
        const { id, name, ktk_imageSeriesContent } = actResource;
        const downloadUrl = `${apiOptions.apiRoot}/download?items=${id}`;
        const res = await request.get(downloadUrl).set('Authorization', 'Basic ' + btoa('kungfu:V2KeedPRaqQ8')).
        responseType('blob').
        on('progress', event => {
          onProgress(event.percent);
        });

        //console.log(res.body);
        var b = res.body;
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        b.lastModifiedDate = new Date();
        b.name = "test.jpg";
        let newImageData = ImageDataUtil.createImageDataFromFileData(b);
        console.log("fetchAndUse");
        console.log(actResource);
        // now add ktk imageSeries data
        newImageData.ktk_imageSeriesContent = ktk_imageSeriesContent;

        // add existing annotations if available
        if( ktk_imageSeriesContent != null ) {
          
          if( ktk_imageSeriesContent.imageMap != null && ktk_imageSeriesContent.posture != null) {
            // set labelNameIds (symbolIds)
            newImageData.labelnameIds = ktk_imageSeriesContent.posture.postureContentArr.filter( s => s ).map( s => s.id );
            
            // load piontLabels (bodyParts) from imageMap field
            let labelStrings = ktk_imageSeriesContent.imageMap.split("\n");
            for( let actLabelString of labelStrings ) {
              console.log(actLabelString);
              const actParts = actLabelString.split("[[");
              if( actParts.length == 2 ) {
                const actNumberParts = actParts[0].split(" ");
                if( actLabelString.includes("circle") ) { // it is a pointLabel
                  if( actNumberParts.length >= 4  ) {
                    let point = {
                        x:Number(actNumberParts[1]),
                        y:Number(actNumberParts[2])
                    }
                    const actLabelFullname = actParts[1].replaceAll("[","").replaceAll("]","");
                    const symbol = KtkSelector.getSymbolsContent().find( s => s.fullname == actLabelFullname);
                    let newLabelPoint = LabelUtil.createLabelPoint(symbol.id, point);
                    // add symbol object
                    console.log( actLabelFullname );
                    newLabelPoint.symbol = symbol;
                    console.log( newLabelPoint.symbol );
                    newLabelPoint.side = KtkActions.getSideFromSymbol( newLabelPoint.symbol );
                    newImageData.labelPoints.push( newLabelPoint );
                  }
                } else if (actLabelString.includes("rect")) { // load RectLabels (symbols) from symbolsfield
                  if( actNumberParts.length >= 5  ) {
                    let rect = {x:Number(actNumberParts[1]),
                        y:Number(actNumberParts[2]),
                        height:Number(actNumberParts[4])-Number(actNumberParts[2]),
                        width:Number(actNumberParts[3])-Number(actNumberParts[1])
                    }
                    const actLabelFullname = actParts[1].replaceAll("[","").replaceAll("]","");
                    const symbol = KtkSelector.getSymbolsContent().find( s => s.fullname == actLabelFullname);
                    console.log(actLabelFullname);
                    console.log( symbol);
                    let newLabelRect = LabelUtil.createLabelRect(symbol.id, rect);
                    // add symbol object
                    newLabelRect.symbol = symbol;
                    newLabelRect.side = KtkActions.getRectLabelSideFromPoints( newLabelRect, newImageData.labelPoints );
                    newImageData.labelRects.push( newLabelRect );
                  }
                } else {
                  console.log("imageMap circle: bad content:"+actLabelString);
                }
              }
            }
          }
        }
        addImageData( newImageData );
      }
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

