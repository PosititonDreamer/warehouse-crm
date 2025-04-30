<script>
import { ref, watch } from 'vue';
import UButton from '../../../../components/_UIComponents/UButton/UButton.vue';
import { payed } from '../../../../store/payed';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import OrdersPayed from '../../../../components/OrdersPayed/OrdersPayed.vue';
import { ordersPayed } from '../../../../store/ordersPayed';
import { authorization } from '../../../../store/authorization';

    export default {
        components: {
            UButton,  VueDatePicker, OrdersPayed
        },
        beforeCreate() {
            const {findMinDate} = payed()

            findMinDate()
        },

        beforeUnmount() {
            const {resetOrdersPayed} = ordersPayed()
            resetOrdersPayed()
        },
        setup() {
            const { getMinDate } = payed()
            const {getUser} = authorization()
            const {findPayedOrders, getOrdersPayed, resetOrdersPayed} = ordersPayed()
            const date = ref([])


            watch([date], () => {
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
                if(date.value.length === 0) {
                    alert("Выбери дату!");
                    return
                }

                findPayedOrders({min_date: date.value[0], max_date: date.value[1], user_id: getUser.value.id})
            }   



            return {
                getMinDate, saveFilter, getOrdersPayed, getUser,
                
                date, format
            }
        }
    }
</script>
<template>
    <div class="payed">
        <h2 class="payed__title payed__title--head">Зарплата: {{ getUser.salary }} рублей за посылку</h2>
        <h2 class="payed__sub-title">Выбор диапазона</h2>
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
            <UButton @click="saveFilter">Найти данные</UButton>
        </div>
        <template v-if="getOrdersPayed">
            <OrdersPayed :ordersChoice="ordersChoice" v-model="ordersChoice" @changeOrder="changeOrder" :salary="+getUser.salary"/>
        </template>
    </div>
</template>
<style src="./Payed.scss" lang="scss" scoped />