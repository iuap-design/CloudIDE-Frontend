import React, { Component } from "react";
import { Router,Switch,withRouter } from "mirrorx";
import { Transition,TransitionGroup,CSSTransition} from 'react-transition-group'
import LayoutHeader from './LayoutHeader';
import Sidebar from './Sidebar/index.js';
import "./index.less";
import "./animation.css";


class MainLayout extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {location,Routes} = this.props;

        const currentKey = location.pathname.split('/')[1] || '/'
        const timeout = { enter: 500, exit: 500 }
        return (

            <div className="honey-container">
                {/*{ (__MODE__ == "development") ?  <Sidebar /> : "" }*/}
                <div className="page-layout">
                    {/*{ (__MODE__ == "development") ? <LayoutHeader /> : "" }*/}

                    <TransitionGroup component="main" className="page-main">
                        <CSSTransition key={currentKey} timeout={timeout} classNames="fade" appear>
                            <Switch location={location}>
                                <Routes />
                            </Switch>
                        </CSSTransition>
                    </TransitionGroup>
                </div>
            </div>

        );
    }
}

export default  withRouter(MainLayout)