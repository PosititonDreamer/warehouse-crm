<script>
import { ref } from 'vue';
import UButton from '../../../../../components/_UIComponents/UButton/UButton.vue';
import UInput from '../../../../../components/_UIComponents/UInput/UInput.vue';
import inputData from '../../../../../hooks/inputData';

    export default {
        components: {
            UButton,
            UInput
        },
        props: {
            products: {
                type: Array,
                required: true
            },
            product: {
                type: [null, Object],
                default: null
            }
        },
        setup({product, products}, {emit}) {
            const {value: typeProduct, error: typeError, takedValue: takedType} = inputData(product ? product.type : "", "string")
            const {value: title, error: titleError, takedValue: titleTaked} = inputData(product ? product.title : "", "string")
            const {value: amount, error: amountError, takedValue: amountTaked} = inputData(product ? product.amount : 1, "number", 1)
            const {value: count, error: countError, takedValue: countTaked} = inputData(product ? product.count : 0, "number", 1)
            const loading = ref(false)

            const createProduct = () => {
                takedType.value = true
                if(typeProduct.value === "set") {
                    titleTaked.value = true
                    amountTaked.value = true
                    if(title.value.trim().length && amount.value > 0) {
                        emit('createProduct', {
                            type: typeProduct.value,
                            title: title.value,
                            amount: amount.value,
                        })
                    }
                }
                if(typeProduct.value === 'product') {
                    titleTaked.value = true
                    amountTaked.value = true
                    countTaked.value = true
                    if(title.value.trim().length && amount.value > 0 && count.value > 0) {
                        emit('createProduct', {
                            type: typeProduct.value,
                            title: title.value,
                            amount: amount.value,
                            count: count.value,
                            measure_unit: products.find(product => product.title === title.value)?.products[0].measure_unit
                        })
                    }
                }
                
            }

            const changeType = () => {
                loading.value = true
                title.value = ""
                amount.value = 1
                count.value = 0
                titleTaked.value = false
                amountTaked.value = false
                countTaked.value = false

                takedType.value = true
                setTimeout(() => {
                    loading.value = false
                });
            }

            return {
                createProduct, changeType, loading,
                typeProduct, typeError, takedType,
                title, titleError, titleTaked,
                amount, amountError, amountTaked,
                count, countError, countTaked,
            }
        }
    }
</script>
<template>
    <Teleport to="body">
        <form class="modal-order" @submit.prevent="createProduct" >
            <div class="modal-order__content" v-if="!loading">
                <h2 class="modal-order__title">Выбор товара</h2>
                <button class="modal-order__close" type="button" @click="$emit('close')"></button>
                <UInput
                    name="Тип"
                    view="select"
                    v-model="typeProduct"
                    :start-value="typeProduct"
                    :error="typeError"
                    @change="changeType"
                >
                    <option value=""></option>
                    <option value="set">Набор</option>
                    <option value="product">Товар</option>
                </UInput>
                <template v-if="typeProduct === 'set'">
                    <UInput
                        name="Набор"
                        view="select"
                        v-model="title"
                        :start-value="title"
                        :error="titleError"
                        @change="titleTaked = true"
                    >
                        <option value=""></option>
                        <option value="1">Набор 1: "Очистка + Иммунитет"</option>
                        <option value="2">Набор 2: "База"</option>
                        <option value="3">Набор 3: "Альтгрибы для здоровья"</option>
                        <option value="4">Набор 4: "Энергия, память, очистка ЖКТ"</option>
                        <option value="5">Набор 5: "Капсулы и порошки"</option>
                        <option value="6">Набор 6: "Курс 3 месяца"</option>
                        <option value="7">Набор 7: "7 в 1"</option>
                        <option value="8">Набор 8: "База-2"</option>
                        <option value="9">Набор 9: "9 в 1"</option>
                    </UInput>
                    <UInput 
                        key="set-amount"
                        name="Количество"
                        type="number"
                        v-model="amount"
                        :start-value="amount"
                        :error="amountError"
                        @change="amountTaked = true"
                    />

                </template>
                <template v-if="typeProduct === 'product'">
                    <UInput
                        name="Товар"
                        view="select"
                        v-model="title"
                        :start-value="title"
                        :error="titleError"
                        @change="titleTaked = true"
                    >
                        <option value=""></option>
                        <option v-for="product in products" :value="product.title">{{ product.title }}</option>
                    </UInput>   
                    <div class="modal-order__item">
                        <UInput 
                            name="Упаковка"
                            type="number"
                            v-model="count"
                            :start-value="count"
                            :error="countError"
                            @change="countTaked = true"
                        /> 
                        {{ title ? products.find(product => product.title === title)?.products[0].measure_unit : 'Количество' }}
                    </div>
                    <UInput 
                        key="product-amount"
                        name="Количество"
                        type="number"
                        v-model="amount"
                        :start-value="amount"
                        :error="amountError"
                        @change="amountTaked = true"
                    /> 
                </template>
                <UButton type="submit">Добавить товар</UButton>
            </div>
        </form>
    </Teleport>
</template>

<style src="./modalOrder.scss" lang="scss" scoped />