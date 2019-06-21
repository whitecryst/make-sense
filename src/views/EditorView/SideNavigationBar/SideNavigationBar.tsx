import React from 'react';
import classNames from 'classnames';
import './SideNavigationBar.scss';
import {Direction} from "../../../data/Direction";
import BottomNavigationBar from "../EditorWrapper/EditorWrapper";

interface IProps {
    direction: Direction
}

export const SideNavigationBar: React.FC<IProps> = (props) => {

    const getClassName = () => {
        return classNames(
            "SideNavigationBar",
            {
                "left": props.direction === Direction.LEFT,
                "right": props.direction === Direction.RIGHT,
            }
        );
    };

    return (
        <div className={getClassName()}>
            <div className="CompanionBar"/>
            <div className="NavigationBarContentWrapper">
                <BottomNavigationBar/>
            </div>
        </div>
    );
};