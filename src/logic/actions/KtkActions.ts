//import {LabelsSelector} from "../../store/selectors/LabelsSelector";
import {store} from "../../index";
import {updateImageSeriesMeta, updateImageSeriesContent, updateImageSeriesContentRow, updateSymbolsContent, addSymbolsContentRow} from "../../store/ktk/actionCreators";
import {ViewPortActions} from "./ViewPortActions";
import {EditorModel} from "../../staticModels/EditorModel";
import { ImageSeriesMeta, ImageSeriesContent, SymbolsContent, PostureContent, SymbolCategory, TechniqueOrientation } from "../../store/ktk/types";
import { KtkSelector } from "../../store/selectors/KtkSelector";
import { COCOAnnotationsLoadingError } from "../import/coco/COCOErrors";
import {ImageData, LabelName, LabelRect, LabelPoint, Side} from "../../store/labels/types";
import { toInteger } from "lodash";
import { convertCompilerOptionsFromJson } from "typescript";
import {RectUtil} from "../../utils/RectUtil";
import {updateActivePopupType} from "../../store/general/actionCreators";
import {PopupWindowType} from "../../data/enums/PopupWindowType";

export class KtkActions {

    public static getRectLabelSideFromPoints(labelRect:LabelRect, labelPoints:LabelPoint[] ):Side {
        // get side
        let side = Side.UNKNOWN;
        let isLeft = 0;
        let isRight = 0;
        for( let actPointLabel of labelPoints ) {
            if( RectUtil.isPointInside(labelRect.rect, actPointLabel.point ) ) {
                
                if( actPointLabel.side == Side.LEFT) {
                    isLeft += 1;
                } else if( actPointLabel.side == Side.RIGHT) {
                    isRight += 1;
                }
            }
        }

        if( isLeft == isRight ) {
            side = Side.UNAMBIGIOUS;
        } else if( isLeft > isRight ) {
            side = Side.LEFT;
        } else if( isLeft < isRight) {
            side = Side.RIGHT;
        }

        return side;
    }

    public static getSideFromSymbol(symbol:SymbolsContent): Side {
        let side:Side = Side.UNKNOWN;
        if(symbol) {
            if( symbol.category == "Body part" ) {
                if( symbol.name.includes("left") ) {
                    side = Side.LEFT;
                } else if (symbol.name.includes("right") ) {
                    side = Side.RIGHT;
                } else {
                    side = Side.NONE; 
                }
            }
        }
        
        return side;
    }

    public static async loadImageSeriesMeta(): Promise<any> {
        store.dispatch(updateActivePopupType(PopupWindowType.LOADER));
        // get ktk imageSeriesId  from google sheets
        console.log("try to connect to google sheets");
        const { GoogleSpreadsheet } = require('google-spreadsheet');
        const creds = require('../../GoogleSheetCredentials.json'); // the file saved above
        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet('17Mdd7GZFlaZ169M7bJqiUf5WV437MCZ25_Hw9fgfJF8');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo(); // loads document properties and worksheets
        console.log(doc.title);
        const sheet = doc.sheetsByTitle['ImageSeriesMeta']; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
        const numrows = sheet.rowCount;
        console.log(sheet.title);
        console.log( numrows );
        // read cells
        await sheet.loadCells('A1:H'+sheet.rowCount);
        
        // read/write row values
        
        let content = [];
        for (var i = 1; i < numrows; i++) { // numrows
            let seriesId = sheet.getCell(i, 0).value;
            let type = sheet.getCell(i, 1).value;
            let source = sheet.getCell(i, 2).value;    
            let info = sheet.getCell(i, 3).value;    
            let lineageName = sheet.getCell(i, 5).value;    
            let routineName = sheet.getCell(i, 7).value;    
            if( seriesId && type == 'Image series') {
                let actContent:ImageSeriesMeta = {
                    seriesId: seriesId,
                    type: type,
                    source: source,
                    info: info,
                    lineage: lineageName,
                    routine: routineName
                }; 
                content.push(actContent);
            }

            
        }
        //console.log("content:");
        //console.log(content);
        store.dispatch( updateImageSeriesMeta(content) );
        console.log( "KtK ImageSeriesMeta updated" );
            
        store.dispatch(updateActivePopupType(null));  
    }

