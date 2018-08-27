import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import observableLoginStore from './stores/loginStore';
import observableMapStore from './stores/mapStore';
import observableLineStore from './stores/lineStore';
import observableRouteStore from './stores/routeStore';
import observableSidebarStore from './stores/sidebarStore';
import apolloClient from './util/ApolloClient';
import './index.scss';

configure({ enforceActions: 'strict' });

const stores = {
    mapStore: observableMapStore,
    lineStore: observableLineStore,
    loginStore: observableLoginStore,
    routeStore: observableRouteStore,
    sidebarStore: observableSidebarStore,
};

ReactDOM.render(
        <Provider
            {...stores}
        >
            <ApolloProvider client={apolloClient}>
                <App/>
            </ApolloProvider>
        </Provider>,
        document.getElementById('root') as HTMLElement,
);
