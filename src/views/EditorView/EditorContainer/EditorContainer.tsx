import React, {useState} from 'react';
import {connect} from "react-redux";
import {Direction} from "../../../data/enums/Direction";
import {ISize} from "../../../interfaces/ISize";
import {Settings} from "../../../settings/Settings";
import {AppState} from "../../../store";
import {ImageData} from "../../../store/labels/types";
import ImagesList from "../SideNavigationBar/ImagesList/ImagesList";
import LabelsToolkit from "../SideNavigationBar/LabelsToolkit/LabelsToolkit";
import {SideNavigationBar} from "../SideNavigationBar/SideNavigationBar";
import {VerticalEditorButton} from "../VerticalEditorButton/VerticalEditorButton";
import './EditorContainer.scss';
import Editor from "../Editor/Editor";
import {ContextManager} from "../../../logic/context/ContextManager";
import {ContextType} from "../../../data/enums/ContextType";
import EditorBottomNavigationBar from "../EditorBottomNavigationBar/EditorBottomNavigationBar";
import EditorTopNavigationBar from "../EditorTopNavigationBar/EditorTopNavigationBar";
import {ProjectType} from "../../../data/enums/ProjectType";
//---- for filemanager
//import ReactDOM from 'react-dom';
//import { FileManager, FileNavigator } from '@opuscapita/react-filemanager';
import { FileManager, FileNavigator } from "../../../filemanager";
//import connectorNodeV1 from '@opuscapita/react-filemanager-connector-node-v1';
import connectorNodeV1 from "../../../filemanager/server-connector";
// filemanager end

interface IProps {
    windowSize: ISize;
    activeImageIndex: number;
    imagesData: ImageData[];
    activeContext: ContextType;
    projectType: ProjectType;
}

