import { Tink, DraggableSprite, Handler } from './tink';

export class Pointer {
    // Width and height
    public width: number = 1;
    public height: number = 1;

    // Booleans to track the pointer state
    public isDown: boolean = false;
    public isUp: boolean = true;
    public tapped: boolean = false;

    // Properties to help measure the time between up and down states
    public downTime: number = 0;
    public elapsedTime: number = 0;

    // Optional `press`;`release` and `tap` methods
    public press?: Handler;
    public release?: Handler;
    public tap?: Handler;

    // A `dragSprite` property to help with drag and drop
    public dragSprite: DraggableSprite | null = null;

    // The drag offsets to help drag sprites
    public dragOffsetX: number = 0;
    public dragOffsetY: number = 0;

    public shouldBeHand?: boolean;

    // A property to check whether or not the pointer
    // is visible
    // tslint:disable: variable-name
    private _visible: boolean = true;

    // Private x and y properties
    private _x: number = 0;
    private _y: number = 0;

    constructor(
        private element: HTMLCanvasElement,
        private _scale: number
    ) {
        //
    }
    // tslint:enable: variable-name


    // The public x and y properties are divided by the scale. If the
    // HTML element that the pointer is sensitive to (like the canvas)
    // is scaled up or down, you can change the `scale` value to
    // correct the pointer's position values
    public get x() {
        return this._x / this.scale;
    }
    public get y() {
        return this._y / this.scale;
    }

    // Add `centerX` and `centerY` getters so that we
    // can use the pointer's coordinates with easing
    // and collision functions
    public get centerX() {
        return this.x;
    }
    public get centerY() {
        return this.y;
    }

    // `position` returns an object with x and y properties that
    // contain the pointer's position
    public get position() {
        return {
            x: this.x,
            y: this.y
        };
    }

    public get scale() {
        return this._scale;
    }
    public set scale(value) {
        this._scale = value;
    }

    // Add a `cursor` getter/setter to change the pointer's cursor
    // style. Values can be 'pointer' (for a hand icon) or 'auto' for
    // an ordinary arrow icon.
    public get cursor() {
        return this.element.style.cursor;
    }
    public set cursor(value: string) {
        this.element.style.cursor = value;
    }


    get visible() {
        return this._visible;
    }
    set visible(value) {
        if (value === true) {
            this.cursor = 'auto';
        } else {
            this.cursor = 'none';
        }
        this._visible = value;
    }

    // The pointer's mouse `moveHandler`
    public moveHandler(event: MouseEvent) {

        // Get the element that's firing the event
        const element = <HTMLElement>event.target;

        // Find the pointer’s x and y position (for mouse).
        // Subtract the element's top and left offset from the browser window
        this._x = (event.pageX - element.offsetLeft);
        this._y = (event.pageY - element.offsetTop);

        // Prevent the event's default behavior
        event.preventDefault();
    }

    // The pointer's `touchmoveHandler`
    public touchmoveHandler(event: TouchEvent) {
        const element = <HTMLElement>event.target;

        // Find the touch point's x and y position
        this._x = (event.targetTouches[0].pageX - element.offsetLeft);
        this._y = (event.targetTouches[0].pageY - element.offsetTop);
        event.preventDefault();
    }

    // The pointer's `downHandler`
    public downHandler(event: MouseEvent) {

        // Set the down states
        this.isDown = true;
        this.isUp = false;
        this.tapped = false;

        // Capture the current time
        this.downTime = Date.now();

        // Call the `press` method if it's been assigned
        if (this.press) {
            this.press();
        }
        event.preventDefault();
    }

    // The pointer's `touchstartHandler`
    public touchstartHandler(event: TouchEvent) {
        const element = <HTMLElement>event.target;

        // Find the touch point's x and y position
        this._x = event.targetTouches[0].pageX - element.offsetLeft;
        this._y = event.targetTouches[0].pageY - element.offsetTop;

        // Set the down states
        this.isDown = true;
        this.isUp = false;
        this.tapped = false;

        // Capture the current time
        this.downTime = Date.now();

        // Call the `press` method if it's been assigned
        if (this.press) {
            this.press();
        }
        event.preventDefault();
    }

