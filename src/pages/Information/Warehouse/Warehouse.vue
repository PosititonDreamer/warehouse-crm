<script>
import { computed, ref } from 'vue';
import UButton from '@/components/_UIComponents/UButton/UButton.vue'
import Accounting from './Accounting/Accounting.vue';
import Orders from './Orders/Orders.vue';
import Payed from './Payed/Payed.vue';

    export default {
        components: {
            UButton, Accounting, Orders, Payed
        },
        setup() {
            const page = ref('accounting')

            const getPage = computed(() => page.value)

            return {
                page, getPage
            }
        },
    }
</script>

<template>
    <div class="warehosue">
        <div class="warehosue__header">
            <u-button :class="[{'u-button--active': getPage === 'accounting'}]"  @click="page = 'accounting'">Товарный склад</u-button>
            <u-button :class="[{'u-button--active': getPage === 'orders'}]"  @click="page = 'orders'">Заказы</u-button>
            <u-button :class="[{'u-button--active': getPage === 'salary'}]"  @click="page = 'salary'">Зарплата</u-button>
        </div>
        <div class="warehosue__content">
            <Accounting v-if="getPage === 'accounting'"></Accounting>
            <Orders v-if="getPage === 'orders'"></Orders>
            <Payed v-if="getPage === 'salary'"></Payed>
        </div>
    </div>
</template>

<style src="./Warehouse.scss" lang="scss" scoped />