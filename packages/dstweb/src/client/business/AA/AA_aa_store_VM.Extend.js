﻿
cb.define(['common/common_VM.Extend.js'], function (common) {
	var AA_aa_store_VM_Extend = {
		doAction: function (name, viewmodel) {
			if (this[name])
				this[name](viewmodel);
		},
		init: function (viewmodel) {
			var self = this;
			common.initRegionAndPosition(viewmodel);
			viewmodel.get("storeArea").setState("min", 0);
			viewmodel.get("storeArea").setState("max", 999999.99);

			//业务设置
			viewmodel.get("suitableStoreOfAlipay").setState('multiple', false);
			viewmodel.get("SuitableStoreOfWeChat").setState('multiple', false);
			viewmodel.get("AdjacentStores").setState('multiple', false);
			viewmodel.get("Stores").setState('multiple', false);

			//门店经营范围
			viewmodel.get("productsOfStore_name").on('beforeBrowse', function (data) {
				//	debugger;
				// var condition = {
				// 	"isExtend": true,
				// 	simpleVOs: []
				// };
				var storeType = viewmodel.get("storeType").getValue();
				if (storeType == null) {
					cb.utils.alert("请先选择门店类型！");
					return false;
				} else if (storeType == 3) { //如果为加盟店
					//客户操作员，那么客户必输
					var userType = cb.rest.AppContext.user.userType;
					if(userType == 2 || userType == 3){
						var cust = viewmodel.get("cust").getValue();
						if (cust == null || cust == ""){
							cb.utils.alert("客户不能为空！");
							return false;
						}
					}else{
						return false;
					}
				}

				// if (storeType == 1 || storeType == 2) { //直营店或直营专柜，出非客户的门店经营范围
				// 	condition.simpleVOs.push({
				// 		field: 'cust',
				// 		op: 'is_null'
				// 	});
				// } else if (storeType == 3) { //加盟店，只出当前客户下的门店经营范围
				// 	condition.simpleVOs.push({
				// 		field: 'cust',
				// 		op: 'eq',
				// 		value1: viewmodel.get("cust").getValue()
				// 	});
				// }
				// data.context.setFilter(condition);
			});
			//支付宝配置
			viewmodel.get("suitableStoreOfAlipay").on('beforeBrowse', function (data) {
				//	debugger;
				var condition = {
					"isExtend": true,
					simpleVOs: []
				};
				var storeType = viewmodel.get("storeType").getValue();
				if (storeType == null) {
					cb.utils.alert("请先选择门店类型！");
					return false;
				} else if (storeType == 3) { //如果为加盟店
					//客户操作员，那么客户必输
					var userType = cb.rest.AppContext.user.userType;
					if(userType == 2 || userType == 3){
						var cust = viewmodel.get("cust").getValue();
						if (cust == null || cust == ""){
							cb.utils.alert("客户不能为空！");
							return false;
						}
					}
				}

				if (storeType == 1 || storeType == 2) { //直营店或直营专柜，出非客户的支付宝配置
					condition.simpleVOs.push({
						field: 'cust',
						op: 'is_null'
					});
				} else if (storeType == 3) { //加盟店，只出当前客户下的支付宝配置
					condition.simpleVOs.push({
						field: 'cust',
						op: 'eq',
						value1: viewmodel.get("cust").getValue()
					});
				}
				this.setFilter(condition);
			});
			//微信配置
			viewmodel.get("SuitableStoreOfWeChat").on('beforeBrowse', function (data) {
				//	debugger;
				var condition = {
					"isExtend": true,
					simpleVOs: []
				};
				var storeType = viewmodel.get("storeType").getValue();
				if (storeType == null) {
					cb.utils.alert("请先选择门店类型！");
					return false;
				} else if (storeType == 3) { //如果为加盟店
					//客户操作员，那么客户必输
					var userType = cb.rest.AppContext.user.userType;
					if(userType == 2 || userType == 3){
						var cust = viewmodel.get("cust").getValue();
						if (cust == null || cust == ""){
							cb.utils.alert("客户不能为空！");
							return false;
						}
					}
				}

				if (storeType == 1 || storeType == 2) { //直营店或直营专柜，出非客户的微信配置
					condition.simpleVOs.push({
						field: 'cust',
						op: 'is_null'
					});
				} else if (storeType == 3) { //加盟店，只出当前客户下的微信配置
					condition.simpleVOs.push({
						field: 'cust',
						op: 'eq',
						value1: viewmodel.get("cust").getValue()
					});
				}
				this.setFilter(condition);
			});
			//周边门店组
			viewmodel.get("AdjacentStores").on('beforeBrowse', function (data) {
				//	debugger;
				var condition = {
					"isExtend": true,
					simpleVOs: []
				};
				var storeType = viewmodel.get("storeType").getValue();
				if (storeType == null) {
					cb.utils.alert("请先选择门店类型！");
					return false;
				} else if (storeType == 3) { //如果为加盟店
					//客户操作员，那么客户必输
					var userType = cb.rest.AppContext.user.userType;
					if(userType == 2 || userType == 3){
						var cust = viewmodel.get("cust").getValue();
						if (cust == null || cust == ""){
							cb.utils.alert("客户不能为空！");
							return false;
						}
					}
				}

				if (storeType == 1 || storeType == 2) { //直营店或直营专柜，出非客户的周边门店组
					condition.simpleVOs.push({
						field: 'cust',
						op: 'is_null'
					});
				} else if (storeType == 3) { //加盟店，只出当前客户下的周边门店组
					condition.simpleVOs.push({
						field: 'cust',
						op: 'eq',
						value1: viewmodel.get("cust").getValue()
					});
				}
				this.setFilter(condition);
			});
			//操作员
			viewmodel.get("stores").on('beforeBrowse', function (data) {
				//	debugger;
				var condition = {
					"isExtend": true,
					simpleVOs: []
				};
				var storeType = viewmodel.get("storeType").getValue();
				if (storeType == null) {
					cb.utils.alert("请先选择门店类型！");
					return false;
				} else if (storeType == 3) { //如果为加盟店，那么客户必输
					var cust = viewmodel.get("cust").getValue();
					if (cust == null || cust == "") {
						cb.utils.alert("请先选择客户！");
						return false;
					}
				}

				if (storeType == 1 || storeType == 2) { //直营店或直营专柜，出非客户的操作员
					condition.simpleVOs.push({
						field: 'cust',
						op: 'is_null'
					});
				} else if (storeType == 3) { //加盟店，只出当前客户下的操作员
					condition.simpleVOs.push({
						field: 'cust',
						op: 'eq',
						value1: viewmodel.get("cust").getValue()
					});
				}
				//不等于当前操作员
				condition.simpleVOs.push({
					field: 'id',
					op: 'neq',
					value1: cb.rest.AppContext.user.id
				});
				//usertype<>0
				condition.simpleVOs.push({
					field: 'userType',
					op: 'neq',
					value1: 0
				});
				condition.simpleVOs.push({
					field: 'userType',
					op: 'neq',
					value1: -1
				});
				
				this.setFilter(condition);
			});
			//店员
			viewmodel.get("operatorStore").on('beforeBrowse', function (data) {
				//	debugger;
				var condition = {
					"isExtend": true,
					simpleVOs: []
				};
				condition.simpleVOs.push({
					field: 'iStatus',
					op: 'eq',
					value1: 1
				});
				// var userStores = cb.rest.AppContext.user.userStores;
				// var stores = [];
				// if(userStores.length > 0){
				// 	for(var i = 0; i < userStores.length; i++){
				// 		stores[i] = userStores[i].store
				// 	}
				// }
				// condition.simpleVOs.push({
				// 	field: 'operatorStore.iStoreId',
				// 	op: 'in',
				// 	value1: stores
				// });
				var storeType = viewmodel.get("storeType").getValue();
				if (storeType == null) {
					cb.utils.alert("请先选择门店类型！");
					return false;
				} else if (storeType == 3) { //如果为加盟店
					//客户操作员，那么客户必输
					var userType = cb.rest.AppContext.user.userType;
					if(userType == 2 || userType == 3){
						var cust = viewmodel.get("cust").getValue();
						if (cust == null || cust == ""){
							cb.utils.alert("客户不能为空！");
							return false;
						}
					}
				}

				if (storeType == 1 || storeType == 2) { //直营店或直营专柜，出非客户的店员
					condition.simpleVOs.push({
						field: 'cust',
						op: 'is_null'
					});
				} else if (storeType == 3) { //加盟店，只出当前客户下的店员
					condition.simpleVOs.push({
						field: 'cust',
						op: 'eq',
						value1: viewmodel.get("cust").getValue()
					});
				}
				this.setFilter(condition);
			});
			//收款方式
			viewmodel.get("paymentMethodStore").on('beforeBrowse', function (data) {
				//	debugger;
				var condition = {
					"isExtend": true,
					simpleVOs: []
				};
				condition.simpleVOs.push({
					field: 'enableState',
					op: 'eq',
					value1: 'enable'
				});
				this.setFilter(condition);
			});
			//班次组
			viewmodel.get("Stores").on('beforeBrowse', function (data) {
				//	debugger;
				var condition = {
					"isExtend": true,
					simpleVOs: []
				};
				var storeType = viewmodel.get("storeType").getValue();
				if (storeType == null) {
					cb.utils.alert("请先选择门店类型！");
					return false;
				} else if (storeType == 3) { //如果为加盟店
					//客户操作员，那么客户不能为空
					var userType = cb.rest.AppContext.user.userType;
					if(userType == 2 || userType == 3){
						var cust = viewmodel.get("cust").getValue();
						if (cust == null || cust == ""){
							cb.utils.alert("客户不能为空！");
							return false;
						}
					}
				}

				if (storeType == 1 || storeType == 2) { //直营店或直营专柜，出非客户的店员
					condition.simpleVOs.push({
						field: 'cust',
						op: 'is_null'
					});
				} else if (storeType == 3) { //加盟店，只出当前客户下的店员
					condition.simpleVOs.push({
						field: 'cust',
						op: 'eq',
						value1: viewmodel.get("cust").getValue()
					});
				}
				this.setFilter(condition);
			});

			var warehouseModel = viewmodel.get("warehouses");
			if (viewmodel.getParams().mode === 'browse') {
				self.formatter(viewmodel);
				warehouseModel.on('afterSetColumns', function () {
					self.formatter(viewmodel);
				});
			}
			viewmodel.on('beforeSave', function (args) {
				//保存前判断是否已经设置默认仓库
				var rows = warehouseModel.getRows();
				var existDefault = false;
				rows.forEach(function (item, index) {
					var isdefault = item.isDefault;
					if (isdefault == 1) {
						existDefault = true;
						return;
					}
				})
				if (existDefault == false) {
					cb.utils.alert("请设置默认仓库！");
					return false;
				}
				//保存前判断营业时间的 开始时间<结束时间
				var startTime = viewmodel.get('startTime').getValue();
				var endTime = viewmodel.get('endTime').getValue();
				if (startTime >= endTime) {
					cb.utils.alert("营业时间不合法！");
					return false;
				}

			});
			//填写完门店名称后，自动填充门店助记码
			viewmodel.get("name").on('afterValueChange', function (data) {
				var name = viewmodel.get("name").getValue();
				if (name) {
					var mnemonicCode = common.getMnemonicCode(name); //得到数组
					var mnemonicCodeStr = "";
					for (var i = 0; i < mnemonicCode.length; i++) {
						var str = mnemonicCode[i] + ",";
						mnemonicCodeStr += str;

					}
					mnemonicCodeStr = mnemonicCodeStr.substring(0, mnemonicCodeStr.length - 1);
					viewmodel.get("mnemonic").setValue(mnemonicCodeStr);
				} else {
					viewmodel.get("mnemonic").setValue("");
				}
			});

			//选择部门之前，如果没有选择组织，提示请先选择
			viewmodel.get("dept_name").on('beforeBrowse', function (data) {
				var org = viewmodel.get("org_name").getValue();
				if (org == null || org == "") {
					cb.utils.alert("请先选择组织！");
					return false;
				} else {
					viewmodel.get('dept_name').setDisabled(false);
				}
			});
			viewmodel.get('org_name').on('afterValueChange', function (args) {
				viewmodel.get("dept").setValue(null);
				viewmodel.get("dept_name").setValue(null);

				var userType = cb.rest.AppContext.user.userType;
				if (userType != 2 && userType != 3) {
					viewmodel.get("cust").setValue(null);
					viewmodel.get("cust_name").setValue(null);
				}
				var org = viewmodel.get("org_name").getValue();
				if (org == null || org == "") {
					viewmodel.get('dept_name').setDisabled(true);
					viewmodel.get('cust_name').setDisabled(true);
				} else {
					viewmodel.get('dept_name').setDisabled(false);
					viewmodel.get('cust_name').setDisabled(false);
				}
				warehouseModel.setColumnValue("warehouse_name", null);
				warehouseModel.setColumnValue("warehouse", null);
			});

			//选择客户收货地址之前，如果没有选择所属客户，提示请先选择
			viewmodel.get("custShippingAddress_cAddress").on('beforeBrowse', function (data) {
				var cust = viewmodel.get("cust").getValue();
				if (cust == null || cust == "") {
					cb.utils.alert("请先选择所属客户！");
					return false;
				} else {
					viewmodel.get('custShippingAddress_cAddress').setDisabled(false);
				}
			});
			//客户变化以后清空收货地址、仓库
			viewmodel.get('cust_name').on('afterValueChange', function (args) {
				viewmodel.get("custShippingAddress").setValue(null);
				viewmodel.get("custShippingAddress_cAddress").setValue(null);
				warehouseModel.setColumnValue("warehouse_name", null);
				warehouseModel.setColumnValue("warehouse", null);
				var cust = viewmodel.get("cust").getValue();
				if (cust == null || cust == "") {
					viewmodel.get('custShippingAddress_cAddress').setDisabled(true);
				} else {
					//可编辑
					viewmodel.get('custShippingAddress_cAddress').setDisabled(false);
					//设置默认收货地址.   不设置默认值了
					//					var custid = viewmodel.get("cust").getValue();
					//					if(custid != null && custid != undefined && custid !== '') {
					//						var proxy = cb.rest.DynamicProxy.create({
					//							ensure: {
					//								url: "/uorder/bill/ref/getDefaultAddress",
					//								method: 'POST'
					//							}
					//						});
					//						var params = {
					//							custid: custid
					//						};
					//						proxy.ensure(params, (err, result) => {
					//							if(err) {
					//								cb.utils.alert(err.message, 'error');
					//							}
					//
					//							if(result === undefined) {
					//								//没有查询到默认地址， 不报错
					//								//								cb.utils.alert("没有查询到当前选择店铺的仓库！", 'error');
					//							} else {
					//								if(result.id) {
					//									if(result.cAddress) {
					//										viewmodel.get('custShippingAddress_cAddress').setValue(result.id);
					//										viewmodel.get('custShippingAddress').setValue(result.address);
					//									}
					//								}
					//
					//							}
					//						});
					//					}

				}
			});

			//选择客户之前，如果没有选择组织，提示请先选择
			viewmodel.get("cust_name").on('beforeBrowse', function (data) {
				var org = viewmodel.get("org_name").getValue();
				if (org == null || org == "") {
					cb.utils.alert("请先选择组织！");
					return false;
				} else {
					viewmodel.get('cust_name').setDisabled(false);
				}
			});
			
			//门店类型变化以后，
			//如果是加盟店，客户和收货地址显示、必输，客户erp编码隐藏
			//直营店、直营专柜：客户erp编码显示、必输，客户和收货地址隐藏
			//清空仓库子表
			viewmodel.get('storeType').on('afterValueChange', function (args) {
				var storeType = viewmodel.get("storeType").getValue();
				if (storeType != null && storeType != undefined && storeType !== '') {
					if (storeType == 3) { //加盟店
						var userType = cb.rest.AppContext.user.userType;
						if (userType == 2 || userType == 3) {
							viewmodel.get("cust_name").setVisible(false);
							viewmodel.get("cust").setValue(cb.rest.AppContext.user.customer);
							
							//加盟店且客户操作员，可编辑
							viewmodel.get("Stores").setDisabled(false);
							// viewmodel.get("paymentMethodStore").setDisabled(false);
							viewmodel.get("operatorStore").setDisabled(false);
							viewmodel.get("suitableStoreOfAlipay").setDisabled(false);
							viewmodel.get("SuitableStoreOfWeChat").setDisabled(false);
							viewmodel.get("AdjacentStores").setDisabled(false);
							viewmodel.get("productsOfStore_name").setDisabled(false);
						} else {
							viewmodel.get("cust_name").setVisible(true);
							viewmodel.get('cust_name').setState('bIsNull', false);

							viewmodel.get("cust").setValue(null);

							//加盟店且租户操作员，不可编辑
							viewmodel.get("Stores").setDisabled(true);
							//viewmodel.get("stores").setDisabled(true);
							// viewmodel.get("paymentMethodStore").setDisabled(true);
							viewmodel.get("operatorStore").setDisabled(true);
							viewmodel.get("suitableStoreOfAlipay").setDisabled(true);
							viewmodel.get("SuitableStoreOfWeChat").setDisabled(true);
							viewmodel.get("AdjacentStores").setDisabled(true);
							viewmodel.get("productsOfStore_name").setDisabled(true);
						}

						viewmodel.get("custShippingAddress_cAddress").setVisible(true);
						viewmodel.get('custShippingAddress_cAddress').setState('bIsNull', false);

						viewmodel.get("customer").setVisible(false);
						viewmodel.get('customer').setState('bIsNull', true);
					} else if (storeType == 1 || storeType == 2) {
						viewmodel.get("customer").setVisible(true);
						viewmodel.get('customer').setState('bIsNull', true);

						viewmodel.get('cust_name').setVisible(false);
						viewmodel.get('cust_name').setState('bIsNull', true);

						viewmodel.get('custShippingAddress_cAddress').setVisible(false);
						viewmodel.get('custShippingAddress_cAddress').setState('bIsNull', true);

						viewmodel.get("cust").setValue(null);
						viewmodel.get("custShippingAddress").setValue(null);


						//直营店或直营专柜，可编辑
						viewmodel.get("Stores").setDisabled(false);
						// viewmodel.get("paymentMethodStore").setDisabled(false);
						viewmodel.get("operatorStore").setDisabled(false);
						viewmodel.get("suitableStoreOfAlipay").setDisabled(false);
						viewmodel.get("SuitableStoreOfWeChat").setDisabled(false);
						viewmodel.get("AdjacentStores").setDisabled(false);
						viewmodel.get("productsOfStore_name").setDisabled(false);
					}
				}
				warehouseModel.setColumnValue("warehouse_name", null);
				warehouseModel.setColumnValue("warehouse", null);
			});

			viewmodel.on("afterEdit", function (data) {
				viewmodel.get('storeType').setDisabled(true);
				debugger
				//如果是客户操作员，那么门店类型设置为加盟店且不可编辑,隐藏客户编码和客户，显示收货地址参照并且必输
				var userType = cb.rest.AppContext.user.userType;
				var storeType= viewmodel.get('storeType').getValue();
				if (userType == 2 || userType == 3) {
					viewmodel.get("storeType").setValue(3);
					// viewmodel.get('storeType').setDisabled(true);

					viewmodel.get("cust_name").setVisible(false);
					viewmodel.get("cust").setValue(cb.rest.AppContext.user.customer);

					viewmodel.get("custShippingAddress_cAddress").setVisible(true);
					viewmodel.get('custShippingAddress_cAddress').setState('bIsNull', false);

					viewmodel.get("customer").setVisible(false);
					viewmodel.get('customer').setState('bIsNull', true);

					viewmodel.get('suitableStoreOfAlipay').setDisabled(false);
					viewmodel.get('SuitableStoreOfWeChat').setDisabled(false);
					viewmodel.get('AdjacentStores').setDisabled(false);
					viewmodel.get('Stores').setDisabled(false);
					viewmodel.get('operatorStore').setDisabled(false);
					viewmodel.get("productsOfStore_name").setDisabled(false);
				}else if(userType <= 1 && storeType == 3){
					// viewmodel.get("storeType").setValue(1);
					
					viewmodel.get('suitableStoreOfAlipay').setDisabled(true);
					viewmodel.get('SuitableStoreOfWeChat').setDisabled(true);
					viewmodel.get('AdjacentStores').setDisabled(true);
					viewmodel.get('Stores').setDisabled(true);
					viewmodel.get('operatorStore').setDisabled(true);
					viewmodel.get("productsOfStore_name").setDisabled(true);
				}
			});

			viewmodel.on('afterLoadData', function (data) {
				if (viewmodel.getParams().mode !== 'browse') {
					viewmodel.get('dept_name').setDisabled(data.org_name ? false : true);
					viewmodel.get('cust_name').setDisabled(data.org_name ? false : true);

					//如果是客户操作员，那么收货地址允许编辑，否则，选择了客户才允许编辑
					var userType = cb.rest.AppContext.user.userType;
					if (userType == 2 || userType == 3) {
						viewmodel.get('custShippingAddress_cAddress').setDisabled(false);
					} else {
						viewmodel.get('custShippingAddress_cAddress').setDisabled(data.cust_name ? false : true);
					}

				}
				var userType = cb.rest.AppContext.user.userType;
				if (viewmodel.getParams().mode == 'add') {
					//如果是客户操作员，那么门店类型设置为加盟店且不可编辑,隐藏客户编码和客户，显示收货地址参照并且必输
					if (userType == 2 || userType == 3) {
						viewmodel.get("storeType").setValue(3);
						viewmodel.get('storeType').setDisabled(true);

						viewmodel.get("cust_name").setVisible(false);
						viewmodel.get("cust").setValue(cb.rest.AppContext.user.customer);

						viewmodel.get("custShippingAddress_cAddress").setVisible(true);
						viewmodel.get('custShippingAddress_cAddress').setState('bIsNull', false);

						viewmodel.get("customer").setVisible(false);
						viewmodel.get('customer').setState('bIsNull', true);
					}
				}
				//已经开店的门店，不允许修改门店类型和组织
				//				if(viewmodel.get("openShop").getValue() == 1) {
				//					viewmodel.get("storeType").setReadOnly(true);
				//					viewmodel.get("org_name").setReadOnly(true);
				//				}
				var storeType = viewmodel.get("storeType").getValue();
				if (storeType != null && storeType != undefined && storeType !== '') {
					if (storeType == 3) { //加盟店
						if (userType == 2 || userType == 3) {
							viewmodel.get("cust_name").setVisible(false);
							viewmodel.get("cust").setValue(cb.rest.AppContext.user.customer);
							viewmodel.get("productsOfStore_name").setDisabled(false);
						} else {
							viewmodel.get("cust_name").setVisible(true);
							viewmodel.get('cust_name').setState('bIsNull', false);
							viewmodel.get("productsOfStore_name").setDisabled(true);
						}

						viewmodel.get("custShippingAddress_cAddress").setVisible(true);
						viewmodel.get('custShippingAddress_cAddress').setState('bIsNull', false);

						viewmodel.get("customer").setVisible(false);
						viewmodel.get('customer').setState('bIsNull', true);
					} else if (storeType == 1 || storeType == 2) {
						viewmodel.get("customer").setVisible(true);
						viewmodel.get('customer').setState('bIsNull', true);

						viewmodel.get('cust_name').setVisible(false);
						viewmodel.get('cust_name').setState('bIsNull', true);

						viewmodel.get('custShippingAddress_cAddress').setVisible(false);
						viewmodel.get('custShippingAddress_cAddress').setState('bIsNull', true);

						viewmodel.get("productsOfStore_name").setDisabled(false);
					}
				} else {
					viewmodel.get("customer").setVisible(true);
					viewmodel.get('customer').setState('bIsNull', true);

					viewmodel.get('cust_name').setVisible(false);
					viewmodel.get('cust_name').setState('bIsNull', true);

					viewmodel.get('custShippingAddress_cAddress').setVisible(false);
					viewmodel.get('custShippingAddress_cAddress').setState('bIsNull', true);

					viewmodel.get("productsOfStore_name").setDisabled(true);
				}
			})

			//已经开店且仓库存入数据库的仓库行不允许删除
			//			viewmodel.on('beforeDeleteRow', function(args) {
			//				debugger
			//				var openshop = viewmodel.get("openShop").getValue();
			//				var warehouses = viewmodel.get("warehouses").getData();
			//				var currentRowIndex = args.params.params.index;
			//				if(openshop == 1 && warehouses[currentRowIndex]._status != "Insert") {
			//					cb.utils.alert("已开店不允许删除仓库！");
			//					return false;
			//				}
			//			});



			if (warehouseModel) {
				//这一段没有起作用，是在浏览态模板上吧字段去掉的
				var mode = viewmodel.getParams().mode;
				if (mode == 'browse') {
					warehouseModel.setColumnState('isDefault', 'visible', false);
				} else {
					warehouseModel.setColumnState('isDefault', 'visible', true);
				}
				warehouseModel.on("modeChange", function (data) {
					if (data == 'browse') {
						warehouseModel.setColumnState('isDefault', 'visible', false);
					} else {
						warehouseModel.setColumnState('isDefault', 'visible', true);
					}
				});
				warehouseModel.on('beforeBrowse', function (data) {
					//	debugger;
					if (data) {
						switch (data.cellName) {
							case "warehouse_name":
								//选择仓库之前需要先选择组织
								var org = viewmodel.get("org_name").getValue();
								if (org == null) {
									cb.utils.alert("请先选择组织！");
									return false;
								}
								//选择仓库之前需要先选择门店类型
								var storeType = viewmodel.get("storeType").getValue();
								if (storeType == null) {
									cb.utils.alert("请先选择门店类型！");
									return false;
								} else if (storeType == 3) { //如果为加盟店，那么客户必输
									var cust = viewmodel.get("cust").getValue();
									if (cust == null || cust == "") {
										cb.utils.alert("请先选择客户！");
										return false;
									}
								}

								//如果已开店且当前行不是insert，那么不能修改
								//								var openshop = viewmodel.get("openShop").getValue();
								//								var warehouses= warehouseModel.getData();
								//								var currentIndex = data.rowIndex;
								//								if(openshop == 1 && warehouses[currentIndex]._status != "Insert"){
								//									cb.utils.alert("已开店不允许修改仓库！");
								//									return false;
								//								}

								//参照面板中只显示门店仓和当前界面未被选择的仓库
								//1.过滤非门店仓
								var condition = {
									"isExtend": true,
									simpleVOs: []
								};
								condition.simpleVOs.push({
									field: 'wStore',
									op: 'eq',
									value1: true
								});
								//2.已选择的仓库不再在参照面板中出现
								var rows = warehouseModel.getRows();
								var warehouseids = [];
								rows.forEach(function (item, index) {
									if (data.rowIndex === index) return;
									if (item.warehouse_name === undefined) return;
									if (item.warehouse) {
										warehouseids.push(item.warehouse);
									}

								})
								if (warehouseids.length > 0) {
									condition.simpleVOs.push({
										field: 'id',
										op: 'nin',
										value1: warehouseids
									});
								}
								//3.根据门店类型和客户id过滤仓库
								if (storeType == 1 || storeType == 2) { //直营店或直营专柜，出非客户的仓库
									condition.simpleVOs.push({
										field: 'cust',
										op: 'is_null'
									});
								} else if (storeType == 3) { //加盟店，只出当前客户下的仓库
									condition.simpleVOs.push({
										field: 'cust',
										op: 'eq',
										value1: viewmodel.get("cust").getValue()
									});
								}
								data.context.setFilter(condition);
								break;
						}
					}

				});

				//增行时第一行的是否默认为是
				warehouseModel.on('beforeInsertRow', function (data) {
					if (data.index == 0) {
						debugger
						data.row.isDefault.value = 1;
						data.row.isDefault.text = "是";
					}
				});

				//默认仓库设置
				warehouseModel.on('afterCellValueChange', function (data) {
					switch (data.cellName) {
						case "isDefault":
							{
								if (data.value.value == 1) //当默认选择是的情况下，处理所有其他行为否，并且设置主表默认仓库id
								{
									if (this.getCellValue(data.rowIndex, 'warehouse')) //判断当前行仓库是否没有填写
									{
										viewmodel.get("warehouse").setValue(this.getCellValue(data.rowIndex, 'warehouse'));
										var length = this.getRows().length;
										for (var i = 0; i < length; i++) {
											if (i != data.rowIndex) {
												this.setCellValue(i, 'isDefault', 0);
											}
										}
									}
								}
								break;
							}
						case "warehouse_name":
							{
								if (this.getCellValue(data.rowIndex, 'warehouse_name')) {
									if (this.getCellValue(data.rowIndex, 'isDefault') == 1) {
										viewmodel.get("warehouse").setValue(this.getCellValue(data.rowIndex, 'warehouse'));
									}
								} else {
									this.setCellValue(data.rowIndex, 'warehouse', null)
								}
								break;
							}
					}

				});
			}

		},
		//		beforeDeleteRow: function(viewmodel, openshop, warehouse) {
		//			if(openshop == 1) {
		//				if(warehouse) {
		//					cb.utils.alert("已开店不允许删除仓库！");
		//					return false;
		//				}
		//			}
		//		},
		formatter: function (viewmodel) {
			var warehouseModel = viewmodel.get('warehouses');
			warehouseModel.setColumnState('warehouse_name', 'formatter', function (rowInfo, rowData) {
				var isDefault = warehouseModel.getCellValue(rowInfo.rowIndex, 'isDefault');
				if (isDefault)
					return {
						html: '<span class="red-circle m-l-10">默认</span>'
					};
			});
		}
	}
	try {
		module.exports = AA_aa_store_VM_Extend;
	} catch (error) {

	}
	return AA_aa_store_VM_Extend;
});