    public static parsePostureContentString( toParse:string): PostureContent {
        if( toParse == null || toParse == "") {
            return null;
        }
        // get id of symbols in correct order (left hand, left arm, right hand, right arm, body left foot, left leg, right foot, right leg)
        const symbolIdsArr:string[] = toParse.replaceAll("#",",").replaceAll("|",",").replaceAll("_","").split(",");
        
        if( symbolIdsArr.length != 9) {
            console.log("unable to parse postureHash: "+toParse);
            return null;
        }
        const symbolsContentArr:SymbolsContent[] = [];
        for( const actId of symbolIdsArr ) {
            //console.log("search for symbolId:"+actId);
            //console.log(  KtkSelector.getSymbolsContent() );
            //console.log( KtkSelector.getSymbolsContent().find( s => s.id == actId ) );
            symbolsContentArr.push( KtkSelector.getSymbolsContent().find( s => s.id == actId ) );
        }
        
        let result:PostureContent = {
            leftHand: symbolsContentArr[0],
            leftArm: symbolsContentArr[1],
            rightHand: symbolsContentArr[2],
            rightArm: symbolsContentArr[3],
            body: symbolsContentArr[4],
            leftFoot: symbolsContentArr[5],
            leftLeg: symbolsContentArr[6],
            rightFoot: symbolsContentArr[7],
            rightLeg: symbolsContentArr[8],
            postureHash: toParse,
            postureContentArr: symbolsContentArr
        }
        return result;
        
    }
    public static async loadImageSeriesContent(): Promise<any> {
        store.dispatch(updateActivePopupType(PopupWindowType.LOADER));
        // get ktk imageSeriesId  from google sheets
        console.log("try to connect to google sheets");
        const { GoogleSpreadsheet } = require('google-spreadsheet');
        const creds = require('../../GoogleSheetCredentials.json'); // the file saved above
        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet('17Mdd7GZFlaZ169M7bJqiUf5WV437MCZ25_Hw9fgfJF8');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo(); // loads document properties and worksheets
        console.log(doc.title);
        const sheet = doc.sheetsByTitle['ImageSeriesContent']; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
        const numrows = sheet.rowCount;
        console.log(sheet.title);
        console.log( numrows );
        // read cells
        await sheet.loadCells('A1:K'+sheet.rowCount);
        
        // read/write row values
        
        let content = [];
        for (var i = 1; i < numrows; i++) { // numrows
            let seriesId = sheet.getCell(i, 0).value;
            let actImageId = sheet.getCell(i, 1).value;
            let actImageUrl = sheet.getCell(i, 2).value; 
            let actImageMap = sheet.getCell(i, 4).value; 
            let actSymbolIds = sheet.getCell(i, 5).value;
            let actPostureContentString = sheet.getCell(i, 6).value;
            let actPostureContent = this.parsePostureContentString( actPostureContentString );
            let actTechniqueContent = {
                handTechnique: sheet.getCell(i, 8).value,
                footTechnique: sheet.getCell(i, 9).value,
                kungfuTechnique: sheet.getCell(i, 10).value
            }  
            let actContent:ImageSeriesContent = {
                seriesId: seriesId,
                imageId: actImageId,
                url: actImageUrl,
                imageMap: actImageMap,
                posture: actPostureContent,
                technique: actTechniqueContent,
                sheetRow: i
            }; 
            content.push(actContent);
        }
        store.dispatch( updateImageSeriesContent(content) );
        console.log( "KtK ImageSeriesContent updated" );  
        store.dispatch(updateActivePopupType(null));  
    }

    public static async fetchImageSeriesContentRow( imageSeriesContent: ImageSeriesContent ): Promise<ImageSeriesContent> {
        store.dispatch(updateActivePopupType(PopupWindowType.LOADER));
        // get ktk imageSeriesId  from google sheets
        console.log( "fetchImageSeriesConrentRow: "+imageSeriesContent.sheetRow);
        console.log("try to connect to google sheets");
        const { GoogleSpreadsheet } = require('google-spreadsheet');
        const creds = require('../../GoogleSheetCredentials.json'); // the file saved above
        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet('17Mdd7GZFlaZ169M7bJqiUf5WV437MCZ25_Hw9fgfJF8');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo(); // loads document properties and worksheets
        console.log(doc.title);
        const sheet = doc.sheetsByTitle['ImageSeriesContent']; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
        const numrows = sheet.rowCount;
        console.log(sheet.title);
        console.log( numrows );
        // read cells
        // get only one row of the wanted imageSeriesContent
        let i = imageSeriesContent.sheetRow;
        await sheet.loadCells('A'+(i+1)+':K'+(i+1));
        
        // read/write row values
        let content = [];
        let seriesId = sheet.getCell(i, 0).value;
        let actImageId = sheet.getCell(i, 1).value;
        let actImageUrl = sheet.getCell(i, 2).value; 
        let actImageMap = sheet.getCell(i, 4).value; 
        let actSymbolIds = sheet.getCell(i, 5).value;
        let actPostureContentString = sheet.getCell(i, 6).value;
        let actPostureContent = this.parsePostureContentString( actPostureContentString );
        let actTechniqueContent = {
            handTechnique: sheet.getCell(i, 8).value,
            footTechnique: sheet.getCell(i, 9).value,
            kungfuTechnique: sheet.getCell(i, 10).value
        }  
        imageSeriesContent.seriesId= seriesId;
        imageSeriesContent.imageId= actImageId;
        imageSeriesContent.url= actImageUrl;
        imageSeriesContent.imageMap= actImageMap;
        imageSeriesContent.posture= actPostureContent;
        imageSeriesContent.technique= actTechniqueContent;
        imageSeriesContent.sheetRow= i;
        
        //content.push(imageSeriesContent);
        //store.dispatch( updateImageSeriesContent(content) );
        console.log( "KtK ImageSeriesContentRow fetched" );  
        store.dispatch(updateActivePopupType(null));
        return imageSeriesContent
    }

