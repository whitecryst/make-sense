import React from 'react';
import './TopNavigationBar.scss';
import StateBar from "../StateBar/StateBar";
import {PopupWindowType} from "../../../data/enums/PopupWindowType";
import {AppState} from "../../../store";
import {connect} from "react-redux";
import {updateActivePopupType, updateProjectData} from "../../../store/general/actionCreators";
import TextInput from "../../Common/TextInput/TextInput";
import {ImageButton} from "../../Common/ImageButton/ImageButton";
import {Settings} from "../../../settings/Settings";
import {ProjectData} from "../../../store/general/types";
import DropDownMenu from "./DropDownMenu/DropDownMenu";

interface IProps {
    updateActivePopupType: (activePopupType: PopupWindowType) => any;
    updateProjectData: (projectData: ProjectData) => any;
    projectData: ProjectData;
}

const TopNavigationBar: React.FC<IProps> = ({updateActivePopupType, updateProjectData, projectData}) => {
    const onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        event.target.setSelectionRange(0, event.target.value.length);
    };

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
            .toLowerCase()
            .replace(' ', '-');

        updateProjectData({
            ...projectData,
            name: value
        })
    };

    
    return (
        <div className="TopNavigationBar">
            <StateBar/>
            <div className="TopNavigationBarWrapper">
                <div className="NavigationBarGroupWrapper">
                    <div
                        className="Header"
                        onClick={() => updateActivePopupType(PopupWindowType.EXIT_PROJECT)}
                    >
                        KtK-CommandBridge
                    </div>
                </div>
                <div className="NavigationBarGroupWrapper">
                    <DropDownMenu/>
                </div>
                <div className="NavigationBarGroupWrapper middle">
                    
                    {/*
                    <div className="ProjectName">Project Name:</div>
                    <TextInput
                        key={"ProjectName"}
                        isPassword={false}
                        value={projectData.name}
                        onChange={onChange}
                        onFocus={onFocus}
                    />*/}
                </div>
                <div className="NavigationBarGroupWrapper">
                    <ImageButton
                        image={"ico/googlesheetLogoC.png"}
                        imageAlt={"googlesheet-logo-C.png"}
                        buttonSize={{width: 35, height: 35}}
                        href={Settings.KTK_GOOGLESHEET_CATEGORIES_URL}
                        title={"Open Categories-sheet"}
                    />
                    <ImageButton
                        image={"ico/googlesheetLogoR.png"}
                        imageAlt={"googlesheet-logo-R.png"}
                        buttonSize={{width: 35, height: 35}}
                        href={Settings.KTK_GOOGLESHEET_ROUTINES_URL}
                        title={"Open Routines-sheet"}
                    />
                    <ImageButton
                        image={"ico/yinyang.png"}
                        imageAlt={"yinyang.png"}
                        buttonSize={{width: 35, height: 35}}
                        href={Settings.KUNGFUWIKI_URL}
                        title={"Open Kungfu-Wiki"}
                    />
                </div>
            </div>
        </div>
    );
};

const mapDispatchToProps = {
    updateActivePopupType,
    updateProjectData
};

const mapStateToProps = (state: AppState) => ({
    projectData: state.general.projectData
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TopNavigationBar);