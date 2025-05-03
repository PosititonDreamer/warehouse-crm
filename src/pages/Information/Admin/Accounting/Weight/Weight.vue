<script>
    import UButton from '@/components/_UIComponents/UButton/UButton.vue';
    import UInput from '../../../../../components/_UIComponents/UInput/UInput.vue';
    import URadio from '../../../../../components/_UIComponents/URadio/URadio.vue';
    import { ref, computed, watch } from 'vue';
    import { weight } from '../../../../../store/weight';

    export default {
        components: {
            UButton, UInput, URadio
        },
        props: {
            warehouse: {
                type: Object,
                required: true
            },
            products: {
                type: Array,
                required: true
            }
        },  
        setup({warehouse}) {
            const {getWeight, getComposites, newWeight, updateAmountWeight, updateWeights, deleteWeight} = weight()
            const product = ref("");
            const amount = ref(0)
            const openModal = ref(false)
            const pageModal = ref("add")
            const id = ref(0)
            const composite = ref(false)
            const compositeProducts = ref([
                {
                    product: null,
                    procent: 100,
                    id: Date.now(),
                }
            ])

            const takedProduct = ref(false)
            const takedAmount = ref(false)

            const loading = ref(false)

            const getProduct = computed(() => product.value)
            const getAmount = computed(() => amount.value)

            const errorProduct = computed(() => {
                if(!product.value.trim() && takedProduct.value) {
                    return "Обязательное поле для заполнения"
                }
                return ""
            })

            const errorAmount = computed(() => {
                if(amount.value < 0 && takedAmount.value) {
                    return "Не может быть меньше 0"
                }
                return ""
            })

            const closeModal = () => {
                openModal.value = false
                pageModal.value = "add"

                product.value = ""
                amount.value = 0
                id.value = 0
                composite.value = false
                compositeProducts.value = [
                    {
                        product: null,
                        procent: 100,
                        id: Date.now(),
                    }
                ]

                takedProduct.value = false
                takedAmount.value = false
                loading.value = false
            }

            const editAccounting = (account) => {
                openModal.value = true
                pageModal.value = "edit"

                product.value = account.product_id
                amount.value = account.amount
                id.value = account.id
                composite.value = !!account.composite
                
                if(!!+account.composite) {
                    compositeProducts.value = getComposites.value.filter(item => +item.accounting_id === +account.id)
                }

                takedProduct.value = false
                takedAmount.value = false
                loading.value = false
            }

            const saveAccounting = async () => {
                takedProduct.value = true
                takedAmount.value = true

                const checkProduct = !errorProduct.length && product.value.trim().length
                const checkAmount = !errorAmount.length && amount.value > -1

                let checkComposite = false
                let finalProcent = 0
                compositeProducts.value.forEach(product => {
                    finalProcent += product.procent
                    if(!product.procent || !product.product) {
                        checkComposite = true
                    }
                })

                if(composite.value && checkComposite) {
                    alert("В составе товара ошибка")
                    return
                } 

                if(finalProcent != 100) {
                    alert("Сумма процентов не может быть больше 100")
                    return
                }
                
                if(checkProduct && (checkAmount || composite.value)) {
                    const account = {
                            product_id: product.value,
                            amount: amount.value,
                            composite: composite.value ? 1 : 0,
                            compositeProducts: compositeProducts.value
                        }
                    if(pageModal.value === "add") {
                        await newWeight({...account}, closeModal)
                        return
                    }
                    if(pageModal.value === 'editAmount') {
                        updateAmountWeight({...account, id: id.value}, closeModal)
                        return
                    } 
                    await updateWeights({...account, id: id.value, }, closeModal)
                }
            }

            const removeAccounting = ({title, id}) => {
                if(confirm(`Удалить товар ${title}?`)) {
                    deleteWeight(id)
                }
            }

            const changeAmount = (account) => {
                openModal.value = true
                pageModal.value = "editAmount"
                product.value = account.product_id
                amount.value = account.amount
                id.value = account.id

                takedProduct.value = false
                takedAmount.value = false
            }

            const addCompositeProducts = () => {
                compositeProducts.value.push({
                    product: null,
                    procent: !compositeProducts.value.length ? 100 : 0,
                    id: Date.now(),
                })
            }

            const removeCompositeProducts = (id) => {
                composite.value = false
                compositeProducts.value = compositeProducts.value.filter(product => product.id != id) 
                if(compositeProducts.value.length === 1) {
                    compositeProducts.value[0].procent = 100
                }
                setTimeout(() => {
                    composite.value = true
                });
            }

            const checkAccount = (account) => {
                let checked = account.accounting_find

                if(getComposites.value.find(item => +item.product === +account.id)) {
                    checked = false
                }

                return checked
            }

            return {
                product,
                amount,
                openModal,
                pageModal,
                getProduct,
                getAmount,
                closeModal,
                editAccounting,
                saveAccounting,
                removeAccounting,
                getWeight,
                changeAmount, 
                composite, 
                compositeProducts,
                addCompositeProducts,
                removeCompositeProducts,
                checkAccount
            }
        },
    }
