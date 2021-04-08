//import {LabelsSelector} from "../../store/selectors/LabelsSelector";
import {store} from "../../index";
import {updateImageSeriesMeta, updateImageSeriesContent, updateImageSeriesContentRow, updateSymbolsContent} from "../../store/ktk/actionCreators";
import {ViewPortActions} from "./ViewPortActions";
import {EditorModel} from "../../staticModels/EditorModel";
import { ImageSeriesMeta, ImageSeriesContent, SymbolsContent } from "../../store/ktk/types";
import { KtkSelector } from "../../store/selectors/KtkSelector";
import { COCOAnnotationsLoadingError } from "../import/coco/COCOErrors";

export class KtkActions {

    

    public static async loadImageSeriesMeta(): Promise<any> {
        
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
            
          
    }

    public static async loadImageSeriesContent(): Promise<any> {
        
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
        await sheet.loadCells('A1:D'+sheet.rowCount);
        
        // read/write row values
        
        let content = [];
        for (var i = 1; i < numrows; i++) { // numrows
            let seriesId = sheet.getCell(i, 0).value;
            let actImageId = sheet.getCell(i, 1).value;
            let actImageUrl = sheet.getCell(i, 2).value;     
            let actContent:ImageSeriesContent = {
                seriesId: seriesId,
                imageId: actImageId,
                url: actImageUrl
            }; 
            //console.log( "download image: "+imageUrl ); 
            //console.log(actImageUrl);
            //resource.ktk_id = actImageId;
            content.push(actContent);
        }
        //console.log("content:");
        //console.log(content);
        store.dispatch( updateImageSeriesContent(content) );
        console.log( "KtK ImageSeriesContent updated" );
            
          
    }

    public static async upsertImageSeriesContentRow( newImageSeriesMeta:ImageSeriesMeta, selectedResources ): Promise<any> {
        
        console.log("try to connect to google sheets");
        const { GoogleSpreadsheet } = require('google-spreadsheet');
        const creds = require('../../GoogleSheetCredentials.json'); // the file saved above
        // Initialize the sheet - doc ID is the long id in the sheets URL
        const doc = new GoogleSpreadsheet('17Mdd7GZFlaZ169M7bJqiUf5WV437MCZ25_Hw9fgfJF8');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo(); // loads document properties and worksheets
        console.log(doc.title);
        const sheet = doc.sheetsByTitle['ImageSeriesContentTest']; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
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
                    console.log("here we go")
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
            seriesIdCell.value = newImageSeriesMeta.seriesId;
            imageIdCell.value = newImageId;
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
    }

    public static async LoadSymbolsContent(): Promise<any> {
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
                        symbolId: symbolId,
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
        
        
    };
    
}