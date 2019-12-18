import classnames from 'classnames';
import * as L from 'leaflet';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { match } from 'react-router';
import { Button } from '~/components/controls';
import { IDropdownItem } from '~/components/controls/Dropdown';
import SavePrompt, { ISaveModel } from '~/components/overlays/SavePrompt';
import Loader from '~/components/shared/loader/Loader';
import ButtonType from '~/enums/buttonType';
import NodeMeasurementType from '~/enums/nodeMeasurementType';
import NodeType from '~/enums/nodeType';
import TransitType from '~/enums/transitType';
import NodeFactory from '~/factories/nodeFactory';
import { ILink, INode } from '~/models';
import navigator from '~/routing/navigator';
import QueryParams from '~/routing/queryParams';
import routeBuilder from '~/routing/routeBuilder';
import SubSites from '~/routing/subSites';
import LinkService from '~/services/linkService';
import NodeService from '~/services/nodeService';
import { AlertStore } from '~/stores/alertStore';
import { CodeListStore } from '~/stores/codeListStore';
import { ConfirmStore } from '~/stores/confirmStore';
import { ErrorStore } from '~/stores/errorStore';
import { MapStore } from '~/stores/mapStore';
import { INodeCacheObj, NodeStore } from '~/stores/nodeStore';
import NodeLocationType from '~/types/NodeLocationType';
import EventManager from '~/util/EventManager';
import { createDropdownItems } from '~/util/dropdownHelpers';
import SidebarHeader from '../SidebarHeader';
import NodeForm from './NodeForm';
import StopView from './StopView';
import * as s from './nodeView.scss';

interface INodeViewProps {
    isNewNode: boolean;
    match?: match<any>;
    alertStore?: AlertStore;
    nodeStore?: NodeStore;
    mapStore?: MapStore;
    errorStore?: ErrorStore;
    codeListStore?: CodeListStore;
    confirmStore?: ConfirmStore;
}

interface INodeViewState {
    isLoading: boolean;
    nodeIdSuffixOptions: IDropdownItem[];
    isNodeIdSuffixQueryLoading: boolean;
}

@inject('alertStore', 'nodeStore', 'mapStore', 'errorStore', 'codeListStore', 'confirmStore')
@observer
class NodeView extends React.Component<INodeViewProps, INodeViewState> {
    private _isMounted: boolean;
    constructor(props: INodeViewProps) {
        super(props);
        this.state = {
            isLoading: true,
            nodeIdSuffixOptions: [],
            isNodeIdSuffixQueryLoading: false
        };
    }

    private _setState = (newState: object) => {
        if (this._isMounted) {
            this.setState(newState);
        }
    };

    async componentDidMount() {
        this._isMounted = true;
        const params = this.props.match!.params.id;
        this._setState({ isLoading: true });
        this.props.nodeStore!.setIsNodeIdEditable(false);
        if (this.props.isNewNode) {
            await this.createNewNode(params);
        } else {
            await this.initExistingNode(params);
        }
        this._setState({ isLoading: false });
        this.props.nodeStore!.setIsEditingDisabled(!this.props.isNewNode);
        EventManager.on('geometryChange', () => this.props.nodeStore!.setIsEditingDisabled(false));
    }

