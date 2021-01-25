var jwt = require('jsonwebtoken')

var bcrypt = require('bcrypt')
const SALT_ROUNDS = 12
let hashSalasana

(async () => {
    try {
        hashSalasana = await bcrypt.hash("oppRappaaja", SALT_ROUNDS)
        console.log("Salasana: ",hashSalasana)
        let result= await bcrypt.compare("kisa",hashSalasana)
        console.log(result)
    } catch (e) {
        console.log(e)
    }
})();



var token = jwt.sign({ foo: 'bar' },'asshhhhh');
var testi = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJpYXQiOjE2MDc2NzYxMjJ9.QCS5E2WN_d-9GYFAzyieJUAq236xySs6UcYSFlSWrPk"

console.log("Alkuperäinen: ", token)
console.log("Väärä testitoken: ", testi)

try {
    let result = jwt.verify(token,'asshhhhh');
    console.log("Token verifioitu: ",result)
} catch (e) {
    console.log("Token ei ole ok: ",e)
}
console.log(token)
