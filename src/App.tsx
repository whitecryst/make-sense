import React from 'react';
import './App.scss';
import EditorView from "./views/EditorView/EditorView";
import MainView from "./views/MainView/MainView";
import {ProjectType} from "./data/enums/ProjectType";
import {AppState} from "./store";
import {connect} from "react-redux";
import PopupView from "./views/PopupView/PopupView";
import MobileMainView from "./views/MobileMainView/MobileMainView";
import {ISize} from "./interfaces/ISize";
import {Settings} from "./settings/Settings";
import {SizeItUpView} from "./views/SizeItUpView/SizeItUpView";
import {PlatformModel} from "./staticModels/PlatformModel";
import classNames from "classnames";
import { KtkActions } from './logic/actions/KtkActions';
import { updateImageSeriesContent } from './store/ktk/actionCreators';
import { store } from '.';
import { KtkSelector } from './store/selectors/KtkSelector';

interface IProps {
    projectType: ProjectType;
    windowSize: ISize;
    ObjectDetectorLoaded: boolean;
    PoseDetectionLoaded: boolean;
}

const App: React.FC<IProps> = ({projectType, windowSize, ObjectDetectorLoaded, PoseDetectionLoaded}) => {
    if( KtkSelector.getImageSeriesMetaSize() == 0 ) {
        KtkActions.loadImageSeriesMeta();
    }
    if( KtkSelector.getImageSeriesContentSize() == 0 ) {
        KtkActions.loadImageSeriesContent();
    }
    if( KtkSelector.getSymbolsContentSize() == 0 ) {
        KtkActions.LoadSymbolsContent();
    }
    
    

    const selectRoute = () => {
        if (!!PlatformModel.mobileDeviceData.manufacturer && !!PlatformModel.mobileDeviceData.os)
            return <MobileMainView/>;
        if (!projectType)
            return <MainView/>;
        else {
            if (windowSize.height < Settings.EDITOR_MIN_HEIGHT || windowSize.width < Settings.EDITOR_MIN_WIDTH) {
                return <SizeItUpView/>;
            } else {
                return <EditorView/>;
            }
        }
    };

      return (
        <div className={classNames("App", {"AI": ObjectDetectorLoaded || PoseDetectionLoaded})}
            draggable={false}
        >
            {selectRoute()}
            <PopupView/>
        </div>
      );
};

const mapDispatchToProps = {
    updateImageSeriesContent
};

const mapStateToProps = (state: AppState) => ({
    projectType: state.general.projectData.type,
    windowSize: state.general.windowSize,
    ObjectDetectorLoaded: state.ai.isObjectDetectorLoaded,
    PoseDetectionLoaded: state.ai.isPoseDetectorLoaded
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
