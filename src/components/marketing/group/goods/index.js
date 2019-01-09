import React, { Component } from "react";
import { connect } from "dva";
import { View } from "@/components/flexView";
import { Form, Input, Tabs, Button, Table, Divider, Select, Modal, Icon } from "antd";
import styles from "./index.css";
import router from "umi/router";
import Query from "@/utils/query";
import PageList from "@/components/pageList";
import Image from "@/components/image";

const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const Option = Select.Option

@connect(({ goods, loading }) => ({
    skuList: goods.skuList.result,
    skuListLoading: loading.effects["goods/skuList"]
}))
class Goods extends Component {
    static defaultProps = {
        skuListLoading: true,
        skuList: {
            list: [],
            total_number: 0
        }
    };
    componentDidMount() {
        this.initList();
    }
    initList = () => {
        const { dispatch, form } = this.props;
        if (form.getFieldValue('goods_info')&&form.getFieldValue('goods_info').id){
            dispatch({
                type: "goods/skuList",
                payload: {
                    page: 1,
                    rows: 100,
                    goods_id: form.getFieldValue('goods_info').id
                },
                callback: (res) => {
                    form.setFieldsValue({
                        group_goods: res.result.list
                    })
                }
            });
        }
    };
    render() {
        const groupInfo = this.props.groupInfo || {};
        console.log(groupInfo);
        const { form, formItemLayout, skuListLoading, skuList } = this.props;
        const { getFieldDecorator, getFieldValue } = form;
        return (
            <View>
                <h3>活动商品</h3>
                <FormItem
                    {...formItemLayout}
                    label="选择商品"
                >
                    {getFieldDecorator('goods_info', {
                        rules: [{ required: true, message: "请选择商品!" }],
                        initialValue: groupInfo.goods_info ? groupInfo.goods_info : null
                    })(
                        <AddGoods initList={this.initList}/>
                    )}
                </FormItem>
                {
                    getFieldValue('goods_info') ?
                        <FormItem
                            {...formItemLayout}
                            label="优惠设置"
                        >
                            {getFieldDecorator('group_goods', {
                                initialValue: skuList.list.length ? skuList.list : groupInfo.group_goods ? groupInfo.group_goods : []
                            })(
                                <GoodsSkuList 
                                    skuList={skuList.list}
                                    skuListLoading={skuListLoading}
                                />
                            )}
                        </FormItem> 
                        : null
                }
            </View>
        );
    }
}
export default Goods

class AddGoods extends Component {
    state = {
        visible: false
    }
    hideModal = () => {
        this.setState({
            visible: false
        })
    }
    render() {
        const { visible } = this.state
        const { onChange, value, initList } = this.props;
        return <View>
            <View
                className={styles.add}
                onClick={() => {
                    this.setState({
                        visible: true
                    })
                }}
            >
                {
                    value ? 
                    <View className={styles.imgWarp}>
                        <Image
                            type='goods'
                            src={value.img}
                            style={{ width: 72, height: 72 }}
                        />
                        <View className={styles.zhezhao}>
                            <span>替换</span>
                        </View>
                    </View> :
                    <Icon type="plus" style={{ color: "#b9b9b9" }}/>
                }
            </View>
            <Modal
                title="选择商品"
                visible={visible}
                onCancel={this.hideModal}
                width={960}
                footer={null}
            >
                <SelectableGoods
                    onOk={(goods_info) => {
                        console.log("goods_info", goods_info);
                        onChange(goods_info)
                        initList()
                        this.hideModal()
                    }}
                />
            </Modal>
        </View>
    }
}

