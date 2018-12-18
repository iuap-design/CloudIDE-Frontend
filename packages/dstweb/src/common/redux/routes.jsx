import React, { Component } from 'react'
import { Route, Switch } from 'react-router'
import { ConnectedRouter } from 'react-router-redux'

import * as Pages from '../containers'
import * as Components from '../components'

export class Router extends Component {
  render() {
    return (<ConnectedRouter history={this.props.history}>
      <Switch>
        <Route path="/login" component={Pages.LoginPage} />
        <Route path="/register" component={Pages.RegisterPage} />
        <Route path="/wechat" component={Pages.WeChatPage} />
        <Route path="/forget" component={Pages.ForgetPage} />
        <Route path="/expire" component={Pages.ExpirePage} />
        <Route path="/portal" component={Pages.DefaultPage} />
        <Route path="/test" component={Pages.TestPage} />
        <Route exact path="/meta/:billtype/:billno" component={Components.DynamicView} />
        <Route path="/meta/:billtype/:billno/:billid" component={Components.DynamicView} />
        <Route path="/echartcarousel" component={Pages.EChartCarousel} />
        <Route path="*" component={Pages.ErrorNotFoundPage} />
      </Switch>
    </ConnectedRouter>);
  }
}
