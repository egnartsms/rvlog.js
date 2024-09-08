import * as rv from 'rvlog'

let ageInput = document.getElementById('age')

ageInput.addEventListener('change', rv.agentEventHandler(() => {
  let num = Number(ageInput.value)

  if (isNaN(num)) {
    return
  }

  rv.add(D.age(num))
}))

const D = rv.dataNode()

rv.procedure(() => {
  console.log('My age is right?', rv.exists(D.age(36)))
})

rv.propagateToFixpoint()
