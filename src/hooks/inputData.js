import { computed, ref } from "vue"

const inputData = (startValue, type, min = 0) => {
    const value = ref(startValue)
    const takedValue = ref(false)
    
    const error = computed(() => {
        let check = false

        if(type === 'number') {
            check = value.value < min
        }

        if(type === 'string') {
            check = !value.value.trim()
        }

        if(check && takedValue.value) { 
            return "Обязательное поле для заполнения"
        }
        return ""
    })

    return {
        value, takedValue, error
    }
}

export default inputData