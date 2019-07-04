import * as PIXI from 'pixi.js';
import { Pointer } from './pointer';

// ============================================
interface AnimatedSprite extends DraggableSprite {
  vx: number;
  vy: number;

  press?: Handler;
  release?: Handler;
  over?: Handler;
  out?: Handler;
  tap?: Handler;

  state: string;
  action: string;

  pressed: boolean;
  hoverOver: boolean;

  tinkType: string;
  enabled: boolean;
}

interface Keyboard {
  code: number;
  isDown: boolean;
  isUp: boolean;
  press?: Handler;
  release?: Handler;
  downHandler(event: KeyboardEvent): void;
  upHandler(event: KeyboardEvent): void;
}

// ====================================================
export type Handler = () => void;

export interface DraggableSprite extends PIXI.AnimatedSprite {
  readonly gx: number;
  readonly gy: number;

  draggable?: boolean;
  circular?: boolean;

  _localDraggableAllocation?: boolean;
}

export class Tink {
  // An array to store all the draggable sprites
  public draggableSprites: DraggableSprite[] = [];

  // An array to store all the pointer objects
  // (there will usually just be one)
  public pointers: Pointer[] = [];

  // An array to store all the buttons and button-like
  // interactive sprites
  public buttons: AnimatedSprite[] = [];

  // Aliases for Pixi objects
  private TextureCache = PIXI.utils.TextureCache;

  // Note: change MovieClip to AnimatedSprite for Pixi v4
  private AnimatedSprite = PIXI.AnimatedSprite;
  private Texture = PIXI.Texture;

  constructor(
    public element: HTMLCanvasElement,
    // tslint:disable-next-line: variable-name
    private _scale: number = 1
  ) {
    //
  }

  public get scale() {
    return this._scale;
  }

  public set scale(value: number) {
    this._scale = value;

    // Update scale values for all pointers
    this.pointers.forEach(pointer => pointer.scale = value);
  }

  // `makeDraggable` lets you make a drag-and-drop sprite by pushing it
  // into the `draggableSprites` array
  public makeDraggable(...sprites: Array<DraggableSprite[] | DraggableSprite>) {

    // If the first argument isn't an array of sprites...
    if (!Array.isArray(sprites[0])) {
      (<DraggableSprite[]>sprites).forEach((sprite: DraggableSprite) => {
        this.draggableSprites.push(sprite);

        // If the sprite's `draggable` property hasn't already been defined by
        // another library, like Hexi, define it
        if (sprite.draggable === undefined) {
          sprite.draggable = true;
          sprite._localDraggableAllocation = true;
        }
      });
    } else { // If the first argument is an array of sprites...

      const spritesArray = <DraggableSprite[]>sprites[0];
      if (spritesArray.length > 0) {
        for (let i = spritesArray.length - 1; i >= 0; i--) {
          const sprite = spritesArray[i];
          this.draggableSprites.push(sprite);

          // If the sprite's `draggable` property hasn't already been defined by
          // another library, like Hexi, define it
          if (sprite.draggable === undefined) {
            sprite.draggable = true;
            sprite._localDraggableAllocation = true;
          }
        }
      }
    }
  }

  // `makeUndraggable` removes the sprite from the `draggableSprites`
  // array
  public makeUndraggable(...sprites: Array<DraggableSprite[] | DraggableSprite>) {

    // If the first argument isn't an array of sprites...
    if (!Array.isArray(sprites[0])) {
      (<DraggableSprite[]>sprites).forEach(sprite => {
        this.draggableSprites.splice(this.draggableSprites.indexOf(sprite), 1);
        if (sprite._localDraggableAllocation === true) {
          sprite.draggable = false;
        }
      });
    } else { // If the first argument is an array of sprites
      const spritesArray = <DraggableSprite[]>sprites[0];
      if (spritesArray.length > 0) {
        for (let i = spritesArray.length - 1; i >= 0; i--) {
          const sprite = spritesArray[i];
          this.draggableSprites.splice(this.draggableSprites.indexOf(sprite), 1);
          if (sprite._localDraggableAllocation === true) {
            sprite.draggable = false;
          }
        }
      }
    }
  }


