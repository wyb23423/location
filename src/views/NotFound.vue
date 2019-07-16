<template>
    <div :class="$style.container">
        <div :class="$style.img"></div>
        <p :class="$style.p">哎呀迷路了...</p>
        <div :class="$style.reason">
            <p>可能的原因：</p>
            <ul>
                <li>原来的页面不存在了</li>
                <li>我们的服务器被外星人劫持了</li>
                <li>路由初始化未完成</li>
            </ul>
        </div>
        <div style="text-align: center; margin-top: 40px">
            <router-link to="/">
                <el-button type="primary">
                    返回首页
                </el-button>
            </router-link>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component
export default class NotFound extends Vue {}
</script>

<style lang="postcss" module>
.container {
    background: #fff;
    height: 100vh;
    padding-top: 40px;
}
.p {
    line-height: 22px;
    font-size: 17px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f6f6f6;
    text-align: center;
    color: #262b31;
}
.img {
    height: 155px;
    background: url(/images/page-404_39c5442.png) center center no-repeat;
    background-size: 150px auto;
    margin-bottom: 20px;
}
.reason {
    color: #9ca4ac;
    font-size: 13px;
    line-height: 13px;
    text-align: left;
    width: 255px;
    margin: 0 auto;

    & p {
        margin-top: 13px;
    }

    & li {
        margin-top: 10px;
        margin-left: 36px;
        list-style-type: disc;
    }
}
</style>

