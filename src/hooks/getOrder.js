const getOrder = () => {
    
    const getDefaultOrder = (textArray, track, deliveryOrder, orderName, orderAddress, orderComment, changePhone) => {
        let newText = []
        const products = []
        if(textArray.length) {
            newText.push(`Заказ ${track.value}`)
            newText.push("")
            const price = +textArray.find(text => text.match('Сумма платежа:')).replace(/[^0-9]/g, '')
            const orders = textArray.filter(text => text.match(/[0-9]\. [a-zA-Zа-яА-ЯёЁ]/))

            if(orders.length) {
                orders.forEach(order => {
                    let finalOrder = ''
                    let fraction = order.split("Фракция")
                    const splitOrder = order.split(":")
                    if(splitOrder[0].indexOf("Набор") > -1) {
                        finalOrder += splitOrder[0].split(".")[1].trim() + " "
                        finalOrder += splitOrder[1].trim() 
                        const multiplier = +splitOrder[splitOrder.length - 1].split("(")[1].split(" ")[0]
                        if(multiplier > 1) {
                            finalOrder += " x " + multiplier
                        }
                        products.push(finalOrder)
                        return
                    }
                    const multiplier = +splitOrder[1].split("(")[1].split(" ")[0]
                    const splitCount = splitOrder[2].trim().split(" ")
                    
                    finalOrder += splitOrder[0].split(".")[1].trim() + ": "
                    finalOrder +=  multiplier > 1 ? `${multiplier} x ` : ""
                    finalOrder += `${splitCount[0]} ${splitCount[1]}`
                    if(fraction.length > 1) {
                        fraction = fraction[1].split(":")
                        finalOrder += `, фракция ${fraction[1].trim().toLowerCase()}`
                    }
                    products.push(finalOrder)
                })    
                
            }
            const presents = textArray.filter(text => text.match('present'))
            if(presents.length) {
                presents.forEach(present => {
                    const splitPresent = present.split(':')
                    let presentPrice = splitPresent[0].split("-")
                    presentPrice = +presentPrice[presentPrice.length - 1]
                    if(price > presentPrice) {
                        products.push(`Подарок: ${splitPresent[1].replace(" в подарок!", '').trim()}`)
                    }
                })
            }

            products.forEach((product, key) => {
                newText.push(`${key + 1}. ${product}`)
            })

            newText.push("")
            let delivery = ""

            if(textArray.find(text => text.indexOf("CDEK") > -1)) {
                delivery = "CDEK"
            }

            if(textArray.find(text => text.indexOf("Почта России") > -1)) {
                delivery = "Почта России"
            }

            if(textArray.find(text => text.indexOf("Boxberry") > -1)) {
                delivery = "Boxberry"
            }
            deliveryOrder.value = delivery

            newText.push(delivery);
            const name = textArray.find(text => text.indexOf("ФИО") === 0)?.split(":")[1]
            let phone = textArray.find(text => text.indexOf("Phone") === 0)?.split(":")[1]
            const email = textArray.find(text => text.indexOf("Email") === 0)?.split(":")[1]
            let messenger = textArray.find(text => text.indexOf("messenger") === 0)
            if(messenger) {
                messenger = messenger.replace("messenger: ", "")
            }
            const adress = textArray.find(text => text.indexOf("Адрес доставки") === 0)?.replace("Адрес доставки:", "")
            const comment = textArray.find(text => text.indexOf("Комментарий_для_ural-mhmr_shop") === 0)?.split(":")[1]
            let createOrder = true
            orderName.value = name.trim()
            orderAddress.value = adress.trim()
            newText.push(`ФИО: ${name}`);
            if(phone.match(/\+7/g).length > 1) {
                createOrder = false
                
            }
            phone = changePhone(phone).replace(/[^0-9]/g, '')

            newText.push(`Телефон: +7${phone}`);
            newText.push(`Email: ${email}`);
            newText.push(`Адресс доставки: ${adress}`);

            if(messenger) {
                newText.push(`Messenger: ${messenger}`);
            }
            
            if(comment) {
                newText.push("")
                newText.push(`Комментарий: ${comment}`);
                orderComment.value = comment.trim()
            }

            if(!createOrder && delivery != 'Boxberry') {
                newText.push("")
                newText.push(`Надо добавить заказ в ${delivery}` );
            }
        }
        return newText
    }
        
    const getHandOrder = (textArray, track, deliveryOrder, orderName, orderAddress, orderComment) => {
        let newText = []
        const products = []
        if(textArray?.length) {
            newText.push(`Заказ ${track.value}`)
            newText.push("")
            const orders = textArray.filter(text => text.match(/[0-9]\. [a-zA-Zа-яА-ЯёЁ]/))

            if(orders.length) {
                orders.forEach(order => {
                    let finalOrder = ''
                    let fraction = order.split("Фракция")
                    const splitOrder = order.split(":")
                    if(splitOrder[0].indexOf("Набор") > -1) {
                        finalOrder += splitOrder[0].split(".")[1].trim() + " "
                        finalOrder += splitOrder[1].trim() 
                        const multiplier = +splitOrder[splitOrder.length - 1].split("(")[1].split(" ")[0]
                        if(multiplier > 1) {
                            finalOrder += " x " + multiplier
                        }
                        products.push(finalOrder)
                        return
                    }
                    const multiplier = +splitOrder[1].split("(")[1].split(" ")[0]
                    const splitCount = splitOrder[2].trim().split(" ")
                    
                    finalOrder += splitOrder[0].split(".")[1].trim() + ": "
                    finalOrder +=  multiplier > 1 ? `${multiplier} x ` : ""
                    finalOrder += `${splitCount[0]} ${splitCount[1]}`
                    if(fraction.length > 1) {
                        fraction = fraction[1].split(":")
                        finalOrder += `, фракция ${fraction[1].trim().toLowerCase()}`
                    }
                    products.push(finalOrder)
                })    
                
            }

            products.forEach((product, key) => {
                newText.push(`${key + 1}. ${product}`)
            })

            newText.push("")
            let delivery = ""

            if(textArray.find(text => text.indexOf("CDEK") > -1)) {
                delivery = "CDEK"
            }

            if(textArray.find(text => text.indexOf("Почта России") > -1)) {
                delivery = "Почта России"
            }

            if(textArray.find(text => text.indexOf("Boxberry") > -1)) {
                delivery = "Boxberry"
            }
            deliveryOrder.value = delivery

            newText.push(delivery);
            const name = textArray.find(text => text.indexOf("ФИО") === 0)?.split(":")[1]
            let phone = textArray.find(text => text.indexOf("Phone") === 0)?.split(":")[1]
            const email = textArray.find(text => text.indexOf("Email") === 0)?.split(":")[1]
            const adress = textArray.find(text => text.indexOf("Адрес доставки") === 0)?.replace("Адрес доставки:", "")
            const comment = textArray.find(text => text.indexOf("Комментарий") === 0)?.split(":")[1]
            orderName.value = name.trim()
            orderAddress.value = adress.trim()
            newText.push(`ФИО: ${name}`);

            phone = phone.replace(/[^0-9]/g, '')

            newText.push(`Телефон: +7${phone}`);
            newText.push(`Email: ${email}`);
            newText.push(`Messenger: ${messenger}`);
            newText.push(`Адресс доставки: ${adress}`);
            
            if(comment) {
                newText.push("")
                newText.push(`Комментарий: ${comment}`);
                orderComment.value = comment.trim()
            }
        }
        return newText
    }

    return {
        getDefaultOrder, getHandOrder
    }
}

export default getOrder