@connect(({ goods, goodsCategory, group, loading }) => ({
    goodsList: goods.list.result,
    goodsListLoading: loading.effects["goods/list"],
    goodsCategory: goodsCategory.list.result,
    goodsCategoryLoading: loading.effects["goodsCategory/list"],
    selectableGoods: group.selectableGoods.result,
    selectableGoodsLoading: loading.effects["group/selectableGoods"]
}))
class SelectableGoods extends Component {
    static defaultProps = {
        goodsList: {
            list: [],
            total_number: 0
        },
        goodsListLoading: true,
        goodsCategory:{
            list:[]
        },
        goodsCategoryLoading: true,
        selectableGoodsLoading: true,
        selectableGoods: {
            list: [],
        }
    };
    state = {
        get: { page: 1, rows: 10 }
    }
    search = new PageList({
        router: "/marketing/group/add",
        rows: 10,
        refresh: (e) => {
            this.initList(e);
        }
    });
    componentDidMount() {
        this.initList();
    }
    initList() {
        const { dispatch, goodsCategory } = this.props;
        const get = Query.make([
            { key: "sale_state", rule: ["eq", "all"] },
            { key: "order_type", rule: ["eq", "all"] }
        ]);
        dispatch({
            type: "goods/list",
            payload: get,
            callback: (res) => {
                // console.log(res)
            }
        });
        dispatch({
            type: "goodsCategory/list",
        });
        dispatch({
            type: "group/selectableGoods",
        });
        this.setState({
            get
        });
    }
    render() {
        const { goodsListLoading, goodsList, goodsCategory, selectableGoods, onOk } = this.props;
        const { keywords, state } = this.search.getParam();
        const columns = [
            {
                title: "商品图",
                dataIndex: "img",
                render: (e) => (
                    <Image
                        type='goods'
                        src={e}
                        style={{ width: 50, height: 50 }}
                    />
                )
            }, {
                title: "商品标题",
                dataIndex: "title",
            }, {
                title: "价格（元）",
                dataIndex: "price",
            }, {
                title: "库存",
                dataIndex: "stock"
            }, {
                title: "SKU数量",
                dataIndex: "sku_list",
                render: text => <span>{text ? text.length : 0}</span>
            }, {
                title: "操作",
                key: "operation",
                render: (record) => record.selectable ? <Button
                    onClick={() => onOk(record)}
                >
                    选取
                </Button> : <span>不可选</span>
            }
        ]
        const selectableGoodsIds = selectableGoods.list.map(item=>item.id)
        const currentList = goodsList.list.map(item=>{
            if(selectableGoodsIds.indexOf(item.id)>-1){
                item.selectable = true
            }
            return item
        })
        return (
            <View className={styles.tableWarp}>
                <PageList.Search
                    loading={goodsListLoading}
                    onSubmit={this.search.submit}
                    defaultValue={this.search.defaultParam}
                    onReset={this.search.reset}
                    style={{ margin: "10px 20px" }}
                    items={[
                        {
                            label: "商品名称",
                            input: {
                                field: "keywords",
                                placeholder: "请输入商品名称",
                                initialValue: keywords
                            }
                        }, {
                            label: "商品分类",
                            select: {
                                field: "state",
                                style: { width: 130 },
                                placeholder: "全部",
                                data: goodsCategory.list.map((item,index)=>{
                                    return {
                                        name: item.name,
                                        value: item.id
                                    }
                                }),
                                initialValue: state
                            }
                        }
                    ]}
                />
                <Table
                    loading={goodsListLoading}
                    dataSource={currentList}
                    columns={columns}
                    rowKey={record => record.id}
                    pagination={{
                        showSizeChanger: false,
                        showQuickJumper: false,
                        current: this.state.get.page,
                        pageSize: this.state.get.rows,
                        total: goodsList.total_number
                    }}
                    onChange={({ current, pageSize }) => {
                        router.push(Query.page(current, pageSize));
                        this.initList();
                    }}
                />
            </View>
        )
    }
}


class GoodsSkuList extends Component {
    render() {
        const { skuList, skuListLoading, value, onChange } = this.props;
        const columns = [
            {
                title: "SKU",
                dataIndex: "title",
            }, {
                title: "价格（元）",
                dataIndex: "price",
            }, {
                title: "库存",
                dataIndex: "stock"
            }, {
                title: "拼团价",
                dataIndex: "group_price",
                render: (tetx, record) => <FormItem
                    validateStatus={(!record.group_price) || (record.group_price && (Number(record.group_price) > Number(record.price))) ? "error" : null}
                    help={!record.group_price ? "请输入正确的拼团价" : (record.group_price && (Number(record.group_price) > Number(record.price))) ? "拼团价不能高于原价" : ""}
                >
                    <Input
                        addonBefore="拼团价"
                        type="number"
                        step={0.01}
                        style={{ width: 130, marginRight: 10 }}
                        onChange={(e) => {
                            record.group_price = e.target.value
                            onChange(skuList.list)
                        }}
                    />
                    <span>元</span>
                </FormItem>
            }, {
                title: "团长优惠（不填写为无优惠）",
                dataIndex: "captain_price",
                render: () => <FormItem>
                    <Input
                        addonBefore="团长价"
                        type="number"
                        step={0.01}
                        style={{ width: 130, marginRight: 10 }}
                        onChange={(e) => {
                            record.captain_price = e.target.value
                            onChange(skuList.list)
                        }}
                    />
                    <span>元</span>
                </FormItem>
            }
        ]
        return (
            <Table
                columns={columns}
                loading={skuListLoading}
                dataSource={skuList}
                pagination={null}
            />
        )
    }
}
