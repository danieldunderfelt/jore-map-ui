import * as React from 'react';
import * as s from './dropdown.scss';

interface IDropdownState {
    isOpen: boolean;
}

interface IDropdownProps {
    onChange(selectedItem: string): void;
    selected: string;
    items: string[];
}

class Dropdown extends React.Component
<IDropdownProps, IDropdownState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isOpen: false,
        };
    }

    private showDropdownList = () => {
        this.setState({
            isOpen: true,
        });
    }

    private hideDropdownList = () => {
        this.setState({
            isOpen: false,
        });
    }

    private getItemListClassName() {
        return this.state.isOpen ? s.itemListShown : s.itemListHidden;
    }

    public render(): any {
        const onChange = (selectedItem: string) => {
            this.setState({
                isOpen: false,
            });
            this.props.onChange(selectedItem);
        };

        return (
            <div
                onMouseLeave={this.hideDropdownList}
                className={s.dropdown}
            >
                <div
                    onMouseEnter={this.showDropdownList}
                    className={s.selectedItem}
                >
                    <div>
                        {this.props.selected}
                    </div>
                    <div className={s.downArrow} />
                </div>
                <div className={this.getItemListClassName()}>
                {
                    this.props.items.map((item) => {
                        return (
                            <div
                                key={item}
                                onClick={onChange.bind(this, item)}
                                className={s.item}
                            >
                                {item}
                            </div>
                        );
                    })
                }
                </div>
            </div>
        );
    }

}

export default Dropdown;
