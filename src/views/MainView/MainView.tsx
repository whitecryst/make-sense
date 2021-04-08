import React, {useState} from 'react';
import './MainView.scss';
import {TextButton} from "../Common/TextButton/TextButton";
import classNames from 'classnames';
import {ISize} from "../../interfaces/ISize";
import {ImageButton} from "../Common/ImageButton/ImageButton";
import {ISocialMedia, SocialMediaData} from "../../data/info/SocialMediaData";
import {EditorFeatureData, IEditorFeature} from "../../data/info/EditorFeatureData";
import {Tooltip} from "@material-ui/core";
import Fade from "@material-ui/core/Fade";
import withStyles from "@material-ui/core/styles/withStyles";
import ImagesDropZone from "./ImagesDropZone/ImagesDropZone";
import { KtkSelector } from '../../store/selectors/KtkSelector';
const MainView: React.FC = () => {
    const [projectInProgress, setProjectInProgress] = useState(false);
    const [projectCanceled, setProjectCanceled] = useState(false);
    const [ktkLoading, setKtkLoading] = useState(true);

    
    const waitLoading = async () => {
        
        while( KtkSelector.getImageSeriesContentSize() == 0 ) {
            await new Promise(r => setTimeout(r, 1000));
        }
        if( ktkLoading == true) {
            setKtkLoading(false);
        }
        
    }

    waitLoading();

    const startProject = () => {
        setProjectInProgress(true);
    };

    const endProject = () => {
        setProjectInProgress(false);
        setProjectCanceled(true);
    };

    const getClassName = () => {
        return classNames(
            "MainView", {
                "InProgress": projectInProgress,
                "Canceled": !projectInProgress && projectCanceled
            }
        );
    };

    

    const DarkTooltip = withStyles(theme => ({
        tooltip: {
            backgroundColor: "#171717",
            color: "#ffffff",
            boxShadow: theme.shadows[1],
            fontSize: 11,
            maxWidth: 120
        },
    }))(Tooltip);

    const getSocialMediaButtons = (size:ISize) => {
        /*return SocialMediaData.map((data:ISocialMedia, index: number) => {
            return <DarkTooltip
                key={index}
                disableFocusListener
                title={data.tooltipMessage}
                TransitionComponent={Fade}
                TransitionProps={{ timeout: 600 }}
                placement="left"
            >
                <div>
                    <ImageButton
                        buttonSize={size}
                        image={data.imageSrc}
                        imageAlt={data.imageAlt}
                        href={data.href}
                    />
                </div>
            </DarkTooltip>
        });*/
        return "";
    };

    const getEditorFeatureTiles = () => {
        return EditorFeatureData.map((data:IEditorFeature) => {
            return <div
                className="EditorFeaturesTiles"
                key={data.displayText}
            >
                <div
                    className="EditorFeaturesTilesWrapper"
                >
                    <img
                        draggable={false}
                        alt={data.imageAlt}
                        src={data.imageSrc}
                    />
                    <div className="EditorFeatureLabel">
                        {data.displayText}
                    </div>
                </div>
            </div>
        });
    };

    return (
        <div className={getClassName()}>
            <div className="Slider" id="lower">
                <div className="TriangleVertical">
                    <div className="TriangleVerticalContent"/>
                </div>
            </div>

            <div className="Slider" id="upper">
                <div className="TriangleVertical">
                    <div className="TriangleVerticalContent"/>
                </div>
            </div>
            
            <div className="LeftColumn" style={{ backgroundImage: "url(/chinese3.jpg)" }}>
                <div className={"LogoWrapper"}>
                    
                </div>
                <div className="EditorFeaturesWrapper">
                    
                </div>
                <div className="TriangleVertical">
                    <div className="TriangleVerticalContent"/>
                </div>
                {projectInProgress && <TextButton
                    label={"Go Back"}
                    onClick={endProject}
                />}
            </div>
            <div className="RightColumn">
                <div/>
                <ImagesDropZone/>
                <div className="SocialMediaWrapper">
                    {getSocialMediaButtons({width: 30, height: 30})}
                </div>
                {!projectInProgress && (KtkSelector.getImageSeriesContentSize() > 0) && <TextButton
                    label={"Get Started"}
                    onClick={startProject}/> || (KtkSelector.getImageSeriesContentSize() == 0) && <TextButton label={"Loading..."} /> }
            </div>
        </div>
    );
};

export default MainView;
