<script>
    import { computed, ref, watch } from 'vue';
    import { warehouseOrders } from '../../../../store/warehouse/orders';
    import UButton from '@/components/_UIComponents/UButton/UButton.vue'
    import UInput from '../../../../components/_UIComponents/UInput/UInput.vue';
    import OrderItem from './Order-item/Order-item..vue';
    import Counter from '../../../../components/Counter/Counter.vue';
    export default {
        components: {
            UButton, UInput, OrderItem, Counter
        },
        beforeCreate() {
            const {findOrders} = warehouseOrders()
            findOrders()
        },
        setup() {
            const { getOrders, getBoxes, finalOrder, findOrders, updateStatus, checkStatusOrder} = warehouseOrders()
            const openOrder = ref(null);
            const checked = ref([]);
            const ordersChoice = ref([]);
            const page = ref("created");
            const filter = ref("all")
            const selectAll = ref(false)
            const loading = ref(false)
            const boxes = ref([
                {
                    id: Date.now(),
                    value: '',
                    count: 1,
                }
            ])

            const closeOrder = () => {
                openOrder.value = null
                checked.value = []
            }

            const submitOrder = () => {
                const checkOrder = checked.value.length === openOrder.value.products.length
                if(!checkOrder) {
                    alert("Не все положил");
                    return
                } 

                if(boxes.value.filter(box => box.value != "").length !== boxes.value.length) {
                    alert("Выбери все виды коробок")
                    return
                }

                if(confirm("Точно все собрал?")) {
                    finalOrder(openOrder.value.id, boxes.value, closeOrder)
                }
            }

            const changePage = (text) => {
                selectAll.value = false
                changeChoices(false)
                page.value = text
                findOrders(page.value)
            }

            const reload = () => {
                findOrders(page.value)
                alert("Список обновлен")
            }

            const changeStatus = () => {
                updateStatus(ordersChoice.value, page.value)
            }

            watch(openOrder, () => {
                if(openOrder.value) {
                    checked.value = openOrder.value.products.filter(product => !!+product.ready)?.map(product => product.id)
                }
            })

            const orderFiltered = computed(() => {
                if(filter.value === 'all') {
                    return getOrders.value
                }
                
                return getOrders.value.filter(order => order.delivery === filter.value)   
            })

            watch(orderFiltered, () => {
                if(page.value !== 'assembled' && filter.value !== 'all' && orderFiltered.value.length === 0 && getOrders.value.length > 0) {
                    alert(`Закончились заказы в службе доставки ${filter.value}`)
                    filter.value = 'all'
                    return
                } 
                if(page.value === 'assembled' && orderFiltered.value.length === 0 && getOrders.value.length > 0) {
                    loading.value = true
                    filter.value = 'all'
                    setTimeout(() => {
                        loading.value = false;
                    }, 100);
                }
            })

            const openOrderFunction = async (order) => {
                if(page.value === 'created') {
                    await checkStatusOrder(order, openOrder, closeOrder)
                    return
                }
                openOrder.value = order
            }

            watch([ordersChoice, orderFiltered], () => {
                selectAll.value = ordersChoice.value.length === orderFiltered.value.length
            })

            const changeChoices = (checked) => {
                selectAll.value = checked
                ordersChoice.value = checked ? orderFiltered.value.map(order => order.id) : []
            }

            const changeDelivery = (text) => {
                const deliverys = [
                    {
                        delivey: 'Boxberry',
                        text: 'BB',
                    },
                    {
                        delivey: 'Почта России',
                        text: 'ПТ',
                    },
                    {
                        delivey: 'CDEK',
                        text: 'CD',
                    }
                ]
                return deliverys.find(delivery => delivery.delivey === text).text
            }


            return {
                getOrders, openOrder, openOrderFunction, checked, submitOrder, reload, closeOrder, page, changePage, changeStatus, filter, orderFiltered, getBoxes, boxes,
                ordersChoice, changeChoices, selectAll, changeDelivery, loading
            }
        },
    }
</script>

