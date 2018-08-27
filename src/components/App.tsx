import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { LoginStore } from '../stores/loginStore';
import { SidebarStore } from '../stores/sidebarStore';
import Button from './controls/Button';
import ButtonType from '../enums/buttonType';
import Modal from './Modal';
import Login from './login/Login';
import Map from './map/Map';
import Sidebar from './sidebar/Sidebar';
import NodeWindow from './NodeWindow';
import * as s from './app.scss';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

interface IAppState {
    showLogin: boolean;
}

interface IAppProps {
    loginStore?: LoginStore;
    sidebarStore?: SidebarStore;
}

@inject('sidebarStore')
@inject('loginStore')
@observer
class App extends React.Component<IAppProps, IAppState> {

    private openLoginForm = () => {
        this.props.loginStore!.showLogin = true;
    }

    private closeLoginModal = () => {
        this.props.loginStore!.showLogin = false;
    }

    private closeNodeWindow = () => {
        this.props.sidebarStore!.setOpenedNodeId(null);
    }

    public render(): any {
        console.log(this.props);
        return (
            <BrowserRouter>
              <div className={s.appView}>
                <Map/>
                <Button
                    onClick={this.openLoginForm}
                    className={s.loginButton}
                    type={ButtonType.SECONDARY}
                    text='Kirjaudu'
                />
                <Modal
                    closeModal={this.closeLoginModal}
                    isVisible={this.props.loginStore!.showLogin}
                >
                    <Login />
                </Modal>
                <Modal
                    closeModal={this.closeNodeWindow}
                    isVisible={this.props.sidebarStore!.showNodeWindow}
                >
                    <NodeWindow />
                </Modal>
                {/*<Sidebar />*/}
                <Route component={Sidebar} />
              </div>
            </BrowserRouter>
        );
    }
}

export default App;