    public static async udateImageAnnotation( imageData:ImageData ): Promise<any> {
        store.dispatch(updateActivePopupType(PopupWindowType.LOADER));
        let iSC:ImageSeriesContent = imageData.ktk_imageSeriesContent;

        if( iSC.imageId == "0" || iSC.seriesId == "0" ) {
            console.log( "unable to update annotation for image without imageSeriesId" );
            return null;
        }

        console.log("try to connect to google sheets");
        const { GoogleSpreadsheet } = require('google-spreadsheet');
        const creds = require('../../GoogleSheetCredentials.json'); // the file saved above
        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet('17Mdd7GZFlaZ169M7bJqiUf5WV437MCZ25_Hw9fgfJF8');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo(); // loads document properties and worksheets
        console.log(doc.title);
        const sheet = doc.sheetsByTitle['ImageSeriesContent']; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
        const numrows = sheet.rowCount;
        console.log(sheet.title);
        //await sheet.loadCells('A1:H'+numrows);
        
        //find rowNr to insert image content
        let rowToUpdate = imageData.ktk_imageSeriesContent.sheetRow;
        await sheet.loadCells('A'+(rowToUpdate+1)+':K'+(rowToUpdate+1));
             
        // create image Map
        let imageMap:String = "";
        imageMap += imageData.labelPoints.map( p => "circle "+toInteger(p.point.x)+" "+toInteger(p.point.y)+" 20 [["+p.symbol.fullname+"]]" ).join("\n") + "\n";
        imageMap += imageData.labelRects.filter( r => r.symbol )
            .map( r => "rect "
                +toInteger(r.rect.x)+" "
                +toInteger(r.rect.y)+" "
                +toInteger(r.rect.x+r.rect.width)+" "
                +toInteger(r.rect.y+r.rect.height)
                +" [["+r.symbol.fullname+"]]"+
                ";Side:"+r.side 
            ).join("\n");
        
        //create List of symbolIds
        let symbolIdsArr:String[] = imageData.labelRects.map(r => r.labelId);
        let symbolIds:String = symbolIdsArr.join(",");

        //console.log( symbolIdsArr );
        //console.log( imageData.labelRects );
        
        // create hash of symbol ids to identify techniques
        const symbols = KtkSelector.getSymbolsContent() ;
        const leftHandSymbol = imageData.labelRects.find( lr => lr.symbol ? lr.symbol.category.includes( "Hand posture" ) && lr.side == Side.LEFT : false);
        const rightHandSymbol = imageData.labelRects.find( lr => lr.symbol ? lr.symbol.category.includes( "Hand posture" ) && lr.side == Side.RIGHT : false);
        const leftArmSymbol = imageData.labelRects.find( lr => lr.symbol ? lr.symbol.category.includes( "Arm posture" )  && lr.side == Side.LEFT : false);
        const rightArmSymbol = imageData.labelRects.find( lr => lr.symbol ? lr.symbol.category.includes( "Arm posture" ) && lr.side == Side.RIGHT : false);
        const leftLegSymbol = imageData.labelRects.find( lr => lr.symbol ? lr.symbol.category.includes( "Leg posture" ) && lr.side == Side.LEFT : false);
        const rightLegSymbol = imageData.labelRects.find( lr => lr.symbol ? lr.symbol.category.includes( "Leg posture" ) && lr.side == Side.RIGHT : false);
        const leftFootSymbol = imageData.labelRects.find( lr => lr.symbol ? lr.symbol.category.includes( "Foot posture" ) && lr.side == Side.LEFT : false);
        const rightFootSymbol = imageData.labelRects.find( lr => lr.symbol ? lr.symbol.category.includes( "Foot posture" ) && lr.side == Side.RIGHT : false);
        const bodySymbol = imageData.labelRects.find( lr => lr.symbol ? lr.symbol.category.includes( "Body posture" ) : false );
        

        const handTechniqueHash:String = ""
            +  (leftHandSymbol != undefined ? leftHandSymbol.labelId : "_")+ ","
            +  (leftArmSymbol != undefined ? leftArmSymbol.labelId : "_") + "|"
            +  (rightHandSymbol != undefined ? rightHandSymbol.labelId : "_") + ","
            +  (rightArmSymbol != undefined ? rightArmSymbol.labelId : "_") + "|"
            +  (bodySymbol != undefined ? bodySymbol.labelId : "_");

            const handTechniqueHashInverse:String = ""
            +  (rightHandSymbol != undefined ? rightHandSymbol.labelId : "_") + ","
            +  (rightArmSymbol != undefined ? rightArmSymbol.labelId : "_") + "|"
            +  (leftHandSymbol != undefined ? leftHandSymbol.labelId : "_")+ ","
            +  (leftArmSymbol != undefined ? leftArmSymbol.labelId : "_") + "|"
            +  (bodySymbol != undefined ? bodySymbol.labelId : "_");

        const footTechniqueHash:String = ""
            +  (leftFootSymbol != undefined ? leftFootSymbol.labelId : "_") + ","
            +  (leftLegSymbol != undefined ? leftLegSymbol.labelId : "_") + "|"
            +  (rightFootSymbol != undefined ? rightFootSymbol.labelId : "_") + ","
            +  (rightLegSymbol != undefined ? rightLegSymbol.labelId : "_");

            const footTechniqueHashInverse:String = ""
            +  (rightFootSymbol != undefined ? rightFootSymbol.labelId : "_") + ","
            +  (rightLegSymbol != undefined ? rightLegSymbol.labelId : "_")+ "|"
            +  (leftFootSymbol != undefined ? leftFootSymbol.labelId : "_") + ","
            +  (leftLegSymbol != undefined ? leftLegSymbol.labelId : "_") ;
            
            
        const kungfuTechniqueHash:String = handTechniqueHash + "#" + footTechniqueHash;
        const kungfuTechniqueHashInverse:String = handTechniqueHashInverse + "#" + footTechniqueHashInverse;
        console.log( "kungfuTechniqueHash:"+kungfuTechniqueHash );
        console.log( "kungfuTechniqueHashInverse:"+kungfuTechniqueHashInverse );
        //console.log( "existing:"+existingRowNr );
        let imageMapCell = sheet.getCell(rowToUpdate, 4);
        let symbolIdsCell = sheet.getCell(rowToUpdate, 5);
        let symbolIdsHashCell = sheet.getCell(rowToUpdate, 6);
        let symbolIdsHashInverseCell = sheet.getCell(rowToUpdate, 7);

        // update the cell contents and formatting
        let date = new Date().toLocaleString()
        imageMapCell.value = imageMap;
        symbolIdsCell.value = symbolIds;
        symbolIdsHashCell.value = kungfuTechniqueHash;
        symbolIdsHashInverseCell.value = kungfuTechniqueHashInverse;
        const updateNote = 'Updated via KtK-Commandbridge at '+ date;
        imageMapCell.note = updateNote;
        symbolIdsCell.note = updateNote;
        symbolIdsHashCell.note = updateNote;
        symbolIdsHashInverseCell.note = updateNote;
        await sheet.saveUpdatedCells(); // save all updates in one call
        console.log("...updated immageSeriesContent in sheet!");
        
        store.dispatch(updateActivePopupType(null));
    }

