import { reaction, IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { IoIosRadioButtonOn } from 'react-icons/io';
import { TiLink } from 'react-icons/ti';
import ToggleView, { ToggleItem } from '~/components/shared/ToggleView';
import NodeType from '~/enums/nodeType';
import { INode, IRoutePath, IRoutePathLink } from '~/models';
import { CodeListStore } from '~/stores/codeListStore';
import { ErrorStore } from '~/stores/errorStore';
import { MapStore } from '~/stores/mapStore';
import { RoutePathLayerStore } from '~/stores/routePathLayerStore';
import { RoutePathLinkMassEditStore } from '~/stores/routePathLinkMassEditStore';
import { ListFilter, RoutePathStore } from '~/stores/routePathStore';
import { ToolbarStore } from '~/stores/toolbarStore';
import RoutePathUtils from '~/utils/RoutePathUtils';
import RoutePathLinkMassEditView from './RoutePathLinkMassEditView';
import RoutePathListLink from './RoutePathListLink';
import RoutePathListNode from './RoutePathListNode';
import s from './routePathLinksTab.scss';

interface IRoutePathLinksTabProps {
    routePath: IRoutePath;
    isEditingDisabled: boolean;
    routePathStore?: RoutePathStore;
    routePathLayerStore?: RoutePathLayerStore;
    routePathLinkMassEditStore?: RoutePathLinkMassEditStore;
    mapStore?: MapStore;
    codeListStore?: CodeListStore;
    toolbarStore?: ToolbarStore;
    errorStore?: ErrorStore;
}

@inject(
    'routePathStore',
    'routePathLayerStore',
    'routePathLinkMassEditStore',
    'mapStore',
    'codeListStore',
    'toolbarStore',
    'errorStore'
)
@observer
class RoutePathLinksTab extends React.Component<IRoutePathLinksTabProps> {
    private extendedItemListener: IReactionDisposer;
    listObjectReferences: { [id: string]: React.RefObject<HTMLDivElement> } = {};

    constructor(props: IRoutePathLinksTabProps) {
        super(props);
        this.listObjectReferences = {};
        this.extendedItemListener = reaction(
            () => this.props.routePathLayerStore!.extendedListItemId,
            this.onListItemExtend
        );
    }

    componentWillUnmount() {
        this.extendedItemListener();
    }

    private onListItemExtend = () => {
        const extendedListItemId = this.props.routePathLayerStore!.extendedListItemId;
        if (extendedListItemId) {
            this.scrollIntoListItem(extendedListItemId);
        }
    };

    private scrollIntoListItem = (listItemId: string) => {
        const item = this.listObjectReferences[listItemId].current!;
        if (item) {
            // use setTimeout so that listItem will be extended before scrolling to get the final positioning better
            setTimeout(() => {
                item.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 25);
        }
    };

    private isNodeVisible = (node: INode) => {
        if (node.type === NodeType.STOP) {
            return !this.props.routePathStore!.listFilters.includes(ListFilter.stop);
        }
        return !this.props.routePathStore!.listFilters.includes(ListFilter.otherNodes);
    };

    private areLinksVisible = () => {
        return !this.props.routePathStore!.listFilters.includes(ListFilter.link);
    };

    private toggleListFilter = (listFilter: ListFilter) => {
        this.props.routePathStore!.toggleListFilter(listFilter);
    };

    private renderRpListNode = ({
        routePathLink,
        node,
        isFirstNode,
        isLastNode,
        key,
    }: {
        routePathLink: IRoutePathLink;
        node: INode;
        isFirstNode: boolean;
        isLastNode: boolean;
        key: string;
    }) => {
        const routePathLayerStore = this.props.routePathLayerStore!;
        const routePathLinkMassEditStore = this.props.routePathLinkMassEditStore!;

        const routePath = this.props.routePathStore!.routePath;
        const isStartNodeUsingBookSchedule = isLastNode
            ? routePath!.isStartNodeUsingBookSchedule
            : routePathLink.isStartNodeUsingBookSchedule;
        const startNodeBookScheduleColumnNumber = isLastNode
            ? routePath!.startNodeBookScheduleColumnNumber
            : routePathLink.startNodeBookScheduleColumnNumber;
        return (
            <div key={key} ref={this.listObjectReferences[node.internalId]}>
                <RoutePathListNode
                    node={node}
                    routePathLink={routePathLink}
                    isEditingDisabled={this.props.isEditingDisabled}
                    isFirstNode={isFirstNode}
                    isLastNode={isLastNode}
                    isHighlightedByTool={routePathLayerStore.toolHighlightedNodeIds.includes(
                        node.internalId
                    )}
                    isExtended={routePathLayerStore.extendedListItemId === node.internalId}
                    isHovered={routePathLayerStore.hoveredItemId === node.internalId}
                    isStartNodeUsingBookSchedule={isStartNodeUsingBookSchedule}
                    startNodeBookScheduleColumnNumber={startNodeBookScheduleColumnNumber}
                    selectedRoutePathLinkIndex={routePathLinkMassEditStore!.getSelectedRoutePathLinkIndex(
                        routePathLink
                    )}
                />
            </div>
        );
    };

    private renderRpListLink = ({
        routePathLink,
        key,
    }: {
        routePathLink: IRoutePathLink;
        key: string;
    }) => {
        const routePathLayerStore = this.props.routePathLayerStore!;
        return (
            <div key={key} ref={this.listObjectReferences[routePathLink.id]}>
                <RoutePathListLink
                    routePathLink={routePathLink}
                    isExtended={routePathLayerStore.extendedListItemId === routePathLink.id}
                    isHovered={routePathLayerStore.hoveredItemId === routePathLink.id}
                />
            </div>
        );
    };

    render() {
        const routePathLinks = this.props.routePath.routePathLinks;
        if (!routePathLinks) return null;

        const listFilters = this.props.routePathStore!.listFilters;
        const coherentRoutePathLinksList = RoutePathUtils.getCoherentRoutePathLinksList(
            routePathLinks
        );
        return (
            <div className={s.routePathLinksTabView}>
                <ToggleView>
                    <ToggleItem
                        icon={<IoIosRadioButtonOn />}
                        text='Pysäkit'
                        isActive={!listFilters.includes(ListFilter.stop)}
                        onClick={() => this.toggleListFilter(ListFilter.stop)}
                    />
                    <ToggleItem
                        icon={<IoIosRadioButtonOn />}
                        text='Muut solmut'
                        isActive={!listFilters.includes(ListFilter.otherNodes)}
                        onClick={() => this.toggleListFilter(ListFilter.otherNodes)}
                    />
                    <ToggleItem
                        icon={<TiLink />}
                        text='Linkit'
                        isActive={!listFilters.includes(ListFilter.link)}
                        onClick={() => this.toggleListFilter(ListFilter.link)}
                        data-cy='linksToggle'
                    />
                </ToggleView>
                <div className={s.listHeader}>
                    <div className={s.name}>Nimi</div>
                    <div className={s.hastusId}>Hastus id</div>
                    <div className={s.longId}>Pitkä id</div>
                    <div className={s.shortId}>Lyhyt id</div>
                    <div className={s.via}>Määränpää</div>
                    <div className={s.via}>Määränpää kilpi</div>
                </div>
                <div className={s.listWrapper}>
                    <div className={s.list}>
                        {coherentRoutePathLinksList.map((routePathLinks) => {
                            return routePathLinks.map((routePathLink, index) => {
                                const startNode = routePathLink.startNode;
                                const endNode = routePathLink.endNode;
                                // Use node.internalId as key instead of id because there might be nodes with the same id
                                this.listObjectReferences[startNode.internalId] = React.createRef();
                                this.listObjectReferences[routePathLink.id] = React.createRef();
                                const result = [
                                    this.isNodeVisible(startNode)
                                        ? this.renderRpListNode({
                                              routePathLink,
                                              node: routePathLink.startNode,
                                              isFirstNode: index === 0,
                                              isLastNode: false,
                                              key: `${routePathLink.id}-${index}-startNode`,
                                          })
                                        : null,
                                    this.areLinksVisible()
                                        ? this.renderRpListLink({
                                              routePathLink,
                                              key: `${routePathLink.id}-${index}-link`,
                                          })
                                        : null,
                                ];

                                if (index === routePathLinks.length - 1) {
                                    if (this.isNodeVisible(endNode)) {
                                        // Use node.internalId as key instead of id because there might be nodes with the same id
                                        this.listObjectReferences[
                                            endNode.internalId
                                        ] = React.createRef();
                                        result.push(
                                            this.renderRpListNode({
                                                routePathLink,
                                                node: routePathLink.endNode,
                                                isFirstNode: false,
                                                isLastNode: true,
                                                key: `${routePathLink.id}-${index}-endNode`,
                                            })
                                        );
                                    }
                                }
                                return result;
                            });
                        })}
                    </div>
                </div>
                <RoutePathLinkMassEditView
                    isEditingDisabled={this.props.isEditingDisabled}
                    routePathLinks={
                        this.props.routePathLinkMassEditStore!.selectedMassEditRoutePathLinks
                    }
                />
            </div>
        );
    }
}

export default RoutePathLinksTab;