  // A method that implments drag-and-drop functionality
  // for each pointer
  public updateDragAndDrop(draggableSprites: DraggableSprite[]) {

    // Create a pointer if one doesn't already exist
    if (this.pointers.length === 0) {
      this.makePointer(this.element, this.scale);
    }

    // Loop through all the pointers in Tink's global `pointers` array
    // (there will usually just be one, but you never know)
    this.pointers.forEach(pointer => {

      // Check whether the pointer is pressed down
      if (pointer.isDown) {

        // You need to capture the co-ordinates at which the pointer was
        // pressed down and find out if it's touching a sprite

        // Only run pointer.code if the pointer isn't already dragging
        // sprite
        if (pointer.dragSprite === null) {

          // Loop through the `draggableSprites` in reverse to start searching at the bottom of the stack
          for (let i = draggableSprites.length - 1; i > -1; i--) {

            // Get a reference to the current sprite
            const sprite = draggableSprites[i];

            // Check for a collision with the pointer using `hitTestSprite`
            if (pointer.hitTestSprite(sprite) && sprite.draggable) {

              // Calculate the difference between the pointer's
              // position and the sprite's position
              pointer.dragOffsetX = pointer.x - sprite.gx;
              pointer.dragOffsetY = pointer.y - sprite.gy;

              // Set the sprite as the pointer's `dragSprite` property
              pointer.dragSprite = sprite;

              // The next two lines re-order the `sprites` array so that the
              // selected sprite is displayed above all the others.
              // First, splice the sprite out of its current position in
              // its parent's `children` array
              const children = sprite.parent.children;
              children.splice(children.indexOf(sprite), 1);

              // Next, push the `dragSprite` to the end of its `children` array so that it's
              // displayed last, above all the other sprites
              children.push(sprite);

              // Reorganize the `draggableSpites` array in the same way
              draggableSprites.splice(draggableSprites.indexOf(sprite), 1);
              draggableSprites.push(sprite);

              // Break the loop, because we only need to drag the topmost sprite
              break;
            }
          }
        }

        // If the pointer is down and it has a `dragSprite`, make the sprite follow the pointer's
        // position, with the calculated offset
        // tslint:disable-next-line: one-line
        else {
          pointer.dragSprite!.x = pointer.x - pointer.dragOffsetX;
          pointer.dragSprite!.y = pointer.y - pointer.dragOffsetY;
        }
      }

      // If the pointer is up, drop the `dragSprite` by setting it to `null`
      if (pointer.isUp) {
        pointer.dragSprite = null;
      }

      // Change the mouse arrow pointer to a hand if it's over a
      // draggable sprite
      draggableSprites.some(sprite => {
        if (pointer.hitTestSprite(sprite) && sprite.draggable) {
          if (pointer.visible) {
            pointer.cursor = 'pointer';
          }
          return true;
        } else {
          if (pointer.visible) {
            pointer.cursor = 'auto';
          }
          return false;
        }
      });
    });
  }

  // The `updateButtons` method will be called each frame
  // inside the game loop. It updates all the button-like sprites
  public updateButtons() {

    // Create a pointer if one doesn't already exist
    if (this.pointers.length === 0) {
      this.makePointer(this.element, this.scale);
    }

    // Loop through all of Tink's pointers (there will usually
    // just be one)
    this.pointers.forEach(pointer => {

      pointer.shouldBeHand = false;

      // Loop through all the button-like sprites that were created
      // using the `makeInteractive` method
      this.buttons.forEach(o => {

        // Only do this if the interactive object is enabled
        if (o.enabled) {

          // Figure out if the pointer is touching the sprite
          const hit = pointer.hitTestSprite(o);

          // 1. Figure out the current state
          if (pointer.isUp) {

            // Up state
            o.state = 'up';

            // Show the first image state frame, if this is a `Button` sprite
            if (o.tinkType === 'button') {
              o.gotoAndStop(0);
            }
          }

          // If the pointer is touching the sprite, figure out
          // if the over or down state should be displayed
          if (hit) {

            // Over state
            o.state = 'over';

            // Show the second image state frame if this sprite has
            // 3 frames and it's a `Button` sprite
            if (o.totalFrames && o.totalFrames === 3 && o.tinkType === 'button') {
              o.gotoAndStop(1);
            }

            // Down state
            if (pointer.isDown) {
              o.state = 'down';

              // Show the third frame if this sprite is a `Button` sprite and it
              // has only three frames, or show the second frame if it
              // only has two frames
              if (o.tinkType === 'button') {
                if (o.totalFrames === 3) {
                  o.gotoAndStop(2);
                } else {
                  o.gotoAndStop(1);
                }
              }
            }



            // Flag this pointer to be changed to a hand
            pointer.shouldBeHand = true;
            // if (pointer.visible) pointer.cursor = 'pointer';
            // } else {
            //   // Turn the pointer to an ordinary arrow icon if the
            //   // pointer isn't touching a sprite
            //   if (pointer.visible) pointer.cursor = 'auto';

            // Change the pointer icon to a hand
            if (pointer.visible) {
              pointer.cursor = 'pointer';
            }
          } else {
            // Turn the pointer to an ordinary arrow icon if the
            // pointer isn't touching a sprite
            if (pointer.visible) {
              pointer.cursor = 'auto';
            }

          }

          // Perform the correct interactive action

          // a. Run the `press` method if the sprite state is 'down' and
          // the sprite hasn't already been pressed
          if (o.state === 'down') {
            if (!o.pressed) {
              if (o.press) {
                o.press();
              }
              o.pressed = true;
              o.action = 'pressed';
            }
          }

          // b. Run the `release` method if the sprite state is 'over' and
          // the sprite has been pressed
          if (o.state === 'over') {
            if (o.pressed) {
              if (o.release) {
                o.release();
              }
              o.pressed = false;
              o.action = 'released';
              // If the pointer was tapped and the user assigned a `tap`
              // method, call the `tap` method
              if (pointer.tapped && o.tap) {
                o.tap();
              }
            }

            // Run the `over` method if it has been assigned
            if (!o.hoverOver) {
              if (o.over) {
                o.over();
              }
              o.hoverOver = true;
            }
          }

          // c. Check whether the pointer has been released outside
          // the sprite's area. If the button state is 'up' and it's
          // already been pressed, then run the `release` method.
          if (o.state === 'up') {
            if (o.pressed) {
              if (o.release) {
                o.release();
              }
              o.pressed = false;
              o.action = 'released';
            }

            // Run the `out` method if it has been assigned
            if (o.hoverOver) {
              if (o.out) {
                o.out();
              }
              o.hoverOver = false;
            }
          }
        }
      });

      if (pointer.shouldBeHand) {
        pointer.cursor = 'pointer';
      } else {
        pointer.cursor = 'auto';
      }


    });
  }

