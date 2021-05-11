import * as posenet from '@tensorflow-models/posenet';
import {PoseNet} from "@tensorflow-models/posenet";
import {Pose} from "@tensorflow-models/posenet";
import {store} from "../index";
import {updatePoseDetectorStatus} from "../store/ai/actionCreators";
import {AIPoseDetectionActions} from "../logic/actions/AIPoseDetectionActions";
import {LabelType} from "../data/enums/LabelType";
import {LabelsSelector} from "../store/selectors/LabelsSelector";
import {updateActiveLabelType} from "../store/labels/actionCreators";

export class PoseDetector {
    private static model: PoseNet;

    public static loadModel(callback?: () => any) {
        posenet
            .load({
                architecture: 'ResNet50',
                outputStride: 32,
                inputResolution: 257,
                quantBytes: 2
            })
            .then((model: PoseNet) => {
                PoseDetector.model = model;
                store.dispatch(updatePoseDetectorStatus(true));
                store.dispatch(updateActiveLabelType(LabelType.POINT));
                const activeLabelType: LabelType = LabelsSelector.getActiveLabelType();
                activeLabelType === LabelType.POINT && AIPoseDetectionActions.detectPoseForActiveImage();
                callback && callback();
            })
            .catch((error) => {
                // TODO
                throw new Error(error);
            })
    }

    public static predict(image: HTMLImageElement, callback?: (prediction: Pose[]) => any) {
        if (!PoseDetector.model) return;

        PoseDetector.model
            .estimateSinglePose(image)
            //.estimateMultiplePoses(image)
            .then((prediction: Pose/*[]*/) => {
                let predictions:Pose[] = [prediction];
                callback && callback(predictions)
            })
            .catch((error) => {
                // TODO
                throw new Error(error);
            })
    }
}