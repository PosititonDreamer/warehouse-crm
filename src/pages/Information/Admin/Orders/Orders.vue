<script>
    import { ref, watch } from 'vue';
    import UInput from '../../../../components/_UIComponents/UInput/UInput.vue';
    import { authorization } from '../../../../store/authorization';
    import { warehouses } from '../../../../store/warehouses';
    import OrdersWarehouse from '../../Warehouse/Orders/Orders.vue';
    import OrdersOperator from '../../Operator/Orders/Orders.vue';
    export default {
        components: {
            UInput, OrdersWarehouse, OrdersOperator
        },
        beforeCreate() {
            const {findWarehouses} = warehouses()
            findWarehouses()
        },
        setup() {
            const {changeWarehouse} = authorization()
            const {getWarehouses} = warehouses()

            const rule = ref(localStorage.getItem('order-rule') ? localStorage.getItem('order-rule') : "")
            const warehouse = ref(localStorage.getItem('order-warehouse') ? localStorage.getItem('order-warehouse') : 0)

            watch(rule, () => {
                localStorage.setItem('order-rule', rule.value)
            })

            watch([warehouse, getWarehouses], () => {
                localStorage.setItem('order-warehouse', warehouse.value)
                changeWarehouse(warehouse.value)
            })

            return {
                getWarehouses, rule, warehouse, changeWarehouse
            }
        },
    }
</script>

<template>
    <div class="orders">
        <h2 class="orders__title">Заказы</h2>
        <div class="orders__header">
            <UInput class="orders__input" name="Роль" view="select" v-model="rule" :start-value="rule">
                <option value=""></option>
                <option value="warehouse">Сборщик</option>
                <option value="operator">Оператор</option>
            </UInput>
            <UInput class="orders__input" name="Склад" view="select" v-model="warehouse" @change="changeWarehouse(warehouse)" :start-value="warehouse">
                <option value=""></option>
                <option v-for="warehouse in getWarehouses" :value="warehouse.id">{{ warehouse.title }}</option>
            </UInput>
        </div>
        <div class="orders__content">
            <p class="order__sub-title" v-if="!rule && !warehouse">Выберите склад и роль</p>
            <p class="order__sub-title" v-else-if="!rule">Выберите роль</p>
            <p class="order__sub-title" v-else-if="!warehouse">Выберите склад</p>
            <OrdersWarehouse v-else-if="rule === 'warehouse'"></OrdersWarehouse>
            <OrdersOperator v-else-if="rule === 'operator'"></OrdersOperator>
        </div>
    </div>
</template>

<style src="./Orders.scss" lang="scss" scoped />