import { toJS } from 'mobx';
import Moment from 'moment';
import TransitType from '~/enums/transitType';
import { INeighborLink } from '~/models';
import { IStopItem } from '~/models/IStop';
import LinkStore from '~/stores/linkStore';
import NetworkStore, { MapLayer } from '~/stores/networkStore';
import NodeStore from '~/stores/nodeStore';
import RoutePathLayerListStore from '~/stores/routePathLayerListStore';
import RoutePathLayerStore from '~/stores/routePathLayerStore';
import RoutePathStore from '~/stores/routePathStore';
import StopAreaStore from '~/stores/stopAreaStore';

type NetworkElementType = MapLayer.link | MapLayer.linkPoint;

interface INetworkLinkHiddenProps {
    transitType: TransitType;
    startNodeId: string;
    endNodeId: string;
    dateRangesString: string;
}

interface INetworkLinkPointHiddenProps extends INetworkLinkHiddenProps {}

const isNetworkLinkHidden = (props: INetworkLinkHiddenProps) => {
    return _isNetworkElementHidden({ type: MapLayer.link, ...props });
};

const isNetworkLinkPointHidden = (props: INetworkLinkPointHiddenProps) => {
    return _isNetworkElementHidden({ type: MapLayer.linkPoint, ...props });
};

const _isNetworkElementHidden = ({
    type,
    transitType,
    startNodeId,
    endNodeId,
    dateRangesString,
}: {
    type: NetworkElementType;
    transitType: TransitType;
    startNodeId: string;
    endNodeId: string;
    dateRangesString: string;
}) => {
    const dateRanges = _parseDateRangesString(dateRangesString);
    const selectedTransitTypes = NetworkStore.selectedTransitTypes;
    const selectedDate = NetworkStore.selectedDate;
    const link = LinkStore.link;
    const node = NodeStore.node;

    if (!selectedTransitTypes.includes(transitType)) {
        return true;
    }

    if (!dateRanges) {
        return !NetworkStore.isMapLayerVisible(MapLayer.unusedLink);
    }
    if (type === MapLayer.link && !NetworkStore!.isMapLayerVisible(MapLayer.link)) {
        return true;
    }
    if (type === MapLayer.linkPoint && !NetworkStore!.isMapLayerVisible(MapLayer.linkPoint)) {
        return true;
    }
    if (!selectedDate) {
        return false;
    }

    // the element is related to an opened link
    const isLinkOpen =
        link &&
        link.startNode.id === startNodeId &&
        link.endNode.id === endNodeId &&
        link.transitType === transitType;

    // the element is related to a link that is related to an opened node
    const isLinkRelatedToOpenedNode = node && (node.id === startNodeId || node.id === endNodeId);

    return !_isDateInRanges(selectedDate, dateRanges) || isLinkOpen || isLinkRelatedToOpenedNode;
};

const isNetworkNodeHidden = ({
    nodeId,
    transitTypeCodes,
    dateRangesString,
}: {
    nodeId: string;
    transitTypeCodes: string;
    dateRangesString?: string;
}) => {
    const dateRanges: Moment.Moment[][] | undefined = _parseDateRangesString(dateRangesString);
    const selectedTransitTypes = toJS(NetworkStore.selectedTransitTypes);

    // TODO: implement a better (more efficient) way of hiding node visible in other layers
    if (
        isNodeOpenInNodeView(nodeId) ||
        isNodeOpenInLinkView(nodeId) ||
        isNodeOpenInRoutePathView(nodeId) ||
        isNodeOpenInRouteListView(nodeId) ||
        isNodeOpenInStopAreaView(nodeId) ||
        isNodeOpenInNeighborLinkLayer(nodeId)
    ) {
        return true;
    }

    if (Boolean(transitTypeCodes)) {
        if (!NetworkStore!.isMapLayerVisible(MapLayer.node)) {
            return true;
        }
        const nodeTransitTypes = transitTypeCodes.split(',');
        if (!selectedTransitTypes.some((type) => nodeTransitTypes.includes(type))) {
            return true;
        }
    } else {
        if (!NetworkStore.isMapLayerVisible(MapLayer.unusedNode)) {
            return true;
        }
    }

    const selectedDate = NetworkStore.selectedDate;
    if (!dateRanges || !selectedDate) {
        return false;
    }

    return !selectedDate || !_isDateInRanges(selectedDate, dateRanges);
};

const isNodeOpenInNodeView = (nodeId: string) => {
    const node = NodeStore.node;
    return node && node.id === nodeId;
};

const isNodeOpenInLinkView = (nodeId: string) => {
    const link = LinkStore.link;
    return link && (nodeId === link.startNode.id || nodeId === link.endNode.id);
};

const isNodeOpenInRoutePathView = (nodeId: string) => {
    return RoutePathStore.isNodeFound(nodeId);
};

const isNodeOpenInRouteListView = (nodeId: string) => {
    return RoutePathLayerListStore.isNodeFound(nodeId);
};

const isNodeOpenInStopAreaView = (nodeId: string) => {
    const stopItems = StopAreaStore.stopItems;
    return (
        stopItems.length > 0 &&
        Boolean(stopItems.find((stopItem: IStopItem) => stopItem.nodeId === nodeId))
    );
};

const isNodeOpenInNeighborLinkLayer = (nodeId: string) => {
    return Boolean(
        RoutePathLayerStore.neighborLinks.find(
            (link: INeighborLink) =>
                link.routePathLink.startNode.id === nodeId ||
                link.routePathLink.endNode.id === nodeId
        )
    );
};

const _parseDateRangesString = (dateRangesString?: string) => {
    if (!dateRangesString) return undefined;
    return dateRangesString
        .split(',')
        .map((dr: string) => dr.split('/').map((date) => Moment(date)));
};

const _isDateInRanges = (selectedDate: Moment.Moment, dateRanges: Moment.Moment[][]): Boolean => {
    return dateRanges.some((dr) => selectedDate.isBetween(dr[0], dr[1], 'day', '[]'));
};

export { isNetworkLinkHidden, isNetworkNodeHidden, isNetworkLinkPointHidden };