    /**
     * add or update id and image url data for a row (picture) in sheet ImageSeriesContent
     * @param newImageSeriesMeta 
     * @param selectedResources 
     */
    public static async upsertImageSeriesContentRow( newImageSeriesMeta:ImageSeriesMeta, selectedResources ): Promise<any> {
        store.dispatch(updateActivePopupType(PopupWindowType.LOADER));
        console.log("try to connect to google sheets");
        const { GoogleSpreadsheet } = require('google-spreadsheet');
        const creds = require('../../GoogleSheetCredentials.json'); // the file saved above
        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet('17Mdd7GZFlaZ169M7bJqiUf5WV437MCZ25_Hw9fgfJF8');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo(); // loads document properties and worksheets
        console.log(doc.title);
        const sheet = doc.sheetsByTitle['ImageSeriesContent']; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
        const numrows = sheet.rowCount;
        console.log(sheet.title);
        console.log( numrows ); 
        await sheet.loadCells('A1:D'+numrows);
        
        // for each selected file
        for( let actSelectedResource of selectedResources ) {
            let newImageId = 1;
            // get curent imageSeriesContent in redux store according to act file
            let existingImageSeriesContentRow:ImageSeriesContent = KtkSelector.getImageSeriesContentByfilePath(actSelectedResource);
            
            //find rowNr to insert image content
            let nextEmptyRowNr = null;
            let existingRowNr = null;
            for( let rowNr = 1; rowNr < numrows; rowNr++ ) {
                //get cells from act sheet row
                let seriesIdCell = sheet.getCell(rowNr, 0);
                let imageIdCell = sheet.getCell(rowNr, 1);
                let urlCell = sheet.getCell(rowNr, 2);  

                // if image should have an existing entry in sheets, find rowNr and set imageId to existingId
                if( existingImageSeriesContentRow.imageId != "0" && existingImageSeriesContentRow.seriesId != "0" ) {
                    // if act row is of the same image series and image id
                    if( String(seriesIdCell.value).localeCompare(existingImageSeriesContentRow.seriesId) == 0 &&
                        String(urlCell.value).localeCompare(existingImageSeriesContentRow.url) == 0 && 
                        String(imageIdCell.value).localeCompare(existingImageSeriesContentRow.imageId) == 0 ) {
                        if( existingRowNr != null ) {
                            console.error( "Image has more than one entry!!! rowNrs:"+existingRowNr+","+rowNr );
                        }
                        newImageId = Number(existingImageSeriesContentRow.imageId);
                        existingRowNr = rowNr;
                    }
                } else { // if image has no entry in sheets, search for next free row and calc newImageID
                    //console.log("here we go")
                    // check if act row is next empty row
                    if( !seriesIdCell.value && !imageIdCell.value && !urlCell.value && !nextEmptyRowNr) {
                        nextEmptyRowNr = rowNr;
                        break
                    } else { //if not empty row
                        // if seriesId is equal, use row to calc newImageID
                        if( String(seriesIdCell.value).localeCompare(newImageSeriesMeta.seriesId) == 0){
                            console.log( "equal series found")
                            // get image Id of act row to calc new imageId (will be used only for new images with no existing entry in googlesheets)
                            let imageIdCell = sheet.getCell(rowNr, 1);
                            if( Number(imageIdCell.value) >= newImageId ) {
                                console.log( ">= imageId found, recalc it" )
                                newImageId = Number(imageIdCell.value) + 1;
                            }
                        }
                    }
                }
                
                
            }
            console.log( "existing:"+existingRowNr );
            console.log( "nextEmpty:"+nextEmptyRowNr );
            let rowToUpdate = existingRowNr ? existingRowNr : nextEmptyRowNr;
            let seriesIdCell = sheet.getCell(rowToUpdate, 0);
            let imageIdCell = sheet.getCell(rowToUpdate, 1);
            let urlCell = sheet.getCell(rowToUpdate, 2);  

            // update the cell contents and formatting
            seriesIdCell.value = Number(newImageSeriesMeta.seriesId);
            imageIdCell.value = Number(newImageId);
            urlCell.value = existingImageSeriesContentRow.url;
            seriesIdCell.note = 'Updated via KtK-Commandbridge at '+ new Date().toLocaleString();
            await sheet.saveUpdatedCells(); // save all updates in one call
            console.log("...updated sheet!");
            // update imageSeriesContent in redux store
            existingImageSeriesContentRow.seriesId = newImageSeriesMeta.seriesId;
            existingImageSeriesContentRow.imageId = String(newImageId);
            store.dispatch( updateImageSeriesContentRow( existingImageSeriesContentRow ) );
            console.log("...updated store!");
                
            
        }
        store.dispatch(updateActivePopupType(null));
    }