  // A function that creates a sprite with 3 frames that
  // represent the button states: up, over and down
  public button(
    source: PIXI.Texture[] | string[],
    x: number = 0,
    y: number = 0
  ): AnimatedSprite {

    // The sprite object that will be returned
    let o: any;

    // Is it an array of frame ids or textures?
    if (typeof source[0] === 'string') {

      // They're strings, but are they pre-existing texture or
      // paths to image files?
      // Check to see if the first element matches a texture in the
      // cache
      if (this.TextureCache[<string>source[0]]) {

        // It does, so it's an array of frame ids
        o = this.AnimatedSprite.fromFrames(<string[]>source);
      } else {

        // It's not already in the cache, so const's load it
        o = this.AnimatedSprite.fromImages(<string[]>source);
      }
    }

    // If the `source` isn't an array of strings, check whether
    // it's an array of textures
    // tslint:disable-next-line: one-line
    else if (source[0] instanceof this.Texture) {

      // Yes, it's an array of textures.
      // Use them to make a AnimatedSprite o
      o = new this.AnimatedSprite(<PIXI.Texture[]>source);
    }

    // Add interactive properties to the button
    this.makeInteractive(o);

    // Set the `tinkType` to 'button'
    o.tinkType = 'button';

    // Position the button
    o.x = x;
    o.y = y;

    // Return the new button sprite
    return o;
  }

  // Run the `udpate` function in your game loop
  // to update all of Tink's interactive objects
  public update() {

    // Update the drag and drop system
    if (this.draggableSprites.length !== 0) {
      this.updateDragAndDrop(this.draggableSprites);
    }

    // Update the buttons and button-like interactive sprites
    if (this.buttons.length !== 0) {
      this.updateButtons();
    }
  }

  // `arrowControl` is a convenience method for updating a sprite's velocity
  // for 4-way movement using the arrow directional keys. Supply it
  // with the sprite you want to control and the speed per frame, in
  // pixels, that you want to update the sprite's velocity
  public arrowControl(sprite: AnimatedSprite, speed: number) {

    if (speed === undefined) {
      throw new Error('Please supply the arrowControl method with the speed at which you want the sprite to move');
    }

    // tslint:disable-next-line: one-variable-per-declaration
    const upArrow = this.keyboard(38),
      rightArrow = this.keyboard(39),
      downArrow = this.keyboard(40),
      leftArrow = this.keyboard(37);

    // Assign key `press` methods
    leftArrow.press = () => {
      // Change the sprite's velocity when the key is pressed
      sprite.vx = -speed;
      sprite.vy = 0;
    };
    leftArrow.release = () => {
      // If the left arrow has been released, and the right arrow isn't down,
      // and the sprite isn't moving vertically:
      // Stop the sprite
      if (!rightArrow.isDown && sprite.vy === 0) {
        sprite.vx = 0;
      }
    };
    upArrow.press = () => {
      sprite.vy = -speed;
      sprite.vx = 0;
    };
    upArrow.release = () => {
      if (!downArrow.isDown && sprite.vx === 0) {
        sprite.vy = 0;
      }
    };
    rightArrow.press = () => {
      sprite.vx = speed;
      sprite.vy = 0;
    };
    rightArrow.release = () => {
      if (!leftArrow.isDown && sprite.vy === 0) {
        sprite.vx = 0;
      }
    };
    downArrow.press = () => {
      sprite.vy = speed;
      sprite.vx = 0;
    };
    downArrow.release = () => {
      if (!upArrow.isDown && sprite.vx === 0) {
        sprite.vy = 0;
      }
    };
  }

