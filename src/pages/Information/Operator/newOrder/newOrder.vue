<script>
    import { computed, ref } from 'vue';
    import UButton from '@/components/_UIComponents/UButton/UButton.vue'
    import UInput from '@/components/_UIComponents/UInput/UInput.vue';
    import getKit from '../../../../hooks/getKit';
    import { typeAccounting } from '../../../../store/operator/type_accounting';
import getOrder from '../../../../hooks/getOrder';

    export default {
        components: {
            UButton, UInput
        },
        beforeCreate() {
            const {findTypeAccounting} = typeAccounting()
            findTypeAccounting()
        },
        setup() {
            const {newOrders, sendMessage} = typeAccounting()
            const firstValue = ref(``);
            const track = ref("");
            const deliveryOrder = ref("");
            const orderName = ref("");
            const orderAddress = ref("");
            const orderComment = ref("");
            const loading = ref(false)

            const changePhone = (text) => {
                let newText = text.replace("+7", "")
                return newText.match(/\+7/) ? changePhone(newText) : newText 
            }

            const changeValue = computed(() => {
                if(!firstValue.value.trim().length) {
                    return
                }
                const textArray = firstValue.value.split("\n")
                const {getDefaultOrder} = getOrder()
                return getDefaultOrder(textArray, track, deliveryOrder, orderName, orderAddress, orderComment, changePhone) 
            })

            const getProductsForWarehouse = computed(() => {
                if(!firstValue.value.trim().length) {
                    return 
                }
                const textArray = firstValue.value.split("\n")
                let orderWarehouse = {
                    products: [],
                    magnet: false
                }
                if(textArray.length) {
                    const price = +textArray.find(text => text.match('Сумма платежа:')).replace(/[^0-9]/g, '')
                    const orders = textArray.filter(text => text.match(/[0-9]\. [a-zA-Zа-яА-ЯёЁ]/))

                    if(orders.length) {
                        orders.forEach(order => {
                            const newOrder = {
                                title: "",
                                amount: 0,
                                measure_unit: "",
                                count: 0,
                            };

                            let fraction = order.split("Фракция")
                            const splitOrder = order.split(":")
                            if(splitOrder[0].indexOf("Набор") > -1) {
                                const number = splitOrder[0].split(".")[1].trim().replace(/[^0-9]/g, '')
                                const multiplier = +splitOrder[splitOrder.length - 1].split("(")[1].split(" ")[0]
                                orderWarehouse.products = [...orderWarehouse.products, ...getKit(number, multiplier)]
                                return
                            }
                            const splitCount = splitOrder[2].trim().split(" ")
                            
                            newOrder.amount = +splitOrder[1].split("(")[1].split(" ")[0]
                            newOrder.title = splitOrder[0].split(".")[1].trim()
                            newOrder.count = +splitCount[0]
                            newOrder.measure_unit = splitCount[1]
                            
                            
                            if(fraction.length > 1) {
                                fraction = fraction[1].split(":")
                                newOrder.title += `, фракция ${fraction[1].trim().toLowerCase()}`
                            }
                            orderWarehouse.products.push(newOrder)
                        })    
                        
                    }
                    const presents = textArray.filter(text => text.match('present'))
                    if(presents.length) {
                        presents.forEach(present => {
                            const splitPresent = present.split(':')
                            let presentPrice = splitPresent[0].split("-")
                            presentPrice = +presentPrice[presentPrice.length - 1]
                            if(price > presentPrice) {
                                const presentName = splitPresent[1].trim()
                                if(splitPresent[1].match('Фирменный магнит')) {
                                    orderWarehouse.magnet = true
                                    return
                                }

                                if(presentName === "Чай гриб Чага 100%, 100 грамм") {
                                    orderWarehouse.products.push({
                                        title: "Гриб чага крошка/кусочки, фракция крошка 1-3 мм",
                                        amount: 1,
                                        measure_unit: "грамм",
                                        count: 100,
                                    })
                                    return
                                }

                                if(presentName === "Красный мухомор, 25 грамм!") {
                                    orderWarehouse.products.push({
                                        title: "Крупные шляпки красного мухомора",
                                        amount: 1,
                                        measure_unit: "грамм",
                                        count: 25,
                                    })
                                    return
                                }

                                if(presentName === "Пижма омолаживающая, курс 100 капсул") {
                                    orderWarehouse.products.push({
                                        title: "Капсулы с порошком из пижмы",
                                        amount: 1,
                                        measure_unit: "капсул",
                                        count: 100,
                                    })
                                    return
                                }

                                if(presentName === "Полынь для очищения ЖКТ, курс 100 капсул") {
                                    orderWarehouse.products.push({
                                        title: "Капсулы с порошком из майской полыни ЖКТ",
                                        amount: 1,
                                        measure_unit: "капсул",
                                        count: 100,
                                    })
                                    return
                                }
                            }
                        })
                    }
                }
                
                return orderWarehouse
            })

            const orderCreated = () => {
                alert("Заказ создан")
                track.value = ""
                firstValue.value = ""
                deliveryOrder.value = ""
                orderName.value = ""
                orderAddress.value = ""
                orderComment.value = ""
                setTimeout(() => {
                    loading.value = false
                });
            }

            const newSendMessage = () => {
                sendMessage(changeValue.value.join('\n'), track.value, orderCreated)
            }

            const createOrder = () => {
                loading.value = true
                if(track.value.trim().length > 0 && getProductsForWarehouse.value) {
                    newOrders(getProductsForWarehouse.value, { track: track.value, delivery: deliveryOrder.value, name: orderName.value, address: orderAddress.value, comment: orderComment.value }, newSendMessage)
                    return
                }
                alert("Не хватает данных")
            }

            return {
                changeValue, firstValue, track, getProductsForWarehouse, newOrders, createOrder, loading
            }
        },
    }
</script>

<template>
    <div class="operator">
        <h2 class="operator__loading" v-if="loading">Идет загрузка</h2>
        <div class="operator__info" v-else=>
            <div class="operator__inputs">
                <u-input class="operator__input" name="Трек-номер" v-model="track" :startValue="track"></u-input>
                <u-input class="operator__input" name="Информация из бота тильды" view="textarea" :rows="30" v-model="firstValue" :startValue="firstValue"></u-input>
            </div>
            <div class="operator__accept-text">
                <p class="operator__client">
                    <span v-for="text in changeValue">{{ text }}</span>
                </p>
            </div>
        </div>
        <u-button @click="createOrder">Создать заказ</u-button>
    </div>
</template>

<style src="./newOrder.scss" lang="scss" scoped />