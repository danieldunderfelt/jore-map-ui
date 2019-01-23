import React, { Component, ReactNode } from 'react';
import { Polyline } from 'react-leaflet';
import * as L from 'leaflet';
import { inject, observer } from 'mobx-react';
import IRoutePathLink from '~/models/IRoutePathLink';
import INode from '~/models/INode';
import { MapStore } from '~/stores/mapStore';
import {
    RoutePathStore, AddLinkDirection, RoutePathViewTab,
} from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import RoutePathLinkService from '~/services/routePathLinkService';
import ToolbarTool from '~/enums/toolbarTool';
import NodeMarker from '../mapIcons/NodeMarker';
import StartMarker from '../mapIcons/StartMarker';

const MARKER_COLOR = '#00df0b';
const NEIGHBOR_MARKER_COLOR = '#ca00f7';
const ROUTE_COLOR = '#007ac9';

interface IRoutePathLayerProps {
    routePathStore?: RoutePathStore;
    toolbarStore?: ToolbarStore;
    mapStore?: MapStore;
}

interface IRoutePathLayerState {
    focusedRoutePathId: string;
}

@inject('routePathStore', 'toolbarStore', 'mapStore')
@observer
class UpsertRoutePathLayer extends Component<IRoutePathLayerProps, IRoutePathLayerState> {
    constructor(props: IRoutePathLayerProps) {
        super(props);

        this.state = {
            focusedRoutePathId: '',
        };
    }

    private defaultActionOnObjectClick = (id: string) => {
        // Switch to info tab
        this.props.routePathStore!.setActiveTab(RoutePathViewTab.List);
        // Close all extended objects, in order to be able to calculate final height of items
        this.props.routePathStore!.setExtendedObjects([]);
        // Set extended object, which will trigger automatic scroll
        this.props.routePathStore!.setExtendedObjects([id]);
        // Set highlight
        this.props.routePathStore!.setHighlightedObject(id);

    }

    private renderRoutePathLinks = () => {
        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        if (!routePathLinks || routePathLinks.length < 1) return;

        let res: ReactNode[] = [];
        routePathLinks.forEach((rpLink, index) => {
            const nextLink =
                index === routePathLinks.length - 1 ? undefined : routePathLinks[index + 1];

            // Render node which is lacking preceeding link
            if (index === 0 || routePathLinks[index - 1].endNode.id !== rpLink.startNode.id) {
                res.push(this.renderNode(rpLink.startNode, index, undefined, rpLink));
            }
            res = res.concat(this.renderLink(rpLink));
            res.push(this.renderNode(rpLink.endNode, index, rpLink, nextLink));
        });
        return res;
    }

    private renderNode = (
        node: INode,
        index: number,
        previousRPLink?: IRoutePathLink,
        nextRPLink?: IRoutePathLink,
    ) => {

        const onNodeClick =
            this.props.toolbarStore!.selectedTool &&
            this.props.toolbarStore!.selectedTool!.onNodeClick ?
                this.props.toolbarStore!.selectedTool!.onNodeClick!(
                    node, previousRPLink, nextRPLink)
                // Default
                : () => this.defaultActionOnObjectClick(node.id);

        const isNodeHighlighted =
            this.props.toolbarStore!.selectedTool &&
            this.props.toolbarStore!.selectedTool!.isNodeHighlighted ?
                this.props.toolbarStore!.selectedTool!.isNodeHighlighted!(
                    node)
                // Default
                : this.props.routePathStore!.isObjectHighlighted(node.id);

        return (
            <NodeMarker
                key={`${node.id}-${index}`}
                onClick={onNodeClick}
                node={node}
                isHighlighted={isNodeHighlighted}
            />
        );
    }

    private renderLink = (routePathLink: IRoutePathLink) => {
        const onRoutePathLinkClick =
            this.props.toolbarStore!.selectedTool &&
            this.props.toolbarStore!.selectedTool!.onRoutePathLinkClick ?
                this.props.toolbarStore!.selectedTool!.onRoutePathLinkClick!(routePathLink.id)
                : () => this.defaultActionOnObjectClick(routePathLink.id);

        return [
            (
                <Polyline
                    positions={routePathLink.positions}
                    key={routePathLink.id}
                    color={ROUTE_COLOR}
                    weight={5}
                    opacity={0.8}
                    onClick={onRoutePathLinkClick}
                />
            ), this.props.routePathStore!.isObjectHighlighted(routePathLink.id) &&
            (
                <Polyline
                    positions={routePathLink.positions}
                    key={`${routePathLink.id}-highlight`}
                    color={ROUTE_COLOR}
                    weight={25}
                    opacity={0.5}
                    onClick={onRoutePathLinkClick}
                />
            ),
        ];
    }

