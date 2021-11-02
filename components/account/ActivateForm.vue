<template>
  <form
    ref="form"
    method="post"
    name="reset"
    accept-charset="UTF-8"
    novalidate="novalidate"
    @submit.prevent="submitForm"
  >
    <input type="hidden" name="form-name" value="reset" />
    <input type="hidden" name="form_type" value="reset_customer_password" />
    <input type="hidden" name="utf8" value="✓" />
    <input type="hidden" name="return_url" value="/account" />
    <input v-model="form.resetToken" type="hidden" name="token" />
    <input v-model="form.customerId" type="hidden" name="id" />

    <form-errors v-if="userErrors.length" :errors="userErrors" />
    <div class="has-text-left">
      <div :class="{ error: hasError && !form.password }">
        <label class="is-block mt-3 mb-1">New Password</label>
        <input
          v-model="form.password"
          :type="passwordType"
          name="customer[password]"
          required
          :class="{ 'input-error': hasError && !form.password }"
          @focus="removeError()"
        />
        <form-input-error
          v-if="hasError && !form.password"
          text="Password cannot be empty."
        />
        <span
          v-if="form.password"
          class="button button-is-text is-small"
          type="button"
          @click="togglePassword()"
          >{{ passwordType == 'text' ? 'Hide' : 'Show' }}</span
        >
      </div>
      <div
        :class="{
          error:
            passwordConfirm && form.password && form.password != passwordConfirm
        }"
      >
        <label class="is-block mt-3 mb-1">Confirm Password</label>
        <input
          v-model="passwordConfirm"
          :type="passwordType2"
          name="passwordConfirm"
          required
          :class="{
            'input-error':
              passwordConfirm &&
              form.password &&
              form.password != passwordConfirm
          }"
          @focus="removeError()"
        />
        <!-- <form-input-error
          v-if="passwordConfirm && form.password && form.password != passwordConfirm"
          text="Password does not match."
        /> -->
        <span
          v-if="passwordConfirm"
          class="button button-is-text is-small"
          type="button"
          @click="togglePassword2()"
          >{{ passwordType2 == 'text' ? 'Hide' : 'Show' }}</span
        >
      </div>
    </div>
    <div class="btns">
      <button name="submit" class="button is-tertiary mt-3">Submit</button>
    </div>
  </form>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  props: {
    mode: {
      type: String,
      default: 'reset',
      validator(val) {
        return ['reset', 'activate'].includes(val)
      }
    }
  },
  data() {
    return {
      hasError: false,
      passwordType: 'password',
      form: {
        password: '',
        resetToken: '',
        customerId: '',
        activationUrl: ''
      },
      passwordType2: 'password',
      passwordConfirm: null
    }
  },
  computed: {
    ...mapState('account', ['userErrors'])
  },
  created() {
    if (this.mode === 'reset') {
      this.form.resetToken = this.$route.query.token
      this.form.customerId = this.$route.query.id
    }
    if (this.mode === 'activate' && process.client) {
      this.form.activationUrl = window.location
    }
  },
  methods: {
    ...mapActions('account', ['reset', 'activate']),

    togglePassword() {
      this.passwordType = this.passwordType === 'text' ? 'password' : 'text'
    },
    togglePassword2() {
      this.passwordType2 = this.passwordType2 === 'text' ? 'password' : 'text'
    },
    removeError() {
      this.hasError = false
    },
    async submitForm() {
      const { password, resetToken, customerId, activationUrl } = this.form
      if (!password) {
        this.hasError = true
        return
      }

      if (password && password !== this.passwordConfirm) {
        this.hasError = true
        return
      }
      if (this.mode === 'reset') {
        await this.reset({ password, resetToken, customerId })
        this.$router.push('/account/activate')
      } else if (this.mode === 'activate') {
        await this.activate({ activationUrl, password })
        this.$router.push('/account')
      }
    }
  }
}
</script>
