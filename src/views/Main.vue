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
                            this.$notify.warning(
                                `标签${v.tagNo}异常。\n${v.alarmMsg}`
                            );
                        }
                    });

                    this.timer = setTimeout(fn, 1000);
                })
                .catch(e => {
                    if (++errorCount >= 3) {
                        sessionStorage.removeItem('login');
                        return this.$router.push('/login');
                    }

                    this.timer = setTimeout(fn, 1000);
                });
        };

        fn();
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

