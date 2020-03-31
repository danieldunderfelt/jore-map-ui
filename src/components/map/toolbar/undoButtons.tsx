import { observer } from 'mobx-react';
import React from 'react';
import { IoMdRedo, IoMdUndo } from 'react-icons/io';
import EventHelper from '~/helpers/EventHelper';
import LoginStore from '~/stores/loginStore';
import ToolbarStore from '~/stores/toolbarStore';
import MapControlButton from '../mapControls/MapControlButton';

@observer
class UndoButtons extends React.Component {
    private undo = () => {
        EventHelper.trigger('undo');
    };

    private redo = () => {
        EventHelper.trigger('redo');
    };

    render() {
        if (!LoginStore.hasWriteAccess) return null;

        const areUndoButtonsDisabled = ToolbarStore.areUndoButtonsDisabled;
        return (
            <>
                <MapControlButton
                    onClick={this.undo}
                    isActive={false}
                    isDisabled={areUndoButtonsDisabled}
                    label='Kumoa (ctrl+z)'
                >
                    <IoMdUndo />
                </MapControlButton>
                <MapControlButton
                    onClick={this.redo}
                    isActive={false}
                    isDisabled={areUndoButtonsDisabled}
                    label='Tee uudestaan (ctrl+y)'
                >
                    <IoMdRedo />
                </MapControlButton>
            </>
        );
    }
}
export default UndoButtons;
