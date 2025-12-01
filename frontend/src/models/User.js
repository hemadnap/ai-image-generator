/**
 * User model
 */
export class User {
  constructor(id = null, email = '', name = '', picture = '', authProvider = null) {
    this.id = id
    this.email = email
    this.name = name
    this.picture = picture
    this.authProvider = authProvider
    this.createdAt = new Date()
  }

  isAuthenticated() {
    return !!this.id
  }
}