    async componentDidUpdate(prevProps: INodeViewProps) {
        const params = this.props.match!.params.id;
        if (prevProps.match!.params.id !== params) {
            this._setState({ isLoading: true });
            this.props.nodeStore!.setIsNodeIdEditable(false);
            if (this.props.isNewNode) {
                await this.createNewNode(params);
            } else {
                await this.initExistingNode(params);
            }
            this._setState({ isLoading: false });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.props.nodeStore!.clear();
        this.props.mapStore!.setSelectedNodeId(null);
        EventManager.off('geometryChange', () => this.props.nodeStore!.setIsEditingDisabled(false));
    }

    private createNewNode = async (params: any) => {
        const createNode = async () => {
            const [lat, lng] = params.split(':');
            const coordinate = new L.LatLng(lat, lng);
            const node = NodeFactory.createNewNode(coordinate);
            this.centerMapToNode(node, []);
            const nodeId = await NodeService.fetchAvailableNodeId(node);
            if (!nodeId) {
                node.id = '';
                this.props.alertStore!.setNotificationMessage({
                    message:
                        'Solmun tunnuksen automaattinen generointi epäonnistui, koska aluedatasta ei löytynyt tarvittavia tietoja tai solmutunnusten avaruus on loppunut. Syötä solmun tunnus kenttään ensimmäiset 5 solmutunnuksen numeroa.'
                });
                this.props.nodeStore!.setIsNodeIdEditable(true);
            } else {
                node.id = nodeId;
            }
            this.props.nodeStore!.init({ node, links: [], isNewNode: true });
            this.updateSelectedStopAreaId();
        };

        const nodeCacheObj: INodeCacheObj | null = this.props.nodeStore!.getNewNodeCacheObj();
        if (nodeCacheObj) {
            this.showNodeCachePrompt({ nodeCacheObj, promptCancelCallback: createNode });
        } else {
            await createNode();
        }
        this._setState({ isLoading: false });
    };

    private initExistingNode = async (selectedNodeId: string) => {
        const nodeStore = this.props.nodeStore;
        this._setState({ isLoading: true });
        nodeStore!.clear();

        const _fetchNode = async () => {
            this.props.mapStore!.setSelectedNodeId(selectedNodeId);
            const node = await this.fetchNode(selectedNodeId);
            if (node) {
                const links = await this.fetchLinksForNode(node);
                if (links) {
                    this.initNode(node, links);
                }
            }
            this._setState({ isLoading: false });
        };

        const nodeCacheObj: INodeCacheObj | null = nodeStore!.getNodeCacheObjById(selectedNodeId);
        if (nodeCacheObj) {
            this.showNodeCachePrompt({
                nodeCacheObj,
                promptCancelCallback: async () => {
                    await _fetchNode();
                    this.updateSelectedStopAreaId();
                }
            });
        } else {
            await _fetchNode();
            this.updateSelectedStopAreaId();
        }
    };

    private initNode = (node: INode, links: ILink[], oldNode?: INode, oldLinks?: ILink[]) => {
        if (!this._isMounted) return;

        this.props.mapStore!.setSelectedNodeId(node.id);
        this.centerMapToNode(node, links);
        this.props.nodeStore!.init({ node, links, oldNode, oldLinks, isNewNode: this.props.isNewNode });
    };

    private async fetchNode(nodeId: string) {
        try {
            return await NodeService.fetchNode(nodeId);
        } catch (e) {
            this.props.errorStore!.addError('Solmun haku ei onnistunut', e);
            return null;
        }
    }

    private showNodeCachePrompt = ({
        nodeCacheObj,
        promptCancelCallback
    }: {
        nodeCacheObj: INodeCacheObj;
        promptCancelCallback: Function;
    }) => {
        const nodeStore = this.props.nodeStore;
        this.props.confirmStore!.openConfirm({
            content:
                'Välimuistista löytyi tallentamaton solmu. Palautetaanko tallentamattoman solmun tiedot ja jatketaan muokkausta?',
            onConfirm: async () => {
                this.initNode(
                    nodeCacheObj.node,
                    nodeCacheObj.links,
                    nodeCacheObj.oldNode,
                    nodeCacheObj.oldLinks
                );
                this.updateSelectedStopAreaId();
                this.queryAvailableNodeIdSuffixes(nodeCacheObj.node.id);
                nodeStore!.setIsNodeIdEditable(nodeCacheObj.isNodeIdEditable);
                nodeStore!.setIsEditingDisabled(false);
                this._setState({ isLoading: false });
            },
            onCancel: async () => await promptCancelCallback()
        });
    };

    private updateSelectedStopAreaId = () => {
        const stopAreaIdQueryParam = navigator.getQueryParam(QueryParams.stopAreaId);
        const stopAreaId = stopAreaIdQueryParam ? stopAreaIdQueryParam[0] : undefined;
        if (stopAreaId) {
            this.props.nodeStore!.updateStopProperty('stopAreaId', stopAreaId);
        }
    };

    private async fetchLinksForNode(node: INode) {
        try {
            return await LinkService.fetchLinksWithStartNodeOrEndNode(node.id);
        } catch (e) {
            this.props.errorStore!.addError(
                `Haku löytää linkkejä, joilla lnkalkusolmu tai lnkloppusolmu on ${
                    node.id
                } (soltunnus), ei onnistunut.`,
                e
            );
            return null;
        }
    }

    private centerMapToNode = (node: INode, links: ILink[]) => {
        let latLngs: L.LatLng[] = [node.coordinates, node.coordinatesProjection];
        links.forEach((link: ILink) => {
            latLngs = latLngs.concat(link.geometry);
        });
        const bounds = L.latLngBounds(latLngs);
        this.props.mapStore!.setMapBounds(bounds);
    };

    private save = async () => {
        this._setState({ isLoading: true });
        try {
            if (this.props.isNewNode) {
                let nodeToUpdate;
                if (this.props.nodeStore!.isNodeIdEditable) {
                    // Merge nodeId parts (5 num + 2 num) as a nodeId
                    nodeToUpdate = _.cloneDeep(this.props.nodeStore!.node);
                    const nodeId = nodeToUpdate.id + nodeToUpdate.idSuffix;
                    nodeToUpdate.id = nodeId;
                } else {
                    nodeToUpdate = this.props.nodeStore!.node;
                }
                const nodeId = await NodeService.createNode(nodeToUpdate);
                const url = routeBuilder
                    .to(SubSites.node)
                    .toTarget(':id', nodeId)
                    .toLink();
                navigator.goTo(url);
            } else {
                await NodeService.updateNode(
                    this.props.nodeStore!.node,
                    this.props.nodeStore!.getDirtyLinks()
                );
            }
            this.props.nodeStore!.clearNodeCache();
            this.props.nodeStore!.setCurrentStateAsOld();
            this.props.alertStore!.setFadeMessage({ message: 'Tallennettu!' });
        } catch (e) {
            this.props.errorStore!.addError(`Tallennus epäonnistui`, e);
        }

        if (this.props.isNewNode) return;
        this._setState({ isLoading: false });
        this.props.nodeStore!.setIsEditingDisabled(true);
    };

    private showSavePrompt = () => {
        const currentNode = _.cloneDeep(this.props.nodeStore!.node);
        const oldNode = _.cloneDeep(this.props.nodeStore!.oldNode);
        const currentStop = _.cloneDeep(currentNode.stop);
        const oldStop = _.cloneDeep(oldNode.stop);

        // Create node save model
        if (currentNode.stop) {
            delete currentNode['stop'];
            delete oldNode['stop'];
        }
        const saveModels: ISaveModel[] = [
            {
                newData: currentNode,
                oldData: oldNode,
                model: 'node'
            }
        ];

        // Create stop save model
        if (currentStop) {
            // Generate stopArea label values for savePrompt
            currentStop.stopAreaId = `${currentStop.stopAreaId} - ${currentStop.nameFi}`;
            if (oldStop && oldStop.stopAreaId) {
                oldStop.stopAreaId = `${oldStop.stopAreaId} - ${oldStop.nameFi}`;
            }
            const stopSaveModel: ISaveModel = {
                newData: currentStop!,
                oldData: oldStop!,
                model: 'stop'
            };
            saveModels.push(stopSaveModel);
        }

        this.props.confirmStore!.openConfirm({
            content: <SavePrompt saveModels={saveModels} />,
            onConfirm: () => {
                this.save();
            }
        });
    };

    private onNodeGeometryChange = (property: NodeLocationType, value: any) => {
        this.props.nodeStore!.updateNodeGeometry(property, value, NodeMeasurementType.Measured);
    };

    private onChangeNodeProperty = (property: keyof INode) => (value: any) => {
        this.props.nodeStore!.updateNodeProperty(property, value);
    };

    private onChangeNodeId = async (value: string) => {
        this.onChangeNodeProperty('id')(value);
        await this.queryAvailableNodeIdSuffixes(value);
    };

    private queryAvailableNodeIdSuffixes = async (beginningOfNodeId: string) => {
        if (beginningOfNodeId.length === 5) {
            this._setState({
                isNodeIdSuffixQueryLoading: true
            });
            const availableNodeIds = await NodeService.fetchAvailableNodeIdsWithPrefix(beginningOfNodeId);
            // slide(-2): get last two letters of a nodeId
            const nodeIdSuffixList = availableNodeIds.map((nodeId: string) => nodeId.slice(-2));
            this._setState({
                nodeIdSuffixOptions: createDropdownItems(nodeIdSuffixList),
                isNodeIdSuffixQueryLoading: false
            });
            this.onChangeNodeProperty('idSuffix')('');
        } else {
            if (this.state.nodeIdSuffixOptions.length > 0) {
                this._setState({
                    nodeIdSuffixOptions: []
                });
            }
        }
    }

    private latChange = (previousLatLng: L.LatLng, coordinateType: NodeLocationType) => (
        value: string
    ) => {
        const lat = Number(value);
        if (lat === previousLatLng.lat) return;
        this.onNodeGeometryChange(coordinateType, new L.LatLng(lat, previousLatLng.lng));
    };

    private lngChange = (previousLatLng: L.LatLng, coordinateType: NodeLocationType) => (
        value: string
    ) => {
        const lng = Number(value);
        if (lng === previousLatLng.lng) return;
        this.onNodeGeometryChange(coordinateType, new L.LatLng(previousLatLng.lat, lng));
    };

    private toggleTransitType = async (type: TransitType) => {
        const nodeStore = this.props.nodeStore!;
        const transitType = nodeStore.node.stop?.transitType;
        if (transitType === type) {
            this.props.nodeStore!.updateStopProperty('transitType', undefined);
        } else {
            this.props.nodeStore!.updateStopProperty('transitType', type);
        }
        if (nodeStore!.isNodeIdEditable) return;

        this._setState({ isLoading: true });
        const nodeId = await NodeService.fetchAvailableNodeId(nodeStore.node);
        nodeStore.updateNodeProperty('id', nodeId);
        this._setState({ isLoading: false });
    };

    render() {
        const nodeStore = this.props.nodeStore!;
        const node = nodeStore.node;
        if (this.state.isLoading) {
            return (
                <div className={classnames(s.nodeView, s.loaderContainer)}>
                    <Loader />
                </div>
            );
        }
        // TODO: show some indicator to user of an empty page
        if (!node) return null;

        const isNewNode = this.props.isNewNode;
        const isEditingDisabled = nodeStore.isEditingDisabled;
        const isNodeIdEditable = nodeStore.isNodeIdEditable;
        const invalidPropertiesMap = nodeStore.nodeInvalidPropertiesMap;
        const isNodeFormInvalid = !nodeStore.isNodeFormValid;
        const isStopFormInvalid = node.type === NodeType.STOP && !nodeStore.isStopFormValid;
        const isSaveButtonDisabled =
            isEditingDisabled || !nodeStore.isDirty || isNodeFormInvalid || isStopFormInvalid;

        return (
            <div className={s.nodeView}>
                <div className={s.content}>
                    <SidebarHeader
                        isEditButtonVisible={!isNewNode}
                        shouldShowClosePromptMessage={nodeStore.isDirty}
                        isEditing={!isEditingDisabled}
                        onEditButtonClick={nodeStore.toggleIsEditingDisabled}
                    >
                        {isNewNode ? 'Luo uusi solmu' : `Solmu ${node.id}`}
                    </SidebarHeader>
                    <NodeForm
                        node={node}
                        isNewNode={isNewNode}
                        isEditingDisabled={isEditingDisabled}
                        isNodeIdEditable={isNodeIdEditable}
                        invalidPropertiesMap={invalidPropertiesMap}
                        nodeIdSuffixOptions={this.state.nodeIdSuffixOptions}
                        isNodeIdSuffixQueryLoading={this.state.isNodeIdSuffixQueryLoading}
                        onChangeNodeId={this.onChangeNodeId}
                        onChangeNodeProperty={this.onChangeNodeProperty}
                        lngChange={this.lngChange}
                        latChange={this.latChange}
                    />
                    {node.type === NodeType.STOP && node.stop && (
                        <StopView
                            node={node}
                            toggleTransitType={this.toggleTransitType}
                            onNodePropertyChange={this.onChangeNodeProperty}
                            isNewStop={isNewNode}
                            nodeInvalidPropertiesMap={invalidPropertiesMap}
                        />
                    )}
                </div>
                <Button
                    type={ButtonType.SAVE}
                    disabled={isSaveButtonDisabled}
                    onClick={() => (isNewNode ? this.save() : this.showSavePrompt())}
                >
                    {isNewNode ? 'Luo uusi solmu' : 'Tallenna muutokset'}
                </Button>
            </div>
        );
    }
}

export default NodeView;