    private renderRoutePathLinkNeighbors = () => {
        const routePathLinks = this.props.routePathStore!.neighborLinks;
        if (!routePathLinks) return;

        return routePathLinks.map((routePathLink: IRoutePathLink, index) => {
            const direction = this.props.routePathStore!.addRoutePathLinkInfo.direction;
            const nodeToRender =
                direction === AddLinkDirection.AfterNode ?
                    routePathLink.endNode : routePathLink.startNode;
            return (
                [
                    this.renderNeighborNode(nodeToRender, routePathLink, index),
                    this.renderNeighborLink(routePathLink),
                ]
            );
        });
    }

    private renderNeighborNode = (node: INode, routePathLink: IRoutePathLink, key: number) => {
        return (
            <NodeMarker
                key={`${key}-${node.id}`}
                isNeighborMarker={true}
                onClick={this.addLinkToRoutePath(routePathLink)}
                node={node}
            />
        );
    }

    private renderNeighborLink = (routePathLink: IRoutePathLink) => {
        return (
            <Polyline
                positions={routePathLink.positions}
                key={routePathLink.id}
                color={NEIGHBOR_MARKER_COLOR}
                weight={5}
                opacity={0.8}
                onClick={this.addLinkToRoutePath(routePathLink)}
            />
        );
    }

    private addLinkToRoutePath = (routePathLink: IRoutePathLink) => async () => {
        this.props.routePathStore!.addLink(routePathLink);
        this.updateNeighbourLinks(routePathLink);
    }

    private updateNeighbourLinks = async (routePathLink: IRoutePathLink) =>  {
        const direction = this.props!.routePathStore!.addRoutePathLinkInfo.direction;

        const fixedNode =
            direction === AddLinkDirection.AfterNode
            ? routePathLink.endNode
            : routePathLink.startNode;

        const isMissingNeighbours =
            this.props!.routePathStore!.isRoutePathNodeMissingNeighbour(fixedNode);

        if (isMissingNeighbours) {
            const direction = this.props.routePathStore!.addRoutePathLinkInfo.direction;
            const orderNumber =
                direction === AddLinkDirection.AfterNode
                ? routePathLink.orderNumber + 1
                : routePathLink.orderNumber;

            const newRoutePathLinks =
                await RoutePathLinkService.fetchAndCreateRoutePathLinksWithNodeId(
                    fixedNode.id,
                    this.props.routePathStore!.addRoutePathLinkInfo.direction,
                    orderNumber);
            this.props.routePathStore!.setNeighborRoutePathLinks(newRoutePathLinks);
        } else {
            this.props.routePathStore!.setNeighborRoutePathLinks([]);
        }
    }

    private calculateBounds = () => {
        const bounds:L.LatLngBounds = new L.LatLngBounds([]);

        this.props.routePathStore!.routePath!.routePathLinks!.forEach((link) => {
            link.positions
                .forEach(pos => bounds.extend(new L.LatLng(pos[0], pos[1])));
        });

        return bounds;
    }

    private setBounds = () => {
        const routePathStore = this.props.routePathStore!;

        if (routePathStore!.routePath) {
            // Only automatic refocus if user opened new routepath
            if (routePathStore!.routePath!.internalId !== this.state.focusedRoutePathId) {
                const bounds = this.calculateBounds();
                if (bounds.isValid()) {
                    this.props.mapStore!.setMapBounds(bounds);
                    this.setState({
                        focusedRoutePathId: routePathStore!.routePath!.internalId,
                    });
                }
            }
        } else if (this.state.focusedRoutePathId) {
            // Reset focused id if user clears the chosen routepath, if he leaves the routepathview
            this.setState({
                focusedRoutePathId: '',
            });
        }
    }

    private renderStartMarker = () => {
        if (this.props.toolbarStore!.isSelected(ToolbarTool.AddNewRoutePathLink)) {
            // Hiding start marker if we set target node adding new links.
            // Due to the UI otherwise getting messy
            return null;
        }

        const routePathLinks = this.props.routePathStore!.routePath!.routePathLinks;
        if (!routePathLinks || routePathLinks.length === 0 || !routePathLinks[0].startNode) {
            return null;
        }

        const coordinates = routePathLinks![0].startNode.coordinates;
        const latLng = L.latLng(coordinates.lat, coordinates.lon);
        return (
            <StartMarker
                latLng={latLng}
                color={MARKER_COLOR}
            />
        );
    }

    componentDidMount() {
        this.setBounds();
    }

    componentDidUpdate() {
        this.setBounds();
    }

    render() {
        if (!this.props.routePathStore!.routePath) return null;
        return (
            <>
                {this.renderRoutePathLinks()}
                { this.props.toolbarStore!.isSelected(ToolbarTool.AddNewRoutePathLink) &&
                    this.renderRoutePathLinkNeighbors()
                }
                {this.renderStartMarker()}
            </>
        );
    }
}

export default UpsertRoutePathLayer;