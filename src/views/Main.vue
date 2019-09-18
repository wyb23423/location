<template>
    <el-container>
        <el-header style="padding: 0">
            <app-nav></app-nav>
        </el-header>
        <el-main style="padding: 0">
            <router-view />
        </el-main>
    </el-container>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import Header from '../components/Header.vue';
import { Prop } from 'vue-property-decorator';
import { NOTIFY_KEY } from '@/constant';

@Component({
    components: {
        'app-nav': Header
    }
})
export default class Main extends Vue {
    private timer?: number;

    public created() {
        let errorCount: number = 0;
        const fn = () => {
            this.$http
                .get('/api/alarm/getall', {
                    pageSize: 99999999,
                    currentPage: 1
                })
                .then(res => {
                    errorCount = 0;

                    res.pagedData.datas.forEach((v: IAlarm) => {
                        if (Date.now() - v.alarmTime <= 1000) {
                            this.$event.emit(NOTIFY_KEY, v);
                        }
                    });

                    this.timer = setTimeout(fn, 1000);
                })
                .catch(e => {
                    if (++errorCount >= 3) {
                        sessionStorage.removeItem('login');
                        return (location.href = '/login');
                    }

                    this.timer = setTimeout(fn, 300);
                });
        };

        // fn();
    }

    public destroyed() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
}
</script>

<style lang="postcss" module>
.main {
    padding: 0;
    position: relative;
}
.mark {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 200px;
    background-color: #e2e2e2;
}
</style>

