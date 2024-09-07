import * as rv from 'rvlog'

// let ageInput = document.getElementById('age')

// ageInput.addEventListener('change', (event) => {
//   let num = Number(event.target.value)

//   if (isNaN(num)) {
//     return
//   }

  
// })

const D = rv.dataNode()

rv.procedure(() => {
  console.log('Serhii?', rv.exists(D.student('Serhii')))
  console.log('Petro?', rv.exists(D.student('Petro')))
  console.log('Stepan?', rv.exists(D.student('Stepan')))
})

rv.propagateToFixpoint()

rv.procedure(() => {
  rv.add(D.student('Serhii'))
})

rv.propagateToFixpoint()

rv.procedure(() => {
  rv.add(D.student('Petro'))
})

rv.propagateToFixpoint()

rv.procedure(() => {
  rv.add(D.student('Stepan'))
})

rv.propagateToFixpoint()
