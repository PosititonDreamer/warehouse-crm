<script>
import { computed, ref } from 'vue';
import { authorization } from '../../store/authorization';
import { ordersPayed } from '../../store/ordersPayed';
import {penalties} from "@/store/penalty.js";

    export default {
        props: {
            ordersChoice: {
                type: Array,
                default: []
            },
            penaltiesChoice: {
              type: Array,
              default: []
            },
            salary: {
                type: Number,
                default: 0
            }
        },
        setup(_, {emit}) {
            const {getUser} = authorization()
            const {getOrdersPayed} = ordersPayed()
            const {getPenalties} = penalties()

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

            const changeAllPenalty = (check) => {
              emit('changeAllPenalty', check ? getPenalties.value.penalties_not_completed.map(penalty => penalty.id) : [])
            }

            return {
                getUser, getOrdersPayed, getPaymentOrders, changeAllOrders, getPenalties, changeAllPenalty
            }
        }
    }
</script>
<template>
    <div class="orders-payed">
        <h2 class="orders-payed__title">Расчеты:</h2>
        <p class="orders-payed__text" >
          Всего было выплачено за выбранный диапазон: <b>{{ getPaymentOrders.payed.length * ( getUser.rule === 'super' ? salary : getUser.salary) - getPenalties.penalties?.reduce((sum, currentItem) => +sum + +currentItem.price, 0)}} рублей</b>
        </p>
        <h3 class="orders-payed__sub-title">Штрафы</h3>
        <p class="orders-payed__text">Всего не исполненных штрафов: <b>{{ getPenalties.penalties_all_time_not_completed}}</b></p>
        <p class="orders-payed__text">Всего штрафов в выбранном диапазаоне: <b>{{ getPenalties.penalties_not_completed?.length + getPenalties.penalties?.length}} ({{ getPenalties.penalties_not_completed?.reduce((sum, currentItem) => +sum + +currentItem.price, 0) + getPenalties.penalties?.reduce((sum, currentItem) => +sum + +currentItem.price, 0) }}  рублей)</b></p>
        <h3 class="orders-payed__sub-title">Заказы</h3>
        <p class="orders-payed__text">Всего неолпаченных заказов: <b>{{ getOrdersPayed.orders_not_payment}}</b></p>
        <p class="orders-payed__text">Всего неотправленных заказов: <b>{{ getOrdersPayed.orders_not_sended }}</b></p>
        <p class="orders-payed__text">Всего заказов в выбранном диапазоне: <b>{{ getOrdersPayed.orders.length }} ({{ getOrdersPayed.orders.length * ( getUser.rule === 'super' ? salary : getUser.salary) }} рублей)</b></p>

        <template v-if="getPenalties.penalties_not_completed?.length">
          <h3 class="orders-payed__sub-title">Не выполненные штрафы: {{ getPenalties.penalties_not_completed.length }} ({{ getPenalties.penalties_not_completed.reduce((sum, currentItem) => +sum + +currentItem.price, 0) }} рублей)</h3>
          <div :class="['orders-payed__table orders-payed__table--penalties', {'orders-payed__table--admin': getUser.rule === 'super'}]">
            <div class="orders-payed__table-item orders-payed__table-item--head" v-if="getUser.rule === 'super'">
              <label class="orders-payed__checkbox orders-payed__checkbox--assembled" >
                <input type="checkbox" @change="changeAllPenalty($event.target.checked)" :checked="penaltiesChoice.length === getPenalties.penalties_not_completed.length">
                <span class="orders-payed__marker"></span>
              </label>
            </div>
            <div class="orders-payed__table-item orders-payed__table-item--left orders-payed__table-item--head">
              Описание штрафа
            </div>
            <div class="orders-payed__table-item orders-payed__table-item--head">
              Сумма
            </div>
            <template v-for="penalty in getPenalties.penalties_not_completed">
              <div class="orders-payed__table-item" v-if="getUser.rule === 'super'">
                <label class="orders-payed__checkbox">
                  <input type="checkbox" :key="`penalty-id-${penalty.id}`" @change="$emit('changePenalty', {id: penalty.id, check: $event.target.checked})" :value="penalty.id" :checked="penaltiesChoice.find(id => id === penalty.id)">
                  <span class="orders-payed__marker"></span>
                </label>
              </div>
              <div class="orders-payed__table-item" v-html="penalty.comment" />
              <div class="orders-payed__table-item orders-payed__table-item--center">
                {{penalty.price}}
              </div>
            </template>
          </div>
        </template>

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
        <template v-if="getPenalties.penalties?.length">
          <h3 class="orders-payed__sub-title">Выполненные штрафы: {{ getPenalties.penalties.length }} ({{ getPenalties.penalties.reduce((sum, currentItem) => +sum + +currentItem.price, 0) }} рублей)</h3>
          <div :class="['orders-payed__table orders-payed__table--penalties']">
            <div class="orders-payed__table-item orders-payed__table-item--left orders-payed__table-item--head">
              Описание штрафа
            </div>
            <div class="orders-payed__table-item orders-payed__table-item--head">
              Сумма
            </div>
            <template v-for="penalty in getPenalties.penalties">
              <div class="orders-payed__table-item" v-html="penalty.comment" />
              <div class="orders-payed__table-item orders-payed__table-item--center">
                {{penalty.price}}
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