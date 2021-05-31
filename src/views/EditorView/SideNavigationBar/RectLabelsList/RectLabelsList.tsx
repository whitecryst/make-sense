import React from 'react';
import {ISize} from "../../../../interfaces/ISize";
import Scrollbars from 'react-custom-scrollbars';
import {ImageData, LabelName, LabelRect, Side} from "../../../../store/labels/types";
import './RectLabelsList.scss';
import {
    updateActiveLabelId,
    updateActiveLabelNameId,
    updateImageDataById,
    updateLabelNames
} from "../../../../store/labels/actionCreators";
import {AppState} from "../../../../store";
import {connect} from "react-redux";
import LabelInputField from "../LabelInputField/LabelInputField";
import EmptyLabelList from "../EmptyLabelList/EmptyLabelList";
import {LabelActions} from "../../../../logic/actions/LabelActions";
import {LabelStatus} from "../../../../data/enums/LabelStatus";
import {findLast} from "lodash";
import { KtkActions } from '../../../../logic/actions/KtkActions';
import { SymbolsContent } from '../../../../store/ktk/types';
import {RectUtil} from '../../../../utils/RectUtil';
import StateBar from '../../StateBar/StateBar';
import {LabelsSelector} from "../../../../store/selectors/LabelsSelector";

interface IProps {
    size: ISize;
    imageData: ImageData;
    updateImageDataById: (id: string, newImageData: ImageData) => any;
    activeLabelId: string;
    highlightedLabelId: string;
    updateActiveLabelNameId: (activeLabelId: string) => any;
    labelNames: LabelName[];
    updateActiveLabelId: (activeLabelId: string) => any;
    renderEditorTitle: () => any; 
}

const RectLabelsList: React.FC<IProps> = ({size, imageData, updateImageDataById, labelNames, updateActiveLabelNameId, activeLabelId, highlightedLabelId, updateActiveLabelId, renderEditorTitle}) => {
    const labelInputFieldHeight = 40;
    const listStyle: React.CSSProperties = {
        width: size.width,
        height: size.height
    };
    const listStyleContent: React.CSSProperties = {
        width: size.width,
        height: imageData ? imageData.labelRects.length * labelInputFieldHeight : size.height
    };

    const deleteRectLabelById = (labelRectId: string) => {
        console.log("onDelete: "+labelRectId);
        LabelActions.deleteRectLabelById(imageData.id, labelRectId);
        updateKtkData( LabelsSelector.getImageDataById(imageData.id) );
    };

    const updateRectLabel = (labelRectId: string, labelNameId: string, symbol: SymbolsContent) => {

        const newImageData = {
            ...imageData,
            labelRects: imageData.labelRects
                .map((labelRect: LabelRect) => {
                if (labelRect.id === labelRectId) {
                    let side = Side.NONE;
                    if( symbol.category.includes("Foot posture") ||
                        symbol.category.includes("Leg posture") || 
                        symbol.category.includes("Hand posture") ||
                        symbol.category.includes("Arm posture") ) {
                            side = KtkActions.getRectLabelSideFromPoints( labelRect, imageData.labelPoints );
                        }
                    return {
                        ...labelRect,
                        labelId: labelNameId,
                        status: LabelStatus.ACCEPTED,
                        symbol: symbol,
                        side: side
                    }
                } else {
                    return labelRect
                }
            })
        };
        updateImageDataById(imageData.id, newImageData);
        updateActiveLabelNameId(labelNameId);
        updateKtkData( newImageData);

    };

    const updateKtkData = (newImageData: ImageData ) => {
        // upload data to google sheets
        //if(labelRectId && labelNameId && symbol != null) {
            KtkActions.udateImageAnnotation( newImageData ).then( () => {
                KtkActions.fetchImageSeriesContentRow( newImageData.ktk_imageSeriesContent ).then( () => { 
                    updateImageDataById(imageData.id, newImageData);
                    renderEditorTitle();
                });
            }); // reload imageSeriesContent to get the new identifies techniques
        //}
    } 

    const setRectSide = (labelRectId: string, side:Side) => {
         const newImageData = {
            ...imageData,
            labelRects: imageData.labelRects
                .map((labelRect: LabelRect) => {
                    if (labelRect.id === labelRectId) {
                        return {
                            ...labelRect,
                            side: side
                        }
                    } else { return labelRect }
                })
         }
         updateImageDataById(imageData.id, newImageData);
         updateKtkData(newImageData);
      }

    const onClickHandler = () => {
        updateActiveLabelId(null);
    };

    const getChildren = () => {
        return imageData.labelRects
            .filter((labelRect: LabelRect) => labelRect.status === LabelStatus.ACCEPTED)
            .map((labelRect: LabelRect) => {
            return <LabelInputField
                size={{
                    width: size.width,
                    height: labelInputFieldHeight
                }}
                isActive={labelRect.id === activeLabelId}
                isHighlighted={labelRect.id === highlightedLabelId}
                id={labelRect.id}
                key={labelRect.id}
                onDelete={deleteRectLabelById}
                value={labelRect.labelId !== null ? findLast(labelNames, {id: labelRect.labelId}) : null}
                options={labelNames}
                onSelectLabel={updateRectLabel}
                imageData={imageData}
                setRectSide={setRectSide}
            />
        }) 
    };

    
 

    return (
        <div
            className="RectLabelsList"
            style={listStyle}
            onClickCapture={onClickHandler}
        > 
            {imageData ? imageData.labelRects.filter((labelRect: LabelRect) => labelRect.status === LabelStatus.ACCEPTED).length === 0 ?
                <EmptyLabelList
                    labelBefore={"draw your first bounding box"}
                    labelAfter={"no labels created for this image yet"}
                /> :
                <Scrollbars>
                    <div
                        className="RectLabelsListContent"
                        style={listStyleContent}
                    >
                        {getChildren()}
                    </div>
                </Scrollbars>
                :
                <EmptyLabelList
                    labelBefore={"no image loaded"}
                    labelAfter={"no labels created "}
                /> 
            }
        </div>
    );
};

const mapDispatchToProps = {
    updateImageDataById,
    updateActiveLabelNameId,
    updateActiveLabelId,
    updateLabelNames
};

const mapStateToProps = (state: AppState) => ({
    activeLabelId: state.labels.activeLabelId,
    highlightedLabelId: state.labels.highlightedLabelId,
    labelNames : state.labels.labels
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RectLabelsList);