    /**
     * add or update id and image url data for a row (picture) in sheet ImageSeriesContent
     * @param newImageSeriesMeta 
     * @param selectedResources 
     */
     public static async addImageSeriesContentRow( newImageSeriesContentRow:ImageSeriesContent ): Promise<any> {
        store.dispatch(updateActivePopupType(PopupWindowType.LOADER));
        console.log("try to connect to google sheets");
        const { GoogleSpreadsheet } = require('google-spreadsheet');
        const creds = require('../../GoogleSheetCredentials.json'); // the file saved above
        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet('17Mdd7GZFlaZ169M7bJqiUf5WV437MCZ25_Hw9fgfJF8');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo(); // loads document properties and worksheets
        console.log(doc.title);
        const sheet = doc.sheetsByTitle['ImageSeriesContent']; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
        const numrows = sheet.rowCount;
        console.log(sheet.title);
        console.log( numrows ); 
        await sheet.loadCells('A1:D'+numrows);
        
        //find rowNr to insert image content
        let nextEmptyRowNr = null;
        let existingRowNr = null;
        for( let rowNr = 1; rowNr < numrows; rowNr++ ) {
            //get cells from act sheet row
            let seriesIdCell = sheet.getCell(rowNr, 0);
            let imageIdCell = sheet.getCell(rowNr, 1);
            let urlCell = sheet.getCell(rowNr, 2);  

            // check if act row is next empty row
            if( !seriesIdCell.value && !imageIdCell.value && !urlCell.value && !nextEmptyRowNr) {
                nextEmptyRowNr = rowNr;
                break
            }
        }
        
        console.log( "nextEmpty:"+nextEmptyRowNr );
        let rowToUpdate = nextEmptyRowNr;
        let seriesIdCell = sheet.getCell(rowToUpdate, 0);
        let imageIdCell = sheet.getCell(rowToUpdate, 1);
        let urlCell = sheet.getCell(rowToUpdate, 2);  

        // update the cell contents and formatting
        seriesIdCell.value = Number(newImageSeriesContentRow.seriesId);
        imageIdCell.value = Number(newImageSeriesContentRow.imageId);
        urlCell.value = newImageSeriesContentRow.url;
        seriesIdCell.note = 'Updated via KtK-Commandbridge at '+ new Date().toLocaleString();
        await sheet.saveUpdatedCells(); // save all updates in one call
        console.log("...updated sheet!");
        // update imageSeriesContent in redux store
        store.dispatch(updateActivePopupType(null));
    }