const EditorContainer: React.FC<IProps> = (
    {
        windowSize,
        activeImageIndex,
        imagesData,
        activeContext,
        projectType
    }) => {
    const [leftTabStatusImages, setLeftTabStatusImages] = useState(true);
    const [leftTabStatusFolders, setLeftTabStatusFolders] = useState(false);
    const [rightTabStatus, setRightTabStatus] = useState(true);
    const [updateNow, setUpdateNow] = useState(true);

    const calculateEditorSize = (): ISize => {
        if (windowSize) {
            const leftTabWidthImages = leftTabStatusImages ? Settings.SIDE_NAVIGATION_BAR_WIDTH_OPEN_PX : Settings.SIDE_NAVIGATION_BAR_WIDTH_CLOSED_PX;
            const leftTabWidthFolders = leftTabStatusFolders ? Settings.SIDE_NAVIGATION_BAR_FOLDERS_WIDTH_OPEN_PX : Settings.SIDE_NAVIGATION_BAR_WIDTH_CLOSED_PX;
            const rightTabWidth = rightTabStatus ? Settings.SIDE_NAVIGATION_BAR_WIDTH_OPEN_PX : Settings.SIDE_NAVIGATION_BAR_WIDTH_CLOSED_PX;
            return {
                width: windowSize.width - leftTabWidthImages - leftTabWidthFolders - rightTabWidth,
                height: windowSize.height - Settings.TOP_NAVIGATION_BAR_HEIGHT_PX
                    - Settings.EDITOR_BOTTOM_NAVIGATION_BAR_HEIGHT_PX - Settings.EDITOR_TOP_NAVIGATION_BAR_HEIGHT_PX,
            }
        }
        else
            return null;
    };

    const leftSideBarImageButtonOnClick = () => {
        if (!leftTabStatusImages)
            ContextManager.switchCtx(ContextType.LEFT_NAVBAR_IMAGES);
        else if (leftTabStatusImages && activeContext === ContextType.LEFT_NAVBAR_IMAGES)
            ContextManager.restoreCtx();

        setLeftTabStatusImages(!leftTabStatusImages);
    };

    const leftSideBarFoldersButtonOnClick = () => {
        if (!leftTabStatusFolders)
            ContextManager.switchCtx(ContextType.LEFT_NAVBAR_FOLDERS);
        else if (leftTabStatusFolders && activeContext === ContextType.LEFT_NAVBAR_FOLDERS)
            ContextManager.restoreCtx();

        setLeftTabStatusFolders(!leftTabStatusFolders);
    };

    const leftSideBarCompanionRender = () => {
        return <>
           <VerticalEditorButton
                label="Folders"
                image={"ico/files.png"}
                imageAlt={"folders"}
                onClick={leftSideBarFoldersButtonOnClick}
                isActive={leftTabStatusFolders}
            />
            <VerticalEditorButton
                label="Images"
                image={"ico/camera.png"}
                imageAlt={"images"}
                onClick={leftSideBarImageButtonOnClick}
                isActive={leftTabStatusImages}
            />
            
        </>
    };

    const leftSideBarRenderImages = () => {
        return <ImagesList/>
    };

    const leftSideBarRenderFolders = () => {
        const apiOptions = {
          ...connectorNodeV1.apiOptions,
          apiRoot: `https://kungfu-wiki.com:3001` // Or you local Server Node V1 installation.
        }
        
        const fileManager = (
         <div style={{ height: '100%', width: '400px', background: '#171717' }}>
            <FileManager>
              <FileNavigator
                id="filemanager-1"
                api={connectorNodeV1.api}
                apiOptions={apiOptions}
                capabilities={connectorNodeV1.capabilities}
                listViewLayout={connectorNodeV1.listViewLayout}
                viewLayoutOptions={connectorNodeV1.viewLayoutOptions}
              />
            </FileManager>
          </div>
        );
        return fileManager;
    };

    const rightSideBarButtonOnClick = () => {
        if (!rightTabStatus)
            ContextManager.switchCtx(ContextType.RIGHT_NAVBAR);
        else if (rightTabStatus && activeContext === ContextType.RIGHT_NAVBAR)
            ContextManager.restoreCtx();

        setRightTabStatus(!rightTabStatus);
    };

    const rightSideBarCompanionRender = () => {
        return <>
            <VerticalEditorButton
                label="Labels"
                image={"ico/tags.png"}
                imageAlt={"labels"}
                onClick={rightSideBarButtonOnClick}
                isActive={rightTabStatus}
            />
        </>
    };

    const rightSideBarRender = () => {
        return <LabelsToolkit 
            renderEditorTitle={useForceUpdate}
        />
    };

    function useForceUpdate(){
        setUpdateNow(!updateNow);
    }

    



    return (
        <div className="EditorContainer">
            <SideNavigationBar
                direction={Direction.LEFT}
                isOpen={leftTabStatusFolders}
                isWithContext={activeContext === ContextType.LEFT_NAVBAR_FOLDERS}
                renderCompanion={leftSideBarCompanionRender}
                renderContent={leftSideBarRenderFolders}
                key="left-side-navigation-bar-folders"
            />
            <SideNavigationBar
                direction={Direction.LEFT}
                isOpen={leftTabStatusImages}
                isWithContext={activeContext === ContextType.LEFT_NAVBAR_IMAGES}
                //renderCompanion={leftSideBarCompanionRender}
                renderContent={leftSideBarRenderImages}
                key="left-side-navigation-bar-images"
                
            />

            <div className="EditorWrapper"
                onMouseDown={() => ContextManager.switchCtx(ContextType.EDITOR)}
                 key="editor-wrapper"
            >
                {projectType === ProjectType.OBJECT_DETECTION && <EditorTopNavigationBar
                    key="editor-top-navigation-bar"
                />}
                <div style={{color:'white', fontSize:'small', fontWeight:'normal', textAlign:'left'}}>
                    {imagesData[activeImageIndex] && imagesData[activeImageIndex].ktk_imageSeriesContent.technique && imagesData[activeImageIndex].ktk_imageSeriesContent.technique.footTechnique && <div>
                        Feet: {imagesData[activeImageIndex].ktk_imageSeriesContent.technique.footTechnique.replaceAll(" ///  ///","")}</div>}

                    {imagesData[activeImageIndex] && imagesData[activeImageIndex].ktk_imageSeriesContent.technique && imagesData[activeImageIndex].ktk_imageSeriesContent.technique.handTechnique && <div>
                        Hands: {imagesData[activeImageIndex].ktk_imageSeriesContent.technique.handTechnique.replaceAll(" ///  ///","")}</div>}

                    {imagesData[activeImageIndex] && imagesData[activeImageIndex].ktk_imageSeriesContent.technique && imagesData[activeImageIndex].ktk_imageSeriesContent.technique.kungfuTechnique && <div>
                    Technique: {imagesData[activeImageIndex].ktk_imageSeriesContent.technique.kungfuTechnique.replaceAll(" ///  ///","")}</div>}
                </div>
                <Editor
                    size={calculateEditorSize()}
                    imageData={imagesData[activeImageIndex]}
                    key="editor"
                />
                <EditorBottomNavigationBar
                    imageData={imagesData[activeImageIndex]}
                    size={calculateEditorSize()}
                    totalImageCount={imagesData.length}
                    key="editor-bottom-navigation-bar"
                />
            </div>
            <SideNavigationBar
                direction={Direction.RIGHT}
                isOpen={rightTabStatus}
                isWithContext={activeContext === ContextType.RIGHT_NAVBAR}
                renderCompanion={rightSideBarCompanionRender}
                renderContent={rightSideBarRender}
                key="right-side-navigation-bar"
            />
        </div>
    );
};

const mapStateToProps = (state: AppState) => ({
    windowSize: state.general.windowSize,
    activeImageIndex: state.labels.activeImageIndex,
    imagesData: state.labels.imagesData,
    activeContext: state.general.activeContext,
    projectType: state.general.projectData.type
});

export default connect(
    mapStateToProps
)(EditorContainer);