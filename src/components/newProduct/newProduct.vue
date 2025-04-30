<script>
    import { ref } from 'vue';
    import UInput from '../_UIComponents/UInput/UInput.vue';
    import UButton from '../_UIComponents/UButton/UButton.vue';
    export default {
        components: {
            UInput, UButton
        },
        props: {
            products: {
                type: Array,
                required: true
            },
        },
        setup({products}, {emit}) {
            const title = ref("")
            const amount = ref(1)
            const count = ref(0)
            const measureUnit = ref("")

            const updateProduct = () => {
                measureUnit.value = products.find(product => product.title === title.value).products[0].measure_unit
                emit('updateProduct', {
                    title: title.value,
                    amount: amount.value,
                    count: count.value,
                    measure_unit: measureUnit.value,
                })
            }

            return {
                title,
                amount,
                count,
                measureUnit,
                updateProduct
            }
        },
    }
</script>

<template>
  <div class="new-product">
    <u-input name="Товар" class="new-product__select" view="select" v-model="title" @change="updateProduct">
        <option v-for="product in products"  :value="product.title" >{{ product.title }}</option>
    </u-input>
    <template v-if="title.trim().length">
        <u-input name="Размер" v-model="count" type="number" @change="updateProduct"></u-input>
        <p class="new-product__measure">{{ products.find(product => product.title === title).products[0].measure_unit }}</p>
        <u-input name="Количество" v-model="count" type="number" @change="updateProduct" :start-value="amount"></u-input>
    </template>
  </div>
</template>

<style src="./newProduct.scss" lang="scss" scoped />