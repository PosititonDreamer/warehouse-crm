<script>
    import { computed, ref } from 'vue';
    import UButton from '@/components/_UIComponents/UButton/UButton.vue'
    import NewOrder from './newOrder/newOrder.vue';
    import HandOrder from './handOrder/handOrder.vue';
    import Orders from './Orders/Orders.vue';

    export default {
        components: {
            UButton, UButton, NewOrder, HandOrder, Orders
        },
        setup() {
            const page = ref('newOrder')

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
            <u-button :class="[{'u-button--active': getPage === 'newOrder'}]"  @click="page = 'newOrder'">Создать заказ из бота</u-button>
            <u-button :class="[{'u-button--active': getPage === 'handOrder'}]"  @click="page = 'handOrder'">Создать заказ вручную</u-button>
            <u-button :class="[{'u-button--active': getPage === 'orders'}]"  @click="page = 'orders'">Заказы</u-button>
        </div>
        <div class="warehosue__content">
            <NewOrder v-if="getPage === 'newOrder'"></NewOrder>
            <HandOrder v-if="getPage === 'handOrder'"></HandOrder>
            <Orders v-if="getPage === 'orders'"></Orders>
        </div>
    </div>
</template>

<style src="./Operator.scss" lang="scss" scoped />