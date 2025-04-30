<script>
    import { authorization } from '@/store/authorization.js';

    export default {
        beforeCreate() {
            const key = localStorage.getItem('user-key')
            if(key) {
                const { login } = authorization()
                login(key)
                if(this.$route.fullPath === "/") {
                    this.$router.push({name: 'information'})
                }
            } else {
                this.$router.push({name: 'Auth'})
            }

            const resize = () => {
                document.documentElement.style.setProperty('--window-height', `${window.innerHeight}px`)
            }
            resize()

            window.addEventListener('resize', resize)
        }
    }
</script>

<template>
    <router-view></router-view>
</template>
