import ToolbarToolType from '~/enums/toolbarToolType';
import EventListener from '~/helpers/EventListener';
import navigator from '~/routing/navigator';
import RouteBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import MapStore from '~/stores/mapStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import ToolbarStore from '~/stores/toolbarStore';
import { roundLatLng } from '~/utils/geomUtils';
import BaseTool from './BaseTool';

type toolPhase = 'setNodeLocation';

class AddNetworkNodeTool implements BaseTool {
    public toolType = ToolbarToolType.AddNetworkNode;
    public toolHelpHeader = 'Luo uusi solmu';
    public toolHelpPhasesMap = {
        setNodeLocation: {
            phaseHelpText: 'Aloita uuden solmun luonti valitsemalla solmulle sijainti kartalta.',
        },
    };

    public activate = () => {
        NetworkStore.showMapLayer(MapLayer.node);
        NetworkStore.showMapLayer(MapLayer.link);
        EventListener.on('mapClick', this.onMapClick);
        MapStore.setMapCursor('crosshair');
        this.setToolPhase('setNodeLocation');
    };

    public deactivate = () => {
        this.setToolPhase(null);
        EventListener.off('mapClick', this.onMapClick);
        MapStore.setMapCursor('');
    };

    public getToolPhase = () => {
        return ToolbarStore.toolPhase;
    };

    public setToolPhase = (toolPhase: toolPhase | null) => {
        ToolbarStore.setToolPhase(toolPhase);
    };

    private onMapClick = async (clickEvent: CustomEvent) => {
        ToolbarStore.selectTool(null);
        const coordinate = roundLatLng(clickEvent.detail.latlng);
        const newNodeViewLink = RouteBuilder.to(SubSites.newNode)
            .toTarget(':id', `${coordinate.lat}:${coordinate.lng}`)
            .toLink();
        navigator.goTo({ link: newNodeViewLink });
    };
}

export default AddNetworkNodeTool;
