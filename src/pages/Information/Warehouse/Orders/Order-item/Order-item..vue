<script>
    export default {
        props: {
            order: {
                type: Object,
                required: true
            }
        },
        setup() {
            
        }
    }
</script>
<template>
    <div class="order-item" @click="$emit('openOrder')">
        <p class="order-item__title">{{ order.track }}</p>
        <p class="order-item__text">{{ order.name }}</p>
        <p class="order-item__text">{{ order.delivery }}</p>
        <p class="order-item__text">{{ order.date_created.split("-").reverse().join('.') }} Товаров:{{ order.products.length }}</p>
    </div>
</template>
<style src="./Order-item.scss" lang="scss" scoped />