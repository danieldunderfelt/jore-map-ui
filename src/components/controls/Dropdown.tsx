import React from 'react';
import { observer } from 'mobx-react';
import { IValidationResult } from '~/validation/FormValidator';
import ICodeListItem from '~/models/ICodeListItem';
import * as s from './dropdown.scss';

export interface IDropdownItem {
    value: string;
    label: string;
}

interface IDropdownProps {
    label?: string;
    selected?: string | null;
    disabled?: boolean;
    items: ICodeListItem[];
    emptyItem?: IDropdownItem;
    isValueIncludedInOptionLabel?: boolean;
    onChange: (value: any) => void;
    validationResult?: IValidationResult;
}

const EMPTY_VALUE_LABEL = '-';

const Dropdown = observer((props: IDropdownProps) => {
    const validationResult = props.validationResult;
    const onChange = (event: any) => {
        props.onChange(event.target.value);
    };
    const dropDownItemList = props.items.map(
        (item): IDropdownItem => ({
            value: item.value,
            label: item.label
        })
    );

    if (props.isValueIncludedInOptionLabel) {
        dropDownItemList.forEach(
            item => (item.label = `${item.value} - ${item.label}`)
        );
    }

    if (props.emptyItem) {
        dropDownItemList.unshift(props.emptyItem);
    }

    let selectedItem: IDropdownItem | undefined;
    if (props.selected) {
        selectedItem = dropDownItemList.find(
            item => item.value === props.selected!.trim()
        );
        if (!selectedItem) {
            selectedItem = {
                label: props.selected,
                value: props.selected
            };
            dropDownItemList.push(selectedItem);
        }
    }

    return (
        <div className={s.formItem}>
            <div className={s.dropdownView}>
                {props.label && (
                    <div className={s.inputLabel}>{props.label}</div>
                )}
                {props.disabled ? (
                    <div className={s.disableEditing}>
                        {Boolean(selectedItem)
                            ? selectedItem!.label
                            : EMPTY_VALUE_LABEL}
                    </div>
                ) : (
                    <select
                        className={s.dropdown}
                        value={selectedItem ? selectedItem.value : ''}
                        onChange={onChange}
                    >
                        {!selectedItem && <option disabled value='' />}
                        {dropDownItemList.map(item => {
                            return (
                                <option
                                    key={item.value ? item.value : item.value}
                                    value={item.value}
                                >
                                    {item.label}
                                </option>
                            );
                        })}
                    </select>
                )}
                {validationResult &&
                    validationResult.errorMessage &&
                    !props.disabled && (
                        <div className={s.errorMessage}>
                            {validationResult.errorMessage}
                        </div>
                    )}
            </div>
        </div>
    );
});

export default Dropdown;
