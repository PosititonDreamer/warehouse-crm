<script>
    import UButton from '@/components/_UIComponents/UButton/UButton.vue';
    import UInput from '@/components/_UIComponents/UInput/UInput.vue';
    import {computed, ref} from 'vue'
    import { authorization } from '../../store/authorization';
    export default {
        components: {
            UButton, UInput
        },
        setup() {
            const userKey = ref("");
            const taked = ref(false)
            const {login} = authorization()
            const getUser = () => {
                taked.value = true
                if(userKey.value.trim().length === 20) {
                    login(userKey.value, true)
                }
            }

            const error = computed(() => {
                if(!userKey.value.trim() && taked.value) {
                    return "Обязательное поле для заполнения"
                }
                if(userKey.value.trim().length < 20 && taked.value) {
                    return "Неполный ключ"
                }
                return ""
            })

            return {
                getUser, userKey, taked,error
            }
        }
    }
</script>

<template>
    <div class="auth">
        <div class="container">
            <form @submit.prevent="getUser" class="auth__form">
                <h2 class="auth__title">Авторизация</h2>
                <U-Input class="auth__input" name="Введите ключ доступа" v-model="userKey" @blur="taked = true" :error="error" :max="20"/>
                <U-Button class="auth__button" type="submit">Авторизоваться</U-Button>
            </form>
        </div>
    </div>
</template>

<style src="./Auth.scss" lang="scss" scoped />