import React from "react";
import './ImagesDropZone.scss';
import {useDropzone,DropzoneOptions} from "react-dropzone";
import {TextButton} from "../../Common/TextButton/TextButton";
import {ImageData} from "../../../store/labels/types";
import {connect} from "react-redux";
import {addImageData, updateActiveImageIndex} from "../../../store/labels/actionCreators";
import {AppState} from "../../../store";
import {ProjectType} from "../../../data/enums/ProjectType";
import {PopupWindowType} from "../../../data/enums/PopupWindowType";
import {updateActivePopupType, updateProjectData} from "../../../store/general/actionCreators";
import {AcceptedFileType} from "../../../data/enums/AcceptedFileType";
import {ProjectData} from "../../../store/general/types";
import {ImageDataUtil} from "../../../utils/ImageDataUtil";
import { sizeHeight } from "@material-ui/system";

interface IProps {
    updateActiveImageIndex: (activeImageIndex: number) => any;
    addImageData: (imageData: ImageData[]) => any;
    updateProjectData: (projectData: ProjectData) => any;
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    projectData: ProjectData;
}

const ImagesDropZone: React.FC<IProps> = ({updateActiveImageIndex, addImageData, updateProjectData, updateActivePopupType, projectData}) => {
    const {acceptedFiles, getRootProps, getInputProps} = useDropzone({
        accept: AcceptedFileType.IMAGE
    } as DropzoneOptions);

    const startEditor = (projectType: ProjectType) => {
       
            updateProjectData({
                ...projectData,
                type: projectType
            });
        if (acceptedFiles.length > 0) {
            updateActiveImageIndex(0);
            addImageData(acceptedFiles.map((fileData:File) => ImageDataUtil.createImageDataFromFileData(fileData)));
            updateActivePopupType(PopupWindowType.INSERT_LABEL_NAMES);
            while( acceptedFiles.length > 0) {
                acceptedFiles.pop();
            }
       }
    };

    const loadDefaultImages = async () => {
        
        const response = await fetch('/images/test2.jpg');
        const body = await response.blob();
        
        var b: any = body;
        //A Blob() is almost a File() - it's just missing the two properties below which we will add
        b.lastModifiedDate = new Date();
        b.name = "test.jpg";
        //Cast to a File() type
        acceptedFiles.push(b);
        console.log(b);
    };

    const loadImagesFromGoogleSheets = async () => {
        console.log("try to connect to google sheets");
        const { GoogleSpreadsheet } = require('google-spreadsheet');

        const creds = require('../../../GoogleSheetCredentials.json'); // the file saved above
        
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
        let images = [];
        for (var i = 1; i < 2; i++) { // numrows
            let imageId = sheet.getCell(0, i).value+'_'+sheet.getCell(1, i).value;
            let imageUrl = sheet.getCell(i, 3);     
            console.log( "download image: "+imageUrl ); 
            console.log(imageUrl);
            
            //let blob = await fetch(imageUrl).then(r => r.blob());
            let blob = await fetch(imageUrl
                , { // Your POST endpoint
                    method: 'POST',
                    headers: {
                    // Content-Type may need to be completely **omitted**
                    // or you may need something
                    "Content-Type": "You will perhaps need to define a content-type here"
                    }
                }).then(
                    response => response.blob() // if the response is a JSON object
                ).then(
                    success => console.log(success) // Handle the success response object
                ).catch(
                    error => console.log(error) // Handle the error response object
            );
            

            var b: any = blob;
            //A Blob() is almost a File() - it's just missing the two properties below which we will add
            b.lastModifiedDate = new Date();
            b.name = imageId;
            //Cast to a File() type
            acceptedFiles.push(b);
        }
        
    
        //addImageData(images.map((fileData:File) => ImageDataUtil.createImageDataFromFileData(fileData)));
  
    };

    const getDropZoneContent = () => {
        if (acceptedFiles.length === 0)
            return <>
                <input {...getInputProps()} />
                <img
                    draggable={false}
                    alt={"upload"}
                    src={"ico/box-opened.png"}
                />
                <p className="extraBold">Drop images</p>
                <p>or</p>
                <p className="extraBold">Click here to select them</p>
            </>;
        else if (acceptedFiles.length === 1)
            return <>
                <img
                    draggable={false}
                    alt={"uploaded"}
                    src={"ico/box-closed.png"}
                />
                <p className="extraBold">1 image loaded</p>
            </>;
        else
            return <>
                <input {...getInputProps()} />
                <img
                    draggable={false}
                    key={1}
                    alt={"uploaded"}
                    src={"ico/box-closed.png"}
                />
                <p key={2} className="extraBold">{acceptedFiles.length} images loaded</p>
            </>;
    };

    return(
        <div className="ImagesDropZone">
            <div {...getRootProps({className: 'DropZone'})}>
                {getDropZoneContent()}
            </div>
            <div className="DropZoneButtons">
                <TextButton
                    label={"Object Detection"}
                    isDisabled={false}
                    onClick={() => startEditor(ProjectType.OBJECT_DETECTION)}
                />
                <TextButton
                    label={"Image recognition"}
                    isDisabled={false}
                    onClick={() => startEditor(ProjectType.IMAGE_RECOGNITION)}
                />
            </div>
        </div>
    )
};

const mapDispatchToProps = {
    updateActiveImageIndex,
    addImageData,
    updateProjectData,
    updateActivePopupType
};

const mapStateToProps = (state: AppState) => ({
    projectData: state.general.projectData
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ImagesDropZone);