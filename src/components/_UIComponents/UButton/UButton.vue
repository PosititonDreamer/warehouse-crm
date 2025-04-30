<script>
import { computed } from 'vue';

    export default {
        props: {
            disabled: {
                type: Boolean,
                default: false
            },
            modifier: {
                type: String,
                default: ""
            }, 
        },
        setup({active, modifier}) {
            const buttonClass = computed(() => {
                const classes = ['u-button']
                if(modifier) {
                    classes.push(`u-button--${modifier}`)
                }
                return classes
            })

            return {
                buttonClass
            }
        },
    }
</script>

<template>
  <button :class="buttonClass" :disabled="disabled"><slot></slot></button>
</template>

<style src="./UButton.scss" lang="scss" scoped />