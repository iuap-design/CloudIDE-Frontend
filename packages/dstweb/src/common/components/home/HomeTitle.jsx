import React from 'react';
import { DatePicker, Tabs, Select } from 'antd';
import { Row, Col } from 'yxyweb/common/components/basic';
import moment from 'moment';
import * as  common from './HomeCommon'
const { RangePicker } = DatePicker;
const TabPane = Tabs.TabPane;

export default class HomeTitle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: props.title || "我的待办",
            RangePickerValue: [],
            onlyTtile: props.onlyTtile || false,
            haveAddress: props.haveAddress || false,//门店
            haveRankTab: props.haveRankTab || false,
            addressMultiple: props.addressMultiple || false,
            dataSource: props.dataSource || [],
            defaultStore: props.defaultStore || '全部'
        };
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.dataSource != this.state.dataSource && nextProps.dataSource)
            this.setState({dataSource: nextProps.dataSource})
    }
    onTabClick(e) {
        let startDate = common.getDate(e, '0');
        let endDate = common.getDate(e, '1');
        let lastStartDate = common.getDate('last' + e, '0');
        let lastEndDate = common.getDate('last' + e, '1');
        let date = [];
        date.push(moment(startDate, 'YYYY-MM-DD'));
        date.push(moment(endDate, 'YYYY-MM-DD'));
        if (this.props.onDateChange) {
            this.props.onDateChange([startDate, endDate, lastStartDate, lastEndDate],e);
        }
        this.setState({
            RangePickerValue: date
        });
    }
    // onDateChange(date, dateString) {
    //     let dateValue = [];
    //     if (dateString[0] !== "") {
    //         dateValue.push(moment(dateString[0], 'YYYY-MM-DD'));
    //         dateValue.push(moment(dateString[1], 'YYYY-MM-DD'));
    //     }

    //     if (this.props.onDateChange) {
    //         this.props.onDateChange([dateString[0], dateString[1]]);
    //     }
    //     this.setState({
    //         RangePickerValue: dateValue
    //     });
    // }
    onAddressChange(val) {
        if(this.props.onAddressChange){
            this.props.onAddressChange(val)
        }
    }
    onRankTabClick(val) {
        if(val=='店员'){
            this.setState({haveAddress:true})
        }else{
            this.setState({haveAddress:false})
        }
        if(this.props.onRankTabClick){
            this.props.onRankTabClick(val)
        }
    }
    getStores() {
        let storeArr = [];
        this.state.dataSource.unshift({store: '全部', store_name: '全部'})
        this.state.dataSource.forEach(ele=>{
            storeArr.push(<Select.Option value={ele.store}>{ele.store_name}</Select.Option>)
        })
        return storeArr
    }
    getContent() {
        let title = this.state.title;
        let value = this.state.RangePickerValue;
        if (value.length <= 0) {
            let startDate = common.getDate('week', 0);
            let endDate = common.getDate('week', 1);
            value.push(moment(startDate, 'YYYY-MM-DD'));
            value.push(moment(endDate, 'YYYY-MM-DD'));
        }
        if (this.state.onlyTtile) {
            return (
                <div className='home-title'>
                    <div className='home-title-left'>{title}</div>
                </div>
            )
        }
        let storeContent = this.getStores()
        return (
            <div className='home-title'>
                <div className='home-title-left'>{title}</div>

                <div className='home-title-right'>
                    <div style={{float:'left'}}>
                        {this.state.haveRankTab ?
                        <Tabs style={{float:'left'}} onTabClick={(e) => this.onRankTabClick(e)} defaultActiveKey="门店" size="small">
                                <TabPane tab="门店" key="门店"></TabPane>
                                <TabPane tab="店员" key="店员"></TabPane>
                                <TabPane tab="商品" key="商品"></TabPane>
                        </Tabs>:''
                        }
                        {this.state.haveAddress ?
                        <Select multiple={this.state.addressMultiple?true:false} style={{float:'left'}} defaultValue={this.state.defaultStore} style={{ width: 120 }} onChange={(val)=>this.onAddressChange(val)}>
                            {/*<Select.Option value="西单店">西单店</Select.Option>
                            <Select.Option value="三里屯店">三里屯店</Select.Option>
                            <Select.Option value="中关村店">中关村店</Select.Option>*/}
                            {storeContent}
                        </Select>
                         : ''}
                    </div>
                    <div className='home-title-date'>
                        {this.state.addressMultiple ?
                         <Tabs onTabClick={(e) => this.onTabClick(e)} defaultActiveKey="seven" size="small">
                            <TabPane tab='近7天' key='seven'></TabPane>
                            <TabPane tab='近30天' key='thirty'></TabPane>
                            <TabPane tab='近90天' key='ninety'></TabPane>
                        </Tabs>
                        :
                         <Tabs onTabClick={(e) => this.onTabClick(e)} defaultActiveKey="yesterday" size="small">
                            <TabPane tab='昨天' key='yesterday'></TabPane>
                            <TabPane tab='近7天' key='seven'></TabPane>
                            <TabPane tab='近30天' key='thirty'></TabPane>
                            <TabPane tab='更多' key='more'></TabPane>
                        </Tabs>
                        }
                    </div>
                    {/*<div className='home-title-picker'>
                        <RangePicker onChange={(date, dateString) => this.onDateChange(date, dateString)} value={value} format={'YYYY-MM-DD'} />
                    </div>*/}
                </div>
            </div>
        );
    }
    render() {
        let content = this.getContent();
        return (
            <div>
                {content}
            </div>
        )
    }
}
