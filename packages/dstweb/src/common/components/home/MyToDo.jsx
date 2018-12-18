import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SvgIcon from 'SvgIcon';
import { execHandler } from 'yxyweb/common/redux/tree';

export class Mytodo extends Component {
  getMytodo() {
    const { todoList } = this.props.home;
    if (!todoList)
      return null;
    const todos = [];
    todoList.forEach(item => {
      const { caption, icon, menuCode, condition, count } = item;
      todos.push(<li>
        <div onClick={() => this.handleClick(menuCode, condition)} className="home-my-con">
          <i><SvgIcon type={icon} /></i>
          <div>
            <h4>{caption}</h4>
            <p>{count}</p>
          </div>
        </div>
      </li>)
    });
    return (
      <div className='home-panel home-my-panel'>
        <ul className='home-panel-1' style={{ 'cursor': 'pointer' }}>
          {todos}
        </ul>
      </div>
    )
  }
  handleClick(menuCode, condition) {
    this.props.execHandler(menuCode, { condition });
  }
  render() {
    let control = this.getMytodo();
    return control;
  }
}
function mapStateToProps(state) {
  return {
    home: state.home.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    execHandler: bindActionCreators(execHandler, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Mytodo);
