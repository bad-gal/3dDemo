import * as CANNON from 'cannon-es';

interface CustomData {
  name: string;
  type: string;
}

export default class CustomBody extends CANNON.Body {
  public customData?: CustomData;

  constructor(options: any) {
    super(options);
  }
}
