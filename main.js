import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x87CEFA ); 

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const canvas = document.getElementById("experience-canvas");
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

let character = {
    instance: null,
    moveDistance: 3.5,
    jumpHeight: 1,
    isMoving: false,
    moveDuration: 0.2,
};

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;

const aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera( 
    -aspect * 50, 
    aspect * 50, 
    50, 
    -50, 
    1, 
    1000 
);

camera.position.set(-55, 25, -30);

const controls = new OrbitControls( camera, canvas );
controls.enableDamping = true; 

// Lighting
const ambientLight = new THREE.AmbientLight( 0xffffff, 1.5 ); 
scene.add( ambientLight );

const dirLight = new THREE.DirectionalLight( 0xffffff, 2 );
dirLight.position.set(5, 5, 5);
scene.add( dirLight );

const intersectObjects = [];
const intersectObjectsNames = [
    "Scene",
    "greenscene",
];

const loader = new GLTFLoader();
loader.load( './portfolio.glb', function ( glb ) {

    glb.scene.traverse((child)=>{

        if (intersectObjectsNames.includes(child.name)){
            intersectObjects.push(child);
        }

        if(child.isMesh){
            child.castShadow = true;
            child.receiveShadow = true;
        }

        if(child.name === "character"){
            character.instance = child;
        }

        console.log(child);
    });

    scene.add( glb.scene );
}, undefined, function ( error ) {
    console.error( error );
} );


function handleResize(){
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize( sizes.width, sizes.height );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function moveCharacter(targetPosition, targetRotation){
    character.isMoving = true;

    const t1 = gsap.timeline({
        onComplete: ()=>{
            character.isMoving = false;
        },
    });

    // make char move
    t1.to(character.instance.position, {
        x: targetPosition.x,
        z: targetPosition.z,
        duration: character.moveDuration,
    });

    // make char rotate
    t1.to(character.instance.rotation, {
        y: targetRotation,
        duration: character.moveDuration,
    },
    0
    );

    // make char jump
    t1.to(character.instance.position, {
        y: character.instance.position.y + character.jumpHeight,
        duration: character.moveDuration /2,
        yoyo: true,
        repeat: 1,
    },
    0
    );

}


function onPointerMove( event ){

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight) * 2 + 1;

}


// for character movement 
function onKeyDown(event){

    if(character.isMoving) return;

    const targetPosition = new THREE.Vector3().copy(character.instance.position);
    let targetRotation = 0;

    console.log(event);
    switch(event.key.toLowerCase()){
        case "w":
            case "arrowup":
                targetPosition.x += character.moveDistance;
                targetRotation = Math.PI / 2;
                break;
        case "d":
            case "arrowleft":
                targetPosition.z += character.moveDistance;
                targetRotation = Math.PI;
                break;
        case "s":
            case "arrowdown":
                targetPosition.x -= character.moveDistance;
                targetRotation = -Math.PI / 2;
                break;
        case "a":
            case "arrowleft":
                targetPosition.z -= character.moveDistance;
                targetRotation = 0;
                break;
        default:
            return;
    }
    moveCharacter(targetPosition, targetRotation);
}


window.addEventListener("resize", handleResize);
// window.addEventListener("pointermove", onPointerMove);
window.addEventListener("keydown", onKeyDown)


// Animation Loop
function animate( time ) {

    // raycaster.setFromCamera( pointer, camera );

    // const intersects = raycaster.intersectObjects( intersectObjects );

    // for ( let i = 0; i < intersects.length; i++){
    //     // intersects[ i ].object.material.color.set( 0xff0000 );
    //     // console.log( intersects );
    // }

    controls.update(); 
    // console.log(camera.position); // to get current pos of camera
    renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );