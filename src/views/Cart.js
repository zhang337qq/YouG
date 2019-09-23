import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { Modal, Icon, Checkbox, WingBlank, Stepper, SwipeAction, Toast } from 'antd-mobile'
import emptyCart from '../assets/imgs/cart_empty.png'
import { getCartGoods, syncCart } from '../api/index'
const CheckboxItem = Checkbox.CheckboxItem;
const alert = Modal.alert;
export class Cart extends Component {
    constructor(props) {
        super(props)

        this.state = {
            // 购物车数据 格式为{goods_id: 购物车信息}
            cart_infos: {},
            // 购物车是否为空，否的话为空
            cart_infos_Status: true,
            // stepper改变数量的值
            num: '',
            // totalPrice是底部的总价
            totalPrice: 0,
            // allStatus即全选按钮是否选择，默认不选中
            allStatus: false,
            // 右下角选择去结算的商品种类数量
            allSelectedNum: 0,
            // 选择的商品总个数 商品种类*单个商品的amount
            selectedGoodsTotalNum: 0,
            // totalNum为购物车商品种类的数量
            totalNum: 0,
            // manage是为了点击右上角的管理时是否显示底部的删除按钮
            manage: true,
        }
    }
    UNSAFE_componentWillMount() {
        // render之前获取购物车数据
        this.init()
    }

    // 初始化
    init = () => {
        getCartGoods().then(res => {
            // 将数据解构处理
            const { meta: { status }, message: { cart_info } } = res.data
            // 状态码200表示获取购物车数据成功
            if (status === 200) {
                // 判断购物车是否为空
                if (cart_info) {
                    // 不为空的话设置其标志，以便是否显示购物车为空的图片标志，并将购物车数据解析后存入state的cart_infos
                    let cart_infos = JSON.parse(cart_info)
                    // 给购物车信息加上是否选择标志
                    for (var goods_id in cart_infos) {
                        cart_infos[goods_id].selectedStatus = false
                    }
                    this.setState({
                        cart_infos,
                        cart_infos_Status: true,
                        totalNum: Object.values(JSON.parse(cart_info)).length
                    })
                } else {
                    // 否则购物车为空的图片标志设为false
                    this.setState({
                        cart_infos_Status: false
                    })
                }
            }
        })
    }
    // 同步购物车数据
    syncCartGoodsData = () => {
        syncCart({ infos: JSON.stringify(this.state.cart_infos) })
        // 计算CartReducer中的totalNum
        this.props.snycCartGoods(this.state.cart_infos, this.state.totalPrice, this.state.selectedGoodsTotalNum)
    }

