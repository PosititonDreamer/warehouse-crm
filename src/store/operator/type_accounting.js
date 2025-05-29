import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authorization } from '../authorization';

export const typeAccounting = defineStore('typeAccounting', () => {

    const typeAccounting = ref([])

    const getTypeAccounting = computed(() => {
        return typeAccounting
    })
    
    const findTypeAccounting = async () => {
        const data = await fetch(`${window.requst}/api/operator/type_accounting.php`, {
            method: 'GET'
        })
        const result = await data.json()
        
        if (result.status) {
            const newTypes = []
            
            result.type_accounting.forEach(type => {
                const findType = newTypes.find(newType => newType?.title === type.title)
                if(findType) {
                    findType.products.push({
                        id: type.id,
                        measure_unit: type.measure_unit,
                        count: type.count
                    })
                    return
                }
                newTypes.push({
                    title: type.title,
                    products: [
                        {
                            id: type.id,
                            measure_unit: type.measure_unit,
                            count: type.count
                        }
                    ]
                })
            })
            newTypes.forEach(type => {
                type.products.sort((a, b) => b.count - a.count)
            })
            typeAccounting.value = newTypes
        }
    }

    const sendMessage = async (text, track, closeFunction) => {
        const formData = new FormData()
        formData.append('text', text)
        formData.append('track', track)
        const data = await fetch(`${window.requst}/api/send_bot_message.php`, {
            method: 'POST',
            body: formData
        })
        const result = await data.json()
        if (result.status) {
            closeFunction()
        }
    }

    const newOrders = async (items, order, closeFunction) => {
        const {getUser} = authorization()
        const newOrder = {
            magnet: items.magnet,
            warehouse_id: getUser.value.warehouse_id,
            accounting: [],
            ...order
        }
        let error = false
        items.products.forEach(product => {
            const type = typeAccounting.value.find(type => type.title === product.title)
            
            if(!type) {
                error = true
                console.log(`Этот товар не пробился по базе`, product);
                return
            } 
            const findCount = type.products.find(type => +type.count === product.count)
            if(findCount) {
                const productAccounting = newOrder.accounting.find(newOrder => newOrder.id === findCount.id)
                if(productAccounting) {
                    productAccounting.amount += product.amount
                } else {
                    newOrder.accounting.push({
                        id: findCount.id,
                        title: product.title,
                        amount: product.amount,
                        count: product.count
                    })
                }
            } else {
                let length = product.count
                type.products.forEach(typeProduct => {
                    if(!length || +typeProduct.count > length) return
                    if(!(length % +typeProduct.count)) {
                        const productAccounting = newOrder.accounting.find(newOrder => newOrder.id === typeProduct.id)
                        if(productAccounting) {
                            productAccounting.amount += (length / +typeProduct.count) * product.amount
                        } else {
                            newOrder.accounting.push({
                                id: typeProduct.id,
                                title: product.title,
                                amount: (length / +typeProduct.count) * product.amount,
                                count: +typeProduct.count
                            })
                        }
                        length = 0
                    } else {
                        const amount = Math.floor(length / +typeProduct.count)
                        length = length % +typeProduct.count
                        const productAccounting = newOrder.accounting.find(newOrder => newOrder.id === typeProduct.id)
                        if(productAccounting) {
                            productAccounting.amount += amount * product.amount
                        } else {
                            newOrder.accounting.push({
                                id: typeProduct.id,
                                title: product.title,
                                amount: amount * product.amount,
                                count: +typeProduct.count
                            })
                        }
                    }
                })
                
            }
        })        
        if(error) {
            alert(`Ошибка в каком-то товаре в базе данных, детали в консоли`)
        } else {
        const formData = new FormData()
            formData.append('accounting', JSON.stringify(newOrder.accounting))
            formData.append('magnet', newOrder.magnet)
            formData.append('warehouse_id', newOrder.warehouse_id)
            formData.append('track', newOrder.track)
            formData.append('delivery', newOrder.delivery)
            formData.append('name', newOrder.name)
            formData.append('address', newOrder.address)
            formData.append('comment', newOrder.comment)
            const data = await fetch(`${window.requst}/api/operator/orders.php`, {
                method: 'POST',
                body: formData
            })
            const result = await data.json()
            if (result.status) {
                closeFunction()
            }
        }
        
    }

    return {
        getTypeAccounting, findTypeAccounting, newOrders, sendMessage
    }
});