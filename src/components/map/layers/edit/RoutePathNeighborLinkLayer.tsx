import { inject, observer } from 'mobx-react';
import Moment from 'moment';
import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Polyline } from 'react-leaflet';
import EventHelper, { IEditRoutePathNeighborLinkClickParams } from '~/helpers/EventHelper';
import { IRoutePath } from '~/models';
import INeighborLink from '~/models/INeighborLink';
import INode from '~/models/INode';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import { MapStore, NodeLabel } from '~/stores/mapStore';
import { NeighborToAddType, RoutePathStore } from '~/stores/routePathStore';
import NodeUtils from '~/utils/NodeUtils';
import NodeMarker from '../markers/NodeMarker';
import * as s from './routePathNeighborLinkLayer.scss';

const USED_NEIGHBOR_COLOR = '#0dce0a';
const UNUSED_NEIGHBOR_COLOR = '#fc383a';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
    mapStore?: MapStore;
}

@inject('routePathStore', 'mapStore')
@observer
class RoutePathNeighborLinkLayer extends Component<IRoutePathLayerProps> {
    private getNodeUsageViewMarkup = (routePaths: IRoutePath[]) => {
        if (!routePaths || routePaths.length === 0) return;
        return ReactDOMServer.renderToStaticMarkup(
            <div className={s.nodeUsageList}>
                <div className={s.topic}>Solmua käyttävät reitinsuunnat</div>
                {routePaths
                    .slice()
                    .sort((a, b) => (a.routeId < b.routeId ? -1 : 1))
                    .map((routePath, index) => {
                        const link = routeBuilder
                            .to(SubSites.routePath)
                            .toTarget(
                                ':id',
                                [
                                    routePath.routeId,
                                    Moment(routePath.startTime).format('YYYY-MM-DDTHH:mm:ss'),
                                    routePath.direction
                                ].join(',')
                            )
                            .toLink();
                        return (
                            <div className={s.usageListItem} key={index}>
                                <div className={s.usageListItemTitle}>
                                    {routePath.originFi}-{routePath.destinationFi}
                                </div>
                                <div className={s.usageListItemId}>
                                    <a href={link} target='_blank'>
                                        {routePath.routeId}
                                    </a>
                                </div>
                            </div>
                        );
                    })}
            </div>
        );
    };

    private renderNeighborNode = (node: INode, neighborLink: INeighborLink, key: number) => {
        const onNeighborLinkClick = () => {
            const clickParams: IEditRoutePathNeighborLinkClickParams = {
                neighborLink
            };
            EventHelper.trigger('editRoutePathNeighborLinkClick', clickParams);
        };

        return (
            <NodeMarker
                key={`${key}-${node.id}`}
                coordinates={node.coordinates}
                nodeType={node.type}
                nodeLocationType={'coordinates'}
                nodeId={node.id}
                shortId={NodeUtils.getShortId(node)}
                hastusId={node.stop ? node.stop.hastusId : undefined}
                isHighlighted={this.props.mapStore!.selectedNodeId === node.id}
                onClick={onNeighborLinkClick}
                markerClasses={[s.neighborMarker]}
                forcedVisibleNodeLabels={[NodeLabel.longNodeId]}
                popupContent={this.getNodeUsageViewMarkup(neighborLink.nodeUsageRoutePaths)}
                color={
                    neighborLink.nodeUsageRoutePaths.length > 0
                        ? USED_NEIGHBOR_COLOR
                        : UNUSED_NEIGHBOR_COLOR
                }
            >
                <div className={s.usageCount}>
                    {neighborLink.nodeUsageRoutePaths.length > 9
                        ? '9+'
                        : neighborLink.nodeUsageRoutePaths.length}
                </div>
            </NodeMarker>
        );
    };

    private renderNeighborLink = (neighborLink: INeighborLink) => {
        const onNeighborLinkClick = () => {
            const clickParams: IEditRoutePathNeighborLinkClickParams = {
                neighborLink
            };
            EventHelper.trigger('editRoutePathNeighborLinkClick', clickParams);
        };

        return (
            <Polyline
                positions={neighborLink.routePathLink.geometry}
                key={neighborLink.routePathLink.id}
                color={
                    neighborLink.nodeUsageRoutePaths.length > 0
                        ? USED_NEIGHBOR_COLOR
                        : UNUSED_NEIGHBOR_COLOR
                }
                weight={5}
                opacity={0.8}
                onClick={onNeighborLinkClick}
            />
        );
    };

    render() {
        const neighborLinks = this.props.routePathStore!.neighborLinks;
        return neighborLinks.map((neighborLink, index) => {
            const neighborToAddType = this.props.routePathStore!.neighborToAddType;
            const nodeToRender =
                neighborToAddType === NeighborToAddType.AfterNode
                    ? neighborLink.routePathLink.endNode
                    : neighborLink.routePathLink.startNode;
            return [
                this.renderNeighborNode(nodeToRender, neighborLink, index),
                this.renderNeighborLink(neighborLink)
            ];
        });
    }
}

export default RoutePathNeighborLinkLayer;