  public makePointer(element = this.element, scale = this.scale) {

    // The pointer object will be returned by this function
    const pointer = new Pointer(element, scale);

    // Bind the events to the handlers
    // Mouse events
    element.addEventListener(
      'mousemove', pointer.moveHandler.bind(pointer), false
    );
    element.addEventListener(
      'mousedown', pointer.downHandler.bind(pointer), false
    );

    // Add the `mouseup` event to the `window` to
    // catch a mouse button release outside of the canvas area
    window.addEventListener(
      'mouseup', pointer.upHandler.bind(pointer), false
    );

    // Touch events
    element.addEventListener(
      'touchmove', pointer.touchmoveHandler.bind(pointer), false
    );
    element.addEventListener(
      'touchstart', pointer.touchstartHandler.bind(pointer), false
    );

    // Add the `touchend` event to the `window` object to
    // catch a mouse button release outside of the canvas area
    window.addEventListener(
      'touchend', pointer.touchendHandler.bind(pointer), false
    );

    // Disable the default pan and zoom actions on the `canvas`
    element.style.touchAction = 'none';

    // Add the pointer to Tink's global `pointers` array
    this.pointers.push(pointer);

    // Return the pointer
    return pointer;
  }

  private makeInteractive(o: AnimatedSprite) {

    // The `press`,`release`, `over`, `out` and `tap` methods. They're `undefined`
    // for now, but they can be defined in the game program
    o.press = o.press || undefined;
    o.release = o.release || undefined;
    o.over = o.over || undefined;
    o.out = o.out || undefined;
    o.tap = o.tap || undefined;

    // The `state` property tells you the button's
    // current state. Set its initial state to 'up'
    o.state = 'up';

    // The `action` property tells you whether its being pressed or
    // released
    o.action = '';

    // The `pressed` and `hoverOver` Booleans are mainly for internal
    // use in this code to help figure out the correct state.
    // `pressed` is a Boolean that helps track whether or not
    // the sprite has been pressed down
    o.pressed = false;

    // `hoverOver` is a Boolean which checks whether the pointer
    // has hovered over the sprite
    o.hoverOver = false;

    // tinkType is a string that will be set to 'button' if the
    // user creates an object using the `button` function
    o.tinkType = '';

    // Set `enabled` to true to allow for interactivity
    // Set `enabled` to false to disable interactivity
    o.enabled = true;

    // Add the sprite to the global `buttons` array so that it can
    // be updated each frame in the `updateButtons method
    this.buttons.push(o);
  }

  /*
  `keyboard` is a method that listens for and captures keyboard events. It's really
  just a convenient wrapper function for HTML `keyup` and `keydown` events so that you can keep your application code
  clutter-free and easier to write and read.

  Here's how to use the `keyboard` method. Create a new keyboard object like this:
  ```js
  const keyObject = keyboard(asciiKeyCodeNumber);
  ```
  It's one argument is the ASCII key code number of the keyboard key
  that you want to listen for. [Here's a list of ASCII key codes you can
  use](http:// www.asciitable.com).
  Then assign `press` and `release` methods to the keyboard object like this:
  ```js
  keyObject.press = () => {
    // key object pressed
  };
  keyObject.release = () => {
    // key object released
  };
  ```
  Keyboard objects also have `isDown` and `isUp` Boolean properties that you can use to check the state of each key.
  */
  private keyboard(keyCode: number) {
    const key: Keyboard = Object.create(null);
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;

    // The `downHandler`
    key.downHandler = event => {
      if (event.keyCode === key.code) {
        if (key.isUp && key.press) {
          key.press();
        }
        key.isDown = true;
        key.isUp = false;
      }
      event.preventDefault();
    };

    // The `upHandler`
    key.upHandler = event => {
      if (event.keyCode === key.code) {
        if (key.isDown && key.release) {
          key.release();
        }
        key.isDown = false;
        key.isUp = true;
      }
      event.preventDefault();
    };

    // Attach event listeners
    window.addEventListener(
      'keydown', key.downHandler.bind(key), false
    );
    window.addEventListener(
      'keyup', key.upHandler.bind(key), false
    );

    // Return the key object
    return key;
  }
}

