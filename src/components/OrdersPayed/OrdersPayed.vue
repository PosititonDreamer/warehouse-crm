<script>
import { computed, ref } from 'vue';
import { authorization } from '../../store/authorization';
import { ordersPayed } from '../../store/ordersPayed';

    export default {
        props: {
            ordersChoice: {
                type: Array,
                required: true
            },
            salary: {
                type: Number,
                default: 0
            }
        },
        setup(_, {emit}) {
            const {getUser} = authorization()
            const {getOrdersPayed} = ordersPayed()

            const getPaymentOrders = computed(() => {
                if(getOrdersPayed.value) {
                    const payed = getOrdersPayed.value.orders.filter(order => +order.payed === 1)
                    const notPayed = getOrdersPayed.value.orders.filter(order => +order.payed === 0)
                    return {
                        payed, notPayed
                    }
                } 
                return null
            })

            const changeAllOrders = (check) => {
                emit('update:modelValue', check ? getPaymentOrders.value.notPayed.map(order => order.id) : [])
            }

            return {
                getUser, getOrdersPayed, getPaymentOrders, changeAllOrders
            }
        }
    }
</script>
<template>
    <div class="orders-payed">
        <h2 class="orders-payed__title">Расчеты:</h2>
        <p class="orders-payed__text">Всего неолпаченных заказов: <b>{{ getOrdersPayed.orders_not_payment}}</b></p>
        <p class="orders-payed__text">Всего неотправленных заказов: <b>{{ getOrdersPayed.orders_not_sended }}</b></p>
        <p class="orders-payed__text">Всего Заказов в выбранном диапазоне: <b>{{ getOrdersPayed.orders.length }} ({{ getOrdersPayed.orders.length * ( getUser.rule === 'super' ? salary : getUser.salary) }} рублей)</b></p>

        <template v-if="getPaymentOrders.notPayed.length">
            <h3 class="orders-payed__sub-title">Неоплаченные заказы: {{ getPaymentOrders.notPayed.length }} ({{ getPaymentOrders.notPayed.length * ( getUser.rule === 'super' ? salary : getUser.salary) }} рублей)</h3>
            <div :class="['orders-payed__table', {'orders-payed__table--admin': getUser.rule === 'super'}]">
                <div class="orders-payed__table-item orders-payed__table-item--head" v-if="getUser.rule === 'super'">
                    <label class="orders-payed__checkbox orders-payed__checkbox--assembled" >
                        <input type="checkbox" @change="changeAllOrders($event.target.checked)" :checked="ordersChoice.length === getPaymentOrders.notPayed.length">
                        <span class="orders-payed__marker"></span>
                    </label>
                </div>
                <div class="orders-payed__table-item orders-payed__table-item--left orders-payed__table-item--head">
                    Заказ
                </div>
                <div class="orders-payed__table-item orders-payed__table-item--head">
                    Дата сборки
                </div>
                <div class="orders-payed__table-item orders-payed__table-item--head" >
                    Дата отправки
                </div>
                <template v-for="account in getPaymentOrders.notPayed">
                    <div class="orders-payed__table-item" v-if="getUser.rule === 'super'">
                        <label class="orders-payed__checkbox">
                            <input type="checkbox" :key="`order-id-${account.id}`" @change="$emit('changeOrder', {id: account.id, check: $event.target.checked})" :value="account.id" :checked="ordersChoice.find(id => id === account.id)">
                            <span class="orders-payed__marker"></span>
                        </label>
                    </div>
                    <div class="orders-payed__table-item">
                        {{ account.name }} <br>
                        {{ account.track }}
                    </div>
                    <div class="orders-payed__table-item orders-payed__table-item--center">
                        {{ new Date(account.date_assembled).toLocaleDateString('ru-RU')}} 
                    </div>
                    <div class="orders-payed__table-item orders-payed__table-item--center">
                        {{ new Date(account.date_sended).toLocaleDateString('ru-RU')}} 
                    </div>
                </template>
            </div>
        </template>
        <template v-if="getPaymentOrders.payed.length">
            <h3 class="orders-payed__sub-title">Оплаченные заказы: {{ getPaymentOrders.payed.length }} ({{ getPaymentOrders.payed.length * ( getUser.rule === 'super' ? salary : getUser.salary) }} рублей)</h3>
            <div :class="['orders-payed__table']">
                <div class="orders-payed__table-item orders-payed__table-item--left orders-payed__table-item--head">
                    Заказ
                </div>
                <div class="orders-payed__table-item orders-payed__table-item--head">
                    Дата сборки
                </div>
                <div class="orders-payed__table-item orders-payed__table-item--head" >
                    Дата отправки
                </div>
                <template v-for="account in getPaymentOrders.payed">
                    <div class="orders-payed__table-item">
                        {{ account.name }} <br>
                        {{ account.track }}
                    </div>
                    <div class="orders-payed__table-item orders-payed__table-item--center">
                        {{ new Date(account.date_assembled).toLocaleDateString('ru-RU')}} 
                    </div>
                    <div class="orders-payed__table-item orders-payed__table-item--center">
                        {{ new Date(account.date_sended).toLocaleDateString('ru-RU')}} 
                    </div>
                </template>
            </div>
        </template>
    </div>
</template>
<style src="./OrdersPayed.scss" lang="scss" scoped />