    public static async LoadSymbolsContent(): Promise<any> {
        store.dispatch(updateActivePopupType(PopupWindowType.LOADER));
        console.log("try to connect to google sheets");
        const { GoogleSpreadsheet } = require('google-spreadsheet');
        const creds = require('../../GoogleSheetCredentials.json'); // the file saved above
        
        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet('17Mdd7GZFlaZ169M7bJqiUf5WV437MCZ25_Hw9fgfJF8');
        let errorOccured = false;
        try {
            await doc.useServiceAccountAuth(creds);
            await doc.loadInfo(); // loads document properties and worksheets
            console.log(doc.title);
        } catch (error) {
            console.error(error);
            // expected output: ReferenceError: nonExistentFunction is not defined
            // Note - error messages will vary depending on browser
            errorOccured = true;
        }
        
        let content = [];
        if( !errorOccured ) {
            const sheet1 = doc.sheetsByTitle['ImageSeriesContent']; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
            const numrows1 = sheet1.rowCount;
            // read cells
            console.log( "load imgUrls" )
            await sheet1.loadCells('A1:D'+sheet1.rowCount);
            let imageUrls = {};
            for (var i = 1; i < numrows1; i++) { // numrows
                let seriesId = sheet1.getCell(i, 0).value;
                let actImageId = sheet1.getCell(i, 1).value;
                let actImageUrl = sheet1.getCell(i, 2).value;     
                if( Number(seriesId) == 43 ) {
                    imageUrls[actImageId] = actImageUrl;
                }
            }

            const sheet2 = doc.sheetsByTitle['ImageSymbols']; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
            const numrows2 = sheet2.rowCount;
            console.log(sheet2.title);
            console.log( numrows2 );
            
            // read cells
            await sheet2.loadCells('A1:H'+sheet2.rowCount);

            // read/write row values
            let labelCount = 0;
            for (var i = 1; i < numrows2; i++) { // numrows
                let symbolId = sheet2.getCellByA1('A'+(i+1)).value;
                let category = sheet2.getCellByA1('B'+(i+1)).value;
                let name = sheet2.getCellByA1('C'+(i+1)).value;
                let description = sheet2.getCellByA1('E'+(i+1)).value;
                let url = imageUrls[ symbolId ];
                let fullName = sheet2.getCellByA1('H'+(i+1)).value;
                
                if( name != null ) {
                    //console.log( "act Label: "+labelName ); 
                    let actContent:SymbolsContent = {
                        id: symbolId,
                        category: category,
                        description: description,
                        name: name,
                        imgUrl: url,
                        fullname: fullName,
                    };

                    content.push(actContent);
                    labelCount += 1;
                }
            }
            console.log("in load. labelNames:"+labelCount);
            //console.log(labelNames);
            
        }
        
        store.dispatch( updateSymbolsContent(content) );
        console.log( "KtK SymbolsContent updated" );
        
        store.dispatch(updateActivePopupType(null));
    };
    
    public static async addSymbolsContentRow( symbolsContentRow:SymbolsContent ): Promise<any> {
        store.dispatch(updateActivePopupType(PopupWindowType.LOADER));
        console.log("try to connect to google sheets");
        const { GoogleSpreadsheet } = require('google-spreadsheet');
        const creds = require('../../GoogleSheetCredentials.json'); // the file saved above
        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet('17Mdd7GZFlaZ169M7bJqiUf5WV437MCZ25_Hw9fgfJF8');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo(); // loads document properties and worksheets
        console.log(doc.title);
        const sheet = doc.sheetsByTitle['ImageSymbols']; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
        const numrows = sheet.rowCount;
        console.log(sheet.title);
        console.log( numrows ); 
        await sheet.loadCells('A1:H'+numrows);
        
        //find rowNr to insert image content
        let nextEmptyRowNr = null;
        
        let newSymbolId = 1;
        for( let rowNr = 1; rowNr <= numrows; rowNr++ ) {
            //get cells from act sheet row
            let symbolIdCell = sheet.getCell(rowNr, 0);
            let categoryCell = sheet.getCell(rowNr, 1);
            let nameCell = sheet.getCell(rowNr, 2);  
            let descriptionCell = sheet.getCell(rowNr, 4);
            let fullnameCell = sheet.getCell(rowNr, 7);  

            // search for next free row and calc newImageID
            // check if act row is next empty row
            if( !symbolIdCell.value && !categoryCell.value && !nameCell.value && !descriptionCell.value && !fullnameCell.value) {
                nextEmptyRowNr = rowNr;
                break
            } else { //if not empty row, use to calc next free symbolId
                if( Number(symbolIdCell.value) >= newSymbolId ) {
                    newSymbolId = Number(symbolIdCell.value) + 1;
                }
            }
        }

        console.log( "nextEmpty:"+nextEmptyRowNr );
        console.log( "newSymbolId:"+newSymbolId );
        let rowToUpdate = nextEmptyRowNr;
        let symbolIdCell = sheet.getCell(rowToUpdate, 0);
        let categoryCell = sheet.getCell(rowToUpdate, 1);
        let nameCell = sheet.getCell(rowToUpdate, 2);  
        let imageCell = sheet.getCell(rowToUpdate, 3);  
        let descriptionCell = sheet.getCell(rowToUpdate, 4);
        let fullnameCell = sheet.getCell(rowToUpdate, 7);  

        // update the cell contents and formatting
        symbolIdCell.value = Number(newSymbolId);
        symbolIdCell.note = 'Inserted via KtK-Commandbridge at '+ new Date().toLocaleString();
        categoryCell.value = symbolsContentRow.category;
        nameCell.value = symbolsContentRow.name;
        descriptionCell.value = symbolsContentRow.description;
        fullnameCell.value = symbolsContentRow.fullname;
        imageCell.value ='=IMAGE( QUERY(IMPORTRANGE("17Mdd7GZFlaZ169M7bJqiUf5WV437MCZ25_Hw9fgfJF8", "ImageSeriesContent!A2:E10000"), "SELECT Col3 WHERE Col1=43 AND Col2="&A'+(rowToUpdate+1)+') )';
        await sheet.saveUpdatedCells(); // save all updates in one call
        console.log("...updated ImageSymbols sheet!");
        // update imageSeriesContent in redux store
        symbolsContentRow.id = String(newSymbolId);
        
        
        store.dispatch( addSymbolsContentRow( symbolsContentRow ) );
        console.log("...updated store!");
        store.dispatch(updateActivePopupType(null));        
        return newSymbolId;    
        
    }

