import React, { useState } from 'react'
import './InsertLabelNamesPopup.scss'
import { GenericYesNoPopup } from "../GenericYesNoPopup/GenericYesNoPopup";
import { PopupWindowType } from "../../../data/enums/PopupWindowType";
import { updateLabelNames } from "../../../store/labels/actionCreators";
import { updateActivePopupType } from "../../../store/general/actionCreators";
import { AppState } from "../../../store";
import { connect } from "react-redux";
import Scrollbars from 'react-custom-scrollbars';
import TextInput from "../../Common/TextInput/TextInput";
import { ImageButton } from "../../Common/ImageButton/ImageButton";
import { v4 as uuidv4 } from 'uuid';
import { LabelName } from "../../../store/labels/types";
import { LabelUtil } from "../../../utils/LabelUtil";
import { LabelsSelector } from "../../../store/selectors/LabelsSelector";
import { KtkSelector } from "../../../store/selectors/KtkSelector";
import { LabelActions } from "../../../logic/actions/LabelActions";
import { ProjectType } from "../../../data/enums/ProjectType";

interface IProps {
    projectType: ProjectType;
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    updateLabelNames: (labels: LabelName[]) => any;
    isUpdate: boolean;
}

const InsertLabelNamesPopup: React.FC<IProps> = (
    {
        projectType,
        updateActivePopupType,
        updateLabelNames,
        isUpdate
    }) => {


    const useForceUpdate = () => {
        const [value, setValue] = useState(0); // integer state
        return () => setValue(value => value + 1); // update the state to force render
    }

    const LoadSymbolLabelsFromGoogleSheets = async (labelNames : LabelName[]) => {
        console.log("try to connect to google sheets");
        const { GoogleSpreadsheet } = require('google-spreadsheet');
        const creds = require('../../../GoogleSheetCredentials.json'); // the file saved above
        
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
        
        if( !errorOccured ) {
            const sheet = doc.sheetsByTitle['ImageSymbols']; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
            const numrows = sheet.rowCount;
            console.log(sheet.title);
            console.log( numrows );
            
            // read cells
            await sheet.loadCells('H1:H'+sheet.rowCount);

            // read/write row values
            let labelCount = 0;
            for (var i = 1; i < numrows; i++) { // numrows
                let labelName = sheet.getCellByA1('H'+(i+1)).value;
                
                if( labelName != null ) {
                    //console.log( "act Label: "+labelName ); 
                    labelNames = { ...labelNames, [uuidv4()]: labelName };
                    labelCount += 1;
                }
            }
            console.log("in load. labelNames:"+labelCount);
            //console.log(labelNames);
            
        }
        updateLabelNames( LabelUtil.convertMapToLabelNamesList(labelNames).sort());
        return labelNames;
        
    };

    let initialLabels = LabelUtil.convertLabelNamesListToMap(LabelsSelector.getLabelNames());

    initialLabels = LabelUtil.convertLabelNamesListToMap( KtkSelector.getSymbolsContentAsLabelNames() );
    console.log("after load...");
    console.log(initialLabels);
    
    
    const [labelNames, setLabelNames] = useState(initialLabels);
    //setLabelNames(initialLabels);
    
    const addHandle = () => {
        const newLabelNames = { ...labelNames, [uuidv4()]: "" };
        setLabelNames(newLabelNames);
    };

    const deleteHandle = (key: string) => {
        const newLabelNames = { ...labelNames };
        delete newLabelNames[key];
        setLabelNames(newLabelNames);
    };

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            addHandle();
        }
    }

    const labelInputs = Object.keys(labelNames).map((key: string) => {
        return <div className="LabelEntry" key={key}>
            <TextInput
                key={key}
                value={labelNames[key]}
                isPassword={false}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(key, event.target.value)}
                label={"Insert label"}
                onKeyUp={(event: React.KeyboardEvent<HTMLInputElement>) => handleKeyUp(event)}
            />
            <ImageButton
                image={"ico/trash.png"}
                imageAlt={"remove_label"}
                buttonSize={{ width: 30, height: 30 }}
                onClick={() => deleteHandle(key)}
            />
        </div>
    });

    const onChange = (key: string, value: string) => {
        const newLabelNames = { ...labelNames, [key]: value };
        setLabelNames(newLabelNames);
    };

    const onCreateAccept = () => {
        const labelNamesList: string[] = extractLabelNamesList();
        
        if (labelNamesList.length > 0) {
            updateLabelNames(LabelUtil.convertMapToLabelNamesList(labelNames));
        }
        updateActivePopupType(null);
    };

    const onUpdateAccept = () => {
        const labelNamesList: string[] = extractLabelNamesList();
        const updatedLabelNamesList: LabelName[] = LabelUtil.convertMapToLabelNamesList(labelNames);
        const missingIds: string[] = LabelUtil.labelNamesIdsDiff(LabelsSelector.getLabelNames(), updatedLabelNamesList);
        LabelActions.removeLabelNames(missingIds);
        if (labelNamesList.length > 0) {
            updateLabelNames(LabelUtil.convertMapToLabelNamesList(labelNames));
            updateActivePopupType(null);
        }
    };

    const onCreateReject = () => {
        updateActivePopupType(PopupWindowType.LOAD_LABEL_NAMES);
    };

    const onUpdateReject = () => {
        updateActivePopupType(null);
    };


    const extractLabelNamesList = (): string[] => {
        return Object.values(labelNames).filter((value => !!value)) as string[];
    };

    const renderContent = () => {
        return (<div className="InsertLabelNamesPopup">
            <div className="LeftContainer">
                <ImageButton
                    image={"ico/plus.png"}
                    imageAlt={"plus"}
                    buttonSize={{ width: 40, height: 40 }}
                    padding={25}
                    onClick={addHandle}
                />
            </div>
            <div className="RightContainer">
                <div className="Message">
                    {
                        isUpdate ?
                            "You can now edit the label names you use to describe the objects in the photos. Use the + " +
                            "button to add a new empty text field." :
                            "Before you start, you can create a list of labels you plan to assign to objects in your " +
                            "project. You can also choose to skip that part for now and define label names as you go."
                    }
                </div>
                <div className="LabelsContainer">
                    {Object.keys(labelNames).length !== 0 ? <Scrollbars>
                        <div className="InsertLabelNamesPopupContent">
                            {labelInputs}
                        </div>
                    </Scrollbars> :
                        <div
                            className="EmptyList"
                            onClick={addHandle}
                        >
                            <img
                                draggable={false}
                                alt={"upload"}
                                src={"ico/type-writer.png"}
                            />
                            <p className="extraBold">Your label list is empty</p>
                        </div>}
                </div>
            </div>
        </div>);
    };

    return (
        <GenericYesNoPopup
            title={isUpdate ? "Load labels" : "Create labels"}
            renderContent={renderContent}
            acceptLabel={isUpdate ? "Accept" : "Start project"}
            onAccept={isUpdate ? onUpdateAccept : onCreateAccept}
            rejectLabel={isUpdate ? "Cancel" : "Load labels from file"}
            onReject={isUpdate ? onUpdateReject : onCreateReject}
        />)
};

const mapDispatchToProps = {
    updateActivePopupType,
    updateLabelNames
};

const mapStateToProps = (state: AppState) => ({
    projectType: state.general.projectData.type
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(InsertLabelNamesPopup);