    // 改变商品数量（stepper)
    handleUpdateNum = (num, goods_id) => {
        // 更新被点击的商品的数量
        const cart_infos = this.state.cart_infos
        cart_infos[goods_id].amount = num
        this.setState({
            num,
            cart_infos,
        }, () => {
            // 计算总价
            this.calTotalPrice()
            // 同步购物车
            this.syncCartGoodsData()
        })
    }
    // 改变对应商品是否选择的状态
    changeSingleSelectedStatus = (e, goods_id) => {
        // 同步状态
        let cart_infos = this.state.cart_infos
        cart_infos[goods_id].selectedStatus = e.target.checked
        this.setState({
            cart_infos: cart_infos
        })
        // 判断所有商品是否都选中
        this.isAllSelected()
        // 计算总价
        this.calTotalPrice()
        this.setState({
            allSelectedNum: e.target.checked ? this.state.allSelectedNum + 1 : this.state.allSelectedNum - 1
        })
    }
    // 判断所有商品是否都选中
    isAllSelected = () => {
        // 先预设全选状态为true
        let allSelected = true
        // 循环判断每个商品是否都选中
        for (var goods_id in this.state.cart_infos) {
            if (!this.state.cart_infos[goods_id].selectedStatus) {
                // 如果有一个没选中，则设置全选状态为false，并跳出循环
                allSelected = false
                break
            }
        }
        this.setState({
            allStatus: allSelected
        })
    }
    // 点击全选框
    handleAllChecked = () => {
        // 获取商品信息
        let cart_infos = this.state.cart_infos
        // 循环遍历每个商品，设置是否选中,与allStatus同步
        for (var goods_id in cart_infos) {
            cart_infos[goods_id].selectedStatus = this.state.allStatus
        }
        this.setState({
            cart_infos,
            allSelectedNum: this.state.allStatus ? Object.values(cart_infos).length : 0
        })
        // 计算总价
        this.calTotalPrice()
    }
    // 计算总价
    calTotalPrice = () => {
        let totalPrice = 0
        let selectedGoodsTotalNum = 0
        for (var goods_id in this.state.cart_infos) {
            if (this.state.cart_infos[goods_id].selectedStatus) {
                totalPrice += this.state.cart_infos[goods_id].amount * this.state.cart_infos[goods_id].goods_price
                selectedGoodsTotalNum += this.state.cart_infos[goods_id].amount
            }
        }
        this.setState({
            totalPrice,
            selectedGoodsTotalNum
        })
    }
    // 删除单个商品
    handleDeleteSingleGoods = (goods_id) => {
        let cart_infos = this.state.cart_infos
        // 删除对应id的商品
        delete cart_infos[goods_id]
        // 如果购物车为空，则设置购物车信息状态为false，表示购物车清空了
        if (!Object.values(cart_infos).length) {
            this.setState({
                cart_infos_Status: false
            })
        }
        // 再更新state中的cart_infos
        this.setState({
            cart_infos,
            allSelectedNum: this.state.allSelectedNum ? this.state.allSelectedNum - 1 : 0
        }, () => {
            // 同步购物车
            this.syncCartGoodsData()
            // 计算总价
            this.calTotalPrice()
        })

    }
    // 批量删除商品
    handleDeleteBatchGoods = () => {
        // 获取副本
        let cart_infos = this.state.cart_infos
        // 循环判断哪些商品被选中，选中的直接删除
        for (var goods_id in cart_infos) {
            // 如果selectedStatus，即被选中，删除掉
            if (cart_infos[goods_id].selectedStatus) {
                delete cart_infos[goods_id]
            }
        }
        if (!cart_infos.length) {
            this.setState({
                cart_infos_Status: false
            })
        }
        // 这里因为选中了商品，所以计算了所选中商品的总价和总商品数，故点击删除的时候要清零，否则删除后数字还在
        this.setState({
            cart_infos,
            totalPrice: 0,
            allSelectedNum: 0,
            selectedGoodsTotalNum: 0,
            totalNum: Object.values(cart_infos).length
        }, () => {
            this.syncCartGoodsData()
        })
    }
    gotoPay = () => {
        // 提交订单之前判断是否选择了商品
        if (!this.state.allSelectedNum) {
            Toast.fail('您还没有选择宝贝呢', 2)
            return
        }
        // 将CartReducer中保存的数据更新
        this.props.snycCartGoods(this.state.cart_infos, this.state.totalPrice, this.state.selectedGoodsTotalNum)
        this.props.history.push('/pay')
    }

