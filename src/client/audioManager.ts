import {Audio, AudioListener, AudioLoader} from "three";

export default class AudioManager {
  coinPickupSound: THREE.Audio;
  revivePlayerSound: THREE.Audio;
  playerFallenSound: THREE.Audio;

  constructor( camera: THREE.Camera ) {
    const listener = new AudioListener();
    camera.add( listener );

    this.coinPickupSound = new Audio( listener );
    this.revivePlayerSound = new Audio( listener );
    this.playerFallenSound = new Audio( listener );

    const audioLoader = new AudioLoader();
    audioLoader.load('assets/audio/confirmation_001.ogg', (buffer) => {
      this.coinPickupSound.setBuffer( buffer );
      this.coinPickupSound.setLoop( false );
      this.coinPickupSound.setVolume( 0.5 );
    });

    audioLoader.load('assets/audio/mixkit-fairy-glitter-867.wav', (buffer) => {
      if (this.revivePlayerSound !== undefined) {
        this.revivePlayerSound.setBuffer(buffer);
        this.revivePlayerSound.setLoop(false);
        this.revivePlayerSound.setVolume(0.5);
      }
    });

    audioLoader.load('assets/audio/mixkit-cartoon-falling-eco-407.wav', (buffer) => {
      if (this.playerFallenSound !== undefined) {
        this.playerFallenSound.setBuffer(buffer);
        this.playerFallenSound.setLoop(false);
        this.playerFallenSound.setVolume(0.5);
      }
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

  playFallenPlayerSound() {
    if ( this.playerFallenSound?.isPlaying ) {
      this.playerFallenSound.stop();
      this.playerFallenSound.play();
    } else {
      this.playerFallenSound?.play();
    }
  }

  playRevivePlayerSound() {
    if ( this.revivePlayerSound?.isPlaying ) {
      this.revivePlayerSound.stop();
      this.revivePlayerSound.play();
    } else {
      this.revivePlayerSound?.play();
    }
  }
};
