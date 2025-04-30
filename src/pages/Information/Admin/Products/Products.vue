<script>
    import UButton from '@/components/_UIComponents/UButton/UButton.vue';
    import UInput from '@/components/_UIComponents/UInput/UInput.vue';

    import { ref, computed } from 'vue';
    import { products } from '../../../../store/products';
    
    export default {
        components: {
            UButton, 
            UInput
        },
        beforeCreate() {
            const { findProducts } = products()
            findProducts()
        },
        setup() {
            const { getProducts, updateProducts, newProduct, deleteProduct } = products()
            const openModal = ref(false)
            const pageModal = ref("add")
            const title = ref("")
            const id = ref(0)
            const taked = ref(false)

            const closeModal = () => {
                openModal.value = false
                pageModal.value = "add"
                title.value = ""
                id.value = 0
                taked.value = false
            }
            
            const editProduct = (product) => {
                openModal.value = true
                pageModal.value = "edit"
                title.value = product.title
                id.value = product.id
                taked.value = false
            }

            const saveProduct = async () => {
                taked.value = true
                if(!error.length && title.value.trim().length) {
                    if(pageModal.value === "add") {
                        await newProduct(title.value, closeModal)
                        return
                    }
                    await updateProducts({title: title.value, id: id.value}, closeModal)
                }
            }

            const removeProduct = ({title, id}) => {
                if(confirm(`Удалить продукт ${title}?`)) {
                    deleteProduct(id)
                }
            }

            const getTitle = computed(() => {
                return title.value
            })

            const error = computed(() => {
                if(!title.value.trim() && taked.value) {
                    return "Обязательное поле для заполнения"
                }
                return ""
            })

            return {
                openModal, pageModal, editProduct, saveProduct, taked, getProducts, error, title, closeModal, getTitle, removeProduct
            }
        },
    }
</script>

<template>
    <div class="products">
        <h2 class="products__title">Продукты</h2>
        <U-Button class="products__button" @click="openModal = true">Добавить продукт</U-Button>
        <form class="products__form" @submit.prevent="saveProduct" @reset="closeModal" v-if="openModal">
            <div class="products__content">
                <U-Button class="products__close" type="reset" modifier="red"></U-Button>
                <h3 class="products__sub-title">{{ pageModal === 'add' ? 'Добавление продукта' : 'Редактирование продукта' }}</h3>
                <U-Input class="products__input" name="Введите название продукта" v-model="title" @blur="taked = true" :error="error" :start-value="getTitle"/>
                <U-Button class="products__button" type="submit">{{ pageModal === 'add' ? 'Добавить продукт' : 'Редактировать продукт' }}</U-Button>
            </div>
        </form>
        <div class="products__table" v-if="getProducts.length">
            <div class="products__table-item products__table-item--head">
                Название
            </div>
            <div class="products__table-item products__table-item--head">
                Действие
            </div>
            <template v-for="product in getProducts">
                <div class="products__table-item">
                    {{ product.title }}
                </div>
                <div class="products__table-item">
                    <U-Button modifier="yellow" @click="editProduct({title: product.title, id: product.id})">Редактировать</U-Button>
                    <U-Button modifier="red" @click="removeProduct(product)">Удалить</U-Button>
                </div>
            </template>
        </div>
        <h2 v-else class="products__title">Добавь товары, а то их нет</h2>
    </div>
</template>

<style src="./Products.scss" lang="scss" scoped />