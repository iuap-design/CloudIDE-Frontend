import React, { Component } from "react";
import Form from "bee-form";
import { Menu } from "tinper-bee";
import  { actions, NavLink, Link } from 'mirrorx'
import classNames from 'classnames'

import URLConfig from '../config'
import './index.less';

const SubMenu = Menu.SubMenu;
const SideContainer = Menu.SideContainer;

const getURLList = (data) => {
  let list = data.map((item, index) => {
    return (
      <li key={index} className="index-li">
        <Link to={item.url}>{item.name}</Link>
      </li>
    );
  });

  return <ul className="index-ul">{ list }</ul>
};

export default class Siderbar extends Component {

    constructor(props, context) {
      super(props, context);
      this.state = {
        selectedkey: 1,
        expanded: false,
        currentArray: [],
        openKeys: [],
        menu:[]
      }
      this.myfilter = this.myfilter.bind(this);
    }

    componentWillMount() {

    }


    handleSelect(index) {
      this.setState({selectedkey: index});
    }

    onToggle(value) {
      this.setState({expanded: value});
    }

    handleClick(e) {
      this.setState({current: e.key});
    }
    onOpenChange(openKeys) {
        const props = this.props;
      actions.sidebar.setExpanded(true);
      const latestOpenKey = this.myfilter(openKeys,props.openKeys);
      const latestCloseKey = this.myfilter(props.openKeys,openKeys);

      let nextOpenKeys = [];

      if (latestOpenKey) {
        nextOpenKeys = this.getAncestorKeys(latestOpenKey).concat(latestOpenKey);
      }
      if (latestCloseKey) {
        nextOpenKeys = this.getAncestorKeys(latestCloseKey);
      }
      // this.setState({
      //   current:openKeys,
      //   submenuSelected:openKeys,
      //   openKeys: nextOpenKeys,
      //   expanded:false
      // });
        actions.sidebar.setOpenKeys(nextOpenKeys);

    }
    //IE下 array.find（）方法不可用
    myfilter(arr1,arr2) {
      if(arr2.length == 0 || !arr2) {
        return arr1[0];
      }

      for(var i=0;i<arr1.length;i++)
      {
        if(arr2.indexOf(arr1[i].toString())==-1)
        {
          return arr1[i];
        }
      }
      return false;
    }
    getAncestorKeys(key) {

      const map = {
        "子项": ['组织2'],
      };

      return map[key] || [];
    }

    getMenuList = (menus) => {
      return menus.map(function (item) {

        let blank = item.openview=="blank"?"_blank":"";


        if(Array.isArray(item.children)&&item.children.length>0){
          let list = [];
          let title = (<a href="javascript:;"><i className={'icon '+item.icon}></i><span>{item.name}</span></a>);
          item.children.map(function(it){
            
            list.push(<Menu.Item key={it.id}>
              <NavLink key={it.id} to={it.location}>{it.name}</NavLink>
            </Menu.Item>)
          });

          return (
            <SubMenu key={item.id} children={item.children} title={title}>
              {list}
            </SubMenu>
          )
        }
        else {
          let title = (<a target={blank} href={'#'+item.location}><i className={'icon '+item.icon}></i><span>{item.name}</span></a>);
          return (
            <Menu.Item key={item.id} >{title}</Menu.Item>
          )
        }
      })
    }

    render() {
      let {expanded,openKeys} = this.props;

      return (
        <div className={classNames({ 'sidebar-contanier':true,'sidebar-expanded': expanded })}>
          <div className="sider-menu">
            <div className="logo-box">
              <a href="#/">
                <span className="logo uf uf-tinperzch-col"></span>
                <h1>iuap 应用平台</h1>
              </a>
            </div>
            <SideContainer onToggle={this.onToggle.bind(this)}  expanded={this.state.expanded}>
              <Menu mode="inline"
                className="wrapper-menu"
                openKeys={openKeys}
                selectedKeys={[this.state.current]}
                onOpenChange={this.onOpenChange.bind(this)}
                onClick={this.handleClick.bind(this)}>
                { this.getMenuList(URLConfig) }
              </Menu>
            </SideContainer>
          </div>
        </div>
      )
    }
  }