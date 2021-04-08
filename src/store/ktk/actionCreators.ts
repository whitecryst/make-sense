import {KtkActionTypes, ImageSeriesMeta, ImageSeriesContent, SymbolsContent} from "./types";
import {Action} from "../Actions";
//import {LabelType} from "../../data/enums/LabelType";

export function updateImageSeriesMeta(imageSeriesMeta: ImageSeriesMeta[]): KtkActionTypes {
    
    return {
        type: Action.UPDATE_IMAGESERIES_META,
        payload: {
            imageSeriesMeta
        }
    };
}

export function addImageSeriesContentRow( imageSeriesContentRow: ImageSeriesContent ): KtkActionTypes {
    return {
        type: Action.ADD_IMAGESERIES_CONTENT_ROW,
        payload: {
            imageSeriesContentRow
        }
    }
}

export function updateImageSeriesContentRow( imageSeriesContentRow: ImageSeriesContent ): KtkActionTypes {
    return {
        type: Action.UPDATE_IMAGESERIES_CONTENT_ROW,
        payload: {
            imageSeriesContentRow
        }
    }
}

export function updateImageSeriesContent(imageSeriesContent: ImageSeriesContent[]): KtkActionTypes {
    
    return {
        type: Action.UPDATE_IMAGESERIES_CONTENT,
        payload: {
            imageSeriesContent
        }
    };
}

export function updateSymbolsContent(symbolsContent: SymbolsContent[]): KtkActionTypes {
    
    return {
        type: Action.UPDATE_SYMBOLS_CONTENT,
        payload: {
            symbolsContent
        }
    };
}

