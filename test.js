class User {
	constructor() {
		this.name = "Ahmad"
	}

	greeting() {
		console.log(`Hello people, Iam ${this.name}`)
	}

	getName() {
		return this.name
	}
}

const user = new User()

console.log(user.getName())