<template>
    <div class="orders">
        <h2 class="orders__title">Заказы {{ !loading ? orderFiltered.length : "" }}</h2>
        <div class="orders__header-wrapper">
            <div class="orders__header">
                <u-button :class="[{'u-button--active': page === 'created'}]"  @click="changePage('created')">Текущие заказы</u-button>
                <u-button :class="[{'u-button--active': page === 'assembled'}]"  @click="changePage('assembled')">Собранные заказы</u-button>
                <u-button :class="[{'u-button--active': page === 'sended'}]"  @click="changePage('sended')">Отправленные заказы</u-button>
            </div>
        </div>
        <h2 class="orders__title">{{ page === "created" ? 'Текущие' : page === 'assembled' ? 'Собранные' : 'Отправленные' }} заказы</h2>
        <div class="orders__filter" v-if="!loading  && orderFiltered.length">
            <UInput name="Служба доставки" view="select" v-model="filter" :start-value="filter" @change="changeChoices(false)">
                <option value="all">Все службы доставки</option>
                <option v-if="getOrders.find(order => order.delivery === 'Boxberry')" value="Boxberry">Boxberry</option>
                <option v-if="getOrders.find(order => order.delivery === 'Почта России')" value="Почта России">Почта России</option>
                <option v-if="getOrders.find(order => order.delivery === 'CDEK')" value="CDEK">CDEK</option>
            </UInput>
            <UButton v-if="page === 'assembled' && ordersChoice.length" @click="changeStatus">Отправить посылки</UButton>
        </div>
        <div class="orders__table-item orders__table-takes" v-if="page === 'assembled' && orderFiltered.length">
                <label class="order__checkbox" >
                    <input type="checkbox" @change="changeChoices($event.target.checked)" :checked="!!selectAll">
                    <span class="order__marker"></span>
                </label>
                <p>Выбрать все</p>
            </div>
        <div :class="['orders__table', {'orders__table--assembled': page === 'assembled'}]" v-if="orderFiltered.length">
            <!-- <div class="orders__table-item orders__table-item--head" v-if="page === 'assembled'">
                <label class="order__checkbox order__checkbox--assembled" >
                    <input type="checkbox" @change="changeChoices($event.target.checked)" :checked="!!selectAll">
                    <span class="order__marker"></span>
                </label>
            </div>
            <div class="orders__table-item orders__table-item--head">
                Трек-номер
            </div>
            <div class="orders__table-item orders__table-item--head">
                Имя
            </div>
            <div class="orders__table-item orders__table-item--head">
                Доставка
            </div>
            <div class="orders__table-item orders__table-item--head">
                Товаров
            </div> -->
            <template v-for="order in orderFiltered">
                <div v-if="page === 'assembled'" :class="['orders__table-item', {'orders__table-item--priority': !!+order.priority && page === 'created'}]">
                    <label class="order__checkbox">
                        <input type="checkbox" v-model="ordersChoice" :value="order.id">
                        <span class="order__marker"></span>
                    </label>
                </div>
                <div @click="openOrderFunction(order)" :class="['orders__table-item', {'orders__table-item--priority': !!+order.priority && page === 'created'}]">
                    {{ order.track }}
                </div>
                <div @click="openOrderFunction(order)" :class="['orders__table-item orders__table-item--name', {'orders__table-item--priority': !!+order.priority && page === 'created'}]">
                    {{ order.name }}
                </div>
                <div @click="openOrderFunction(order)" :class="['orders__table-item orders__table-item--center', {'orders__table-item--priority': !!+order.priority && page === 'created'}]">
                    {{ changeDelivery(order.delivery) }}
                </div>
                <div @click="openOrderFunction(order)" :class="['orders__table-item  orders__table-item--center', {'orders__table-item--priority': !!+order.priority && page === 'created'}]">
                    {{ order.products.length }}
                </div>
            </template>
        </div>
        <div class="orders__empty" v-else>
            <h3 class="orders__sub-title">В данный момент заказов нет</h3>
            <u-button @click="reload">Обновить список</u-button>
        </div>
        <Teleport to="body" v-if="openOrder">
            <div class="order">
                <div :class="['order__content', {'order__content--visual': page !== 'created'}]">
                    <button class="order__close" @click="closeOrder"></button>
                    <div class="order__wrapper">
                        <h3 class="order__title">{{openOrder.track}}</h3>
                        <p class="order__information">Информация о заказе:</p>
                        <p class="order__text"><b>Служба доставки:</b> {{ openOrder.delivery }}</p>
                        <p class="order__text"><b>ФИО:</b> {{ openOrder.name }}</p>
                        <p class="order__text"><b>Адрес:</b> {{ openOrder.address }}</p>
                        <p class="order__text"><b>Дата:</b> {{ openOrder.date_created.split("-").reverse().join('.') }}</p>
                        <p class="order__text" v-if="openOrder.comment"><b>Комментарий:</b> {{ openOrder.comment }}</p>
                        <p class="order__text order__text--status"><b>{{ page === "created" ? 'Новый' : page === 'assembled' ? 'Собран' : 'Отправлен' }}</b></p>
                        <p class="order__information">Товары:</p>
                    </div>
                    <div class="order__box" v-if="page === 'created'">
                        <div class="order__box-item" v-for="box in boxes" :key="box.id">
                            <UInput class="order__box-input" name="Выберите коробку" view="select" v-model="box.value">
                                <option value=""></option>
                                <option v-for="boxValue in getBoxes" :value="boxValue.id" >{{ boxValue.title }}</option>
                            </UInput>
                            <UButton v-if="boxes.length > 1" @click="boxes = boxes.filter(boxFilt => boxFilt.id !== box.id)" modifier="red">Удалить</UButton>
                        </div>
                        <UButton class="order__add-box" v-if="boxes.length < 2" @click="boxes.push({id: Date.now(), value: '',count: 1,})">Добавить коробку</UButton>
                    </div>
                    <div class="order__table">
                        <template v-for="(product, key) in openOrder.products">
                            <div :class="['order__table-item', {'order__table-item--active': checked.find(check => check === product.id)}]">
                                <label class="order__checkbox">
                                    <input type="checkbox" v-model="checked" :value="product.id">
                                    <span class="order__marker"></span>
                                </label>
                            </div>
                            <div :class="['order__table-item order__table-item--title', {'order__table-item--active': checked.find(check => check === product.id)}]">
                                {{ product.title }}
                            </div>
                            <div :class="['order__table-item']">
                                <template v-if=" product.type === 'accounting'">
                                    <span class="order__table-text">
                                        {{ product.count }} {{ product.measure_unit.trim() }}
                                    </span>
                                    <span class="order__table-text order__table-text--mobile">
                                        {{ product.count }} {{ product.measure_unit.trim()[0] }}
                                    </span>
                                </template>
                            </div>
                            <div :class="['order__table-item', {'order__table-item--bold': +product.amount > 1}]">
                                <span class="order__table-text">
                                    {{ product.amount }} шт.
                                </span>
                                <span class="order__table-text order__table-text--mobile">
                                    {{ product.amount }}
                                </span>
                            </div>
                            
                        </template>
                    </div>
                    <u-button v-if="page === 'created'" class="order__submit" @click="submitOrder">Подтвердить сбор заказа</u-button>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style src="./Orders.scss" lang="scss" scoped />