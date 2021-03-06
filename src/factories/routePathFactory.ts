import TransitType from '~/enums/transitType';
import { IRoutePath, IRoutePathLink } from '~/models';
import IExternalRoutePath from '~/models/externals/IExternalRoutePath.ts';
import IExternalRoutePathLink from '~/models/externals/IExternalRoutePathLink.ts';
import HashUtils from '~/utils/HashUtils';
import RoutePathLinkFactory from './routePathLinkFactory';

class RoutePathFactory {
    public static mapExternalRoutePath = ({
        externalRoutePath,
        externalRoutePathLinks,
        lineId,
        transitType,
    }: {
        externalRoutePath: IExternalRoutePath;
        externalRoutePathLinks?: IExternalRoutePathLink[];
        lineId?: string;
        transitType?: TransitType;
    }): IRoutePath => {
        const internalRoutePathId = HashUtils.getHashFromString(
            [
                externalRoutePath.reitunnus,
                externalRoutePath.suuvoimast,
                externalRoutePath.suusuunta,
            ].join('-')
        ).toString();

        let routePathLinks: IRoutePathLink[] = [];
        if (externalRoutePathLinks) {
            routePathLinks = externalRoutePathLinks
                .map((externalRoutePathLink: IExternalRoutePathLink) => {
                    return RoutePathLinkFactory.mapExternalRoutePathLink(externalRoutePathLink);
                })
                .sort((a, b) => a.orderNumber - b.orderNumber);
        }

        const exceptionPath = externalRoutePath.poikkeusreitti
            ? externalRoutePath.poikkeusreitti
            : '0';

        return {
            exceptionPath,
            lineId,
            transitType,
            routePathLinks,
            routeId: externalRoutePath.reitunnus,
            direction: externalRoutePath.suusuunta,
            startDate: new Date(externalRoutePath.suuvoimast),
            internalId: internalRoutePathId,
            nameFi: externalRoutePath.suunimi,
            nameSw: externalRoutePath.suunimir,
            endDate: new Date(externalRoutePath.suuvoimviimpvm),
            modifiedOn: externalRoutePath.suuviimpvm
                ? new Date(externalRoutePath.suuviimpvm)
                : undefined,
            modifiedBy: externalRoutePath.suukuka,
            isVisible: false,
            originFi: externalRoutePath.suulahpaik,
            originSw: externalRoutePath.suulahpaikr,
            destinationFi: externalRoutePath.suupaapaik,
            destinationSw: externalRoutePath.suupaapaikr,
            shortNameFi: externalRoutePath.suunimilyh,
            shortNameSw: externalRoutePath.suunimilyhr,
            length: externalRoutePath.suupituus,
            isStartNodeUsingBookSchedule: externalRoutePath.kirjaan === '1',
            startNodeBookScheduleColumnNumber: externalRoutePath.kirjasarake,
        };
    };

    public static createNewRoutePath(
        lineId: string,
        routeId: string,
        transitType: TransitType
    ): IRoutePath {
        const defaultDate = new Date();
        defaultDate.setHours(0, 0, 0, 0);
        defaultDate.setDate(defaultDate.getDate() + 1);

        return {
            lineId,
            routeId,
            transitType,
            internalId: '',
            nameFi: '',
            nameSw: '',
            direction: '',
            isVisible: true,
            startDate: new Date(defaultDate.getTime()),
            endDate: new Date(defaultDate.getTime()),
            modifiedOn: new Date(),
            routePathLinks: [],
            originFi: '',
            originSw: '',
            destinationFi: '',
            destinationSw: '',
            shortNameFi: '',
            shortNameSw: '',
            modifiedBy: '',
            length: 0,
            exceptionPath: '0',
            isStartNodeUsingBookSchedule: false,
            startNodeBookScheduleColumnNumber: undefined,
        };
    }
}

export default RoutePathFactory;
