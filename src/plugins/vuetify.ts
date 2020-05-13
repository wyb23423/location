import Vuetify, { VForm, VTextField, VSelect, VBtn, VBadge } from 'vuetify/lib';
import Vue from 'vue';

Vue.use(Vuetify, {
    components: {
        VForm,
        VTextField,
        VSelect,
        VBtn,
        VBadge
    }
});

const opts = {};

export default new Vuetify(opts);
