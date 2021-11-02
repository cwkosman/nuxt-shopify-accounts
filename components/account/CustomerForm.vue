<template>
  <form method="post" :action="`/account/customer`" accept-charset="UTF-8">
    <input type="hidden" name="form_type" value="customer" /><input
      type="hidden"
      name="utf8"
      value="✓"
    />
    <h2>Edit Customer</h2>

    <div class="grid">
      <div class="grid__item medium-up--one-half">
        <label for="FirstName">First Name</label>
        <input
          id="FirstName"
          v-model="firstName"
          type="text"
          name="customer[first_name]"
          autocomplete="given-name"
        />
      </div>

      <div class="grid__item medium-up--one-half">
        <label for="LastName">Last Name</label>
        <input
          id="LastName"
          v-model="lastName"
          type="text"
          name="customer[last_name]"
          autocomplete="family-name"
        />
      </div>
    </div>

    <label for="Email">Email</label>
    <input
      id="Email"
      v-model="email"
      type="text"
      name="customer[email]"
      autocomplete="email"
    />

    <label for="Phone">Phone</label>
    <input
      id="Phone"
      v-model="phone"
      type="text"
      name="customer[phone]"
      autocomplete="phone"
    />

    <label for="Password">Password</label>
    <input
      id="Password"
      v-model="password"
      type="password"
      name="customer[password]"
      autocomplete="password"
    />

    <div class="text-center">
      <input
        id="AcceptsMarketing"
        v-model="acceptsMarketing"
        type="checkbox"
        name="customer[accepts_marketing]"
      />
      <label for="AcceptsMarketing">Accepts Marketing</label>

      <div>
        <input
          type="submit"
          class="button"
          value="Save"
          @click.prevent="submitForm"
        />
      </div>
    </div>

    <input type="hidden" name="_method" value="put" />
  </form>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      firstName: '',
      lastName: '',
      displayName: '',
      email: '',
      phone: '',
      password: '',
      acceptsMarketing: ''
    }
  },
  computed: {
    ...mapState('account', ['customer'])
  },
  mounted() {
    if (this.customer) {
      for (const key in this.customer) {
        this[key] = this.customer[key]
      }
    }
  },

  methods: {
    ...mapActions('account', ['updateCustomer']),
    async submitForm() {
      await this.updateCustomer({
        customer: {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          phone: this.phone,
          password: this.password,
          acceptsMarketing: this.acceptsMarketing
        }
      })

      this.$router.push('/account')
    }
  }
}
</script>
