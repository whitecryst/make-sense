//import {DetectedObject} from "@tensorflow-models/coco-ssd";
import {ImageData, LabelName, LabelRect} from "../../store/labels/types";
import {LabelsSelector} from "../../store/selectors/LabelsSelector";
import { v4 as uuidv4 } from 'uuid';
import {store} from "../../index";
import {updateImageDataById} from "../../store/labels/actionCreators";
import {ObjectDetector} from "../../ai/ObjectDetector";
import {ImageRepository} from "../imageRepository/ImageRepository";
import {LabelStatus} from "../../data/enums/LabelStatus";
import {findLast} from "lodash";
import {updateSuggestedLabelList} from "../../store/ai/actionCreators";
import {PopupWindowType} from "../../data/enums/PopupWindowType";
import {updateActivePopupType} from "../../store/general/actionCreators";
import {AISelector} from "../../store/selectors/AISelector";
import {AIActions} from "./AIActions";

export class AIObjectDetectionActions {
    public static detectRectsForActiveImage(): void {
        const activeImageData: ImageData = LabelsSelector.getActiveImageData();
        AIObjectDetectionActions.detectRects(activeImageData.id, ImageRepository.getById(activeImageData.id))
    }

    public static detectRects(imageId: string, image: HTMLImageElement): void {
        if (LabelsSelector.getImageDataById(imageId).isVisitedByObjectDetector || !AISelector.isAIObjectDetectorModelLoaded())
            return;

        store.dispatch(updateActivePopupType(PopupWindowType.LOADER));
        ObjectDetector.predict(image, (predictions: Object[]) => {
            const suggestedLabelNames = AIObjectDetectionActions.extractNewSuggestedLabelNames(LabelsSelector.getLabelNames(), predictions);
            const rejectedLabelNames = AISelector.getRejectedSuggestedLabelList();
            const newlySuggestedNames = AIActions.excludeRejectedLabelNames(suggestedLabelNames, rejectedLabelNames);
            if (newlySuggestedNames.length > 0) {
                store.dispatch(updateSuggestedLabelList(newlySuggestedNames));
                store.dispatch(updateActivePopupType(PopupWindowType.SUGGEST_LABEL_NAMES));
            } else {
                store.dispatch(updateActivePopupType(null));
            }
            AIObjectDetectionActions.saveRectPredictions(imageId, predictions);
        })
    }

    public static saveRectPredictions(imageId: string, predictions: Object[]) {
        const imageData: ImageData = LabelsSelector.getImageDataById(imageId);
        const predictedLabels: LabelRect[] = AIObjectDetectionActions.mapPredictionsToRectLabels(predictions);
        const nextImageData: ImageData = {
            ...imageData,
            labelRects: imageData.labelRects.concat(predictedLabels),
            isVisitedByObjectDetector: true
        };
        store.dispatch(updateImageDataById(imageData.id, nextImageData));
    }

    private static mapPredictionsToRectLabels(predictions: Object[]): LabelRect[] {
        return predictions.map((prediction: Object) => {
            return {
                id: uuidv4(),
                labelIndex: null,
                labelId: null,
                rect: {
                    x: 0,//prediction.bbox[0],
                    y: 0,//prediction.bbox[1],
                    width: 0,//prediction.bbox[2],
                    height: 0,//prediction.bbox[3],
                },
                isCreatedByAI: true,
                status: LabelStatus.UNDECIDED,
                suggestedLabel: "not implemented",//prediction.class
            }
        })
    }

    public static extractNewSuggestedLabelNames(labels: LabelName[], predictions: Object[]): string[] {
        /*return predictions.reduce((acc: string[], prediction: Object) => {
            if (!acc.includes(prediction.class) && !findLast(labels, {name: prediction.class})) {
                acc.push(prediction.class)
            }
            return acc;
        }, [])*/
        return ["not implemented"];
    }

    public static acceptAllSuggestedRectLabels(imageData: ImageData) {
        const newImageData: ImageData = {
            ...imageData,
            labelRects: imageData.labelRects.map((labelRect: LabelRect) => {
                const labelName: LabelName = findLast(LabelsSelector.getLabelNames(), {name: labelRect.suggestedLabel});
                return {
                    ...labelRect,
                    status: LabelStatus.ACCEPTED,
                    labelId: !!labelName ? labelName.id : labelRect.labelId
                }
            })
        };
        store.dispatch(updateImageDataById(newImageData.id, newImageData));
    }

    public static rejectAllSuggestedRectLabels(imageData: ImageData) {
        const newImageData: ImageData = {
            ...imageData,
            labelRects: imageData.labelRects.filter((labelRect: LabelRect) => labelRect.status === LabelStatus.ACCEPTED)
        };
        store.dispatch(updateImageDataById(newImageData.id, newImageData));
    }
}