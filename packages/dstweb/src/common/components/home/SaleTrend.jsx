import React from 'react';
import { Row, Col } from 'yxyweb/common/components/basic';
import { Icon, Tabs, Select, Button, Popover, Checkbox } from 'antd'
import HomeTitle from './HomeTitle';
import * as common from './HomeCommon';
import moment from 'moment';
//import ReactEcharts from 'echarts-for-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as homeactions from '../../redux/modules/home';

const TabPane = Tabs.TabPane;
import ReactEcharts from 'yxyweb/common/components/AsyncComponents/AsyncEchartsForReact'
// import ReactEcharts from 'echarts-for-react';

class SaleTrend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

      visible: false,
      // shops: JSON.parse(JSON.stringify(props.home.trend_showData)) || [],
      // copyShops: JSON.parse(JSON.stringify(props.home.trend_showData)) || [],
    };
    let defaultShops = props.showStore === false ? [] : [{
      store: props.user.storeId,
      store_name: props.user.defaultStore
    }]
    this.props.homeactions.setOptions({
      saleTrend_shops: JSON.parse(JSON.stringify(defaultShops)), // 临时勾选操作的门店
      saleTrend_copyShops: JSON.parse(JSON.stringify(defaultShops)),// 备份的门店
      saleTrend_showShops: JSON.parse(JSON.stringify(defaultShops)) // echart显示的门店
    })
    this.props.homeactions.getSaleTrendData({})
  }

  componentWillUnmount() {
    this._unmount = true
  }

  getOption() {
    let legendData = [], seriesData = [];
    let data = this.props.home.saleTrendData || [];
    let xAxisData = data.length > 0 ? data[0].dates : [];
    data.forEach(element => {
      let ele = {}, item = {
        type: 'line',
        symbol: 'emptyCircle',  //这句就是去掉曲线中点的,可以为true/false
        symbolSize: 6,
        smooth: true,  //这句就是让曲线变平滑的
        // stack: '总量',
        legendHoverLink: false,
      };
      ele.name = element.storeName;
      ele.textStyle = { width: '5px', height: '5px' };
      item.name = element.storeName;
      let accuracy = cb.rest.AppContext.option.amountofdecimal//金额
      element.saleMoneys.forEach((money, index) => {
        element.saleMoneys[index] = parseFloat(money).toFixed(accuracy)
      })
      item.data = element.saleMoneys;
      legendData.push(ele);
      seriesData.push(item)
    })
    let option = {
      // title: {
      //     text: '营销总额(万元)'
      // },
      tooltip: {
        trigger: 'axis'
      },
      color: ['#fc4c2f', '#588ce9', '#18b681'],//图例的颜色
      legend: {
        icon: 'circle',//图例图标的形状
        /*data: [
            { name: "三里屯店", textStyle: { width: '5px', height: '5px' } },
            { name: "西单店", textStyle: { width: '5px', height: '5px' } },
            { name: "中关村店", textStyle: { width: '5px', height: '5px' } }
        ],*/
        data: legendData,
        left: '80',//图例的定位,可以是百分比，像素值，left等
        top: '30',
        selectedMode: false,//图例的默认点击事件
        itemWidth: 8,
        itemGap: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        containLabel: true
      },
      toolbox: {
        // feature: {
        //     saveAsImage: {}
        // }
      },
      xAxis: {
        axisLine: { show: true, lineStyle: { width: 1, color: '#ccc' } },
        axisLabel: {
          textStyle: {
            color: '#999'
          }
        },
        type: 'category',
        boundaryGap: false,
        data: xAxisData
      },
      yAxis: {
        axisLine: { show: true, lineStyle: { width: 1, color: '#ccc' } },
        axisLabel: {
          textStyle: {
            color: '#999'
          }
        },
        type: 'value',

        // 控制网格线是否显示
        splitLine: {
          show: false
        },
        // 去除y轴上的刻度线
        // axisTick: {
        //     show: false
        // }
      },
      series: seriesData,
      /*series: [
          {
              name: '三里屯店',
              type: 'line',
              symbol: 'emptyCircle',  //这句就是去掉曲线中点的,可以为true/false
              symbolSize: 6,
              smooth: true,  //这句就是让曲线变平滑的
              stack: '总量',
              legendHoverLink: false,
              data: [120, 132, 101, 134, 890, 230, 210, 100, 800]
          },
          {
              name: '西单店',
              type: 'line',
              symbol: 'emptyCircle',  //这句就是去掉点的
              symbolSize: 6,
              smooth: true,  //这句就是让曲线变平滑的
              stack: '总量',
              legendHoverLink: false,
              data: [220, 182, 191, 234, 290, 330, 310, 102, 109]
          },
          {
              name: '中关村店',
              type: 'line',
              symbol: 'emptyCircle',  //这句就是去掉点的
              symbolSize: 6,
              smooth: true,  //这句就是让曲线变平滑的
              stack: '总量',
              legendHoverLink: false,
              data: [320, 332, 301, 334, 390, 330, 320, 201, 100]
          }
      ]*/
    };
    return option;
  }

  getCardContent() {
    let shops = this.props.home.saleTrend_shops || [];
    let allShopsData = this.props.user.showStore === false ? [] : (this.props.user.userStores || []);
    const getPopShops = (shops, currentShop) => {
      let isChecked = shops.filter(ele => {
        return ele.store == currentShop
      });
      if (isChecked && isChecked.length > 0) {
        return true
      } else {
        return false
      }
    }
    const currentData = (type, all) => {
      let findData = {};
      all.forEach(shop => {
        if (shop.store === type) findData = shop;
      })
      return findData
    }

    let arr = []
    allShopsData.forEach(element => {
      arr.push(
        <Row style={{ minHeight: "25px" }}>
          <div className='pull-left'>
            <Checkbox checked={getPopShops(shops, element.store)}
              onChange={(e) => this.selectShop(element.store, e, currentData(element.store, allShopsData))}>{element.store_name}</Checkbox>
          </div>
        </Row>
      )
    })

    return (
      <div className="filter-btn-fixed" style={{ overflow: "auto" }}>
        <div className='filter-txt'>
          {arr}
        </div>
        <div className='filter-btn-1'>
          <Button type={"primary"} size="small" onClick={() => this.popoverButtonClick('save')}>保存</Button>
          <Button type={"default"} size="small" onClick={() => this.popoverButtonClick('cancel')}>取消</Button>
        </div>

      </div>)
  }

  getTitle() {
    let cardContent = this.getCardContent()
    return (<div className='home-title'>
      <div className='home-title-left'>门店销售趋势</div>
      <div className='home-title-right'>
        <div style={{ float: 'left' }}>
          <Popover overlayClassName="saleTrend_popover" placement="bottom" content={cardContent} trigger="click"
            visible={this.state.visible} onVisibleChange={(visble) => this.onVisibleChange(visble)}>
            <Button>请选择门店</Button>
          </Popover>
        </div>
        <div className='home-title-date'>
          <Tabs onTabClick={(e) => this.onTabClick(e)} defaultActiveKey="seven" size="small">
            <TabPane tab='近7天' key='seven'></TabPane>
            <TabPane tab='近30天' key='thirty'></TabPane>
            <TabPane tab='近90天' key='ninety'></TabPane>
          </Tabs>
        </div>
      </div>
    </div>)
  }

  render() {
    let homeTitle = this.getTitle()
    let option = this.getOption();
    return (
      <div className='home-panel'>
        <Row colCount={6}>
          <Col span={6}>
            {/*<HomeTitle title="门店销售趋势" onDateChange={this.onDateChange} saleTrendShop={true} saleTrendChange={(shops)=>console.log(shops)} />*/}
            {homeTitle}
          </Col>
        </Row>
        <Row>
          <ReactEcharts
            option={option}
            notMerge={true}
            lazyUpdate={true}
            style={{ height: 350, width: '100%', marginTop: 0, marginBottom: 0 }}
            className='react_for_echarts' />
        </Row>
      </div>
    )
  }

  onTabClick(e) {
    let endDate = common.getDate(e, '0');
    let startDate = common.getDate(e, '1');
    let lastStartDate = common.getDate('last' + e, '0');
    let lastEndDate = common.getDate('last' + e, '1');
    let storeIdArr = this.props.home.storeIdArr;
    this.props.homeactions.getSaleTrendData({ store_id: storeIdArr, beginDate: startDate, endDate })
  }

  selectShop(type, e, currentData) {
    let shops = this.props.home.saleTrend_shops;
    if (e.target.checked === true) {
      let length = shops.length;
      if (length < 3) shops.push(currentData)
      if (length >= 3) {
        shops.push(currentData)
        shops.splice(0, 1)
      }
    }
    if (e.target.checked === false) {
      let index = '';
      shops.forEach((ele, i) => {
        if (ele.store === type) index = i;
      })
      index !== '' && shops.splice(index, 1);
    }
    // this.setState({ shops })
    this.props.homeactions.setOptions({ saleTrend_shops: shops })
  }

  popoverButtonClick(type) {
    // let { showShops, trend_showData } = this.reduxState();
    // let { shops, copyShops } = this.state;
    let shops = this.props.home.saleTrend_shops;
    let copyShops = this.props.home.saleTrend_copyShops;
    if (type == 'save') {
      // this.actions().setOptions({ trend_showData: shops })
      // this.setState({ copyShops: shops })
      let { saleTrend_beginData, saleTrend_endData } = this.props.home
      let now = new Date()
      let beginDate = saleTrend_beginData || new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6).format('yyyy-MM-dd');
      let endDate = saleTrend_endData || now.format('yyyy-MM-dd');
      let storeIdArr = [];
      shops.forEach(ele => {
        storeIdArr.push(ele.store)
      })
      this.props.homeactions.setOptions({ saleTrend_showShops: shops, saleTrend_copyShops: shops, storeIdArr })
      this.props.homeactions.getSaleTrendData({ store_id: storeIdArr, beginDate, endDate })
    } else {
      // this.actions().setOptions({ shops: trend_showData })
      // this.setState({ shops: copyShops });
      this.props.homeactions.setOptions({ saleTrend_showShops: copyShops, saleTrend_shops: copyShops })
    }
    this.setState({ visible: false })
  }

  onVisibleChange(visible) {
    this.setState({ visible })
  }
}

function mapStateToProps(state) {
  return {
    home: state.home.toJS(),
    user: state.user.toJS()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    homeactions: bindActionCreators(homeactions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SaleTrend);
