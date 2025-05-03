<script>
import { ref, watch } from 'vue';
import { warehouses } from '../../../../store/warehouses';
import { authorization } from '../../../../store/authorization';
import UButton from '../../../../components/_UIComponents/UButton/UButton.vue';
import { payed } from '../../../../store/payed';
import inputData from '../../../../hooks/inputData';
import UInput from '../../../../components/_UIComponents/UInput/UInput.vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import OrdersPayed from '../../../../components/OrdersPayed/OrdersPayed.vue';
import { ordersPayed } from '../../../../store/ordersPayed';

    export default {
        components: {
            UButton, UInput, VueDatePicker, OrdersPayed
        },
        beforeCreate() {
            const { findWarehouses } = warehouses()
            const {findMinDate} = payed()

            findWarehouses()
            findMinDate()
        },

        beforeUnmount() {
            const {resetOrdersPayed} = ordersPayed()
            resetOrdersPayed()
        },
        setup() {
            const { getWarehouses } = warehouses()
            const { changeWarehouse } = authorization()
            const { findSalary, getSalary, updateSalary, getMinDate, paymentOrders } = payed()
            const {findPayedOrders, getOrdersPayed, resetOrdersPayed} = ordersPayed()
            const page = ref(null)
            const openModal = ref(false)
            const id = ref(0)
            const {value: salar, error: errorSaler, takedValue: takedSaler} = inputData(0, 'number')
            const {value: userSalary, error: errorUserSalary, takedValue: takedUserSalary} = inputData("", 'string')
            const date = ref([])
            const ordersChoice = ref([])
 
            watch(getWarehouses, () => {
                if(page.value === null && getWarehouses.value.length) {
                    changePage(getWarehouses.value[0].id)
                }
            })

            const changePage = (id) => {
                page.value = id
                changeWarehouse(id)
                findSalary(id)
            }

            const changeSalary = (salary) => {
                id.value = salary.id
                salar.value = !!salary.salary ? salary.salary : 0
                takedSaler.value = true
                openModal.value = true
            }

            const closeModal = () => {
                salar.value = 0
                takedSaler.value = false
                id.value = 0
                openModal.value = false
            }

            const saveSalary = () => {
                takedSaler.value = true

                if(errorSaler.value.trim().length === 0 && salar.value > -1) {
                    updateSalary({salary: salar.value, id: id.value}, closeModal)
                }
            }

            watch([userSalary, date], () => {
                resetOrdersPayed()
            })

            const format = (date) => {
                let endString = ''

                if(date[0]) {
                    endString += `${date[0].getDate().toString().padStart(2, '0')}.${(date[0].getMonth() + 1).toString().padStart(2, '0')}.${date[0].getFullYear()}`
                }

                if(date[1]) {
                    endString += ` - ${date[1].getDate().toString().padStart(2, '0')}.${(date[1].getMonth() + 1).toString().padStart(2, '0')}.${date[1].getFullYear()}`
                }

                return endString
            }

            const saveFilter = () => {
                takedUserSalary.value = true
                if(date.value.length === 0) {
                    alert("Выбери дату!");
                    return
                }

                if(+userSalary.value > 0 && !errorUserSalary.value.trim().length) {
                    ordersChoice.value = []
                    findPayedOrders({min_date: date.value[0], max_date: date.value[1], user_id: userSalary.value})
                }
            }   

            const changeOrder = (data) => {
                if(data.check) {
                    ordersChoice.value.push(data.id)
                    return
                }
                ordersChoice.value = ordersChoice.value.filter(id => id != data.id)
            }

            const paymentUser = () => {
                if(confirm("Точно оплатил выбранные заказы?")) {
                    paymentOrders(ordersChoice.value, saveFilter)
                }
            }

            return {
                getWarehouses, page, changePage, getSalary, changeSalary, closeModal, saveSalary, openModal,  getMinDate, saveFilter, ordersChoice,  changeOrder, getOrdersPayed, paymentUser,
                salar, errorSaler, takedSaler,
                userSalary, errorUserSalary, takedUserSalary,
                date, format
            }
        }
    }
</script>
<template>
    <div class="payed">
        <h2 class="payed__title payed__title--head">Зарплата</h2>
        <form 
            @submit.prevent="saveSalary"
            class="payed__form"
            v-if="openModal"
        >
            <div class="payed__content">
                <UButton class="payed__close" type="button" @click="closeModal" modifier="red"></UButton>
                <h3 class="payed__sub-title">Установка зарплаты</h3>
                <UInput
                    name="Количество" 
                    v-model="salar" 
                    :start-value="salar"
                    :error="errorSaler"
                    @change="takedSaler = true" 
                    class="payed__input"
                    type="number"
                />
                <UButton type="submit">Установить зарплату</UButton>
            </div>
        </form>
        <div class="payed__header">
            <UButton v-for="warehouse in getWarehouses" :class="[{'u-button--active': page === warehouse.id}]" @click="changePage(warehouse.id)">{{warehouse.title}}</UButton>
        </div>
        <h2 class="payed__title payed__title--head">Сборщики склада</h2>
        <div :class="['payed__table']" v-if="getSalary.length">
            <div class="payed__table-item payed__table-item--head">
                Пользователь
            </div>
            <div class="payed__table-item payed__table-item--head">
                Зарплата
            </div>
            <div class="payed__table-item payed__table-item--head">
                Действия
            </div>
            <template v-for="salary in getSalary">
                <div class="payed__table-item">
                    {{ salary.name }}
                </div>
                <div class="payed__table-item payed__table-item--amount">
                    {{!!salary.salary ? `${salary.salary} рублей` : "Не указана" }}
                </div>
                <div class="payed__table-item">
                    <U-Button @click="changeSalary(salary)">Поменять зарплату</U-Button>
                </div>
            </template>
        </div>
        <h2 class="payed__sub-title">Выбор диапазона и сборщик</h2>
        <div class="payed__filter">
            <VueDatePicker 
                class="payed__input"
                v-model="date"
                range 
                :format="format" 
                :max-date="new Date()"
                :min-date="getMinDate"
                locale="ru-RU"
                :enable-time-picker="false"
                selectText="Выбрать"
                cancelText="Закрыть"
            /> 
            <UInput 
                class="payed__input"
                name="Сборщик"
                view="select"
                v-model="userSalary"
                :start-value="userSalary"
                :error="errorUserSalary"
                @change="takedUserSalary = true"
            >
                <option value=""></option>
                <option v-for="salary in getSalary" :value="salary.id">{{ salary.name }}</option>
            </UInput>
            <UButton @click="saveFilter">Найти данные</UButton>
        </div>
        <template v-if="getOrdersPayed">
            <h2 class="payed__final-payment">К оплате: {{ ordersChoice.length * getSalary.find(salary => salary.id === userSalary )?.salary }} рублей</h2>
            <UButton class="payed__payment-button" @click="paymentUser" :disabled="!ordersChoice.length">Оплатить зарплату</UButton>
            <OrdersPayed :ordersChoice="ordersChoice" v-model="ordersChoice" @changeOrder="changeOrder" :salary="+getSalary.find(salary => salary.id === userSalary )?.salary"/>
        </template>
    </div>
</template>
<style src="./Payed.scss" lang="scss" scoped />