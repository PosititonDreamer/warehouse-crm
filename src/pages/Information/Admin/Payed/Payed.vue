<script>
import {computed, ref, watch} from 'vue';
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
import {penalties} from "@/store/penalty.js";

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
            const { getPenalties, findPenalties, updatePenalties, createPenalties } = penalties()
            const {findPayedOrders, getOrdersPayed, resetOrdersPayed} = ordersPayed()
            const page = ref(null)
            const openModal = ref(false)
            const id = ref(0)
            const {value: salar, error: errorSaler, takedValue: takedSaler} = inputData(0, 'number')
            const {value: userSalary, error: errorUserSalary, takedValue: takedUserSalary} = inputData("", 'string')
            const date = ref([])
            const ordersChoice = ref([])
            const penaltiesChoice = ref([])
            const penalty = ref(null)
            const {value: sumPenalty, error: errorSumPenalty, takedValue: tackedSumPenalty} = inputData(0, 'number')
            const {value: descriptionPenalty, error: errorDescriptionPenalty, takedValue: tackedDescriptionPenalty} = inputData('', 'string')

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

            const saveFilter = (beforeCreatePenalty = false) => {
                if(beforeCreatePenalty) {
                  penalty.value = null
                }
                if(date.value.length === 0) {
                    if(!beforeCreatePenalty) {
                      alert("Выбери дату!");
                      takedUserSalary.value = true
                    }
                    return
                }

                if(+userSalary.value > 0) {
                    ordersChoice.value = []
                    findPayedOrders({min_date: date.value[0], max_date: date.value[1], user_id: userSalary.value})
                    findPenalties({min_date: date.value[0], max_date: date.value[1], user_id: userSalary.value})
                }
            }

            const changeOrder = (data) => {
                if(data.check) {
                    ordersChoice.value.push(data.id)
                    return
                }
                ordersChoice.value = ordersChoice.value.filter(id => id != data.id)
            }

            const changePenalty = (data) => {
              if(data.check) {
                penaltiesChoice.value.push(data.id)
                return
              }
              penaltiesChoice.value = penaltiesChoice.value.filter(id => id != data.id)
            }

            const paymentUser = () => {
                if(confirm("Точно оплатил выбранные заказы?")) {
                  updatePenalties(penaltiesChoice.value)
                  paymentOrders(ordersChoice.value, saveFilter)
                }
            }

            const closePenalty = (beforeCreatePenalty = false) => {
                penalty.value = null
                tackedDescriptionPenalty.value = false
                tackedSumPenalty.value = false
                sumPenalty.value = 0
                descriptionPenalty.value = ""

                if(beforeCreatePenalty) {
                  saveFilter(true)
                }

            }

            const savePenalty = () => {
              tackedDescriptionPenalty.value = true
              tackedSumPenalty.value = true
              if(sumPenalty.value > 0 && descriptionPenalty.value.length > 0) {
                const data = {
                  price: sumPenalty.value,
                  user_id: penalty.value,
                  comment: descriptionPenalty.value
                }
                createPenalties(data, closePenalty)
              } else {
                alert("Заполните все обязательные поля")
              }
            }

            const sumChoicePenalties = computed(() => {
              let sum = 0;
              getPenalties.value.penalties_not_completed?.forEach(penalty => {
                 if(penaltiesChoice.value.find(choice => choice === penalty.id)) {
                   sum += +penalty.price
                 }
              })
              return sum
            })

            return {
                getWarehouses, page, changePage, getSalary, changeSalary, closeModal, saveSalary, openModal,  getMinDate, saveFilter, ordersChoice,  changeOrder, getOrdersPayed, paymentUser,
                salar, errorSaler, takedSaler,
                userSalary, errorUserSalary, takedUserSalary,
                date, format, penalty, closePenalty, savePenalty,
                sumPenalty, errorSumPenalty, tackedSumPenalty,
                descriptionPenalty, errorDescriptionPenalty, tackedDescriptionPenalty,
                penaltiesChoice, changePenalty, sumChoicePenalties

            }
        }
    }
</script>
<template>
    <div class="payed">
        <h2 class="payed__title payed__title--head">Зарплата</h2>
        <form
            @submit.prevent="savePenalty"
            class="payed__form"
            v-if="penalty"
        >
            <div class="payed__content">
                <UButton class="payed__close" type="button" @click="closePenalty" modifier="red"></UButton>
                <h3 class="payed__sub-title">Выписка штрафа</h3>
                <UInput
                    name="Сумма штрафа"
                    v-model="sumPenalty"
                    :error="errorSumPenalty"
                    :start-value="sumPenalty"
                    @change="tackedSumPenalty = true"
                    class="payed__input"
                    type="number"
                />
              <UInput
                    name="Описание штрафа"
                    v-model="descriptionPenalty"
                    :error="errorDescriptionPenalty"
                    :start-value="descriptionPenalty"
                    @change="tackedDescriptionPenalty = true"
                    class="payed__input"
                    type="text"
                    view="textarea"
                    :rows="6"
                />
                <UButton type="submit">Выписать штраф</UButton>
            </div>
        </form>

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
                    <U-Button modifier="red" @click="penalty = salary.id">Выписать штраф</U-Button>
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
            <UButton class="payed__find-button" @click="saveFilter()">Найти данные</UButton>
        </div>
        <template v-if="getOrdersPayed">
            <h2 class="payed__final-payment">К оплате: {{ ordersChoice.length * getSalary.find(salary => salary.id === userSalary )?.salary - sumChoicePenalties }} рублей</h2>
            <UButton class="payed__payment-button" @click="paymentUser" :disabled="!ordersChoice.length && !penaltiesChoice.length">Оплатить зарплату</UButton>
            <OrdersPayed
                :penaltiesChoice="penaltiesChoice"
                :ordersChoice="ordersChoice"
                v-model="ordersChoice"
                @changeOrder="changeOrder"
                :salary="+getSalary.find(salary => salary.id === userSalary )?.salary"
                @changePenalty="changePenalty"
                @changeAllPenalty="(e) => penaltiesChoice = e"
            />
        </template>
    </div>
</template>
<style src="./Payed.scss" lang="scss" scoped />