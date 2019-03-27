import React from 'react';
import { observer } from 'mobx-react';
import ReactDatePicker from 'react-date-picker';
import { IoMdCalendar } from 'react-icons/io';
import * as s from './datePicker.scss';

interface IDatePickerProps {
    value: Date;
    onChange: (date: Date) => void;
}

const DatePicker = observer((props: IDatePickerProps) => (
    <div className={s.datepickerContainer}>
        <ReactDatePicker
            value={(props.value as Date)}
            onChange={props.onChange}
            locale='fi-FI'
            calendarIcon={<IoMdCalendar />}
            clearIcon={null}
        />
  </div>
));

export default DatePicker;
