import * as rv from 'rvlog'

let realPlane = {imRealPlane: true}
let proxy = rv.planeProxy(realPlane)
proxy('user')
