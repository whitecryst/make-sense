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
    symbolIds: string;
} 


export type SymbolsContent = {
    symbolId: string;
    category: string;
    name: string;
    fullname: string
    imgUrl: string;
    description: string;
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