    public static async addTechniqueContent( imageData:ImageData, newTechniqueRectLabel:LabelRect ) {
        store.dispatch(updateActivePopupType(PopupWindowType.LOADER));
        const techniqueRects: LabelRect[] = [];
        for( let actRectLabel of imageData.labelRects ) {
            if( actRectLabel.id != newTechniqueRectLabel.id 
              && RectUtil.isRectInside( newTechniqueRectLabel.rect, actRectLabel.rect)  ) {
                // use actRect for technique definition
                techniqueRects.push( actRectLabel );
            }
        }

        switch( newTechniqueRectLabel.symbol.category ) {
            case SymbolCategory.HAND_TECHNIQUE:
                this.addHandTechniqueContentFromRects( newTechniqueRectLabel, imageData );
                break;
            case SymbolCategory.FOOT_TECHNIQUE:
                this.addFootTechniqueContentFromRects( newTechniqueRectLabel, imageData );
                break;
            case SymbolCategory.KUNGFU_TECHNIQUE:
                
                break;
        }
        store.dispatch(updateActivePopupType(null));
    }

    private static async addHandTechniqueContentFromRects(techniqueRect:LabelRect, imageData: ImageData ) {
        console.log("try to connect to google sheets");
        const { GoogleSpreadsheet } = require('google-spreadsheet');
        const creds = require('../../GoogleSheetCredentials.json'); // the file saved above
        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet('17Mdd7GZFlaZ169M7bJqiUf5WV437MCZ25_Hw9fgfJF8');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo(); // loads document properties and worksheets
        console.log(doc.title);
        const sheet = doc.sheetsByTitle['HandTechniques']; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
        const numrows = sheet.rowCount;
        console.log(sheet.title);
        console.log( numrows ); 
        await sheet.loadCells('A1:L'+numrows);
        
        //find rowNr to insert content
        let rowToUpdate = null;
        
        for( let rowNr = 1; rowNr <= numrows; rowNr++ ) {
            //get cells from act sheet row
            let symbolIdCell = sheet.getCell(rowNr, 0);
            
            // check if act row is the technique we are searching for
            if( !symbolIdCell.value ) {
                break;
            } else { //if not empty row, check id
                if( Number(symbolIdCell.value) == Number(techniqueRect.symbol.id) ) {
                    rowToUpdate = rowNr;
                    break;
                }
            }
        }

        if( !rowToUpdate ) {
            console.log ("unable to fill handTechnique content, no technique with with id: '"+techniqueRect.symbol.id+"' found"); 
            return;
        }       

        let techniqueOrientationCell = sheet.getCell(rowToUpdate, 4);
        let leftHandPostureCell = sheet.getCell(rowToUpdate, 5);  
        let leftArmPostureCell = sheet.getCell(rowToUpdate, 6);  
        let rightHandPostureCell = sheet.getCell(rowToUpdate, 8);
        let rightArmPostureCell = sheet.getCell(rowToUpdate, 9);
        let bodyPostureCell = sheet.getCell(rowToUpdate, 11);  

        // get orientation from rect side
        let orientation = '';
        switch (techniqueRect.side) {
            case Side.LEFT:
                orientation = TechniqueOrientation.LEFT_ARM_FRONT;
                break;
            case Side.RIGHT:
                orientation = TechniqueOrientation.RIGHT_ARM_FRONT;
                break;
            case Side.NONE:
                orientation = TechniqueOrientation.BOTH_ARMS_EQUAL;
                break;
        }

        // update the cell posture contents
        techniqueOrientationCell.value = orientation;
        leftHandPostureCell.value = imageData.ktk_imageSeriesContent.posture.leftHand.name;
        rightHandPostureCell.value = imageData.ktk_imageSeriesContent.posture.rightHand.name;
        leftArmPostureCell.value = imageData.ktk_imageSeriesContent.posture.leftArm.name;
        rightArmPostureCell.value = imageData.ktk_imageSeriesContent.posture.rightArm.name;
        bodyPostureCell.value = imageData.ktk_imageSeriesContent.posture.body.name;

        await sheet.saveUpdatedCells(); // save all updates in one call
        console.log("...updated HandTechniques sheet!");
                
    }

