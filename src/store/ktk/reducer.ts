import {KtkState, KtkActionTypes, ImageSeriesContent} from "./types";
import {Action} from "../Actions";
import { updateImageSeriesContent } from "./actionCreators";


const initialState: KtkState = {
    imageSeriesMeta: [],
    imageSeriesContent: [],
    symbolsContent: []
};

export function ktkReducer(
    state = initialState,
    action: KtkActionTypes
): KtkState {
    switch (action.type) {
        case Action.UPDATE_IMAGESERIES_META: {
            console.log("ktkReducer_UpdateImageSeriesMeta");
            return {
                ...state,
                imageSeriesMeta: action.payload.imageSeriesMeta,
            }
        }
        case Action.ADD_IMAGESERIES_CONTENT_ROW: {
            console.log("ktkReducer_AddImageSeriesContentRow");
            return {
                ...state,
                imageSeriesContent: state.imageSeriesContent.concat(action.payload.imageSeriesContentRow),
            }
            
        }
        case Action.UPDATE_IMAGESERIES_CONTENT: {
            console.log("ktkReducer_UpdateImageSeriesContent");
            return {
                ...state,
                imageSeriesContent: action.payload.imageSeriesContent,
            }
        }
        case Action.UPDATE_SYMBOLS_CONTENT: {
            console.log("ktkReducer_UpdateSymbolsContent");
            return {
                ...state,
                symbolsContent: action.payload.symbolsContent,
            }
        }
       
        default:
            return state;
    }
}