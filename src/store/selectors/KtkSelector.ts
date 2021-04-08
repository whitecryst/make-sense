import {store} from "../..";
import {ImageSeriesMeta, ImageSeriesContent, SymbolsContent} from "../ktk/types";
import {find} from "lodash";
import { LabelName } from "../../store/labels/types";
import { file } from "jszip";
import { addImageSeriesContentRow } from "../ktk/actionCreators";
//import {LabelType} from "../../data/enums/LabelType";

export class KtkSelector {

    public static getImageSeriesMetaSize(): number {
        return store.getState().ktk.imageSeriesMeta.length;
    }

    public static getImageSeriesMeta(): ImageSeriesMeta[] {
        return store.getState().ktk.imageSeriesMeta;
    }

    public static getImageSeriesMetaById(seriesId: string): ImageSeriesMeta {
        return find(store.getState().ktk.imageSeriesMeta, {seriesId: seriesId});
    }

    public static getImageSeriesContentSize(): number {
        return store.getState().ktk.imageSeriesContent.length;
    }

    public static getImageSeriesContent(): ImageSeriesContent[] {
        return store.getState().ktk.imageSeriesContent;
    }

    public static getImageUrlByFileResource( fileResource ) {
        let ancestors = fileResource.ancestors.map( (r) => (r.name) ).join('/');
        let filePath = ancestors + '/' + fileResource.name;
        const baseUrl = 'http://mantis-kungfu.berlin/files';
        const imgUrl = baseUrl + filePath.replace("Images", "");
        return imgUrl;
    }
    public static getImageSeriesContentByfilePath(fileResource): ImageSeriesContent {
        const imgUrl = this.getImageUrlByFileResource( fileResource )
        //console.log( "imgUrl: "+imgUrl );
        let ktkImgCnt = find(store.getState().ktk.imageSeriesContent, {url: imgUrl});

        if (ktkImgCnt == null) {
            //console.log("cntNull");
            let newCnt:ImageSeriesContent = {
                seriesId: "0",
                imageId: "0",
                url: imgUrl
            }; 
            store.dispatch( addImageSeriesContentRow(  newCnt ) );
            ktkImgCnt = newCnt;
        }

        return ktkImgCnt;
    }

    public static getSymbolsContentSize(): number {
        return store.getState().ktk.symbolsContent.length;
    }

    public static getSymbolsContent(): SymbolsContent[] {
        return store.getState().ktk.symbolsContent;
    }

    public static getSymbolsContentAsLabelNames(): LabelName[] {
        let labelNames = [];
        for( let actSymbolContent of store.getState().ktk.symbolsContent ) {
            let actLabelName = { name: actSymbolContent.name,
              id: actSymbolContent.symbolId};
            labelNames.push( actLabelName );
        }
        console.log( "labelNamesFromSymbols:" );
        console.log( labelNames )
        return labelNames;
    }

}