    private static async addFootTechniqueContentFromRects(techniqueRect:LabelRect, imageData: ImageData ) {
        console.log("try to connect to google sheets");
        const { GoogleSpreadsheet } = require('google-spreadsheet');
        const creds = require('../../GoogleSheetCredentials.json'); // the file saved above
        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet('17Mdd7GZFlaZ169M7bJqiUf5WV437MCZ25_Hw9fgfJF8');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo(); // loads document properties and worksheets
        console.log(doc.title);
        const sheet = doc.sheetsByTitle['FootTechniques']; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
        const numrows = sheet.rowCount;
        console.log(sheet.title);
        console.log( numrows ); 
        await sheet.loadCells('A1:K'+numrows);
        
        //find rowNr to insert content
        let rowToUpdate = null;
        
        for( let rowNr = 1; rowNr <= numrows; rowNr++ ) {
            //get cells from act sheet row
            let symbolIdCell = sheet.getCell(rowNr, 0);
            
            // check if act row is the technique we are searching for
            if( !symbolIdCell.value ) {
                break;
            } else { //if not empty row, check id
                if( Number(symbolIdCell.value) == Number(techniqueRect.symbol.id) ) {
                    rowToUpdate = rowNr;
                    break;
                }
            }
        }

        if( !rowToUpdate ) {
            console.log ("unable to fill footTechnique content, no technique with with id: '"+techniqueRect.symbol.id+"' found"); 
            return;
        }       

        let techniqueOrientationCell = sheet.getCell(rowToUpdate, 5);
        let leftFootPostureCell = sheet.getCell(rowToUpdate, 6);  
        let leftLegPostureCell = sheet.getCell(rowToUpdate, 7);  
        let rightFootPostureCell = sheet.getCell(rowToUpdate, 9);
        let rightLegPostureCell = sheet.getCell(rowToUpdate, 10);
        
        // get orientation from rect side
        let orientation = '';
        switch (techniqueRect.side) {
            case Side.LEFT:
                orientation = TechniqueOrientation.LEFT_FOOT_FRONT;
                break;
            case Side.RIGHT:
                orientation = TechniqueOrientation.RIGHT_FOOT_FRONT;
                break;
            case Side.NONE:
                orientation = TechniqueOrientation.BOTH_FOOT_EQUAL;
                break;
        }

        // update the cell posture contents
        techniqueOrientationCell.value = orientation;
        leftFootPostureCell.value = imageData.ktk_imageSeriesContent.posture.leftFoot.name;
        rightFootPostureCell.value = imageData.ktk_imageSeriesContent.posture.rightFoot.name;
        leftLegPostureCell.value = imageData.ktk_imageSeriesContent.posture.leftLeg.name;
        rightLegPostureCell.value = imageData.ktk_imageSeriesContent.posture.rightLeg.name;

        await sheet.saveUpdatedCells(); // save all updates in one call
        console.log("...updated FootTechniques sheet!");
        
    }

    private static async addKungfuTechniqueFromRects(techniqueRect:LabelRect, imageData: ImageData  ) {
        console.log("try to connect to google sheets");
        const { GoogleSpreadsheet } = require('google-spreadsheet');
        const creds = require('../../GoogleSheetCredentials.json'); // the file saved above
        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet('17Mdd7GZFlaZ169M7bJqiUf5WV437MCZ25_Hw9fgfJF8');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo(); // loads document properties and worksheets
        console.log(doc.title);
        const sheet = doc.sheetsByTitle['KungfuTechniques']; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
        const numrows = sheet.rowCount;
        console.log(sheet.title);
        console.log( numrows ); 
        await sheet.loadCells('A1:P'+numrows);
        
        //find rowNr to insert content
        let rowToUpdate = null;
        
        for( let rowNr = 1; rowNr <= numrows; rowNr++ ) {
            //get cells from act sheet row
            let symbolIdCell = sheet.getCell(rowNr, 0);
            
            // check if act row is the technique we are searching for
            if( !symbolIdCell.value ) {
                break;
            } else { //if not empty row, check id
                if( Number(symbolIdCell.value) == Number(techniqueRect.symbol.id) ) {
                    rowToUpdate = rowNr;
                    break;
                }
            }
        }

        if( !rowToUpdate ) {
            console.log ("unable to fill kungfuTechnique content, no technique with with id: '"+techniqueRect.symbol.id+"' found"); 
            return;
        }       

        let techniqueOrientationCell = sheet.getCell(rowToUpdate, 5);
        let leftFootPostureCell = sheet.getCell(rowToUpdate, 6);  
        let leftLegPostureCell = sheet.getCell(rowToUpdate, 7);  
        let rightFootPostureCell = sheet.getCell(rowToUpdate, 9);
        let rightLegPostureCell = sheet.getCell(rowToUpdate, 10);
        
        // get orientation from rect side
        let orientation = '';
        switch (techniqueRect.side) {
            case Side.LEFT:
                orientation = TechniqueOrientation.LEFT_FOOT_FRONT;
                break;
            case Side.RIGHT:
                orientation = TechniqueOrientation.RIGHT_FOOT_FRONT;
                break;
            case Side.NONE:
                orientation = TechniqueOrientation.BOTH_FOOT_EQUAL;
                break;
        }

        // update the cell posture contents
        techniqueOrientationCell.value = orientation;
        leftFootPostureCell.value = imageData.ktk_imageSeriesContent.posture.leftFoot.name;
        rightFootPostureCell.value = imageData.ktk_imageSeriesContent.posture.rightFoot.name;
        leftLegPostureCell.value = imageData.ktk_imageSeriesContent.posture.leftLeg.name;
        rightLegPostureCell.value = imageData.ktk_imageSeriesContent.posture.rightLeg.name;

        await sheet.saveUpdatedCells(); // save all updates in one call
        console.log("...updated FootTechniques sheet!");
    }
}