    // The pointer's `upHandler`
    public upHandler(event: MouseEvent) {

        // Figure out how much time the pointer has been down
        this.elapsedTime = Math.abs(this.downTime - Date.now());

        // If it's less than 200 milliseconds, it must be a tap or click
        if (this.elapsedTime <= 200 && this.tapped === false) {
            this.tapped = true;

            // Call the `tap` method if it's been assigned
            if (this.tap) {
                this.tap();
            }
        }
        this.isUp = true;
        this.isDown = false;

        // Call the `release` method if it's been assigned
        if (this.release) {
            this.release();
        }

        // `event.preventDefault();` needs to be disabled to prevent <input> range sliders
        // from getting trapped in Firefox (and possibly Safari)
        // event.preventDefault();
    }

    // The pointer's `touchendHandler`
    public touchendHandler(event: TouchEvent) {

        // Figure out how much time the pointer has been down
        this.elapsedTime = Math.abs(this.downTime - Date.now());

        // If it's less than 200 milliseconds, it must be a tap or click
        if (this.elapsedTime <= 200 && this.tapped === false) {
            this.tapped = true;

            // Call the `tap` method if it's been assigned
            if (this.tap) {
                this.tap();
            }
        }
        this.isUp = true;
        this.isDown = false;

        // Call the `release` method if it's been assigned
        if (this.release) {
            this.release();
        }

        // event.preventDefault();
    }

    // `hitTestSprite` figures out if the pointer is touching a sprite
    public hitTestSprite(sprite: DraggableSprite) {

        // Add global `gx` and `gy` properties to the sprite if they
        // don't already exist
        this.addGlobalPositionProperties(sprite);

        // The `hit` variable will become `true` if the pointer is
        // touching the sprite and remain `false` if it isn't
        let hit = false;

        // Find out the sprite's offset from its anchor point
        let xAnchorOffset;
        let yAnchorOffset;
        if (sprite.anchor !== undefined) {
            xAnchorOffset = sprite.width * sprite.anchor.x;
            yAnchorOffset = sprite.height * sprite.anchor.y;
        } else {
            xAnchorOffset = 0;
            yAnchorOffset = 0;
        }

        // Is the sprite rectangular?
        if (!sprite.circular) {

            // Get the position of the sprite's edges using global
            // coordinates
            const left = sprite.gx - xAnchorOffset;
            const right = sprite.gx + sprite.width - xAnchorOffset;
            const top = sprite.gy - yAnchorOffset;
            const bottom = sprite.gy + sprite.height - yAnchorOffset;

            // Find out if the pointer is intersecting the rectangle.
            // `hit` will become `true` if the pointer is inside the
            // sprite's area
            hit = this.x > left && this.x < right && this.y > top && this.y < bottom;
        } else { // Is the sprite circular?

            // Find the distance between the pointer and the
            // center of the circle
            const vx = this.x - (sprite.gx + (sprite.width / 2) - xAnchorOffset);
            const vy = this.y - (sprite.gy + (sprite.width / 2) - yAnchorOffset);
            const distance = Math.sqrt(vx * vx + vy * vy);

            // The pointer is intersecting the circle if the
            // distance is less than the circle's radius
            hit = distance < sprite.width / 2;
        }
        // Check the value of `hit`
        return hit;
    }

    // Many of Tink's objects, like pointers, use collision
    // detection using the sprites' global x and y positions. To make
    // this easier, new `gx` and `gy` properties are added to sprites
    // that reference Pixi sprites' `getGlobalPosition()` values.
    private addGlobalPositionProperties(sprite: DraggableSprite) {
        if (sprite.gx === undefined) {
            Object.defineProperty(
                sprite,
                'gx', {
                    get() {
                        return sprite.getGlobalPosition().x;
                    }
                }
            );
        }

        if (sprite.gy === undefined) {
            Object.defineProperty(
                sprite,
                'gy', {
                    get() {
                        return sprite.getGlobalPosition().y;
                    }
                }
            );
        }
    }
}
