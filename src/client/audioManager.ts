import {Audio, AudioListener, AudioLoader} from "three";

export default class AudioManager {
  coinPickupSound: THREE.Audio;

  constructor( camera: THREE.Camera ) {
    const listener = new AudioListener();
    camera.add( listener );

    this.coinPickupSound = new Audio( listener );

    const audioLoader = new AudioLoader();
    audioLoader.load('assets/audio/confirmation_001.ogg', (buffer) => {
      this.coinPickupSound.setBuffer( buffer );
      this.coinPickupSound.setLoop( false );
      this.coinPickupSound.setVolume( 0.5 );
    });
  }

  playCoinSound() {
    if ( this.coinPickupSound?.isPlaying ) {
      this.coinPickupSound.stop();
      this.coinPickupSound?.play();
    } else {
      this.coinPickupSound?.play();
    }
  }
};
