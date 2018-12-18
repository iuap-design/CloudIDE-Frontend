import React, {Component} from 'react';
import {actions} from 'mirrorx';
import {Button} from 'tinper-bee';

import './index.less';

class Standard extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    handleClick = async () => {
        await actions.helloworld.loadData();
        alert(this.props.helloMsg);
    }

    componentDidMount() {
        
    }

    render() {

        return (
            <div >
               <Button className="mt20 ml20" colors="primary" onClick={ this.handleClick }>点击测试</Button>
            </div>
        )
    }
}

export default Standard;