</script>

<template>
    <div class="accounting">
        <h2 class="accounting__title">Весовые товары из: {{ warehouse.title }}</h2>
        <div class="accounting__content" v-if="warehouse">
            <U-Button class="accounting__button" @click="openModal = true">Добавить Товар</U-Button>
            <form @submit.prevent="saveAccounting" class="accounting__form" @reset="closeModal" v-if="openModal">
                <div class="accounting__content-form" v-if="!getLoading">
                    <U-Button class="accounting__close" type="reset" modifier="red"></U-Button>
                    <h3 class="accounting__sub-title">{{ pageModal === 'add' ? 'Добавление товара' : 'Редактирование товара' }}</h3>
                    <U-Input :error="errorProduct" @change="takedProduct = true" class="accounting__input" name="Выберите продукт" view="select" v-model="product" :start-value="getProduct" key="product-name" :disabled="pageModal === 'editAmount'">
                        <option value=""></option>
                        <option v-for="product in products" :value="product.id">{{ product.title }}</option>
                    </U-Input>
                    <U-Input v-if="!composite" :error="errorAmount" @change="takedAmount = true" class="accounting__input" name="Введите остаток" type="number" v-model="amount" :start-value="getAmount.toString()" key="product-amount" />
                    <div class="accounting__item">
                        <label class="accounting__taker">
                            <span class="accounting__checkbox">
                                <input type="checkbox" @change="composite = !composite" :checked="composite">
                                <span class="accounting__marker"></span>
                            </span>
                            Составной товар
                        </label>
                    </div>
                    <div v-if="composite" class="accounting__item">
                        <div v-for="compositeProduct in compositeProducts" class="accounting__composite-item" :key="compositeProduct.id">
                            <U-Input name="Выберите товар" view="select" v-model="compositeProduct.product" :start-value="compositeProduct.product">
                                <option value=""></option>
                                <option v-for="itemWeight in getWeight.filter(item => +item.product_id != +product)" :value="itemWeight.id" >{{ itemWeight.title }}</option>
                            </U-Input>
                            <U-Input name="Процент" type="number" :max="100" v-model="compositeProduct.procent" :start-value="compositeProduct.procent" :disabled="compositeProducts.length === 1">
                                <option value=""></option>
                            </U-Input>
                            <U-Button v-if="compositeProducts.length > 1" @click="removeCompositeProducts(compositeProduct.id)"  type="button" modifier="red">Удалить</U-Button>
                        </div>
                        <U-Button @click="addCompositeProducts" class="accounting__button" type="button">Добавить часть товара</U-Button>
                    </div>
                    <U-Button class="accounting__button" type="submit">{{ pageModal === 'add' ? 'Добавить товар' : 'Редактировать товар' }}</U-Button>
                </div>
                <h3 class="accounting__sub-title" v-else>Идет загрузка</h3>
            </form>
            <div class="accounting__table" v-if="getWeight.length">
                <div class="accounting__table-item accounting__table-item--head">
                    Название
                </div>
                <div class="accounting__table-item accounting__table-item--head">
                    Остаток
                </div>
                <div class="accounting__table-item accounting__table-item--head">
                    Действия
                </div>
                <template v-for="account in getWeight">
                    <div class="accounting__table-item">
                        {{ account.title }}
                    </div>
                    <div :class="['accounting__table-item', 'accounting__table-item--amount', {'accounting__table-item--few': account.amount <= 5000 && account.amount > 1000, 'accounting__table-item--tiny': account.amount <= 1000  }]">
                        {{ account.composite ? "Составной" :  account.amount }}
                    </div>
                    <div class="accounting__table-item">
                        <U-Button @click="changeAmount(account)">Поменять остаток</U-Button>
                        <U-Button modifier="yellow" @click="editAccounting(account)">Редактировать</U-Button>
                        <U-Button v-if="checkAccount(account)" modifier="red" @click="removeAccounting(account)">Удалить</U-Button>
                    </div>
                </template>
            </div>
            <h2 v-else class="accounting__title">Добавь товар, а то кого отслеживать собрался?</h2>
            <pre>{{ getComposites }}</pre>
        </div>
    </div>
</template>

<style src="./Weight.scss" lang="scss" scoped />