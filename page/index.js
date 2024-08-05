import * as rv from 'rvlog'

const D = rv.dataNode()

let stud = D.student('Serhii')

stud.ofAge(36)
stud.ofAge(17)

console.log(stud)

