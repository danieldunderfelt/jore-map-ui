import React from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import * as s from './inputContainer.scss';

interface IInputProps {
    label: string|JSX.Element;
    value?: string|number|null|Date;
}

const TextContainer = observer((props: IInputProps) => (
    <div className={s.formItem}>
        <div className={s.inputLabel}>
            {props.label}
        </div>
        {
            props.value instanceof Date ?
                moment(props.value!).format('DD.MM.YYYY') :
                props.value ? props.value : ''
        }
    </div>
));

export default TextContainer;