    render() {
        return (
            <div>
                {/* 顶部导航条 */}
                <nav className="nav-header">
                    <div className="nav-header-left" onClick={() => this.props.history.goBack()}>
                        <Icon type='left' />
                    </div>
                    <div className="nav-header-center">
                        购物车{this.state.totalNum ? `(${this.state.totalNum})` : ''}
                    </div>
                    <div className="nav-header-right">
                        <span onClick={() => this.setState({ manage: this.state.manage ? false : true })} className="manage">
                            {this.state.manage ? '管理' : '完成'}
                        </span>
                    </div>
                </nav>
                {this.state.cart_infos_Status ?
                    <WingBlank style={{ marginBottom: 60 }}>
                        <div className="order-list" style={{ marginTop: 55 }}>
                            {Object.values(this.state.cart_infos).map(v => (
                                <SwipeAction
                                    key={v.goods_id}
                                    style={{ marginBottom: 5 }}
                                    autoClose
                                    right={[
                                        {
                                            text: '取消',
                                            style: { backgroundColor: '#ddd', color: 'white' },
                                        },
                                        {
                                            text: '删除',
                                            style: { backgroundColor: '#F4333C', color: 'white' },
                                            onPress: () => alert('删除该宝贝', '确定吗?', [
                                                {
                                                    text: '我再想想',
                                                    style: {
                                                        backgroundColor: '#777',
                                                        color: '#fff',
                                                        fontWeight: 700
                                                    }
                                                },
                                                {
                                                    text: '删除',
                                                    style: {
                                                        backgroundColor: 'rgb(244, 51, 60)',
                                                        color: '#fff',
                                                        fontWeight: 700
                                                    },
                                                    onPress: () => this.handleDeleteSingleGoods(v.goods_id)
                                                },
                                            ]),
                                        },
                                    ]}
                                >
                                    <CheckboxItem
                                        checked={v.selectedStatus}
                                        onChange={e => this.changeSingleSelectedStatus(e, v.goods_id)}
                                    >
                                        <div className="single-order">
                                            <img src={v.goods_small_logo}
                                                onClick={() => this.props.history.push(`/goodsdetail/${v.goods_id}`)}
                                                alt="" />
                                            <div className="order-content">
                                                <div className="order-title ellipsis-2"
                                                    onClick={() => this.props.history.push(`/goodsdetail/${v.goods_id}`)}
                                                >
                                                    {v.goods_name}
                                                </div>
                                                <Stepper
                                                    style={{ width: '100%', maxWidth: 100, position: 'absolute', right: 5, bottom: -5, fontSize: 8 }}
                                                    showNumber
                                                    max={v.goods_number}
                                                    min={1}
                                                    defaultValue={v.amount}
                                                    onChange={num => this.handleUpdateNum(num, v.goods_id)}
                                                />
                                                <div className="order-price">
                                                    <span>&yen;</span>
                                                    <span>{v.goods_price}.00</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CheckboxItem>
                                </SwipeAction>
                            ))}
                        </div>
                    </WingBlank>
                    : <div className="empty-cart">
                        {/* 此处的图片不能直接写路径，只能通过import的方式将它引入进来 */}
                        <img src={emptyCart} alt="" className="empty-cart-img" />
                        <div className="empty-cart-text1">购物车竟然是空的</div>
                        <div className="empty-cart-text2">再忙，也要记得买点什么犒劳自己~</div>
                        <div className="btn" onClick={() => this.props.history.push('/')}>去逛逛</div>
                    </div>
                }


                <div className="cart-footer">
                    <div className="cart-footer-left" >
                        <CheckboxItem
                            checked={this.state.allStatus}
                            onChange={() => {
                                this.setState({
                                    allStatus: !this.state.allStatus
                                },
                                    // 这里由于异步，所以等全选状态改变后再执行handleAllChecked
                                    () => this.handleAllChecked())
                            }}
                        >
                            全选
                        </CheckboxItem>
                    </div>
                    {this.state.manage ?
                        <div className="cart-footer-center">
                            <span>合计：</span>
                            <span className="total-price">￥ {this.state.totalPrice}</span>
                        </div> : ''
                    }
                    {this.state.manage ?
                        <div className="cart-footer-right" onClick={this.gotoPay}>
                            <span className="goto-pay">结算{this.state.allSelectedNum ? `(${this.state.allSelectedNum}）` : ''}</span>
                        </div>
                        :
                        <button className="delete-batch"
                            onClick={() => this.state.selectedGoodsTotalNum? alert(`删除这${this.state.allSelectedNum}个宝贝`, '确定吗?', [
                                {
                                    text: '我再想想', style: {
                                        backgroundColor: '#777',
                                        color: '#fff',
                                        fontWeight: 700
                                    }
                                },
                                {
                                    text: '删除', style: {
                                        backgroundColor: 'rgb(244, 51, 60)',
                                        color: '#fff',
                                        fontWeight: 700
                                    }, onPress: () => this.handleDeleteBatchGoods()
                                },
                            ]):Toast.fail('您还没选择宝贝呢',2)}

                        >删除</button>
                    }

                </div>

                <style jsx>{`
                    .nav-header {
                        position: fixed;
                        top:0;
                        z-index: 999;
                        display: flex;
                        width: 100%;
                        height: 45px;
                        justify-content: space-between;
                        padding: 0 10px;
                        align-items: center;
                        background-color: #108ee9;
                        color: #fff;
                        font-size: 16px;
                        
                        .nav-header-left {
                            margin-left: 5px;
                            display: flex;
                            align-items: center;
                        }
                        .nav-header-center {
                            position: absolute;
                            left: 50%;
                            top: 50%;
                            transform: translate(-50%, -50%);
                        }
                        .nav-header-right {
                            background-color: transparent;
                        }
                    }
                    .ellipsis-2 {
                        display: -webkit-box;
                        overflow: hidden;
                        white-space: normal!important;
                        text-overflow: ellipsis;
                        word-wrap: break-word;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                    }
                    .empty-cart {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        margin-top: 100px;
                        height: 100%;
                        .empty-cart-img {
                            height: 90px;
                            width: 90px;
                        }
                        .empty-cart-text1 {
                            font-size: 18px;
                            color: #666;
                            padding: 15px 0;
                        }
                        .empty-cart-text2 {
                            color: #888;
                            margin-bottom: 10px;
                        }
                        .btn {
                            font-size: 20px;
                            padding: 15px 55px;
                            text-align: center;
                            margin: 0 auto;
                            border-radius: 10px;
                            background: #ed601b;
                            color: #fff;
                        }
                    }
                    .order-list { 
                        .single-order {
                            background-color: #fff;
                            padding: 5px;
                            display: flex;
                            align-items: center;
                            border-radius: 10px;
                            position: relative;
                            margin-top: 5px;

                            img {
                                width: 40%;
                                height: 40%;
                                flex: 1;
                                padding: 10px;
                            }

                            .order-content {
                                flex: 4;
                                .order-title {
                                    position: absolute;
                                    top: 15px;
                                    padding-right: 5px;
                                    font-size: 12px;
                                }

                                .order-price {
                                    position: absolute;
                                    bottom: 5px;
                                    color: red;

                                    span {
                                        font-size: 12px;
                                    }
                                }
                            }

                        }
                    } 
                    
                    .cart-footer {
                        position: fixed;
                        bottom: 50px;
                        display: flex;
                        justify-content: space-between;
                        height: 50px;
                        line-height: 50px;
                        width: 100%;
                        border-top: 1px solid #e7e7e7;
                        background-color: #fff;
                        .cart-footer-left {
                            display: flex;
                            justify-content: cneter;
                            align-items: center;
                            span {
                            display: block;
                            height: 50px;
                            padding: 0 5px;
                            }
                        }
                        .cart-footer-center {
                            .total-price {
                                color: #ff5500;
                            }
                        }
                        .cart-footer-right {
                            display: flex;
                            width: 100px;
                            flex-direction: column;
                            text-align: center;
                            background-color: #ff5500;
                            .goto-pay {
                            color: #fff;
                            }
                        }
                    }
                    
                    .delete-batch {
                        width: 70px;
                        height: 70%;
                        align-self: center;
                        color: #e94f4f;
                        border-radius: 20px;
                        display: block;
                        border: 1px solid #e94f4f;
                        background-color: transparent;
                        margin-right: 10px;
                    }
                    
                `}</style>
            </div >
        )
    }
}
// 创建映射函数
const mapActionToProps = (dispatch) => {
    return {
        // 同步购物车数据
        snycCartGoods: (cart_Infos, totalPrice, selectedGoodsTotalNum) => {
            dispatch({ type: 'SYNC_CART_GOODS', payload: { cart_Infos, totalPrice, selectedGoodsTotalNum } })
        }
    }
}

export default connect(null, mapActionToProps)(withRouter(Cart))
