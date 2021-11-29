import Env from './env'
import * as THREE from 'three'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'

export default class Ribbon {
  
  constructor() {
    this.env = new Env()
    this.scene = this.env.scene
    this.camera = this.env.camera
    this.time = 0
    this.createLights()
    this.createMaterial()
    this.createRibbon()
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65)
    this.scene.add(ambientLight)

    let light1 = new THREE.DirectionalLight(0xffffff, 2)
    light1.position.set(0, 5, 5)
    this.scene.add(light1)

    let light2 = new THREE.DirectionalLight(0xffffff, 2)
    light2.position.set(0, 5, -5)
    this.scene.add(light2)
  }

  createMaterial() {
    let frontTexture =  new THREE.TextureLoader().load('textures/s_parole1.png')
    let backTexture = new THREE.TextureLoader().load('textures/s_info.png')

    let arr = [frontTexture, backTexture]
    arr.forEach(t => {
      t.wrapS = 1000
      t.wrapT = 1000
      t.repeat.set(1, 1)
      t.offset.setX(0.5)
      t.flipY = false
    })

    let frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      side: THREE.BackSide,
      roughness: 0.45,
      metalness: 0,
      alphaTest: true,
      flatShading: true
    })

    let backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      side: THREE.FrontSide,
      roughness: 0.45,
      metalness: 0,
      alphaTest: true,
      flatShading: true
    })


    this.frontMaterial = frontMaterial
    this.backMaterial = backMaterial

    this.materials = [frontMaterial, backMaterial]
  }

  createRibbon() {

    this.geometry = new THREE.SphereGeometry(1, 30, 30)
    this.sphere = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({
      color: 0x111111,
      wireframe: true
    }))
    this.scene.add(this.sphere)

    let num = 10
    let curvePoints = []
    for(let i = 0; i < num; i++) {
      let theta = i / num *　Math.PI * 2
      curvePoints.push(
        new THREE.Vector3().setFromSphericalCoords(
          1, Math.PI/2 + Math.random() * 0.4 - 0.2, theta
        ).normalize()
      )
    }

    const curve = new THREE.CatmullRomCurve3(curvePoints, true)
    curve.tension = 0.1

    const points = curve.getPoints(50)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: 0xff0000
    })
    const curveObject = new THREE.Line(geometry, material)

    //this.scene.add(curveObject)

    let number = 1000
    let frenetFrames = curve.computeFrenetFrames(number, true)
    let spacedPoints = curve.getSpacedPoints(number)
    let tempPlane = new THREE.PlaneGeometry(1, 1, number, 1)
  
    let dimensions = [-0.15, 0.15]
    let point = new THREE.Vector3()
    let binormalShift = new THREE.Vector3()
    let temp2 = new THREE.Vector3()

    let finalPoints = []

    dimensions.forEach(d => {
      for(let i = 0; i <= number; i++) {

        point = spacedPoints[i]
        binormalShift.set(0, 0, 0)
        binormalShift.add(frenetFrames.binormals[i]).multiplyScalar(d)
        finalPoints.push(new THREE.Vector3().copy(point).add(binormalShift))
      }
    })

    tempPlane.addGroup(0, 6000, 0)
    tempPlane.addGroup(0, 6000, 1)

    tempPlane.setFromPoints(finalPoints)

    
    let finalMesh = new THREE.Mesh(tempPlane, this.materials)



    this.scene.add(finalMesh)

  }

  update() {
    this.time += 0.002
    if(this.materials) {
      this.materials.forEach((m, i)=> {
        m.map.offset.setX(this.time)
      })
    }
  }


}


