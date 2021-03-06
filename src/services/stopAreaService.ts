import { ApolloQueryResult } from 'apollo-client';
import EndpointPath from '~/enums/endpointPath';
import StopAreaFactory from '~/factories/stopAreaFactory';
import ApolloClient from '~/helpers/ApolloClient';
import IStopArea from '~/models/IStopArea';
import ITerminalArea from '~/models/ITerminalArea';
import IExternalStopArea from '~/models/externals/IExternalStopArea';
import IExternalTerminalArea from '~/models/externals/IExternalTerminalArea';
import HttpUtils from '~/utils/HttpUtils';
import GraphqlQueries from './graphqlQueries';

class StopAreaService {
    public static fetchStopArea = async (stopAreaId: string): Promise<IStopArea | null> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getStopAreaQuery(),
            variables: { stopAreaId },
        });
        const externalStopArea: IExternalStopArea = queryResult.data.stopArea;
        return externalStopArea ? StopAreaFactory.mapExternalStopArea(externalStopArea) : null;
    };

    public static fetchAllStopAreas = async (): Promise<IStopArea[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllStopAreas(),
        });
        const externalStopAreas: IExternalStopArea[] = queryResult.data.node.nodes;
        return externalStopAreas.map((externalStopArea) =>
            StopAreaFactory.mapExternalStopArea(externalStopArea)
        );
    };

    public static updateStopArea = async (stopArea: IStopArea) => {
        await HttpUtils.updateObject(EndpointPath.STOP_AREA, stopArea);
    };

    public static createStopArea = async (stopArea: IStopArea) => {
        const stopAreaId = await HttpUtils.createObject(EndpointPath.STOP_AREA, stopArea);
        return stopAreaId;
    };

    public static fetchAllTerminalAreas = async (): Promise<ITerminalArea[]> => {
        const queryResult: ApolloQueryResult<any> = await ApolloClient.query({
            query: GraphqlQueries.getAllTerminalAreas(),
        });

        const terminalAreas: ITerminalArea[] = queryResult.data.node.nodes.map(
            (externalTerminalArea: IExternalTerminalArea) => {
                return {
                    id: externalTerminalArea.termid,
                    name: externalTerminalArea.nimi,
                };
            }
        );

        return terminalAreas;
    };
}

export default StopAreaService;
