<script>
    import { ref } from 'vue';
    import UButton from '../../../../components/_UIComponents/UButton/UButton.vue';
    import UInput from '../../../../components/_UIComponents/UInput/UInput.vue';
    import inputData from '../../../../hooks/inputData';
    import ModalOrder from './modalOrder/modalOrder.vue';
    import { typeAccounting } from '../../../../store/operator/type_accounting';
    import { products } from '../../../../store/products';
    import getKit from '../../../../hooks/getKit';

    export default {
        components: {
            UInput, UButton, ModalOrder
        },
        beforeCreate() {
            const {findTypeAccounting} = typeAccounting()
            findTypeAccounting()
        },
        setup() {
            const {getTypeAccounting, newOrders, sendMessage} = typeAccounting()
            const {value: track, error: errorTrack, takedValue: takedTrack} = inputData('', 'string')
            const {value: address, error: errorAddress, takedValue: takedAddress} = inputData('', 'string')
            const {value: delivery, error: errorDelivery, takedValue: takedDelivery} = inputData('', 'string')
            const {value: name, error: errorName, takedValue: takedName} = inputData('', 'string')
            const {value: comment,  takedValue: takedComment} = inputData('', 'string')
            const magnet = ref(false)
            const sets = [ "Очистка + Иммунитет","База","Альтгрибы для здоровья","Энергия, память, очистка ЖКТ","Капсулы и порошки","Курс 3 месяца","7 в 1","База-2","9 в 1"]
            
            const renderComponent = ref(false)
            const openModal = ref(false)
            const activeProduct = ref(null)
            const products = ref([])

            const acceptCreate = async () => {
                alert('Заказ создан')
                renderComponent.value = true;
                track.value = ""
                address.value = ""
                delivery.value = ""
                name.value = ""
                comment.value = ""

                magnet.value = false
                takedTrack.value = false
                takedAddress.value = false
                takedDelivery.value = false
                takedName.value = false
                takedComment.value = false

                products.value = []

                setTimeout(() => {
                    renderComponent.value = false;                    
                });
            }

            const newSendMessage = () => {
                sendMessage(`Создан ручной заказ ${track.value}`, track.value, acceptCreate)
            }

            const createOrder = () => {
                takedTrack.value = true
                takedAddress.value = true
                takedDelivery.value = true
                takedName.value = true
                if(!products.value.length) {
                    alert("Добавь товары")
                    return
                }
                if(track.value.trim().length && address.value.trim().length && delivery.value.trim().length && name.value.trim().length) {
                    let newProducts = []
                    products.value.forEach(({product}) => {
                        if(product.type === 'set') {
                            newProducts = [...newProducts, ...getKit(product.title, product.amount)]
                            return
                        }
                        newProducts.push({...product})
                    })
                    newOrders({magnet: magnet.value, products: newProducts}, {
                        track: track.value,
                        delivery: delivery.value,
                        name: name.value,
                        address: address.value,
                        comment: comment.value
                    }, newSendMessage)
                    
                }
            }

            const createProduct = () => {
                activeProduct.value = null
                openModal.value = true
            }

            const editProduct = (product) => {
                activeProduct.value = product
                openModal.value = true
            }

            const deleteProduct = ({id}) => {
                products.value = products.value.filter(product => product.id != id)
            }

            const addProduct = (product) => {
                if(activeProduct.value) {
                    products.value = products.value.map(item => {
                        if(item.id === activeProduct.value.id) {
                            return {
                                id: item.id,
                                product: product
                            }
                        }
                        return item
                    })
                    openModal.value = false
                    return
                }
                products.value.push({
                    id: Date.now(),
                    product: product
                })
                openModal.value = false
            }

            return {
                getTypeAccounting, createOrder, createProduct, addProduct, editProduct, products, sets, deleteProduct, renderComponent, magnet,
                track, errorTrack, takedTrack, 
                address, errorAddress, takedAddress, 
                delivery, errorDelivery, takedDelivery, 
                name, errorName, takedName, 
                comment, takedComment, 
                openModal, activeProduct,
            }
        }
    }
</script>
<template>
    <div class="hand-order">
        <form class="hand-order__form" @submit.prevent="createOrder" v-if="!renderComponent">
            <div class="hand-order__content">
                <div class="hand-order__info">
                    <UInput
                        name="ФИО"
                        v-model="name"
                        :start-value="name"
                        :error="errorName"
                        @blur="takedName = true"
                    />
                    <UInput
                        name="Трек-номер"
                        v-model="track"
                        :start-value="track"
                        :error="errorTrack"
                        @blur="takedTrack = true"
                    />
                    <UInput
                        name="Адрес"
                        v-model="address"
                        :start-value="address"
                        :error="errorAddress"
                        @blur="takedAddress = true"
                    />
                    <UInput
                        name="Комментарий"
                        v-model="comment"
                        :start-value="comment"
                        @blur="takedComment = true"
                        view="textarea"
                        :rows="8"
                    />
                    <UInput
                        name="Доставка"
                        v-model="delivery"
                        :start-value="delivery"
                        :error="errorDelivery"
                        @blur="takedDelivery = true"
                        view="select"
                    >
                        <option value=""></option>
                        <option value="CDEK">CDEK</option>
                        <option value="Почта России">Почта России</option>
                        <option value="Boxberry">Boxberry</option>
                    </UInput>
                    <label class="hand-order__magnet">
                        <input type="checkbox" @change="magnet = !magnet" :checked="magnet">
                        <span class="hand-order__marker"></span>
                        Добавить магнит
                    </label>
                </div>
                <div class="hand-order__products">
                    <p class="hand-order__sub-title">Товары</p>
                    <div class="hand-order__list" v-if="products.length">
                        <div class="hand-order__item" v-for="(product, key) in products">
                            <span>
                                <template v-if="product.product.type === 'set'">
                                    {{ key + 1 }}. Набор №{{ product.product.title }}: "{{ sets[+product.product.title - 1] }}"{{ product.product.amount > 1 ? ` x ${product.product.amount}` : ''}}
                                </template>
                                <template v-else>
                                    {{ key + 1 }}. {{ product.product.title }}, {{ product.product.count }} {{ product.product.measure_unit }}{{ product.product.amount > 1 ? ` x ${product.product.amount}` : ''}}
                                </template>
                            </span>
                            <UButton type="button" modifier="yellow" @click="editProduct(product)">Изменить товар</UButton>
                            <UButton type="button" modifier="red" @click="deleteProduct(product)">Удалить товар</UButton>
                        </div>
                    </div>
                    <UButton class="hand-order__add-product" @click="createProduct" type="button">
                        Добавить товар
                    </UButton>        
                </div>
            </div>
            <UButton>
                Создать заказ
            </UButton>
        </form>
        <ModalOrder v-if="openModal" :products="getTypeAccounting" @close="openModal = false" @createProduct="addProduct" :product="activeProduct?.product"></ModalOrder>        
    </div>
</template>
<style src="./handOrder.scss" lang="scss" scoped />