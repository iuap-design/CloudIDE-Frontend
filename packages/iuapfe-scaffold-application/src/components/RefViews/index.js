
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// import RefWithInput from './RefCoreWithInput';

// import {RefTree} from 'ref-tree/';

import {RefMultipleTable,RefWithInput } from 'ref-multiple-table';

import 'ref-multiple-table/dist/index.css'; //职级样式
import 'ref-tree/dist/index.css'; // 部门样式

import {RefTree} from 'ref-tree';

// import {RefMultipleTable} from './ref-multiple-table';

// import './ref-multiple-table/index.css'; //职级样式
// import './ref-tree/index.css'; // 部门样式


function RefIuapDept(props){
    return (
        <RefWithInput
            style={{
            }}
            title={'部门'}
            searchable= {false}
            param= {
                {"refCode":"newdept"}
            }
            checkStrictly={true}
            disabled={false}
            displayField='{refname}'
            valueField='refpk'
            refModelUrl= {{
                treeUrl: '/newref/rest/iref_ctr/blobRefTree', //树请求
            }}
            matchUrl='/newref/rest/iref_ctr/matchPKRefJSON'
            filterUrl='/newref/rest/iref_ctr/filterRefJSON'
            {...props}
        >
            <RefTree />
        </RefWithInput>
    )
}
function RefWalsinLevel(props){
    return (
        <RefWithInput
            title= '职级'
            backdrop = {false}
            param = {{//url请求参数
                    refCode:'post_level',//test_common||test_grid||test_tree||test_treeTable
                }}
            refModelUrl = {{
                tableBodyUrl:'/iuap_walsin_demo/common-ref/blobRefTreeGrid',//表体请求
                refInfo:'/iuap_walsin_demo/common-ref/refInfo',//表头请求
            }}
            matchUrl='/iuap_walsin_demo/common-ref/matchPKRefJSON'
            filterUrl='/iuap_walsin_demo/common-ref/filterRefJSON'
            valueField="refpk"
            displayField="{refcode}"
            {...props}
        >
            <RefMultipleTable />
        </RefWithInput>
    )
}



export {RefIuapDept, RefWalsinLevel};

