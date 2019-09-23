import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import ReactDOM from 'react-dom'
import { SearchBar, WingBlank, Flex, ActivityIndicator, PullToRefresh, Toast } from 'antd-mobile'
import { searchGoods } from '../api/index'
import qs from 'querystring'
export class SearchGoods extends Component {
    constructor(props) {
        super(props)

        this.state = {
            goodsList: [],
            bottom: false,
            animating: false,
            refreshing: false,
            down: false,
            height: document.documentElement.clientHeight,
            pagenum: 2,
        }
    }
    UNSAFE_componentWillMount() {
        // 一开始设置等待
        this.setState({ animating: true })
        // 获取搜索值
        var searchValue = this.props.match.params.goodsvalue
        
        // // 商品商品
        searchGoods(searchValue).then(res => {
            // 解构赋值
            const { meta: { status }, message: { goods, total } } = res.data
            if (status === 200) {
                // 如果获取到的数据为空，则弹框提示
                if (total === 0) {
                    this.setState({
                        animating: false,
                        refreshing: false,
                        bottom: true
                    })
                     // 2秒后跳转回首页
                    Toast.info('没有这类商品，正在跳转回首页...', 2, () => this.props.history.push('/'))
                   
                }
                this.setState({
                    goodsList: goods
                })
            }
            // 每一次获取的商品条数是20，如果第一次少于20，则加上底部文字
            if (goods.length < 20) {
                this.setState({
                    bottom: true
                })
            }
        })
    }
    UNSAFE_componentDidMount() {
        const height = this.state.height - ReactDOM.findDOMNode(this.ptr).offsetTop;
        this.setState({
            height
        })
    }
    // 上拉获取更多商品
    getMoreGoods = () => {
        // 获取搜索值
        const query = this.props.match.params.goodsvalue
        // 获取商品第几页
        const pagenum = this.state.pagenum
        const searchData = qs.stringify({ query, pagenum })
        searchGoods(searchData).then(res => {
            // 解构赋值
            const { meta: { status }, message: { goods } } = res.data
            if (status === 200) {
                // 如果没有更多数据，则停止上拉
                if (!goods.length) {
                    this.setState({
                        refreshing: false,
                    })
                }
                // 如果获取的商品条数少于20，则加上底部文字
                if (goods.length !== 20) {
                    this.setState({
                        bottom: true
                    })
                    Toast.info('没有更多数据了')
                }
                // 获取的商品追加到之前获取的商品列表中
                this.setState({
                    goodsList: this.state.goodsList.concat(goods)
                })
            }
        })
        // 页码+1
        this.setState({
            pagenum: this.state.pagenum + 1
        })
    }
    render() {
        return (
            <div>
                {/* 页面未加载完显示加载标志 */}
                <ActivityIndicator
                    toast
                    text="拼命加载啊..."
                    animating={this.state.animating}
                />
                {/* 搜索栏 */}
                <div style={{display: 'flex',backgroundColor: '#efeff4',zIndex:999}}>
                    <i className="iconfont icon-arrow-left" 
                    style={{width: 30, alignSelf: 'center',  padding: '0 10px'}}
                    onClick={() => this.props.history.goBack()}
                    ></i>
                    <SearchBar placeholder="搜索你感兴趣的商品"
                    onFocus={() => this.props.history.push('/searchfield')}
                    style={{flex: 1}}
                />
                </div>
                {/* 商品列表区域 */}
                <PullToRefresh
                // damping为拉动距离限制
                    damping={100}
                    ref={el => this.ptr = el}
                    style={{
                        height: this.state.height,
                        overflow: 'auto',
                    }}
                    indicator={this.state.down ? {} : { deactivate: '上拉可以刷新' }}
                    // direction：上拉还是下拉
                    direction={this.state.down ? 'down' : 'up'}
                    // refreshing	是否显示刷新状态
                    refreshing={this.state.refreshing}
                    // onRefresh	必选, 刷新回调函数
                    onRefresh={() => {
                        // 设置刷新状态为true
                        this.setState({ refreshing: true });
                        // 然后获取更多商品
                        this.getMoreGoods()
                    }}
                >
                    {/* WingBlank：左右留白 size表示留白的程度 */}
                    <WingBlank size="middle">
                        <Flex
                            justify="between"
                            wrap="wrap"
                        >
                            {this.state.goodsList.map(v => (
                                v.goods_small_logo ?
                                    <div key={v.goods_id} className="good" onClick={() => this.props.history.push(`/goodsdetail/${v.goods_id}`)}>
                                        <div className="good_content">
                                            <img src={v.goods_small_logo}
                                                // 图片加载完取消等待
                                                onLoad={() => {
                                                    this.setState({
                                                        animating: false,
                                                        refreshing: false
                                                    })

                                                }}
                                                alt="" />
                                            <div className="describe ellipsis-1">{v.goods_name}</div>
                                            <div className="price"><span>&yen;</span>{v.goods_price}</div>
                                        </div>
                                    </div> : ''
                            ))}

                        </Flex>
                    </WingBlank>
                    {/* 根据bottom是否显示底部文字 */}
                    {this.state.bottom ?
                        <div className="goods-list-bottom">
                            <div className="line">
                                <span>没有更多数据了 </span>
                            </div>
                        </div> : ''
                    }
                </PullToRefresh>

                <style jsx>{`
                    .goods-list-bottom {
                        height: 40px;
                        line-height: 40px;
                        text-align: center;
                        font-size: 14px;
                        color: #ccc;
                        display: flex;
                        position: relative;
                        align-items: center;
                        .line {
                            width: 200px;
                            height: 1px;
                            vertical-align: middle;
                            background-color: #ccc;
                            margin: 0 auto;
                            text-align: center;
                            span {
                                background-color: #f5f5f9;
                                padding: 0 10px;
                                position: absolute;
                                top: -50%;
                                font-size: 10px;
                                transform: translate(-50%, 50%);
                            }
                        }
                    }
                    .ellipsis-1 {
                        overflow: hidden; 
                        text-overflow: ellipsis; 
                        white-space: nowrap; 
                    }

                    .good {
                        width: 49.5%;
                        border-radius: 20px;
                        padding: 10px;
                        margin-top: 6px;
                        background-color: #fff;
                        .good_content {
                            img {
                                margin: 0 auto;
                                width: 70%;
                                display: block;
                            }
                            .describe {
                                padding: 10px 5px;
                                font-size: 13px;
                                color: #333;        
                            }
                            .price {
                                font-size: 14px;
                                color: red;
                                span {
                                    font-size: 10px;
                                }
                            }
                        }
                    }

            `}</style>
            </div>
        )
    }
}

export default withRouter(SearchGoods)
