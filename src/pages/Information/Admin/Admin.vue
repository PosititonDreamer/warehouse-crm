<script>
import { computed, ref, watch } from 'vue';
import UButton from '@/components/_UIComponents/UButton/UButton.vue'
import Users from './Users/Users.vue';
import Warehouses from './Warehouses/Warehouses.vue';
import Orders from './Orders/Orders.vue';
import Graphs from './Graphs/Graphs.vue';
import Supplies from './Supplies/Supplies.vue';
import Accounting from './Accounting/Accounting.vue';
import UInput from '../../../components/_UIComponents/UInput/UInput.vue';
import Payed from './Payed/Payed.vue';
import Products from './Products/Products.vue'

    export default {
        components: {
            Products, UButton, Users, Warehouses, Accounting, Orders , Graphs, UInput, Payed, Supplies
        },
        setup() {
            const page = ref(localStorage.getItem('page') ? localStorage.getItem('page') : 'products')

            const getPage = computed(() => page.value)

            watch(page, () => {
                localStorage.setItem('page', page.value)
            })

            return {
                page, getPage
            }
        },
    }
</script>

<template>
    <div class="admin">
        <div class="admin__header">
            <u-button :class="[{'u-button--active': getPage === 'products'}]" @click="page = 'products'">Продукты</u-button>
            <u-button :class="[{'u-button--active': getPage === 'users'}]"  @click="page = 'users'">Пользователи</u-button>
            <u-button :class="[{'u-button--active': getPage === 'warehouses'}]"  @click="page = 'warehouses'">Склады</u-button>
            <u-button :class="[{'u-button--active': getPage === 'accounting'}]"  @click="page = 'accounting'">Товары</u-button>
            <u-button :class="[{'u-button--active': getPage === 'supplies'}]"  @click="page = 'supplies'">Связь товаров для поставки</u-button>
            <u-button :class="[{'u-button--active': getPage === 'orders'}]"  @click="page = 'orders'">Заказы</u-button>
            <u-button :class="[{'u-button--active': getPage === 'payed'}]"  @click="page = 'payed'">Зарплата</u-button>
            <u-button :class="[{'u-button--active': getPage === 'graphs'}]"  @click="page = 'graphs'">Графики</u-button>
        </div>
        <div class="admin__content">
            <Products v-if="getPage === 'products'"></Products>
            <Users v-if="getPage === 'users'"></Users>
            <Warehouses v-if="getPage === 'warehouses'"></Warehouses>
            <Accounting v-if="getPage === 'accounting'"></Accounting>
            <Supplies v-if="getPage === 'supplies'"> </Supplies>
            <Orders v-if="getPage === 'orders'"></Orders>
            <Payed v-if="getPage === 'payed'"></Payed>
            <Graphs v-if="getPage === 'graphs'"></Graphs>
        </div>
    </div>
</template>

<style src="./Admin.scss" lang="scss" scoped />