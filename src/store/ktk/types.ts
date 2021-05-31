//import {IRect} from "../../interfaces/IRect";
import {Action} from "../Actions";
//import {LabelType} from "../../data/enums/LabelType";
//import {IPoint} from "../../interfaces/IPoint";
//import {LabelStatus} from "../../data/enums/LabelStatus";
//import {ILine} from "../../interfaces/ILine";

export type ImageSeriesMeta = {
    seriesId: string;
    type: string;
    source: string;
    info: string;
    lineage: string;
    routine: string;
} 

export type ImageSeriesContent = {
    seriesId: string;
    imageId: string;
    url: string;
    imageMap: string;
    posture: PostureContent; 
    technique: Technique;
    sheetRow: number;
} 

export type Technique = {
    handTechnique: string;
    footTechnique: string;
    kungfuTechnique: string
}

 export type PostureContent = {
     leftHand: SymbolsContent;
     leftArm: SymbolsContent;
     rightHand: SymbolsContent;
     rightArm: SymbolsContent;
     body: SymbolsContent;
     leftFoot: SymbolsContent;
     leftLeg: SymbolsContent;
     rightFoot: SymbolsContent;
     rightLeg: SymbolsContent;
     postureHash: String;
     postureContentArr: SymbolsContent[];
 }

export type SymbolsContent = {
    id: string;
    category: string;
    name: string;
    fullname: string
    imgUrl: string;
    description: string;
    /*handTechniqueContent: HandTechniqueContent;
    footTechniqueContent: FootTechniqueContent;*/
} 
/*
export type HandTechniqueContent = {
    leftHandPosture: SymbolsContent;
    rightHandPosture: SymbolsContent;
    leftArmPosture: SymbolsContent;
    rightArmPosture: SymbolsContent;
    bodyPosture: SymbolsContent;
    orientation: TechniqueOrientation;
}

export type FootTechniqueContent = {
    leftFootPosture: SymbolsContent;
    rightFootPosture: SymbolsContent;
    leftLegPosture: SymbolsContent;
    rightLegPosture: SymbolsContent;
    orientation: TechniqueOrientation;
}*/

export enum TechniqueOrientation {
    LEFT_ARM_FRONT = "Left arm front",
    RIGHT_ARM_FRONT = "Right arm front",
    BOTH_ARMS_EQUAL = "Both arms equal",
    LEFT_FOOT_FRONT = "Left foot front",
    RIGHT_FOOT_FRONT = "Right foot front",
    BOTH_FOOT_EQUAL = "Both foots equal"
}

export enum SymbolCategory {
    BODY_PART = 'Body part',
    HAND_POSTURE = 'Hand posture',
    ARM_POSTURE = 'Arm posture',
    BODY_POSTURE = 'Body posture',
    LEG_POSTURE = 'Leg posture',
    FOOT_POSTURE = 'Foot posture',
    HAND_TECHNIQUE = 'Hand technique',
    FOOT_TECHNIQUE = 'Foot technique',
    KUNGFU_TECHNIQUE = 'Kungfu technique',
    PERSON = 'Person',
    OPPONENT = 'Opponent',
    POSITION = 'Position'
}

export type KtkState = {
    imageSeriesMeta: ImageSeriesMeta[];
    imageSeriesContent: ImageSeriesContent[];
    symbolsContent: SymbolsContent[];
}

interface UpdateImageSeriesMeta {
    type: typeof Action.UPDATE_IMAGESERIES_META;
    payload: {
        imageSeriesMeta: ImageSeriesMeta[];
    }
}

interface UpdateImageSeriesContent {
    type: typeof Action.UPDATE_IMAGESERIES_CONTENT;
    payload: {
        imageSeriesContent: ImageSeriesContent[];
    }
}

interface UpdateSymbolsContent {
    type: typeof Action.UPDATE_SYMBOLS_CONTENT;
    payload: {
        symbolsContent: SymbolsContent[];
    }
}

export type KtkActionTypes = UpdateImageSeriesMeta
    | UpdateImageSeriesContent
    | UpdateSymbolsContent

