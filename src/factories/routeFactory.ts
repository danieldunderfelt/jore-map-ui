import { IRoute, IRoutePath, ILine } from '../models';
import RoutePathFactory from './routePathFactory';

class RouteFactory {
    public static reittiToIRoute = (reitti: any, line?: ILine): IRoute => {
        const routePaths:IRoutePath[]
            = reitti.reitinsuuntasByReitunnus.edges
                .map((routePath: any, index:number) => {
                    // By default make the first two routePaths visible
                    const isVisible = (index <= 1);

                    return RoutePathFactory.suuntaToIRoutePath(routePath.node, isVisible);
                });

        return <IRoute>{
            routePaths,
            line,
            routeName: reitti.reinimi,
            routeNameSwedish: reitti.reinimir,
            lineId: reitti.lintunnus,
        };
    }
}

export default RouteFactory;
