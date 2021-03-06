# 项目简介

本项目是基于React、Antd Mobile、redux、axios的移动端电商App

## 一、目录结构

```js
├── README.md
├── config-overrides.js
├── package-lock.json
├── package.json
├── node_modules
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── robots.txt
└── src
    ├── App.js
    ├── api
    │   └── index.js // 请求api总文件
    ├── assets
    │   └── imgs
    │       └── cart_empty.png // 购物车为空图片
    ├── components
    │   └── PrivateRoute.js // 私有路由
    ├── data
    │   └── citys.js // 城市信息
    ├── index.js
    ├── layout
    │   └── Layout.js // 底部导航栏
    ├── store
    │   ├── reducers
    │   │   ├── CartReducer.js // 存储购物车数据的reducer
    │   │   ├── UserReducer.js // 存储用户数据的reducer
    │   │   └── reducer.js // 总reducer
    │   └── store.js
    ├── style
    │   └── index.css // 全局样式
    ├── upload
    │   └── avatar.png // 用户头像
    └── views
        ├── AddressInfo.js // 地址信息页面
        ├── Cart.js // 购物车页面
        ├── ErrorPage.js // 404页面
        ├── GoodsDetail.js // 商品详情页面
        ├── Home.js // 首页
	├── Category.js // 商品分类
        ├── Login.js // 登录页面
        ├── My.js // 我的页面
        ├── OrderList.js // 订单列表页面
        ├── Pay.js // 支付页面
        ├── Register.js // 注册页面
        ├── SearchField.js // 搜索区域页面
        └── SearchGoods.js // 搜索商品结果页面
```

## 二、快速安装

### 1、clone到本地

`git clone https://github.com/baozouai/react-mobile-app.git`

### 2、打开终端，`cd react-mobile-app`,切换到项目根目录，在项目根目录运行以下命令

`npm install`，安装所需的package

### 3、然后运行`npm start`开启项目

项目默认运行在`http://localhost:3000/`，可自行修改端口

### 4、成功如图

![首页](./项目截图/首页页面.png)

其他请看[项目截图](./项目截图)
