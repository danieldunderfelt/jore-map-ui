import classnames from 'classnames';
import { observer } from 'mobx-react';
import React from 'react';
import * as s from './mapControlButton.scss';

interface MapControlButtonProps {
    label: string;
    isActive: boolean;
    isDisabled: boolean;
    children: React.ReactNode;
    onClick: () => void;
    hasNoPadding?: boolean;
}

const MapControlButton = observer((props: MapControlButtonProps) => {
    const onClick = () => {
        if (!props.isDisabled) {
            props.onClick();
        }
    };

    const classes = classnames(
        s.mapControlButton,
        props.isActive && !props.isDisabled ? s.active : null,
        props.isDisabled ? s.disabled : null,
        props.hasNoPadding ? s.hasNoPadding : undefined
    );

    return (
        <div className={classes} onClick={onClick} title={props.label}>
            {props.children}
        </div>
    );
});

export default MapControlButton;
