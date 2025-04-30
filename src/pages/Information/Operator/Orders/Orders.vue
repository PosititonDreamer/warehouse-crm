<script>
    import { ref, watch } from 'vue';
    import { warehouseOrders } from '../../../../store/warehouse/orders';
    import UButton from '@/components/_UIComponents/UButton/UButton.vue'
    export default {
        components: {
            UButton
        },
        beforeCreate() {
            const {findOrders} = warehouseOrders()
            findOrders()
        },
        setup() {
            const { getOrders, finalOrder, findOrders, updateStatus} = warehouseOrders()
            const openOrder = ref(null);
            const checked = ref([]);
            const page = ref("created");
            const prority = ['Стандартный', 'Повышенный', 'Высокий']

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
                if(confirm("Точно все собрал?")) {
                    finalOrder(openOrder.value.id, closeOrder)
                }
            }

            const changePage = (text) => {
                page.value = text
                findOrders(page.value)
            }

            const reload = () => {
                findOrders(page.value)
                alert("Список обновлен")
            }

            const changeStatus = ({id}) => {
                updateStatus(id, page.value)
            }

            watch(openOrder, () => {
                if(openOrder.value) {
                    checked.value = openOrder.value.products.filter(product => !!+product.ready)?.map(product => product.id)
                }
            })

            return {
                getOrders, openOrder, checked, submitOrder, reload, closeOrder, page, changePage, changeStatus, prority
            }
        },
    }
</script>

<template>
    <div class="orders">
        <h2 class="orders__title">Заказы</h2>
        <div class="orders__header">
            <u-button :class="[{'u-button--active': page === 'created'}]"  @click="changePage('created')">Текущие заказы</u-button>
            <u-button :class="[{'u-button--active': page === 'assembled'}]"  @click="changePage('assembled')">Собранные заказы</u-button>
            <u-button :class="[{'u-button--active': page === 'sended'}]"  @click="changePage('sended')">Отправленные заказы</u-button>
            <u-button :class="[{'u-button--active': page === 'finished'}]"  @click="changePage('finished')">Завершенные</u-button>
        </div>
        <h2 class="orders__title">{{ page === "created" ? 'Текущие' : page === 'assembled' ? 'Собранные' : 'Отправленные' }} заказы</h2>
        <div class="orders__table" v-if="getOrders.length">
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
            </div>
            <div class="orders__table-item orders__table-item--head">
                Приоритет
            </div>
            <div class="orders__table-item orders__table-item--head">
                Действия
            </div>
            <template v-for="order in getOrders">
                <div class="orders__table-item">
                    {{ order.track }}
                </div>
                <div class="orders__table-item">
                    {{ order.name }}
                </div>
                <div class="orders__table-item orders__table-item--center">
                    {{ order.delivery }}
                </div>
                <div class="orders__table-item  orders__table-item--center">
                    {{ order.products.length }}
                </div>
                <div class="orders__table-item  orders__table-item--center">
                    {{ prority[+order.priority] }}
                </div>
                <div class="orders__table-item">
                    <u-button @click="openOrder = order">Посмотреть заказ</u-button>
                    <u-button modifier="yellow">Изменить заказ</u-button>
                </div>
            </template>
        </div>
        <div class="orders__empty" v-else>
            <h3 class="orders__sub-title">В данный момент заказов нет</h3>
            <u-button @click="reload">Обновить список</u-button>
        </div>
        <Teleport to="body" v-if="openOrder">
            <div class="order">
                <div class="order__content order__content--visual">
                    <button class="order__close" @click="closeOrder"></button>
                    <div class="order__wrapper">
                        <h3 class="order__title">{{openOrder.track}}</h3>
                        <p class="order__information">Информация о заказе:</p>
                        <p class="order__text"><b>Служба доставки:</b> {{ openOrder.delivery }}</p>
                        <p class="order__text"><b>ФИО:</b> {{ openOrder.name }}</p>
                        <p class="order__text"><b>Адрес:</b> {{ openOrder.address }}</p>
                        <p class="order__text order__text--status"><b>{{ page === "created" ? 'Новый' : page === 'assembled' ? 'Собран' : 'Отправлен' }}</b></p>
                        <p class="order__text" v-if="openOrder.comment">Комментарий: {{ openOrder.comment }}</p>
                        <p class="order__information">Товары:</p>
                    </div>
                    <div class="order__table">
                        <template v-for="(product, key) in openOrder.products">
                            <div :class="['order__table-item', {'order__table-item--active': checked.find(check => check === product.id)}]">
                                {{ product.title }}
                            </div>
                            <div :class="['order__table-item', {'order__table-item--active': checked.find(check => check === product.id)}]">
                                {{ product.count }} {{ product.measure_unit }}
                            </div>
                            <div :class="['order__table-item', {'order__table-item--active': checked.find(check => check === product.id)}]">
                                {{ product.amount }} шт.
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style src="./Orders.scss" lang="scss" scoped />